@echo off
cd /d "%~dp0"
echo === NODE ===
node -v
echo === NPM ===
npm -v
echo === JAVA ===
java -version
echo === JAVAC ===
javac -version
echo === MAVEN (opcional con INICIAR_TODO.bat) ===
mvn -v
echo.
echo Si Maven no aparece, INICIAR_TODO.bat usara el ZIP de Descargas
 echo o lo descargara automaticamente al ejecutar Spring Boot.
pause
