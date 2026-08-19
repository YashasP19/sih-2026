"""
AI Module API Views for real-time analysis and duplicate checking
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.ai_module.classifier import ComplaintClassifier
from apps.ai_module.priority import PriorityScorer
from apps.ai_module.similarity import DuplicateDetector
from apps.ai_module.utils import extract_keywords
from apps.complaints.models import Complaint
from core.constants import CATEGORY_TO_DEPARTMENT, STATUS_RESOLVED, STATUS_REJECTED


class RealtimeAIAnalysisView(APIView):
    """
    Analyzes draft complaint text in real-time as user types.
    Returns predicted category, confidence, urgency, suggested department, and keywords.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        title = request.data.get('title', '')
        description = request.data.get('description', '')
        lat = request.data.get('latitude')
        lon = request.data.get('longitude')

        if not title and not description:
            return Response(
                {'success': False, 'message': 'Title or description required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Classification
        classification = ComplaintClassifier.classify(title, description)
        predicted_category = classification['category']
        confidence = classification['confidence']
        suggested_dept = CATEGORY_TO_DEPARTMENT.get(predicted_category, 'GENERAL')

        # 2. Extract Keywords
        keywords = extract_keywords(f"{title} {description}", top_n=6)

        # 3. Density check (if coordinates provided)
        nearby_count = 0
        duplicate_info = {'is_duplicate': False}
        if lat is not None and lon is not None:
            try:
                lat = float(lat)
                lon = float(lon)
                # Query active non-closed complaints within bounding box for efficiency
                active_complaints = Complaint.objects.exclude(
                    status__in=[STATUS_RESOLVED, STATUS_REJECTED]
                ).filter(
                    latitude__isnull=False,
                    longitude__isnull=False
                )
                
                # Check duplicates & spatial count
                dup_result = DuplicateDetector.check_for_duplicates(
                    title, description, lat, lon, active_complaints
                )
                duplicate_info = dup_result
                if dup_result['distance_meters'] and dup_result['distance_meters'] <= 500:
                    nearby_count = active_complaints.filter(category=predicted_category).count()
            except Exception:
                pass

        # 4. Priority and Urgency
        priority_data = PriorityScorer.calculate_priority(
            title=title,
            description=description,
            category=predicted_category,
            nearby_complaints_count=nearby_count
        )

        return Response({
            'success': True,
            'analysis': {
                'predicted_category': predicted_category,
                'confidence': confidence,
                'suggested_department': suggested_dept,
                'urgency': priority_data['urgency'],
                'priority_score': priority_data['priority_score'],
                'priority_factors': priority_data['factors'],
                'extracted_keywords': keywords,
                'duplicate_check': duplicate_info
            }
        }, status=status.HTTP_200_OK)


class CheckDuplicateView(APIView):
    """Explicit endpoint for checking if a complaint is a duplicate."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        title = request.data.get('title', '')
        description = request.data.get('description', '')
        lat = request.data.get('latitude')
        lon = request.data.get('longitude')

        if not lat or not lon:
            return Response(
                {'success': False, 'message': 'GPS coordinates (latitude, longitude) required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        active_complaints = Complaint.objects.exclude(
            status__in=[STATUS_RESOLVED, STATUS_REJECTED]
        ).filter(
            latitude__isnull=False,
            longitude__isnull=False
        )

        dup_result = DuplicateDetector.check_for_duplicates(
            title, description, float(lat), float(lon), active_complaints
        )

        return Response({
            'success': True,
            'duplicate_result': dup_result
        }, status=status.HTTP_200_OK)
