"""
Societal Innovation Collaboration Models for Urban Lens

Turns a validated citizen-reported societal challenge into a university-led
research project, with industry partners contributing mentorship, funding and
deployment capability.
"""
import random
from django.db import models
from django.conf import settings
from django.utils import timezone
from core.constants import (
    DOMAIN_CHOICES,
    DOMAIN_OTHER,
    PROJECT_STATUS_CHOICES,
    PROJECT_PROPOSED,
    PROJECT_STATUS_PROGRESS,
    MILESTONE_STATUS_CHOICES,
    MILESTONE_PENDING,
    MILESTONE_COMPLETED,
    SUPPORT_TYPE_CHOICES,
    SUPPORT_STATUS_CHOICES,
    SUPPORT_OFFERED,
)


def generate_project_code():
    """Generates a human-friendly innovation project code e.g., PRJ-2026-4821"""
    return f"PRJ-2026-{random.randint(1000, 9999)}"


class University(models.Model):
    """
    A Higher Education Institution registered to receive routed challenges.

    `expertise_domains` holds the thematic domains the institution can take on,
    which is what the routing engine matches a challenge's domain against.
    """
    name = models.CharField(
        max_length=200,
        help_text="Registered name of the Higher Education Institution"
    )
    short_name = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text="Common abbreviation e.g. 'BIT Sindri'"
    )
    district = models.CharField(
        max_length=100,
        db_index=True,
        help_text="District where the institution is located"
    )
    state = models.CharField(
        max_length=100,
        default='Jharkhand',
        help_text="State where the institution is located"
    )
    expertise_domains = models.JSONField(
        default=list,
        blank=True,
        help_text="Thematic domains this institution can take on, e.g. ['WATER', 'ENVIRONMENT']"
    )
    innovation_centre = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text="Name of the institution's innovation / incubation centre, if any"
    )
    contact_email = models.EmailField(
        blank=True,
        default='',
        help_text="Nodal officer contact email"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the institution is currently accepting challenges"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'University / HEI'
        verbose_name_plural = 'Universities / HEIs'
        ordering = ['name']

    def __str__(self):
        return self.short_name or self.name

    @property
    def active_projects_count(self):
        return self.projects.exclude(
            status__in=['DEPLOYED', 'REJECTED']
        ).count()


class IndustryPartner(models.Model):
    """
    An industry, startup, MSME, CSR arm or research lab offering support to
    university-led projects.
    """
    PARTNER_TYPE_CHOICES = (
        ('INDUSTRY', 'Industry / Corporate'),
        ('STARTUP', 'Startup'),
        ('MSME', 'MSME'),
        ('CSR', 'CSR Foundation'),
        ('RESEARCH_LAB', 'Research Laboratory'),
        ('INCUBATOR', 'Incubator / Innovation Hub'),
    )

    name = models.CharField(
        max_length=200,
        help_text="Registered name of the partner organisation"
    )
    partner_type = models.CharField(
        max_length=30,
        choices=PARTNER_TYPE_CHOICES,
        default='INDUSTRY',
        db_index=True
    )
    sectors = models.JSONField(
        default=list,
        blank=True,
        help_text="Thematic domains the partner is interested in supporting"
    )
    district = models.CharField(max_length=100, blank=True, default='')
    contact_email = models.EmailField(blank=True, default='')
    website = models.URLField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Industry Partner'
        verbose_name_plural = 'Industry Partners'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_partner_type_display()})"


class InnovationProject(models.Model):
    """
    A university's multidisciplinary team working on a claimed societal challenge.
    """
    code = models.CharField(
        max_length=30,
        unique=True,
        default=generate_project_code,
        db_index=True,
        help_text="Unique project tracking code"
    )
    challenge = models.ForeignKey(
        'complaints.Complaint',
        on_delete=models.CASCADE,
        related_name='innovation_projects',
        help_text="The citizen-reported societal challenge being solved"
    )
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name='projects',
        help_text="Institution that claimed this challenge"
    )
    title = models.CharField(
        max_length=200,
        help_text="Project / research proposal title"
    )
    proposal_summary = models.TextField(
        help_text="Proposed approach to solving the challenge"
    )
    faculty_mentor_name = models.CharField(
        max_length=150,
        help_text="Faculty member mentoring the student team"
    )
    student_members = models.JSONField(
        default=list,
        blank=True,
        help_text="Multidisciplinary student team, e.g. ['Asha Kumari (Civil)', ...]"
    )
    status = models.CharField(
        max_length=20,
        choices=PROJECT_STATUS_CHOICES,
        default=PROJECT_PROPOSED,
        db_index=True
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_projects',
        help_text="University coordinator who registered this project"
    )
    outcome_notes = models.TextField(
        blank=True,
        default='',
        help_text="Validated outcome, IP generated, or deployment summary"
    )
    academic_credits = models.PositiveSmallIntegerField(
        default=0,
        help_text="Academic credits the institution awards for this project, per its NEP 2020 credit framework"
    )
    counts_as_capstone = models.BooleanField(
        default=False,
        help_text="Whether this project satisfies a capstone / final-year project requirement"
    )
    counts_as_internship = models.BooleanField(
        default=False,
        help_text="Whether this project satisfies an internship requirement"
    )

    # Deployment impact — captured once the solution actually ships, so the
    # ecosystem is measured by outcomes (people reached, IP, startups) and
    # not just project counts.
    people_benefited = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Estimated number of citizens who benefit from the deployed solution"
    )
    villages_covered = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Number of villages / wards / localities the deployed solution covers"
    )
    solution_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Total cost of building and deploying the solution, in INR"
    )
    patent_filed = models.BooleanField(
        default=False,
        help_text="Whether a patent or other IP was filed as a result of this project"
    )
    patent_details = models.CharField(
        max_length=300,
        blank=True,
        default='',
        help_text="Patent application number / title, if filed"
    )
    startup_created = models.BooleanField(
        default=False,
        help_text="Whether a startup was incorporated as a result of this project"
    )
    startup_name = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text="Name of the startup, if one was created"
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    deployed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Innovation Project'
        verbose_name_plural = 'Innovation Projects'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.code}] {self.title} ({self.get_status_display()})"

    @property
    def progress_percent(self):
        """
        Completion estimate. Milestones take precedence once the team has
        defined them, otherwise fall back to the lifecycle stage.
        """
        total = self.milestones.count()
        if total:
            done = self.milestones.filter(status=MILESTONE_COMPLETED).count()
            return round(done * 100 / total)
        return PROJECT_STATUS_PROGRESS.get(self.status, 0)


class ProjectMilestone(models.Model):
    """
    A deliverable within a project's lifecycle, used for progress monitoring.
    """
    project = models.ForeignKey(
        InnovationProject,
        on_delete=models.CASCADE,
        related_name='milestones'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=MILESTONE_STATUS_CHOICES,
        default=MILESTONE_PENDING,
        db_index=True
    )
    attachment = models.FileField(
        upload_to='project_milestones/%Y/%m/',
        null=True,
        blank=True,
        help_text="Supporting document, report or test result"
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Project Milestone'
        verbose_name_plural = 'Project Milestones'
        ordering = ['due_date', 'created_at']

    def __str__(self):
        return f"{self.project.code} - {self.title} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        if self.status == MILESTONE_COMPLETED and not self.completed_at:
            self.completed_at = timezone.now()
        elif self.status != MILESTONE_COMPLETED:
            self.completed_at = None
        super().save(*args, **kwargs)


class SupportOffer(models.Model):
    """
    An industry partner's offer of mentorship, funding, facilities or
    deployment capability towards a university project.
    """
    project = models.ForeignKey(
        InnovationProject,
        on_delete=models.CASCADE,
        related_name='support_offers'
    )
    partner = models.ForeignKey(
        IndustryPartner,
        on_delete=models.CASCADE,
        related_name='support_offers'
    )
    offered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='support_offers'
    )
    support_type = models.CharField(
        max_length=30,
        choices=SUPPORT_TYPE_CHOICES,
        db_index=True
    )
    description = models.TextField(
        help_text="What exactly the partner is offering"
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Funding amount in INR, where applicable"
    )
    status = models.CharField(
        max_length=20,
        choices=SUPPORT_STATUS_CHOICES,
        default=SUPPORT_OFFERED,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Support Offer'
        verbose_name_plural = 'Support Offers'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.partner.name} -> {self.project.code} ({self.get_support_type_display()})"


class StudentContribution(models.Model):
    """
    A single student's recorded contribution and academic credit on a project —
    the basis of that student's Student Innovation Record.
    """
    project = models.ForeignKey(
        InnovationProject,
        on_delete=models.CASCADE,
        related_name='student_contributions'
    )
    student_name = models.CharField(
        max_length=150,
        help_text="Name of the student being credited, e.g. 'Asha Kumari (Civil)'"
    )
    role = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Role played on the team, e.g. 'Lead Researcher', 'Field Data Collection'"
    )
    contribution_summary = models.TextField(
        blank=True,
        default='',
        help_text="What this student specifically did or delivered"
    )
    credits_earned = models.PositiveSmallIntegerField(
        default=0,
        help_text="Academic credits earned by this student for their contribution"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Student Contribution'
        verbose_name_plural = 'Student Contributions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student_name} - {self.project.code}"


class ChallengeRoutingLog(models.Model):
    """
    Audit trail of which institution a challenge was routed to and why.
    """
    challenge = models.ForeignKey(
        'complaints.Complaint',
        on_delete=models.CASCADE,
        related_name='routing_logs'
    )
    university = models.ForeignKey(
        University,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='routing_logs'
    )
    domain = models.CharField(
        max_length=30,
        choices=DOMAIN_CHOICES,
        default=DOMAIN_OTHER
    )
    reason = models.CharField(
        max_length=300,
        blank=True,
        default='',
        help_text="Why this institution was selected e.g. domain + district match"
    )
    routed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Challenge Routing Log'
        verbose_name_plural = 'Challenge Routing Logs'
        ordering = ['-routed_at']

    def __str__(self):
        target = self.university.short_name if self.university else 'UNROUTED'
        return f"{self.challenge.ticket_id} -> {target}"
