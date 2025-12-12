# Script to remove exposed API keys from all files

$files = @(
    "RENDER_FIX_OPENAI.md",
    "VERCEL_DEPLOYMENT.md",
    "FIX_OPENAI_DEPLOYMENT.md"
)

$oldKey = "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"
$placeholder = "YOUR-OPENAI-API-KEY-HERE"

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Cleaning $file..."
        (Get-Content $file -Raw) -replace [regex]::Escape($oldKey), $placeholder | Set-Content $file -NoNewline
    }
}

Write-Host "Done! All API keys removed."
