#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STACK_ROOT="$(dirname "$DIR")"

PORT=${WAIFU_LLM_PORT:-8290}
CTX=${WAIFU_LLM_CTX:-8192}
THREADS=${WAIFU_LLM_THREADS:-4}
NGL=${WAIFU_LLM_NGL:-0}

SERVER_EXE="$STACK_ROOT/tools/llama.cpp/llama-server"

NEW_MODEL_DIR="$STACK_ROOT/ComfyUI/models/llm/qwen35-9b-nsfw-captioning"
NEW_MODEL_PATH="$NEW_MODEL_DIR/qwen3.5-9b-nsfw-captioning-v5.Q4_K_M.gguf"
NEW_MMPROJ_PATH="$NEW_MODEL_DIR/qwen3.5-9b-nsfw-captioning-v5.mmproj-Q8_0.gguf"

LEGACY_MODEL_DIR="$STACK_ROOT/ComfyUI/models/llm/qwen35-9b-abliterated"
LEGACY_MODEL_PATH="$LEGACY_MODEL_DIR/Qwen3.5-9B-abliterated-Q4_K_M.gguf"
LEGACY_MMPROJ_PATH="$LEGACY_MODEL_DIR/mmproj-F16.gguf"

if [ -f "$NEW_MODEL_PATH" ] && [ -f "$NEW_MMPROJ_PATH" ]; then
    MODEL_PATH="$NEW_MODEL_PATH"
    MMPROJ_PATH="$NEW_MMPROJ_PATH"
elif [ -f "$LEGACY_MODEL_PATH" ] && [ -f "$LEGACY_MMPROJ_PATH" ]; then
    MODEL_PATH="$LEGACY_MODEL_PATH"
    MMPROJ_PATH="$LEGACY_MMPROJ_PATH"
else
    MODEL_PATH="$NEW_MODEL_PATH"
    MMPROJ_PATH="$NEW_MMPROJ_PATH"
fi

MISSING=""
if [ ! -f "$SERVER_EXE" ]; then MISSING="$MISSING
  - llama-server: $SERVER_EXE"; fi
if [ ! -f "$MODEL_PATH" ]; then MISSING="$MISSING
  - modelo: $MODEL_PATH"; fi
if [ ! -f "$MMPROJ_PATH" ]; then MISSING="$MISSING
  - mmproj: $MMPROJ_PATH"; fi

if [ ! -z "$MISSING" ]; then
    echo -e "No se puede arrancar el servidor LLM. Faltan archivos:$MISSING"
    echo "Descargalos con: $STACK_ROOT/.venv/bin/python scripts/download_llm.py"
    exit 1
fi

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "El servidor LLM ya esta corriendo o el puerto esta ocupado: http://127.0.0.1:$PORT"
    exit 0
fi

cd "$STACK_ROOT"
$SERVER_EXE -m "$MODEL_PATH" --mmproj "$MMPROJ_PATH" --host 127.0.0.1 --port $PORT -ngl $NGL -c $CTX -t $THREADS --jinja --reasoning off --no-webui -np 1 $WAIFU_LLM_EXTRA_ARGS
