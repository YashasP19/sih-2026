"""
Business Logic & Service Layer for Civic Complaint Processing
"""
import logging
from django.utils import timezone
from django.db import transaction
from apps.complaints.models import Complaint, ComplaintActivityLog, ComplaintUpvote
from apps.ai_module.classifier import ComplaintClassifier
from apps.ai_module.priority import PriorityScorer
from apps.ai_module.similarity import DuplicateDetector
from apps.ai_module.utils import extract_keywords
from core.constants import (
    CATEGORY_TO_DEPARTMENT,
    STATUS_PENDING,
    STATUS_VERIFIED,
    STATUS_IN_PROGRESS,
    STATUS_RESOLVED,
    STATUS_REJECTED
)

logger = logging.getLogger(__name__)


class ComplaintService:
    """
    Orchestrates the entire lifecycle of a civic complaint:
    AI processing, duplicate detection, priority scoring, department routing,
    status transitions, and activity audit logging.
    """

    @classmethod
    @transaction.atomic
    def create_complaint(cls, citizen, data: dict, image_file=None) -> Complaint:
        """
        Creates a new complaint with automatic AI pipeline enrichment.
        """
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        manual_category = data.get('category')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        address = data.get('address', '')
        landmark = data.get('landmark', '')
        pincode = data.get('pincode', '')
        ward_number = data.get('ward_number', 'Ward 1')

        # Step 1: AI Category Classification
        classification = ComplaintClassifier.classify(title, description)
        predicted_category = classification['category']
        ai_confidence = classification['confidence']

        # Use manual category if provided and valid, otherwise AI prediction
        final_category = manual_category if manual_category and manual_category != 'OTHER' else predicted_category
        auto_classified = (final_category == predicted_category)

        # Step 2: Auto-assign responsible Municipal Department
        assigned_department = CATEGORY_TO_DEPARTMENT.get(final_category, 'GENERAL')

        # Step 3: Extract AI Keywords
        keywords = extract_keywords(f"{title} {description}", top_n=6)

        # Step 4: Geo-Spatial Density & Duplicate Detection
        nearby_count = 0
        is_duplicate = False
        duplicate_parent = None

        if latitude is not None and longitude is not None:
            try:
                lat_f = float(latitude)
                lon_f = float(longitude)
                
                # Retrieve active unresolved complaints
                active_complaints = Complaint.objects.exclude(
                    status__in=[STATUS_RESOLVED, STATUS_REJECTED]
                ).filter(
                    latitude__isnull=False,
                    longitude__isnull=False
                )
                
                # Check for duplicate complaint
                dup_result = DuplicateDetector.check_for_duplicates(
                    title, description, lat_f, lon_f, active_complaints
                )
                
                if dup_result['is_duplicate'] and dup_result['matched_complaint_id']:
                    is_duplicate = True
                    duplicate_parent = Complaint.objects.filter(id=dup_result['matched_complaint_id']).first()

                # Count nearby issues in same category for density boost
                nearby_count = active_complaints.filter(category=final_category).count()
            except Exception as e:
                logger.warning(f"Spatial duplicate check error: {e}")

        # Step 5: Dynamic Priority Scoring & Urgency Calculation
        priority_info = PriorityScorer.calculate_priority(
            title=title,
            description=description,
            category=final_category,
            nearby_complaints_count=nearby_count
        )

        priority_score = priority_info['priority_score']
        urgency = priority_info['urgency']

        # Step 6: Create Complaint Instance
        complaint = Complaint.objects.create(
            citizen=citizen,
            title=title,
            description=description,
            category=final_category,
            auto_classified=auto_classified,
            ai_confidence=ai_confidence,
            urgency=urgency,
            priority_score=priority_score,
            status=STATUS_PENDING,
            latitude=latitude,
            longitude=longitude,
            address=address,
            landmark=landmark,
            pincode=pincode,
            ward_number=ward_number,
            image=image_file,
            assigned_department=assigned_department,
            is_duplicate=is_duplicate,
            duplicate_of=duplicate_parent,
            keywords=keywords
        )

        # Step 7: Create Initial Activity Log
        ComplaintActivityLog.objects.create(
            complaint=complaint,
            performed_by=citizen,
            action='SUBMITTED',
            new_status=STATUS_PENDING,
            remarks=(
                f"Grievance submitted by {citizen.get_full_name() or citizen.username}. "
                f"Routed to {complaint.get_assigned_department_display()}. "
                f"AI classified as {complaint.get_category_display()} with {urgency} urgency "
                f"(Priority: {priority_score}/100)."
            ),
        )

        # Auto-verify via AI so admin queue shows actionable tickets immediately
        complaint.status = STATUS_VERIFIED
        complaint.save(update_fields=['status'])
        ComplaintActivityLog.objects.create(
            complaint=complaint,
            performed_by=None,
            action='AI_VERIFIED',
            old_status=STATUS_PENDING,
            new_status=STATUS_VERIFIED,
            remarks='AI auto-verified category, department routing, and priority score.',
        )

        # Step 8: Route to a Higher Education Institution for innovation-driven
        # resolution. Failure here must not block grievance intake, so an
        # unrouted challenge simply awaits manual allocation by an admin.
        try:
            from apps.innovation.services import ChallengeRoutingService
            university = ChallengeRoutingService.route_challenge(complaint)
            ComplaintActivityLog.objects.create(
                complaint=complaint,
                performed_by=None,
                action='ROUTED_TO_HEI',
                remarks=(
                    f"Domain classified as {complaint.get_domain_display()}. "
                    + (
                        f"Routed to {university} for academic evaluation."
                        if university else
                        "No matching institution available; awaiting manual allocation."
                    )
                ),
            )
        except Exception as e:
            logger.warning(f"HEI routing failed for {complaint.ticket_id}: {e}")

        # Step 9: Reward Citizen Civic Points
        citizen.civic_points += 10
        citizen.save(update_fields=['civic_points'])

        return complaint

    @classmethod
    @transaction.atomic
    def update_complaint_status(
        cls, 
        complaint: Complaint, 
        performed_by, 
        new_status: str, 
        remarks: str = '', 
        resolution_image=None,
        assigned_officer=None,
        assigned_department=None
    ) -> Complaint:
        """
        Updates complaint lifecycle status, records resolution proof, and appends audit log.
        """
        old_status = complaint.status
        complaint.status = new_status
        
        if assigned_officer:
            complaint.assigned_officer = assigned_officer
            
        if assigned_department:
            complaint.assigned_department = assigned_department

        if new_status == STATUS_RESOLVED:
            complaint.resolved_at = timezone.now()
            if remarks:
                complaint.resolution_notes = remarks
            if resolution_image:
                complaint.resolution_image = resolution_image
            # Bonus civic reputation for verified resolution
            complaint.citizen.civic_points += 20
            complaint.citizen.save(update_fields=['civic_points'])

        complaint.save()

        # Append Activity Log
        ComplaintActivityLog.objects.create(
            complaint=complaint,
            performed_by=performed_by,
            action=f'STATUS_{new_status}',
            old_status=old_status,
            new_status=new_status,
            remarks=remarks or f"Status transitioned from {old_status} to {new_status}."
        )

        return complaint

    @classmethod
    @transaction.atomic
    def claim_complaint(cls, complaint: Complaint, officer) -> Complaint:
        """
        Lets an officer self-assign an unclaimed grievance in their department,
        bumping it to VERIFIED if it is still sitting at PENDING.
        """
        complaint.assigned_officer = officer
        if complaint.status == STATUS_PENDING:
            complaint.status = STATUS_VERIFIED
        complaint.save(update_fields=['assigned_officer', 'status'])

        ComplaintActivityLog.objects.create(
            complaint=complaint,
            performed_by=officer,
            action='CLAIMED',
            new_status=complaint.status,
            remarks=f"Claimed by {officer.get_full_name() or officer.username}."
        )

        return complaint

    @classmethod
    @transaction.atomic
    def toggle_upvote(cls, complaint: Complaint, user) -> dict:
        """
        Allows citizens to upvote/endorse community complaints.
        """
        existing_upvote = ComplaintUpvote.objects.filter(complaint=complaint, user=user).first()
        if existing_upvote:
            existing_upvote.delete()
            complaint.upvotes_count = max(0, complaint.upvotes_count - 1)
            complaint.save(update_fields=['upvotes_count'])
            is_upvoted = False
        else:
            ComplaintUpvote.objects.create(complaint=complaint, user=user)
            complaint.upvotes_count += 1
            # Dynamic community escalation: If 5+ upvotes, boost priority score slightly
            if complaint.upvotes_count in [5, 10, 20]:
                complaint.priority_score = min(100, complaint.priority_score + 5)
            complaint.save(update_fields=['upvotes_count', 'priority_score'])
            is_upvoted = True

        return {
            'is_upvoted': is_upvoted,
            'upvotes_count': complaint.upvotes_count,
            'priority_score': complaint.priority_score
        }
