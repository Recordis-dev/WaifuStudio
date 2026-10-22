# WaifuStudio v2.0 — Estudio local de producción anime

<p align="center">
  <img src="static/waifustudio-icon.png" width="112" alt="Icono de WaifuStudio">
</p>

[![Versión](https://img.shields.io/badge/versión-2.0.0-ff4081.svg)](https://github.com/gusnion/WaifuStudio)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GPU de referencia](https://img.shields.io/badge/GPU%20de%20referencia-RTX%203060%2012GB-76b900.svg)](https://www.nvidia.com)
[![Motor](https://img.shields.io/badge/Motor-ComfyUI%20Backend-orange.svg)](https://github.com/comfyanonymous/ComfyUI)
[![Local por defecto](https://img.shields.io/badge/Local-por%20defecto-success.svg)]()
[![Patreon](https://img.shields.io/badge/Patreon-gusnion-ff424d.svg)](https://www.patreon.com/gusnion)

> [English](README.md) | Español

WaifuStudio es un espacio de producción local para imágenes anime y vídeo corto. Reúne generación de imágenes, referencias de personaje, generación de vídeo, edición, escalado, montaje en Timeline y gestión de galería en una sola interfaz web, con ComfyUI como motor de inferencia.

La aplicación está pensada para una única GPU NVIDIA y un escritorio Windows. No requiere cuenta, servicio en la nube ni telemetría. El instalador mantiene Python, ComfyUI y FFmpeg en una carpeta portable.

> [!WARNING]
> **Estado y alcance**: proyecto independiente, entregado "tal cual", sin garantías. Está desarrollado y probado sobre la configuración de referencia. Otras GPUs, sistemas y flujos pueden funcionar, pero no están validados oficialmente. Puede haber asperezas; mantén copias de proyectos y medios generados.

## Qué incluye

| Módulo | Estado | Qué hace |
|---|---|---|
| **Instalador Windows** | Disponible | Prepara Python portable, ComfyUI, nodos, modelos, FFmpeg/FFprobe y el acceso directo de la app. |
| **Imagen y OC Maker** | Disponible | Anima 2.9B y SDXL/Illustrious, zonas de prompt, LoRAs, perfiles de personaje, referencias y entrenamiento opcional de LoRA. |
| **Asistente de prompts** | Disponible | Índice local de tags Danbooru y LLM opcional en CPU para expandir prompts y describir imágenes. |
| **Vídeo H3** | Disponible | Generación en 8 pasos con VideoDeltaNet en modos I2V, FLF2V, Ref2VA y V2V, audio nativo y plantillas de prompt cortas. |
| **Editor** | Disponible | Edición por instrucción con Qwen-Image 2.1, hasta diez referencias y presets de pose L0–L3. El inpainting con máscara no forma parte de esta versión. |
| **Timeline** | Disponible | Ordena clips e imágenes, ajusta duración, aplica fade/zoom, silencia clips, añade audio externo, continúa con I2V/FLF2V y exporta MP4. Es un secuenciador enfocado, no un NLE completo. |
| **Upscaler** | Disponible | Escalado de imagen con GAN, Hires Fix y Qwen Remaster, nitidez RCAS/Adaptive USM e interpolación RIFE. El escalado de vídeo está limitado a 300 frames por trabajo. |
| **Galería y cola** | Disponible | Galería sobre SQLite, historial de trabajos y cola FIFO de una sola GPU compartida por todas las pestañas. |

## Inicio rápido (Windows)

1. Clona o descarga el repositorio.
2. Ejecuta `install.bat`. Crea el entorno aislado y descarga los modelos configurados.
3. Ejecuta `start.bat`. Arranca ComfyUI, la app FastAPI y abre `http://127.0.0.1:8765`.

Comandos útiles:

```text
start.bat        arranca app y engine
stop.bat         detiene app y engine
healthcheck.bat  comprueba rutas y servicios
start_engine.bat arranca solo ComfyUI
stop_engine.bat  detiene solo ComfyUI
```

FFmpeg se instala por defecto. `-SkipFfmpeg` existe para instalaciones mínimas, pero el export y la concatenación del Timeline no funcionarán. `install.bat` también crea `WAIFUSTUDIO.lnk` con el icono de la app; si mueves la carpeta, ejecuta `scripts\create_shortcut.ps1` o vuelve a ejecutar el instalador.

El icono actual es provisional. La fuente es `waifystudioicon.ico`; la app sirve `static/favicon.ico` y el README usa `static/waifustudio-icon.png`.

## Configuración de referencia

Este es el hardware y software usado para desarrollo y validación. No son requisitos mínimos.

| Componente | Referencia |
|---|---|
| GPU | NVIDIA GeForce RTX 3060, 12 GB |
| CPU | AMD Ryzen 7 5700X, 8 núcleos |
| RAM | 32 GB DDR4 |
| SO | Windows 10 64 bits |
| Motor | ComfyUI v0.37.4 |
| Python | CPython 3.12.12, aislado |
| Inferencia | PyTorch 2.11.0 + CUDA 13.0 |

Los flujos están ajustados a un presupuesto de 12 GB y un trabajo a la vez. El asistente opcional Qwen3.5-9B se ejecuta en CPU para no quitar VRAM a ComfyUI.

Windows es la ruta de instalación soportada. El núcleo es FastAPI, ComfyUI y JavaScript sin bundler; el modo servidor Linux/LAN está planificado, pero todavía no está disponible.

## Límites actuales

- Una sola GPU y cola FIFO. Los trabajos largos bloquean las demás pestañas hasta terminar.
- H3 genera segmentos cortos: 15 segundos por generación, con encadenado donde esté soportado.
- El upscaler nativo de vídeo procesa un batch y rechaza más de 300 frames. Los vídeos largos necesitan una herramienta externa.
- El Timeline es pequeño a propósito: todavía no tiene playhead, trim, drag-and-drop ni forma de onda.
- No hay lip-sync ni voz en off automática en esta versión.
- No hay inferencia en nube, alquiler de GPU remota ni market de modelos integrados.
- La Guía interna está en revisión; el README y la UI real son la referencia de lo que existe.

## Hoja de ruta

Lo siguiente está planificado o en evaluación. No son promesas, no tienen fechas y no está disponible salvo que se indique.

### Corto plazo

- **Presets de modelos por VRAM** y gestor de modelos verificado, para no asumir 12 GB.
- **Modo Estudio Linux**: servidor headless para la red local, separado de la app personal de Windows.
- **Soporte de ComfyUI/GPU remota** con volúmenes persistentes de modelos, para no depender de la GPU local.
- **Herramientas para agentes locales**: CLI, skill y modo DSH que manejen la app mediante su API.
- **Cola de escenas en Timeline** y director de guion a escenas con trabajos reanudables.

### En evaluación

- **Narración con Chatterbox** para voz en español, con lip-sync opcional como paso separado.
- **Integración de Video2X** para escalar vídeo largo, mantenido como herramienta externa.
- **Perfiles Wan 2.2**, incluido el banco de workflows comunitario acreditado a Artelive.
- **Navegador/descargador de Civitai**, sujeto a límites de API, licencias y contenido con edad.
- **LTX 2.5**: evaluado, pero no práctico en una GPU de 12 GB en su forma actual.
- **Mejoras NLE del Timeline**: playhead, recorte, drag-and-drop y formas de onda.

## Desarrollo

La versión 2.0 es una pasada de estabilización y documentación sobre la aplicación original. La remediación, el trabajo de tests y las bases para agentes fueron continuados con **DeepSeek V4.1 Flash 1017** usando **DSH**.

La suite offline ejecuta actualmente 1.613 tests. El README describe la app tal como está; lo que solo está planificado aparece en la hoja de ruta.

## Apoyo

El desarrollo es independiente y la aplicación sigue bajo licencia MIT. Si quieres apoyar el tiempo dedicado a pruebas, documentación y mantenimiento, hay una página de Patreon:

https://www.patreon.com/gusnion

El apoyo es opcional y no desbloquea ni restringe ninguna parte de la aplicación.

## Licencia y créditos

- Distribuido bajo la **Licencia MIT**. Sin garantías.
- Construido sobre ComfyUI, MiniMax H3 VDN, Anima, Qwen y FFmpeg.
- **Investigación de workflows Wan 2.2 y banco para 8 GB**: Artelive (contribución comunitaria; integración pendiente).
