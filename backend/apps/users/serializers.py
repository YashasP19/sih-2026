"""
Serializers for User Authentication and Profile Management
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from core.constants import ROLE_CITIZEN, ROLE_OFFICER, ROLE_ADMIN

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Public/Standard User Serializer."""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'department', 'department_display',
            'phone_number', 'avatar', 'designation', 'ward_number',
            'civic_points', 'is_verified', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined', 'civic_points', 'is_verified']


class RegisterSerializer(serializers.ModelSerializer):
    """Registration serializer with secure password validation."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'department',
            'phone_number', 'ward_number', 'designation'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})

        if attrs.get('role') == ROLE_OFFICER and not attrs.get('department'):
            raise serializers.ValidationError({'department': 'Officers must be assigned to a department.'})

        if User.objects.filter(username__iexact=attrs['username']).exists():
            raise serializers.ValidationError({'username': 'This username is already taken. Please choose another.'})

        if User.objects.filter(email__iexact=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'This email is already registered. Try signing in instead.'})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.get('role', ROLE_CITIZEN)

        if role == ROLE_CITIZEN:
            validated_data['department'] = validated_data.get('department') or 'GENERAL'

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=role,
            department=validated_data.get('department', None),
            phone_number=validated_data.get('phone_number', ''),
            ward_number=validated_data.get('ward_number', ''),
            designation=validated_data.get('designation', '')
        )
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for profile updates."""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'ward_number', 'avatar', 'designation']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
