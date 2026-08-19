"""
Dashboard and Analytics URL Routing
"""
from django.urls import path
from apps.dashboard.views import (
    PublicTransparencyDashboardView,
    AdminExecutiveDashboardView,
    OfficerSummaryDashboardView,
    LeaderboardView
)

app_name = 'dashboard'

urlpatterns = [
    path('public/', PublicTransparencyDashboardView.as_view(), name='public_transparency'),
    path('admin/', AdminExecutiveDashboardView.as_view(), name='admin_executive'),
    path('officer/', OfficerSummaryDashboardView.as_view(), name='officer_summary'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]
