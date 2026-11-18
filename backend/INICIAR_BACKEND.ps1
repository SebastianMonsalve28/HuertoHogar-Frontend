$ErrorActionPreference="Stop"
Set-Location $PSScriptRoot
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) { throw "Instala Maven y Java JDK 17 o superior; verifica mvn -v." }
Write-Host "Configuracion LOCAL de Huerto Hogar - no se guardaran contrasenas en archivos."
$u = Read-Host "Usuario de MySQL (Enter para root)"
if ([string]::IsNullOrWhiteSpace($u)) { $u = "root" }
$pass = Read-Host "Contrasena de MySQL" -AsSecureString
$admin = Read-Host "Contrasena para crear el administrador (minimo 8 caracteres; si ya existe en BD no se cambia)" -AsSecureString
$env:DB_USER = $u
$env:DB_PASSWORD = [System.Net.NetworkCredential]::new('', $pass).Password
$env:APP_ADMIN_EMAIL = "admin@duoc.cl"
$env:APP_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $admin).Password
# Para la demo local la clave cambia cuando se reinicia el proceso; las sesiones se revalidan.
$random = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Fill($random)
$env:JWT_SECRET = [Convert]::ToBase64String($random)
$env:FRONTEND_ORIGIN = 'http://127.0.0.1:5173'
$env:COOKIE_SECURE = 'false'
if ($env:APP_ADMIN_PASSWORD.Length -lt 8) { throw "APP_ADMIN_PASSWORD debe tener minimo 8 caracteres." }
mvn spring-boot:run
