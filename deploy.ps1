param(
  [string]$BackendName = "greenwood-backend",
  [string]$FrontendName = "greenwood-frontend"
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false
$VercelCli = "vercel"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Load-DotEnv {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    throw ".env file not found at $Path"
  }

  Get-Content $Path | ForEach-Object {
    if ($_ -match '^\s*#') { return }
    if ($_ -match '^\s*$') { return }
    if ($_ -match '^([^=]+)=(.*)$') {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim()
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

function Require-Env {
  param([string]$Name)
  $val = [Environment]::GetEnvironmentVariable($Name, "Process")
  if ([string]::IsNullOrWhiteSpace($val)) {
    throw "Missing required env var: $Name"
  }
  return $val
}

function Set-VercelEnv {
  param(
    [string]$Name,
    [string]$Value
  )
  $tmp = New-TemporaryFile
  try {
    Set-Content -Path $tmp -Value $Value -NoNewline
    cmd /c "type `"$tmp`" | $VercelCli env add $Name production" | Out-Host
  } finally {
    Remove-Item $tmp -ErrorAction SilentlyContinue
  }
}

Load-DotEnv ".env"

$MYSQL_HOST = Require-Env "MYSQL_HOST"
$MYSQL_USER = Require-Env "MYSQL_USER"
$MYSQL_PASSWORD = Require-Env "MYSQL_PASSWORD"
$MYSQL_DATABASE = Require-Env "MYSQL_DATABASE"
$MYSQL_PORT = Require-Env "MYSQL_PORT"
$AZURE_OPENAI_API_KEY = Require-Env "AZURE_OPENAI_API_KEY"
$AZURE_OPENAI_ENDPOINT = Require-Env "AZURE_OPENAI_ENDPOINT"
$AZURE_OPENAI_DEPLOYMENT = Require-Env "AZURE_OPENAI_DEPLOYMENT"
$AZURE_OPENAI_API_VERSION = Require-Env "AZURE_OPENAI_API_VERSION"

Write-Host "Step 1: Ensure Vercel CLI installed..."
npm install -g vercel | Out-Host

Write-Host "Step 2: Vercel login (if required)..."
cmd /c "$VercelCli login" | Out-Host

Write-Host "Step 3: Push current repo state..."
git init | Out-Host
git add . | Out-Host
git commit -m "Greenwood International School - Full Stack" | Out-Host
git branch -M main | Out-Host
git push -u origin main | Out-Host

Write-Host "Step 4: Deploy backend..."
Set-Location "$root\backend"
Write-Host "Link backend project..."
cmd /c "$VercelCli link --yes" | Out-Host
$backendOutput = cmd /c "$VercelCli --prod --yes" 2>&1
$backendOutput | Out-Host
$backendUrl = ($backendOutput | Select-String "https://[a-zA-Z0-9\.\-]+").Matches.Value | Select-Object -Last 1
if ([string]::IsNullOrWhiteSpace($backendUrl)) {
  throw "Could not detect backend URL from Vercel output."
}
Write-Host "Detected backend URL: $backendUrl"

Write-Host "Step 5: Add backend environment variables..."
Set-VercelEnv "MYSQL_HOST" $MYSQL_HOST
Set-VercelEnv "MYSQL_USER" $MYSQL_USER
Set-VercelEnv "MYSQL_PASSWORD" $MYSQL_PASSWORD
Set-VercelEnv "MYSQL_DATABASE" $MYSQL_DATABASE
Set-VercelEnv "MYSQL_PORT" $MYSQL_PORT
Set-VercelEnv "AZURE_OPENAI_API_KEY" $AZURE_OPENAI_API_KEY
Set-VercelEnv "AZURE_OPENAI_ENDPOINT" $AZURE_OPENAI_ENDPOINT
Set-VercelEnv "AZURE_OPENAI_DEPLOYMENT" $AZURE_OPENAI_DEPLOYMENT
Set-VercelEnv "AZURE_OPENAI_API_VERSION" $AZURE_OPENAI_API_VERSION

Write-Host "Step 6: Redeploy backend with env vars..."
$backendOutput2 = cmd /c "$VercelCli --prod --yes" 2>&1
$backendOutput2 | Out-Host
$backendUrl2 = ($backendOutput2 | Select-String "https://[a-zA-Z0-9\.\-]+").Matches.Value | Select-Object -Last 1
if (-not [string]::IsNullOrWhiteSpace($backendUrl2)) {
  $backendUrl = $backendUrl2
}
Write-Host "Backend URL in use: $backendUrl"

Write-Host "Step 7: Update frontend production API URL..."
Set-Location "$root\frontend"
Set-Content -Path ".env.production" -Value "VITE_API_URL=$backendUrl"
Get-Content ".env.production" | Out-Host

Write-Host "Step 8: Deploy frontend..."
Write-Host "Link frontend project..."
cmd /c "$VercelCli link --yes" | Out-Host
$frontendOutput = cmd /c "$VercelCli --prod --yes" 2>&1
$frontendOutput | Out-Host
$frontendUrl = ($frontendOutput | Select-String "https://[a-zA-Z0-9\.\-]+").Matches.Value | Select-Object -Last 1
if ([string]::IsNullOrWhiteSpace($frontendUrl)) {
  throw "Could not detect frontend URL from Vercel output."
}
Write-Host "Detected frontend URL: $frontendUrl"

Write-Host "Step 9: Add FRONTEND_URL to backend env..."
Set-Location "$root\backend"
Set-VercelEnv "FRONTEND_URL" $frontendUrl

Write-Host "Step 10: Final redeploy backend..."
cmd /c "$VercelCli --prod --yes" | Out-Host

Write-Host ""
Write-Host "════════════════════════════════════"
Write-Host "✅ GREENWOOD SCHOOL - DEPLOYMENT COMPLETE"
Write-Host "════════════════════════════════════"
Write-Host "🌐 Frontend URL  : $frontendUrl"
Write-Host "⚙️  Backend URL   : $backendUrl"
Write-Host "📚 API Docs URL  : $backendUrl/docs"
Write-Host "🗄️  Database      : Railway MySQL"
Write-Host "════════════════════════════════════"