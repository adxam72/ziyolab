$ErrorActionPreference='Stop'
$projectRoot=$PSScriptRoot
$runtimeNode=(Get-Command node).Source
$dbPort=Get-NetTCPConnection -LocalPort 54329 -State Listen -ErrorAction SilentlyContinue
if(-not $dbPort){Start-Process -FilePath $runtimeNode -ArgumentList @('node_modules/tsx/dist/cli.mjs','scripts/local-db.ts') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot '.data/db.log') -RedirectStandardError (Join-Path $projectRoot '.data/db-error.log') | Out-Null}
$appPort=Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if(-not $appPort){Start-Process -FilePath $runtimeNode -ArgumentList @('node_modules/next/dist/bin/next','start','--hostname','127.0.0.1') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot '.data/app.log') -RedirectStandardError (Join-Path $projectRoot '.data/app-error.log') | Out-Null}
Write-Output 'ZiyoLab: http://localhost:3000/kirish'
