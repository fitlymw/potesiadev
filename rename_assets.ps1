# PowerShell Script to Rename Asset Files with Spaces
# Run this script in the VS Code terminal to fix asset filenames

Write-Host "Renaming asset files with spaces to snake_case..." -ForegroundColor Cyan

$bgSongPath = "public/bg song"

# Rename files in bg song folder
Write-Host "`n=== Renaming files in bg song/ ===" -ForegroundColor Yellow

# Array of renames
$renames = @(
    @{Old="slice 2.wav"; New="slice_2.wav"},
    @{Old="slice 3.wav"; New="slice_3.wav"},
    @{Old="slice 4.wav"; New="slice_4.wav"},
    @{Old="winner sound.wav"; New="winner_sound.wav"}
)

foreach ($rename in $renames) {
    $oldPath = Join-Path $bgSongPath $rename.Old
    $newPath = Join-Path $bgSongPath $rename.New
    
    if (Test-Path $oldPath) {
        if (-not (Test-Path $newPath)) {
            Rename-Item -Path $oldPath -NewName $rename.New -Force
            Write-Host "Renamed: $($rename.Old) -> $($rename.New)" -ForegroundColor Green
        } else {
            Write-Host "File already exists: $($rename.New)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "File not found: $($rename.Old)" -ForegroundColor Yellow
    }
}

# Check for any remaining files with spaces
Write-Host "`n=== Files still with spaces in bg song/ ===" -ForegroundColor Yellow
Get-ChildItem -Path $bgSongPath -File | Where-Object { $_.Name -match " " } | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Red
}

Write-Host "`nDone! Now run 'npm run build' to rebuild the project." -ForegroundColor Cyan
