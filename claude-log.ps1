# Claude Chat Logger
# UTF-8 Encoding

# Create logs directory
if (!(Test-Path -Path "./logs")) {
    New-Item -ItemType Directory -Path "./logs" | Out-Null
}

# Create zipped directory
if (!(Test-Path -Path "./logs/zipped")) {
    New-Item -ItemType Directory -Path "./logs/zipped" | Out-Null
}

# Date variables
$today = Get-Date -Format "yyyy-MM-dd"
$logFile = "./logs/$today.log"
$zipFile = "./logs/zipped/$today.zip"

# Function: Split large log files
function Split-LargeLogFile {
    param([string]$filePath)

    $maxSize = 10MB
    $fileInfo = Get-Item $filePath

    if ($fileInfo.Length -gt $maxSize) {
        Write-Host "Log file exceeds 10MB, splitting..."

        $bytes = Get-Content $filePath -Raw -Encoding UTF8
        $byteArray = [System.Text.Encoding]::UTF8.GetBytes($bytes)

        $part = 1
        $offset = 0
        $partSize = 10MB

        while ($offset -lt $byteArray.Length) {
            $chunk = $byteArray[$offset..([Math]::Min($offset + $partSize - 1, $byteArray.Length - 1))]
            $outputFile = "./logs/$today-part$part.log"

            [System.IO.File]::WriteAllBytes($outputFile, $chunk)
            Write-Host "Saved: $outputFile"

            $offset += $partSize
            $part++
        }

        Clear-Content -Path $filePath
    }
}

# Function: Compress previous day logs
function Compress-BeforeStart {
    param([string]$today, [string]$logFile, [string]$zipFile)

    if (Test-Path $logFile) {
        Write-Host "Compressing previous logs to: $zipFile"
        Compress-Archive -Path $logFile -DestinationPath $zipFile -Force
        Clear-Content $logFile
    }
}

# Start
Write-Host "Claude logging to: $logFile"
Write-Host "Features: Daily ZIP / Auto-split / Auto gitignore"

# Setup .gitignore
$gitignore = Join-Path $PWD ".gitignore"

if (Test-Path $gitignore) {
    $ignoreRule = "claude_logs/"
    if (-not (Select-String -Path $gitignore -Pattern $ignoreRule -Quiet)) {
        Add-Content $gitignore "`n$ignoreRule"
        Write-Host "Added logs/ to .gitignore"
    }
} else {
    Set-Content -Path $gitignore -Value "claude_logs/"
    Write-Host "Created .gitignore with logs/ entry"
}

# Compress old logs
Compress-BeforeStart -today $today -logFile $logFile -zipFile $zipFile

# Run Claude with logging
claude chat | Tee-Object -Append $logFile

# Split if needed
Split-LargeLogFile -filePath $logFile
