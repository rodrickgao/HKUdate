@echo off
setlocal enabledelayedexpansion

:: ========================================
::     HKU Date - 一键启动脚本
:: ========================================
cd /d "%~dp0"

echo ========================================
echo      HKU Date - 校园交友平台
echo ========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js v18+ from: https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VERSION=%%v
echo [OK] Node.js !NODE_VERSION! detected
echo.

:: Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not found. Please reinstall Node.js.
    pause
    exit /b 1
)
echo [OK] npm detected
echo.

:: Install dependencies if node_modules missing
if not exist "node_modules" (
    echo [1/4] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Try: npm install
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [1/4] Dependencies already installed - skipping
)
echo.

:: Kill existing processes on our ports
echo [2/4] Checking ports 5173 and 3003...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo [WARN] Port 5173 in use - killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003 ^| findstr LISTENING') do (
    echo [WARN] Port 3003 in use - killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo.

:: Start backend server
echo [3/4] Starting backend server (port 3003)...
start "HKU Date API" cmd /k "cd /d \"%~dp0\" && node server.js"

:: Wait a moment for backend to start
timeout /t 2 /nobreak >nul

:: Start frontend dev server
echo [4/4] Starting frontend (port 5173)...
start "HKU Date Web" cmd /k "cd /d \"%~dp0\" && npm run dev"

echo.
echo ========================================
echo   Done! 启动完成！
echo.
echo   前端页面:  http://localhost:5173
echo   后端 API:  http://localhost:3003
echo.
echo   Ctrl+C in either window to stop
echo ========================================
echo.
pause
