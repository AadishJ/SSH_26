@echo off
echo ============================================================
echo Starting Diabetic Retinopathy Screening System
echo ============================================================
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "Retina Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate && uvicorn main:app --port 8000"

echo [2/2] Starting Frontend Web Server on http://localhost:5173 ...
start "Retina Frontend (HTTP)" cmd /k "cd /d %~dp0 && python -m http.server 5173 --directory frontend"

echo.
echo Both servers are launching!
echo Backend:  http://localhost:8000/health
echo Frontend: http://localhost:5173
echo ============================================================
pause
