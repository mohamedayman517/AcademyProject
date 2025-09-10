# Runs both backend (FastAPI) and frontend (Angular) with one command
# Usage (PowerShell):
#   powershell -ExecutionPolicy Bypass -File .\run_all.ps1

$ErrorActionPreference = 'Stop'

function Ensure-BackendVenv {
  $backendDir = Join-Path $PSScriptRoot 'backend'
  $venvPath = Join-Path $backendDir '.venv'
  $pythonExe = Join-Path $venvPath 'Scripts/python.exe'

  $needCreate = $false
  if (-not (Test-Path $pythonExe)) {
    $needCreate = $true
  } else {
    # Validate venv is functional (handles case when base Python was uninstalled)
    try {
      & $pythonExe -c "import sys; print('VENV_OK', sys.version)" *> $null
    } catch {
      Write-Host 'Existing virtual environment appears broken. Recreating...' -ForegroundColor DarkYellow
      try { Remove-Item -Recurse -Force $venvPath } catch {}
      $needCreate = $true
    }

    if (-not $needCreate) {
      # Additional validation: check pyvenv.cfg 'home' path exists
      $cfg = Join-Path $venvPath 'pyvenv.cfg'
      if (Test-Path $cfg) {
        try {
          $homeLine = (Get-Content $cfg | Where-Object { $_ -match '^home\s*=\s*(.+)$' } | Select-Object -First 1)
          if ($homeLine) {
            $homePath = $homeLine -replace '^home\s*=\s*',''
            if (-not (Test-Path $homePath)) {
              Write-Host "Base Python path referenced by venv is missing: $homePath" -ForegroundColor DarkYellow
              Write-Host 'Recreating virtual environment...' -ForegroundColor DarkYellow
              try { Remove-Item -Recurse -Force $venvPath } catch {}
              $needCreate = $true
            }
          }
        } catch {}
      }
    }
  }

  if ($needCreate) {
    Write-Host 'Creating virtual environment for backend...' -ForegroundColor Cyan
    Push-Location $backendDir
    try {
      $launcher = $null
      $launcherArgs = @()
      if (Get-Command py -ErrorAction SilentlyContinue) {
        try { & py -3 -V *> $null; $launcher = 'py'; $launcherArgs = @('-3') } catch {}
      }
      if (-not $launcher) {
        if (Get-Command python -ErrorAction SilentlyContinue) { $launcher = 'python'; $launcherArgs = @() }
        elseif (Get-Command python3 -ErrorAction SilentlyContinue) { $launcher = 'python3'; $launcherArgs = @() }
      }
      if (-not $launcher) {
        throw 'Python 3 is not installed or not in PATH. Please install Python 3.x and rerun.'
      }

      & $launcher @launcherArgs -m venv .venv
      if (-not (Test-Path $pythonExe)) { throw 'Failed to create virtual environment (.venv).' }
      & $pythonExe -m pip install --upgrade pip
      & $pythonExe -m pip install -r requirements.txt
    }
    finally {
      Pop-Location
    }
  } else {
    # Optionally ensure deps; keep fast for repeated runs
    Write-Host 'Backend virtual environment exists.' -ForegroundColor Green
  }
}

function Start-Backend {
  $backendDir = Join-Path $PSScriptRoot 'backend'
  $venvPath = Join-Path $backendDir '.venv'
  $pythonExe = Join-Path $venvPath 'Scripts/python.exe'

  if (-not (Test-Path $pythonExe)) {
    Write-Host 'Backend venv not found. Creating it now...' -ForegroundColor Cyan
    Ensure-BackendVenv
  }

  # Detect if port 8000 is in use; if so, switch to 8001
  $port = 8000
  try {
    $inUse = ($null -ne (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction Stop))
  } catch { $inUse = $false }
  if ($inUse) {
    Write-Host "Port 8000 is already in use. Switching backend to port 8001." -ForegroundColor DarkYellow
    $port = 8001
  }

  $uvicornCmd = "& `"$pythonExe`" -m uvicorn main:app --reload --host 0.0.0.0 --port $port"
  Write-Host ("Starting FastAPI backend on http://localhost:{0} ..." -f $port) -ForegroundColor Yellow
  # Launch a new PowerShell window that keeps running to show logs/errors
  Start-Process -FilePath "powershell" -ArgumentList @('-NoExit','-NoProfile','-Command', $uvicornCmd) -WorkingDirectory $backendDir -WindowStyle Normal
}

function Start-Frontend {
  $frontendDir = Join-Path $PSScriptRoot 'frontend/academy-angular'
  # Ensure Angular runs without prompts
  $env:NG_CLI_ANALYTICS = 'false'
  Write-Host 'Starting Angular frontend on http://localhost:4200 ...' -ForegroundColor Yellow
  Start-Process -FilePath 'npm' -ArgumentList 'start' -WorkingDirectory $frontendDir -WindowStyle Normal
}

try {
  Ensure-BackendVenv
  Start-Backend
  Start-Frontend
  Write-Host "Both servers are starting in separate windows:" -ForegroundColor Green
  Write-Host "  - Backend: http://localhost:8000" -ForegroundColor Green
  Write-Host "  - Frontend: http://localhost:4200" -ForegroundColor Green
}
catch {
  Write-Error $_
  exit 1
}
