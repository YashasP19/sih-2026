"""
Complaint Module API URL Routing
"""
from django.urls import path
from apps.complaints.views import (
    ComplaintListCreateView,
    ComplaintDetailView,
    MyComplaintsView,
    DepartmentComplaintsView,
    UpdateComplaintStatusView,
    ClaimComplaintView,
    ToggleUpvoteView,
    ComplaintGeoListView
)

app_name = 'complaints'

urlpatterns = [
    path('', ComplaintListCreateView.as_view(), name='complaint_list_create'),
    path('<int:pk>/', ComplaintDetailView.as_view(), name='complaint_detail'),
    path('my/', MyComplaintsView.as_view(), name='my_complaints'),
    path('department-queue/', DepartmentComplaintsView.as_view(), name='department_queue'),
    path('<int:pk>/status/', UpdateComplaintStatusView.as_view(), name='update_status'),
    path('<int:pk>/claim/', ClaimComplaintView.as_view(), name='claim_complaint'),
    path('<int:pk>/upvote/', ToggleUpvoteView.as_view(), name='toggle_upvote'),
    path('geo-pins/', ComplaintGeoListView.as_view(), name='geo_pins'),
]
