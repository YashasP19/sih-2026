"""
Main URL Configuration for Urban Lens Platform
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root_view(request):
    """API health check and directory index."""
    return Response({
        'platform': 'Urban Lens - Civic Grievance Redressal & Transparency Platform',
        'version': '1.0.0',
        'status': 'ONLINE',
        'endpoints': {
            'auth': '/api/v1/auth/',
            'complaints': '/api/v1/complaints/',
            'ai_nlp': '/api/v1/ai/',
            'dashboard_analytics': '/api/v1/dashboard/',
            'admin_panel': '/admin/',
        }
    })


urlpatterns = [
    # Admin Interface
    path('admin/', admin.site.urls),

    # API Root Health Check
    path('api/v1/', api_root_view, name='api_root'),

    # Application Endpoints
    path('api/v1/auth/', include('apps.users.urls', namespace='users')),
    path('api/v1/complaints/', include('apps.complaints.urls', namespace='complaints')),
    path('api/v1/ai/', include('apps.ai_module.urls', namespace='ai_module')),
    path('api/v1/dashboard/', include('apps.dashboard.urls', namespace='dashboard')),
]

# Serve media files (needed for complaint photos in production too)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
