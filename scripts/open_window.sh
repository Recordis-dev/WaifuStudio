#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PORT=${WAIFU_APP_PORT:-8765}

# 1. Comprobar si el Engine está corriendo; si no, arrancarlo
if ! lsof -Pi :8288 -sTCP:LISTEN -t >/dev/null ; then
    echo "Iniciando Engine ComfyUI (8288) en segundo plano..."
    bash "$DIR/start_engine.sh" > /dev/null 2>&1 &
fi

# 2. Comprobar si WaifuStudio está corriendo; si no, arrancarlo
if ! lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "Iniciando servidor WaifuStudio en segundo plano..."
    bash "$DIR/start_app.sh" > /dev/null 2>&1 &

    # Esperar hasta 10 segundos
    ready=0
    for i in {1..20}; do
        sleep 0.5
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
            ready=1
            break
        fi
    done
    if [ $ready -eq 0 ]; then
        echo "El servidor tardo en iniciar, abriendo la URL de todas formas..."
    fi
fi

URL="http://127.0.0.1:$PORT"
echo "WaifuStudio disponible en $URL"
echo "Si tienes entorno gráfico, puedes abrir esa URL en tu navegador."
