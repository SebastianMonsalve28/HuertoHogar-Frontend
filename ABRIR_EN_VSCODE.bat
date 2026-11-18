@echo off
cd /d "%~dp0"
where code >nul 2>&1
if %errorlevel% neq 0 (
 echo Abre el archivo HuertoHogar.code-workspace con VS Code.
 pause
 exit /b 1
)
code "HuertoHogar.code-workspace"
