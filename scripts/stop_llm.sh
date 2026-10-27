#!/bin/bash
PORT=${WAIFU_LLM_PORT:-8290}

PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)

if [ -z "$PID" ]; then
    echo "El servidor LLM ya esta parado."
    exit 0
fi

kill $PID
echo "Servidor LLM detenido."
exit 0
