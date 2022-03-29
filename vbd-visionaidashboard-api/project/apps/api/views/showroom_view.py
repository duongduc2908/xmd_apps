import json
from project.apps.api.forms import AnalysisSearchForm
from project.services.age_type_service import getAgeType
from project.services.showroom_service import welcomedAgeAnalysis, welcomedAnalysis, welcomedGenderAnalysis
from project.settings.settings import NUM_OF_DECIMALS, TURN_NUM_OF_DECIMALS
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from project import error
from project.utils import api_response
from project.config import const


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_rate_being_welcomed(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    values = welcomedAnalysis(dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data)

    rateBeingWelcomed = []
    for store in stores:
        dataWelcomed = next(filter(lambda value: value["site_id"] == store["id"], values), {"total": 0, "welcomed": 0})
        rateBeingWelcomed.append(
            {
                "store": store["id"],
                "value": dataWelcomed["welcomed"],
                "total": dataWelcomed["total"],
                "rate": 0
                if dataWelcomed["total"] == 0
                else round(dataWelcomed["welcomed"] / dataWelcomed["total"] * 100, NUM_OF_DECIMALS),
                "rate_unit": "%",
            }
        )

    return api_response(rateBeingWelcomed, stores)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_rate_being_welcomed_by_gender(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    values = welcomedGenderAnalysis(
        dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data
    )

    rateBeingWelcomedByGender = []
    for store in stores:
        dataByStore = {"store": store["id"], "data": []}
        for gender in const.genders:
            dataByGender = next(
                filter(lambda value: value["site_id"] == store["id"] and value["gender"] == gender["id"], values),
                {"gender": gender["id"], "num": 0},
            )
            dataByStore["data"].append(
                {"gender": gender["name"], "gender_id": gender["id"], "value": dataByGender["num"]}
            )

        rateBeingWelcomedByGender.append(dataByStore)

    return api_response(rateBeingWelcomedByGender, stores)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_rate_being_welcomed_by_age(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    values = welcomedAgeAnalysis(
        dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data
    )

    age_types = getAgeType(const.age_colors)
    rateBeingWelcomedByAge = []
    for store in stores:
        dataByStore = {"store": store["id"], "data": []}
        for age in age_types:
            dataByAge = next(
                filter(lambda value: value["site_id"] == store["id"] and value["age_range_id"] == age["id"], values),
                {"age_range_id": age["id"], "num": 0},
            )
            dataByStore["data"].append({"age_type": age["name"], "age_range_id": age["id"], "value": dataByAge["num"]})

        rateBeingWelcomedByAge.append(dataByStore)

    return api_response(rateBeingWelcomedByAge, stores)
