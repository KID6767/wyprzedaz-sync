@echo off
title Wyprzedaz Sync - GitHub + Backup
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\sync.ps1"
pause
