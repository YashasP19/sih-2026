"""
Business Logic for the Societal Innovation Collaboration layer.

Handles mapping a validated challenge onto an academic thematic domain,
routing it to a suitable Higher Education Institution, and the lifecycle of
the resulting university project and industry support offers.
"""
import logging
from django.db import transaction
from django.utils import timezone
from apps.innovation.models import (
    University,
    InnovationProject,
    ProjectMilestone,
    SupportOffer,
    ChallengeRoutingLog,
    StudentContribution,
)
from core.constants import (
    CATEGORY_TO_DOMAIN,
    DOMAIN_OTHER,
    PROJECT_DEPLOYED,
    SUPPORT_ACCEPTED,
    SUPPORT_DECLINED,
    MILESTONE_COMPLETED,
)

logger = logging.getLogger(__name__)


class ChallengeRoutingService:
    """
    Routes a societal challenge to the institution best placed to solve it.

    Selection is domain-first (the institution must list the challenge's
    thematic domain as an area of expertise), then locality, then current
    workload — so no single institution gets flooded.
    """

    @staticmethod
    def resolve_domain(category: str) -> str:
        """Maps the AI-predicted civic category onto an academic domain."""
        return CATEGORY_TO_DOMAIN.get(category, DOMAIN_OTHER)

    @classmethod
    def find_university(cls, domain: str, address: str = ''):
        """
        Returns (university, reason). University is None when no active
        institution lists this domain, in which case the challenge stays
        unrouted for an administrator to allocate manually.
        """
        candidates = [
            uni for uni in University.objects.filter(is_active=True)
            if domain in (uni.expertise_domains or [])
        ]

        if not candidates:
            return None, f"No active institution lists {domain} as an expertise area"

        haystack = (address or '').lower()
        local = [uni for uni in candidates if uni.district and uni.district.lower() in haystack]

        if local:
            chosen = min(local, key=lambda u: u.active_projects_count)
            return chosen, (
                f"Domain match on {domain}, located in the same district "
                f"({chosen.district}), lowest current project load"
            )

        chosen = min(candidates, key=lambda u: u.active_projects_count)
        return chosen, f"Domain match on {domain}, lowest current project load"

    @classmethod
    @transaction.atomic
    def route_challenge(cls, complaint):
        """
        Assigns the domain and routed institution on a challenge and writes an
        audit entry. Safe to call on an already-routed challenge — it re-routes
        and logs again.
        """
        domain = cls.resolve_domain(complaint.category)
        university, reason = cls.find_university(domain, complaint.address)

        complaint.domain = domain
        complaint.routed_university = university
        complaint.save(update_fields=['domain', 'routed_university'])

        ChallengeRoutingLog.objects.create(
            challenge=complaint,
            university=university,
            domain=domain,
            reason=reason,
        )
        return university


class InnovationProjectService:
    """Lifecycle operations for university projects and industry support."""

    @classmethod
    @transaction.atomic
    def claim_challenge(cls, challenge, university, user, data: dict) -> InnovationProject:
        """
        A university coordinator accepts a routed challenge and registers a
        multidisciplinary team against it.
        """
        project = InnovationProject.objects.create(
            challenge=challenge,
            university=university,
            title=data.get('title', '').strip() or f"Solution for {challenge.title}",
            proposal_summary=data.get('proposal_summary', '').strip(),
            faculty_mentor_name=data.get('faculty_mentor_name', '').strip(),
            student_members=data.get('student_members') or [],
            created_by=user,
        )
        logger.info(
            "Challenge %s claimed by %s as project %s",
            challenge.ticket_id, university, project.code
        )
        return project

    #: fields settable via update_status whenever the caller supplies them,
    #: e.g. academic outcomes on any stage change, deployment impact on Deployed.
    _STATUS_UPDATABLE_FIELDS = (
        'academic_credits', 'counts_as_capstone', 'counts_as_internship',
        'people_benefited', 'villages_covered', 'solution_cost',
        'patent_filed', 'patent_details', 'startup_created', 'startup_name',
    )

    @classmethod
    @transaction.atomic
    def update_status(cls, project: InnovationProject, status: str, remarks: str = '', **fields) -> InnovationProject:
        project.status = status
        if remarks:
            project.outcome_notes = remarks

        changed = ['status', 'outcome_notes', 'updated_at']
        for field in cls._STATUS_UPDATABLE_FIELDS:
            if fields.get(field) is not None:
                setattr(project, field, fields[field])
                changed.append(field)

        if status == PROJECT_DEPLOYED and not project.deployed_at:
            project.deployed_at = timezone.now()
        changed.append('deployed_at')

        project.save(update_fields=changed)
        return project

    @classmethod
    def add_milestone(cls, project: InnovationProject, data: dict) -> ProjectMilestone:
        return ProjectMilestone.objects.create(
            project=project,
            title=data.get('title', '').strip(),
            description=data.get('description', '').strip(),
            due_date=data.get('due_date') or None,
        )

    @classmethod
    def set_milestone_status(cls, milestone: ProjectMilestone, status: str) -> ProjectMilestone:
        milestone.status = status
        milestone.save()
        return milestone

    @classmethod
    @transaction.atomic
    def offer_support(cls, project: InnovationProject, partner, user, data: dict) -> SupportOffer:
        return SupportOffer.objects.create(
            project=project,
            partner=partner,
            offered_by=user,
            support_type=data.get('support_type'),
            description=data.get('description', '').strip(),
            amount=data.get('amount') or None,
        )

    @classmethod
    def add_student_contribution(cls, project: InnovationProject, data: dict) -> StudentContribution:
        return StudentContribution.objects.create(
            project=project,
            student_name=data.get('student_name', '').strip(),
            role=data.get('role', '').strip(),
            contribution_summary=data.get('contribution_summary', '').strip(),
            credits_earned=data.get('credits_earned') or 0,
        )

    @classmethod
    @transaction.atomic
    def respond_to_offer(cls, offer: SupportOffer, status: str) -> SupportOffer:
        if status not in (SUPPORT_ACCEPTED, SUPPORT_DECLINED):
            raise ValueError(f"Unsupported response status: {status}")
        offer.status = status
        offer.responded_at = timezone.now()
        offer.save(update_fields=['status', 'responded_at'])
        return offer
