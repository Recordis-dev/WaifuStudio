"""Store sqlite3 de generaciones (M8-21). Solo stdlib, conexion por operacion."""

from __future__ import annotations

import json
import shutil
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import uuid

from app.engine import EngineError

_SCHEMA = """
CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    model_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    negative TEXT DEFAULT '',
    params TEXT DEFAULT '{}',
    status TEXT NOT NULL,
    outputs TEXT DEFAULT '[]',
    error TEXT,
    kind TEXT NOT NULL DEFAULT 'image'
)
"""

_TIMELINE_SCHEMA = """
CREATE TABLE IF NOT EXISTS timeline_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
"""

_COLUMNS = (
    "id, created_at, model_id, prompt, negative, params, status, outputs, error, kind"
)


class Store:
    """Persistencia local de generaciones; `init()` antes de usar."""

    def __init__(self, db_path: str | Path) -> None:
        self.db_path = Path(db_path)

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path, timeout=30.0)

    def init(self) -> None:
        """Crea el directorio padre y la tabla si faltan; migra `kind` (F4)."""
        try:
            self.db_path.parent.mkdir(parents=True, exist_ok=True)
            with closing(self._connect()) as conn, conn:
                conn.execute("PRAGMA journal_mode=WAL")
                conn.execute("PRAGMA synchronous=NORMAL")
                conn.execute(_SCHEMA)
                conn.execute(_TIMELINE_SCHEMA)
                columns = {
                    row[1] for row in conn.execute("PRAGMA table_info(generations)")
                }
                if "kind" not in columns:
                    conn.execute(
                        "ALTER TABLE generations "
                        "ADD COLUMN kind TEXT NOT NULL DEFAULT 'image'"
                    )
        except (sqlite3.Error, OSError) as exc:
            raise EngineError(f"store init fallo en {self.db_path}: {exc}") from exc

    def add(
        self,
        model_id: str,
        prompt: str,
        negative: str = "",
        params: Any = None,
        status: str = "queued",
        kind: str = "image",
    ) -> int:
        """Inserta una generacion y devuelve su id."""
        created_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        try:
            params_json = json.dumps(params if params is not None else {})
            with closing(self._connect()) as conn, conn:
                cursor = conn.execute(
                    "INSERT INTO generations "
                    "(created_at, model_id, prompt, negative, params, status, kind) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (
                        created_at,
                        str(model_id),
                        str(prompt),
                        str(negative),
                        params_json,
                        str(status),
                        str(kind),
                    ),
                )
                return int(cursor.lastrowid)
        except (sqlite3.Error, TypeError, ValueError) as exc:
            raise EngineError(f"store add fallo: {exc}") from exc

    def get(self, gen_id: int) -> dict | None:
        """Fila completa con params/outputs deserializados, o None si no existe."""
        try:
            with closing(self._connect()) as conn, conn:
                row = conn.execute(
                    f"SELECT {_COLUMNS} FROM generations WHERE id = ?", (gen_id,)
                ).fetchone()
        except sqlite3.Error as exc:
            raise EngineError(f"store get {gen_id} fallo: {exc}") from exc
        return self._row_to_dict(row) if row is not None else None

    def list(
        self,
        limit: int = 50,
        offset: int = 0,
        order: str = "desc",
        kind: str | None = None,
        q: str | None = None,
    ) -> list[dict]:
        """Generaciones paginadas por id; `order` es `asc` o `desc`.

        `kind` opcional filtra por tipo (`image`/`video`); `None` no filtra.
        `q` opcional filtra por substring en `prompt` o `negative`.
        """
        direction = str(order).strip().lower()
        if direction not in ("asc", "desc"):
            raise EngineError(
                f"store list: orden invalido {order!r} (usa asc|desc)"
            )
        clauses: list[str] = []
        filters: list[Any] = []
        if kind is not None:
            clauses.append("kind = ?")
            filters.append(str(kind))
        if q is not None and str(q).strip():
            needle = f"%{str(q).strip()}%"
            clauses.append("(prompt LIKE ? OR negative LIKE ?)")
            filters.extend([needle, needle])
        where = f"WHERE {' AND '.join(clauses)} " if clauses else ""
        try:
            with closing(self._connect()) as conn, conn:
                rows = conn.execute(
                    f"SELECT {_COLUMNS} FROM generations {where}"
                    f"ORDER BY id {direction.upper()} LIMIT ? OFFSET ?",
                    (*filters, int(limit), int(offset)),
                ).fetchall()
        except sqlite3.Error as exc:
            raise EngineError(f"store list fallo: {exc}") from exc
        return [self._row_to_dict(row) for row in rows]

    def count(self, kind: str | None = None, q: str | None = None) -> int:
        """Numero total de generaciones, opcionalmente filtrado por `kind` y `q`."""
        clauses: list[str] = []
        filters: list[Any] = []
        if kind is not None:
            clauses.append("kind = ?")
            filters.append(str(kind))
        if q is not None and str(q).strip():
            needle = f"%{str(q).strip()}%"
            clauses.append("(prompt LIKE ? OR negative LIKE ?)")
            filters.extend([needle, needle])
        where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
        try:
            with closing(self._connect()) as conn, conn:
                row = conn.execute(
                    f"SELECT COUNT(*) FROM generations{where}", tuple(filters)
                ).fetchone()
        except sqlite3.Error as exc:
            raise EngineError(f"store count fallo: {exc}") from exc
        return int(row[0])

    def delete(self, gen_id: int | str) -> bool:
        """Elimina una generacion por id; False si no existe."""
        try:
            with closing(self._connect()) as conn, conn:
                cursor = conn.execute(
                    "DELETE FROM generations WHERE id = ?", (int(gen_id),)
                )
                return cursor.rowcount > 0
        except (sqlite3.Error, TypeError, ValueError) as exc:
            raise EngineError(f"store delete {gen_id} fallo: {exc}") from exc

    def delete_failed(self) -> int:
        """Elimina todas las generaciones con status in ('error', 'failed'). Devuelve conteo."""
        try:
            with closing(self._connect()) as conn, conn:
                failed_rows = conn.execute(
                    "SELECT id FROM generations WHERE status IN ('error', 'failed')"
                ).fetchall()
                for (row_id,) in failed_rows:
                    target_dir = self.db_path.parent / "gallery" / str(row_id)
                    if target_dir.exists():
                        shutil.rmtree(target_dir, ignore_errors=True)
                cursor = conn.execute(
                    "DELETE FROM generations WHERE status IN ('error', 'failed')"
                )
                return int(cursor.rowcount)
        except (sqlite3.Error, OSError) as exc:
            raise EngineError(f"store delete_failed fallo: {exc}") from exc

    def fail_stale(self, message: str = "interrumpido por un reinicio de la app") -> int:
        """Marca como `error` las filas `queued`/`running` huerfanas de un reinicio.

        El worker vive en memoria: al reiniciar la app no puede retomar lo que
        quedo en curso y esas filas quedarian en `queued` para siempre. Cierra
        solo esas dos estados; `done`/`error`/`cancelled` no se tocan. Devuelve
        el numero de filas afectadas.
        """
        try:
            with closing(self._connect()) as conn, conn:
                cursor = conn.execute(
                    "UPDATE generations SET status = 'error', error = ? "
                    "WHERE status IN ('queued', 'running')",
                    (str(message),),
                )
                return int(cursor.rowcount)
        except sqlite3.Error as exc:
            raise EngineError(f"store fail_stale fallo: {exc}") from exc

    def update(
        self,
        gen_id: int,
        *,
        status: str | None = None,
        outputs: Any = None,
        error: str | None = None,
        kind: str | None = None,
    ) -> bool:
        """Actualiza solo los campos dados; False si el id no existe."""
        assignments: list[str] = []
        values: list[Any] = []
        if status is not None:
            assignments.append("status = ?")
            values.append(str(status))
        if outputs is not None:
            assignments.append("outputs = ?")
            values.append(json.dumps(outputs))
        if error is not None:
            assignments.append("error = ?")
            values.append(str(error))
        if kind is not None:
            assignments.append("kind = ?")
            values.append(str(kind))
        try:
            with closing(self._connect()) as conn, conn:
                if assignments:
                    cursor = conn.execute(
                        f"UPDATE generations SET {', '.join(assignments)} WHERE id = ?",
                        (*values, gen_id),
                    )
                    return cursor.rowcount > 0
                row = conn.execute(
                    "SELECT 1 FROM generations WHERE id = ?", (gen_id,)
                ).fetchone()
                return row is not None
        except (sqlite3.Error, TypeError, ValueError) as exc:
            raise EngineError(f"store update {gen_id} fallo: {exc}") from exc

    @staticmethod
    def _row_to_dict(row: tuple) -> dict:
        try:
            return {
                "id": row[0],
                "created_at": row[1],
                "model_id": row[2],
                "prompt": row[3],
                "negative": row[4],
                "params": json.loads(row[5]),
                "status": row[6],
                "outputs": json.loads(row[7]),
                "error": row[8],
                "kind": row[9] if len(row) > 9 else "image",
            }
        except (TypeError, ValueError) as exc:
            raise EngineError(f"store: JSON malformado en la fila {row[0]}: {exc}") from exc

    def save_timeline_project(
        self, project_id: str | None, name: str, data: dict
    ) -> dict:
        """Guarda o actualiza un proyecto de timeline."""
        now = datetime.now(timezone.utc).isoformat(timespec="seconds")
        try:
            data_json = json.dumps(data if isinstance(data, dict) else {})
            with closing(self._connect()) as conn, conn:
                pid = str(project_id).strip() if project_id else ""
                if pid:
                    row = conn.execute(
                        "SELECT created_at FROM timeline_projects WHERE id = ?", (pid,)
                    ).fetchone()
                    if row is not None:
                        created_at = row[0]
                        conn.execute(
                            "UPDATE timeline_projects SET name = ?, data_json = ?, updated_at = ? WHERE id = ?",
                            (str(name), data_json, now, pid),
                        )
                        return {
                            "id": pid,
                            "name": str(name),
                            "data": data,
                            "created_at": created_at,
                            "updated_at": now,
                        }
                if not pid:
                    pid = f"tl_{uuid.uuid4().hex[:8]}"
                conn.execute(
                    "INSERT INTO timeline_projects (id, name, data_json, created_at, updated_at) "
                    "VALUES (?, ?, ?, ?, ?)",
                    (pid, str(name), data_json, now, now),
                )
                return {
                    "id": pid,
                    "name": str(name),
                    "data": data,
                    "created_at": now,
                    "updated_at": now,
                }
        except (sqlite3.Error, TypeError, ValueError) as exc:
            raise EngineError(f"store save_timeline_project fallo: {exc}") from exc

    def get_timeline_project(self, project_id: str) -> dict | None:
        """Devuelve el proyecto con data parseado o None."""
        try:
            with closing(self._connect()) as conn, conn:
                row = conn.execute(
                    "SELECT id, name, data_json, created_at, updated_at FROM timeline_projects WHERE id = ?",
                    (str(project_id),),
                ).fetchone()
                if row is None:
                    return None
                return {
                    "id": row[0],
                    "name": row[1],
                    "data": json.loads(row[2]),
                    "created_at": row[3],
                    "updated_at": row[4],
                }
        except (sqlite3.Error, TypeError, ValueError) as exc:
            raise EngineError(f"store get_timeline_project {project_id} fallo: {exc}") from exc

    def list_timeline_projects(self, limit: int = 50) -> list[dict]:
        """Lista proyectos de timeline ordenados por updated_at DESC."""
        try:
            with closing(self._connect()) as conn, conn:
                rows = conn.execute(
                    "SELECT id, name, data_json, created_at, updated_at FROM timeline_projects "
                    "ORDER BY updated_at DESC LIMIT ?",
                    (max(1, int(limit)),),
                ).fetchall()
                result = []
                for row in rows:
                    result.append(
                        {
                            "id": row[0],
                            "name": row[1],
                            "data": json.loads(row[2]),
                            "created_at": row[3],
                            "updated_at": row[4],
                        }
                    )
                return result
        except (sqlite3.Error, TypeError, ValueError) as exc:
            raise EngineError(f"store list_timeline_projects fallo: {exc}") from exc

    def delete_timeline_project(self, project_id: str) -> bool:
        """Elimina un proyecto de timeline y devuelve True si existía."""
        try:
            with closing(self._connect()) as conn, conn:
                cursor = conn.execute(
                    "DELETE FROM timeline_projects WHERE id = ?", (str(project_id),)
                )
                return cursor.rowcount > 0
        except sqlite3.Error as exc:
            raise EngineError(f"store delete_timeline_project {project_id} fallo: {exc}") from exc


__all__ = ["Store"]
