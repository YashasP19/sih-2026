"""
Complaint Management REST Views for Urban Lens
"""
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from apps.complaints.models import Complaint
from apps.complaints.serializers import (
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintCreateSerializer,
    StatusUpdateSerializer
)
from apps.complaints.services import ComplaintService
from core.permissions import IsOfficerOrAdmin, IsCitizen, IsOwnerOrOfficerOrAdmin
from core.pagination import StandardResultsSetPagination

User = get_user_model()


class ComplaintListCreateView(generics.ListCreateAPIView):
    """
    GET: List all public complaints with search and multi-facet filtering.
    POST: Submit a new civic grievance with AI auto-classification and scoring.
    """
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintListSerializer

    def get_queryset(self):
        queryset = Complaint.objects.select_related('citizen', 'duplicate_of').all()
        
        # Filter query params
        status_param = self.request.query_params.get('status')
        category_param = self.request.query_params.get('category')
        urgency_param = self.request.query_params.get('urgency')
        dept_param = self.request.query_params.get('department')
        ward_param = self.request.query_params.get('ward')
        search_query = self.request.query_params.get('search')
        sort_by = self.request.query_params.get('sort', '-priority_score')

        if status_param:
            queryset = queryset.filter(status=status_param)
        if category_param:
            queryset = queryset.filter(category=category_param)
        if urgency_param:
            queryset = queryset.filter(urgency=urgency_param)
        if dept_param:
            queryset = queryset.filter(assigned_department=dept_param)
        if ward_param:
            queryset = queryset.filter(ward_number=ward_param)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(ticket_id__icontains=search_query) |
                Q(address__icontains=search_query)
            )

        valid_sorts = ['-priority_score', '-created_at', 'created_at', '-upvotes_count']
        if sort_by in valid_sorts:
            queryset = queryset.order_by(sort_by)
        else:
            queryset = queryset.order_by('-priority_score', '-created_at')

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        image_file = request.FILES.get('image')
        complaint = ComplaintService.create_complaint(
            citizen=request.user,
            data=serializer.validated_data,
            image_file=image_file
        )

        response_data = ComplaintDetailSerializer(complaint, context={'request': request}).data
        return Response({
            'success': True,
            'message': f'Grievance registered successfully. Tracking ID: {complaint.ticket_id}',
            'complaint': response_data
        }, status=status.HTTP_201_CREATED)


class ComplaintDetailView(generics.RetrieveAPIView):
    """Retrieve full details of a specific grievance including audit history."""
    queryset = Complaint.objects.select_related('citizen', 'assigned_officer', 'duplicate_of').prefetch_related('activity_logs').all()
    serializer_class = ComplaintDetailSerializer
    permission_classes = [permissions.AllowAny]


class MyComplaintsView(generics.ListAPIView):
    """List grievances filed by the currently authenticated citizen."""
    serializer_class = ComplaintListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Complaint.objects.filter(citizen=self.request.user).order_by('-created_at')


class DepartmentComplaintsView(generics.ListAPIView):
    """
    List grievances relevant to the municipal officer's department or assigned queue.
    """
    serializer_class = ComplaintListSerializer
    permission_classes = [IsOfficerOrAdmin]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        queryset = Complaint.objects.select_related('citizen', 'assigned_officer').all()

        # Officers see their department queue; admins see every grievance
        if user.role == 'OFFICER' and user.department:
            queryset = queryset.filter(
                Q(assigned_department=user.department) | Q(assigned_officer=user)
            )

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset.order_by('-priority_score', '-created_at')


class UpdateComplaintStatusView(APIView):
    """
    Allows municipal officers and admins to update grievance status,
    assign field personnel, and attach before/after proof images.
    """
    permission_classes = [IsOfficerOrAdmin]

    def post(self, request, pk):
        complaint = generics.get_object_or_404(Complaint, pk=pk)
        serializer = StatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        remarks = serializer.validated_data.get('remarks', '')
        resolution_image = request.FILES.get('resolution_image')
        
        assigned_officer = None
        assigned_officer_id = serializer.validated_data.get('assigned_officer_id')
        if assigned_officer_id:
            assigned_officer = User.objects.filter(id=assigned_officer_id).first()

        assigned_dept = serializer.validated_data.get('assigned_department')

        updated_complaint = ComplaintService.update_complaint_status(
            complaint=complaint,
            performed_by=request.user,
            new_status=new_status,
            remarks=remarks,
            resolution_image=resolution_image,
            assigned_officer=assigned_officer,
            assigned_department=assigned_dept
        )

        return Response({
            'success': True,
            'message': f"Grievance status updated to {updated_complaint.get_status_display()}.",
            'complaint': ComplaintDetailSerializer(updated_complaint, context={'request': request}).data
        }, status=status.HTTP_200_OK)


class ClaimComplaintView(APIView):
    """
    Allows a department officer to self-assign an unclaimed grievance in
    their own department, instead of waiting for an admin to hand it out.
    """
    permission_classes = [IsOfficerOrAdmin]

    def post(self, request, pk):
        complaint = generics.get_object_or_404(Complaint, pk=pk)
        user = request.user

        if user.role == 'OFFICER':
            if complaint.assigned_department != user.department:
                return Response({
                    'success': False,
                    'message': 'This grievance belongs to a different department.'
                }, status=status.HTTP_403_FORBIDDEN)
            if complaint.assigned_officer_id and complaint.assigned_officer_id != user.id:
                return Response({
                    'success': False,
                    'message': f'Already claimed by {complaint.assigned_officer.get_full_name() or complaint.assigned_officer.username}.'
                }, status=status.HTTP_409_CONFLICT)

        updated_complaint = ComplaintService.claim_complaint(complaint=complaint, officer=user)

        return Response({
            'success': True,
            'message': f'Ticket {updated_complaint.ticket_id} claimed. You are now the assigned officer.',
            'complaint': ComplaintDetailSerializer(updated_complaint, context={'request': request}).data
        }, status=status.HTTP_200_OK)


class ToggleUpvoteView(APIView):
    """Allows citizens to upvote / confirm community complaints."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        complaint = generics.get_object_or_404(Complaint, pk=pk)
        result = ComplaintService.toggle_upvote(complaint, request.user)
        return Response({
            'success': True,
            'is_upvoted': result['is_upvoted'],
            'upvotes_count': result['upvotes_count'],
            'priority_score': result['priority_score']
        }, status=status.HTTP_200_OK)


class ComplaintGeoListView(APIView):
    """
    Lightweight GeoJSON / list endpoint for interactive Leaflet Map pins and Heatmaps.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        complaints = Complaint.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False
        ).select_related('citizen')

        category = request.query_params.get('category')
        status_param = request.query_params.get('status')
        if category:
            complaints = complaints.filter(category=category)
        if status_param:
            complaints = complaints.filter(status=status_param)

        pins = []
        for c in complaints:
            pins.append({
                'id': c.id,
                'ticket_id': c.ticket_id,
                'title': c.title,
                'category': c.category,
                'category_display': c.get_category_display(),
                'status': c.status,
                'status_display': c.get_status_display(),
                'urgency': c.urgency,
                'priority_score': c.priority_score,
                'latitude': float(c.latitude),
                'longitude': float(c.longitude),
                'address': c.address,
                'created_at': c.created_at.strftime('%Y-%m-%d'),
                'image': c.image.url if c.image else None,
                'upvotes_count': c.upvotes_count
            })

        return Response({
            'success': True,
            'count': len(pins),
            'pins': pins
        }, status=status.HTTP_200_OK)
