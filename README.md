# WaifuStudio v2.0 — Local Anime Production Studio

<p align="center">
  <img src="static/waifustudio-icon.png" width="112" alt="WaifuStudio icon">
</p>

[![Version](https://img.shields.io/badge/version-2.0.0-ff4081.svg)](https://github.com/gusnion/WaifuStudio)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Reference GPU](https://img.shields.io/badge/Reference%20GPU-RTX%203060%2012GB-76b900.svg)](https://www.nvidia.com)
[![Engine](https://img.shields.io/badge/Engine-ComfyUI%20Backend-orange.svg)](https://github.com/comfyanonymous/ComfyUI)
[![Local by default](https://img.shields.io/badge/Local-by%20default-success.svg)]()
[![Patreon](https://img.shields.io/badge/Patreon-gusnion-ff424d.svg)](https://www.patreon.com/gusnion)

> English | [Español](README.es.md)

WaifuStudio is a local-first production workspace for anime images and short video. It brings image generation, character references, video generation, editing, upscaling, timeline assembly and gallery management into one web interface, with ComfyUI as the inference engine.

The application is designed around a single NVIDIA GPU and a Windows desktop. It does not require an account, a cloud service or telemetry. The installer keeps Python, ComfyUI and FFmpeg in a portable directory.

> [!WARNING]
> **Status and scope**: this is an independent project provided "as is", without warranties. It is developed and tested around the reference configuration below. Other GPUs, operating systems and workflows may work, but are not officially validated. Expect rough edges, and keep backups of your projects and generated media.

## What is included

| Module | Status | What it does |
|---|---|---|
| **Windows installer** | Available | Sets up a portable Python environment, ComfyUI, custom nodes, models, FFmpeg/FFprobe and the app shortcut. |
| **Image and OC Maker** | Available | Anima 2.9B and SDXL/Illustrious support, prompt zones, LoRA selection, character profiles, reference images and optional LoRA training. |
| **Prompt assistant** | Available | Local Danbooru tag index plus an optional CPU LLM for prompt expansion and image captioning. |
| **H3 video** | Available | Eight-step VideoDeltaNet generation in I2V, FLF2V, Ref2VA and V2V modes, with native audio and short prompt templates. |
| **Editor** | Available | Instruction-based editing with Qwen-Image 2.1, up to ten reference images and L0–L3 pose presets. Mask-based inpainting is not part of this version. |
| **Timeline** | Available | Arrange clips and still images, set duration, apply fade/zoom, mute clips, add external audio, continue a clip with I2V/FLF2V and export MP4. It is a focused sequencer, not a full NLE. |
| **Upscaler** | Available | Image upscaling with GAN, Hires Fix and Qwen Remaster modes, plus RCAS/Adaptive USM sharpening and RIFE interpolation. Video upscaling is limited to 300 frames per job. |
| **Gallery and queue** | Available | SQLite-backed gallery, job history and a single-GPU FIFO queue shared by all tabs. |

## Quick start (Windows)

1. Clone or download the repository.
2. Run `install.bat`. It creates the isolated environment and downloads the configured models.
3. Run `start.bat`. It starts ComfyUI, the FastAPI app and opens `http://127.0.0.1:8765`.

Useful commands:

```text
start.bat        start the app and engine
stop.bat         stop the app and engine
healthcheck.bat  check paths and services
start_engine.bat start only ComfyUI
stop_engine.bat  stop only ComfyUI
```

FFmpeg is installed by default. `-SkipFfmpeg` is available for minimal installs, but Timeline export and concatenation will not work. `install.bat` also creates `WAIFUSTUDIO.lnk` with the application icon; if the folder is moved, run `scripts\create_shortcut.ps1` or re-run the installer.

The current icon is provisional. The source is `waifystudioicon.ico`; the app serves `static/favicon.ico` and the README uses `static/waifustudio-icon.png`.

## Reference configuration

These are the hardware and software used for development and validation. They are not minimum requirements.

| Component | Reference |
|---|---|
| GPU | NVIDIA GeForce RTX 3060, 12 GB |
| CPU | AMD Ryzen 7 5700X, 8 cores |
| RAM | 32 GB DDR4 |
| OS | Windows 10 64-bit |
| Engine | ComfyUI v0.37.4 |
| Python | CPython 3.12.12, isolated |
| Inference | PyTorch 2.11.0 + CUDA 13.0 |

The workflows are tuned for a 12 GB budget and one job at a time. The optional Qwen3.5-9B assistant runs on CPU so it does not take VRAM from ComfyUI.

Windows is the supported installation path. The core is standard FastAPI, ComfyUI and vanilla JavaScript; a Linux server/LAN mode is planned but not available yet.

## Current limits

- Single GPU, FIFO queue. Long jobs block the other tabs until they finish.
- H3 produces short segments: 15 seconds per generation, with chained output where supported.
- The native video upscaler processes one batch and rejects videos over 300 frames. Long videos need an external tool.
- The Timeline is intentionally small: no playhead, trim handles, drag-and-drop or waveform editing yet.
- No lip-sync and no automatic voice-over in this version.
- No cloud inference, remote GPU rental or model marketplace is integrated yet.
- The in-app Guide is being revised; treat the README and the actual UI as the source of truth for available features.

## Roadmap

The following items are planned or under evaluation. They are not promises, not dates, and not available unless explicitly stated.

### Near term

- **Model presets by VRAM** and a verified model manager, so installations do not assume a 12 GB card.
- **Linux Studio mode**: a headless server for the local network, separate from the single-user Windows app.
- **Remote ComfyUI/GPU support** with persistent model volumes, so long jobs do not depend on the local GPU.
- **Local agent tooling**: a CLI, a skill and a DSH mode that can drive the app through its API.
- **Timeline scene queue** and a script-to-scenes director with resumable jobs.

### Under evaluation

- **Chatterbox narration** for Spanish voice-over, with optional lip-sync as a separate step.
- **Video2X integration** for long video upscaling, kept as an external tool rather than folded into ComfyUI.
- **Wan 2.2 workflow profiles**, including the community workflow bank credited to Artelive.
- **Civitai model browser/downloader**, subject to API limits, licensing and age-gated content rules.
- **LTX 2.5**: evaluated, but not practical on a 12 GB GPU in its current form.
- **Timeline NLE improvements**: playhead, trimming, drag-and-drop and waveforms.

## Development

Version 2.0 is a stabilization and documentation pass over the original application. The remediation, test work and agent-oriented groundwork were continued with **DeepSeek V4.1 Flash 1017** using **DSH**.

The offline suite currently runs 1,613 tests. The README describes the app as it is; features that are only planned are listed under Roadmap.

## Support

Development is independent and the application remains MIT-licensed. If you want to support the time spent on testing, documentation and maintenance, there is a Patreon page:

https://www.patreon.com/gusnion

Support is optional and does not unlock or restrict any part of the application.

## License and credits

- Released under the **MIT License**. No warranties are provided.
- Built on top of ComfyUI, MiniMax H3 VDN, Anima, Qwen and FFmpeg.
- **Wan 2.2 workflow research and the 8 GB workflow bank**: Artelive (community contribution; integration pending).
