"""
Serializers for the Societal Innovation Collaboration layer.
"""
from rest_framework import serializers
from apps.complaints.models import Complaint
from apps.innovation.models import (
    University,
    IndustryPartner,
    InnovationProject,
    ProjectMilestone,
    SupportOffer,
    StudentContribution,
)


class UniversitySerializer(serializers.ModelSerializer):
    active_projects_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = University
        fields = [
            'id', 'name', 'short_name', 'district', 'state',
            'expertise_domains', 'innovation_centre', 'contact_email',
            'is_active', 'active_projects_count',
        ]


class IndustryPartnerSerializer(serializers.ModelSerializer):
    partner_type_display = serializers.CharField(source='get_partner_type_display', read_only=True)

    class Meta:
        model = IndustryPartner
        fields = [
            'id', 'name', 'partner_type', 'partner_type_display', 'sectors',
            'district', 'contact_email', 'website', 'is_active',
        ]


class ChallengeBriefSerializer(serializers.ModelSerializer):
    """Minimal challenge context embedded inside a project."""
    domain_display = serializers.CharField(source='get_domain_display', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'ticket_id', 'title', 'description', 'domain',
            'domain_display', 'ward_number', 'address', 'image',
            'latitude', 'longitude', 'created_at',
        ]


class RoutedChallengeSerializer(serializers.ModelSerializer):
    """A challenge as seen from an institution's inbox."""
    domain_display = serializers.CharField(source='get_domain_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    routed_university_name = serializers.CharField(source='routed_university.__str__', read_only=True)
    has_project = serializers.SerializerMethodField()
    routing_reason = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'id', 'ticket_id', 'title', 'description', 'category',
            'category_display', 'domain', 'domain_display', 'urgency',
            'urgency_display', 'priority_score', 'status', 'ward_number',
            'address', 'landmark', 'latitude', 'longitude', 'image',
            'keywords', 'upvotes_count', 'routed_university',
            'routed_university_name', 'has_project', 'routing_reason', 'created_at',
        ]

    def get_has_project(self, obj):
        return obj.innovation_projects.exists()

    def get_routing_reason(self, obj):
        latest_log = obj.routing_logs.first()
        return latest_log.reason if latest_log else ''


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ProjectMilestone
        fields = [
            'id', 'title', 'description', 'due_date', 'status',
            'status_display', 'attachment', 'completed_at', 'created_at',
        ]
        read_only_fields = ['completed_at', 'created_at']


class SupportOfferSerializer(serializers.ModelSerializer):
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    support_type_display = serializers.CharField(source='get_support_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    project_code = serializers.CharField(source='project.code', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = SupportOffer
        fields = [
            'id', 'project', 'project_code', 'project_title', 'partner',
            'partner_name', 'support_type', 'support_type_display',
            'description', 'amount', 'status', 'status_display',
            'created_at', 'responded_at',
        ]
        read_only_fields = ['status', 'responded_at', 'created_at']


class StudentContributionSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.code', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    university_name = serializers.CharField(source='project.university.__str__', read_only=True)
    counts_as_capstone = serializers.BooleanField(source='project.counts_as_capstone', read_only=True)
    counts_as_internship = serializers.BooleanField(source='project.counts_as_internship', read_only=True)

    class Meta:
        model = StudentContribution
        fields = [
            'id', 'project', 'project_code', 'project_title', 'university_name',
            'student_name', 'role', 'contribution_summary', 'credits_earned',
            'counts_as_capstone', 'counts_as_internship', 'created_at',
        ]
        read_only_fields = ['created_at']


class AddStudentContributionSerializer(serializers.Serializer):
    """Input payload when a coordinator logs a student's contribution."""
    student_name = serializers.CharField(max_length=150)
    role = serializers.CharField(max_length=100, required=False, allow_blank=True)
    contribution_summary = serializers.CharField(required=False, allow_blank=True)
    credits_earned = serializers.IntegerField(required=False, min_value=0, default=0)


class InnovationProjectListSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source='university.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    progress_percent = serializers.IntegerField(read_only=True)
    domain = serializers.CharField(source='challenge.domain', read_only=True)
    domain_display = serializers.CharField(source='challenge.get_domain_display', read_only=True)
    challenge_ticket_id = serializers.CharField(source='challenge.ticket_id', read_only=True)
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    milestones_count = serializers.SerializerMethodField()
    support_offers_count = serializers.SerializerMethodField()
    # Included on the list payload too, so dashboards can surface pending
    # industry offers and milestone progress without an N+1 detail fetch.
    milestones = ProjectMilestoneSerializer(many=True, read_only=True)
    support_offers = SupportOfferSerializer(many=True, read_only=True)

    class Meta:
        model = InnovationProject
        fields = [
            'id', 'code', 'title', 'university', 'university_name',
            'faculty_mentor_name', 'student_members', 'status',
            'status_display', 'progress_percent', 'domain', 'domain_display',
            'challenge', 'challenge_ticket_id', 'challenge_title',
            'milestones_count', 'support_offers_count', 'milestones',
            'support_offers', 'academic_credits', 'counts_as_capstone',
            'counts_as_internship', 'people_benefited', 'villages_covered',
            'solution_cost', 'patent_filed', 'startup_created',
            'created_at', 'updated_at',
        ]

    def get_milestones_count(self, obj):
        return obj.milestones.count()

    def get_support_offers_count(self, obj):
        return obj.support_offers.count()


class InnovationProjectDetailSerializer(serializers.ModelSerializer):
    challenge = ChallengeBriefSerializer(read_only=True)
    university_name = serializers.CharField(source='university.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    progress_percent = serializers.IntegerField(read_only=True)
    milestones = ProjectMilestoneSerializer(many=True, read_only=True)
    support_offers = SupportOfferSerializer(many=True, read_only=True)
    student_contributions = StudentContributionSerializer(many=True, read_only=True)

    class Meta:
        model = InnovationProject
        fields = [
            'id', 'code', 'title', 'challenge', 'university',
            'university_name', 'faculty_mentor_name', 'student_members',
            'proposal_summary', 'status', 'status_display',
            'progress_percent', 'outcome_notes', 'milestones',
            'support_offers', 'academic_credits', 'counts_as_capstone',
            'counts_as_internship', 'student_contributions',
            'people_benefited', 'villages_covered', 'solution_cost',
            'patent_filed', 'patent_details', 'startup_created', 'startup_name',
            'created_at', 'updated_at', 'deployed_at',
        ]


class ClaimChallengeSerializer(serializers.Serializer):
    """Input payload when an institution claims a routed challenge."""
    title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    proposal_summary = serializers.CharField()
    faculty_mentor_name = serializers.CharField(max_length=150)
    student_members = serializers.ListField(
        child=serializers.CharField(max_length=150),
        required=False,
        default=list,
    )


class OfferSupportSerializer(serializers.Serializer):
    """Input payload when an industry partner offers support."""
    support_type = serializers.ChoiceField(
        choices=[choice[0] for choice in SupportOffer._meta.get_field('support_type').choices]
    )
    description = serializers.CharField()
    amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, allow_null=True
    )
