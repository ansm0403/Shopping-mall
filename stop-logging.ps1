# Stop PowerShell Transcript and convert to UTF-8

Stop-Transcript

# Get file paths from environment
$transcriptFile = $env:TRANSCRIPT_FILE
$utf8File = $env:UTF8_FILE

if ($transcriptFile -and $utf8File -and (Test-Path $transcriptFile)) {
    # Read transcript as UTF-16 and save as UTF-8
    $content = Get-Content $transcriptFile -Encoding Unicode
    $content | Out-File $utf8File -Encoding UTF8

    Write-Host "======================================"
    Write-Host "Logging stopped"
    Write-Host "UTF-8 file saved: $utf8File"
    Write-Host "Original file: $transcriptFile"
    Write-Host "======================================"

    # Clean up temp file (optional)
    # Remove-Item $transcriptFile
} else {
    Write-Host "Logging stopped (no conversion needed)"
}

# Clear environment variables
Remove-Item Env:\TRANSCRIPT_FILE -ErrorAction SilentlyContinue
Remove-Item Env:\UTF8_FILE -ErrorAction SilentlyContinue
