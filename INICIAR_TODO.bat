@echo off
title HUERTO HOGAR - INICIADOR
color 0A

cd /d "%~dp0"

echo ==============================================
echo             HUERTO HOGAR
echo       INICIO AUTOMATICO FULLSTACK
echo ==============================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0INICIAR_TODO_DOCKER.ps1"

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo completar el inicio.
    echo Revisa el mensaje anterior.
    pause
)

endlocal