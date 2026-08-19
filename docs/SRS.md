# Software Requirements Specification (SRS)
## CivicSense AI: Intelligent Civic Grievance Redressal & Transparency Platform
**Target Hackathon:** Smart India Hackathon (SIH 2026)  
**Document Version:** 1.0.0  
**Status:** Production Ready  

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the functional, non-functional, data, and architectural requirements for **CivicSense AI**, an enterprise-grade, AI-powered civic grievance redressal and municipal transparency system. The platform streamlines grievance ingestion, automates NLP categorization, dynamically calculates risk-based priority scores, eliminates duplicate submissions via geo-spatial matching, and offers public dashboards for municipal accountability.

### 1.2 Scope
Traditional municipal grievance portals suffer from:
- Delayed manual triage and incorrect department routing.
- Flat priority queues where life-safety emergencies (e.g. exposed live cables or open manholes) sit behind minor complaints.
- Spam and redundant multi-filing of the same localized issue.
- Lack of radical transparency, leading to public mistrust.

CivicSense AI solves these challenges by combining Natural Language Processing (NLP), spatial density algorithms (Haversine & TF-IDF Cosine Similarity), interactive Leaflet heatmaps, and role-based workflows for Citizens, Field Officers, and Municipal Administrators.

---

## 2. System Actors & User Personas

| Actor | Description | Key Capabilities |
|---|---|---|
| **Citizen / Resident** | Registered or anonymous neighborhood citizen. | Files grievances with photos & GPS pins, tracks real-time status, upvotes community issues, earns civic karma reputation points. |
| **Department Field Officer** | Municipal official (e.g., PWD Roads, Sanitation, Power). | Views assigned department queue, filters critical emergency hazards, logs field action notes, and attaches photographic resolution proof. |
| **Municipal Administrator** | City Commissioner or Zonal Head. | Oversees city-wide KPIs, monitors SLA compliance, re-routes misclassified issues, and reviews duplicate clusters. |
| **Public Observer** | General public / NGO / Journalist. | Views ward-level problem heatmaps, resolution velocity charts, and department performance rankings without authentication. |

---

## 3. System Architecture & Flow

```
[Citizen Client / Mobile Browser]
        │
        ▼
[React 18 + Tailwind CSS + Leaflet UI]
        │ (JWT Authentication / REST API)
        ▼
[Django REST Framework Backend] ──► [AI & NLP Intelligence Engine]
        │                                 ├── TF-IDF Category Classifier
        │                                 ├── Dynamic Urgency & Priority Scorer
        │                                 ├── Haversine & Cosine Duplicate Detector
        │                                 └── Keyword & Entity Extractor
        ▼
[PostgreSQL / SQLite Database] ──► [Analytics & Heatmap Aggregator]
```

---

## 4. Functional Requirements

### 4.1 Authentication & User Management (FR-01)
- **FR-01.1:** Secure user registration and login with JSON Web Tokens (JWT) with automatic token rotation.
- **FR-01.2:** Role-Based Access Control (RBAC) supporting `CITIZEN`, `OFFICER`, and `ADMIN`.
- **FR-01.3:** Department assignment for municipal officers (`ROADS`, `SANITATION`, `ELECTRICITY`, `WATER_SUPPLY`, `DRAINAGE`, `PUBLIC_SAFETY`, `HEALTHCARE`, `GENERAL`).
- **FR-01.4:** Civic Karma reward points system incentivizing verified citizen reporting (+10 pts on filing, +20 pts on confirmed resolution).

### 4.2 Grievance Intake & Real-Time AI Auto-Triage (FR-02)
- **FR-02.1:** Citizen complaint submission with Title, Description, Photo upload, Address, Landmark, Ward Number, and GPS Coordinates.
- **FR-02.2:** Real-time debounced NLP classification predicting responsible municipal department with confidence scoring.
- **FR-02.3:** Live keyword and hazard signal extraction highlighting dangerous keywords.
- **FR-02.4:** Interactive Leaflet GPS map with "Use My GPS" auto-locate and pin-drop adjustments.

### 4.3 Smart Priority & Urgency Scoring (FR-03)
- **FR-03.1:** Dynamic priority calculation generating composite scores from 1 to 100 and urgency tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **FR-03.2:** High-risk keyword triggers (e.g. "sparking", "live wire", "open manhole", "school gate", "flooding in houses") automatically escalate priority score ≥ 85.
- **FR-03.3:** Spatial density boost: Multiple unresolved complaints within a 500-meter radius escalate ticket priority dynamically.

### 4.4 Geo-Spatial Duplicate & Spam Detection (FR-04)
- **FR-04.1:** Compares candidate complaint text vectors against active unresolved complaints within a 500-meter radius using TF-IDF / N-gram cosine similarity.
- **FR-04.2:** If similarity exceeds 75% within 500m, flags as duplicate and links to parent ticket, preventing department queue bloating.

### 4.5 Municipal Operations & Status Transition (FR-05)
- **FR-05.1:** Status lifecycle progression: `PENDING` ➔ `VERIFIED` ➔ `IN_PROGRESS` ➔ `RESOLVED` / `REJECTED`.
- **FR-05.2:** Immutable audit trail (`ComplaintActivityLog`) tracking timestamp, acting officer, status change, and remarks.
- **FR-05.3:** Photographic resolution proof mandatory for closing complaints.

### 4.6 Public Transparency & Ward Heatmaps (FR-06)
- **FR-06.1:** Open public dashboard displaying total grievances, resolution rate %, average resolution SLA (hours), and 7-day velocity.
- **FR-06.2:** Interactive Leaflet density heatmap visualizing grievance concentrations by ward and severity.
- **FR-06.3:** Department performance leaderboard ranking civic agencies by efficiency.

---

## 5. Non-Functional Requirements

| ID | Requirement | Metric / Specification |
|---|---|---|
| **NFR-01** | **API Response Time** | P95 latency < 150ms for grievance listing; AI classification inference < 60ms. |
| **NFR-02** | **Security & Hashing** | PBKDF2 with SHA-256 for password hashing; JWT tokens transmitted via Authorization Bearer headers. |
| **NFR-03** | **Scalability** | Stateless REST architecture supporting containerized horizontal scaling with Docker & Gunicorn. |
| **NFR-04** | **Data Integrity** | ACID compliance via atomic database transactions on status updates and complaint creation. |
| **NFR-05** | **Responsiveness & UX** | Glassmorphic, WCAG compliant, mobile-first design with Dark and Light mode support. |

---

## 6. Database Entity-Relationship Diagram

```
+------------------+           +----------------------+           +-------------------------+
|      USER        | 1       * |      COMPLAINT       | 1       * |  COMPLAINT_ACTIVITY_LOG |
+------------------+-----------+----------------------+-----------+-------------------------+
| id (PK)          |           | id (PK)              |           | id (PK)                 |
| username         |           | ticket_id (Unique)   |           | complaint_id (FK)       |
| email            |           | citizen_id (FK)      |           | performed_by_id (FK)    |
| role (Enum)      |           | title, description   |           | action, old_status      |
| department (Enum)|           | category, urgency    |           | new_status, remarks     |
| phone_number     |           | priority_score (1-100|           | timestamp               |
| ward_number      |           | status (Enum)        |           +-------------------------+
| civic_points     |           | latitude, longitude  |
+------------------+           | address, landmark    |           +-------------------------+
                               | image, resolution_img| 1       * |    COMPLAINT_UPVOTE     |
                               | assigned_dept        |-----------+-------------------------+
                               | assigned_officer (FK)|           | id (PK)                 |
                               | duplicate_of (FK)    |           | complaint_id (FK)       |
                               | upvotes_count        |           | user_id (FK)            |
                               | created_at, resolved |           | created_at              |
                               +----------------------+           +-------------------------+
```
