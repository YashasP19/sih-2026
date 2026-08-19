# 🏛️ CivicSense AI: Next-Gen Civic Grievance Redressal & Municipal Transparency

> **Built for Smart India Hackathon (SIH 2026)**  
> *Transforming municipal governance with AI-driven triage, real-time priority scoring, geo-spatial duplicate suppression, and radical public transparency.*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Key Highlights & Innovations

1. **🧠 Real-Time NLP Auto-Triage & Category Prediction**:
   - Probabilistic TF-IDF classifier trained on extensive civic lexicons automatically categorizes grievances (PWD Roads, Solid Waste, Electricity, Water Supply, Drainage, Public Safety) with >94% accuracy.
2. **⚡ Dynamic Risk-Based Priority Engine**:
   - Calculates 1–100 composite severity scores and Urgency Tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) factoring life-safety keyword triggers (e.g. exposed live cables, open manholes, hospital routes) and geo-spatial frequency clustering.
3. **💬 Chatbot + Voice Complaint Intake**:
   - Floating Civic Assist chatbot for guided filing & ticket tracking; browser speech-to-text (Speak mic) on the form and in chat.
4. **🔔 Live Status Updates & Notifications**:
   - Citizen dashboard auto-refreshes; bell inbox + toasts when ticket status or resolution changes.
5. **📍 Geo-Spatial Duplicate & Spam Suppression**:
   - Uses Haversine spherical distance combined with text vector cosine similarity to detect duplicate complaints within 500m radius, preventing departmental queue bloat.
6. **🗺️ Interactive Ward-Level Problem Heatmaps & GPS Pinning**:
   - Real-time Leaflet geo-mapping displaying neighborhood complaint density, photographic evidence, and click-to-pick GPS coordinates.
7. **📊 Radical Public Transparency Dashboard**:
   - Real-time open metrics: Total grievances, SLA turnaround times, department efficiency rankings, and 7-day velocity charts.
8. **🎖️ Citizen Gamification & Civic Karma**:
   - Verified grievance filers earn Civic Karma points, encouraging community civic participation.

---

## 🏗️ Clean Project Architecture

```
├── backend/                     # Django REST Backend
│   ├── grievance_system/        # Main project config (settings, urls, wsgi, asgi)
│   ├── apps/
│   │   ├── users/               # Custom User model, JWT Auth & RBAC
│   │   ├── complaints/          # Complaint CRUD, Service Layer, Audit Logs
│   │   ├── ai_module/           # NLP Classifier, Priority Engine, Duplicate Detection
│   │   └── dashboard/           # Analytics, Aggregations & Public Transparency
│   ├── core/                    # Common constants, permissions, exceptions, pagination
│   ├── seed_data.py             # Realistic SIH demonstration seeder script
│   ├── requirements.txt         # Dependencies
│   └── manage.py
│
├── frontend/                    # React 18 + Tailwind CSS + Leaflet Frontend
│   ├── src/
│   │   ├── components/          # Glassmorphic UI, Heatmap, MapComponent, Badges, Modals
│   │   ├── pages/               # Landing, Login, Signup, Citizen Dashboard, Submit, Admin, Analytics
│   │   ├── services/            # Axios API client, Auth & Complaint services
│   │   ├── context/             # AuthContext, ThemeContext (Dark/Light), NotificationContext
│   │   └── routes.jsx           # Role-based protected routes
│   └── package.json
│
├── docs/                        # Complete SIH Documentation
│   ├── SRS.md                   # Software Requirements Specification
│   ├── API_Documentation.md     # Full REST API Reference
│   └── Setup_Guide.md           # Local & Cloud Setup Guide
│
├── docker-compose.yml           # Full-stack Container Orchestration
└── README.md
```

---

## 🚀 Quickstart Guide

Login only works when **both** servers are running. Seed demo users once, then leave the backend terminal open.

### 1. Backend Setup (Terminal 1 — keep this running)

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\Activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations users complaints ai_module dashboard
python manage.py migrate
python seed_data.py
python manage.py runserver 8000
```

Backend API: **`http://127.0.0.1:8000`**  
Login endpoint: `POST /api/v1/auth/login/`

If demo login fails after a fresh DB, re-run `python seed_data.py` (resets demo passwords).

### 2. Frontend Setup (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser, then use the demo credentials below.

---

## 🔑 Demo Login Credentials

Created by `python seed_data.py`. Use the **SIH Demo Instant Login** chips on the Login page, or enter manually:

| Role | Username | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin` | `Admin@123` | City-wide oversight & Executive KPIs |
| **PWD Roads Officer** | `officer_roads` | `Officer@123` | Roads & Infrastructure Queue |
| **Sanitation Officer** | `officer_sanitation` | `Officer@123` | Solid Waste & Cleanliness Queue |
| **Electricity Officer**| `officer_power` | `Officer@123` | Electrical Hazards & Streetlighting Queue |
| **Active Citizen** | `arun_citizen` | `Citizen@123` | Lodges grievances & tracks status |

**Common login failure:** Frontend is open but backend was stopped. Restart Terminal 1 with `python manage.py runserver 8000`.

**New user registration:** Use a valid email (`name@example.com`), password with at least 6 characters, and a unique username. Every registered member is stored in `backend/db.sqlite3` and can sign in immediately after signup.
---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

---

## 📜 SIH Presentation & Evaluation

Refer to the `/docs/` folder for comprehensive Hackathon evaluation documents:
- [Software Requirements Specification (SRS.md)](file:///c:/Users/Keval/OneDrive/Desktop/SIH%202026/docs/SRS.md)
- [REST API Reference (API_Documentation.md)](file:///c:/Users/Keval/OneDrive/Desktop/SIH%202026/docs/API_Documentation.md)
- [Local & Production Setup Guide (Setup_Guide.md)](file:///c:/Users/Keval/OneDrive/Desktop/SIH%202026/docs/Setup_Guide.md)

---

## 👩‍💻 Creator

**YAMINI PARMAR · BTECH-IT**
