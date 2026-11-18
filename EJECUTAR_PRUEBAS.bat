@echo off
setlocal
cd /d "%~dp0"
echo ==================================================
echo HUERTO HOGAR - COMPROBACIONES EP3 Y EXAMEN
 echo ==================================================
echo.
echo 1) Logica de precio, kg y stock con Node...
cd frontend
call npm run test:logic
if errorlevel 1 echo ATENCION: Fallo test de logica Node.
echo.
echo 2) Suite Jasmine / Karma y cobertura...
if not exist node_modules (
  echo Primero hay que instalar dependencias: npm install
) else (
  call npm test
  if errorlevel 1 echo ATENCION: Fallo Jasmine/Karma o su lanzamiento de Chrome.
)
cd ..\backend
echo.
echo 3) Pruebas de backend Maven...
where mvn.cmd >nul 2>&1
if not errorlevel 1 (
  call mvn.cmd test
) else (
  if exist .local\herramientas\apache-maven-3.10.1\bin\mvn.cmd (
    call .local\herramientas\apache-maven-3.10.1\bin\mvn.cmd test
  ) else (
    echo Maven no se encontro. Ejecuta INICIAR_TODO.bat para preparar Maven o instalalo.
  )
)
cd ..
echo.
echo Guarda capturas de consola y cobertura antes de cerrar.
pause
endlocal
