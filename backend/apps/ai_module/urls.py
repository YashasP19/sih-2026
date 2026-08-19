"""
AI Module API URL routing
"""
from django.urls import path
from apps.ai_module.views import RealtimeAIAnalysisView, CheckDuplicateView, TranscribeAudioView

app_name = 'ai_module'

urlpatterns = [
    path('analyze/', RealtimeAIAnalysisView.as_view(), name='realtime_analyze'),
    path('check-duplicate/', CheckDuplicateView.as_view(), name='check_duplicate'),
    path('transcribe/', TranscribeAudioView.as_view(), name='transcribe'),
]
