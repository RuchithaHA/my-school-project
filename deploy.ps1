# Read .env file
Get-Content .env | ForEach-Object {
  if ($_ -match '^([^#][^=]*)=(.+)$') {
    [System.Environment]::SetEnvironmentVariable(
      $matches[1].Trim(),
      $matches[2].Trim()
    )
  }
}

$MYSQL_HOST     = $env:MYSQL_HOST
$MYSQL_USER     = $env:MYSQL_USER
$MYSQL_PASSWORD = $env:MYSQL_PASSWORD
$MYSQL_DATABASE = $env:MYSQL_DATABASE
$MYSQL_PORT     = $env:MYSQL_PORT

Write-Host "Deploying backend to Vercel..."

# Go to backend folder
Set-Location backend

# Create vercel.json for Python FastAPI
$vercelConfig = @{
  version = 2
  builds = @(
    @{
      src = "app/main.py"
      use = "@vercel/python"
    }
  )
  routes = @(
    @{
      src = "/(.*)"
      dest = "app/main.py"
    }
  )
  env = @{
    MYSQL_HOST     = $MYSQL_HOST
    MYSQL_USER     = $MYSQL_USER
    MYSQL_PASSWORD = $MYSQL_PASSWORD
    MYSQL_DATABASE = $MYSQL_DATABASE
    MYSQL_PORT     = $MYSQL_PORT
  }
} | ConvertTo-Json -Depth 10

Set-Content -Path "vercel.json" -Value $vercelConfig
Write-Host "Created backend vercel.json"

# Deploy backend
$backendOutput = vercel --prod --yes 2>&1
Write-Host $backendOutput

# Get backend URL from output
$backendUrl = ($backendOutput | Select-String "https://").Matches.Value | Select-Object -Last 1
Write-Host "Backend URL: $backendUrl"

Set-Location ..

# Update frontend with backend URL
Set-Content -Path "frontend/.env.production" -Value "VITE_API_URL=$backendUrl"
Write-Host "Updated frontend with backend URL"

# Build frontend
Write-Host "Building frontend..."
Set-Location frontend
npm run build

# Deploy frontend to Vercel
Write-Host "Deploying frontend to Vercel..."
$frontendOutput = vercel --prod --yes 2>&1
Write-Host $frontendOutput

$frontendUrl = ($frontendOutput | Select-String "https://").Matches.Value | Select-Object -Last 1
Write-Host "Frontend URL: $frontendUrl"

Set-Location ..

Write-Host ""
Write-Host "=============================="
Write-Host "DEPLOYMENT COMPLETE"
Write-Host "Backend:  $backendUrl"
Write-Host "Frontend: $frontendUrl"
Write-Host "=============================="