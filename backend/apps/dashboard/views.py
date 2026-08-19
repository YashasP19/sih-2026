"""
Dashboard and Transparency API Views for Urban Lens
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from apps.dashboard.analytics import CivicAnalyticsService
from core.permissions import IsOfficerOrAdmin, IsAdminUserRole
from apps.complaints.models import Complaint
from core.constants import STATUS_PENDING, STATUS_IN_PROGRESS, STATUS_RESOLVED, ROLE_CITIZEN, ROLE_OFFICER, ROLE_ADMIN

User = get_user_model()


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


class LeaderboardView(APIView):
    """
    Public civic karma leaderboard: top citizens by points earned for
    verified reports, and top officers/admins by grievances resolved.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        top_citizens = User.objects.filter(role=ROLE_CITIZEN).order_by('-civic_points')[:20]
        citizen_rows = [
            {
                'id': u.id,
                'username': u.username,
                'display_name': f"{u.first_name} {u.last_name}".strip() or u.username,
                'ward_number': u.ward_number,
                'civic_points': u.civic_points,
            }
            for u in top_citizens
        ]

        top_officers = (
            User.objects.filter(role__in=[ROLE_OFFICER, ROLE_ADMIN])
            .annotate(
                resolved_count=Count(
                    'assigned_complaints',
                    filter=Q(assigned_complaints__status=STATUS_RESOLVED),
                )
            )
            .order_by('-resolved_count', '-civic_points')[:20]
        )
        officer_rows = [
            {
                'id': u.id,
                'username': u.username,
                'display_name': f"{u.first_name} {u.last_name}".strip() or u.username,
                'department': u.get_department_display() if hasattr(u, 'get_department_display') else u.department,
                'role_display': u.get_role_display(),
                'resolved_count': u.resolved_count,
                'civic_points': u.civic_points,
            }
            for u in top_officers
        ]

        return Response({
            'success': True,
            'data': {
                'top_citizens': citizen_rows,
                'top_officers': officer_rows,
            }
        }, status=status.HTTP_200_OK)
