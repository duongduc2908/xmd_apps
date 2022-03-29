import json
from re import S
from project.apps.api.models import Site
from project.apps.api.serializers import SiteSerializer
from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTTokenUserAuthentication
from rest_framework_simplejwt.tokens import BlacklistedToken, OutstandingToken, RefreshToken

from project import error
from project.config import const
from project.utils import api_response

from .models import User
from .serializers import LoginSerializer, UserRegistrationSerializer

from project.services.age_type_service import *


class UserRegistrationView(CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        print(request.data)
        serializer = self.serializer_class(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()
        status_code = status.HTTP_201_CREATED

        return api_response(message=error.MSE002, http_status=status_code)


class UserLoginView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.get(username=serializer.validated_data["username"])

        site = {"id": None, "name": "Administrator", "role": "admin_user"}
        if hasattr(user, "site"):
            site = Site.objects.filter(id=user.site.id)[:1].get()
            site = {
                "id": site.id,
                "name": str(site.type).upper() + " " + str(site.name),
                "type": site.type,
                "role": "standard_user",
            }

        data = {
            "token": {
                "access_token": serializer.data["access_token"],
                "refresh_token": serializer.data["refresh_token"],
            },
            "profile": site,
        }

        return api_response(data, http_status=status.HTTP_200_OK)


class UserProfileView(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_class = JWTTokenUserAuthentication

    def get(self, request):
        try:
            # user_profile = UserProfile.objects.get(user=User.objects.get(email=request.user))

            # status_code = status.HTTP_200_OK
            # data = {
            #     "first_name": user_profile.first_name,
            #     "last_name": user_profile.last_name,
            #     "phone_number": user_profile.phone_number,
            #     "age": user_profile.age,
            #     "gender": user_profile.gender,
            # }

            data = {}

        except Exception as e:
            return api_response(status=error.STATUS_ERROR, message=str(e), http_status=status.HTTP_400_BAD_REQUEST)
        return api_response(data, http_status=status_code)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return api_response(status=error.STATUS_ERROR, http_status=status.HTTP_400_BAD_REQUEST)
        return api_response(message=error.MSE003, http_status=status.HTTP_205_RESET_CONTENT)


class LogoutAllView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            tokens = OutstandingToken.objects.filter(user_id=request.user.id)
            for token in tokens:
                t, _ = BlacklistedToken.objects.get_or_create(token=token)
        except Exception:
            return api_response(
                message=error.MSF001, status=error.STATUS_ERROR, http_status=status.HTTP_400_BAD_REQUEST
            )

        return api_response(message=error.MSE003, http_status=status.HTTP_205_RESET_CONTENT)
