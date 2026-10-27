#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STACK_ROOT="$(dirname "$DIR")"

unset PYTHONPATH
unset PYTHONHOME
unset VIRTUAL_ENV
unset CONDA_PREFIX
unset CONDA_DEFAULT_ENV

export UV_PYTHON_PREFERENCE="only-managed"
export UV_CACHE_DIR="$STACK_ROOT/cache/uv"
export UV_PYTHON_INSTALL_DIR="$STACK_ROOT/python"
export HF_HOME="$STACK_ROOT/cache/huggingface"
export TORCH_HOME="$STACK_ROOT/cache/torch"
export PIP_CACHE_DIR="$STACK_ROOT/cache/pip"
export TEMP="$STACK_ROOT/tmp"
export TMP="$TEMP"
export PYTHONNOUSERSITE="1"
export PYTHONIOENCODING="utf-8"
export HF_HUB_DISABLE_TELEMETRY="1"

for dir in "$UV_CACHE_DIR" "$UV_PYTHON_INSTALL_DIR" "$HF_HOME" "$TORCH_HOME" "$PIP_CACHE_DIR" "$TEMP"; do
    mkdir -p "$dir"
done
