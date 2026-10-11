# CheckpointLab — Process Checkpoint & Recovery Simulator

A full-stack OS-course project built with React, Vite, FastAPI, and JSON persistence.

## Features
- Simulated process execution with configurable work units
- Save named checkpoints to JSON files
- Simulate process failures
- Recover from the latest or a selected checkpoint
- Lost-work calculation and event log
- Dashboard metrics and responsive interface
- JSON persistence across backend restarts

## Requirements
- Python 3.10+
- Node.js 18+
- VS Code

## Run the backend (Windows PowerShell)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload
```
If PowerShell blocks activation, run this in the same terminal:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```
Or skip activation and use `.\.venv\Scripts\python.exe -m pip install -r requirements.txt`, then `.\.venv\Scripts\python.exe -m uvicorn main:app --reload`.

Backend API docs: http://127.0.0.1:8000/docs

## Run the frontend (open a second terminal)
```powershell
cd frontend
npm install
npm run dev
```
Open http://127.0.0.1:5173

## Demo sequence
1. Run process by 20 units twice.
2. Save checkpoint `CP-001`.
3. Run by 20 or 30 more units.
4. Simulate crash.
5. Choose a checkpoint or keep “Latest checkpoint”.
6. Click Recover and inspect the lost-work message.
7. Run again to show that execution resumes.

## Storage
- Current process: `backend/data/process_state.json`
- Checkpoints: `backend/data/checkpoints/CP-001.json`, etc.

## Important limitation
This is an application-level simulation. It does not checkpoint or restore a real OS process, CPU registers, or arbitrary memory.
