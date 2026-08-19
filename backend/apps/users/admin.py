from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from apps.users.models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'department', 'ward_number', 'civic_points', 'is_active')
    list_filter = ('role', 'department', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone_number')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Civic & Role Details', {
            'fields': ('role', 'department', 'phone_number', 'avatar', 'designation', 'ward_number', 'civic_points', 'is_verified'),
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Civic & Role Details', {
            'fields': ('role', 'department', 'phone_number', 'designation', 'ward_number'),
        }),
    )
