"""
Core constants for Urban Lens Platform
"""

# User Roles
ROLE_CITIZEN = 'CITIZEN'
ROLE_OFFICER = 'OFFICER'
ROLE_ADMIN = 'ADMIN'
ROLE_UNIVERSITY = 'UNIVERSITY'
ROLE_INDUSTRY = 'INDUSTRY'

ROLE_CHOICES = (
    (ROLE_CITIZEN, 'Citizen'),
    (ROLE_OFFICER, 'Department Officer'),
    (ROLE_ADMIN, 'Municipal Administrator'),
    (ROLE_UNIVERSITY, 'University / HEI Coordinator'),
    (ROLE_INDUSTRY, 'Industry / Startup Partner'),
)

# Municipal Departments & Categories
DEPT_ROADS = 'ROADS'
DEPT_SANITATION = 'SANITATION'
DEPT_ELECTRICITY = 'ELECTRICITY'
DEPT_WATER_SUPPLY = 'WATER_SUPPLY'
DEPT_DRAINAGE = 'DRAINAGE'
DEPT_PUBLIC_SAFETY = 'PUBLIC_SAFETY'
DEPT_HEALTHCARE = 'HEALTHCARE'
DEPT_GENERAL = 'GENERAL'

DEPARTMENT_CHOICES = (
    (DEPT_ROADS, 'Roads & Infrastructure (PWD)'),
    (DEPT_SANITATION, 'Solid Waste & Sanitation'),
    (DEPT_ELECTRICITY, 'Electricity & Streetlighting'),
    (DEPT_WATER_SUPPLY, 'Water Supply Board'),
    (DEPT_DRAINAGE, 'Drainage & Sewage'),
    (DEPT_PUBLIC_SAFETY, 'Public Safety & Law Enforcement'),
    (DEPT_HEALTHCARE, 'Public Health & Pollution Control'),
    (DEPT_GENERAL, 'General Municipal Administration'),
)

CATEGORY_CHOICES = (
    ('ROADS_POTHOLES', 'Road Damage / Potholes / Footpaths'),
    ('WASTE_GARBAGE', 'Garbage Dump / Overflowing Bins / Cleanliness'),
    ('STREETLIGHT_POWER', 'Streetlight Not Working / Sparking Cables'),
    ('WATER_LEAKAGE', 'Water Pipeline Leakage / Contamination / Low Pressure'),
    ('DRAINAGE_OVERFLOW', 'Blocked Drains / Sewage Overflow / Flooding'),
    ('PUBLIC_SAFETY_HAZARD', 'Open Manhole / Unsafe Building / Stray Animals'),
    ('POLLUTION_AIR_NOISE', 'Air / Noise / Industrial Pollution / Illegal Burning'),
    ('OTHER', 'Other Civic Grievance'),
)

# Mapping Category to Responsible Department
CATEGORY_TO_DEPARTMENT = {
    'ROADS_POTHOLES': DEPT_ROADS,
    'WASTE_GARBAGE': DEPT_SANITATION,
    'STREETLIGHT_POWER': DEPT_ELECTRICITY,
    'WATER_LEAKAGE': DEPT_WATER_SUPPLY,
    'DRAINAGE_OVERFLOW': DEPT_DRAINAGE,
    'PUBLIC_SAFETY_HAZARD': DEPT_PUBLIC_SAFETY,
    ('POLLUTION_AIR_NOISE'): DEPT_HEALTHCARE,
    'OTHER': DEPT_GENERAL,
}

# Complaint Status Lifecycle
STATUS_PENDING = 'PENDING'
STATUS_VERIFIED = 'VERIFIED'
STATUS_IN_PROGRESS = 'IN_PROGRESS'
STATUS_RESOLVED = 'RESOLVED'
STATUS_REJECTED = 'REJECTED'

STATUS_CHOICES = (
    (STATUS_PENDING, 'Submitted / Pending Review'),
    (STATUS_VERIFIED, 'Verified by AI & Officer'),
    (STATUS_IN_PROGRESS, 'In Progress / Assigned to Field Team'),
    (STATUS_RESOLVED, 'Resolved & Closed'),
    (STATUS_REJECTED, 'Rejected / Duplicate / Invalid'),
)

# Urgency Levels
URGENCY_LOW = 'LOW'
URGENCY_MEDIUM = 'MEDIUM'
URGENCY_HIGH = 'HIGH'
URGENCY_CRITICAL = 'CRITICAL'

URGENCY_CHOICES = (
    (URGENCY_LOW, 'Low Priority'),
    (URGENCY_MEDIUM, 'Medium Priority'),
    (URGENCY_HIGH, 'High Urgency'),
    (URGENCY_CRITICAL, 'Critical / Emergency Hazard'),
)

# AI Thresholds
SIMILARITY_DUPLICATE_THRESHOLD = 0.65  # Cosine similarity score
MAX_DUPLICATE_RADIUS_METERS = 500      # 500 meters geo-radius
HIGH_DENSITY_COMPLAINT_COUNT = 3       # 3+ complaints in same zone triggers priority boost


# ---------------------------------------------------------------------------
# Societal Innovation Layer
# Thematic domains used to route validated challenges to Higher Education
# Institutions based on academic discipline, rather than to a civic department.
# ---------------------------------------------------------------------------
DOMAIN_EDUCATION = 'EDUCATION'
DOMAIN_AGRICULTURE = 'AGRICULTURE'
DOMAIN_HEALTHCARE = 'HEALTHCARE'
DOMAIN_WATER = 'WATER'
DOMAIN_ENVIRONMENT = 'ENVIRONMENT'
DOMAIN_ENERGY = 'ENERGY'
DOMAIN_URBAN_DEV = 'URBAN_DEV'
DOMAIN_ACCESSIBILITY = 'ACCESSIBILITY'
DOMAIN_PUBLIC_ADMIN = 'PUBLIC_ADMIN'
DOMAIN_RURAL_LIVELIHOOD = 'RURAL_LIVELIHOOD'
DOMAIN_OTHER = 'OTHER'

DOMAIN_CHOICES = (
    (DOMAIN_EDUCATION, 'Education & Skilling'),
    (DOMAIN_AGRICULTURE, 'Agriculture & Allied Sectors'),
    (DOMAIN_HEALTHCARE, 'Healthcare & Public Health'),
    (DOMAIN_WATER, 'Water Resources & Sanitation'),
    (DOMAIN_ENVIRONMENT, 'Environment & Climate'),
    (DOMAIN_ENERGY, 'Energy & Renewables'),
    (DOMAIN_URBAN_DEV, 'Urban Development & Infrastructure'),
    (DOMAIN_ACCESSIBILITY, 'Accessibility & Inclusion'),
    (DOMAIN_PUBLIC_ADMIN, 'Public Administration & Service Delivery'),
    (DOMAIN_RURAL_LIVELIHOOD, 'Rural Livelihoods & Employment'),
    (DOMAIN_OTHER, 'Other / Multidisciplinary'),
)

# Maps the AI-predicted civic category onto an academic thematic domain, so the
# existing NLP classifier drives university routing without retraining.
CATEGORY_TO_DOMAIN = {
    'ROADS_POTHOLES': DOMAIN_URBAN_DEV,
    'WASTE_GARBAGE': DOMAIN_ENVIRONMENT,
    'STREETLIGHT_POWER': DOMAIN_ENERGY,
    'WATER_LEAKAGE': DOMAIN_WATER,
    'DRAINAGE_OVERFLOW': DOMAIN_WATER,
    'PUBLIC_SAFETY_HAZARD': DOMAIN_URBAN_DEV,
    'POLLUTION_AIR_NOISE': DOMAIN_ENVIRONMENT,
    'OTHER': DOMAIN_OTHER,
}

# Project Lifecycle (university/industry collaboration on a claimed challenge)
PROJECT_PROPOSED = 'PROPOSED'
PROJECT_APPROVED = 'APPROVED'
PROJECT_IN_PROGRESS = 'IN_PROGRESS'
PROJECT_PROTOTYPE = 'PROTOTYPE'
PROJECT_TESTING = 'TESTING'
PROJECT_DEPLOYED = 'DEPLOYED'
PROJECT_ON_HOLD = 'ON_HOLD'
PROJECT_REJECTED = 'REJECTED'

PROJECT_STATUS_CHOICES = (
    (PROJECT_PROPOSED, 'Proposal Submitted'),
    (PROJECT_APPROVED, 'Proposal Approved'),
    (PROJECT_IN_PROGRESS, 'Research / Development In Progress'),
    (PROJECT_PROTOTYPE, 'Prototype Built'),
    (PROJECT_TESTING, 'Field Testing & Validation'),
    (PROJECT_DEPLOYED, 'Deployed in Community'),
    (PROJECT_ON_HOLD, 'On Hold'),
    (PROJECT_REJECTED, 'Rejected / Withdrawn'),
)

# Indicative completion used for progress bars on dashboards
PROJECT_STATUS_PROGRESS = {
    PROJECT_PROPOSED: 10,
    PROJECT_APPROVED: 25,
    PROJECT_IN_PROGRESS: 45,
    PROJECT_PROTOTYPE: 65,
    PROJECT_TESTING: 85,
    PROJECT_DEPLOYED: 100,
    PROJECT_ON_HOLD: 0,
    PROJECT_REJECTED: 0,
}

# Milestone tracking
MILESTONE_PENDING = 'PENDING'
MILESTONE_IN_PROGRESS = 'IN_PROGRESS'
MILESTONE_COMPLETED = 'COMPLETED'
MILESTONE_BLOCKED = 'BLOCKED'

MILESTONE_STATUS_CHOICES = (
    (MILESTONE_PENDING, 'Pending'),
    (MILESTONE_IN_PROGRESS, 'In Progress'),
    (MILESTONE_COMPLETED, 'Completed'),
    (MILESTONE_BLOCKED, 'Blocked'),
)

# Industry / startup support offered to a university project
SUPPORT_MENTORSHIP = 'MENTORSHIP'
SUPPORT_FUNDING = 'FUNDING'
SUPPORT_PROTOTYPING = 'PROTOTYPING'
SUPPORT_LAB_ACCESS = 'LAB_ACCESS'
SUPPORT_PILOT_DEPLOYMENT = 'PILOT_DEPLOYMENT'
SUPPORT_TECH_TRANSFER = 'TECH_TRANSFER'

SUPPORT_TYPE_CHOICES = (
    (SUPPORT_MENTORSHIP, 'Technical Mentorship'),
    (SUPPORT_FUNDING, 'Funding / CSR Grant'),
    (SUPPORT_PROTOTYPING, 'Prototyping Support'),
    (SUPPORT_LAB_ACCESS, 'Laboratory / Facility Access'),
    (SUPPORT_PILOT_DEPLOYMENT, 'Pilot Deployment Partner'),
    (SUPPORT_TECH_TRANSFER, 'Technology Transfer & Commercialisation'),
)

SUPPORT_OFFERED = 'OFFERED'
SUPPORT_ACCEPTED = 'ACCEPTED'
SUPPORT_DECLINED = 'DECLINED'

SUPPORT_STATUS_CHOICES = (
    (SUPPORT_OFFERED, 'Offered'),
    (SUPPORT_ACCEPTED, 'Accepted by Institution'),
    (SUPPORT_DECLINED, 'Declined'),
)
