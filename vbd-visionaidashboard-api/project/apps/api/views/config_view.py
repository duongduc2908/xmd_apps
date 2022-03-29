from project.apps.api.models import Site
from rest_framework import status
from project.config import const
from project.utils import api_response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from project.services.age_type_service import *


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_config(request):
    showroom_types = []
    stores = []
    if bool(request.user and request.user.is_staff):
        for store in Site.objects.raw(
            f'SELECT id, CONCAT(UPPER(type), " ", name) name, type FROM site ORDER BY CONCAT(UPPER(type), " ", name)'
        ):
            showroom_types.append(store.type)
            stores.append({"id": store.id, "name": store.name, "type": store.type})

    age_types = getAgeType(const.age_colors)

    config = {
        "stores": stores,
        "showroom_types": list(set(showroom_types)),
        "genders": const.genders,
        "age_types": age_types,
        "color_compares": const.store_compare_colors,
        "charts": const.charts,
    }

    return api_response(config, http_status=status.HTTP_200_OK)
