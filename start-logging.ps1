# Start PowerShell Transcript Logging with UTF-8 conversion

# Create logs directory
if (!(Test-Path -Path "./logs")) {
    New-Item -ItemType Directory -Path "./logs" | Out-Null
}

# Date variables
$today = Get-Date -Format "yyyy-MM-dd-HHmmss"
$transcriptFile = "./logs/transcript-$today.log"
$utf8File = "./logs/session-$today.log"

# Start transcript
Start-Transcript -Path $transcriptFile -Append

Write-Host "======================================"
Write-Host "Logging started: $utf8File"
Write-Host "All terminal output will be saved"
Write-Host "To stop: ./stop-logging.ps1"
Write-Host "======================================"
Write-Host ""

# Save file paths to temp for stop script
$env:TRANSCRIPT_FILE = $transcriptFile
$env:UTF8_FILE = $utf8File
