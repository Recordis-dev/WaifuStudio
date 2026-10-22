@echo off
setlocal
title WAIFU - Update
echo ============================================================
echo  WAIFU - Actualizador (solo instalaciones Git)
echo  Detiene la app, hace backup, git pull e install.bat.
echo  No actualiza instalaciones ZIP.
echo ============================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install\update.ps1" %*
set EXITCODE=%ERRORLEVEL%
echo.
if "%EXITCODE%"=="0" (
  echo Actualizacion terminada.
) else (
  echo La actualizacion fallo con codigo %EXITCODE%.
)
pause
exit /b %EXITCODE%
