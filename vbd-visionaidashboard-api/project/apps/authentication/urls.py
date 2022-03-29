from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LogoutView, UserLoginView, UserProfileView, UserRegistrationView

app_name = "auths"

urlpatterns = [
    path("register", UserRegistrationView.as_view(), name="auth_register"),
    path("profile", UserProfileView.as_view(), name="auth_profile"),
    path("login", UserLoginView.as_view(), name="auth_login"),
    path("login/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout", LogoutView.as_view(), name="auth_logout"),
]
