"""
User specific permissions
"""
from core.permissions import IsCitizen, IsOfficerOrAdmin, IsAdminUserRole

__all__ = ['IsCitizen', 'IsOfficerOrAdmin', 'IsAdminUserRole']
