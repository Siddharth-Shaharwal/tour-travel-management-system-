@echo off
REM Travel Management System - Quick Start Script for Windows

echo 🚀 Starting Travel Management System...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version
echo.

REM Start Backend
echo 📦 Starting Backend Server...
cd backend
if not exist "node_modules" (
    echo 📥 Installing backend dependencies...
    call npm install
)
echo 🟢 Backend running on http://localhost:4000
start cmd /k "node server.js"
timeout /t 2 /nobreak

REM Start Frontend
echo.
echo ⚛️  Starting Frontend Server...
cd ..\frontend
if not exist "node_modules" (
    echo 📥 Installing frontend dependencies...
    call npm install
)
echo 🟢 Frontend running on http://localhost:5173
start cmd /k "npm run dev"
timeout /t 3 /nobreak

REM Display info
echo.
echo ✅ All servers started in new windows!
echo.
echo 📍 Frontend: http://localhost:5173
echo 📍 Backend API: http://localhost:4000
echo 📍 Admin Dashboard: http://localhost:5173/admin
echo.
echo 📝 Keep the command windows open to keep servers running.
echo 🛑 Close command windows to stop servers.
pause
