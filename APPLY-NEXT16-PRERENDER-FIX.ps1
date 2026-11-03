$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$routes = @(
  "change-password",
  "create-event",
  "dashboard",
  "edit-event",
  "edit-profile",
  "events",
  "login",
  "my-events",
  "my-joined-events",
  "profile",
  "register"
)

$existingRoutes = @($routes | Where-Object { Test-Path -LiteralPath (Join-Path $projectRoot "app\$_") })
if ($existingRoutes.Count -gt 0) {
  $parent = Split-Path -Parent $projectRoot
  $backupName = "ShebaConnect-route-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  $backupRoot = Join-Path $parent $backupName
  New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

  foreach ($route in $existingRoutes) {
    $source = Join-Path $projectRoot "app\$route"
    $destination = Join-Path $backupRoot $route
    Move-Item -LiteralPath $source -Destination $destination
  }

  Write-Host "Previous route folders backed up to: $backupRoot" -ForegroundColor Yellow
}

$required = @(
  "app\layout.tsx",
  "app\(main)\layout.tsx",
  "app\(main)\events\[id]\page.tsx",
  "app\(main)\events\[id]\EventDetailsClient.tsx",
  "components\site-shell.tsx"
)
$missing = @($required | Where-Object { -not (Test-Path -LiteralPath (Join-Path $projectRoot $_)) })
if ($missing.Count -gt 0) {
  throw "Patch files missing: $($missing -join ', '). Extract the ZIP into the ShebaConnect project root first."
}

Write-Host "Next.js 16 prerender patch applied. Original route folders are backed up outside the project." -ForegroundColor Green
Write-Host "Next: stop the dev server, remove .next, then run npm run build." -ForegroundColor Cyan
