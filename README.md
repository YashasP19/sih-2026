<div align="center">

# 🏛️ Urban Lens

### Societal Innovation Collaboration Portal

*Turning community problems into research, innovation and deployed solutions —*
*by connecting citizens, universities, industry and government on one platform.*

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

> 🏆 **Smart India Hackathon 2026 — Problem Statement `SIH26043`**
> *A digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships*
> **Organisation:** Government of Jharkhand · Department of Higher & Technical Education · *Smart Education*

</div>

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [How Urban Lens Solves It](#-how-urban-lens-solves-it)
- [End-to-End Workflow](#-end-to-end-workflow)
- [Key Features](#-key-features)
- [Requirement Coverage](#-requirement-coverage)
- [Tech Stack](#️-tech-stack)
- [Project Architecture](#️-project-architecture)
- [Quickstart Guide](#-quickstart-guide)
- [Demo Credentials](#-demo-login-credentials)
- [API Reference](#-innovation-api-reference)
- [Docker Deployment](#-docker-deployment)
- [Known Limitations](#-known-limitations)

---

## 🌐 The Problem

Every year citizens across Jharkhand identify thousands of local problems — contaminated water, failing infrastructure, healthcare access gaps, agricultural distress. At the same time:

- **Universities** hold research capability and thousands of students who need real problems to work on.
- **Industry, startups and CSR foundations** hold funding, technical expertise and deployment capability.
- **Government** lacks visibility into which problems are being worked on, by whom, and with what result.

These three groups almost never connect. There is no structured mechanism to move a problem from *"a villager noticed it"* to *"a student team solved it and a partner deployed it."*

---

## 💡 How Urban Lens Solves It

Urban Lens is the missing pipeline. A citizen reports a problem; an AI layer classifies, prioritises and deduplicates it, then routes it to the institution best equipped to solve it; a faculty-mentored student team takes it on; an industry partner funds and helps deploy the solution; and the state watches the entire pipeline on a live dashboard.

```
 CITIZEN            AI ENGINE              UNIVERSITY           INDUSTRY          GOVERNMENT
 ───────            ─────────              ──────────           ────────          ──────────
 Reports a    →   Classify (10       →   Claims the      →   Offers funding,  →  Monitors
 problem with     domains)               challenge,          mentorship,         intake,
 photo, GPS       Prioritise (1–100)     forms a multi-      lab access,         participation,
 and voice        Deduplicate (geo      disciplinary        prototyping,        funding and
                  + text)                student team,       tech transfer       deployed
                  Route to the best      tracks milestones                       outcomes
                  matched institution
```

---

## 🔄 End-to-End Workflow

### 1️⃣ Citizen submits a societal challenge
Through the web app or the conversational chatbot — with **photo evidence, GPS location, and voice input** (Whisper transcription) for users who find typing difficult.

### 2️⃣ The AI engine triages it (automatic, on submission)

| Step | What happens |
|---|---|
| **Classify** | A multilingual keyword/lexicon classifier (English / Hindi / Hinglish) scores the text and maps it to one of **10 academic domains** — Water, Agriculture, Healthcare, Education, Environment, Energy, Urban Development, Accessibility, Public Administration, Rural Livelihoods |
| **Prioritise** | A composite **1–100 score** from category weight, urgency keywords, geographic density and age — bucketed into Critical / High / Medium / Low |
| **Deduplicate** | Two-stage filter: **Haversine** geo-proximity within 500 m, then **cosine** text similarity above 0.65. Twenty people reporting one handpump become *one high-priority challenge*, not twenty tickets |
| **Route** | Domain match → same-district preference → **lowest active project load**. Every decision is written to an audit log with its reason |

### 3️⃣ University claims it and forms a team
A faculty coordinator sees only the challenges routed to their institution, then registers a project: proposal summary, faculty mentor, and a **multidisciplinary student roster** (e.g. a civil engineer, a data science student and a public health student on the same water problem).

### 4️⃣ Project runs through a tracked lifecycle
`Proposed → Approved → In Progress → Prototype → Testing → Deployed`

With **milestones** carrying due dates, statuses and file attachments. Progress is computed from milestones actually closed — not self-reported percentages.

### 5️⃣ Industry partners plug in
Partners browse live projects and offer one of six support types — **mentorship, CSR funding, prototyping, lab access, pilot deployment, technology transfer**. The institution accepts or declines, so collaboration is consented on both sides.

### 6️⃣ Government measures the outcome
A public analytics dashboard shows challenge intake, domain-wise distribution, institutional participation, projects by stage, industry engagement, total funding committed, and — the number that matters — **solutions actually deployed back into the community**.

---

## ✨ Key Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🧠 **AI Domain Classification** | Multilingual keyword/lexicon classifier maps free-text reports onto 10 academic thematic domains |
| 2 | ⚡ **Dynamic Priority Engine** | Composite 1–100 severity scores with `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` tiers |
| 3 | 📍 **Geo-Spatial Deduplication** | Haversine + cosine similarity suppresses duplicate reports within a 500 m radius |
| 4 | 🎯 **Explainable HEI Routing** | Domain → district → workload selection, with an auditable reason logged for every routing decision |
| 5 | 🎓 **University Collaboration Module** | Claim challenges, constitute multidisciplinary teams, submit proposals, track milestones |
| 6 | 🤝 **Industry Partnership Module** | Six support types across industry, startups, MSMEs, CSR foundations, research labs and incubators |
| 7 | 📈 **Milestone-Driven Lifecycle** | 8-stage project pipeline with attachment-backed deliverables and computed progress |
| 8 | 🎖️ **Student Innovation Record** | NEP 2020 per-student credit ledger with capstone / internship flags, searchable at `/student-record` |
| 9 | 📜 **Challenge Journey Timeline** | Full audit trail per challenge — reported → AI-classified → deduplicated → routed → team formed → funded → deployed |
| 10 | 🚀 **Community Impact & IP Tracking** | People benefited, villages covered, solution cost, patents filed and startups incorporated, captured on deployment |
| 11 | 💬 **AI Chatbot + Voice Intake** | Floating assistant with Whisper speech-to-text for hands-free submission |
| 12 | 🗺️ **Interactive Heatmaps** | Ward-level Leaflet maps showing where challenges cluster |
| 13 | 📊 **Government Analytics Dashboard** | Public, login-free view of participation, funding and deployed outcomes |
| 14 | 🏆 **Civic Karma Leaderboard** | Citizens earn points for verified reports, driving sustained community participation |
| 15 | 🔐 **Five-Role RBAC** | Citizen · Officer · University Coordinator · Industry Partner · Admin, enforced server-side |

---

## ✅ Requirement Coverage

Mapped directly against the problem statement's *Expected Solution*:

| PS Requirement | Status | Implementation |
|---|---|---|
| Citizen submission with multimedia, location, documents | ✅ | Image upload, GPS geotag, address/ward, **plus voice intake** |
| AI categorization into thematic domains | ✅ | Lexicon classifier → 10 domains |
| Prioritization | ✅ | 1–100 composite priority engine |
| **Deduplication** | ✅ | Haversine geo + cosine text, two-stage |
| Routing to universities by expertise | ✅ | `ChallengeRoutingService` with audit log |
| Universities evaluate, form teams, submit proposals | ✅ | University dashboard + project claim flow |
| Industry / startup / MSME / CSR collaboration | ✅ | Industry portal, 6 support types, accept/decline |
| Project lifecycle & milestone monitoring | ✅ | 8-stage lifecycle + milestones with attachments |
| Government dashboards & analytics | ✅ | Public innovation analytics dashboard |
| Notification & communication | ⚠️ Partial | In-app notifications + full audit log; **email/SMS not implemented** |
| Role-based access | ✅ | Five roles, object-level server-side checks |
| IP / patent / startup-created tracking | ✅ | Patent, startup, people-benefited and cost fields captured on deployment and rolled into analytics |
| Video upload | ❌ | Images only |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11, Django 5.0, Django REST Framework |
| **Frontend** | React 18.3, Tailwind CSS 3.4, Axios, React Router |
| **Design System** | Warm-minimalist editorial theme — cream `#F8F5EE`, charcoal `#1C1C1C`, soft-beige surfaces, muted earth-tone accents; Plus Jakarta Sans; scroll-reveal + count-up animations with `prefers-reduced-motion` support |
| **Mapping** | Leaflet.js 1.9 + OpenStreetMap |
| **AI / NLP** | Keyword-lexicon classifier, Haversine distance, Cosine similarity, Whisper (voice) |
| **Auth** | JWT (SimpleJWT), Role-Based Access Control |
| **Database** | SQLite (dev) / PostgreSQL (production-ready) |
| **DevOps** | Docker, Docker Compose, Render |

---

## 🏗️ Project Architecture

```
sih-2026/
├── backend/                        # Django REST API
│   ├── grievance_system/           # Project config (settings, urls, wsgi, asgi)
│   ├── apps/
│   │   ├── users/                  # Custom User model (5 roles), JWT Auth & RBAC
│   │   ├── complaints/             # Challenge intake, service layer, audit logs
│   │   ├── ai_module/              # Classifier, Priority Engine, Deduplication
│   │   ├── innovation/             # ⭐ Universities, Projects, Milestones,
│   │   │                           #    Industry Partners, Support Offers,
│   │   │                           #    HEI Routing Engine
│   │   └── dashboard/              # Analytics, aggregations & transparency metrics
│   ├── core/                       # Shared constants, permissions, exceptions
│   └── manage.py
│
├── frontend/                       # React 18 + Tailwind + Leaflet
│   └── src/
│       ├── components/             # Glassmorphic UI, Maps, Badges, Modals
│       ├── pages/                  # Landing, Dashboard, Submit, Admin, Analytics,
│       │                           # UniversityDashboard, IndustryPortal,
│       │                           # ProjectDetail, InnovationAnalytics
│       ├── services/               # Axios client, auth / complaint / innovation services
│       ├── context/                # AuthContext, ThemeContext, NotificationContext
│       └── routes.jsx              # Role-based protected routes
│
├── docs/                           # SIH evaluation documentation
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quickstart Guide

> ⚠️ **Both servers must run simultaneously.** Seed data once, then keep both terminals open.

### Step 1 — Backend (Terminal 1)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux / macOS
# .\venv\Scripts\Activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Seed demo data
python seed_data.py                          # citizens, officers, sample challenges
python manage.py seed_innovation_data        # universities, partners, projects

# Start the backend
python manage.py runserver 8000
```

✅ Backend API at **`http://127.0.0.1:8000`** · Django admin at `/admin/`

> `seed_innovation_data` is **idempotent** — safe to re-run before a demo. It also backfills domains and HEI routing onto any challenges created earlier.

### Step 2 — Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend at **`http://localhost:3000`**

> The frontend reads `VITE_API_URL` from `.env.local` (local backend) or `.env.production` (deployed backend) automatically.

---

## 🔑 Demo Login Credentials

> **One-click instant login:** the `/login` page has five buttons — Citizen, PWD Officer, Super Admin, University and Industry. Clicking one signs you straight in and lands you on that role's workspace. No typing needed.

### Innovation roles — password `Demo@1234`

| Role | Username | Organisation | Lands on |
|------|----------|--------------|----------|
| 🎓 **University Coordinator** | `uni_bitsindri` | BIT Sindri | `/university` |
| 🎓 **University Coordinator** | `uni_bauranchi` | BAU Ranchi | `/university` |
| 🎓 **University Coordinator** | `uni_rims` | RIMS Ranchi | `/university` |
| 🤝 **Industry Partner** | `ind_tatasteel` | Tata Steel Foundation | `/industry` |
| 🤝 **Industry Partner** | `ind_agrisense` | AgriSense Analytics | `/industry` |
| 🤝 **Industry Partner** | `ind_jharkhandtech` | JharkhandTech Startup Hub | `/industry` |

### Core roles — generated by `seed_data.py`

| Role | Username | Password |
|------|----------|----------|
| 🔴 **Super Admin** | `admin` | `Admin@123` |
| 🟠 **PWD Roads Officer** | `officer_roads` | `Officer@123` |
| 🟡 **Sanitation Officer** | `officer_sanitation` | `Officer@123` |
| 🟢 **Electricity Officer** | `officer_power` | `Officer@123` |
| 🔵 **Citizen** | `arun_citizen` | `Citizen@123` |

> The public **Innovation Analytics** dashboard at `/innovation-analytics` needs no login.
>
> **Note:** a university coordinator only sees challenges routed to *their own* institution. If a queue looks empty, that institution simply has no unclaimed challenges — submit a new challenge as a citizen and it will be auto-routed to whichever institution matches its domain, district and current workload.

---

## 📡 Innovation API Reference

All endpoints under `/api/v1/innovation/`:

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| `GET` | `/universities/` | Public | Registered HEIs and their expertise domains |
| `GET` | `/partners/` | Public | Registered industry partners |
| `GET` | `/challenges/` | University | Challenges routed to your institution |
| `POST` | `/challenges/<id>/claim/` | University | Claim a challenge, register a project team |
| `GET` | `/projects/` | Authenticated | Projects, scoped by role |
| `GET` | `/projects/<id>/` | Authenticated | Full project with team, milestones, offers |
| `POST` | `/projects/<id>/status/` | University | Advance the project lifecycle |
| `POST` | `/projects/<id>/milestones/` | University | Add a deliverable |
| `POST` | `/milestones/<id>/status/` | University | Update milestone status |
| `POST` | `/projects/<id>/support/` | Industry | Offer mentorship / funding / facilities |
| `GET` | `/support-offers/` | Authenticated | Offers you made or received |
| `POST` | `/support-offers/<id>/respond/` | University | Accept or decline an offer |
| `GET` | `/stats/` | Public | Government analytics aggregate |

Full REST reference: [`docs/API_Documentation.md`](./docs/API_Documentation.md)

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

> Ensure Docker Desktop is running first.

---

## ⚠️ Known Limitations

Stated honestly, with the intended next step:

| Limitation | Next step |
|---|---|
| The classifier is **rule-based keyword matching, not a trained ML model**, and has no measured accuracy figure | Collect labelled submissions through the platform, then train and benchmark a model against this baseline |
| No offline support — rural users need connectivity | Offline-first PWA with local queuing and background sync |
| Email / SMS notification delivery not implemented | Integrate a transactional email + SMS gateway |
| Video upload not supported | Add video handling to the intake pipeline |
| Untested at state-scale load | PostGIS geo-indexing and Celery for background AI processing |

---

## 📜 Documentation

| Document | Description |
|----------|-------------|
| 📄 [SRS.md](./docs/SRS.md) | Software Requirements Specification |
| 📡 [API_Documentation.md](./docs/API_Documentation.md) | Complete REST API Reference |
| ⚙️ [Setup_Guide.md](./docs/Setup_Guide.md) | Local & Production Deployment Guide |

---

<div align="center">

**Built for Smart India Hackathon 2026** · Problem Statement `SIH26043`

</div>
