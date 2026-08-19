"""
Core constants for CivicSense AI Platform
"""

# User Roles
ROLE_CITIZEN = 'CITIZEN'
ROLE_OFFICER = 'OFFICER'
ROLE_ADMIN = 'ADMIN'

ROLE_CHOICES = (
    (ROLE_CITIZEN, 'Citizen'),
    (ROLE_OFFICER, 'Department Officer'),
    (ROLE_ADMIN, 'Municipal Administrator'),
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
