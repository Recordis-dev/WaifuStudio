#!/bin/bash
PORT=${WAIFU_APP_PORT:-8765}

PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)

if [ -z "$PID" ]; then
    echo "La app ya esta detenida."
    exit 0
fi

kill $PID
echo "App detenida."
exit 0
