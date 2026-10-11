# CheckpointLab

**A Checkpoint and Recovery Simulator for Operating Systems**

CheckpointLab is an educational web application designed to demonstrate checkpointing and recovery concepts in Operating Systems. It provides a web-based interface and a backend API for exploring how application state can be saved and restored during execution.

## 🚀 Features

- **Interactive Web Interface** — Access the simulator through a React-based frontend.
- **Backend API** — A FastAPI backend handles the application's core logic.
- **Checkpoint Management** — Explore checkpoint-related operations and stored state.
- **Recovery State Tracking** — Maintain process-state information for recovery experiments.
- **REST API Documentation** — Use FastAPI's automatically generated Swagger UI to explore available endpoints.

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, JavaScript, Vite |
| Backend | Python, FastAPI |
| API Server | Uvicorn |
| Styling | CSS |
| Version Control | Git and GitHub |

## 📁 Project Structure

```text
CheckpointLab/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

- Python 3.10 or later
- Node.js and npm
- Git

## 💻 Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/GiriRossanE/CheckpointLab.git
cd CheckpointLab/CheckpointLab
```

> If your GitHub repository contains `backend/` and `frontend/` directly at its root, use `cd CheckpointLab` instead.

### 2. Start the backend

From the project directory:

```powershell
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```powershell
pip install -r requirements.txt
```

Start the FastAPI server:

```powershell
uvicorn main:app --reload
```

The API should be available at:

- **API:** http://127.0.0.1:8000
- **Swagger documentation:** http://127.0.0.1:8000/docs

### 3. Start the frontend

Open a **second terminal** and navigate to the frontend directory:

```powershell
cd CheckpointLab/frontend
npm install
npm run dev
```

If you are already inside the project directory, use `cd frontend` instead.

Open the local URL displayed by Vite in your terminal, usually:

http://localhost:5173

## 🔍 Exploring the API

FastAPI provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

You can inspect available endpoints and test supported API operations directly through the browser.

## 🎯 Project Objective

The goal of CheckpointLab is to make Operating Systems concepts related to checkpointing, process-state preservation, and recovery easier to explore through a web-based simulation.

## 📚 Academic Context

Developed as an educational project related to **Operating System Principles**.

## 👨‍💻 Author

**Giri Rossan E**

Information Technology Undergraduate  
Vellore Institute of Technology, Vellore

---

*This project is intended for educational and experimentation purposes.*
