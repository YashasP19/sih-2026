"""
REST Views for the Societal Innovation Collaboration layer.
"""
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.shortcuts import get_object_or_404

from apps.complaints.models import Complaint
from apps.innovation.models import (
    University,
    IndustryPartner,
    InnovationProject,
    ProjectMilestone,
    SupportOffer,
    StudentContribution,
    ChallengeRoutingLog,
)
from apps.innovation.serializers import (
    UniversitySerializer,
    IndustryPartnerSerializer,
    RoutedChallengeSerializer,
    InnovationProjectListSerializer,
    InnovationProjectDetailSerializer,
    ProjectMilestoneSerializer,
    SupportOfferSerializer,
    ClaimChallengeSerializer,
    OfferSupportSerializer,
    StudentContributionSerializer,
    AddStudentContributionSerializer,
)
from apps.innovation.services import InnovationProjectService
from apps.innovation.permissions import IsUniversityCoordinator, IsIndustryPartner
from core.pagination import StandardResultsSetPagination
from core.constants import (
    ROLE_ADMIN,
    ROLE_UNIVERSITY,
    ROLE_INDUSTRY,
    DOMAIN_CHOICES,
    PROJECT_STATUS_CHOICES,
    PROJECT_DEPLOYED,
    SUPPORT_ACCEPTED,
    SUPPORT_FUNDING,
)


def _is_admin(user):
    return user.role == ROLE_ADMIN or user.is_superuser


class UniversityListView(generics.ListAPIView):
    """Registered Higher Education Institutions and their expertise areas."""
    serializer_class = UniversitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = University.objects.all()
        district = self.request.query_params.get('district')
        domain = self.request.query_params.get('domain')
        if district:
            queryset = queryset.filter(district__icontains=district)
        if domain:
            # JSONField `contains` is unsupported on SQLite, so filter in Python.
            ids = [u.id for u in queryset if domain in (u.expertise_domains or [])]
            queryset = queryset.filter(id__in=ids)
        return queryset


class IndustryPartnerListView(generics.ListAPIView):
    """Registered industry, startup, MSME, CSR and research-lab partners."""
    serializer_class = IndustryPartnerSerializer
    permission_classes = [permissions.AllowAny]
    queryset = IndustryPartner.objects.filter(is_active=True)


class RoutedChallengeListView(generics.ListAPIView):
    """
    Challenges routed to the requesting coordinator's institution.
    Admins see every routed challenge across institutions.
    """
    serializer_class = RoutedChallengeSerializer
    permission_classes = [IsUniversityCoordinator]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        queryset = Complaint.objects.select_related(
            'routed_university', 'citizen'
        ).prefetch_related('innovation_projects').exclude(is_duplicate=True)

        if not _is_admin(user):
            # A coordinator without a linked institution has an empty inbox
            # rather than visibility into everyone else's challenges.
            queryset = queryset.filter(routed_university=user.university)
        elif self.request.query_params.get('university'):
            queryset = queryset.filter(
                routed_university_id=self.request.query_params['university']
            )

        domain = self.request.query_params.get('domain')
        unclaimed = self.request.query_params.get('unclaimed')
        search = self.request.query_params.get('search')

        if domain:
            queryset = queryset.filter(domain=domain)
        if unclaimed in ('1', 'true', 'True'):
            queryset = queryset.filter(innovation_projects__isnull=True)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(ticket_id__icontains=search)
            )

        return queryset.order_by('-priority_score', '-created_at')


class ChallengeTimelineView(APIView):
    """
    The full life story of a single citizen-reported challenge, end to end:
    reported -> AI classified -> duplicates merged -> routed to an institution
    -> project team formed -> milestones delivered -> industry funded ->
    deployed with measured community impact.

    Everything here already lives in other tables — this just assembles it
    into one chronological read, so the story doesn't have to be pieced
    together by hand across five different screens.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        challenge = get_object_or_404(
            Complaint.objects.select_related('citizen', 'routed_university'),
            pk=pk
        )

        duplicates = Complaint.objects.filter(duplicate_of=challenge)
        routing_log = challenge.routing_logs.select_related('university').first()
        project = InnovationProject.objects.filter(challenge=challenge).select_related(
            'university'
        ).prefetch_related(
            'milestones', 'support_offers__partner', 'student_contributions'
        ).order_by('created_at').first()

        events = []

        events.append({
            'stage': 'REPORTED',
            'label': 'Citizen Reported',
            'timestamp': challenge.created_at,
            'detail': {
                'ticket_id': challenge.ticket_id,
                'title': challenge.title,
                'reported_by': challenge.citizen.get_full_name() or challenge.citizen.username,
                'ward_number': challenge.ward_number,
                'address': challenge.address,
            },
        })

        events.append({
            'stage': 'AI_CLASSIFIED',
            'label': 'AI Classified',
            'timestamp': challenge.created_at,
            'detail': {
                'category_display': challenge.get_category_display(),
                'domain_display': challenge.get_domain_display(),
                'keywords': challenge.keywords or [],
                'auto_classified': challenge.auto_classified,
                'urgency_display': challenge.get_urgency_display(),
                'priority_score': challenge.priority_score,
            },
        })

        if duplicates.exists():
            events.append({
                'stage': 'DUPLICATES_MERGED',
                'label': 'Duplicate Reports Merged',
                'timestamp': duplicates.order_by('-created_at').first().created_at,
                'detail': {
                    'count': duplicates.count(),
                    'ticket_ids': list(duplicates.values_list('ticket_id', flat=True)),
                },
            })

        if routing_log:
            events.append({
                'stage': 'ROUTED',
                'label': 'Routed to Institution',
                'timestamp': routing_log.routed_at,
                'detail': {
                    'university_name': str(routing_log.university) if routing_log.university else None,
                    'reason': routing_log.reason,
                    'domain_display': routing_log.get_domain_display(),
                },
            })

        if project:
            events.append({
                'stage': 'TEAM_FORMED',
                'label': 'Project Team Formed',
                'timestamp': project.created_at,
                'detail': {
                    'project_code': project.code,
                    'project_title': project.title,
                    'faculty_mentor_name': project.faculty_mentor_name,
                    'student_members': project.student_members or [],
                    'student_count': len(project.student_members or []),
                },
            })

            for milestone in project.milestones.order_by('created_at'):
                events.append({
                    'stage': 'MILESTONE',
                    'label': f'Milestone: {milestone.title}',
                    'timestamp': milestone.completed_at or milestone.created_at,
                    'detail': {
                        'title': milestone.title,
                        'description': milestone.description,
                        'status_display': milestone.get_status_display(),
                        'completed_at': milestone.completed_at,
                    },
                })

            for offer in project.support_offers.filter(status='ACCEPTED').order_by('responded_at'):
                events.append({
                    'stage': 'INDUSTRY_FUNDED',
                    'label': f'{offer.partner.name} — {offer.get_support_type_display()}',
                    'timestamp': offer.responded_at or offer.created_at,
                    'detail': {
                        'partner_name': offer.partner.name,
                        'support_type_display': offer.get_support_type_display(),
                        'amount': offer.amount,
                        'description': offer.description,
                    },
                })

            if project.status == 'DEPLOYED' and project.deployed_at:
                events.append({
                    'stage': 'DEPLOYED',
                    'label': 'Deployed',
                    'timestamp': project.deployed_at,
                    'detail': {
                        'people_benefited': project.people_benefited,
                        'villages_covered': project.villages_covered,
                        'solution_cost': project.solution_cost,
                        'patent_filed': project.patent_filed,
                        'patent_details': project.patent_details,
                        'startup_created': project.startup_created,
                        'startup_name': project.startup_name,
                        'outcome_notes': project.outcome_notes,
                    },
                })

        events.sort(key=lambda e: e['timestamp'])

        return Response({
            'ticket_id': challenge.ticket_id,
            'title': challenge.title,
            'events': events,
        })


class ClaimChallengeView(APIView):
    """A coordinator claims a routed challenge and registers a project team."""
    permission_classes = [IsUniversityCoordinator]

    def post(self, request, pk):
        challenge = get_object_or_404(Complaint, pk=pk)
        user = request.user

        university = user.university
        if university is None and _is_admin(user):
            university = challenge.routed_university
        if university is None:
            return Response(
                {'detail': 'Your account is not linked to a registered institution.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not _is_admin(user) and challenge.routed_university_id != university.id:
            return Response(
                {'detail': 'This challenge was not routed to your institution.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if challenge.innovation_projects.filter(university=university).exists():
            return Response(
                {'detail': 'Your institution has already claimed this challenge.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ClaimChallengeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project = InnovationProjectService.claim_challenge(
            challenge, university, user, serializer.validated_data
        )
        return Response(
            InnovationProjectDetailSerializer(project).data,
            status=status.HTTP_201_CREATED
        )


class InnovationProjectListView(generics.ListAPIView):
    """
    Projects, scoped by role:
      - University coordinator: their own institution's projects
      - Industry partner: projects open to collaboration
      - Officer / Admin: everything, for monitoring
    """
    serializer_class = InnovationProjectListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        queryset = InnovationProject.objects.select_related(
            'university', 'challenge'
        ).prefetch_related('milestones', 'support_offers')

        if user.role == ROLE_UNIVERSITY and not _is_admin(user):
            queryset = queryset.filter(university=user.university)
        elif user.role == ROLE_INDUSTRY and not _is_admin(user):
            # Partners browse live projects seeking support, not withdrawn ones.
            queryset = queryset.exclude(status='REJECTED')

        domain = self.request.query_params.get('domain')
        status_param = self.request.query_params.get('status')
        university = self.request.query_params.get('university')
        search = self.request.query_params.get('search')

        if domain:
            queryset = queryset.filter(challenge__domain=domain)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if university:
            queryset = queryset.filter(university_id=university)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(code__icontains=search) |
                Q(faculty_mentor_name__icontains=search)
            )

        return queryset


class InnovationProjectDetailView(generics.RetrieveAPIView):
    """Full project record including team, milestones and support offers."""
    serializer_class = InnovationProjectDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = InnovationProject.objects.select_related(
        'university', 'challenge'
    ).prefetch_related('milestones', 'support_offers__partner')


class ProjectStatusUpdateView(APIView):
    """Advances a project through its lifecycle."""
    permission_classes = [IsUniversityCoordinator]

    def post(self, request, pk):
        project = get_object_or_404(InnovationProject, pk=pk)
        user = request.user

        if not _is_admin(user) and project.university_id != getattr(user.university, 'id', None):
            return Response(
                {'detail': 'You can only update your own institution\'s projects.'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        valid = [choice[0] for choice in PROJECT_STATUS_CHOICES]
        if new_status not in valid:
            return Response(
                {'detail': f'Invalid status. Must be one of: {", ".join(valid)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        project = InnovationProjectService.update_status(
            project, new_status, request.data.get('remarks', ''),
            academic_credits=request.data.get('academic_credits'),
            counts_as_capstone=request.data.get('counts_as_capstone'),
            counts_as_internship=request.data.get('counts_as_internship'),
            people_benefited=request.data.get('people_benefited'),
            villages_covered=request.data.get('villages_covered'),
            solution_cost=request.data.get('solution_cost'),
            patent_filed=request.data.get('patent_filed'),
            patent_details=request.data.get('patent_details'),
            startup_created=request.data.get('startup_created'),
            startup_name=request.data.get('startup_name'),
        )
        return Response(InnovationProjectDetailSerializer(project).data)


class ProjectMilestoneCreateView(APIView):
    """Adds a deliverable to a project's timeline."""
    permission_classes = [IsUniversityCoordinator]

    def post(self, request, pk):
        project = get_object_or_404(InnovationProject, pk=pk)
        user = request.user

        if not _is_admin(user) and project.university_id != getattr(user.university, 'id', None):
            return Response(
                {'detail': 'You can only add milestones to your own institution\'s projects.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectMilestoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        milestone = InnovationProjectService.add_milestone(project, serializer.validated_data)
        return Response(
            ProjectMilestoneSerializer(milestone).data,
            status=status.HTTP_201_CREATED
        )


class StudentContributionCreateView(APIView):
    """A coordinator logs a student's contribution and credits on a project."""
    permission_classes = [IsUniversityCoordinator]

    def post(self, request, pk):
        project = get_object_or_404(InnovationProject, pk=pk)
        user = request.user

        if not _is_admin(user) and project.university_id != getattr(user.university, 'id', None):
            return Response(
                {'detail': 'You can only log contributions on your own institution\'s projects.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = AddStudentContributionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contribution = InnovationProjectService.add_student_contribution(
            project, serializer.validated_data
        )
        return Response(
            StudentContributionSerializer(contribution).data,
            status=status.HTTP_201_CREATED
        )


class StudentInnovationRecordView(APIView):
    """
    A student's cumulative Student Innovation Record: every project they
    contributed to, credits earned, and whether it counted as a capstone
    or internship — the NEP 2020 outcome evidence for that student.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        name = request.query_params.get('name', '').strip()
        if not name:
            return Response(
                {'detail': 'Provide a student name via the "name" query parameter.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        contributions = StudentContribution.objects.select_related(
            'project', 'project__university', 'project__challenge'
        ).filter(student_name__icontains=name).order_by('-created_at')

        total_credits = sum(c.credits_earned for c in contributions)
        capstone_count = sum(1 for c in contributions if c.project.counts_as_capstone)
        internship_count = sum(1 for c in contributions if c.project.counts_as_internship)

        return Response({
            'student_name': name,
            'total_credits': total_credits,
            'projects_count': contributions.values('project').distinct().count(),
            'capstone_count': capstone_count,
            'internship_count': internship_count,
            'contributions': StudentContributionSerializer(contributions, many=True).data,
        })


class MilestoneStatusUpdateView(APIView):
    """Marks a milestone pending / in progress / completed / blocked."""
    permission_classes = [IsUniversityCoordinator]

    def post(self, request, pk):
        milestone = get_object_or_404(ProjectMilestone.objects.select_related('project'), pk=pk)
        user = request.user

        if not _is_admin(user) and milestone.project.university_id != getattr(user.university, 'id', None):
            return Response(
                {'detail': 'You can only update your own institution\'s milestones.'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        valid = [choice[0] for choice in ProjectMilestone._meta.get_field('status').choices]
        if new_status not in valid:
            return Response(
                {'detail': f'Invalid status. Must be one of: {", ".join(valid)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        milestone = InnovationProjectService.set_milestone_status(milestone, new_status)
        return Response(ProjectMilestoneSerializer(milestone).data)


class OfferSupportView(APIView):
    """An industry partner offers mentorship, funding or facilities to a project."""
    permission_classes = [IsIndustryPartner]

    def post(self, request, pk):
        project = get_object_or_404(InnovationProject, pk=pk)
        partner = request.user.industry_partner

        if partner is None:
            return Response(
                {'detail': 'Your account is not linked to a registered partner organisation.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = OfferSupportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = InnovationProjectService.offer_support(
            project, partner, request.user, serializer.validated_data
        )
        return Response(
            SupportOfferSerializer(offer).data,
            status=status.HTTP_201_CREATED
        )


class SupportOfferListView(generics.ListAPIView):
    """
    Support offers relevant to the requesting user — offers they made
    (industry) or offers made to their projects (university).
    """
    serializer_class = SupportOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = SupportOffer.objects.select_related('partner', 'project')

        if _is_admin(user):
            return queryset
        if user.role == ROLE_INDUSTRY:
            return queryset.filter(partner=user.industry_partner)
        if user.role == ROLE_UNIVERSITY:
            return queryset.filter(project__university=user.university)
        return queryset.none()


class SupportOfferRespondView(APIView):
    """A university accepts or declines an offer of support."""
    permission_classes = [IsUniversityCoordinator]

    def post(self, request, pk):
        offer = get_object_or_404(SupportOffer.objects.select_related('project'), pk=pk)
        user = request.user

        if not _is_admin(user) and offer.project.university_id != getattr(user.university, 'id', None):
            return Response(
                {'detail': 'You can only respond to offers made to your institution.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            offer = InnovationProjectService.respond_to_offer(offer, request.data.get('status'))
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(SupportOfferSerializer(offer).data)


class InnovationStatsView(APIView):
    """
    Government-facing analytics: challenge intake, institutional
    participation, industry engagement and measurable outcomes.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        domain_labels = dict(DOMAIN_CHOICES)
        status_labels = dict(PROJECT_STATUS_CHOICES)

        challenges = Complaint.objects.exclude(is_duplicate=True)
        projects = InnovationProject.objects.all()

        by_domain = challenges.values('domain').annotate(count=Count('id')).order_by('-count')
        by_status = projects.values('status').annotate(count=Count('id')).order_by('-count')

        top_universities = [
            {
                'name': str(uni),
                'district': uni.district,
                'projects_count': uni.projects_count,
                'deployed_count': uni.deployed_count,
            }
            for uni in University.objects.annotate(
                projects_count=Count('projects', distinct=True),
                deployed_count=Count(
                    'projects',
                    filter=Q(projects__status=PROJECT_DEPLOYED),
                    distinct=True,
                ),
            ).filter(projects_count__gt=0).order_by('-projects_count')[:10]
        ]

        funding = SupportOffer.objects.filter(
            support_type=SUPPORT_FUNDING,
            status=SUPPORT_ACCEPTED,
        ).aggregate(total=Sum('amount'))['total'] or 0

        deployed = projects.filter(status=PROJECT_DEPLOYED)
        impact = deployed.aggregate(
            people_benefited=Sum('people_benefited'),
            villages_covered=Sum('villages_covered'),
            solution_cost=Sum('solution_cost'),
        )

        return Response({
            'total_challenges': challenges.count(),
            'routed_challenges': challenges.filter(routed_university__isnull=False).count(),
            'challenges_by_domain': [
                {
                    'domain': row['domain'],
                    'domain_display': domain_labels.get(row['domain'], row['domain']),
                    'count': row['count'],
                }
                for row in by_domain
            ],
            'total_universities': University.objects.count(),
            'participating_universities': University.objects.filter(
                projects__isnull=False
            ).distinct().count(),
            'total_projects': projects.count(),
            'projects_by_status': [
                {
                    'status': row['status'],
                    'status_display': status_labels.get(row['status'], row['status']),
                    'count': row['count'],
                }
                for row in by_status
            ],
            'total_industry_partners': IndustryPartner.objects.filter(is_active=True).count(),
            'total_support_offers': SupportOffer.objects.count(),
            'accepted_support_offers': SupportOffer.objects.filter(status=SUPPORT_ACCEPTED).count(),
            'total_funding_committed': float(funding),
            'deployed_solutions': deployed.count(),
            'top_universities': top_universities,
            'community_impact': {
                'people_benefited': impact['people_benefited'] or 0,
                'villages_covered': impact['villages_covered'] or 0,
                'total_solution_cost': float(impact['solution_cost'] or 0),
                'patents_filed': deployed.filter(patent_filed=True).count(),
                'startups_created': deployed.filter(startup_created=True).count(),
            },
        })
