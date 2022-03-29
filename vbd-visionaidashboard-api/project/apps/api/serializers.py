from pprint import pprint
from project.apps.api.models import Site
from rest_framework import serializers

class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ("id", "name", "type")