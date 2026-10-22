@echo off
setlocal

if /I "%~1"=="-Update" (
  call "%~dp0update.bat"
  exit /b %ERRORLEVEL%
)

title WAIFU - Installer
echo ============================================================
echo  WAIFU - Installer (console)
echo  Installs engine + app deps + FFmpeg + ~106 GB of models.
echo  Needs ~150 GB free (minimal install without models: ~25 GB).
echo  Safe to re-run: only missing components are installed.
echo  To update an existing Git install: install.bat -Update
echo ============================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install\install.ps1" %*
set EXITCODE=%ERRORLEVEL%
echo.
set SUCCESS=0
if "%EXITCODE%"=="0" set SUCCESS=1
if "%EXITCODE%"=="2" set SUCCESS=1

if "%SUCCESS%"=="1" (
  echo Done. Next steps:
  echo    1) start.bat        (starts engine + app + window)
  echo    2) healthcheck.bat  (optional: paths/services diagnostics)
  echo    3) stop.bat         (stops app + engine)
  if "%EXITCODE%"=="2" (
    echo.
    echo Reminder: optional Civitai models are manual downloads.
  )
) else (
  echo Installer exited with code %EXITCODE%. Check the messages above.
)
pause
endlocal
