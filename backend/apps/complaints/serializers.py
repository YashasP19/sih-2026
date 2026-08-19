"""
Serializers for Complaint Management, Creation, and Status Updates
"""
from rest_framework import serializers
from apps.complaints.models import Complaint, ComplaintActivityLog, ComplaintUpvote
from apps.users.serializers import UserSerializer


class ActivityLogSerializer(serializers.ModelSerializer):
    """Audit log entry serializer."""
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintActivityLog
        fields = [
            'id', 'action', 'old_status', 'new_status', 
            'remarks', 'timestamp', 'performed_by', 'performed_by_name'
        ]

    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return obj.performed_by.get_full_name() or obj.performed_by.username
        return 'Urban Lens Engine'


class ComplaintListSerializer(serializers.ModelSerializer):
    """Optimized serializer for complaint feeds, lists, and map pins."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    department_display = serializers.CharField(source='get_assigned_department_display', read_only=True)
    citizen_name = serializers.SerializerMethodField()
    assigned_officer_name = serializers.SerializerMethodField()
    is_user_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'id', 'ticket_id', 'title', 'description',
            'category', 'category_display',
            'urgency', 'urgency_display', 'priority_score', 'status', 'status_display',
            'latitude', 'longitude', 'address', 'landmark', 'ward_number', 'pincode',
            'image', 'assigned_department', 'department_display',
            'assigned_officer', 'assigned_officer_name',
            'resolution_notes', 'resolution_image',
            'upvotes_count', 'is_duplicate', 'citizen_name', 'is_user_upvoted',
            'created_at', 'updated_at', 'resolved_at'
        ]

    def get_citizen_name(self, obj):
        return obj.citizen.get_full_name() or obj.citizen.username

    def get_assigned_officer_name(self, obj):
        if obj.assigned_officer:
            return obj.assigned_officer.get_full_name() or obj.assigned_officer.username
        return None

    def get_is_user_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ComplaintUpvote.objects.filter(complaint=obj, user=request.user).exists()
        return False


class ComplaintDetailSerializer(serializers.ModelSerializer):
    """Full detail view serializer with activity logs and officer information."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    department_display = serializers.CharField(source='get_assigned_department_display', read_only=True)
    citizen = UserSerializer(read_only=True)
    assigned_officer = UserSerializer(read_only=True)
    activity_logs = ActivityLogSerializer(many=True, read_only=True)
    is_user_upvoted = serializers.SerializerMethodField()
    duplicate_of_ticket = serializers.CharField(source='duplicate_of.ticket_id', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'ticket_id', 'citizen', 'title', 'description',
            'category', 'category_display', 'auto_classified', 'ai_confidence',
            'urgency', 'urgency_display', 'priority_score',
            'status', 'status_display', 'latitude', 'longitude',
            'address', 'landmark', 'ward_number', 'pincode',
            'image', 'resolution_image', 'resolution_notes',
            'assigned_department', 'department_display', 'assigned_officer',
            'is_duplicate', 'duplicate_of', 'duplicate_of_ticket',
            'keywords', 'upvotes_count', 'is_user_upvoted',
            'activity_logs', 'created_at', 'updated_at', 'resolved_at'
        ]

    def get_is_user_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ComplaintUpvote.objects.filter(complaint=obj, user=request.user).exists()
        return False


class ComplaintCreateSerializer(serializers.ModelSerializer):
    """Validation serializer for submitting new grievances."""
    class Meta:
        model = Complaint
        fields = [
            'title', 'description', 'category', 'latitude', 'longitude',
            'address', 'landmark', 'ward_number', 'pincode', 'image'
        ]
        extra_kwargs = {
            'title': {'required': True},
            'description': {'required': True},
            'category': {'required': False},
            'latitude': {'required': False},
            'longitude': {'required': False},
        }


class StatusUpdateSerializer(serializers.Serializer):
    """Validation serializer for status transitions by department officers."""
    status = serializers.ChoiceField(choices=['PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'])
    remarks = serializers.CharField(required=False, allow_blank=True)
    assigned_officer_id = serializers.IntegerField(required=False, allow_null=True)
    assigned_department = serializers.CharField(required=False, allow_blank=True)
    resolution_image = serializers.ImageField(required=False, allow_null=True)
