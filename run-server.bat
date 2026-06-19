@echo off
title SECPROJ HTB-HSLU Mapping Console Server
echo ==========================================================
echo Starting SECPROJ HTB-HSLU Mapping Console local server...
echo ==========================================================
echo.

:: Test python
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] python command found. Starting server at http://127.0.0.1:8000...
    python -m http.server 8000 --bind 127.0.0.1
    goto end
)

:: Test py launcher
where py >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] py launcher found. Starting server at http://127.0.0.1:8000...
    py -m http.server 8000 --bind 127.0.0.1
    goto end
)

echo [!] ERROR: Python could not be detected in your system PATH.
echo.
echo Please do one of the following:
echo   1. Double-click "index.html" directly to open it without a server.
echo   2. Install Python and check "Add Python to PATH" during installation.
echo.
pause

:end
