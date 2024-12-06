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
