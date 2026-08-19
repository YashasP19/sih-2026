"""
Integration and End-to-End Tests for Complaints & Lifecycle Workflow
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.complaints.models import Complaint, ComplaintActivityLog
from apps.complaints.services import ComplaintService

User = get_user_model()


class ComplaintAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.citizen = User.objects.create_user(
            username='test_citizen',
            email='citizen@test.com',
            password='Password@123',
            role='CITIZEN'
        )
        self.officer = User.objects.create_user(
            username='test_officer',
            email='officer@test.com',
            password='Password@123',
            role='OFFICER',
            department='ELECTRICITY'
        )

    def test_complaint_creation_with_ai_enrichment(self):
        self.client.force_authenticate(user=self.citizen)
        payload = {
            'title': 'High Voltage Cable Sparking near school entrance',
            'description': 'Live exposed wires sparking violently in rain. High hazard of electric shock.',
            'latitude': 28.6328,
            'longitude': 77.2197,
            'address': 'Connaught Place, Delhi',
            'ward_number': 'Ward 12'
        }
        response = self.client.post('/api/v1/complaints/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        
        # Verify AI populated metadata
        complaint = Complaint.objects.get(ticket_id=response.data['complaint']['ticket_id'])
        self.assertEqual(complaint.category, 'STREETLIGHT_POWER')
        self.assertEqual(complaint.assigned_department, 'ELECTRICITY')
        self.assertEqual(complaint.urgency, 'CRITICAL')
        self.assertGreaterEqual(complaint.priority_score, 85)
        
        # Verify audit log created
        log = ComplaintActivityLog.objects.filter(complaint=complaint).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.action, 'SUBMITTED')

    def test_status_update_workflow(self):
        complaint = ComplaintService.create_complaint(
            citizen=self.citizen,
            data={
                'title': 'Open manhole on market street',
                'description': 'Dangerous missing cover causing accident risk',
                'category': 'PUBLIC_SAFETY_HAZARD',
                'latitude': 28.6517,
                'longitude': 77.1906
            }
        )

        # Officer updates status to IN_PROGRESS
        self.client.force_authenticate(user=self.officer)
        res = self.client.post(f'/api/v1/complaints/{complaint.id}/status/', {
            'status': 'IN_PROGRESS',
            'remarks': 'Barricade installed. Replacement cover dispatched.'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        complaint.refresh_from_db()
        self.assertEqual(complaint.status, 'IN_PROGRESS')

    def test_public_transparency_dashboard(self):
        res = self.client.get('/api/v1/dashboard/public/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue('kpis' in res.data['data'])
        self.assertTrue('department_performance' in res.data['data'])
