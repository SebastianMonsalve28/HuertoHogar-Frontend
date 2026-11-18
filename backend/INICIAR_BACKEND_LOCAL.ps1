$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Random-Base64([int]$size) {
  $bytes = New-Object byte[] $size
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  return [Convert]::ToBase64String($bytes)
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host " HUERTO HOGAR - BACKEND LOCAL (sin MySQL)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
if (-not (Get-Command java.exe -ErrorAction SilentlyContinue)) {
  throw "Java no esta disponible. Instala JDK 21 y reinicia VS Code."
}
if (-not (Get-Command javac.exe -ErrorAction SilentlyContinue)) {
  throw "Se encontro Java pero no javac. Necesitas el JDK 21, no solo JRE."
}

# Maven en Windows puede necesitar JAVA_HOME aunque java -version funcione.
if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin\javac.exe'))) {
  $javac = (Get-Command javac.exe).Source
  $env:JAVA_HOME = Split-Path (Split-Path $javac -Parent) -Parent
}
$private = Join-Path $PSScriptRoot '.local'
$toolsPath = Join-Path $private 'herramientas'
$databasePath = Join-Path $private 'datos'
New-Item -ItemType Directory -Force $private,$toolsPath,$databasePath | Out-Null

$maven = Get-Command mvn.cmd -ErrorAction SilentlyContinue
$mavenExecutable = if ($maven) { $maven.Source } else { $null }
if (-not $mavenExecutable) {
  $candidateDirs = @(
    (Join-Path $toolsPath 'apache-maven-3.10.1\bin\mvn.cmd'),
    'C:\Herramientas\apache-maven-3.10.1\bin\mvn.cmd',
    (Join-Path $env:USERPROFILE 'Downloads\apache-maven-3.10.1\bin\mvn.cmd')
  )
  foreach ($candidate in $candidateDirs) {
    if (Test-Path $candidate) { $mavenExecutable = $candidate; break }
  }
}
if (-not $mavenExecutable) {
  $zipMaven = Join-Path $private 'apache-maven-3.10.1-bin.zip'
  $downloaded = Join-Path $env:USERPROFILE 'Downloads\apache-maven-3.10.1-bin.zip'
  if (Test-Path $downloaded) {
    Write-Host "Usando el ZIP de Maven de tu carpeta Descargas..." -ForegroundColor Yellow
    $zipMaven = $downloaded
  } elseif (-not (Test-Path $zipMaven)) {
    Write-Host "Descargando Apache Maven 3.10.1 (solo la primera vez)..." -ForegroundColor Yellow
    $urls = @(
      'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.10.1/apache-maven-3.10.1-bin.zip',
      'https://archive.apache.org/dist/maven/maven-3/3.10.1/binaries/apache-maven-3.10.1-bin.zip'
    )
    $success = $false
    foreach ($url in $urls) {
      try {
        Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $zipMaven -TimeoutSec 90
        $success = $true
        break
      } catch {
        Write-Host "No se pudo descargar desde $url" -ForegroundColor Yellow
      }
    }
    if (-not $success) { throw "No se pudo descargar Maven. Copia apache-maven-3.10.1-bin.zip a Descargas y vuelve a iniciar." }
  }
  Write-Host "Extrayendo Maven..." -ForegroundColor Yellow
  Expand-Archive -Path $zipMaven -DestinationPath $toolsPath -Force
  $mavenExecutable = Join-Path $toolsPath 'apache-maven-3.10.1\bin\mvn.cmd'
  if (-not (Test-Path $mavenExecutable)) { throw "El ZIP no contiene Maven 3.10.1. Verifica el ZIP descargado." }
}

$credentialFile = Join-Path $private 'credenciales-admin-local.txt'
if (-not (Test-Path $credentialFile)) {
  $password = (Random-Base64 18).TrimEnd('=').Replace('+','A').Replace('/','B')
  Set-Content -Path $credentialFile -Value $password -Encoding ASCII -NoNewline
}
$env:APP_ADMIN_EMAIL = 'admin@duoc.cl'
$env:APP_ADMIN_PASSWORD = (Get-Content -Path $credentialFile -Raw).Trim()
$env:JWT_SECRET = Random-Base64 48
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:FRONTEND_ORIGIN = 'http://127.0.0.1:5173'
$env:COOKIE_SECURE = 'false'
Write-Host "";
Write-Host "Base de datos local en backend\.local\datos" -ForegroundColor Green
Write-Host "Administrador local: admin@duoc.cl" -ForegroundColor Green
Write-Host "Clave demo local: $env:APP_ADMIN_PASSWORD" -ForegroundColor Green
Write-Host "NO publiques la carpeta backend\.local en GitHub." -ForegroundColor Yellow
Write-Host "API: http://127.0.0.1:8080/api/v1/productos" -ForegroundColor Cyan
Write-Host "Swagger: http://127.0.0.1:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "La primera ejecucion descargara las dependencias de Maven." -ForegroundColor Cyan
Write-Host ""
& $mavenExecutable 'spring-boot:run'
if ($LASTEXITCODE -ne 0) {
  Write-Host "Spring Boot no se inicio. Revisa los errores mostrados arriba." -ForegroundColor Red
  exit $LASTEXITCODE
}
