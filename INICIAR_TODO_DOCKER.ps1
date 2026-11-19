$ErrorActionPreference = "Stop"

# HUERTO HOGAR - Puertos del proyecto
$PUERTO_MYSQL = 13317
$PUERTO_BACKEND = 18082
$PUERTO_FRONTEND = 15173

$raiz = $PSScriptRoot
$backend = Join-Path $raiz "backend"
$frontend = Join-Path $raiz "frontend"
$privado = Join-Path $backend ".local"

function Docker-Activo {
    try {
        & docker info --format '{{.ServerVersion}}' 2>$null | Out-Null
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    }
}

function Web-Disponible([string]$url) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
        return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300)
    } catch {
        return $false
    }
}

function Puerto-Ocupado([int]$puerto) {
    $cliente = New-Object System.Net.Sockets.TcpClient
    try {
        $tarea = $cliente.ConnectAsync("127.0.0.1", $puerto)
        return ($tarea.Wait(500) -and $cliente.Connected)
    } catch {
        return $false
    } finally {
        $cliente.Dispose()
    }
}

function Leer-Secreto([string]$ruta) {
    if (-not (Test-Path -LiteralPath $ruta)) { return $null }
    try {
        $contenido = (Get-Content -LiteralPath $ruta -Raw).Trim()
        return ConvertTo-SecureString -String $contenido
    } catch {
        Write-Warning "El secreto guardado no se puede leer en este PC. Se pedira nuevamente."
        Copy-Item -LiteralPath $ruta -Destination "$ruta.bak" -Force
        Remove-Item -LiteralPath $ruta -Force
        return $null
    }
}

function Guardar-Secreto([string]$ruta, [securestring]$secreto) {
    $cifrado = ConvertFrom-SecureString -SecureString $secreto
    Set-Content -LiteralPath $ruta -Value $cifrado -Encoding ASCII
}

function Texto-Secreto([securestring]$secreto) {
    return [System.Net.NetworkCredential]::new("", $secreto).Password
}

function Buscar-Java {
    if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\javac.exe"))) {
        return $env:JAVA_HOME
    }
    $opciones = @("$env:ProgramFiles\Java\jdk-24", "$env:ProgramFiles\Java\jdk-21")
    $carpetas = @("$env:ProgramFiles\Java", "$env:ProgramFiles\Eclipse Adoptium")
    foreach ($carpeta in $carpetas) {
        if (Test-Path $carpeta) {
            $opciones += @(Get-ChildItem -Path $carpeta -Directory -ErrorAction SilentlyContinue |
                Sort-Object Name -Descending | ForEach-Object { $_.FullName })
        }
    }
    foreach ($opcion in $opciones) {
        if ($opcion -and (Test-Path (Join-Path $opcion "bin\javac.exe"))) {
            return $opcion
        }
    }
    $javac = Get-Command javac.exe -ErrorAction SilentlyContinue
    if ($javac) {
        return (Split-Path (Split-Path $javac.Source -Parent) -Parent)
    }
    throw "No se encontro Java JDK. Instala un JDK 17 o superior."
}

function Buscar-Node {
    $local = Get-ChildItem -Path $privado -Recurse -Filter node.exe -File `
        -ErrorAction SilentlyContinue | Where-Object {
            Test-Path (Join-Path $_.Directory.FullName "npm.cmd")
        } | Select-Object -First 1
    if ($local) { return (Join-Path $local.Directory.FullName "npm.cmd") }
    $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($npm) { return $npm.Source }
    throw "No se encontro Node.js con npm. Revisa backend\.local."
}

function Buscar-Maven {
    $local = Get-ChildItem -Path $privado -Recurse -Filter mvn.cmd -File `
        -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($local) { return $local.FullName }
    $maven = Get-Command mvn.cmd -ErrorAction SilentlyContinue
    if ($maven) { return $maven.Source }
    throw "No se encontro Maven. Revisa backend\.local."
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host "       HUERTO HOGAR - INICIO COMPLETO" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

if (-not (Test-Path $backend)) { throw "Falta la carpeta backend." }
if (-not (Test-Path $frontend)) { throw "Falta la carpeta frontend." }
New-Item -ItemType Directory -Path $privado -Force | Out-Null

# Leer las claves del archivo privado sin mostrarlas
$archivoEnv = Join-Path $backend ".env"
if (-not (Test-Path $archivoEnv)) {
    throw "Falta backend\.env. Debe contener DB_ROOT_PASSWORD y DB_PASSWORD."
}
$config = @{}
Get-Content -LiteralPath $archivoEnv | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') {
        $clave = $matches[1]
        $valor = $matches[2].Trim()
        if ($valor.Length -ge 2) {
            if (($valor.StartsWith('"') -and $valor.EndsWith('"')) -or
                ($valor.StartsWith("'") -and $valor.EndsWith("'"))) {
                $valor = $valor.Substring(1, $valor.Length - 2)
            }
        }
        $config[$clave] = $valor
    }
}
if ([string]::IsNullOrWhiteSpace($config["DB_ROOT_PASSWORD"]) -or
    [string]::IsNullOrWhiteSpace($config["DB_PASSWORD"])) {
    throw "Faltan DB_ROOT_PASSWORD o DB_PASSWORD en backend\.env."
}

# Detectar herramientas locales antes de abrir las ventanas nuevas
Write-Host "`n[1/5] Revisando Java, Node y Maven..." -ForegroundColor Cyan
$env:JAVA_HOME = Buscar-Java
$npmPath = Buscar-Node
$mavenPath = Buscar-Maven
$nodeDir = Split-Path $npmPath -Parent
$mavenDir = Split-Path $mavenPath -Parent
$env:Path = (Join-Path $env:JAVA_HOME "bin") + ";" + $nodeDir + ";" + $mavenDir + ";" + $env:Path
Write-Host "Java:  $env:JAVA_HOME" -ForegroundColor Green
Write-Host "Node:  $nodeDir" -ForegroundColor Green
Write-Host "Maven: $mavenPath" -ForegroundColor Green

# Configurar backend y frontend ANTES de crear ventanas
$env:DB_URL = "jdbc:mysql://127.0.0.1:$PUERTO_MYSQL/huerto_hogar?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Santiago"
$env:DB_USER = "huerto"
$env:DB_PASSWORD = $config["DB_PASSWORD"]
$env:SERVER_PORT = [string]$PUERTO_BACKEND
$env:APP_ADMIN_EMAIL = "admin@duoc.cl"
$env:FRONTEND_ORIGIN = "http://127.0.0.1:$PUERTO_FRONTEND"
$env:VITE_API_URL = "http://127.0.0.1:$PUERTO_BACKEND/api/v1"
$env:COOKIE_SECURE = "false"
Remove-Item Env:SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue

# Recuperar contraseña del administrador sin cambiar la existente
$adminFile = Join-Path $privado "admin-password.dpapi"
$claveAdmin = Leer-Secreto $adminFile
if ($null -eq $claveAdmin) {
    Write-Host "`nConfigura la contrasena del administrador." -ForegroundColor Cyan
    $claveAdmin = Read-Host "Contrasena (minimo 8 caracteres)" -AsSecureString
    if ((Texto-Secreto $claveAdmin).Length -lt 8) {
        throw "La contrasena del administrador debe tener al menos 8 caracteres."
    }
    Guardar-Secreto $adminFile $claveAdmin
}
$env:APP_ADMIN_PASSWORD = Texto-Secreto $claveAdmin

# Recuperar o generar secreto JWT
$jwtFile = Join-Path $privado "jwt-secret.dpapi"
$jwtSeguro = Leer-Secreto $jwtFile
if ($null -eq $jwtSeguro) {
    $bytes = New-Object byte[] 48
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    $jwtSeguro = ConvertTo-SecureString -String ([Convert]::ToBase64String($bytes)) -AsPlainText -Force
    Guardar-Secreto $jwtFile $jwtSeguro
}
$env:JWT_SECRET = Texto-Secreto $jwtSeguro

# Iniciar Docker si hace falta
Write-Host "`n[2/5] Comprobando Docker..." -ForegroundColor Cyan
if (-not (Get-Command docker.exe -ErrorAction SilentlyContinue)) {
    throw "Docker Desktop no esta disponible."
}
if (-not (Docker-Activo)) {
    $dockerApp = @(
        "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $dockerApp) { throw "Abre Docker Desktop manualmente." }
    Start-Process -FilePath $dockerApp
    $listo = $false
    for ($i = 0; $i -lt 90; $i++) {
        if (Docker-Activo) { $listo = $true; break }
        Start-Sleep -Seconds 2
    }
    if (-not $listo) { throw "Docker Desktop no pudo iniciar." }
}
Write-Host "Docker funcionando." -ForegroundColor Green

# Iniciar MySQL. No eliminar ni recrear el volumen de datos.
Write-Host "`n[3/5] Iniciando MySQL..." -ForegroundColor Cyan
Push-Location $backend
try {
    & docker compose up -d
    if ($LASTEXITCODE -ne 0) { throw "No se pudo iniciar MySQL con Docker Compose." }
    $puertoDocker = (& docker compose port mysql 3306 | Select-Object -First 1)
    if ($puertoDocker -notmatch ":$PUERTO_MYSQL$") {
        throw "MySQL no usa el puerto $PUERTO_MYSQL. Cambia backend\docker-compose.yml a 127.0.0.1:${PUERTO_MYSQL}:3306 y ejecuta docker compose up -d."
    }
    $listo = $false
    for ($i = 0; $i -lt 60; $i++) {
        try {
            & docker compose exec -T mysql mysqladmin ping -h 127.0.0.1 --silent 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) { $listo = $true; break }
        } catch { }
        Start-Sleep -Seconds 2
    }
    if (-not $listo) { throw "MySQL no respondio dentro del contenedor." }
} finally {
    Pop-Location
}
Write-Host "MySQL listo en el puerto $PUERTO_MYSQL." -ForegroundColor Green

# Evitar arrancar sobre un servidor del laboratorio
if (Puerto-Ocupado $PUERTO_BACKEND) {
    throw "El puerto $PUERTO_BACKEND ya esta ocupado. No se cerro ningun proceso del laboratorio."
}
if (Puerto-Ocupado $PUERTO_FRONTEND) {
    throw "El puerto $PUERTO_FRONTEND ya esta ocupado. No se cerro ningun proceso del laboratorio."
}

# Ventana de Spring Boot, heredando JAVA_HOME, PATH y variables de BD
Write-Host "`n[4/5] Iniciando Spring Boot..." -ForegroundColor Cyan
$backendRunner = Join-Path $privado "ejecutar-backend.ps1"
$contenidoBackend = @'
$ErrorActionPreference = "Stop"
Set-Location '__BACKEND__'
Write-Host "HUERTO HOGAR - SPRING BOOT + MYSQL" -ForegroundColor Green
& '__MAVEN__' spring-boot:run
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR al iniciar Spring Boot." -ForegroundColor Red }
'@
$contenidoBackend = $contenidoBackend.Replace("__BACKEND__", $backend.Replace("'", "''"))
$contenidoBackend = $contenidoBackend.Replace("__MAVEN__", $mavenPath.Replace("'", "''"))
Set-Content -LiteralPath $backendRunner -Value $contenidoBackend -Encoding UTF8
Start-Process powershell.exe -ArgumentList ('-NoProfile -NoExit -ExecutionPolicy Bypass -File "' + $backendRunner + '"')

# Ventana de React, usando expresamente el npm descargado
Write-Host "`n[5/5] Iniciando React..." -ForegroundColor Cyan
$frontendRunner = Join-Path $privado "ejecutar-frontend.ps1"
$contenidoFrontend = @'
$ErrorActionPreference = "Stop"
Set-Location '__FRONTEND__'
Write-Host "HUERTO HOGAR - REACT" -ForegroundColor Green
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias del frontend..."
    & '__NPM__' install
    if ($LASTEXITCODE -ne 0) { throw "Fallo npm install." }
}
& '__NPM__' run dev -- --host 127.0.0.1 --port __PUERTO__ --strictPort
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR al iniciar React." -ForegroundColor Red }
'@
$contenidoFrontend = $contenidoFrontend.Replace("__FRONTEND__", $frontend.Replace("'", "''"))
$contenidoFrontend = $contenidoFrontend.Replace("__NPM__", $npmPath.Replace("'", "''"))
$contenidoFrontend = $contenidoFrontend.Replace("__PUERTO__", [string]$PUERTO_FRONTEND)
Set-Content -LiteralPath $frontendRunner -Value $contenidoFrontend -Encoding UTF8
Start-Process powershell.exe -ArgumentList ('-NoProfile -NoExit -ExecutionPolicy Bypass -File "' + $frontendRunner + '"')

# Esperar a que respondan los dos servicios
Write-Host "`nComprobando frontend y backend..." -ForegroundColor Cyan
$tiendaUrl = "http://127.0.0.1:$PUERTO_FRONTEND"
$apiUrl = "http://127.0.0.1:$PUERTO_BACKEND/api/v1/productos"
$swaggerUrl = "http://127.0.0.1:$PUERTO_BACKEND/swagger-ui.html"
$apiLista = $false
$reactListo = $false
for ($i = 0; $i -lt 90; $i++) {
    if (-not $apiLista) { $apiLista = Web-Disponible $apiUrl }
    if (-not $reactListo) { $reactListo = Web-Disponible $tiendaUrl }
    if ($apiLista -and $reactListo) { break }
    Start-Sleep -Seconds 2
}

if ($apiLista -and $reactListo) {
    Write-Host "`nHUERTO HOGAR INICIADO CORRECTAMENTE" -ForegroundColor Green
    Start-Process $tiendaUrl
} else {
    Write-Warning "No se confirmo el inicio completo. Revisa las ventanas de Spring Boot y React."
}
Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "          DIRECCIONES DEL PROYECTO" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Tienda:  $tiendaUrl"
Write-Host "API:     $apiUrl"
Write-Host "Swagger: $swaggerUrl"
Write-Host "MySQL:   localhost:$PUERTO_MYSQL"
