"""
Comprehensive Demo Data Seeder for CivicSense AI Platform
Seeds test users (Citizens, Department Officers, Admins) and realistic civic grievances.
"""
import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

# Initialize Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'grievance_system.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from apps.complaints.models import Complaint, ComplaintActivityLog, ComplaintUpvote
from core.constants import (
    ROLE_CITIZEN, ROLE_OFFICER, ROLE_ADMIN,
    DEPT_ROADS, DEPT_SANITATION, DEPT_ELECTRICITY, DEPT_WATER_SUPPLY, DEPT_DRAINAGE, DEPT_PUBLIC_SAFETY,
    STATUS_PENDING, STATUS_VERIFIED, STATUS_IN_PROGRESS, STATUS_RESOLVED,
    URGENCY_CRITICAL, URGENCY_HIGH, URGENCY_MEDIUM, URGENCY_LOW
)

User = get_user_model()


def seed_database():
    print("[*] Starting CivicSense AI Data Seeding...")

    # 1. Create Super Admin
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@civicsense.gov.in',
            'first_name': 'Municipal',
            'last_name': 'Commissioner',
            'role': ROLE_ADMIN,
            'is_staff': True,
            'is_superuser': True,
            'is_verified': True,
            'designation': 'Chief Municipal Commissioner',
            'ward_number': 'HQ Zone'
        }
    )
    admin_user.set_password('Admin@123')
    admin_user.save()
    print("[+] Created Super Admin: admin / Admin@123")

    # 2. Create Citizens
    citizen_1, _ = User.objects.get_or_create(
        username='arun_citizen',
        defaults={
            'email': 'arun.verma@example.com',
            'first_name': 'Arun',
            'last_name': 'Verma',
            'role': ROLE_CITIZEN,
            'phone_number': '+919876543210',
            'ward_number': 'Ward 12 - Connaught Place',
            'civic_points': 140,
            'is_verified': True
        }
    )
    citizen_1.set_password('Citizen@123')
    citizen_1.save()

    citizen_2, _ = User.objects.get_or_create(
        username='priya_citizen',
        defaults={
            'email': 'priya.sharma@example.com',
            'first_name': 'Priya',
            'last_name': 'Sharma',
            'role': ROLE_CITIZEN,
            'phone_number': '+919876543211',
            'ward_number': 'Ward 08 - Karol Bagh',
            'civic_points': 90,
            'is_verified': True
        }
    )
    citizen_2.set_password('Citizen@123')
    citizen_2.save()
    print("[+] Created Citizens: arun_citizen, priya_citizen / Citizen@123")

    # 3. Create Department Officers
    officer_roads, _ = User.objects.get_or_create(
        username='officer_roads',
        defaults={
            'email': 'rajesh.pwd@civicsense.gov.in',
            'first_name': 'Rajesh',
            'last_name': 'Gupta',
            'role': ROLE_OFFICER,
            'department': DEPT_ROADS,
            'designation': 'Executive Engineer - PWD Roads',
            'ward_number': 'Central Zone',
            'phone_number': '+919811223344',
            'is_verified': True
        }
    )
    officer_roads.set_password('Officer@123')
    officer_roads.save()

    officer_sanitation, _ = User.objects.get_or_create(
        username='officer_sanitation',
        defaults={
            'email': 'sunita.swm@civicsense.gov.in',
            'first_name': 'Dr. Sunita',
            'last_name': 'Rao',
            'role': ROLE_OFFICER,
            'department': DEPT_SANITATION,
            'designation': 'Chief Health & Sanitation Officer',
            'ward_number': 'North Zone',
            'phone_number': '+919811223355',
            'is_verified': True
        }
    )
    officer_sanitation.set_password('Officer@123')
    officer_sanitation.save()

    officer_power, _ = User.objects.get_or_create(
        username='officer_power',
        defaults={
            'email': 'anil.power@civicsense.gov.in',
            'first_name': 'Anil',
            'last_name': 'Deshmukh',
            'role': ROLE_OFFICER,
            'department': DEPT_ELECTRICITY,
            'designation': 'Assistant Electrical Engineer',
            'ward_number': 'East Zone',
            'phone_number': '+919811223366',
            'is_verified': True
        }
    )
    officer_power.set_password('Officer@123')
    officer_power.save()
    print("[+] Created Department Officers: officer_roads, officer_sanitation, officer_power / Officer@123")

    # 4. Create Realistic Civic Complaints
    now = timezone.now()

    sample_complaints = [
        {
            'ticket_id': 'CIV-2026-8921',
            'citizen': citizen_1,
            'title': 'High Voltage Electric Cable Sparking near School Gate',
            'description': 'An exposed high tension electric cable is sparking continuously right next to Bal Bharti School main entry gate. Extreme danger of electric shock to children and pedestrians during monsoon rains. Immediate power cutoff and insulation required.',
            'category': 'STREETLIGHT_POWER',
            'urgency': URGENCY_CRITICAL,
            'priority_score': 95,
            'status': STATUS_IN_PROGRESS,
            'assigned_department': DEPT_ELECTRICITY,
            'assigned_officer': officer_power,
            'latitude': 28.6328,
            'longitude': 77.2197,
            'address': 'Gate No. 2, Bal Bharti School Road, Block B, Connaught Place',
            'landmark': 'Opposite Metro Gate 4',
            'ward_number': 'Ward 12',
            'pincode': '110001',
            'keywords': ['sparking', 'electric cable', 'school gate', 'electric shock', 'danger'],
            'upvotes_count': 18,
            'created_at': now - timedelta(hours=3),
        },
        {
            'ticket_id': 'CIV-2026-7840',
            'citizen': citizen_2,
            'title': 'Dangerous Open Manhole without Warning Barricade on Main Market Road',
            'description': 'A deep drainage manhole cover is completely missing on the busy pedestrian market street. Two two-wheelers already skidded yesterday night. Extremely accident prone area for elderly and children.',
            'category': 'PUBLIC_SAFETY_HAZARD',
            'urgency': URGENCY_CRITICAL,
            'priority_score': 92,
            'status': STATUS_VERIFIED,
            'assigned_department': DEPT_PUBLIC_SAFETY,
            'assigned_officer': None,
            'latitude': 28.6517,
            'longitude': 77.1906,
            'address': 'Ajmal Khan Road, Near Central Bank, Karol Bagh',
            'landmark': 'Near Gurudwara Crossing',
            'ward_number': 'Ward 08',
            'pincode': '110005',
            'keywords': ['open manhole', 'accident prone', 'manhole cover', 'market road'],
            'upvotes_count': 24,
            'created_at': now - timedelta(hours=6),
        },
        {
            'ticket_id': 'CIV-2026-6512',
            'citizen': citizen_1,
            'title': 'Severe Pothole Cluster Causing Daily Traffic Snarls',
            'description': 'Over 8 large deep craters have formed on the main flyover descent road. Vehicles are forced to brake suddenly leading to severe traffic congestion and damage to vehicles.',
            'category': 'ROADS_POTHOLES',
            'urgency': URGENCY_HIGH,
            'priority_score': 78,
            'status': STATUS_IN_PROGRESS,
            'assigned_department': DEPT_ROADS,
            'assigned_officer': officer_roads,
            'latitude': 28.6289,
            'longitude': 77.2065,
            'address': 'Panchkuian Marg Flyover Descent, Near Ramakrishna Ashram',
            'landmark': 'Flyover Pillar 14',
            'ward_number': 'Ward 12',
            'pincode': '110001',
            'keywords': ['potholes', 'road damage', 'traffic jam', 'flyover'],
            'upvotes_count': 12,
            'created_at': now - timedelta(days=1, hours=4),
        },
        {
            'ticket_id': 'CIV-2026-5419',
            'citizen': citizen_2,
            'title': 'Massive Overflowing Garbage Dump Emitting Toxic Smell',
            'description': 'The municipal garbage vat has not been cleared for 4 days. Waste is spilling onto the main road, attracting stray dogs and cattle, and blocking pedestrian movement.',
            'category': 'WASTE_GARBAGE',
            'urgency': URGENCY_HIGH,
            'priority_score': 74,
            'status': STATUS_RESOLVED,
            'assigned_department': DEPT_SANITATION,
            'assigned_officer': officer_sanitation,
            'resolution_notes': 'Sanitation truck deployed at 08:30 AM. 4 tonnes of waste lifted, area thoroughly disinfected with lime powder and bleaching solution.',
            'resolved_at': now - timedelta(hours=2),
            'latitude': 28.6480,
            'longitude': 77.1850,
            'address': 'Sector 4 Community Center Lane, Karol Bagh',
            'landmark': 'Beside Mother Dairy Booth',
            'ward_number': 'Ward 08',
            'pincode': '110005',
            'keywords': ['overflowing garbage', 'waste dump', 'foul smell', 'sanitation'],
            'upvotes_count': 9,
            'created_at': now - timedelta(days=2),
        },
        {
            'ticket_id': 'CIV-2026-4190',
            'citizen': citizen_1,
            'title': 'Drinking Water Pipeline Burst Flooding Residential Lane',
            'description': 'The main 6-inch freshwater supply pipeline has ruptured. Clean drinking water is flowing wastefully into the storm drain while entire neighborhood has zero tap water pressure.',
            'category': 'WATER_LEAKAGE',
            'urgency': URGENCY_HIGH,
            'priority_score': 72,
            'status': STATUS_PENDING,
            'assigned_department': DEPT_WATER_SUPPLY,
            'assigned_officer': None,
            'latitude': 28.6360,
            'longitude': 77.2150,
            'address': 'Street 7, Minto Road Housing Complex',
            'landmark': 'Near Community Park Gate',
            'ward_number': 'Ward 12',
            'pincode': '110002',
            'keywords': ['water pipeline burst', 'leakage', 'drinking water', 'no pressure'],
            'upvotes_count': 15,
            'created_at': now - timedelta(hours=12),
        },
        {
            'ticket_id': 'CIV-2026-3021',
            'citizen': citizen_2,
            'title': 'Choked Drainage Overflowing onto Residential Streets',
            'description': 'Heavy sewage backflow from underground sewer line. Black foul-smelling water has submerged 50 meters of the lane outside houses, leading to mosquito breeding.',
            'category': 'DRAINAGE_OVERFLOW',
            'urgency': URGENCY_MEDIUM,
            'priority_score': 58,
            'status': STATUS_IN_PROGRESS,
            'assigned_department': DEPT_DRAINAGE,
            'assigned_officer': None,
            'latitude': 28.6550,
            'longitude': 77.1950,
            'address': 'Lane 3, East Patel Nagar',
            'landmark': 'Behind Post Office',
            'ward_number': 'Ward 08',
            'pincode': '110008',
            'keywords': ['choked drainage', 'sewer overflow', 'foul water', 'mosquitoes'],
            'upvotes_count': 7,
            'created_at': now - timedelta(days=1),
        },
        {
            'ticket_id': 'CIV-2026-2105',
            'citizen': citizen_1,
            'title': 'Streetlights Non-Functional for 10 Consecutive Days',
            'description': 'Entire 400-meter stretch of the residential lane is pitch dark due to faulty phase connection on 6 lampposts. Residents feel unsafe walking after sunset.',
            'category': 'STREETLIGHT_POWER',
            'urgency': URGENCY_MEDIUM,
            'priority_score': 52,
            'status': STATUS_RESOLVED,
            'assigned_department': DEPT_ELECTRICITY,
            'assigned_officer': officer_power,
            'resolution_notes': 'LED luminaire replacements completed. Underground timer switch reset and verified working.',
            'resolved_at': now - timedelta(days=1),
            'latitude': 28.6310,
            'longitude': 77.2220,
            'address': 'Barakhamba Lane, Behind Statesman House',
            'landmark': 'Near Fire Station',
            'ward_number': 'Ward 12',
            'pincode': '110001',
            'keywords': ['streetlights off', 'dark lane', 'safety', 'bulbs'],
            'upvotes_count': 11,
            'created_at': now - timedelta(days=3),
        }
    ]

    for comp_data in sample_complaints:
        c_obj, created = Complaint.objects.get_or_create(
            ticket_id=comp_data['ticket_id'],
            defaults=comp_data
        )
        if created:
            # Create Audit Log
            ComplaintActivityLog.objects.create(
                complaint=c_obj,
                performed_by=c_obj.citizen,
                action='SUBMITTED',
                new_status=STATUS_PENDING,
                remarks=f"Grievance lodged by citizen. AI auto-assigned priority {c_obj.priority_score}/100.",
                timestamp=c_obj.created_at
            )
            if c_obj.status in [STATUS_IN_PROGRESS, STATUS_RESOLVED]:
                ComplaintActivityLog.objects.create(
                    complaint=c_obj,
                    performed_by=c_obj.assigned_officer or admin_user,
                    action=f'STATUS_{c_obj.status}',
                    old_status=STATUS_PENDING,
                    new_status=c_obj.status,
                    remarks=c_obj.resolution_notes or f"Assigned to {c_obj.get_assigned_department_display()} response team.",
                    timestamp=c_obj.created_at + timedelta(hours=1)
                )

    print(f"[+] Successfully seeded {len(sample_complaints)} sample civic grievances with GPS coordinates and AI priority scoring!")


if __name__ == '__main__':
    seed_database()
