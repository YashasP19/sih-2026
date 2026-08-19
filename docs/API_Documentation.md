# Urban Lens: REST API Documentation

**Base API URL:** `http://127.0.0.1:8000/api/v1`  
**Authentication Scheme:** `Authorization: Bearer <access_jwt_token>`

---

## 1. Authentication Endpoints

### 1.1 User Login (Obtain JWT Pair)
- **Endpoint:** `POST /auth/login/`
- **Access:** Public
- **Request Body:**
```json
{
  "username": "arun_citizen",
  "password": "Citizen@123"
}
```
- **Response (200 OK):**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "arun_citizen",
    "email": "arun.verma@example.com",
    "first_name": "Arun",
    "last_name": "Verma",
    "role": "CITIZEN",
    "role_display": "Citizen",
    "department": null,
    "ward_number": "Ward 12 - Connaught Place",
    "civic_points": 140
  }
}
```

### 1.2 User Registration
- **Endpoint:** `POST /auth/register/`
- **Access:** Public
- **Request Body:**
```json
{
  "username": "priya_sharma",
  "email": "priya@example.com",
  "password": "Password@123",
  "password_confirm": "Password@123",
  "first_name": "Priya",
  "last_name": "Sharma",
  "role": "CITIZEN",
  "phone_number": "+919876543210",
  "ward_number": "Ward 8"
}
```

### 1.3 Refresh Access Token
- **Endpoint:** `POST /auth/token/refresh/`
- **Request Body:** `{"refresh": "<refresh_token>"}`

---

## 2. AI Intelligence Engine Endpoints

### 2.1 Real-Time NLP Analysis & Preview
- **Endpoint:** `POST /ai/analyze/`
- **Access:** Public
- **Request Body:**
```json
{
  "title": "High voltage live electric wire sparking continuously near school gate",
  "description": "Exposed cable fell down after rain. Children entering school are in extreme danger of shock.",
  "latitude": 28.6328,
  "longitude": 77.2197
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "analysis": {
    "predicted_category": "STREETLIGHT_POWER",
    "confidence": 0.94,
    "suggested_department": "ELECTRICITY",
    "urgency": "CRITICAL",
    "priority_score": 95,
    "priority_factors": {
      "base_score": 65,
      "keyword_bonus": 25,
      "density_bonus": 5,
      "matched_critical_keywords": ["sparking", "live wire", "school gate"]
    },
    "extracted_keywords": ["sparking", "electric wire", "school gate", "exposed cable", "shock"],
    "duplicate_check": {
      "is_duplicate": false
    }
  }
}
```

---

## 3. Complaints & Grievance Endpoints

### 3.1 List All Complaints (with Faceted Filtering)
- **Endpoint:** `GET /complaints/`
- **Query Parameters:**
  - `status`: `PENDING` | `VERIFIED` | `IN_PROGRESS` | `RESOLVED`
  - `category`: `ROADS_POTHOLES` | `WASTE_GARBAGE` | `STREETLIGHT_POWER` | `WATER_LEAKAGE` | `DRAINAGE_OVERFLOW` | `PUBLIC_SAFETY_HAZARD`
  - `urgency`: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW`
  - `search`: `<keyword or ticket_id>`
  - `page`: `<page_number>`

### 3.2 Submit a New Grievance
- **Endpoint:** `POST /complaints/`
- **Access:** Authenticated (Citizen/Officer)
- **Content-Type:** `multipart/form-data`
- **Payload:**
  - `title`: `Dangerous open manhole on market street`
  - `description`: `Manhole cover is completely broken. High accident risk.`
  - `category`: `PUBLIC_SAFETY_HAZARD` *(Optional - AI auto-predicts if omitted)*
  - `latitude`: `28.6517`
  - `longitude`: `77.1906`
  - `address`: `Ajmal Khan Road, Karol Bagh`
  - `landmark`: `Near Central Bank`
  - `ward_number`: `Ward 08`
  - `image`: `<binary_image_file>`

### 3.3 Retrieve Complaint Details & Audit Trail
- **Endpoint:** `GET /complaints/<id>/`
- **Response (200 OK):**
```json
{
  "id": 1,
  "ticket_id": "CIV-2026-8921",
  "title": "High Voltage Electric Cable Sparking near School Gate",
  "description": "An exposed high tension electric cable is sparking continuously...",
  "category": "STREETLIGHT_POWER",
  "category_display": "Streetlight Not Working / Sparking Cables",
  "urgency": "CRITICAL",
  "priority_score": 95,
  "status": "IN_PROGRESS",
  "status_display": "In Progress / Assigned to Field Team",
  "latitude": 28.6328000,
  "longitude": 77.2197000,
  "address": "Gate No. 2, Bal Bharti School Road, Connaught Place",
  "assigned_department": "ELECTRICITY",
  "assigned_officer": {
    "username": "officer_power",
    "first_name": "Anil",
    "last_name": "Deshmukh",
    "designation": "Assistant Electrical Engineer"
  },
  "upvotes_count": 18,
  "activity_logs": [
    {
      "id": 2,
      "action": "STATUS_IN_PROGRESS",
      "old_status": "PENDING",
      "new_status": "IN_PROGRESS",
      "remarks": "Assigned to Electricity response team.",
      "performed_by_name": "Municipal Commissioner",
      "timestamp": "2026-08-09T14:30:00Z"
    },
    {
      "id": 1,
      "action": "SUBMITTED",
      "new_status": "PENDING",
      "remarks": "Grievance submitted by Arun Verma. AI auto-assigned priority 95/100.",
      "performed_by_name": "Arun Verma",
      "timestamp": "2026-08-09T13:30:00Z"
    }
  ]
}
```

### 3.4 Update Status / Field Action (Officers/Admins Only)
- **Endpoint:** `POST /complaints/<id>/status/`
- **Access:** Officer / Admin
- **Request Body:**
```json
{
  "status": "RESOLVED",
  "remarks": "Insulated and replaced damaged overhead transformer wire. Power restored safely.",
  "assigned_officer_id": 4
}
```

### 3.5 Upvote / Endorse Community Grievance
- **Endpoint:** `POST /complaints/<id>/upvote/`
- **Access:** Authenticated Citizen

### 3.6 Geo-Spatial Map Pins Endpoint
- **Endpoint:** `GET /complaints/geo-pins/`
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 7,
  "pins": [
    {
      "id": 1,
      "ticket_id": "CIV-2026-8921",
      "title": "High Voltage Electric Cable Sparking",
      "category": "STREETLIGHT_POWER",
      "urgency": "CRITICAL",
      "priority_score": 95,
      "status": "IN_PROGRESS",
      "latitude": 28.6328,
      "longitude": 77.2197,
      "upvotes_count": 18
    }
  ]
}
```

---

## 4. Public Transparency & Dashboard Endpoints

### 4.1 City-Wide Transparency Metrics
- **Endpoint:** `GET /dashboard/public/`
- **Access:** Public
- **Response Structure:** Includes overall KPIs, department resolution leaderboards, sector distribution percentages, and 7-day velocity trend lines.

### 4.2 Admin Executive Dashboard Metrics
- **Endpoint:** `GET /dashboard/admin/`
- **Access:** Officer / Admin
