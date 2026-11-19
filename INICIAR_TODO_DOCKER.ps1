
$ErrorActionPreference = "Stop"

$raiz = $PSScriptRoot
$backend = Join-Path $raiz "backend"
$frontend = Join-Path $raiz "frontend"
$privado = Join-Path $backend ".local"

function Estado-Docker {
    try {
        & docker info --format '{{.ServerVersion}}' 2>$null | Out-Null
        return ($LASTEXITCODE -eq 0)
    }
    catch {
        return $false
    }
}

function Disponible-Web($url) {
    try {
        $respuesta = Invoke-WebRequest `
            -Uri $url `
            -UseBasicParsing `
            -TimeoutSec 2 `
            -ErrorAction Stop

        return (
            $respuesta.StatusCode -ge 200 -and
            $respuesta.StatusCode -lt 300
        )
    }
    catch {
        return $false
    }
}

function Leer-Secreto($ruta) {
    if (-not (Test-Path $ruta)) {
        return $null
    }

    try {
        $contenido = (Get-Content `
            -LiteralPath $ruta `
            -Raw `
            -ErrorAction Stop).Trim()

        if ([string]::IsNullOrWhiteSpace($contenido)) {
            throw "Archivo cifrado vacio."
        }

        return ConvertTo-SecureString `
            -String $contenido `
            -ErrorAction Stop
    }
    catch {
        Write-Warning "No se pudo recuperar el secreto cifrado."

        $respaldo = "$ruta.bak"

        Copy-Item `
            -LiteralPath $ruta `
            -Destination $respaldo `
            -Force

        Remove-Item -LiteralPath $ruta -Force

        Write-Host "Se guardo una copia de seguridad." `
            -ForegroundColor Yellow

        return $null
    }
}

function Guardar-Secreto($ruta, $secreto) {
    $cifrado = ConvertFrom-SecureString `
        -SecureString $secreto

    Set-Content `
        -LiteralPath $ruta `
        -Value $cifrado `
        -Encoding ASCII
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "     HUERTO HOGAR - INICIO COMPLETO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 1. Comprobar estructura

if (-not (Test-Path $backend)) {
    throw "No se encontro la carpeta backend."
}

if (-not (Test-Path $frontend)) {
    throw "No se encontro la carpeta frontend."
}

New-Item `
    -ItemType Directory `
    -Force `
    -Path $privado | Out-Null

# 2. Comprobar Docker Desktop

Write-Host "`n[1/6] Comprobando Docker..." -ForegroundColor Cyan

if (-not (Get-Command docker.exe -ErrorAction SilentlyContinue)) {
    throw "Docker Desktop no esta instalado o no esta en PATH."
}

if (-not (Estado-Docker)) {
    Write-Host "Iniciando Docker Desktop..."

    $opciones = @(
        "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe"
    )

    $dockerApp = $opciones |
        Where-Object { Test-Path $_ } |
        Select-Object -First 1

    if ($dockerApp) {
        Start-Process -FilePath $dockerApp
    }
    else {
        throw "Abre Docker Desktop manualmente y vuelve a ejecutar."
    }

    $listo = $false

    for ($i = 0; $i -lt 90; $i++) {
        if (Estado-Docker) {
            $listo = $true
            break
        }

        Start-Sleep -Seconds 2
    }

    if (-not $listo) {
        throw "El motor de Docker no pudo iniciarse."
    }
}

Write-Host "Docker funcionando." -ForegroundColor Green

# 3. Leer configuracion privada de MySQL

Write-Host "`n[2/6] Revisando MySQL..." -ForegroundColor Cyan

$archivoEnv = Join-Path $backend ".env"

if (-not (Test-Path $archivoEnv)) {
    throw "Falta backend\.env. Configura las contrasenas de MySQL."
}

$config = @{}

Get-Content $archivoEnv | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') {
        $clave = $matches[1]
        $valor = $matches[2].Trim()

        if ($valor.Length -ge 2) {
            if (
                ($valor.StartsWith('"') -and $valor.EndsWith('"')) -or
                ($valor.StartsWith("'") -and $valor.EndsWith("'"))
            ) {
                $valor = $valor.Substring(1, $valor.Length - 2)
            }
        }

        $config[$clave] = $valor
    }
}

if (
    [string]::IsNullOrWhiteSpace($config["DB_PASSWORD"]) -or
    [string]::IsNullOrWhiteSpace($config["DB_ROOT_PASSWORD"])
) {
    throw "Configura DB_PASSWORD y DB_ROOT_PASSWORD en backend\.env."
}

# 4. Iniciar MySQL desde Docker

Push-Location $backend

try {
    Write-Host "`n[3/6] Encendiendo MySQL..." -ForegroundColor Cyan

    & docker compose up -d

    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose no pudo iniciar MySQL."
    }

    $mysqlListo = $false

    for ($i = 0; $i -lt 90; $i++) {
        try {
            & docker compose exec -T mysql `
                mysqladmin ping -h 127.0.0.1 --silent `
                2>$null | Out-Null

            if ($LASTEXITCODE -eq 0) {
                $mysqlListo = $true
                break
            }
        }
        catch {
            # MySQL aun se esta iniciando.
        }

        Start-Sleep -Seconds 2
    }

    if (-not $mysqlListo) {
        throw "MySQL no respondio. Revisa Docker Desktop."
    }

    Write-Host "MySQL iniciado." -ForegroundColor Green
}
finally {
    Pop-Location
}

# 5. Comprobar Java, Node y Maven

Write-Host "`n[4/6] Revisando herramientas..." -ForegroundColor Cyan

if (-not (Get-Command java.exe -ErrorAction SilentlyContinue)) {
    throw "No se encontro Java JDK."
}

if (-not (Get-Command javac.exe -ErrorAction SilentlyContinue)) {
    throw "No se encontro javac. Necesitas Java JDK."
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    throw "No se encontro Node.js o npm."
}

$javac = (Get-Command javac.exe).Source

if (
    -not $env:JAVA_HOME -or
    -not (Test-Path (Join-Path $env:JAVA_HOME "bin\javac.exe"))
) {
    $env:JAVA_HOME = Split-Path `
        (Split-Path $javac -Parent) -Parent
}

$mvn = Get-Command mvn.cmd -ErrorAction SilentlyContinue
$mavenPath = $null

if ($mvn) {
    $mavenPath = $mvn.Source
}

if (-not $mavenPath) {
    $mavenLocal = Join-Path $backend `
        ".local\herramientas\apache-maven-3.10.1\bin\mvn.cmd"

    if (Test-Path $mavenLocal) {
        $mavenPath = $mavenLocal
    }
}

if (-not $mavenPath) {
    Write-Host "Buscando Maven en Descargas..."

    $encontrado = Get-ChildItem `
        -Path "$env:USERPROFILE\Downloads" `
        -Filter mvn.cmd `
        -File `
        -Recurse `
        -ErrorAction SilentlyContinue |
        Select-Object -First 1

    if ($encontrado) {
        $mavenPath = $encontrado.FullName
    }
}

if (-not $mavenPath) {
    throw "No se encontro Maven. Comprueba su instalacion."
}

Write-Host "Java, Node y Maven disponibles." -ForegroundColor Green

# 6. Configurar Spring Boot para MySQL

$env:DB_URL = "jdbc:mysql://127.0.0.1:3306/huerto_hogar?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Santiago"

$env:DB_USER = "huerto"
$env:DB_PASSWORD = $config["DB_PASSWORD"]

$env:APP_ADMIN_EMAIL = "admin@duoc.cl"

$env:FRONTEND_ORIGIN = "http://127.0.0.1:5173"
$env:COOKIE_SECURE = "false"

Remove-Item `
    Env:SPRING_PROFILES_ACTIVE `
    -ErrorAction SilentlyContinue

# 7. Recuperar contraseña del administrador

$adminFile = Join-Path $privado "admin-password.dpapi"

$claveAdmin = Leer-Secreto $adminFile

if ($null -eq $claveAdmin) {
    Write-Host "`nConfiguracion del administrador." `
        -ForegroundColor Cyan

    $claveAdmin = Read-Host `
        "Contrasena de administrador (minimo 8 caracteres)" `
        -AsSecureString

    $textoAdmin = [System.Net.NetworkCredential]::new(
        "",
        $claveAdmin
    ).Password

    if ($textoAdmin.Length -lt 8) {
        throw "La contrasena debe tener al menos 8 caracteres."
    }

    Guardar-Secreto $adminFile $claveAdmin
}

$env:APP_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new(
    "",
    $claveAdmin
).Password

# La contraseña anterior de un administrador ya registrado
# no se modifica al volver a iniciar Spring Boot.

# 8. Recuperar o generar el secreto JWT

$jwtFile = Join-Path $privado "jwt-secret.dpapi"

$jwtSeguro = Leer-Secreto $jwtFile

if ($null -eq $jwtSeguro) {
    $bytes = New-Object byte[] 48

    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()

    try {
        $rng.GetBytes($bytes)
    }
    finally {
        $rng.Dispose()
    }

    $jwtTexto = [Convert]::ToBase64String($bytes)

    $jwtSeguro = ConvertTo-SecureString `
        -String $jwtTexto `
        -AsPlainText `
        -Force

    Guardar-Secreto $jwtFile $jwtSeguro
}

$env:JWT_SECRET = [System.Net.NetworkCredential]::new(
    "",
    $jwtSeguro
).Password

# 9. Preparar Spring Boot

Write-Host "`n[5/6] Encendiendo Spring Boot..." -ForegroundColor Cyan

$backendRunner = Join-Path $privado "ejecutar-backend.ps1"

$contenidoBackend = @'
$ErrorActionPreference = "Stop"

Set-Location "__BACKEND__"

Write-Host "HUERTO HOGAR - SPRING BOOT + MYSQL" -ForegroundColor Green

& "__MAVEN__" spring-boot:run

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al iniciar Spring Boot." -ForegroundColor Red
}
'@

$contenidoBackend = $contenidoBackend.Replace(
    "__BACKEND__",
    $backend
)

$contenidoBackend = $contenidoBackend.Replace(
    "__MAVEN__",
    $mavenPath
)

Set-Content `
    -Path $backendRunner `
    -Value $contenidoBackend `
    -Encoding UTF8

Start-Process powershell.exe -ArgumentList (
    '-NoProfile -NoExit -ExecutionPolicy Bypass -File "' +
    $backendRunner + '"'
)

# 10. Preparar React

Write-Host "`n[6/6] Encendiendo React..." -ForegroundColor Cyan

$frontendRunner = Join-Path $privado "ejecutar-frontend.ps1"

$contenidoFrontend = @'
$ErrorActionPreference = "Stop"

Set-Location "__FRONTEND__"

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias del frontend..."

    & npm.cmd install

    if ($LASTEXITCODE -ne 0) {
        throw "Fallo npm install."
    }
}

Write-Host "HUERTO HOGAR - REACT" -ForegroundColor Green

& npm.cmd run dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al iniciar React." -ForegroundColor Red
}
'@

$contenidoFrontend = $contenidoFrontend.Replace(
    "__FRONTEND__",
    $frontend
)

Set-Content `
    -Path $frontendRunner `
    -Value $contenidoFrontend `
    -Encoding UTF8

Start-Process powershell.exe -ArgumentList (
    '-NoProfile -NoExit -ExecutionPolicy Bypass -File "' +
    $frontendRunner + '"'
)

# 11. Comprobar servidores

Write-Host "`nComprobando frontend y backend..." -ForegroundColor Cyan

$apiLista = $false
$reactListo = $false

for ($i = 0; $i -lt 90; $i++) {
    if (-not $apiLista) {
        $apiLista = Disponible-Web `
            "http://127.0.0.1:8080/api/v1/productos"
    }

    if (-not $reactListo) {
        $reactListo = Disponible-Web `
            "http://127.0.0.1:5173"
    }

    if ($apiLista -and $reactListo) {
        break
    }

    Start-Sleep -Seconds 2
}

if ($apiLista -and $reactListo) {
    Write-Host "`nHUERTO HOGAR INICIADO CORRECTAMENTE" `
        -ForegroundColor Green

    Start-Process "http://127.0.0.1:5173"
}
else {
    Write-Warning "No se confirmo el inicio completo."

    Write-Host "Revisa las ventanas de Spring Boot y React." `
        -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "       DIRECCIONES DEL PROYECTO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "Tienda:  http://127.0.0.1:5173"
Write-Host "API:     http://127.0.0.1:8080/api/v1/productos"
Write-Host "Swagger: http://127.0.0.1:8080/swagger-ui.html"
Write-Host "MySQL:   Docker Desktop, puerto 3306"
