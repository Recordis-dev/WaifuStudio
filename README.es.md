# ✨ WaifuStudio v2.0 — Estudio Creativo Integral de Anime & Waifus en Local

[![Versión](https://img.shields.io/badge/versión-2.0.0-ff4081.svg)](https://github.com/gusnion/WaifuStudio)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GPU](https://img.shields.io/badge/GPU-Optimizada%20RTX%203060%2012GB-76b900.svg)](https://www.nvidia.com)
[![Motor](https://img.shields.io/badge/Motor-ComfyUI%20Autónomo-orange.svg)](https://github.com/comfyanonymous/ComfyUI)
[![Privacidad](https://img.shields.io/badge/Privacidad-100%25%20Local%20%7C%20Sin%20Telemetría-success.svg)]()
[![Censura](https://img.shields.io/badge/Censura-Cero%20%2F%20Sin%20Censura-crimson.svg)]()

> 🌐 [English](README.md) | **Español**

---

**WaifuStudio** es una suite creativa local de nueva generación diseñada para creadores de anime, narradores y artistas digitales.  
Crea personajes consistentes, genera ilustraciones en segundos, anima vídeos cinematográficos en 8 pasos, edita poses con precisión milimétrica, monta episodios completos de varios minutos en la línea de tiempo y escala a **2K a 60 FPS** — todo ejecutándose **100% en local, privado, gratuito y sin censura** en una sola GPU de consumo (RTX 3060 12GB).

---

## 🎯 ¿Por qué WaifuStudio?

| Característica | Lo que la hace única |
|---|---|
| ⚡ **Instalador Hermético en 1 Clic** | Ejecuta `INSTALAR.bat` y `ABRIR_APP.bat`. Cero conflictos de Conda o Python global; despliega un entorno portátil aislado. |
| 🎭 **Personajes Consistentes (OC Maker)** | Guarda rasgos faciales, genera Hojas de Personaje en 1 clic (Frente / Perfil / Espalda) y entrena LoRAs dedicados en segundo plano. |
| 🧠 **Asistente de Prompts Inteligente** | 91.357 tags Danbooru indexados en SQLite FTS5 + LLM local en CPU + Prompts en lenguaje natural de 7 bloques para Qwen. |
| 🎞️ **Vídeo H3 en 8 Pasos (VideoDeltaNet)** | Animación fluida con Wan 2.1 en ~60 s en lugar de 6 minutos, con audio nativo y presets de movimiento de cámara. |
| 🎬 **Estudio Timeline NLE Generativo** | Editor de vídeo y audio multi-pista diseñado para montar miniseries de más de 3 minutos con encadenado "Continuar I2V". |
| 🔍 **Upscaler Pro 2.0 & RIFE a 60 FPS** | Pipeline de doble fase: GAN rápido, Difusión Anima Hires.fix, Remaster Qwen 2K, nitidez AMD FidelityFX RCAS e interpolación RIFE. |

---

## 🚀 Inicio Rápido en 3 Clics

1. **Clona o Descarga** este repositorio en tu disco (ej. `E:\IA\WAIFU`).
2. **Doble clic en `INSTALAR.bat`**: Configura dependencias portátiles, el motor ComfyUI y descarga los modelos esenciales automáticamente.
3. **Doble clic en `ABRIR_APP.bat`**: Inicia el servidor y abre tu navegador en `http://127.0.0.1:8765`.

> 💡 **¿Primera vez en el estudio?** Abre la pestaña integrada **📖 Guía** dentro de la app para ver tutoriales interactivos paso a paso, recetarios de prompt y consejos de optimización de VRAM.

---

## 🎬 Tour por el Estudio: 7 Espacios de Producción

### 1. 🎨 Imagen & OC Maker
- **Arquitectura de Motor Dual**: Motor nativo **Anima 2.9B** (SD3/Turbo en ~3-5 s) y checkpoints **SDXL / Illustrious** con detección automática de arquitectura de tensores.
- **Zonas de Prompt**: División modular de tags (*Sujeto, Atuendo, Entorno/Fondo, NSFW y Composición*) que previene la mezcla accidental de conceptos.
- **LoraLoader Dual**: Ponderación transparente tanto para modelos UNET puros como para checkpoints estándar.
- **Visión Multimodal (WD14 + LLM)**: Conversión en 1 clic de imágenes de referencia en tags Danbooru distribuidos automáticamente por zonas.

### 2. 🎞️ Vídeo H3 (Wan 2.1 + VideoDeltaNet)
Genera secuencias de animación anime de alta fidelidad en solo **8 pasos**:
- **I2V (Imagen a Vídeo)**: Da vida a cualquier ilustración fija con movimiento orgánico.
- **FLF2V (Primer y Último Frame)**: Genera transiciones cinemáticas continuas entre dos fotogramas clave.
- **Ref2VA (Referencia a Vídeo y Audio)**: Conserva la identidad exacta del personaje con hasta 4 retratos y sonido sincronizado.
- **V2V (Vídeo a Vídeo)**: Redibuja y estiliza el movimiento y la acción de un vídeo real o grabado.
- **Presets de Cámara**: Movimientos de plano listos para usar (Zoom In, Pan Left, Tilt Up, Dynamic Action).

### 3. 🖌️ Editor Qwen 2.1 (Inpaint & Habilidad de Pose)
- **Inpainting Quirúrgico**: Modifica atuendos, expresiones faciales y anatomía pintando con máscara sin alterar el resto del dibujo.
- **Presets de Pose (L0 a L3)**: Inyección de prompts estructurados desde micro-ajustes posturales sutiles (`L0`) hasta poses dinámicas de cuerpo completo (`L3`).
- **Preservación de Estructura Latente**: Mantiene la composición original intacta mientras reimagina los detalles.

### 4. 🎬 Estudio Timeline (Montaje NLE Generativo)
Convierte clips cortos en **episodios completos de anime**:
- **Secuenciador Multi-Pista**: Organiza clips de vídeo, ilustraciones fijas (con efecto Ken Burns dinámico) y transiciones.
- **Pista de Audio y Música**: Sube bandas sonoras y efectos con control de volumen y segundo de entrada exacto.
- **Secuencias Infinitas ("Continuar I2V")**: Extrae el último fotograma de cualquier clip con un clic para generar la siguiente escena cronológica.
- **Exportación Directa**: Renderiza el montaje final en un único archivo MP4 con resolución unificada y mezcla de audio vía FFmpeg.

### 5. 🔍 Upscaler Pro 2.0 & RIFE a 60 FPS
- **Modo Rápido (GAN)**: Modelos `4x-AnimeSharp` y `4x-UltraSharp` para ampliación nítida en solo 2 segundos.
- **Hires.fix (Difusión)**: Redibuja micro-detalles reales (pestañas, reflejos en el iris, hebras de cabello) con difusión Anima a denoise graduable (`0.15`–`0.35`).
- **Remaster Qwen**: Reconstrucción semántica ultra-detallada a 2048px preservando el estilo artístico.
- **AMD FidelityFX RCAS**: Nitidez adaptativa por contraste sin halos blancos ni bordes quemados.
- **Interpolación RIFE**: Multiplica los fotogramas del vídeo hasta **60 FPS** sin desincronizar el audio.

### 6. 🖼️ Galería Inteligente & Cola Multi-Pestaña
- **Indicadores de Cola en Vivo**: Monitorea trabajos pendientes con tarjetas dinámicas giratorias (`"En cola"`, `"Generando"`) visibles en todas las pestañas.
- **Visor Lightbox Interactivo**: Inspección a pantalla completa con zoom fluido y slider comparador antes/después.
- **Traspaso Inmediato**: Envía cualquier creación previa a *Vídeo H3*, *Editor Qwen*, *Estudio Timeline* o *Upscaler* con un clic.

### 7. 📖 Guía Interactiva Integrada
- Manual bilingüe completo (`Español` / `English`) disponible directamente dentro de la interfaz.
- Buscador en tiempo real y filtros temáticos por módulo.
- Acordeones FAQ con trucos de optimización de VRAM, coherencia de personajes y dinamismo en vídeo.

---

## 💻 Requisitos de Hardware

WaifuStudio ha sido optimizado meticulosamente para la configuración **Solo-3060 (12 GB VRAM)**:

| Componente | Mínimo | Recomendado |
|---|---|---|
| **GPU** | NVIDIA RTX 3060 (12 GB VRAM) | NVIDIA RTX 3060 / 4070 / 4080 / 5000 |
| **Controlador** | Driver NVIDIA >= 570.xx (CUDA 13.0) | Último Driver NVIDIA Game Ready o Studio |
| **RAM** | 16 GB | 32 GB DDR4 / DDR5 |
| **Almacenamiento** | 35 GB libres (SSD recomendado) | 60 GB+ libres en SSD NVMe |
| **CPU** | Intel Core i5 / AMD Ryzen 5 | Intel Core i7 / AMD Ryzen 7 |
| **Sistema Operativo** | Windows 10 / 11 (64 bits) | Windows 11 (64 bits) |

> 🛡️ **Garantía de Protección de VRAM**: El asistente de visión y lenguaje (Qwen3.5-9B) opera **100% en CPU** a través de un servicio ligero transiente en segundo plano, reservando la totalidad de los 12 GB de la GPU para inferencia gráfica y de vídeo.

---

## 🌐 Internacionalización (i18n)

WaifuStudio cuenta con cambio de idioma en tiempo real:
- **Español (ES)**
- **English (EN)**

Cámbialo al instante desde el botón de globo `🌐` en la barra superior sin necesidad de recargar la página ni interrumpir tareas en curso.

---

## 📄 Licencia y Créditos

- Distribuido bajo la permisiva **[Licencia MIT](LICENSE)**.
- Desarrollado sobre la base de [ComfyUI](https://github.com/comfyanonymous/ComfyUI), [Wan 2.1](https://github.com/Wan-Video/Wan2.1), [VideoDeltaNet](https://github.com), [Qwen](https://github.com/QwenLM) y [FFmpeg](https://ffmpeg.org/).
- Las ilustraciones, audios y animaciones creadas con WaifuStudio te pertenecen al 100%.
