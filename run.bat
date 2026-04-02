@echo off
echo ========================================
echo     HKU Date - Running Application
echo ========================================
echo.

cd /d "%~dp0hku-date"

echo [1/3] Installing dependencies...
call npm install

echo.
echo [2/3] Starting backend server...
start "HKU Date API" cmd /k "node server.js"

echo.
echo [3/3] Starting frontend...
start "HKU Date Web" cmd /k "npm run dev"

echo.
echo ========================================
echo Done! Please wait a few seconds...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3003
echo ========================================
pause