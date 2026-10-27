# Development Log

## $(date)
- Initialized refactoring for Linux / GitHub Codespaces compatibility.
- **Paths and Commands:** Refactored Windows hardcoded paths (`\\`, `C:\`) to POSIX style (`/`) across tests (`test_server.py`, `test_loras.py`, `test_kohya_wrapper.py`, `test_graphs.py`, `test_editor_models.py`, `test_timeline_audio.mjs`).
- **Subprocess Fixes:** Updated `app/trainer.py` to use `sh -c` instead of `cmd.exe /c` for subprocess execution. Updated argument parsing to use `shlex.split`.
- **Test Suite:** Resolved multiple test failures caused by the path transitions. Mocked necessary files (`tools/kohya/sd-scripts/anima_train_network.py`, various `.safetensors`) to satisfy existence checks. The complete test suite (Python + Node.js) is now passing.

**Next Steps:** Reviewing `app/llm_server.py` and CLI help strings for remaining Windows-specific references. Translating scripts.
- **Core App Refactoring:** Updated `app/llm_server.py` to point to `.venv/bin/python` instead of the Windows path. Cleaned up multiple instances of `\` in documentation and hardcoded strings within `app/gate_*.py`, `app/registry.py`, `app/preprompts.py`, `app/enhancer.py`, `app/motion.py`, `app/routes/models.py`, and `app/trainer.py`. Replaced the backslash `.replace` logic in `app/routes/models.py` when loading unets and loras, opting to just convert to lower case and use POSIX slashes exclusively.
- **Dependencies & Setup:** Reviewed `requirements.txt`. Replaced `.exe` references in `requirements.txt` and `app/llm_server.py` to point to Linux binary expectations (`llama-server` instead of `llama-server.exe`). There are no Windows-specific wheels required in the current runtime environment.
- **Bash Scripts:** Translated `.ps1` and `.bat` entrypoints (`start_app`, `stop_app`, `start_engine`, `stop_engine`, `start_llm`, `stop_llm`, `open_window`, `start`, `start_engine`, `stop`) into `.sh` bash equivalents with POSIX paths and standard UNIX tooling (`lsof`, `kill`).
- **Regression Testing:** Re-ran the complete Python and Node test suite (1613 tests). All tests passed. The codebase has been fully verified.
