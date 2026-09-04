"""
Serializers for User Authentication and Profile Management
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from core.constants import (
    ROLE_CITIZEN,
    ROLE_OFFICER,
    ROLE_ADMIN,
    ROLE_UNIVERSITY,
    ROLE_INDUSTRY,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Public/Standard User Serializer."""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)
    university_name = serializers.CharField(source='university.__str__', read_only=True, default=None)
    industry_partner_name = serializers.CharField(source='industry_partner.name', read_only=True, default=None)
    organization_name = serializers.SerializerMethodField()

    def get_organization_name(self, obj):
        """Whichever organisation this user represents, for header display."""
        if obj.university_id:
            return str(obj.university)
        if obj.industry_partner_id:
            return obj.industry_partner.name
        return None

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'department', 'department_display',
            'phone_number', 'avatar', 'designation', 'ward_number',
            'civic_points', 'is_verified', 'date_joined',
            'university', 'university_name', 'industry_partner',
            'industry_partner_name', 'organization_name'
        ]
        read_only_fields = ['id', 'date_joined', 'civic_points', 'is_verified']


class RegisterSerializer(serializers.ModelSerializer):
    """Registration serializer with secure password validation."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    organization_name = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Institution or partner organisation name, for UNIVERSITY / INDUSTRY roles"
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'department',
            'phone_number', 'ward_number', 'designation',
            'university', 'industry_partner', 'organization_name'
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

        # University / industry users identify their organisation either by
        # picking a registered one (FK) or by typing its name, which is
        # resolved — or registered — on create.
        if attrs.get('role') == ROLE_UNIVERSITY and not (
            attrs.get('university') or attrs.get('organization_name')
        ):
            raise serializers.ValidationError(
                {'organization_name': 'University coordinators must name their institution.'}
            )

        if attrs.get('role') == ROLE_INDUSTRY and not (
            attrs.get('industry_partner') or attrs.get('organization_name')
        ):
            raise serializers.ValidationError(
                {'organization_name': 'Industry users must name their partner organisation.'}
            )

        if User.objects.filter(username__iexact=attrs['username']).exists():
            raise serializers.ValidationError({'username': 'This username is already taken. Please choose another.'})

        if User.objects.filter(email__iexact=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'This email is already registered. Try signing in instead.'})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        org_name = (validated_data.pop('organization_name', '') or '').strip()
        role = validated_data.get('role', ROLE_CITIZEN)

        if role == ROLE_CITIZEN:
            validated_data['department'] = validated_data.get('department') or 'GENERAL'

        # Resolve the organisation by name when no registered record was picked,
        # matching an existing entry case-insensitively before creating one.
        if role == ROLE_UNIVERSITY and not validated_data.get('university') and org_name:
            from apps.innovation.models import University
            university = University.objects.filter(
                name__iexact=org_name
            ).first() or University.objects.filter(short_name__iexact=org_name).first()
            if university is None:
                university = University.objects.create(name=org_name, district='')
            validated_data['university'] = university

        if role == ROLE_INDUSTRY and not validated_data.get('industry_partner') and org_name:
            from apps.innovation.models import IndustryPartner
            partner = IndustryPartner.objects.filter(name__iexact=org_name).first()
            if partner is None:
                partner = IndustryPartner.objects.create(name=org_name)
            validated_data['industry_partner'] = partner

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
            designation=validated_data.get('designation', ''),
            university=validated_data.get('university', None),
            industry_partner=validated_data.get('industry_partner', None)
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
