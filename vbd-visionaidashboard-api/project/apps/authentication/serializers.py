from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "password", "profile")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    @classmethod
    def get_token(cls, user):
        return RefreshToken.for_user(user)

    username = serializers.CharField(max_length=200)
    password = serializers.CharField(max_length=128, write_only=True)
    access_token = serializers.CharField(max_length=255, read_only=True)
    refresh_token = serializers.CharField(max_length=255, read_only=True)

    def validate(self, data):
        username = data.get("username", None)
        password = data.get("password", None)
        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError("A user with this username and password is not found.")
        try:
            refresh = self.get_token(user)

            data["refresh"] = str(refresh)
            data["access"] = str(refresh.access_token)
            update_last_login(None, user)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with given username and password does not exists")
        return {"username": user.username, "access_token": data["access"], "refresh_token": data["refresh"]}
