#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STACK_ROOT="$(dirname "$DIR")"
PORT=${WAIFU_APP_PORT:-8765}

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "La app ya esta corriendo: http://127.0.0.1:$PORT"
    exit 0
fi

cd "$STACK_ROOT"
if [ -f "$STACK_ROOT/.venv/bin/python" ]; then
    PYTHON="$STACK_ROOT/.venv/bin/python"
else
    PYTHON="python3"
fi

$PYTHON -m app.server
