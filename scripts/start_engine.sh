#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STACK_ROOT="$(dirname "$DIR")"
PORT=8288

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "El engine de WAIFU ya esta corriendo o el puerto esta ocupado: http://127.0.0.1:$PORT"
    exit 0
fi

cd "$STACK_ROOT/ComfyUI"
if [ -f "$STACK_ROOT/.venv/bin/python" ]; then
    PYTHON="$STACK_ROOT/.venv/bin/python"
else
    PYTHON="python3"
fi

$PYTHON -s main.py --listen 127.0.0.1 --port $PORT --disable-api-nodes --disable-auto-launch
