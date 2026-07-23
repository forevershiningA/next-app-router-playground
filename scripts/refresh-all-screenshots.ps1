param(
  [string]$BaseUrl = "http://localhost:3000",
  [int]$Width = 1280,
  [int]$Height = 960,
  [int]$RenderWait = 2000,
  [int]$Timeout = 60000,
  [int]$Concurrency = 3,
  [int]$ChunkSize = 200,
  [int]$Total = 3092,
  [switch]$NoThumbnails
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$logDir = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logDir "refresh-screenshots-$stamp.log"
$env:BASE_URL = $BaseUrl

function Write-Log {
  param([string]$Message)
  $line = "$(Get-Date -Format "yyyy-MM-dd HH:mm:ss") $Message"
  Add-Content -Path $logPath -Value $line
  Write-Output $line
}

Write-Log "Starting screenshot refresh"
Write-Log "BaseUrl=$BaseUrl Width=$Width Height=$Height RenderWait=$RenderWait Timeout=$Timeout Concurrency=$Concurrency ChunkSize=$ChunkSize Total=$Total"

for ($offset = 0; $offset -lt $Total; $offset += $ChunkSize) {
  $remaining = $Total - $offset
  $limit = [Math]::Min($ChunkSize, $remaining)
  Write-Log "Running screenshot chunk offset=$offset limit=$limit"

  & node scripts\batch-screenshot.js `
    --offset=$offset `
    --limit=$limit `
    --width=$Width `
    --height=$Height `
    --render-wait=$RenderWait `
    --timeout=$Timeout `
    --concurrency=$Concurrency 2>&1 |
    ForEach-Object { Add-Content -Path $logPath -Value $_; Write-Output $_ }

  if ($LASTEXITCODE -ne 0) {
    Write-Log "Screenshot chunk failed at offset=$offset with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
  }
}

if ($NoThumbnails) {
  Write-Log "Screenshot refresh completed; thumbnail refresh skipped"
  exit 0
}

Write-Log "Screenshot refresh completed; regenerating thumbnails"
& node scripts\generate-png-thumbnails.js 2>&1 |
  ForEach-Object { Add-Content -Path $logPath -Value $_; Write-Output $_ }

if ($LASTEXITCODE -ne 0) {
  Write-Log "Thumbnail refresh failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Log "Refresh completed successfully"
