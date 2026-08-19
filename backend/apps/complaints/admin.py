from django.contrib import admin
from apps.complaints.models import Complaint, ComplaintActivityLog, ComplaintUpvote


class ActivityLogInLine(admin.TabularInline):
    model = ComplaintActivityLog
    extra = 0
    readonly_fields = ('performed_by', 'action', 'old_status', 'new_status', 'remarks', 'timestamp')


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = (
        'ticket_id', 'title', 'category', 'urgency', 'priority_score',
        'status', 'assigned_department', 'assigned_officer', 'citizen', 'created_at'
    )
    list_filter = ('status', 'category', 'urgency', 'assigned_department', 'is_duplicate')
    search_fields = ('ticket_id', 'title', 'description', 'address', 'citizen__username')
    readonly_fields = ('ticket_id', 'ai_confidence', 'priority_score', 'created_at', 'updated_at')
    inlines = [ActivityLogInLine]


@admin.register(ComplaintActivityLog)
class ComplaintActivityLogAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'performed_by', 'action', 'new_status', 'timestamp')
    list_filter = ('action', 'new_status')
    search_fields = ('complaint__ticket_id', 'remarks')


@admin.register(ComplaintUpvote)
class ComplaintUpvoteAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'user', 'created_at')
