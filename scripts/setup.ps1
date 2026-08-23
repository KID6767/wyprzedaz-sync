param(
    [string]$RepoPath = "C:\Projects\wyprzedaz-sync"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "WYPRZEDAZ SYNC - SETUP" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor DarkCyan
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Nie znaleziono Gita w PATH." -ForegroundColor Yellow
    Write-Host "Jeżeli instalujesz GitHub Desktop, uruchom go i sklonuj repozytorium ręcznie,"
    Write-Host "a następnie skopiuj zawartość tej paczki do folderu repo."
    exit 1
}

if (-not (Test-Path $RepoPath)) {
    New-Item -ItemType Directory -Path (Split-Path $RepoPath -Parent) -Force | Out-Null
    git clone "https://github.com/KID6767/wyprzedaz-sync.git" $RepoPath
}

Write-Host "Repo: $RepoPath" -ForegroundColor Green
Write-Host ""
Write-Host "Skopiuj teraz pliki projektu do repo (jeśli jeszcze ich tam nie ma),"
Write-Host "a potem użyj GitHub Desktop do Commit + Push."
