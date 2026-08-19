"""
Complaint, Audit Log, and Community Endorsement Models for CivicSense AI
"""
import uuid
import random
from django.db import models
from django.conf import settings
from core.constants import (
    CATEGORY_CHOICES,
    DEPARTMENT_CHOICES,
    STATUS_CHOICES,
    STATUS_PENDING,
    URGENCY_CHOICES,
    URGENCY_MEDIUM,
    DEPT_GENERAL
)


def generate_ticket_id():
    """Generates a human-friendly civic grievance tracking ID e.g., CIV-2026-7842"""
    random_digits = random.randint(1000, 9999)
    return f"CIV-2026-{random_digits}"


class Complaint(models.Model):
    """
    Core Civic Grievance Record with AI metadata, geo-coordinates, and lifecycle tracking.
    """
    ticket_id = models.CharField(
        max_length=30,
        unique=True,
        default=generate_ticket_id,
        db_index=True,
        help_text="Unique tracking code for citizens and officers"
    )
    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submitted_complaints',
        help_text="Citizen who lodged the grievance"
    )
    title = models.CharField(
        max_length=200,
        help_text="Brief summary of the civic problem"
    )
    description = models.TextField(
        help_text="Detailed problem description with context"
    )
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='OTHER',
        db_index=True,
        help_text="Municipal grievance category"
    )
    auto_classified = models.BooleanField(
        default=True,
        help_text="Whether category was predicted by AI NLP classifier"
    )
    ai_confidence = models.FloatField(
        default=0.0,
        help_text="AI confidence score for classification (0.0 to 1.0)"
    )
    urgency = models.CharField(
        max_length=20,
        choices=URGENCY_CHOICES,
        default=URGENCY_MEDIUM,
        db_index=True,
        help_text="Urgency level determined by priority engine"
    )
    priority_score = models.PositiveIntegerField(
        default=50,
        db_index=True,
        help_text="Dynamic priority score (1-100) calculated by AI"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
        help_text="Current lifecycle state of the grievance"
    )
    
    # Geo-spatial coordinates
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        help_text="GPS Latitude"
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        help_text="GPS Longitude"
    )
    address = models.CharField(
        max_length=300,
        blank=True,
        default='',
        help_text="Street address / locality name"
    )
    landmark = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text="Nearby prominent landmark"
    )
    ward_number = models.CharField(
        max_length=50,
        blank=True,
        default='Ward 1',
        db_index=True,
        help_text="Municipal ward number"
    )
    pincode = models.CharField(
        max_length=10,
        blank=True,
        default='',
        help_text="Postal Area Pincode"
    )

    # Media Attachments
    image = models.ImageField(
        upload_to='complaints/%Y/%m/',
        null=True,
        blank=True,
        help_text="Proof photo uploaded by citizen"
    )
    resolution_image = models.ImageField(
        upload_to='resolutions/%Y/%m/',
        null=True,
        blank=True,
        help_text="Proof photo uploaded by officer after resolution"
    )
    resolution_notes = models.TextField(
        blank=True,
        default='',
        help_text="Official resolution summary and field action report"
    )

    # Department & Officer Assignment
    assigned_department = models.CharField(
        max_length=50,
        choices=DEPARTMENT_CHOICES,
        default=DEPT_GENERAL,
        db_index=True,
        help_text="Municipal department handling this issue"
    )
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_complaints',
        help_text="Field Officer assigned to resolve this"
    )

    # Duplicate Detection Link
    is_duplicate = models.BooleanField(
        default=False,
        help_text="Flagged if duplicate of an existing complaint"
    )
    duplicate_of = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='duplicate_reports',
        help_text="Parent original complaint"
    )

    # AI Extracted Keywords
    keywords = models.JSONField(
        default=list,
        blank=True,
        help_text="AI-extracted keywords and phrases"
    )

    # Community Engagement
    upvotes_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of community citizens who upvoted / confirmed this issue"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Civic Complaint'
        verbose_name_plural = 'Civic Complaints'
        ordering = ['-priority_score', '-created_at']

    def __str__(self):
        return f"[{self.ticket_id}] {self.title} ({self.get_status_display()})"


class ComplaintActivityLog(models.Model):
    """
    Immutable Audit Log tracking every status change, assignment, and officer remark.
    """
    complaint = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    action = models.CharField(
        max_length=100,
        help_text="e.g. 'SUBMITTED', 'VERIFIED', 'STATUS_CHANGED', 'ASSIGNED', 'RESOLVED'"
    )
    old_status = models.CharField(max_length=30, blank=True, null=True)
    new_status = models.CharField(max_length=30, blank=True, null=True)
    remarks = models.TextField(blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.complaint.ticket_id} - {self.action} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


class ComplaintUpvote(models.Model):
    """
    Prevents multiple upvotes per citizen and tracks neighborhood validation.
    """
    complaint = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='upvotes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('complaint', 'user')

    def __str__(self):
        return f"{self.user.username} upvoted {self.complaint.ticket_id}"
