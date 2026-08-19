"""
Authentication and User Management Views for CivicSense AI
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from apps.users.serializers import (
    UserSerializer,
    RegisterSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer
)
from core.permissions import IsOfficerOrAdmin
from core.constants import ROLE_OFFICER

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Enhance JWT token payload with role and profile metadata."""
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT login endpoint returning tokens and full user object."""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Public registration endpoint for Citizens and Municipal staff."""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Issue JWT tokens immediately upon registration
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        user_data = UserSerializer(user).data
        
        return Response({
            'success': True,
            'message': 'Account created successfully.',
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'user': user_data
        }, status=status.HTTP_201_CREATED)


class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update currently authenticated user profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Secure password change for authenticated users."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'success': False, 'message': 'Current password does not match.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(
                {'success': True, 'message': 'Password updated successfully.'},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DepartmentOfficerListView(generics.ListAPIView):
    """List municipal officers for complaint dispatching (Officers/Admins only)."""
    permission_classes = [IsOfficerOrAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.filter(role=ROLE_OFFICER, is_active=True)
        dept = self.request.query_params.get('department')
        if dept:
            queryset = queryset.filter(department=dept)
        return queryset
