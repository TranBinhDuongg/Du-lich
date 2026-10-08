@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22 or newer, then run this file again.
  pause
  exit /b 1
)
if not exist .env (
  copy .env.example .env >nul
  echo Enter your Gemini API key in .env, then run this file again.
  notepad .env
  exit /b 1
)
echo Open http://localhost:3000 in your browser.
node --watch --watch-path=.env --watch-path=server.js --env-file=.env server.js
pause
