@echo off
echo ============================================================
echo Starting Diabetic Retinopathy Screening System (SIH 2026)
echo ============================================================
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "Retina Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate && uvicorn main:app --port 8000"

echo [2/2] Starting Polished Next.js Frontend on http://localhost:3000 ...
start "Retina Next.js Dashboard" cmd /k "cd /d %~dp0frontend && pnpm run dev --port 3000"

echo.
echo Both servers are launching!
echo Backend API:      http://localhost:8000/health
echo Polished UI:      http://localhost:3000
echo ============================================================
pause
