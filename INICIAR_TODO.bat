@echo off
setlocal
cd /d "%~dp0"
echo ===========================================================
echo         HUERTO HOGAR - REACT + SPRING BOOT
 echo ===========================================================
echo Recuperando imagenes y video ORIGINALES de tu rama sebastian...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0RESTAURAR_RECURSOS_ORIGINALES.ps1"
echo.
echo Encendiendo Spring Boot (base H2 de prueba local)...
start "HUERTO HOGAR BACKEND" powershell.exe -NoProfile -NoExit -ExecutionPolicy Bypass -File "%~dp0backend\INICIAR_BACKEND_LOCAL.ps1"
echo Encendiendo React...
start "HUERTO HOGAR REACT" powershell.exe -NoProfile -NoExit -ExecutionPolicy Bypass -File "%~dp0frontend\INICIAR_FRONTEND.ps1"
echo.
echo Tienda: http://127.0.0.1:5173
 echo API:    http://127.0.0.1:8080/api/v1/productos
 echo Swagger: http://127.0.0.1:8080/swagger-ui.html
 echo.
echo Si una terminal muestra error, dejala abierta para revisar el mensaje.
pause
endlocal
