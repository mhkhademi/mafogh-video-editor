@echo off
title Mafogh Video Editor Studio
echo ========================================================
echo Starting Mafogh Video Editor (Studio 1080p)...
echo ========================================================
echo.
echo Starting Backend Server on http://localhost:3001 ...
start "Mafogh Backend" cmd /c "npm run server"

timeout /t 2 /nobreak >nul

echo Starting Frontend Studio on http://localhost:3000 ...
start "Mafogh Frontend" cmd /c "npm run dev"

timeout /t 2 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo System running successfully!
pause
