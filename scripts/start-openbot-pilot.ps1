param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$nextLink = Get-Item -LiteralPath (Join-Path $repoRoot 'node_modules/next') -ErrorAction SilentlyContinue
if ($nextLink -and $nextLink.Target) {
  $nextTarget = @($nextLink.Target)[0]
  $marker = '\node_modules\.pnpm\'
  $markerIndex = $nextTarget.IndexOf($marker, [StringComparison]::OrdinalIgnoreCase)
  if ($markerIndex -gt 0) {
    $canonicalRoot = $nextTarget.Substring(0, $markerIndex)
    if ([string]::Equals([IO.Path]::GetFullPath($repoRoot).TrimEnd('\'), [IO.Path]::GetFullPath($canonicalRoot).TrimEnd('\'), [StringComparison]::OrdinalIgnoreCase)) {
      $repoRoot = $canonicalRoot
    }
  }
}
$pilotRoot = Join-Path ([IO.Path]::GetTempPath()) 'forevershining-openbot-pilot'
$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$nextPath = Join-Path $repoRoot 'node_modules/next/dist/bin/next'
$designerUrl = 'http://127.0.0.1:3104/traditional-engraved-headstone/inscriptions'

function Test-LocalPort([int]$port) {
  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $client.Connect('127.0.0.1', $port)
    return $true
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

if (Test-LocalPort 3104) { throw 'Port 3104 is already in use. Stop the existing service before starting the pilot.' }
if (-not $NoBrowser -and (Test-LocalPort 9222)) { throw 'Port 9222 is already in use. Close the existing debugging browser before starting the pilot.' }
if (-not (Test-Path -LiteralPath $nextPath)) { throw 'Project dependencies are missing. Install them before starting the pilot.' }
if (-not $NoBrowser -and -not (Test-Path -LiteralPath $chromePath)) { throw 'Google Chrome was not found at the expected location.' }

New-Item -ItemType Directory -Path $pilotRoot -Force | Out-Null
$nodePath = (Get-Command node -ErrorAction Stop).Source
$previousPilotFlag = $env:DESIGNER_MCP_PILOT
try {
  $env:DESIGNER_MCP_PILOT = '1'
  $server = Start-Process -FilePath $nodePath -ArgumentList @("`"$nextPath`"", 'dev', '--hostname', '127.0.0.1', '--port', '3104') -WorkingDirectory $repoRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $pilotRoot 'server.log') -RedirectStandardError (Join-Path $pilotRoot 'server-error.log')
} finally {
  $env:DESIGNER_MCP_PILOT = $previousPilotFlag
}

$deadline = [DateTime]::UtcNow.AddSeconds(120)
while (-not (Test-LocalPort 3104)) {
  if ($server.HasExited) { throw "The local designer exited. Check $pilotRoot/server-error.log." }
  if ([DateTime]::UtcNow -gt $deadline) { throw "The local designer did not start in time. Check $pilotRoot/server-error.log." }
  Start-Sleep -Milliseconds 500
}

Write-Output "Local designer: $designerUrl"
Write-Output "Local server process ID: $($server.Id)"
if (-not $NoBrowser) {
  $profilePath = Join-Path $pilotRoot 'chrome-profile'
  Start-Process -FilePath $chromePath -ArgumentList @('--remote-debugging-address=127.0.0.1', '--remote-debugging-port=9222', "--user-data-dir=`"$profilePath`"", '--no-first-run', '--no-default-browser-check', $designerUrl) -WindowStyle Normal
  $browserDeadline = [DateTime]::UtcNow.AddSeconds(20)
  while (-not (Test-LocalPort 9222)) {
    if ([DateTime]::UtcNow -gt $browserDeadline) { throw 'Chrome did not open the local debugging port. Close the pilot Chrome window and try again.' }
    Start-Sleep -Milliseconds 500
  }
  Write-Output 'A separate Chrome profile was opened for the pilot. Keep this window open while using OpenBot.'
}
