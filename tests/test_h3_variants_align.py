"""Tests de alineación de variantes H3 frontend/backend (BUG-VIDEO-01).

Verifica que el catálogo H3 exponga variantes compatibles y variante por defecto,
que el perfil 'estandar' arranque con 'vdn8' válido y que 'ultra' use turbo4/turbo8,
evitando el rechazo 400 por variantes incompatibles.
"""

from __future__ import annotations

import re
from pathlib import Path
import unittest

from app.engine import EngineError
from app.h3_presets import (
    PROFILE_COMPATIBLE_VARIANTS,
    h3_catalog,
    validate_h3_profile_variant,
)


class TestH3VariantsAlign(unittest.TestCase):
    def test_catalog_exposes_compatible_and_default_variants(self):
        """h3_catalog debe incluir compatible_variants y default_variant para cada perfil."""
        catalog = h3_catalog()
        profiles = catalog.get("profiles", [])
        self.assertGreater(len(profiles), 0)

        for profile in profiles:
            pid = profile["id"]
            self.assertIn("compatible_variants", profile, f"Perfil {pid} no tiene compatible_variants")
            self.assertIn("default_variant", profile, f"Perfil {pid} no tiene default_variant")

            compat = profile["compatible_variants"]
            def_v = profile["default_variant"]
            self.assertIn(def_v, compat, f"Default variant '{def_v}' de {pid} no esta en compatibles {compat}")

            # Verificar que la validación estricta pase sin lanzar EngineError
            try:
                validate_h3_profile_variant(pid, def_v)
            except EngineError as exc:
                self.fail(f"validate_h3_profile_variant fallo para perfil {pid} con default {def_v}: {exc}")

    def test_estandar_profile_uses_vdn8(self):
        """Perfil 'estandar' debe exigir vdn8 y rechazar turbo8/turbo4."""
        catalog = h3_catalog()
        estandar = next(p for p in catalog["profiles"] if p["id"] == "estandar")

        self.assertEqual(estandar["default_variant"], "vdn8")
        self.assertEqual(estandar["compatible_variants"], ["vdn8"])

        # vdn8 debe pasar
        validate_h3_profile_variant("estandar", "vdn8")

        # turbo8 debe ser rechazado
        with self.assertRaises(EngineError):
            validate_h3_profile_variant("estandar", "turbo8")

    def test_ultra_profile_uses_turbo(self):
        """Perfil 'ultra' debe aceptar turbo4/turbo8 y rechazar vdn8."""
        catalog = h3_catalog()
        ultra = next(p for p in catalog["profiles"] if p["id"] == "ultra")

        self.assertEqual(ultra["default_variant"], "turbo8")
        self.assertEqual(ultra["compatible_variants"], ["turbo4", "turbo8"])

        validate_h3_profile_variant("ultra", "turbo8")
        validate_h3_profile_variant("ultra", "turbo4")

        with self.assertRaises(EngineError):
            validate_h3_profile_variant("ultra", "vdn8")

    def test_js_compatible_variants_matches_backend(self):
        """El mapa JS en static/js/tabs/video_h3.js debe coincidir exactamente con el backend."""
        js_path = Path("static/js/tabs/video_h3.js")
        self.assertTrue(js_path.is_file())

        content = js_path.read_text(encoding="utf-8")
        # Extraer el bloque PROFILE_COMPATIBLE_VARIANTS = { ... };
        match = re.search(r"const\s+PROFILE_COMPATIBLE_VARIANTS\s*=\s*\{([^}]+)\};", content)
        self.assertIsNotNone(match, "No se encontro PROFILE_COMPATIBLE_VARIANTS en video_h3.js")

        block = match.group(1)
        js_map = {}
        for line in block.splitlines():
            line = line.strip().rstrip(",")
            if not line or ":" not in line:
                continue
            key, val = line.split(":", 1)
            key = key.strip()
            # Parse ['turbo4', 'turbo8'] etc.
            vals = re.findall(r"['\"]([^'\"]+)['\"]", val)
            js_map[key] = set(vals)

        for profile_id, backend_set in PROFILE_COMPATIBLE_VARIANTS.items():
            self.assertIn(profile_id, js_map, f"Falta {profile_id} en mapa JS")
            self.assertEqual(
                js_map[profile_id],
                backend_set,
                f"Discrepancia en perfil {profile_id}: JS={js_map[profile_id]} vs Backend={backend_set}",
            )


if __name__ == "__main__":
    unittest.main()
