# tasks/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Task,UserProfile
from django.contrib.auth.password_validation import validate_password

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'priority', 'status', 'deadline', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
        
        
# Serializer for user registration
class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user 
    
# Serializer for login (authentication)
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user is None:
            raise serializers.ValidationError('Invalid username or password')
        return user



class UserProfileSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(source='profile.photo', required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'photo']
        read_only_fields = ['username']

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value


class UpdateProfileSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(required=False, write_only=True)
    photo = serializers.ImageField(required=False)

    def validate(self, data):
        if not data:
            raise serializers.ValidationError("Please provide at least one field to update")
        return data

    def validate_username(self, value):
        if value:
            user = self.context['request'].user
            if User.objects.exclude(pk=user.pk).filter(username=value).exists():
                raise serializers.ValidationError("This username is already taken")
        return value

    def validate_email(self, value):
        if value:
            user = self.context['request'].user
            if User.objects.exclude(pk=user.pk).filter(email=value).exists():
                raise serializers.ValidationError("This email is already in use")
        return value

    def update(self, instance, validated_data):
        # Update user fields
        if 'username' in validated_data:
            instance.username = validated_data['username']
        if 'email' in validated_data:
            instance.email = validated_data['email']
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        
        # Update profile photo
        if 'photo' in validated_data:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            profile.photo = validated_data['photo']
            profile.save()
        
        instance.save()
        return instance

    def to_representation(self, instance):
        request = self.context.get('request')
        photo_url = None
        try:
            if instance.profile.photo:
                photo_url = request.build_absolute_uri(instance.profile.photo.url)
        except UserProfile.DoesNotExist:
            pass

        return {
            'username': instance.username,
            'email': instance.email,
            'photo': photo_url
        }
    
class SuperuserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_superuser:
            return user
        raise serializers.ValidationError("Invalid credentials or not a superuser")
    
class SuperuserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password')
        extra_kwargs = {
            'email': {'required': True}
        }

    def validate(self, attrs):
        # Check if passwords match
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })

        # Check if email is unique
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({
                "email": "This email is already in use."
            })

        # Check if username is unique
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({
                "username": "This username is already taken."
            })

        # Validate password strength
        password = attrs['password']
        if len(password) < 8:
            raise serializers.ValidationError({
                "password": "Password must be at least 8 characters long."
            })
        if not any(char.isdigit() for char in password):
            raise serializers.ValidationError({
                "password": "Password must contain at least one number."
            })
        if not any(char.isupper() for char in password):
            raise serializers.ValidationError({
                "password": "Password must contain at least one uppercase letter."
            })
        if not any(char.islower() for char in password):
            raise serializers.ValidationError({
                "password": "Password must contain at least one lowercase letter."
            })

        return attrs

    def create(self, validated_data):
        # Remove confirm_password from the data
        validated_data.pop('confirm_password', None)
        
        # Create superuser
        user = User.objects.create_superuser(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        return user

    def to_representation(self, instance):
        return {
            'id': instance.id,
            'username': instance.username,
            'email': instance.email,
            'is_superuser': instance.is_superuser,
            'is_staff': instance.is_staff
        }