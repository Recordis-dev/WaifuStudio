# ✨ WaifuStudio v2.0 — Local Anime & Waifu Studio (Personal Project)

<p align="center">
  <img src="static/waifustudio-icon.png" width="112" alt="WaifuStudio icon">
</p>

[![Version](https://img.shields.io/badge/version-2.0.0-ff4081.svg)](https://github.com/gusnion/WaifuStudio)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tested GPU](https://img.shields.io/badge/Tested%20on-RTX%203060%2012GB-76b900.svg)](https://www.nvidia.com)
[![Engine](https://img.shields.io/badge/Engine-ComfyUI%20Backend-orange.svg)](https://github.com/comfyanonymous/ComfyUI)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-success.svg)]()

> 🌐 **English** | [Español](README.es.md)

---

**WaifuStudio** is a personal hobby project I build in my spare time to unify anime image generation, character sheets, **MinimaxH3 (VideoDeltaNet / VDN)** video generation, **Qwen 2.1** image editing, upscaling, and a basic timeline assembler into a single local web interface powered by **ComfyUI** behind the scenes.

> [!WARNING]
> **Disclaimer — No Warranties & Possible Bugs**:
> This is an independent project developed in my free time and provided **"AS IS"**, without guarantees of any kind. It is actively evolving, so **expect bugs, rough edges, or unexpected behavior** (especially on hardware configurations different from mine). Use it at your own risk.

---

## 🎯 Overview of Features

| Module | What It Does |
|---|---|
| ⚡ **Portable Windows Installer** | `install.bat` sets up an isolated Python/ComfyUI environment on Windows, downloads the configured weights, and installs portable **FFmpeg/FFprobe** in `tools\ffmpeg`. Use `start.bat` to launch, `stop.bat` to stop, and `healthcheck.bat` to diagnose. |
| 🎭 **Character Manager (OC Maker)** | Store character traits, generate Front / Side / Back character sheets, and launch local LoRA training jobs. |
| 🧠 **Prompt Assistant** | 91,357 Danbooru tags indexed in SQLite FTS5 + optional local CPU LLM assistant (`Qwen3.5-9B` GGUF) for tag expansion and vision captioning. |
| 🎞️ **Video H3 (`MinimaxH3 VDN`)** | 8-step video generation using **MinimaxH3 VideoDeltaNet (VDN)** with native audio and camera motion presets (`I2V`, `FLF2V`, `Ref2VA`, `V2V`). |
| 🎬 **Basic Timeline Studio** | Simple web sequencer to stitch generated video clips and static images with an external audio track via bundled FFmpeg, plus shortcuts to continue clips via `I2V` / `FLF2V`. |
| 🔍 **Upscaler & RIFE FPS** | Image and video upscaling (`RealESRGAN`, `AnimeSharp`, `UltraSharp`), optional diffusion pass (`Anima` / `Qwen 2.1`), `RCAS` sharpening, and RIFE frame interpolation. |

---

## 🚀 Quick Start (Windows)

1. **Clone or Download** this repository to your drive (e.g. `E:\IA\WAIFU`).
2. **Run `install.bat`**: Sets up the portable Python environment, ComfyUI backend, custom nodes, portable FFmpeg/FFprobe, and the required models.
3. **Run `start.bat`**: Starts the FastAPI + ComfyUI backend and opens `http://127.0.0.1:8765` in your browser.

Use `stop.bat` to stop the app and engine, and `healthcheck.bat` to verify paths/services. FFmpeg is bundled by the installer; add `-SkipFfmpeg` only for minimal installs (Timeline/export/fade will be unavailable).

`install.bat` also creates/updates `WAIFUSTUDIO.lnk` with the app icon, so moving the folder only requires re-running `install.bat` or:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\create_shortcut.ps1
```

### Icon

The current icon is a provisional placeholder. The source is `waifystudioicon.ico`; the app serves `static/favicon.ico` and the README uses `static/waifustudio-icon.png`. To replace it, update those files and re-run `scripts\create_shortcut.ps1` (the shortcut stores the icon path, not a copy).

> 💡 **Built-in Guide**: Check the **📖 Guide** tab inside the app for a walkthrough of each workspace and its controls.

---

## 🎬 Workspaces Included

### 1. 🎨 Image & OC Maker
- **Dual Model Families**: Supports **Anima 2.9B** models and **SDXL / Illustrious** checkpoints with automatic architecture detection.
- **Prompt Zones**: Splits prompts into *Subject, Clothing, Background, NSFW, and Composition* to keep tags organized.
- **Dual LoraLoader**: Loads LoRAs across both single-UNET (`Anima`) and full Checkpoint (`SDXL/Illustrious`) workflows.
- **Image-to-Tags**: Extracts tags from reference images using WD14 and/or the local CPU LLM.

### 2. 🎞️ Video H3 (MinimaxH3 VDN — VideoDeltaNet)
Generates anime video clips in **8 steps** using the **MinimaxH3 VideoDeltaNet (VDN)** architecture:
- **I2V (Image-to-Video)**: Animates a starting illustration.
- **FLF2V (First-to-Last Frame)**: Bridges a start image and an end image.
- **Ref2VA (Reference-to-Video-Audio)**: Uses up to 4 character reference images with audio generation.
- **V2V (Video-to-Video)**: Redraws motion from an input video.
- **Camera Presets**: Optional prompt presets for camera movement.

### 3. 🖌️ Editor Qwen 2.1 (Inpaint & Pose Presets)
- **Instructional Editing & Mask Inpainting**: Uses `Qwen-Image-2.1-UC` (GGUF) to edit specific regions or apply multi-image references.
- **Pose Presets (`L0` to `L3`)**: Optional natural-language prompt templates designed to repose characters while aiming to keep 2D anime style.

### 4. 🎬 Studio Timeline
A basic timeline tool to combine clips without leaving the app:
- **Visual & Audio Tracks**: Concatenate video clips and static images, mute original clip audio if needed, and mix an external audio track.
- **Generative Shortcuts**: Extract the last frame of a clip to enqueue a continuation (`+ Continue I2V`, `+ Bridge FLF2V`, `+ Insert AI Image`).
- **MP4 Export**: Uses local `FFmpeg` to normalize and merge clips into a single `.mp4`.

### 5. 🔍 Upscaler & RIFE Interpolation
- **Modes**: `Fast (GAN)`, `Hires.fix (Anima Diffusion)`, and `Qwen Remaster`.
- **Safety Cap**: Automatically caps output dimensions at `4096×4096 px` (`2560 px` max input side) to prevent extreme VRAM/PSU load spikes.
- **Sharpening & FPS**: Includes `ImageSharpenKJ` (`RCAS` / `Adaptive USM`) and `RIFE` video frame interpolation.

### 6. 🖼️ Gallery & Job Queue
- FIFO single-GPU job queue shared across tabs, with live status indicators and a fullscreen comparison viewer.

---

## 💻 Tested Hardware (Author's Setup)

Instead of unverified "minimum requirements", here is the **exact hardware where WaifuStudio is developed and tested**:

| Component | Author's Tested Hardware |
|---|---|
| **GPU** | **NVIDIA GeForce RTX 3060 (12 GB VRAM)** |
| **CPU** | **AMD Ryzen 7 5700X (8 Cores)** |
| **Motherboard** | **Gigabyte B550 AORUS ELITE AX V2** |
| **RAM** | **32 GB DDR4 @ 3200 MHz** (2×16 GB) |
| **OS** | **Windows 10 (64-bit)** |

- **VRAM & CPU Design Note**: All workflows are tuned around a single **12 GB VRAM** budget (FIFO queue, one job at a time). The auxiliary `Qwen3.5-9B` LLM runs on **CPU** (`llama-server` on port `8290`) so GPU VRAM stays free for ComfyUI.
- **Linux / Home Server Note**: While the one-click `.bat` scripts are written for Windows, the core app is standard Python (`FastAPI` + `ComfyUI` + Vanilla JS frontend). Community testers have reported running WaifuStudio on a **Linux home server** (native Python venv or containerized/Docker setup) and accessing the web UI over LAN/localhost from a browser.

---

## 🌐 Language Support (i18n)

Switch the interface between **English (`EN`)** and **Español (`ES`)** at any time using the `🌐` button in the top bar.

---

## 📄 License & Credits

- Released under the **[MIT License](LICENSE)** — no warranties provided.
- Built on top of [ComfyUI](https://github.com/comfyanonymous/ComfyUI), **MinimaxH3 VDN (VideoDeltaNet)**, **Anima**, [Qwen](https://github.com/QwenLM), and [FFmpeg](https://ffmpeg.org/).
