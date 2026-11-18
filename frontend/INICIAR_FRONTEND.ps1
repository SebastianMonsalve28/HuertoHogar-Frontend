$ErrorActionPreference="Stop"
Set-Location $PSScriptRoot
# Recupera las fotos/video reales si se inicia React sin INICIAR_TODO.bat.
if (-not (Test-Path (Join-Path $PSScriptRoot "public\video\video.mp4"))) {
  & (Join-Path $PSScriptRoot "..\RESTAURAR_RECURSOS_ORIGINALES.ps1")
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "Instala Node.js 20.19 o superior." }
if (-not (Test-Path "node_modules")) { npm install; if ($LASTEXITCODE -ne 0) { throw "Fallo npm install" } }
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
npm run dev
