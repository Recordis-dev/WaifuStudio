#!/bin/bash
echo "Stopping WaifuStudio..."
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
bash "$DIR/scripts/stop_app.sh"
bash "$DIR/scripts/stop_llm.sh"
bash "$DIR/scripts/stop_engine.sh"
