from django.contrib.auth import login, logout
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from .models import Task,UserProfile
from .serializers import (
    TaskSerializer, UserRegisterSerializer, LoginSerializer, 
    UserProfileSerializer, UpdateProfileSerializer, SuperuserLoginSerializer
)
from .filters import TaskFilter


# Task List View: View tasks belonging to the logged-in user
class TaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = (DjangoFilterBackend,)
    filterset_class = TaskFilter
    ordering_fields = ['created_at', 'deadline']
    ordering = ['created_at']

    def get_queryset(self):
        # Restrict tasks to those belonging to the logged-in user
        return Task.objects.filter(user=self.request.user)


# Task Create View: Create a new task linked to the logged-in user
class TaskCreateView(generics.CreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Save the task with the current logged-in user
        serializer.save(user=self.request.user)


# Task Update View: Update tasks belonging to the logged-in user
class TaskUpdateView(generics.UpdateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Restrict updates to tasks belonging to the logged-in user
        return Task.objects.filter(user=self.request.user)


# Task Delete View: Delete tasks belonging to the logged-in user
class TaskDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Restrict deletions to tasks belonging to the logged-in user
        return Task.objects.filter(user=self.request.user)


# Register View: Create a new user
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                # Create user (UserProfile will be created automatically via signal)
                user = serializer.save()
                
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)

                return Response({
                    "status": "success",
                    "message": "Registration successful",
                    "data": {
                        "user": {
                            "id": user.id,
                            "username": user.username,
                            "email": user.email,
                            "photo": None
                        },
                        "tokens": {
                            "access": access_token,
                            "refresh": str(refresh)
                        }
                    }
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({
                    "status": "error",
                    "message": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# Login View: Log in a user
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            login(request, user)
            refresh = RefreshToken.for_user(user)
            
            # Get photo URL if exists
            photo_url = None
            try:
                if user.profile.photo:
                    photo_url = request.build_absolute_uri(user.profile.photo.url)
            except UserProfile.DoesNotExist:
                pass

            return Response({
                "message": "Logged in successfully!",
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                },
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "photo": photo_url
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Logout View: Log out the user
class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully!"}, status=status.HTTP_200_OK)
    

# To see the user
class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        user = self.request.user
        # Get photo URL if exists
        photo_url = None
        try:
            if user.profile.photo:
                photo_url = request.build_absolute_uri(user.profile.photo.url)
        except UserProfile.DoesNotExist:
            pass

        return Response({
            'username': user.username,
            'email': user.email,
            'photo': photo_url
        })

# To Update Profile
class UpdateProfileView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateProfileSerializer
    parser_classes = (MultiPartParser, FormParser)

    def update(self, request, *args, **kwargs):
        user = self.request.user
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Get or create user profile
            profile, created = UserProfile.objects.get_or_create(user=user)

            # Update basic info if provided
            if 'username' in serializer.validated_data:
                user.username = serializer.validated_data['username']
            if 'email' in serializer.validated_data:
                user.email = serializer.validated_data['email']
            if 'password' in serializer.validated_data:
                user.set_password(serializer.validated_data['password'])
            
            # Update photo if provided
            if 'photo' in serializer.validated_data:
                profile.photo = serializer.validated_data['photo']
                profile.save()
            
            user.save()

            # Get photo URL if exists
            photo_url = request.build_absolute_uri(profile.photo.url) if profile.photo else None

            return Response({
                'message': 'Profile updated successfully',
                'data': {
                    'username': user.username,
                    'email': user.email,
                    'photo': photo_url
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Super user login    
class SuperuserLoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = SuperuserLoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            login(request, user)
            refresh = RefreshToken.for_user(user)

            return Response({
                'status': 'success',
                'message': 'Superuser logged in successfully',
                'data': {
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    },
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'is_superuser': user.is_superuser,
                        'is_staff': user.is_staff
                    }
                }
            }, status=status.HTTP_200_OK)

        return Response({
            'status': 'error',
            'message': 'Invalid credentials or not a superuser'
        }, status=status.HTTP_401_UNAUTHORIZED)

# Super user logout
class SuperuserLogoutView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            logout(request)
            return Response({
                'status': 'success',
                'message': 'Superuser logged out successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# Super user dasboard
class SuperuserDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Get regular users (excluding admins) with their tasks
        regular_users = User.objects.filter(is_superuser=False)
        users_data = []
        for user in regular_users:
            user_tasks = Task.objects.filter(user=user)
            tasks_data = [
                {
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'status': task.status,
                    'deadline': task.deadline,
                    'created_at': task.created_at
                } for task in user_tasks
            ]
            
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'tasks': tasks_data
            })

        # Get admin users
        admin_users = User.objects.filter(is_superuser=True)
        admin_data = [
            {
                'id': admin.id,
                'username': admin.username,
                'email': admin.email
            } for admin in admin_users
        ]

        # Get all tasks
        all_tasks = Task.objects.all()
        tasks_list = [
            {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'priority':task.priority,
                'status': task.status,
                'deadline': task.deadline,
                'created_at': task.created_at,
                'user': task.user.username
            } for task in all_tasks
        ]

        return Response({
            'status': 'success',
            'data': {
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'is_superuser': request.user.is_superuser,
                    'is_staff': request.user.is_staff,
                },
                'stats': {
                    'total_users': regular_users.count(),  # Only count regular users
                    'total_tasks': Task.objects.count(),
                    'total_admins': admin_users.count(),
                    'active_users': regular_users.filter(is_active=True).count(),
                },
                'users': users_data,  # Regular users with their tasks
                'admin_users': admin_data,  # List of admin users
                'all_tasks': tasks_list  # All tasks in the system
            }
        }, status=status.HTTP_200_OK)
    
        
class SuperuserTaskDeleteView(generics.DestroyAPIView):
    permission_classes=[IsAdminUser]
    queryset=Task.objects.all()

    def destroy(self, request, *args, **kwargs):
        try:
            instance=self.get_object()
            self.perform_destroy(instance)
            return Response({
                'status':'success',
                'message':'Task deleted successfully'
            },status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status':'error',
                'message':str(e)
            },status=status.HTTP_400_BAD_REQUEST)
        
class SuperuserUpdateView(generics.UpdateAPIView):
    permission_classes=[IsAdminUser]
    serializer_class=TaskSerializer
    queryset=Task.objects.all()

    def update(self, request, *args, **kwargs):
        try:
            instance=self.get_object()
            serializer=self.get_serializer(instance,data=request.data,partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status':'success',
                    'message':'Task Updated Successfuly',
                    'data':serializer.data
                },status=status.HTTP_200_OK)
            return Response({
                'status':'error',
                'message':'Invalid data',
                'errors':serializer.errors
            },status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status':'error',
                'message':str(e)
            },status=status.HTTP_400_BAD_REQUEST)