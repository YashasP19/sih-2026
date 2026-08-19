"""
Dashboard and Transparency API Views for CivicSense AI
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.dashboard.analytics import CivicAnalyticsService
from core.permissions import IsOfficerOrAdmin, IsAdminUserRole
from apps.complaints.models import Complaint
from core.constants import STATUS_PENDING, STATUS_IN_PROGRESS, STATUS_RESOLVED


class PublicTransparencyDashboardView(APIView):
    """
    Publicly accessible endpoint for city-wide civic transparency metrics,
    charts, resolution rates, and department leaderboards.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        data = CivicAnalyticsService.get_public_transparency_metrics()
        return Response({
            'success': True,
            'data': data
        }, status=status.HTTP_200_OK)


class AdminExecutiveDashboardView(APIView):
    """
    Executive view for municipal administrators with operational KPIs,
    critical backlog counts, and department dispatch statistics.
    """
    permission_classes = [IsOfficerOrAdmin]

    def get(self, request):
        data = CivicAnalyticsService.get_admin_executive_metrics()
        return Response({
            'success': True,
            'data': data
        }, status=status.HTTP_200_OK)


class OfficerSummaryDashboardView(APIView):
    """
    Individual summary for a logged-in department officer.
    """
    permission_classes = [IsOfficerOrAdmin]

    def get(self, request):
        user = request.user
        dept = user.department or 'GENERAL'

        assigned_to_me = Complaint.objects.filter(assigned_officer=user)
        dept_complaints = Complaint.objects.filter(assigned_department=dept)

        return Response({
            'success': True,
            'officer_stats': {
                'department': user.get_department_display() if hasattr(user, 'get_department_display') else dept,
                'assigned_total': assigned_to_me.count(),
                'assigned_pending': assigned_to_me.filter(status=STATUS_PENDING).count(),
                'assigned_in_progress': assigned_to_me.filter(status=STATUS_IN_PROGRESS).count(),
                'assigned_resolved': assigned_to_me.filter(status=STATUS_RESOLVED).count(),
                'department_total_open': dept_complaints.exclude(status=STATUS_RESOLVED).count(),
            }
        }, status=status.HTTP_200_OK)
