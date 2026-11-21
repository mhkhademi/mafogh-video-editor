@echo off
chcp 65001 >nul
title تدوینگر مافوق - در حال آماده سازی...

cd /d "%~dp0\.."

:: 1. Check if backend port 3001 is running
netstat -ano | findstr :3001 >nul
if %ERRORLEVEL% NEQ 0 (
    start /b "" cmd /c "npx tsx server/index.ts"
)

:: 2. Check if frontend port 3000 is running
netstat -ano | findstr :3000 >nul
if %ERRORLEVEL% NEQ 0 (
    start /b "" cmd /c "npx vite --port 3000"
)

:: 3. Give servers a brief moment to initialize
ping 127.0.0.1 -n 3 >nul

:: 4. Locate browser for standalone Desktop App Mode (Edge or Chrome)
set BROWSER_EXE=

if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

:: 5. Launch Standalone Native Window (No tabs, No URL bar, clean desktop window)
if defined BROWSER_EXE (
    start "" "%BROWSER_EXE%" --app=http://localhost:3000 --window-size=1440,920
) else (
    start "" http://localhost:3000
)

exit /b 0
