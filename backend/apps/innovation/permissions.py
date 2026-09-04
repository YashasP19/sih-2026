"""
Role-Based Access Control for the Societal Innovation Collaboration layer.
"""
from rest_framework import permissions
from core.constants import ROLE_ADMIN, ROLE_UNIVERSITY, ROLE_INDUSTRY


def _has_role(user, *roles):
    return bool(
        user
        and user.is_authenticated
        and (user.role in roles or user.is_superuser)
    )


class IsUniversityCoordinator(permissions.BasePermission):
    """University / HEI coordinators (and admins)."""
    message = 'Only registered university coordinators can perform this action.'

    def has_permission(self, request, view):
        return _has_role(request.user, ROLE_UNIVERSITY, ROLE_ADMIN)


class IsIndustryPartner(permissions.BasePermission):
    """Industry, startup, MSME, CSR and research-lab representatives (and admins)."""
    message = 'Only registered industry partners can perform this action.'

    def has_permission(self, request, view):
        return _has_role(request.user, ROLE_INDUSTRY, ROLE_ADMIN)
