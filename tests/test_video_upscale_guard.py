"""Tests de guarda de dimensiones y VRAM para escalado de video (BUG-UPSCALER-01).

Verifica que el escalado de video valide la resolucion de entrada, resolucion
de salida (<= 2160p / 3840 px) y presupuesto de fotogramas (<= 500 frames)
para proteger la VRAM de 12 GB, tanto en el helper como en la ruta HTTP y runner.
"""

from __future__ import annotations

import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import MagicMock, patch

from app.engine import EngineError
from app.upscale import (
    MAX_VIDEO_UPSCALE_FRAMES,
    MAX_VIDEO_UPSCALE_INPUT_SIDE,
    MAX_VIDEO_UPSCALE_OUTPUT_SIDE,
    probe_video_metadata,
    run_video_upscale,
    validate_video_upscale_dimensions,
)


class TestVideoUpscaleGuard(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.test_dir = Path(self.tmp_dir.name)
        self.dummy_video = self.test_dir / "dummy.mp4"
        self.dummy_video.write_bytes(b"fake mp4 header")

    def tearDown(self):
        self.tmp_dir.cleanup()

    @patch("app.upscale.probe_video_metadata")
    def test_hd_video_scale_2_passes(self, mock_probe):
        """Video 720p con escala 2x debe pasar la validacion."""
        mock_probe.return_value = {
            "width": 1280,
            "height": 720,
            "frames": 120,
            "duration": 5.0,
            "fps": 24.0,
        }
        meta = validate_video_upscale_dimensions(self.dummy_video, scale=2)
        self.assertEqual(meta["width"], 1280)
        self.assertEqual(meta["height"], 720)

    @patch("app.upscale.probe_video_metadata")
    def test_1080p_video_scale_2_passes(self, mock_probe):
        """Video 1080p con escala 2x (salida 3840x2160) debe pasar en el limite de 2160p."""
        mock_probe.return_value = {
            "width": 1920,
            "height": 1080,
            "frames": 240,
            "duration": 10.0,
            "fps": 24.0,
        }
        meta = validate_video_upscale_dimensions(self.dummy_video, scale=2)
        self.assertEqual(meta["width"], 1920)

    @patch("app.upscale.probe_video_metadata")
    def test_1080p_video_scale_4_rejected(self, mock_probe):
        """Video 1080p con escala 4x (salida 7680x4320 / 8K) debe ser rechazado."""
        mock_probe.return_value = {
            "width": 1920,
            "height": 1080,
            "frames": 240,
            "duration": 10.0,
            "fps": 24.0,
        }
        with self.assertRaises(EngineError) as ctx:
            validate_video_upscale_dimensions(self.dummy_video, scale=4)
        self.assertIn("supera el limite de salida permitido", str(ctx.exception))
        self.assertIn(str(MAX_VIDEO_UPSCALE_OUTPUT_SIDE), str(ctx.exception))

    @patch("app.upscale.probe_video_metadata")
    def test_2k_input_video_rejected(self, mock_probe):
        """Video 2K / 1440p (2560x1440) de entrada debe ser rechazado antes de escalar."""
        mock_probe.return_value = {
            "width": 2560,
            "height": 1440,
            "frames": 120,
            "duration": 5.0,
            "fps": 24.0,
        }
        with self.assertRaises(EngineError) as ctx:
            validate_video_upscale_dimensions(self.dummy_video, scale=2)
        self.assertIn("demasiado grande para escalar", str(ctx.exception))
        self.assertIn(str(MAX_VIDEO_UPSCALE_INPUT_SIDE), str(ctx.exception))

    @patch("app.upscale.probe_video_metadata")
    def test_excessive_frames_rejected(self, mock_probe):
        """Video con mas de 500 fotogramas debe ser rechazado para evitar OOM de batch."""
        mock_probe.return_value = {
            "width": 1280,
            "height": 720,
            "frames": 650,
            "duration": 27.0,
            "fps": 24.0,
        }
        with self.assertRaises(EngineError) as ctx:
            validate_video_upscale_dimensions(self.dummy_video, scale=2)
        self.assertIn("demasiados fotogramas", str(ctx.exception))
        self.assertIn(str(MAX_VIDEO_UPSCALE_FRAMES), str(ctx.exception))

    @patch("app.upscale.subprocess.run")
    def test_probe_video_metadata_with_ffprobe(self, mock_run):
        """probe_video_metadata debe parsear la salida JSON de ffprobe."""
        ffprobe_json = {
            "streams": [
                {
                    "width": 1280,
                    "height": 720,
                    "nb_frames": "150",
                    "duration": "6.25",
                    "r_frame_rate": "24/1",
                }
            ]
        }
        mock_proc = MagicMock()
        mock_proc.returncode = 0
        mock_proc.stdout = json.dumps(ffprobe_json)
        mock_run.return_value = mock_proc

        meta = probe_video_metadata(self.dummy_video, ffprobe_bin="mock_ffprobe")
        self.assertEqual(meta["width"], 1280)
        self.assertEqual(meta["height"], 720)
        self.assertEqual(meta["frames"], 150)
        self.assertEqual(meta["fps"], 24.0)

    @patch("app.upscale.validate_video_upscale_dimensions")
    def test_run_video_upscale_invokes_guard(self, mock_guard):
        """run_video_upscale debe invocar la guarda si el archivo de video existe."""
        mock_guard.side_effect = EngineError("guardia activada: video sobredimensionado")

        comfy_input = self.test_dir / "input"
        comfy_input.mkdir(parents=True, exist_ok=True)
        video_file = comfy_input / "input_vid.mp4"
        video_file.write_bytes(b"content")

        mock_config = MagicMock()
        mock_config.comfy_input_dir = comfy_input
        mock_config.comfy_root = self.test_dir

        job = {
            "gen_id": 999,
            "video_name": "input_vid.mp4",
            "model": "esrgan_2x",
            "scale": 2,
            "model_file": "RealESRGAN_x2.pth",
        }

        record = {"status": "queued"}
        run_video_upscale(job, config=mock_config, store=MagicMock(), record=record)
        self.assertIn("guardia activada", job.get("error", ""))
        self.assertEqual(record.get("status"), "error")
        mock_guard.assert_called_once()


if __name__ == "__main__":
    unittest.main()
