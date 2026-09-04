"""
Societal Innovation Collaboration API URL Routing
"""
from django.urls import path
from apps.innovation.views import (
    UniversityListView,
    IndustryPartnerListView,
    RoutedChallengeListView,
    ChallengeTimelineView,
    ClaimChallengeView,
    InnovationProjectListView,
    InnovationProjectDetailView,
    ProjectStatusUpdateView,
    ProjectMilestoneCreateView,
    MilestoneStatusUpdateView,
    OfferSupportView,
    SupportOfferListView,
    SupportOfferRespondView,
    InnovationStatsView,
    StudentContributionCreateView,
    StudentInnovationRecordView,
)

app_name = 'innovation'

urlpatterns = [
    path('universities/', UniversityListView.as_view(), name='university_list'),
    path('partners/', IndustryPartnerListView.as_view(), name='partner_list'),

    path('challenges/', RoutedChallengeListView.as_view(), name='routed_challenges'),
    path('challenges/<int:pk>/timeline/', ChallengeTimelineView.as_view(), name='challenge_timeline'),
    path('challenges/<int:pk>/claim/', ClaimChallengeView.as_view(), name='claim_challenge'),

    path('projects/', InnovationProjectListView.as_view(), name='project_list'),
    path('projects/<int:pk>/', InnovationProjectDetailView.as_view(), name='project_detail'),
    path('projects/<int:pk>/status/', ProjectStatusUpdateView.as_view(), name='project_status'),
    path('projects/<int:pk>/milestones/', ProjectMilestoneCreateView.as_view(), name='project_milestone_create'),
    path('projects/<int:pk>/support/', OfferSupportView.as_view(), name='offer_support'),
    path('projects/<int:pk>/contributions/', StudentContributionCreateView.as_view(), name='add_student_contribution'),

    path('milestones/<int:pk>/status/', MilestoneStatusUpdateView.as_view(), name='milestone_status'),

    path('support-offers/', SupportOfferListView.as_view(), name='support_offer_list'),
    path('support-offers/<int:pk>/respond/', SupportOfferRespondView.as_view(), name='support_offer_respond'),

    path('stats/', InnovationStatsView.as_view(), name='innovation_stats'),
    path('student-record/', StudentInnovationRecordView.as_view(), name='student_innovation_record'),
]
