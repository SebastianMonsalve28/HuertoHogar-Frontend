$ErrorActionPreference = 'Continue'
$base = 'https://raw.githubusercontent.com/SebastianMonsalve28/tienda_HUERTO_HOGAR/sebastian/public'
$dest = Join-Path $PSScriptRoot 'frontend\public'
$files = @{
 'img/manzanas.jpg' = 135413
 'img/naranjas.jpg' = 55067
 'img/platanos.jpg' = 6586
 'img/zanahorias.jpg' = 20584
 'img/espinacas.jpg' = 11940
 'img/pimientos.jpg' = 17299
 'img/miel.jpg' = 304035
 'img/huerto.webp' = 170374
 'img/locales.jpg' = 839998
 'img/comersaludable.jpg' = 772955
 'video/video.mp4' = 20381034
}
$ok = 0
foreach($item in $files.GetEnumerator() | Sort-Object Name){
  $path = Join-Path $dest ($item.Key -replace '/', '\')
  $folder = Split-Path $path -Parent
  New-Item -Path $folder -ItemType Directory -Force | Out-Null
  if ((Test-Path $path) -and (Get-Item $path).Length -eq $item.Value){
    $ok++
    continue
  }
  $url = "$base/$($item.Key)"
  $temp = "$path.descarga"
  try {
    Write-Host "Recuperando original: $($item.Key)" -ForegroundColor Cyan
    Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 90 -OutFile $temp -ErrorAction Stop
    if ((Get-Item $temp).Length -ne $item.Value) {
      throw "Tamaño incorrecto: se recibieron $((Get-Item $temp).Length) bytes"
    }
    Move-Item -Path $temp -Destination $path -Force
    $ok++
  } catch {
    Write-Warning "No se pudo recuperar $($item.Key): $($_.Exception.Message)"
    if (Test-Path $temp) { Remove-Item $temp -Force }
  }
}
Write-Host "RECURSOS ORIGINALES: $ok de $($files.Count) recuperados/verificados." -ForegroundColor Green
if ($ok -ne $files.Count){
 Write-Host 'AVISO: Algunos recursos siguen provisionales y el video puede faltar. Con internet, vuelve a ejecutar RESTAURAR_RECURSOS_ORIGINALES.ps1.' -ForegroundColor Yellow
}
