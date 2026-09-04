"""
Custom User Model for Urban Lens
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from core.constants import ROLE_CHOICES, ROLE_CITIZEN, DEPARTMENT_CHOICES, DEPT_GENERAL


class User(AbstractUser):
    """
    Custom user supporting Citizens, Municipal Department Officers, and Admins.
    """
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_CITIZEN,
        db_index=True,
        help_text="Role determining platform permissions"
    )
    department = models.CharField(
        max_length=50,
        choices=DEPARTMENT_CHOICES,
        default=DEPT_GENERAL,
        blank=True,
        null=True,
        help_text="Assigned municipal department for government officers"
    )
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Contact number for SMS alerts and verification"
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text="Profile picture"
    )
    designation = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Official designation e.g. 'Senior Executive Engineer - PWD'"
    )
    ward_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Ward or Municipal Zone jurisdiction"
    )
    civic_points = models.PositiveIntegerField(
        default=50,
        help_text="Civic reputation reward score earned for verified grievance reports"
    )
    university = models.ForeignKey(
        'innovation.University',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='coordinators',
        help_text="Institution this coordinator represents (UNIVERSITY role)"
    )
    industry_partner = models.ForeignKey(
        'innovation.IndustryPartner',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='representatives',
        help_text="Partner organisation this user represents (INDUSTRY role)"
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Indicates if officer or citizen identity is verified"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_citizen(self):
        return self.role == 'CITIZEN'

    @property
    def is_officer(self):
        return self.role == 'OFFICER'

    @property
    def is_admin_role(self):
        return self.role == 'ADMIN' or self.is_superuser

    @property
    def is_university(self):
        return self.role == 'UNIVERSITY'

    @property
    def is_industry(self):
        return self.role == 'INDUSTRY'
