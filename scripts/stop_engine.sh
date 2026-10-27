#!/bin/bash
PORT=8288

PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)

if [ -z "$PID" ]; then
    echo "El engine ya esta parado."
    exit 0
fi

# We skip the complex queue checking in bash for now, but a simple kill works for linux
kill $PID
echo "Engine detenido."
exit 0
