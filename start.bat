@echo off
echo ========================================
echo THARA Men's Wear - Quick Start
echo ========================================
echo.

echo [1/3] Starting Backend Server...
cd backend
start cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Server (with email)...
cd ..\server
start cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [3/3] Starting React Frontend...
cd ..
start cmd /k "npm start"

echo.
echo ========================================
echo All services started!
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
