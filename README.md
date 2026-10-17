# ✨ WaifuStudio v2.0 — All-in-One Local Anime & Waifu Production Studio

[![Version](https://img.shields.io/badge/version-2.0.0-ff4081.svg)](https://github.com/gusnion/WaifuStudio)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GPU](https://img.shields.io/badge/GPU-RTX%203060%2012GB%20Optimized-76b900.svg)](https://www.nvidia.com)
[![Engine](https://img.shields.io/badge/Engine-ComfyUI%20Standalone-orange.svg)](https://github.com/comfyanonymous/ComfyUI)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local%20%7C%20No%20Telemetry-success.svg)]()
[![Censorship](https://img.shields.io/badge/Censorship-Zero%20%2F%20Uncensored-crimson.svg)]()

> 🌐 **English** | [Español](README.es.md)

---

**WaifuStudio** is a next-generation local creative suite built for anime creators, storytellers, and AI artists.  
Create consistent characters, generate stunning illustrations in seconds, animate cinematic video clips in 8 steps, edit poses and anatomy with surgical precision, direct multi-minute anime episodes on a generative NLE timeline, and upscale to **2K at 60 FPS** — all running **100% locally, private, free, and uncensored** on a single consumer GPU (RTX 3060 12GB).

---

## 🎯 Why WaifuStudio?

| Feature | What Makes It Special |
|---|---|
| ⚡ **One-Click Hermetic Launcher** | Run `INSTALAR.bat` and `ABRIR_APP.bat`. Zero Conda/Python conflicts; deploys an isolated portable environment. |
| 🎭 **Consistent Characters (OC Maker)** | Save unique facial traits, generate 1-click Character Sheets (Front / Side / Back), and train dedicated LoRAs in background. |
| 🧠 **Prompt Engineering That Works** | 91,357 Danbooru tags indexed with SQLite FTS5 + Local CPU LLM assistant + 7-Block Natural Language Prompts for Qwen. |
| 🎞️ **8-Step Video H3 (VideoDeltaNet)** | High-fidelity Wan 2.1 video animation in ~60s instead of 6 minutes, featuring native audio and camera motion presets. |
| 🎬 **Generative NLE Timeline Studio** | Multi-track video and audio editor designed to assemble 3+ minute episodes with instant "Continue I2V" bridging. |
| 🔍 **Pro Upscaler 2.0 & 60 FPS RIFE** | Dual-stage pipeline: Fast GAN, Anima Diffusion Hires.fix, Qwen 2K Remaster, AMD FidelityFX RCAS sharpening, and RIFE interpolation. |

---

## 🚀 Quick Start in 3 Clicks

1. **Clone or Download** this repository into your machine (e.g. `E:\IA\WAIFU`).
2. **Double-click `INSTALAR.bat`**: Installs portable dependencies, ComfyUI backend, and downloads verified model weights automatically.
3. **Double-click `ABRIR_APP.bat`**: Launches the server and opens your browser at `http://127.0.0.1:8765`.

> 💡 **New to AI Creation?** Open the built-in **📖 Guide** tab inside the studio for interactive step-by-step tutorials, prompt recipes, and VRAM tips!

---

## 🎬 Studio Tour: 7 Production Workspaces

### 1. 🎨 Image & OC Maker
- **Dual Engine Architecture**: Native high-speed **Anima 2.9B** (SD3/Turbo in ~3-5s) and **SDXL / Illustrious** checkpoints with automatic tensor architecture detection.
- **Prompt Zones**: Modular prompt splitting (*Subject, Clothing, Background, NSFW, Composition*) prevents tag contamination.
- **Dual LoraLoader**: Automatic weighting for single-UNET and standard Checkpoint models.
- **Multimodal Vision (WD14 + LLM)**: 1-click image description into Danbooru tags distributed cleanly across prompt zones.

### 2. 🎞️ Video H3 (Wan 2.1 + VideoDeltaNet)
Generate high-fidelity animated anime sequences in **8 steps**:
- **I2V (Image-to-Video)**: Bring static artwork to life with natural motion.
- **FLF2V (First-to-Last Frame)**: Generate coherent seamless transitions between two keyframes.
- **Ref2VA (Reference-to-Video-Audio)**: Preserve character identity across up to 4 reference portraits with synchronized audio.
- **V2V (Video-to-Video)**: Stylize and redraw motion from existing video clips.
- **Camera Presets**: 1-click camera movements (Zoom In, Pan Left, Tilt Up, Dynamic Action).

### 3. 🖌️ Editor Qwen 2.1 (Inpaint & Pose Skill)
- **Brush Inpainting**: Surgical modification of clothes, expressions, and anatomy without touching the rest of the canvas.
- **Pose Presets (L0 to L3)**: Natural language prompt injection from subtle micro-adjustments (`L0`) to dynamic full-body poses (`L3`).
- **Latent Structure Preservation**: Locks the original composition while reimagining details.

### 4. 🎬 Studio Timeline (Generative NLE)
Turn short clips into **complete anime episodes**:
- **Multi-Track Sequencer**: Arrange video clips, static illustrations (with automated Ken Burns pan/zoom), and transitions.
- **Audio & BGM Track**: Upload background music and sound effects with precise start times and volume controls.
- **Infinite Sequences ("Continue I2V")**: Extract the final frame of any clip with one click to generate the next chronological shot.
- **One-Click Export**: Renders the complete assembly into an MP4 file with normalized resolution and synced audio via FFmpeg.

### 5. 🔍 Upscaler Pro 2.0 & RIFE 60 FPS
- **Fast Mode (GAN)**: `4x-AnimeSharp` and `4x-UltraSharp` for rapid 2-second enlargement.
- **Hires.fix (Diffusion)**: Redraws fine micro-details (eyelashes, iris glow, hair strands) with Anima diffusion at customizable denoise (`0.15`–`0.35`).
- **Qwen Remaster**: Ultra-detailed 2048px semantic reconstruction.
- **AMD FidelityFX RCAS**: Contrast-adaptive edge sharpening without halos or ringing artifacts.
- **RIFE Video Interpolation**: Doubles or quadruples video framerate to **60 FPS** with zero audio desync.

### 6. 🖼️ Smart Gallery & Batch Queue
- **Live Queue Indicators**: Track generation jobs with animated status spinners (`"Queued"`, `"Running"`) across all tabs.
- **Interactive Lightbox**: Fullscreen inspection with instant zoom and side-by-side comparison slider.
- **One-Click Hand-offs**: Send any past generation directly to *Video H3*, *Qwen Editor*, *Timeline Studio*, or *Upscaler*.

### 7. 📖 Built-in Interactive Guide
- Complete bilingual manual (`English` / `Español`) accessible directly within the UI.
- Real-time search and modular category filters.
- FAQ accordions addressing memory optimization, identity consistency, and dynamic motion.

---

## 💻 Hardware Requirements

WaifuStudio is engineered from the ground up for the **Solo-3060 (12 GB VRAM)** architecture:

| Component | Minimum | Recommended |
|---|---|---|
| **GPU** | NVIDIA RTX 3060 (12 GB VRAM) | NVIDIA RTX 3060 / 4070 / 4080 / 5000 |
| **Driver** | NVIDIA Driver >= 570.xx (CUDA 13.0) | Latest NVIDIA Game Ready / Studio Driver |
| **RAM** | 16 GB | 32 GB DDR4 / DDR5 |
| **Storage** | 35 GB free space (SSD recommended) | 60 GB+ free space on NVMe SSD |
| **CPU** | Intel Core i5 / AMD Ryzen 5 | Intel Core i7 / AMD Ryzen 7 |
| **OS** | Windows 10 / 11 (64-bit) | Windows 11 (64-bit) |

> 🛡️ **VRAM Protection Guarantee**: The multimodal LLM assistant (Qwen3.5-9B) operates **100% on CPU** via a lightweight background process, keeping all 12 GB of GPU VRAM dedicated exclusively to image, diffusion, and video generation.

---

## 🌐 Internationalization (i18n)

WaifuStudio supports real-time language switching:
- **English (EN)**
- **Español (ES)**

Toggle instantly via the topbar globe button `🌐` without reloading the page or interrupting ongoing generations.

---

## 📄 License & Credits

- Licensed under the permissive **[MIT License](LICENSE)**.
- Powered by [ComfyUI](https://github.com/comfyanonymous/ComfyUI), [Wan 2.1](https://github.com/Wan-Video/Wan2.1), [VideoDeltaNet](https://github.com), [Qwen](https://github.com/QwenLM), and [FFmpeg](https://ffmpeg.org/).
- Artwork and generations created with WaifuStudio belong 100% to you.
