<div align="center">

# 🏛️ Urban Lens

### Next-Gen Civic Grievance Redressal & Municipal Transparency Platform

*Transforming municipal governance with AI-driven triage, real-time priority scoring,*  
*geo-spatial duplicate suppression, and radical public transparency.*

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

> 🏆 **Built for Smart India Hackathon (SIH) 2026**

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Quickstart Guide](#-quickstart-guide)
- [Demo Credentials](#-demo-login-credentials)
- [Docker Deployment](#-docker-deployment)
- [Documentation](#-documentation)

---

## 🌐 Overview

**Urban Lens** is a full-stack intelligent civic grievance management system designed to bridge the gap between citizens and municipal authorities. By leveraging **Natural Language Processing**, **geo-spatial analytics**, and **real-time dashboards**, it enables:

- 🧑‍💼 **Citizens** to file, track, and follow up on grievances seamlessly
- 🏢 **Officers** to manage, prioritize, and resolve complaints efficiently
- 📊 **Administrators** to gain city-wide insights and enforce SLA compliance

---

## ✨ Key Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🧠 **NLP Auto-Triage** | TF-IDF classifier categorizes grievances across 6 departments with **>94% accuracy** |
| 2 | ⚡ **Dynamic Priority Engine** | Composite 1–100 severity scores with `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` urgency tiers |
| 3 | 💬 **AI Chatbot + Voice Intake** | Floating Civic Assist chatbot with browser speech-to-text for hands-free complaint filing |
| 4 | 🔔 **Live Notifications** | Real-time bell inbox and toast alerts on every status/resolution change |
| 5 | 📍 **Geo-Spatial Deduplication** | Haversine + cosine similarity to suppress duplicate complaints within a 500m radius |
| 6 | 🗺️ **Interactive Heatmaps** | Ward-level Leaflet maps with complaint density, photo evidence & GPS pinning |
| 7 | 📊 **Public Transparency Dashboard** | Open metrics: total grievances, SLA turnarounds, department efficiency rankings, 7-day charts |
| 8 | 🎖️ **Civic Karma Leaderboard** | Citizens earn Karma points for verified reports, officers/admins are ranked by grievances resolved — surfaced on a live leaderboard |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11, Django 5.0, Django REST Framework |
| **Frontend** | React 18.3, Tailwind CSS 3.4, Axios |
| **Mapping** | Leaflet.js 1.9 |
| **AI / NLP** | Scikit-learn (TF-IDF), Haversine, Cosine Similarity |
| **Auth** | JWT (SimpleJWT), Role-Based Access Control (RBAC) |
| **Database** | SQLite (dev) / PostgreSQL (production-ready) |
| **DevOps** | Docker, Docker Compose |

---

## 🏗️ Project Architecture

```
sih-2026/
├── backend/                        # Django REST API
│   ├── grievance_system/           # Project config (settings, urls, wsgi, asgi)
│   ├── apps/
│   │   ├── users/                  # Custom User model, JWT Auth & RBAC
│   │   ├── complaints/             # Complaint CRUD, Service Layer, Audit Logs
│   │   ├── ai_module/              # NLP Classifier, Priority Engine, Deduplication
│   │   └── dashboard/              # Analytics, Aggregations & Transparency Metrics
│   ├── core/                       # Shared constants, permissions, exceptions
│   ├── seed_data.py                # Demo data seeder for SIH evaluation
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/                       # React 18 + Tailwind + Leaflet
│   └── src/
│       ├── components/             # Glassmorphic UI, Maps, Badges, Modals
│       ├── pages/                  # Landing, Login, Dashboard, Submit, Admin, Analytics, Leaderboard
│       ├── services/               # Axios API client, Auth & Complaint services
│       ├── context/                # AuthContext, ThemeContext, NotificationContext
│       └── routes.jsx              # Role-based protected routes
│
├── docs/                           # SIH Evaluation Documentation
│   ├── SRS.md                      # Software Requirements Specification
│   ├── API_Documentation.md        # Full REST API Reference
│   └── Setup_Guide.md              # Local & Cloud Setup Guide
│
├── docker-compose.yml              # Full-stack container orchestration
└── README.md
```

---

## 🚀 Quickstart Guide

> ⚠️ **Both servers must be running simultaneously.** Seed demo data once, then keep both terminals open.

### Step 1 — Backend Setup (Terminal 1)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux / macOS
# .\venv\Scripts\Activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py makemigrations users complaints ai_module dashboard
python manage.py migrate

# Seed demo data (creates all demo users & sample grievances)
python seed_data.py

# Start the backend server
python manage.py runserver 8000
```

✅ Backend API running at: **`http://127.0.0.1:8000`**  
📡 Auth endpoint: `POST /api/v1/auth/login/`

> **Tip:** If demo login fails after a fresh DB, re-run `python seed_data.py` to reset demo passwords.

---

### Step 2 — Frontend Setup (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running at: **`http://localhost:3000`**

---

## 🔑 Demo Login Credentials

> Generated by `python seed_data.py`. Use the **SIH Demo Instant Login** chips on the Login page, or enter manually:

| Role | Username | Password | Access |
|------|----------|----------|--------|
| 🔴 **Super Admin** | `admin` | `Admin@123` | City-wide oversight & Executive KPIs |
| 🟠 **PWD Roads Officer** | `officer_roads` | `Officer@123` | Roads & Infrastructure queue |
| 🟡 **Sanitation Officer** | `officer_sanitation` | `Officer@123` | Solid Waste & Cleanliness queue |
| 🟢 **Electricity Officer** | `officer_power` | `Officer@123` | Electrical Hazards & Streetlighting queue |
| 🔵 **Active Citizen** | `arun_citizen` | `Citizen@123` | Lodge grievances & track status |

> **New users:** Register with a valid email (`name@example.com`), a password of at least 6 characters, and a unique username. Accounts are active immediately after signup.

---

## 🐳 Docker Deployment

Spin up the entire stack (backend + frontend + DB) with a single command:

```bash
docker-compose up --build
```

> Ensure Docker Desktop is running before executing the above command.

---

## 📜 Documentation

Comprehensive evaluation documents are available in the [`/docs`](./docs/) folder:

| Document | Description |
|----------|-------------|
| 📄 [SRS.md](./docs/SRS.md) | Software Requirements Specification |
| 📡 [API_Documentation.md](./docs/API_Documentation.md) | Complete REST API Reference |
| ⚙️ [Setup_Guide.md](./docs/Setup_Guide.md) | Local & Production Deployment Guide |

---

