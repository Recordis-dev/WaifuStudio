# ✨ WaifuStudio v2.0 — Estudio Local de Anime & Waifus (Proyecto Personal)

<p align="center">
  <img src="static/waifustudio-icon.png" width="112" alt="Icono de WaifuStudio">
</p>

[![Versión](https://img.shields.io/badge/versión-2.0.0-ff4081.svg)](https://github.com/gusnion/WaifuStudio)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Hardware Testeado](https://img.shields.io/badge/Testeado%20en-RTX%203060%2012GB-76b900.svg)](https://www.nvidia.com)
[![Motor](https://img.shields.io/badge/Motor-ComfyUI%20Backend-orange.svg)](https://github.com/comfyanonymous/ComfyUI)
[![Privacidad](https://img.shields.io/badge/Privacidad-100%25%20Local-success.svg)]()

> 🌐 [English](README.md) | **Español**

---

**WaifuStudio** es un proyecto personal que desarrollo en mi tiempo libre para reunir en una sola interfaz web local la generación de imágenes anime, creación de hojas de personaje (OC), generación de vídeo con **MinimaxH3 (VideoDeltaNet / VDN)**, edición con **Qwen 2.1**, reescalado y un secuenciador básico de línea de tiempo, usando **ComfyUI** como motor interno.

> [!WARNING]
> **Aviso Importante — Sin Garantías y Posibles Bugs**:
> Esta es una aplicación hecha en mi tiempo libre y se comparte **"TAL CUAL" (AS IS)**, sin garantías de ningún tipo. Nada está garantizado: **pueden existir bugs, fallos o comportamientos inesperados** (especialmente en configuraciones de hardware distintas a la mía). Úsala bajo tu propia responsabilidad.

---

## 🎯 Resumen de Funciones

| Módulo | Qué hace realmente |
|---|---|
| ⚡ **Instalador Portátil (Windows)** | `install.bat` configura un entorno portátil aislado de Python + ComfyUI en Windows, descarga los modelos configurados e instala **FFmpeg/FFprobe** portables en `tools\ffmpeg`. Usa `start.bat` para arrancar, `stop.bat` para detener y `healthcheck.bat` para diagnosticar. |
| 🎭 **Gestor de Personajes (OC Maker)** | Guarda rasgos de personajes, genera hojas de referencia (Frente / Perfil / Espalda) y permite lanzar entrenamientos de LoRA en local. |
| 🧠 **Asistente de Prompts** | 91.357 tags de Danbooru indexados en SQLite FTS5 + asistente LLM local opcional en CPU (`Qwen3.5-9B` GGUF) para expandir tags o describir imágenes. |
| 🎞️ **Vídeo H3 (`MinimaxH3 VDN`)** | Generación de vídeo en 8 pasos mediante **MinimaxH3 VideoDeltaNet (VDN)** con audio nativo y presets de cámara (`I2V`, `FLF2V`, `Ref2VA`, `V2V`). |
| 🎬 **Estudio Timeline Básico** | Secuenciador web sencillo para unir clips de vídeo e imágenes estáticas con una pista de audio externa usando FFmpeg incluido, además de atajos para continuar clips con `I2V` / `FLF2V`. |
| 🔍 **Upscaler y RIFE FPS** | Escalado de imagen y vídeo (`RealESRGAN`, `AnimeSharp`, `UltraSharp`), pase opcional de difusión (`Anima` / `Qwen 2.1`), nitidez `RCAS` e interpolación RIFE. |

---

## 🚀 Inicio Rápido (Windows)

1. **Clona o Descarga** este repositorio en tu disco (ej. `E:\IA\WAIFU`).
2. **Ejecuta `install.bat`**: Configura el entorno portátil de Python, ComfyUI, nodos personalizados, FFmpeg/FFprobe portables y los pesos necesarios.
3. **Ejecuta `start.bat`**: Levanta el servidor local y abre `http://127.0.0.1:8765` en tu navegador.

Usa `stop.bat` para detener app y engine, y `healthcheck.bat` para verificar rutas/servicios. FFmpeg se instala con el instalador; usa `-SkipFfmpeg` solo para instalaciones mínimas (Timeline/export/fade no estarán disponibles).

`install.bat` también crea/actualiza `WAIFUSTUDIO.lnk` con el icono de la app. Si mueves la carpeta, vuelve a ejecutar `install.bat` o:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\create_shortcut.ps1
```

### Icono

El icono actual es un marcador de posición provisional. La fuente es `waifystudioicon.ico`; la app sirve `static/favicon.ico` y el README usa `static/waifustudio-icon.png`. Para cambiarlo, actualiza esos archivos y vuelve a ejecutar `scripts\create_shortcut.ps1` (el acceso directo guarda la ruta del icono, no una copia).

> 💡 **Guía Integrada**: Dentro de la app tienes la pestaña **📖 Guía** con explicaciones de uso de cada pestaña y sus controles.

---

## 🎬 Pestañas de Trabajo

### 1. 🎨 Imagen & OC Maker
- **Dos Familias de Modelos**: Soporta modelos **Anima 2.9B** y checkpoints **SDXL / Illustrious** con detección automática de arquitectura.
- **Zonas de Prompt**: Separa los tags en *Sujeto, Atuendo, Fondo, NSFW y Composición* para mantener el prompt ordenado.
- **LoraLoader Dual**: Carga LoRAs tanto en modelos UNET (`Anima`) como en Checkpoints completos (`SDXL/Illustrious`).
- **Imagen a Tags**: Extrae tags desde una imagen de referencia usando WD14 y/o el LLM local en CPU.

### 2. 🎞️ Vídeo H3 (MinimaxH3 VDN — VideoDeltaNet)
Genera clips de vídeo anime en **8 pasos** usando **MinimaxH3 VideoDeltaNet (VDN)**:
- **I2V (Imagen a Vídeo)**: Anima una ilustración estática inicial.
- **FLF2V (Primer a Último Fotograma)**: Genera la transición entre una imagen inicial y una final.
- **Ref2VA (Referencia a Vídeo y Audio)**: Usa hasta 4 imágenes de referencia del personaje junto con generación de audio.
- **V2V (Vídeo a Vídeo)**: Redibuja el movimiento a partir de un vídeo base.
- **Presets de Cámara**: Ajustes rápidos de movimiento de cámara en el prompt.

### 3. 🖌️ Editor Qwen 2.1 (Inpaint y Presets de Pose)
- **Edición por Instrucción e Inpainting con Máscara**: Usa `Qwen-Image-2.1-UC` (GGUF) para editar zonas pintadas o combinar hasta 3 referencias.
- **Presets de Pose (`L0` a `L3`)**: Plantillas de ayuda en lenguaje natural pensadas para cambiar la postura procurando conservar el estilo anime 2D de la imagen base.

### 4. 🎬 Estudio Timeline
Un editor básico de línea de tiempo para unir clips sin salir de la aplicación:
- **Pista Visual y de Audio**: Concatena clips de vídeo e imágenes estáticas, permite silenciar el audio original de cualquier vídeo y mezclar una pista de sonido externa.
- **Atajos de Generación**: Extrae el último fotograma de un clip para encolar su continuación (`+ Continuar I2V`, `+ Puente FLF2V`, `+ Insertar Imagen IA`).
- **Exportación MP4**: Usa `FFmpeg` local para normalizar y unir el proyecto en un archivo `.mp4`.

### 5. 🔍 Upscaler e Interpolación RIFE
- **Modos**: `Rápido (GAN)`, `Hires.fix (Difusión Anima)` y `Remaster Qwen`.
- **Tope de Seguridad**: Limita automáticamente la salida máxima a `4096×4096 px` (y rechaza entradas mayores a `2560 px`) para evitar picos extremos de VRAM y consumo eléctrico.
- **Nitidez y FPS**: Incluye `ImageSharpenKJ` (`RCAS` / `Adaptive USM`) e interpolación de fotogramas de vídeo con `RIFE`.

### 6. 🖼️ Galería y Cola de Trabajos
- Cola monohilo FIFO pensada para una sola GPU, con indicadores de estado en todas las pestañas y visor comparador antes/después.

---

## 💻 Hardware Testeado (Equipo del Autor)

En lugar de listar "requisitos mínimos" que no han sido probados, este es el **hardware exacto donde se desarrolla y testea WaifuStudio**:

| Componente | Hardware Testeado (Equipo del Autor) |
|---|---|
| **GPU** | **NVIDIA GeForce RTX 3060 (12 GB VRAM)** |
| **CPU** | **AMD Ryzen 7 5700X (8 Núcleos)** |
| **Placa Base** | **Gigabyte B550 AORUS ELITE AX V2** |
| **RAM** | **32 GB DDR4 @ 3200 MHz** (2×16 GB) |
| **Sistema Operativo** | **Windows 10 (64 bits)** |

- **Nota sobre VRAM y CPU**: Todo el flujo está ajustado alrededor del presupuesto de **12 GB de VRAM** (cola FIFO de 1 trabajo a la vez). El modelo auxiliar `Qwen3.5-9B` para textos/visión se ejecuta en **CPU** (`llama-server` en el puerto `8290`) para no quitarle VRAM a ComfyUI.
- **Nota sobre Linux / Servidor Casero**: Aunque los scripts automáticos `.bat` son para Windows, la aplicación base es Python estándar (`FastAPI` + `ComfyUI` + frontend Vanilla JS). Usuarios que han probado la app han reportado haberla montado con éxito en un **servidor doméstico con Linux** (en entorno Python/Docker) accediendo a la interfaz web desde el navegador vía red local / `localhost`.

---

## 🌐 Idiomas (i18n)

Puedes alternar la interfaz entre **Español (`ES`)** e **Inglés (`EN`)** en cualquier momento desde el botón `🌐` de la barra superior.

---

## 📄 Licencia y Créditos

- Distribuido bajo la **[Licencia MIT](LICENSE)** — entregado sin garantías.
- Construido sobre [ComfyUI](https://github.com/comfyanonymous/ComfyUI), **MinimaxH3 VDN (VideoDeltaNet)**, **Anima**, [Qwen](https://github.com/QwenLM) y [FFmpeg](https://ffmpeg.org/).
