"""
Core permissions for Role-Based Access Control (RBAC) in CivicSense AI
"""
from rest_framework import permissions
from core.constants import ROLE_CITIZEN, ROLE_OFFICER, ROLE_ADMIN


class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to Municipal Administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == ROLE_ADMIN or request.user.is_superuser or request.user.is_staff)
        )


class IsOfficerOrAdmin(permissions.BasePermission):
    """Allows access to Department Officers and Administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [ROLE_OFFICER, ROLE_ADMIN] or 
            getattr(request.user, 'is_superuser', False)
        )


class IsCitizen(permissions.BasePermission):
    """Allows access only to Citizens."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == ROLE_CITIZEN
        )


class IsOwnerOrOfficerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object,
    assigned department officers, or admins to edit/view it.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin has full access
        if request.user.role == ROLE_ADMIN or request.user.is_superuser:
            return True

        # Department Officer can view/update complaints in their department
        if request.user.role == ROLE_OFFICER:
            if hasattr(obj, 'assigned_department') and obj.assigned_department == request.user.department:
                return True
            if hasattr(obj, 'assigned_officer') and obj.assigned_officer == request.user:
                return True

        # Citizen can view/update their own complaints
        if hasattr(obj, 'citizen'):
            return obj.citizen == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user

        return False
