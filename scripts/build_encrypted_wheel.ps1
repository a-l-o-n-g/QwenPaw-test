$ErrorActionPreference = "Stop"
$RepoRoot = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $RepoRoot

Write-Host "=================================================="
Write-Host "1. Installing encryption and build dependencies..."
Write-Host "=================================================="
python -m pip install pyarmor build

$ConsoleDir = Join-Path $RepoRoot "console"
$ConsoleDest = Join-Path $RepoRoot "src\qwenpaw\console"

Write-Host "=================================================="
Write-Host "2. Building frontend Console..."
Write-Host "=================================================="
if (Test-Path $ConsoleDir) {
    Push-Location $ConsoleDir
    npm ci
    npm run build
    Pop-Location
    if (Test-Path $ConsoleDest) { Remove-Item -Path "$ConsoleDest\*" -Recurse -Force }
    New-Item -ItemType Directory -Force -Path $ConsoleDest | Out-Null
    Copy-Item -Path "$ConsoleDir\dist\*" -Destination $ConsoleDest -Recurse -Force
} else {
    Write-Host "Warning: Console directory not found at $ConsoleDir" -ForegroundColor Yellow
}

$BuildDir = Join-Path $RepoRoot "build_encrypted"
Write-Host "=================================================="
Write-Host "3. Preparing isolated build workspace ($BuildDir)..."
Write-Host "=================================================="
if (Test-Path $BuildDir) { Remove-Item -Path $BuildDir -Recurse -Force }
# Clear old distributions
if (Test-Path "dist") { Remove-Item -Path "dist\*" -Recurse -Force }
New-Item -ItemType Directory -Force -Path $BuildDir | Out-Null

Copy-Item -Path "src" -Destination $BuildDir -Recurse
$FilesToCopy = @("pyproject.toml", "README.md", "README_zh.md", "LICENSE")
foreach ($file in $FilesToCopy) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $BuildDir
    }
}

Write-Host "=================================================="
Write-Host "4. Encrypting Python code (Tools)..."
Write-Host "=================================================="
Set-Location $BuildDir

# Encrypt the tools directory, excluding browser_control.py due to PyArmor trial limits
pyarmor gen -O obf_dist -r --exclude "*/browser_control.py" src/qwenpaw/agents/tools/

Write-Host "Copying obfuscated files from obf_dist\tools\ to src\qwenpaw\agents\tools\"
if (Test-Path "obf_dist\tools\") {
    Copy-Item -Path "obf_dist\tools\*" -Destination "src\qwenpaw\agents\tools\" -Recurse -Force
}

$RuntimeFiles = Get-ChildItem -Path "obf_dist\pyarmor_runtime_*" -ErrorAction SilentlyContinue
if ($RuntimeFiles) {
    Move-Item -Path "obf_dist\pyarmor_runtime_*" -Destination "src\" -Force
}

Write-Host "=================================================="
Write-Host "5. Building the final Encrypted Wheel package..."
Write-Host "=================================================="
python -m build --outdir "$RepoRoot\dist" .

Write-Host "=================================================="
Write-Host "Success! The encrypted Wheel is located in $RepoRoot\dist\"
Write-Host "You can now run .\scripts\pack\build_win.ps1"
Write-Host "=================================================="
