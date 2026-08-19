"""
User Authentication and Profile URL Routes
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import (
    CustomTokenObtainPairView,
    RegisterView,
    CurrentUserProfileView,
    ChangePasswordView,
    DepartmentOfficerListView
)

app_name = 'users'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', CurrentUserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('officers/', DepartmentOfficerListView.as_view(), name='officers_list'),
]
