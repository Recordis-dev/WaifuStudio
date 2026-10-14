@echo off
setlocal
title WAIFU - Instalador
echo ============================================================
echo  WAIFU - Instalador (consola)
echo  Descarga el engine + ~106 GB de modelos en SSD SATA.
echo  Necesita ~150 GB libres (minimo descarga completa: ~120 GB).
echo  Se puede repetir sin problema: solo instala lo que falta.
echo ============================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install\install.ps1" %*
set EXITCODE=%ERRORLEVEL%
echo.
set SUCESSO=0
if "%EXITCODE%"=="0" set SUCESSO=1
if "%EXITCODE%"=="2" set SUCESSO=1

if "%SUCESSO%"=="1" (
  echo Listo. Para usar WAIFU:
  echo    1) INICIAR_ENGINE.bat   (dejalo abierto)
  echo    2) INICIAR_WAIFU.bat    (abre http://127.0.0.1:8765)
  echo    3) ABRIR_APP.bat        (opcional: modo ventana ligera dedicada ~100 MB RAM)
  if "%EXITCODE%"=="2" (
    echo.
    echo Recordatorio: los modelos opcionales de Civitai son de descarga manual.
  )
) else (
  echo El instalador termino con codigo %EXITCODE%. Revisa los mensajes de arriba.
)
pause
endlocal
