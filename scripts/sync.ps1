param(
    [string]$RepoPath = "C:\Projects\wyprzedaz-sync",
    [string]$GoogleDriveBackupPath = ""
)

$ErrorActionPreference = "Stop"

function Find-GoogleDrive {
    $candidates = @(
        "$env:USERPROFILE\My Drive",
        "$env:USERPROFILE\Google Drive",
        "G:\My Drive",
        "G:\Mój dysk",
        "H:\My Drive",
        "H:\Mój dysk"
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) { return $candidate }
    }
    return $null
}

if (-not (Test-Path $RepoPath)) {
    throw "Nie znaleziono repo: $RepoPath"
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git nie jest dostępny w PATH. Do synchronizacji kodu użyj GitHub Desktop."
}

Push-Location $RepoPath
try {
    Write-Host "Pobieram zmiany z GitHub..." -ForegroundColor Cyan
    git pull --rebase

    $status = git status --porcelain
    if ($status) {
        git add -A
        $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        git commit -m "sync: local update $stamp"
        git push
        Write-Host "GitHub: zsynchronizowano." -ForegroundColor Green
    } else {
        Write-Host "GitHub: brak lokalnych zmian do wysłania." -ForegroundColor DarkGray
    }

    if (-not $GoogleDriveBackupPath) {
        $drive = Find-GoogleDrive
        if ($drive) {
            $GoogleDriveBackupPath = Join-Path $drive "WyprzedazSync-Backup"
        }
    }

    if ($GoogleDriveBackupPath) {
        New-Item -ItemType Directory -Path $GoogleDriveBackupPath -Force | Out-Null
        $bundle = Join-Path $GoogleDriveBackupPath ("wyprzedaz-sync-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".bundle")
        git bundle create $bundle --all
        Write-Host "Backup Google Drive: $bundle" -ForegroundColor Green
    } else {
        Write-Host "Google Drive nie został wykryty. Backup pominięty." -ForegroundColor Yellow
    }
}
finally {
    Pop-Location
}
