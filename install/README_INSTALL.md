# Instalación de WAIFU (Hermética y Aislada)

Instalador por consola, 100% automatizado y aislado. Descarga todo lo pesado (engine, dependencias portables y modelos) a tu PC sin requerir configuración previa del sistema; en GitHub solo viaja el código.

## 1) Qué necesitas

| | |
|---|---|
| Sistema | **Windows 10/11 x64** |
| GPU | **NVIDIA RTX 3000 / 4000 / 5000** (8 GB+ VRAM para imagen, Editor y Upscaler; 12 GB+ para vídeo H3). Probado en RTX 3060 12 GB. **Driver NVIDIA >= 570.xx recomendado** para soporte nativo CUDA 13.0 (`cu130`). |
| Disco | **SSD SATA o NVMe** (no HDD: los modelos se leen y transfieren a GPU mucho más rápido). **25 GB libres** para instalación base (`-SkipModels` o `-SkipLlm`) / **~120-150 GB libres** para paquete completo (~106 GB modelos recomendados + engine/.venv + ~6,5 GB LLM). |
| Programas | Git for Windows (`git` para clonar); `curl.exe` ya viene con Windows. **No necesitas instalar Python ni Conda previamente**. |

## 2) Aislamiento Hermético del Entorno

El instalador (`INSTALAR.bat` / `install/install.ps1` / `scripts/environment.ps1`) está diseñado para ser completamente hermético y evitar conflictos con software preexistente:
- **Python y uv locales y portables**: descarga e instala CPython 3.12.12 en `python\` y `uv` en `tools\uv\`, sin tocar variables de entorno globales ni requerir permisos de administrador.
- **Inmunidad ante Python/Conda del sistema**: limpia activamente en memoria variables contaminantes (`PYTHONPATH`, `PYTHONHOME`, `CONDA_PREFIX`, etc.).
- **Sanitización de `.venv`**: detecta si un entorno virtual previo apunta a un Python global o huérfano y lo recrea automáticamente vinculado al Python aislado local.
- **Tolerancia a fallos en compilación**: instala PyTorch con soporte CUDA 13.0 (`cu130`) e incluye fallback automático para SageAttention si tu GPU o compilador lo requieren.

## 3) Instalar (3 pasos)

```powershell
git clone https://github.com/gusnion/WaifuStudio.git
cd WaifuStudio
INSTALAR.bat
```

- Descarga los componentes del engine, nodos de ComfyUI y pregunta interactivamente si deseas descargar los modelos recomendados.
- Es **repetible e idempotente**: si se interrumpe la conexión, vuelve a ejecutar `INSTALAR.bat` y continuará exactamente donde quedó.
- Verifica cada archivo con SHA256; los archivos ya íntegros no se vuelven a descargar.

## 4) Usar

```
1) INICIAR_ENGINE.bat      (déjalo abierto; escucha en 127.0.0.1:8288)
2) INICIAR_WAIFU.bat       (abre http://127.0.0.1:8765)
3) ABRIR_APP.bat           (opcional: modo ventana ultraligera dedicada, ~100 MB RAM)
```

El LLM es automático: la app arranca y para sola su servidor de texto/visión (~5 s la primera
carga; CPU, 0 VRAM). No hay que lanzar nada más. Para cerrar: `DETENER_WAIFU.bat` y
`DETENER_ENGINE.bat`. Comprobación rápida: `VERIFICAR_WAIFU.bat` (con `--require-llm` exige el
LLM listo).

## 4b) LLM único (incluido, ~6,5 GB)

Todas las tareas de texto e imagen→texto usan **Qwen3.5-9B NSFW Captioning v5 (Q4_K_M) + mmproj-Q8_0**
(~6,25 GiB), servido por `llama.cpp` stock b11146 en **CPU** (`-ngl 0`: 0 VRAM, no compite con
ComfyUI). El instalador baja el GGUF, el mmproj y el runtime por defecto (ejecutando
`scripts/download_llm.py`); la app los usa solos, sin `.bat`.

Como alternativa (o para completar/reverificar el paquete, incluido el runtime
`tools/llama.cpp/`, que no se versiona) existe el descargador con verificación SHA256:

```powershell
& .\.venv\Scripts\python.exe scripts\download_llm.py
```

- Destinos: `ComfyUI/models/llm/qwen35-9b-nsfw-captioning/` y `tools/llama.cpp/`.
- `WAIFU_LLM_PORT/MODEL/MMPROJ/THREADS` ajustan el servidor gestionado; `WAIFU_LLM_URL` fuerza
  un servidor externo.
- Estado en la UI o `GET /api/llm/status`. Pines y hashes:
  `install/manifest/manifest.llm.json`.

## 5) Qué NO se incluye

- **LoRAs de personajes del autor** (no redistribuibles). Cuando tengas las tuyas, se añaden desde la app: pestaña Imagen → «Elegir LoRAs» → «Gestionar biblioteca».
- **Dos modelos base** (Anima Aesthetic v11 y One Obsession v40) se descargan **a mano** por restricciones de Civitai: el instalador te dirá exactamente cuáles faltan y dónde va cada archivo.
- Los textos de licencia de cada modelo: ver `THIRD_PARTY_NOTICES.md` y el campo `license` del manifiesto.

## 6) Banderas Avanzadas del Instalador

El instalador acepta parámetros si necesitas una instalación a medida:

| Bandera | Efecto |
|---|---|
| `-SkipModels` | Omite la descarga de modelos pesados (solo verifica existentes y requiere solo 25 GB libres). |
| `-SkipLlm` | Omite la descarga del modelo y runtime del LLM gestionado. |
| `-IncludeOptional` | Descarga también assets opcionales (ej. modelo WD14 para auto-caption y stock del Editor). |
| `-IncludeTrainer` | Clona kohya-ss/sd-scripts y prepara `tools\kohya\venv` para entrenamiento local de LoRAs. |
| `-SkipEngine` | No instala ni actualiza ComfyUI, custom nodes, torch ni SageAttention. |
| `-Yes` | Modo desatendido: descarga los modelos recomendados sin pedir confirmación interactiva. |
| `-SkipVerify` | No ejecuta la suite de tests ni el diagnóstico `app.health` al finalizar. |
| `-NoUserEnv` | No escribe variables permanentes de usuario en el registro de Windows. |

Ejemplos:
```powershell
# Instalación base ultra-rápida (solo código, engine y dependencias, sin modelos):
.\install\install.ps1 -SkipModels -SkipLlm

# Instalación completa desatendida incluyendo entrenador y modelos opcionales:
.\install\install.ps1 -Yes -IncludeOptional -IncludeTrainer
```

## 7) Licencia

- **Código: MIT** (ver `LICENSE`).
- **Modelos**: cada uno con su licencia. Destaca **Anima: no comercial** (`circlestone-labs-non-commercial-license v1.2`). Revisa `THIRD_PARTY_NOTICES.md` antes de usos comerciales.
