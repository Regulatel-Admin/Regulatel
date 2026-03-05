@echo off
echo Starting REGULATEL development server...
echo.

cd /d "%~dp0"

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Vite development server...
echo.
echo The server will be available at http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

timeout /t 3 /nobreak >nul
start http://localhost:5173

call npm run dev

pause
