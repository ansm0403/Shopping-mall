# Convert existing log files from UTF-16 to UTF-8

$logsDir = "./logs"

if (!(Test-Path $logsDir)) {
    Write-Host "No logs directory found"
    exit
}

# Find all .log files
$logFiles = Get-ChildItem -Path $logsDir -Filter "*.log"

if ($logFiles.Count -eq 0) {
    Write-Host "No log files found in $logsDir"
    exit
}

Write-Host "Converting log files to UTF-8..."
Write-Host "======================================"

foreach ($file in $logFiles) {
    try {
        # Try to read as UTF-16
        $content = Get-Content $file.FullName -Encoding Unicode -ErrorAction Stop

        # Create backup
        $backupFile = "$($file.FullName).bak"
        Copy-Item $file.FullName $backupFile

        # Save as UTF-8
        $content | Out-File $file.FullName -Encoding UTF8 -Force

        Write-Host "[OK] $($file.Name) - converted and backed up"
    } catch {
        Write-Host "[SKIP] $($file.Name) - already UTF-8 or different encoding"
    }
}

Write-Host "======================================"
Write-Host "Conversion complete!"
Write-Host "Backup files saved with .bak extension"
