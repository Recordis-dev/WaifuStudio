"""Módulo de edición y renderizado de timeline para Estudio (M20 T-03a).

Qué hace: normaliza clips de vídeo e imágenes fijas con FFmpeg, extrae fotogramas
clave (primer/último frame para I2V/FLF2V), concatena secuencias y mezcla pistas de audio.
Qué no hace: no gestiona la base de datos de proyectos ni rutas HTTP.
Dependencias: app.video (find_ffmpeg, extract_last_frame, concat_videos), app.engine.
"""

from __future__ import annotations

import shutil
import subprocess
import urllib.parse
from pathlib import Path
from typing import Any

from app.engine import EngineError
from app.video import concat_videos, extract_last_frame, find_ffmpeg


def _resolve_exe(ffmpeg_bin: str | Path | None = None) -> str:
    exe = str(ffmpeg_bin) if ffmpeg_bin else find_ffmpeg()
    if not exe:
        raise EngineError("ffmpeg no encontrado: el timeline requiere ffmpeg en PATH o tools/ffmpeg/")
    return exe


def has_audio_stream(video_path: str | Path, ffmpeg_bin: str | Path | None = None) -> bool:
    """Detecta si un archivo multimedia contiene al menos una pista de audio."""
    exe = _resolve_exe(ffmpeg_bin)
    try:
        proc = subprocess.run([exe, "-i", str(video_path)], capture_output=True, text=True, timeout=15)
        return "Audio:" in (proc.stderr or "")
    except Exception:
        return False


def extract_clip_frame(
    video_path: str | Path,
    output_png: str | Path,
    position: str = "last",
    ffmpeg_bin: str | Path | None = None,
) -> Path:
    """Extrae el primer o el último fotograma de un vídeo MP4."""
    video_path, output_png = Path(video_path), Path(output_png)
    if not video_path.is_file():
        raise EngineError(f"timeline: video origen no encontrado: {video_path}")
    output_png.parent.mkdir(parents=True, exist_ok=True)
    pos = str(position).strip().lower()
    if pos == "last":
        return extract_last_frame(video_path, output_png, ffmpeg_exe=ffmpeg_bin)
    if pos == "first":
        exe = _resolve_exe(ffmpeg_bin)
        cmd = [exe, "-y", "-ss", "0", "-i", str(video_path), "-frames:v", "1", "-update", "1", str(output_png)]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        except Exception as exc:
            raise EngineError(f"error de ffmpeg al extraer primer frame: {exc}") from exc
        if proc.returncode != 0 or not output_png.is_file() or output_png.stat().st_size == 0:
            stderr = proc.stderr if hasattr(proc, "stderr") else ""
            raise EngineError(f"error de ffmpeg al extraer primer frame: {stderr}")
        return output_png
    raise EngineError(f"posicion invalida: {position!r}; usar first|last")


def image_to_video_clip(
    image_path: str | Path,
    output_mp4: str | Path,
    duration: float = 3.0,
    width: int = 1280,
    height: int = 720,
    fps: int = 24,
    effect: str = "none",
    transition_in: str = "none",
    transition_out: str = "none",
    fade_in: bool | None = None,
    fade_out: bool | None = None,
    ffmpeg_bin: str | Path | None = None,
) -> Path:
    """Convierte una imagen estática en un clip MP4 con audio silencioso compatible y soporte de fundidos."""
    image_path, output_mp4 = Path(image_path), Path(output_mp4)
    if not image_path.is_file():
        raise EngineError(f"timeline: imagen origen no encontrada: {image_path}")
    output_mp4.parent.mkdir(parents=True, exist_ok=True)
    exe = _resolve_exe(ffmpeg_bin)
    dur = max(0.1, float(duration))
    frames = max(1, int(dur * fps))
    eff = str(effect).strip().lower()

    filters: list[str] = []
    if eff == "zoom_in":
        filters.append(f"zoompan=z='min(zoom+0.0015,1.2)':d={frames}:s={width}x{height}:fps={fps}")
        filters.append("setsar=1")
    elif eff == "zoom_out":
        filters.append(f"zoompan=z='max(1.2-0.0015*on,1.0)':d={frames}:s={width}x{height}:fps={fps}")
        filters.append("setsar=1")
    else:
        filters.append(f"scale={width}:{height}:force_original_aspect_ratio=decrease")
        filters.append(f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=black")
        filters.append("setsar=1")

    use_fade_in = fade_in is True or str(transition_in).strip().lower() == "fade"
    use_fade_out = fade_out is True or str(transition_out).strip().lower() == "fade"
    if use_fade_in:
        filters.append("fade=t=in:st=0:d=0.5")
    if use_fade_out:
        filters.append(f"fade=t=out:st={max(0.0, dur - 0.5):.2f}:d=0.5")

    vf = ",".join(filters)

    cmd = [
        exe, "-y", "-loop", "1", "-t", f"{dur:.3f}", "-i", str(image_path),
        "-f", "lavfi", "-t", f"{dur:.3f}", "-i", "anullsrc=r=44100:cl=stereo",
        "-map", "0:v:0", "-map", "1:a:0",
        "-vf", vf, "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
        "-r", str(fps), "-c:a", "aac", "-b:a", "128k", "-t", f"{dur:.3f}", "-shortest", str(output_mp4),
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    except Exception as exc:
        raise EngineError(f"error de ffmpeg en image_to_video_clip: {exc}") from exc
    if proc.returncode != 0 or not output_mp4.is_file() or output_mp4.stat().st_size == 0:
        stderr = proc.stderr if hasattr(proc, "stderr") else ""
        raise EngineError(f"error de ffmpeg en image_to_video_clip: {stderr}")
    return output_mp4


def normalize_video_clip(
    video_path: str | Path,
    output_mp4: str | Path,
    width: int = 1280,
    height: int = 720,
    fps: int = 24,
    mute: bool = False,
    trim_in: float = 0.0,
    duration: float | None = None,
    transition_in: str = "none",
    transition_out: str = "none",
    ffmpeg_bin: str | Path | None = None,
) -> Path:
    """Normaliza un clip de vídeo a una resolución, fps y pista de audio estándar."""
    video_path, output_mp4 = Path(video_path), Path(output_mp4)
    if not video_path.is_file():
        raise EngineError(f"timeline: video origen no encontrado: {video_path}")
    output_mp4.parent.mkdir(parents=True, exist_ok=True)
    exe = _resolve_exe(ffmpeg_bin)
    t_in = max(0.0, float(trim_in))
    has_audio = False if mute else has_audio_stream(video_path, ffmpeg_bin=exe)

    filters = [
        f"scale={width}:{height}:force_original_aspect_ratio=decrease",
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=black",
        "setsar=1",
    ]
    if str(transition_in).strip().lower() == "fade":
        filters.append("fade=t=in:st=0:d=0.5")
    if str(transition_out).strip().lower() == "fade" and duration is not None:
        filters.append(f"fade=t=out:st={max(0.0, float(duration) - 0.5):.2f}:d=0.5")
    vf = ",".join(filters)

    cmd = [exe, "-y"]
    if t_in > 0:
        cmd.extend(["-ss", f"{t_in:.3f}"])
    cmd.extend(["-i", str(video_path)])
    if not has_audio:
        cmd.extend(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"])
        cmd.extend(["-map", "0:v:0", "-map", "1:a:0"])
    else:
        cmd.extend(["-map", "0:v:0", "-map", "0:a:0"])
    if duration is not None and float(duration) > 0:
        cmd.extend(["-t", f"{float(duration):.3f}"])
    cmd.extend(["-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(fps)])
    if has_audio:
        cmd.extend(["-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2"])
    else:
        cmd.extend(["-c:a", "aac", "-b:a", "192k", "-shortest"])
    cmd.append(str(output_mp4))

    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    except Exception as exc:
        raise EngineError(f"error de ffmpeg en normalize_video_clip: {exc}") from exc
    if proc.returncode != 0 or not output_mp4.is_file() or output_mp4.stat().st_size == 0:
        stderr = proc.stderr if hasattr(proc, "stderr") else ""
        raise EngineError(f"error de ffmpeg en normalize_video_clip: {stderr}")
    return output_mp4


def resolve_gallery_path(source: str, gallery_dir: Path) -> Path | None:
    """Resuelve y confina una URL /media/... o ruta a gallery_dir."""
    if not source:
        return None
    raw = str(source).strip()
    if "://" in raw:
        path_str = urllib.parse.unquote(urllib.parse.urlsplit(raw).path)
    else:
        path_str = urllib.parse.unquote(raw)
    clean = path_str.replace("\\", "/")
    g_dir = gallery_dir.resolve()

    if clean.startswith("/media/") or clean.startswith("media/"):
        rel = clean.lstrip("/")[len("media/"):].lstrip("/")
        cand = (g_dir / rel).resolve()
    else:
        p = Path(path_str)
        if p.is_absolute():
            cand = p.resolve()
        else:
            cand = (g_dir / p).resolve()

    try:
        if cand.is_relative_to(g_dir) and cand != g_dir:
            return cand
    except (ValueError, TypeError):
        pass
    return None


def _resolve_clip_source(clip: dict, gallery_dir: Path) -> tuple[Path, str]:
    gallery_dir = gallery_dir.resolve()
    source_path = clip.get("source_path")
    if source_path:
        cand = resolve_gallery_path(source_path, gallery_dir)
        if cand is not None and cand.is_file():
            kind = clip.get("kind") or ("image" if cand.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp") else "video")
            return cand, kind
        # Si es ruta absoluta dentro del sandbox (e.g. fixtures de tests)
        raw = str(source_path).strip()
        path_str = urllib.parse.unquote(urllib.parse.urlsplit(raw).path if "://" in raw else raw)
        p = Path(path_str)
        if p.is_absolute():
            cand_abs = p.resolve()
            try:
                if (
                    cand_abs.is_relative_to(gallery_dir)
                    and cand_abs != gallery_dir
                    and cand_abs.is_file()
                ):
                    kind = clip.get("kind") or ("image" if cand_abs.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp") else "video")
                    return cand_abs, kind
            except (ValueError, TypeError):
                pass

    gen_id = clip.get("generation_id")
    if gen_id is not None:
        try:
            gdir = (gallery_dir / str(gen_id)).resolve()
            if gdir.is_relative_to(gallery_dir) and gdir.is_dir():
                for cand in sorted(gdir.iterdir()):
                    if cand.is_file():
                        ext = cand.suffix.lower()
                        if ext in (".mp4", ".webm"):
                            return cand, "video"
                        if ext in (".png", ".jpg", ".jpeg", ".webp"):
                            return cand, "image"
        except (ValueError, TypeError):
            pass

    raise EngineError(f"timeline: recurso de clip no encontrado: {clip}")


def export_timeline_project(
    project_data: dict,
    output_mp4: str | Path,
    work_dir: str | Path,
    gallery_dir: str | Path,
    ffmpeg_bin: str | Path | None = None,
) -> Path:
    """Renderiza y exporta un proyecto de timeline a un archivo MP4 completo."""
    clips = project_data.get("clips") or []
    if not clips:
        raise EngineError("timeline: no hay clips para exportar")

    work_dir, gallery_dir, output_mp4 = Path(work_dir), Path(gallery_dir), Path(output_mp4)
    work_dir.mkdir(parents=True, exist_ok=True)
    output_mp4.parent.mkdir(parents=True, exist_ok=True)
    exe = _resolve_exe(ffmpeg_bin)

    width = int(project_data.get("width") or 1280)
    height = int(project_data.get("height") or 720)
    fps = int(project_data.get("fps") or 24)

    segment_paths: list[Path] = []
    for idx, clip in enumerate(clips):
        source_file, kind = _resolve_clip_source(clip, gallery_dir)
        seg_out = work_dir / f"seg_{idx:03d}.mp4"
        duration = float(clip["duration"]) if clip.get("duration") is not None else None
        t_in = clip.get("transition_in") or ("fade" if clip.get("fade_in") else "none")
        t_out = clip.get("transition_out") or ("fade" if clip.get("fade_out") else "none")
        if kind == "image":
            dur = duration if (duration is not None and duration > 0) else 3.0
            image_to_video_clip(
                source_file,
                seg_out,
                duration=dur,
                width=width,
                height=height,
                fps=fps,
                effect=clip.get("effect") or "none",
                transition_in=t_in,
                transition_out=t_out,
                ffmpeg_bin=exe,
            )
        else:
            normalize_video_clip(
                source_file,
                seg_out,
                width=width,
                height=height,
                fps=fps,
                mute=bool(clip.get("mute")),
                trim_in=float(clip.get("trim_in") or 0.0),
                duration=duration,
                transition_in=t_in,
                transition_out=t_out,
                ffmpeg_bin=exe,
            )
        segment_paths.append(seg_out)

    concat_mp4 = work_dir / "timeline_concatenated.mp4"
    concat_videos(segment_paths, concat_mp4, ffmpeg_exe=exe)

    audio_tracks = project_data.get("audio_tracks") or []
    valid_tracks = []
    audio_dir = (gallery_dir.parent / "audio").resolve()
    for t in audio_tracks:
        if t.get("mute"):
            continue
        raw_source = t.get("source_path")
        if not raw_source:
            continue
        raw_str = str(raw_source).strip()
        path_str = urllib.parse.unquote(urllib.parse.urlsplit(raw_str).path if "://" in raw_str else raw_str)
        clean = path_str.replace("\\", "/")

        p: Path | None = None
        if clean.startswith("/media/audio/") or clean.startswith("media/audio/"):
            rel_name = clean.lstrip("/")[len("media/audio/"):].lstrip("/")
            cand = (audio_dir / rel_name).resolve()
            try:
                if cand.is_relative_to(audio_dir) and cand != audio_dir and cand.is_file():
                    p = cand
            except (ValueError, TypeError):
                pass
        else:
            cand_p = Path(path_str)
            if cand_p.is_absolute():
                cand_res = cand_p.resolve()
                try:
                    if (
                        cand_res.is_relative_to(audio_dir)
                        and cand_res != audio_dir
                        and cand_res.is_file()
                    ):
                        p = cand_res
                except (ValueError, TypeError):
                    pass
            else:
                cand_rel = (audio_dir / cand_p).resolve()
                try:
                    if cand_rel.is_relative_to(audio_dir) and cand_rel != audio_dir and cand_rel.is_file():
                        p = cand_rel
                except (ValueError, TypeError):
                    pass
                if p is None:
                    cand_name = (audio_dir / cand_p.name).resolve()
                    try:
                        if cand_name.is_relative_to(audio_dir) and cand_name.is_file():
                            p = cand_name
                    except (ValueError, TypeError):
                        pass

        if p is not None and p.is_file():
            valid_tracks.append((p, float(t.get("start_time") or 0.0), float(t.get("volume") or 1.0)))

    if not valid_tracks:
        shutil.copy2(concat_mp4, output_mp4)
        return output_mp4

    cmd = [exe, "-y", "-i", str(concat_mp4)]
    filter_parts = []
    inputs_count = 1 + len(valid_tracks)
    for i, (track_file, start_sec, vol) in enumerate(valid_tracks, start=1):
        cmd.extend(["-i", str(track_file)])
        delay_ms = max(0, int(start_sec * 1000))
        filter_parts.append(f"[{i}:a]adelay={delay_ms}|{delay_ms},volume={vol:.2f}[a{i}]")

    amix_inputs = "[0:a]" + "".join(f"[a{i}]" for i in range(1, inputs_count))
    filter_parts.append(f"{amix_inputs}amix=inputs={inputs_count}:duration=first:dropout_transition=2[aout]")
    cmd.extend([
        "-filter_complex", ";".join(filter_parts),
        "-map", "0:v", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", str(output_mp4),
    ])

    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    except Exception as exc:
        raise EngineError(f"error de ffmpeg al mezclar pistas de audio: {exc}") from exc
    if proc.returncode != 0 or not output_mp4.is_file() or output_mp4.stat().st_size == 0:
        stderr = proc.stderr if hasattr(proc, "stderr") else ""
        raise EngineError(f"error de ffmpeg al mezclar audio en timeline: {stderr}")
    return output_mp4


__all__ = [
    "extract_clip_frame",
    "image_to_video_clip",
    "normalize_video_clip",
    "export_timeline_project",
    "has_audio_stream",
    "resolve_gallery_path",
]
