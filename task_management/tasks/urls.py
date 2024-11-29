# tasks/urls.py

# tasks/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, LoginView, LogoutView
from .views import TaskCreateView, TaskListView, TaskUpdateView, TaskDeleteView
from .views import UserProfileView, UpdateProfileView
from .views import SuperuserLoginView,SuperuserDashboardView,SuperuserLogoutView,SuperuserRegistrationView


urlpatterns = [
    # Register view (user signup)
    path('register/', RegisterView.as_view(), name='register'),
    
    # Login and Get Access & Refresh tokens
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Refresh JWT Access Token
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Logout view (invalidate session)
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Endpoint for creating a new task
    path('tasks/', TaskCreateView.as_view(), name='task-create'),
    
    # Endpoint to list tasks with search filters
    path('tasks/list/', TaskListView.as_view(), name='task-list'),
    
    # Endpoint to update a task by ID
    path('tasks/<int:pk>/', TaskUpdateView.as_view(), name='task-update'),
    
    # Endpoint to delete a task by ID
    path('tasks/delete/<int:pk>/', TaskDeleteView.as_view(), name='task-delete'),

    # Endpoint to see user information
    path('user/profile/',UserProfileView.as_view(),name='user-profile'),

    # Endpoint to update profile
    path('user/update-profile/',UpdateProfileView.as_view(),name='update-profile'),

    # Endpoint to superuser login
    path('superuser/login/', SuperuserLoginView.as_view(), name='superuser_login'),

    #Endpoint to superuser logout
    path('superuser/logout/', SuperuserLogoutView.as_view(), name='superuser_logout'),

    #Endpoint to superuser dashboard
    path('superuser/dashboard/', SuperuserDashboardView.as_view(), name='superuser_dashboard'),

    path('superuser/register/',SuperuserRegistrationView.as_view(),name='superuser_register'),

]
