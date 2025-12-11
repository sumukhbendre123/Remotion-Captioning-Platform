# Remotion Captioning Platform - Windows Setup Script
# Run this script in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Remotion Captioning Platform Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
    
    # Check if version is 18 or higher
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 18) {
        Write-Host "✗ Node.js version must be 18 or higher" -ForegroundColor Red
        Write-Host "Please download from: https://nodejs.org" -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
    Write-Host "Please install Node.js 18 or higher from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check npm installation
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: v$npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Dependencies..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Setup environment file
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✓ Created .env.local file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env.local and add your OPENAI_API_KEY" -ForegroundColor Yellow
    Write-Host ""
    
    $openEnv = Read-Host "Open .env.local file now? (Y/N)"
    if ($openEnv -eq "Y" -or $openEnv -eq "y") {
        notepad .env.local
    }
}
else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add your OPENAI_API_KEY to .env.local" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "- Quick Start: QUICKSTART.md" -ForegroundColor White
Write-Host "- Full Docs: README.md" -ForegroundColor White
Write-Host "- API Docs: API.md" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎬" -ForegroundColor Cyan
Write-Host ""
