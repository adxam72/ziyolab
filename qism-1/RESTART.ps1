$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
# Run in an Administrator PowerShell only when the previous local server
# was started by an Administrator. No API keys are printed by this script.
$listeners = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
foreach ($processId in ($listeners.OwningProcess | Select-Object -Unique)) {
  $appProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$processId"
  if (-not $appProcess -or $appProcess.CommandLine -notmatch 'node_modules[/\\]next[/\\]dist[/\\]bin[/\\]next.*start') {
    throw '3000 portidagi xizmat Next.js serveri emas. Avval uni tekshiring.'
  }
  Stop-Process -Id $processId -ErrorAction Stop
}
& npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build bajarilmadi; xato matnini tekshiring.' }
& (Join-Path $PSScriptRoot 'START.ps1')
