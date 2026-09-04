"""
Django Admin for the Societal Innovation Collaboration layer.
"""
from django.contrib import admin
from apps.innovation.models import (
    University,
    IndustryPartner,
    InnovationProject,
    ProjectMilestone,
    SupportOffer,
    StudentContribution,
    ChallengeRoutingLog,
)


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_name', 'district', 'state', 'is_active', 'active_projects_count']
    list_filter = ['state', 'district', 'is_active']
    search_fields = ['name', 'short_name', 'district', 'innovation_centre']


@admin.register(IndustryPartner)
class IndustryPartnerAdmin(admin.ModelAdmin):
    list_display = ['name', 'partner_type', 'district', 'is_active']
    list_filter = ['partner_type', 'is_active']
    search_fields = ['name', 'district']


class ProjectMilestoneInline(admin.TabularInline):
    model = ProjectMilestone
    extra = 0


class SupportOfferInline(admin.TabularInline):
    model = SupportOffer
    extra = 0
    readonly_fields = ['created_at', 'responded_at']


class StudentContributionInline(admin.TabularInline):
    model = StudentContribution
    extra = 0
    readonly_fields = ['created_at']


@admin.register(InnovationProject)
class InnovationProjectAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'title', 'university', 'status', 'progress_percent',
        'academic_credits', 'counts_as_capstone', 'counts_as_internship',
        'people_benefited', 'patent_filed', 'startup_created', 'created_at',
    ]
    list_filter = [
        'status', 'university', 'counts_as_capstone', 'counts_as_internship',
        'patent_filed', 'startup_created',
    ]
    search_fields = ['code', 'title', 'faculty_mentor_name']
    readonly_fields = ['code', 'created_at', 'updated_at']
    inlines = [ProjectMilestoneInline, SupportOfferInline, StudentContributionInline]


@admin.register(StudentContribution)
class StudentContributionAdmin(admin.ModelAdmin):
    list_display = ['student_name', 'project', 'role', 'credits_earned', 'created_at']
    list_filter = ['project__university']
    search_fields = ['student_name', 'project__code', 'project__title']


@admin.register(ProjectMilestone)
class ProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'due_date', 'completed_at']
    list_filter = ['status']
    search_fields = ['title', 'project__code']


@admin.register(SupportOffer)
class SupportOfferAdmin(admin.ModelAdmin):
    list_display = ['partner', 'project', 'support_type', 'amount', 'status', 'created_at']
    list_filter = ['support_type', 'status']
    search_fields = ['partner__name', 'project__code']


@admin.register(ChallengeRoutingLog)
class ChallengeRoutingLogAdmin(admin.ModelAdmin):
    list_display = ['challenge', 'university', 'domain', 'routed_at']
    list_filter = ['domain', 'university']
    search_fields = ['challenge__ticket_id', 'reason']
    readonly_fields = ['routed_at']
