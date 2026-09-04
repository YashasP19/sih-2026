"""
Seeds the Societal Innovation Collaboration layer: Jharkhand HEIs, industry
partners, coordinator logins, and demo projects built on existing challenges.

Idempotent — safe to re-run before a demo.
"""
import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.complaints.models import Complaint
from apps.innovation.models import (
    University,
    IndustryPartner,
    InnovationProject,
    ProjectMilestone,
    SupportOffer,
    StudentContribution,
)
from apps.innovation.services import ChallengeRoutingService, InnovationProjectService
from core.constants import (
    ROLE_UNIVERSITY,
    ROLE_INDUSTRY,
    DOMAIN_EDUCATION,
    DOMAIN_AGRICULTURE,
    DOMAIN_HEALTHCARE,
    DOMAIN_WATER,
    DOMAIN_ENVIRONMENT,
    DOMAIN_ENERGY,
    DOMAIN_URBAN_DEV,
    DOMAIN_ACCESSIBILITY,
    DOMAIN_PUBLIC_ADMIN,
    DOMAIN_RURAL_LIVELIHOOD,
    DOMAIN_OTHER,
    PROJECT_APPROVED,
    PROJECT_IN_PROGRESS,
    PROJECT_PROTOTYPE,
    PROJECT_TESTING,
    PROJECT_DEPLOYED,
    MILESTONE_COMPLETED,
    MILESTONE_IN_PROGRESS,
    MILESTONE_PENDING,
    SUPPORT_MENTORSHIP,
    SUPPORT_FUNDING,
    SUPPORT_PROTOTYPING,
    SUPPORT_LAB_ACCESS,
    SUPPORT_ACCEPTED,
)

User = get_user_model()


UNIVERSITIES = [
    {
        'name': 'Birsa Institute of Technology, Sindri',
        'short_name': 'BIT Sindri',
        'district': 'Dhanbad',
        'innovation_centre': 'BIT Sindri Centre for Sustainable Infrastructure',
        'expertise_domains': [DOMAIN_WATER, DOMAIN_URBAN_DEV, DOMAIN_ENERGY],
    },
    {
        'name': 'Indian Institute of Technology (ISM) Dhanbad',
        'short_name': 'IIT ISM Dhanbad',
        'district': 'Dhanbad',
        'innovation_centre': 'IIT ISM Innovation & Incubation Centre',
        'expertise_domains': [DOMAIN_ENERGY, DOMAIN_ENVIRONMENT, DOMAIN_URBAN_DEV],
    },
    {
        'name': 'National Institute of Technology, Jamshedpur',
        'short_name': 'NIT Jamshedpur',
        'district': 'East Singhbhum',
        'innovation_centre': 'NIT JSR Technology Business Incubator',
        'expertise_domains': [DOMAIN_URBAN_DEV, DOMAIN_ACCESSIBILITY, DOMAIN_ENERGY],
    },
    {
        'name': 'Birsa Agricultural University, Ranchi',
        'short_name': 'BAU Ranchi',
        'district': 'Ranchi',
        'innovation_centre': 'BAU Agri-Business Incubation Centre',
        'expertise_domains': [DOMAIN_AGRICULTURE, DOMAIN_RURAL_LIVELIHOOD, DOMAIN_WATER],
    },
    {
        'name': 'Rajendra Institute of Medical Sciences, Ranchi',
        'short_name': 'RIMS Ranchi',
        'district': 'Ranchi',
        'innovation_centre': 'RIMS Public Health Research Cell',
        'expertise_domains': [DOMAIN_HEALTHCARE, DOMAIN_ACCESSIBILITY],
    },
    {
        'name': 'Central University of Jharkhand, Ranchi',
        'short_name': 'CUJ Ranchi',
        'district': 'Ranchi',
        'innovation_centre': 'CUJ Centre for Public Policy & Governance',
        'expertise_domains': [DOMAIN_EDUCATION, DOMAIN_PUBLIC_ADMIN, DOMAIN_OTHER],
    },
    {
        'name': 'Xavier Institute of Social Service, Ranchi',
        'short_name': 'XISS Ranchi',
        'district': 'Ranchi',
        'innovation_centre': 'XISS Rural Livelihoods Lab',
        'expertise_domains': [DOMAIN_RURAL_LIVELIHOOD, DOMAIN_EDUCATION, DOMAIN_PUBLIC_ADMIN],
    },
    {
        'name': 'Bokaro Institute of Technology',
        'short_name': 'BIT Bokaro',
        'district': 'Bokaro',
        'innovation_centre': 'BIT Bokaro Innovation Cell',
        'expertise_domains': [DOMAIN_ENVIRONMENT, DOMAIN_ENERGY, DOMAIN_OTHER],
    },
]

PARTNERS = [
    {
        'name': 'Tata Steel Foundation',
        'partner_type': 'CSR',
        'district': 'East Singhbhum',
        'sectors': [DOMAIN_WATER, DOMAIN_HEALTHCARE, DOMAIN_RURAL_LIVELIHOOD],
    },
    {
        'name': 'JharkhandTech Startup Hub',
        'partner_type': 'INCUBATOR',
        'district': 'Ranchi',
        'sectors': [DOMAIN_EDUCATION, DOMAIN_PUBLIC_ADMIN, DOMAIN_URBAN_DEV],
    },
    {
        'name': 'AgriSense Analytics Pvt Ltd',
        'partner_type': 'STARTUP',
        'district': 'Ranchi',
        'sectors': [DOMAIN_AGRICULTURE, DOMAIN_RURAL_LIVELIHOOD],
    },
    {
        'name': 'Coal India CSR Cell',
        'partner_type': 'CSR',
        'district': 'Dhanbad',
        'sectors': [DOMAIN_ENVIRONMENT, DOMAIN_ENERGY, DOMAIN_URBAN_DEV],
    },
    {
        'name': 'AquaPure Systems (MSME)',
        'partner_type': 'MSME',
        'district': 'Bokaro',
        'sectors': [DOMAIN_WATER, DOMAIN_ENVIRONMENT],
    },
    {
        'name': 'CSIR-Central Institute of Mining & Fuel Research',
        'partner_type': 'RESEARCH_LAB',
        'district': 'Dhanbad',
        'sectors': [DOMAIN_ENERGY, DOMAIN_ENVIRONMENT],
    },
]

MILESTONE_TEMPLATES = [
    ('Baseline field survey & problem validation', 20),
    ('Literature review and solution design', 35),
    ('Prototype development', 55),
    ('Field testing with community', 75),
    ('Impact assessment & handover report', 95),
]

STUDENT_POOL = [
    'Asha Kumari (Civil Engg)', 'Rohit Mahto (Computer Science)',
    'Priya Singh (Environmental Engg)', 'Imran Ansari (Mechanical Engg)',
    'Sunita Devi (Public Health)', 'Vikash Oraon (Electrical Engg)',
    'Neha Gupta (Data Science)', 'Ajay Munda (Agricultural Sciences)',
    'Fatima Khatoon (Social Work)', 'Deepak Verma (Electronics)',
]


class Command(BaseCommand):
    help = 'Seeds universities, industry partners, coordinator logins and demo innovation projects.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--projects',
            type=int,
            default=8,
            help='Number of demo projects to create from existing challenges (default 8)'
        )

    def handle(self, *args, **options):
        universities = self._seed_universities()
        partners = self._seed_partners()
        self._seed_users(universities, partners)
        routed = self._backfill_routing()
        self._seed_projects(options['projects'], partners)

        self.stdout.write(self.style.SUCCESS(
            f"\nSeeded {len(universities)} institutions, {len(partners)} industry partners, "
            f"routed {routed} existing challenges, and created demo projects."
        ))
        self.stdout.write(
            "\nDemo logins (password: Demo@1234):\n"
            "  University coordinator : uni_bitsindri / uni_bauranchi / uni_rims\n"
            "  Industry partner       : ind_tatasteel / ind_agrisense / ind_jharkhandtech\n"
        )

    def _seed_universities(self):
        created = []
        for data in UNIVERSITIES:
            uni, was_new = University.objects.get_or_create(
                name=data['name'],
                defaults={
                    'short_name': data['short_name'],
                    'district': data['district'],
                    'state': 'Jharkhand',
                    'expertise_domains': data['expertise_domains'],
                    'innovation_centre': data['innovation_centre'],
                    'contact_email': f"nodal@{data['short_name'].lower().replace(' ', '')}.ac.in",
                },
            )
            if not was_new:
                # Keep expertise in sync when the seed list changes.
                uni.expertise_domains = data['expertise_domains']
                uni.save(update_fields=['expertise_domains'])
            created.append(uni)
            self.stdout.write(f"  {'+' if was_new else '='} {uni}")
        return created

    def _seed_partners(self):
        created = []
        for data in PARTNERS:
            partner, was_new = IndustryPartner.objects.get_or_create(
                name=data['name'],
                defaults={
                    'partner_type': data['partner_type'],
                    'district': data['district'],
                    'sectors': data['sectors'],
                    'contact_email': 'partnerships@example.org',
                },
            )
            created.append(partner)
            self.stdout.write(f"  {'+' if was_new else '='} {partner}")
        return created

    def _seed_users(self, universities, partners):
        uni_logins = [
            ('uni_bitsindri', 'BIT Sindri', 'Dr. Anil', 'Prasad'),
            ('uni_bauranchi', 'BAU Ranchi', 'Dr. Meera', 'Sahay'),
            ('uni_rims', 'RIMS Ranchi', 'Dr. Sanjay', 'Tirkey'),
        ]
        for username, short_name, first, last in uni_logins:
            uni = next((u for u in universities if u.short_name == short_name), None)
            self._upsert_user(
                username, first, last, ROLE_UNIVERSITY,
                university=uni, designation='Innovation Cell Coordinator'
            )

        ind_logins = [
            ('ind_tatasteel', 'Tata Steel Foundation', 'Rakesh', 'Nair'),
            ('ind_agrisense', 'AgriSense Analytics Pvt Ltd', 'Shalini', 'Rao'),
            ('ind_jharkhandtech', 'JharkhandTech Startup Hub', 'Kabir', 'Sheikh'),
        ]
        for username, partner_name, first, last in ind_logins:
            partner = next((p for p in partners if p.name == partner_name), None)
            self._upsert_user(
                username, first, last, ROLE_INDUSTRY,
                industry_partner=partner, designation='Partnerships Lead'
            )

    def _upsert_user(self, username, first, last, role, university=None,
                     industry_partner=None, designation=''):
        user, was_new = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{username}@urbanlens.demo',
                'first_name': first,
                'last_name': last,
                'role': role,
                'designation': designation,
                'is_verified': True,
            },
        )
        user.role = role
        user.university = university
        user.industry_partner = industry_partner
        user.is_verified = True
        if was_new:
            user.set_password('Demo@1234')
        user.save()
        self.stdout.write(f"  {'+' if was_new else '='} {username} ({role})")
        return user

    def _backfill_routing(self):
        """Assigns domain + institution to challenges created before this layer existed."""
        pending = Complaint.objects.filter(routed_university__isnull=True)
        count = 0
        for complaint in pending:
            try:
                ChallengeRoutingService.route_challenge(complaint)
                count += 1
            except Exception as e:
                self.stdout.write(self.style.WARNING(
                    f"  ! Could not route {complaint.ticket_id}: {e}"
                ))
        self.stdout.write(f"  Routed {count} challenge(s) to institutions")
        return count

    # Challenges deliberately left unclaimed so a coordinator logging in during
    # a live demo always has something in their queue to claim.
    RESERVE_UNCLAIMED = 2

    def _seed_projects(self, target_count, partners):
        """Builds demo projects at varied lifecycle stages for the dashboards."""
        available = list(
            Complaint.objects.filter(
                routed_university__isnull=False,
                innovation_projects__isnull=True,
            ).order_by('-priority_score')
        )

        # Prefer reserving challenges routed to an institution that actually has
        # a coordinator login, otherwise the reserve is invisible in the demo.
        reserved_ids = set()
        if len(available) > self.RESERVE_UNCLAIMED:
            for challenge in reversed(available):
                if len(reserved_ids) >= self.RESERVE_UNCLAIMED:
                    break
                if challenge.routed_university.coordinators.exists():
                    reserved_ids.add(challenge.id)

        candidates = [c for c in available if c.id not in reserved_ids][:target_count]

        if reserved_ids:
            self.stdout.write(
                f"  Reserved {len(reserved_ids)} unclaimed challenge(s) for the live demo queue"
            )

        if not candidates:
            self.stdout.write(self.style.WARNING(
                "  ! No unclaimed routed challenges available. "
                "Run `python manage.py seed_civic_data` first to create challenges."
            ))
            return

        # Front-loaded so that even a small seed (few challenges available)
        # still produces DEPLOYED projects — otherwise the government analytics
        # dashboard reports zero social outcome, which is the whole pitch.
        stages = [
            PROJECT_DEPLOYED, PROJECT_IN_PROGRESS, PROJECT_PROTOTYPE,
            PROJECT_DEPLOYED, PROJECT_TESTING, PROJECT_IN_PROGRESS,
            PROJECT_PROTOTYPE, PROJECT_APPROVED,
        ]

        for index, challenge in enumerate(candidates):
            university = challenge.routed_university
            coordinator = university.coordinators.first()
            stage = stages[index % len(stages)]

            project = InnovationProjectService.claim_challenge(
                challenge, university, coordinator, {
                    'title': f"{challenge.get_domain_display()} intervention: {challenge.title[:80]}",
                    'proposal_summary': (
                        f"A multidisciplinary team from {university} will study the reported issue "
                        f"at {challenge.address or challenge.ward_number}, develop a low-cost "
                        f"intervention suited to local conditions, and validate it with the "
                        f"affected community before handover to the concerned department."
                    ),
                    'faculty_mentor_name': (
                        f"{coordinator.first_name} {coordinator.last_name}"
                        if coordinator else 'Dr. Faculty Mentor'
                    ),
                    'student_members': random.sample(STUDENT_POOL, k=random.randint(3, 5)),
                }
            )

            self._seed_milestones(project, stage)
            InnovationProjectService.update_status(project, stage)
            self._seed_support(project, partners, index)
            self._seed_outcomes(project, stage, index)
            self._seed_contributions(project, stage)

            self.stdout.write(f"  + {project.code} {project.title[:50]}... [{stage}]")

    def _seed_milestones(self, project, stage):
        """Marks milestones complete in proportion to the project's stage."""
        from core.constants import PROJECT_STATUS_PROGRESS
        reached = PROJECT_STATUS_PROGRESS.get(stage, 0)

        for title, threshold in MILESTONE_TEMPLATES:
            if threshold <= reached:
                milestone_status = MILESTONE_COMPLETED
            elif threshold - 20 <= reached:
                milestone_status = MILESTONE_IN_PROGRESS
            else:
                milestone_status = MILESTONE_PENDING

            ProjectMilestone.objects.create(
                project=project,
                title=title,
                description='',
                due_date=(timezone.now() + timedelta(days=threshold)).date(),
                status=milestone_status,
            )

    def _seed_support(self, project, partners, index):
        """Attaches an industry offer to roughly two out of every three projects."""
        if index % 3 == 2:
            return

        # Funding first in the rotation so a small seed still produces two
        # accepted grants; amounts are fixed rather than random so the headline
        # "funding committed" figure is stable across redeploys and can be
        # quoted in a demo script.
        support_types = [
            SUPPORT_FUNDING, SUPPORT_MENTORSHIP,
            SUPPORT_FUNDING, SUPPORT_LAB_ACCESS,
        ]
        funding_amounts = [400000, 500000, 250000]
        support_type = support_types[index % len(support_types)]
        partner = partners[index % len(partners)]

        offer = SupportOffer.objects.create(
            project=project,
            partner=partner,
            support_type=support_type,
            description=(
                f"{partner.name} offers {dict(SupportOffer._meta.get_field('support_type').choices)[support_type].lower()} "
                f"towards this project under its community innovation programme."
            ),
            amount=(funding_amounts[index % len(funding_amounts)]
                    if support_type == SUPPORT_FUNDING else None),
        )

        # Accept most offers so funding/engagement analytics are non-empty.
        # Funding offers are always accepted, otherwise "total funding committed"
        # can compute to zero on a small seed. Non-funding offers stay mixed so a
        # coordinator still has a pending offer to accept during a live demo.
        if index % 2 == 0 or support_type == SUPPORT_FUNDING:
            offer.status = SUPPORT_ACCEPTED
            offer.responded_at = timezone.now()
            offer.save(update_fields=['status', 'responded_at'])

    # Deployment impact and IP outcomes — without these the government
    # analytics dashboard reports a real pipeline but zero social outcome.
    IMPACT_PROFILES = [
        dict(people_benefited=4200, villages_covered=6, solution_cost=185000,
             patent_filed=True,
             patent_details='IN-2026-004412: Low-cost bio-sand filtration unit',
             startup_created=False, startup_name=''),
        dict(people_benefited=2750, villages_covered=4, solution_cost=142000,
             patent_filed=False, patent_details='',
             startup_created=True,
             startup_name='AgriSoil Diagnostics (student startup)'),
    ]

    CONTRIBUTION_ROLES = [
        ('Lead Researcher', 4,
         'Designed the study, ran the field survey and authored the final technical report.'),
        ('Field Data Collection', 3,
         'Collected and validated on-site samples and geo-tagged readings across affected wards.'),
        ('Prototype & Testing', 3,
         'Built the working prototype and ran the validation cycles before deployment.'),
    ]

    def _seed_outcomes(self, project, stage, index):
        """Records measured community impact + academic credit on a project."""
        fields = []

        if stage == PROJECT_DEPLOYED:
            for key, value in self.IMPACT_PROFILES[index % len(self.IMPACT_PROFILES)].items():
                setattr(project, key, value)
                fields.append(key)

        if stage in (PROJECT_DEPLOYED, PROJECT_TESTING, PROJECT_PROTOTYPE):
            project.academic_credits = 6 if stage == PROJECT_DEPLOYED else 4
            project.counts_as_capstone = stage == PROJECT_DEPLOYED
            project.counts_as_internship = True
            fields += ['academic_credits', 'counts_as_capstone', 'counts_as_internship']

        if fields:
            project.save(update_fields=fields)

    def _seed_contributions(self, project, stage):
        """Per-student credit ledger backing the NEP 2020 Student Innovation Record."""
        if project.student_contributions.exists():
            return

        credit_scale = 1 if stage in (PROJECT_DEPLOYED, PROJECT_TESTING, PROJECT_PROTOTYPE) else 0
        for i, student in enumerate(project.student_members or []):
            role, credits, summary = self.CONTRIBUTION_ROLES[i % len(self.CONTRIBUTION_ROLES)]
            StudentContribution.objects.create(
                project=project,
                student_name=student,
                role=role,
                contribution_summary=summary,
                credits_earned=credits if credit_scale else 2,
            )
