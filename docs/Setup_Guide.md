# CivicSense AI: Local & Production Setup Guide

This guide contains step-by-step instructions to run **CivicSense AI** locally or via Docker.

---

## 1. Prerequisites
- **Python 3.11+** installed
- **Node.js 18+** & **npm** installed
- **Git** installed

---

## 2. Quick Local Setup (Development Mode)

### Step A: Backend Setup (Django REST API)

1. Open terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate
     ```
   - **Linux / MacOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Run Database Migrations:
   ```bash
   python manage.py makemigrations users complaints ai_module dashboard
   python manage.py migrate
   ```

5. Seed Initial Demo Data (Admins, Officers, Citizens & Sample Grievances):
   ```bash
   python seed_data.py
   ```

6. Start Django Development Server:
   ```bash
   python manage.py runserver 8000
   ```
   *The backend API will be live at `http://127.0.0.1:8000/api/v1/`*

---

### Step B: Frontend Setup (React + Tailwind + Leaflet)

1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start Vite Development Server:
   ```bash
   npm run dev
   ```
   *The React Web App will be live at `http://localhost:3000`*

---

## 3. Demo Login Credentials

The seed script automatically provisions the following accounts:

| Role | Username | Password | Notes |
|---|---|---|---|
| **Super Admin** | `admin` | `Admin@123` | Full access to all municipal operations & KPIs |
| **PWD Roads Officer** | `officer_roads` | `Officer@123` | Manages Roads & Infrastructure Queue |
| **Sanitation Officer** | `officer_sanitation` | `Officer@123` | Solid Waste & Cleanliness Department |
| **Electricity Officer**| `officer_power` | `Officer@123` | Electrical Hazards & Streetlighting |
| **Active Citizen** | `arun_citizen` | `Citizen@123` | Standard resident with 140 Civic Karma pts |

> **Login troubleshooting:** If the UI says login failed but credentials match this table, the backend is usually stopped. Keep Terminal A on `python manage.py runserver 8000`, then retry. Re-run `python seed_data.py` if the database was reset.

---

## 4. Docker Deployment (Optional / Production)

To run the entire full-stack application (PostgreSQL + Django API + React Web App) with one command:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/v1/`
- PostgreSQL: `localhost:5432`
