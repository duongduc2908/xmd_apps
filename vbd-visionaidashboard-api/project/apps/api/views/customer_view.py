import json
import math
from pickle import TRUE
from time import time
from project.apps.api.forms import AnalysisSearchForm
from project.services.age_type_service import getAgeType
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from project.apps.api.forms import LogsCustomerSearchForm
from project import error
from project.utils import api_response, numOfDays
from project.services.customer_service import *
from project.config import const
from django.core.paginator import Paginator

# Tính lượt ghé thăm theo điều kiện tìm kiếm
# Tính tỷ lệ cùng kỳ
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_total_visits(request):
    # Form validation
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    visitTurns = totalVisitWithStores(
        dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data
    )

    # search dữ liệu cùng kỳ
    visitTurnsSamePeriod = None
    if isSamePeriod(form.data):
        visitTurnsSamePeriod = totalVisitWithStores(
            dateRange=form.data.get("date_range_same_period"), stores=stores.values("id"), conditions=form.data
        )

    result = []
    for store in stores:
        result.append(
            countAndProportionOfSamePeriod(
                samePeriod=isSamePeriod(params=form.data),
                data=visitTurns,
                dataSamePeriod=visitTurnsSamePeriod,
                store=store["id"],
            )
        )

    tooltip = const.charts["total_visits"]["tooltip"]

    if form.data.get("date_range_same_period", False):
        if form.data["search_date_value"] == 1:
            tooltip += ": Hôm qua"
        else:
            startDatePeriod = form.data["date_range_same_period"]["start_date"].strftime("%d-%m-%Y")
            endDatePeriod = form.data["date_range_same_period"]["end_date"].strftime("%d-%m-%Y")
            tooltip += f": Từ ngày {startDatePeriod} đến {endDatePeriod}"

    return api_response(data=result, stores=stores, tooltip=tooltip)


# Tính thời gian ghé thăm trung bình theo điều kiện tìm kiếm
# Tính tỷ lệ cùng kỳ
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_average_visits_time(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    visitTurns = averageVisitsTime(
        dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data
    )

    # search dữ liệu cùng kỳ
    visitTurnsSamePeriod = None
    if isSamePeriod(form.data):
        visitTurnsSamePeriod = averageVisitsTime(
            dateRange=form.data.get("date_range_same_period"), stores=stores.values("id"), conditions=form.data
        )

    result = []
    for store in stores:
        result.append(
            averageAndProportionOfSamePeriod(
                samePeriod=isSamePeriod(params=form.data),
                data=visitTurns,
                dataSamePeriod=visitTurnsSamePeriod,
                store=store["id"],
            )
        )

    tooltip = const.charts["average_visits_time"]["tooltip"]

    if form.data.get("date_range_same_period", False):
        if form.data["search_date_value"] == 1:
            tooltip += ": Hôm qua"
        else:
            startDatePeriod = form.data["date_range_same_period"]["start_date"].strftime("%d-%m-%Y")
            endDatePeriod = form.data["date_range_same_period"]["end_date"].strftime("%d-%m-%Y")
            tooltip += f": Từ ngày {startDatePeriod} đến {endDatePeriod}"

    return api_response(data=result, stores=stores, tooltip=tooltip)


# Tính số lượt khách hàng ra vào trong giờ cao điểm (ko cần cho compare)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_quests_in_peak_hour(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")

    result = []
    for store in stores:
        questsInHour = questInHour(dateRange=form.data.get("date_range"), store=store["id"], conditions=form.data)
        maxByHour = {"hour": 8, "total": 0}
        for byHour in questsInHour:
            if byHour.get("total", 0) >= maxByHour.get("total"):
                maxByHour["hour"] = byHour.get("hour")
                maxByHour["total"] = byHour.get("total")

        result.append(
            {
                "store": store["id"],
                "value": math.ceil(
                    maxByHour.get("total")
                    / (
                        numOfDays(form.data.get("date_range")["start_date"], form.data.get("date_range")["end_date"])
                        + 1
                    )
                ),
                "value_unit": "lượt",
                "peak_range": str(maxByHour.get("hour")) + "h-" + str(maxByHour.get("hour") + 1) + "h",
            }
        )

    return api_response(result, stores)


# Tính số lượt comeback theo filter (ko cần cho compare)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_come_back_quests(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    result = []
    for store in stores:
        comeBackQuests = len(
            countComeback(
                dateRange=form.data.get("date_range"),
                store=store["id"],
                conditions=form.data,
            )
        )
        result.append({"store": store["id"], "value": comeBackQuests, "value_unit": "người"})

    return api_response(result, stores)


# Thông tin situation theo giới tính (ko cần cho compare)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_situation(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    situationBy = getSituationRange(dateRange=form.data.get("date_range"))
    result = []
    for store in stores:
        dataSituation = {"store": store["id"], "categories": situationBy.get("categories", None), "data": []}

        situations = situationByGender(
            dateRange=form.data.get("date_range"), store=store["id"], conditions=form.data, situationBy=situationBy
        )
        for gender in const.genders:
            dataByGender = {"gender": gender["name"], "gender_id": gender["id"], "value": []}
            for category in situationBy.get("categories", None):
                search = next(
                    filter(
                        lambda situation: situation.gender == gender["id"] and situation.category == category,
                        situations,
                    ),
                    SituationByGender(),
                )

                dataByGender["value"].append(0 if search.num == None else search.num)

            dataSituation["data"].append(dataByGender)

        dataSituation["categories"] = categoriesTrans(dataSituation["categories"], situationBy=situationBy)
        result.append(dataSituation)

    return api_response(result, stores)


# Thông tin situation theo cửa hàng
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_situation_compare(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    situationBy = getSituationRange(dateRange=form.data.get("date_range"))
    situations = situationByStores(
        dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data, situationBy=situationBy
    )
    result = {"categories": situationBy.get("categories", None), "data": []}
    for store in stores:
        dataSituation = {"store": store["id"], "store_name": store["name"], "value": []}
        for category in situationBy.get("categories", None):
            search = next(
                filter(
                    lambda situation: situation.site_id == store["id"] and situation.category == category,
                    situations,
                ),
                SituationByStore(),
            )
            dataSituation["value"].append(0 if search.num == None else search.num)

        result["data"].append(dataSituation)

    result["categories"] = categoriesTrans(result["categories"], situationBy=situationBy)
    return api_response(result, stores)


# Rate By Gender Update logic
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_rate_by_gender(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    rateByGenderOfStores = questsByGender(
        dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data
    )

    rateByGender = []
    for store in stores:
        dataByStore = {"store": store["id"], "data": []}
        for gender in const.genders:
            rate = next(
                filter(
                    lambda rate: (rate["site_id"] == store["id"] and rate["gender"] == gender["id"]),
                    rateByGenderOfStores,
                ),
                {"site_id": store["id"], "gender": gender["id"], "num": 0},
            )
            dataByStore["data"].append(
                {
                    "gender": gender["name"],
                    "gender_id": gender["id"],
                    "value": rate.get("num", 0),
                }
            )
        rateByGender.append(dataByStore)

    return api_response(rateByGender, stores)


# Rate By Age
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_rate_by_age(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")

    rageByAgeOfStore = questsByAge(
        dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data
    )

    ageTypes = getAgeType(const.age_colors)

    rateByAge = []
    for store in stores:
        dataByStore = {"store": store["id"], "data": []}
        for ageType in ageTypes:
            rate = next(
                filter(
                    lambda rate: (rate["site_id"] == store["id"] and rate["age_range_id"] == ageType["id"]),
                    rageByAgeOfStore,
                ),
                {"site_id": store["id"], "age_range_id": ageType["id"], "num": 0},
            )
            dataByStore["data"].append(
                {
                    "age_type": ageType["name"],
                    "age_range_id": ageType["id"],
                    "value": rate.get("num", 0),
                }
            )
        rateByAge.append(dataByStore)

    return api_response(rateByAge, stores)


# Average By Gender Update logic
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_average_by_gender(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    visitTurns = averageVisitsTimeByGender(
        dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data
    )

    averageByGender = []
    for store in stores:
        dataByStore = {"store": store["id"], "data": []}
        for gender in const.genders:
            average = next(
                filter(
                    lambda average: (average["site_id"] == store["id"] and average["gender"] == gender["id"]),
                    visitTurns,
                ),
                {"site_id": store["id"], "gender": gender["id"], "average": 0},
            )
            dataByStore["data"].append(
                {
                    "gender": gender["name"],
                    "gender_id": gender["id"],
                    "value": average.get("average", 0),
                }
            )
        averageByGender.append(dataByStore)

    return api_response(averageByGender, stores)


# Nearest Average By Times Update logic
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_nearest_average_by_times(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    averageOfStores = averageCustomerBack(
        dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data
    )

    nearestAverageByTimes = []
    for store in stores:
        averageByTime = {"store": store["id"], "value": 0, "value_unit": "ngày"}
        for average in averageOfStores:
            if store["id"] == average.site_id:
                averageByTime["value"] = round(average.average, TURN_NUM_OF_DECIMALS)
        nearestAverageByTimes.append(averageByTime)

    tooltip = const.charts["nearest_average_by_times"]["tooltip"]
    return api_response(data=nearestAverageByTimes, stores=stores, tooltip=tooltip)


# Average By Time Period Back Update logic
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_average_by_time_period_back(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    averages = averageTimePeriodBack(
        dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data
    )

    averageByTimePeriodBack = []
    for store in stores:
        averageByTime = {"store": store["id"], "value": 0, "value_unit": "ngày"}
        for average in averages:
            if store["id"] == average.site_id:
                averageByTime["value"] = round(average.average, TURN_NUM_OF_DECIMALS)
        averageByTimePeriodBack.append(averageByTime)

    tooltip = const.charts["average_by_time_period_back"]["tooltip"]

    return api_response(data=averageByTimePeriodBack, stores=stores, tooltip=tooltip)


# Average By Turns Back Update logic
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_average_by_turns(request):
    # Check form
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = AnalysisSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)

    # Filter values
    stores = form.data.get("stores")
    averages = averageTurns(dateRange=form.data.get("date_range"), stores=stores.values("id"), conditions=form.data)

    averageByTurns = []
    for store in stores:
        averageByTurn = {"store": store["id"], "value": 0, "value_unit": "lần"}
        for average in averages:
            if store["id"] == average.site_id:
                averageByTurn["value"] = round(average.average, TURN_NUM_OF_DECIMALS)
        averageByTurns.append(averageByTurn)

    tooltip = const.charts["average_by_turns"]["tooltip"]

    return api_response(data=averageByTurns, stores=stores, tooltip=tooltip)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_logs(request):
    data = {}
    if request.body.decode("utf-8") != "":
        data = json.loads(request.body.decode("utf-8"))
    form = LogsCustomerSearchForm(data, request=request)
    if form.is_valid() == False:
        return api_response(data=[], status=error.STATUS_ERROR)

    page = form.data.get("page", 1)
    perpage = form.data.get("per_page", 10)
    typesearch = form.data.get("type_search", 'all')
    logsCustomer = searchLogsCustomer(
        dateRange=form.data.get("date_range"), store=form.data.get("store"), conditions=form.data, typesearch=typesearch
    )
    paginatorLogsCustomer = Paginator(logsCustomer, perpage)

    logsCustomers = paginatorLogsCustomer.page(page)

    data = []
    index = (int(page) - 1) * int(perpage) + 1
    for logsCustomer in logsCustomers:
        data.append(
            {
                "id": index,
                "image_in": logsCustomer['frame_thumb_in'],
                "image_show_in": logsCustomer['frame_full_in'],
                "image_out": logsCustomer['frame_thumb_out'],
                "image_show_out": logsCustomer['frame_full_out'],
                "in_time": logsCustomer['in_time'],
                "out_time": logsCustomer['out_time'],
                "gender": next(
                    filter(lambda gender: gender["id"] == logsCustomer['gender'], const.genders), {"name": None}
                )["name"],
                "age": next(
                    filter(
                        lambda age_type: age_type["id"] == logsCustomer['age_range_id'], getAgeType(const.age_colors)
                    ),
                    {"name": None},
                )["name"]
            }
        )
        index += 1

    return api_response(
        data={
            "count": paginatorLogsCustomer.count,
            "num_pages": paginatorLogsCustomer.num_pages,
            "page": page,
            "result": data,
        }
    )