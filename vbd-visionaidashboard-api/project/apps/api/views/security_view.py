import json
from project import error
from project.apps.api.forms import SecuritySearchForm
from project.apps.api.models import RestrictedEvent
from project.utils import api_response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from project.services.security_service import *
from project.config import const
from project.services.age_type_service import *
from django.core.paginator import Paginator


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_security(request):
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = SecuritySearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=[], status=error.STATUS_ERROR)

    page = form.data.get("page", 1)
    perpage = form.data.get("per_page", 10)

    restrictedEvents = searchSecurity(
        dateRange=form.data.get("date_range"), store=form.data.get("store"), conditions=form.data
    )
    paginatorRestrictedEvents = Paginator(restrictedEvents, perpage)

    restrictedEvents = paginatorRestrictedEvents.page(page)

    data = []
    index = (int(page) - 1) * int(perpage) + 1
    for restrictedEvent in restrictedEvents:
        data.append(
            {
                "id": index,
                "image": restrictedEvent.thumb_img,
                "time": restrictedEvent.created_time,
                "location": restrictedEvent.camera_group.name,
                "gender": next(
                    filter(lambda gender: gender["id"] == restrictedEvent.gender, const.genders), {"name": None}
                )["name"],
                "age": next(
                    filter(
                        lambda age_type: age_type["id"] == restrictedEvent.age_range_id, getAgeType(const.age_colors)
                    ),
                    {"name": None},
                )["name"],
                "link": restrictedEvent.media_source,
            }
        )
        index += 1

    return api_response(
        data={
            "count": paginatorRestrictedEvents.count,
            "num_pages": paginatorRestrictedEvents.num_pages,
            "page": page,
            "result": data,
        }
    )
