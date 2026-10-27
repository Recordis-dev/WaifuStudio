# Gap Analysis for Linux / Codespaces Compatibility

## Resolved Gaps
1.  **File Paths:** Test suite and fixtures heavily relied on `\` separators and `C:\` drive paths. Migrated to `/` and relative `Path` resolution. This fixes numerous Windows-only assumptions throughout `tests` and `app` logic.
2.  **Process Execution:** `app/trainer.py` hardcoded `cmd.exe`. Replaced with Linux-compatible `sh -c` execution.
3.  **Server Initialization (`app/llm_server.py`):** Referenced Windows virtual environment paths like `.\\.venv\\Scripts\\python.exe`. Changed to `/.venv/bin/python`. Executables like `llama-server.exe` changed to `llama-server`.
4.  **Documentation & CLI:** Help text in `gate_*.py` and `registry.py` mentioning Windows paths (e.g., `workflows\\anima_base.json`) were updated to POSIX paths.
5.  **Startup Scripts:** Windows-specific launchers (`start.bat`, `start_engine.bat`, `stop.bat`, and `scripts/*.ps1`) have been successfully translated to Linux `.sh` equivalents (`start.sh`, `start_engine.sh`, `stop.sh`, `scripts/*.sh`), implementing matching port lookup and process handling using `lsof` and `kill`.
6.  **Dependencies:** `requirements.txt` dependencies verified. Removed explicit mentions of `.exe` inside scripts referencing the requirements structure.

## Remaining Gaps
*   **None.** All identified gaps for basic cross-platform and Linux/Codespaces compatibility have been closed.
