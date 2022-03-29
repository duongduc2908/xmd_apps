from calendar import week
from dataclasses import fields
import datetime
from multiprocessing.sharedctypes import Value
import numbers
import pprint
from tokenize import String
from django.forms import DateField, DurationField, IntegerField
import pandas as pd
from tkinter.messagebox import NO
from tracemalloc import stop
from iteration_utilities import duplicates
from project.apps.api.models import (
    AverageTimePeriodBack,
    AverageTurn,
    AverageVisitTimes,
    HumanEvents,
    SituationByGender,
    SituationByStore,
    VisitTurn,
)
from project.settings.settings import NUM_OF_DECIMALS, TURN_NUM_OF_DECIMALS
from django.db.models import F, Count, Sum, Max, Min, Case, When, Avg
from django.db.models.functions import ExtractHour, TruncDate, ExtractWeek


def isNotCompareMode(params=None):
    if params.get("search_by", None) != "showroom_type":
        return True

    return False


# Chỉ lấy dữ liệu cùng kỳ với:
#   Thời gian: hôm nay, 7 ngày gần đây, 30 ngày gần đây
#   Chart hiển thị trên màn hình tổng quan (không so sánh)
def isSamePeriod(params=None):
    if params.get("search_date_by", None) == "bydate" and isNotCompareMode(params=params):
        return True

    return False


def replaceQueryString(query=str, dateRange=dict, conditions=dict):
    startDate = dateRange.get("start_date").strftime("%Y-%m-%d %H:%M:%S")
    endDate = dateRange.get("end_date").strftime("%Y-%m-%d %H:%M:%S")

    queryResult = query.replace(startDate, '"' + startDate + '"').replace(endDate, '"' + endDate + '"')

    if not isNotCompareMode(params=conditions):
        showroomType = conditions.get("search_value")
        queryResult = queryResult.replace(showroomType, '"' + showroomType + '"')

    if isSamePeriod(params=conditions):
        startDateSamePeriod = conditions.get("date_range_same_period")["start_date"].strftime("%Y-%m-%d %H:%M:%S")
        endDateSamePeriod = conditions.get("date_range_same_period")["end_date"].strftime("%Y-%m-%d %H:%M:%S")

        queryResult = queryResult.replace(startDateSamePeriod, '"' + startDateSamePeriod + '"').replace(
            endDateSamePeriod, '"' + endDateSamePeriod + '"'
        )

    return queryResult


def getSituationRange(dateRange=dict):
    delta = dateRange.get("end_date").date() - dateRange.get("start_date").date() + datetime.timedelta(days=1)
    if delta == datetime.timedelta(days=1):
        # range by time
        result = {
            "situationBy": "time",
            "categories": list(range(8, 23)),
        }

    else:
        # range by date
        result = {
            "situationBy": "date",
            "categories": pd.date_range(start=dateRange.get("start_date"), end=dateRange.get("end_date"), freq="D"),
        }
    return result


def categoriesTrans(categories=list, situationBy=dict):
    result = []
    if situationBy.get("situationBy") == "time":
        for category in categories:
            result.append(str(category) + "h")
        return result
    elif situationBy.get("situationBy"):
        for category in categories:
            result.append(category)
        return result
    return categories


# ----- Queries zone ----- #
def baseSearchVisitTurn(dateRange=dict, stores=list, conditions=dict):
    query = VisitTurn.objects.filter(site_id__in=stores)

    if conditions.get("gender", None):
        genders = conditions.get("gender", None)
        if None in genders:
            query = query.filter(gender__in=genders) | query.filter(gender__isnull=True)
        else:
            query = query.filter(gender__in=genders)

    if conditions.get("age_range"):
        query = query.filter(age_range__in=conditions.get("age_range", None))

    startDate = dateRange.get("start_date")
    endDate = dateRange.get("end_date")
    query = (
        query.filter(in_time__gte=startDate, in_time__lte=endDate)
        # | query.filter(out_time__gte=startDate, out_time__lte=endDate)
        # | query.filter(in_time__lte=startDate, out_time__gte=endDate)
    )

    return query


def totalVisitOfStores(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)
    return query.count()


def totalVisitWithStores(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)
    return list(query.values("site_id").annotate(total=Count("*")))


def averageVisitsTimeOfStores(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)

    query = query.filter(out_time__isnull=False).filter(total_time__isnull=False)

    return list(query.aggregate(Avg("total_time")).values())[0]


def averageVisitsTime(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)

    query = query.filter(out_time__isnull=False).filter(total_time__isnull=False)

    return list(query.values("site_id").annotate(average=Sum("total_time") / Count("*")))


def questInHour(dateRange=dict, store=numbers, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=[store], conditions=conditions)
    return list(query.annotate(hour=ExtractHour("in_time")).values("hour").annotate(total=Count("*")))


def countComeback(dateRange=dict, store=numbers, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=[store], conditions=conditions)
    query = query.exclude(dossier_id__isnull=True)
    dossiers = query.values("dossier_id").values_list("dossier_id")

    queryInPrevious = (
        VisitTurn.objects.filter(site_id=store)
        .filter(dossier_id__in=dossiers)
        .filter(in_time__lt=dateRange.get("end_date"))
    )
    return list(queryInPrevious.values("dossier_id").annotate(num=Count("*")).filter(num__gt=1))


# situation
def situationByGender(dateRange=dict, store=list, conditions=dict, situationBy=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=[store], conditions=conditions)
    if situationBy.get("situationBy") == "time":
        query = query.values("site_id", "gender").annotate(category=ExtractHour("in_time")).annotate(num=Count("*"))
        query = replaceQueryString(query=str(query.query), dateRange=dateRange, conditions=conditions)
        return SituationByGender.objects.raw(f"SELECT site_id, gender, 0 group_type, category, num from ({query}) a")

    if situationBy.get("situationBy") == "date":
        query = query.values("site_id", "gender").annotate(category=TruncDate("in_time")).annotate(num=Count("*"))
        query = replaceQueryString(query=str(query.query), dateRange=dateRange, conditions=conditions)
        return SituationByGender.objects.raw(f"SELECT site_id, gender, 0 group_type, category, num from ({query}) a")

    if situationBy.get("situationBy") == "dates2":
        rangeValue = 2
    elif situationBy.get("situationBy") == "dates3":
        rangeValue = 3

    query = replaceQueryString(query=str(query.query), dateRange=dateRange, conditions=conditions)
    cases = "CASE "
    for i in list(range(1, rangeValue)):
        cases += f'WHEN ABS(ROUND(DATEDIFF("{dateRange.get("start_date").date()}", a.in_time),{rangeValue})) MOD {rangeValue} = {i} THEN ABS(ROUND(DATEDIFF("{dateRange.get("start_date").date()}", a.in_time),{rangeValue})) - {i} '
    cases += f' ELSE ABS(ROUND(DATEDIFF("{dateRange.get("start_date").date()}", a.in_time), {rangeValue}))'
    cases += " END"

    return SituationByGender.objects.raw(
        f"SELECT site_id, gender, {cases} group_type, Date(Min(a.in_time)) category, Count(*) num from ({query}) a group by site_id, gender, group_type"
    )


def situationByStores(dateRange=dict, stores=list, conditions=dict, situationBy=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)
    if situationBy.get("situationBy") == "time":
        query = query.values("site_id").annotate(category=ExtractHour("in_time")).annotate(num=Count("*"))
        query = replaceQueryString(query=str(query.query), dateRange=dateRange, conditions=conditions)
        return SituationByStore.objects.raw(f"SELECT site_id, 0 group_type, category, num from ({query}) a")

    if situationBy.get("situationBy") == "date":
        query = query.values("site_id").annotate(category=TruncDate("in_time")).annotate(num=Count("*"))
        query = replaceQueryString(query=str(query.query), dateRange=dateRange, conditions=conditions)
        return SituationByStore.objects.raw(f"SELECT site_id, 0 group_type, category, num from ({query}) a")

    if situationBy.get("situationBy") == "dates2":
        rangeValue = 2
    elif situationBy.get("situationBy") == "dates3":
        rangeValue = 3

    query = replaceQueryString(query=str(query.query), dateRange=dateRange, conditions=conditions)
    cases = "CASE "
    for i in list(range(1, rangeValue)):
        cases += f'WHEN ABS(ROUND(DATEDIFF("{dateRange.get("start_date").date()}", a.in_time),{rangeValue})) MOD {rangeValue} = {i} THEN ABS(ROUND(DATEDIFF("{dateRange.get("start_date").date()}", a.in_time),{rangeValue})) - {i} '
    cases += f' ELSE ABS(ROUND(DATEDIFF("{dateRange.get("start_date").date()}", a.in_time), {rangeValue}))'
    cases += " END"

    return SituationByStore.objects.raw(
        f"SELECT site_id, {cases} group_type, Date(Min(a.in_time)) category, Count(*) num from ({query}) a group by site_id, gender, group_type"
    )


def questsByGender(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)
    return list(query.values("site_id", "gender").annotate(num=Count("*")))


def questsByAge(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)
    return list(query.values("site_id", "age_range_id").annotate(num=Count("*")))


def averageVisitsTimeByGender(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)

    query = query.filter(out_time__isnull=False).filter(total_time__isnull=False)

    return list(query.values("site_id", "gender").annotate(average=Sum("total_time") / Count("*")))


def averageCustomerBack(dateRange=dict, stores=list, conditions=dict):
    startDate = dateRange.get("end_date").strftime("%Y-%m-%d")
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)

    query = query.filter(out_time__isnull=False).filter(total_time__isnull=False)
    query = query.exclude(dossier_id__isnull=True)
    query = query.values("site_id", "dossier_id").annotate(max_in_time=Max("in_time")).annotate(num=Count("*"))

    query = replaceQueryString(query=str(query.query), dateRange=dateRange, conditions=conditions)

    return AverageVisitTimes.objects.raw(
        f'SELECT site_id, sum(DATEDIFF("{startDate}", a.max_in_time))/count(*) as average from ({query}) AS a where a.num > 1 group by site_id'
    )


def averageTimePeriodBack(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)
    query = query.exclude(dossier_id__isnull=True)
    query = query.filter(out_time__isnull=False).filter(total_time__isnull=False)
    query = query.values("site_id", "dossier_id")
    query = query.annotate(num=Count("*"))
    query = query.annotate(max_in_time=Max("in_time"))
    query = query.annotate(min_in_time=Min("in_time"))

    query = replaceQueryString(query=str(query.query), dateRange=dateRange, conditions=conditions)
    return AverageTimePeriodBack.objects.raw(
        f"SELECT site_id, sum(DATEDIFF(a.max_in_time, a.min_in_time)/a.num)/count(*) as average from ({query}) a where a.num > 1 group by site_id"
    )


def averageTurns(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)

    query = (
        query.values("site_id", "dossier_id")
        .annotate(num=Count("*"))
        .annotate(
            person=Case(
                When(dossier_id__isnull=True, then=Count("*")),
                When(dossier_id__isnull=False, then=1),
                output_field=IntegerField(),
            )
        )
    )

    query = replaceQueryString(query=str(query.query), dateRange=dateRange, conditions=conditions)

    return AverageTurn.objects.raw(
        f"SELECT site_id, Sum(a.num)/Sum(a.person) as average from ({query}) a group by site_id"
    )


# Search visit turns with conditions
#   - Merged data 2 visits < 45'
def searchVisitTurns(dateRange=dict, stores=list, conditions=dict):
    visitTurns = VisitTurn.objects.filter(site_id__in=stores)

    if conditions.get("gender", None):
        visitTurns = visitTurns.filter(gender__in=conditions.get("gender", None))

    if conditions.get("age_range"):
        visitTurns = visitTurns.filter(age_range__in=conditions.get("age_range", None))

    startDate = dateRange.get("start_date", None)
    endDate = dateRange.get("end_date", None)
    visitTurns = (
        visitTurns.filter(in_time__gte=startDate, in_time__lte=endDate)
        | visitTurns.filter(out_time__gte=startDate, out_time__lte=endDate)
        | visitTurns.filter(in_time__lte=startDate, out_time__gte=endDate)
    )
    return list(visitTurns.values())


# ----- End of Queries ----- #


# ----- Start of calculator ----- #
def countAndProportionOfSamePeriod(samePeriod=False, data=list, dataSamePeriod=list, store=None):
    countStore = next(filter(lambda x: x["site_id"] == store, data), {"site_id": store, "total": 0})
    result = {"store": store, "value": countStore.get("total", 0), "value_unit": "lượt"}
    if samePeriod:
        countStoreSamePeriod = next(
            filter(lambda x: x["site_id"] == store, dataSamePeriod), {"site_id": store, "total": 0}
        )
        # abs(kỳ này - kỳ trước)/kỳ trước * 100 | 0 nếu kỳ trước = 0
        result["change_value"] = (
            round(
                abs(countStore.get("total", 0) - countStoreSamePeriod.get("total", 0))
                / countStoreSamePeriod.get("total", 0)
                * 100,
                NUM_OF_DECIMALS,
            )
            if countStoreSamePeriod.get("total", 0)
            else 0
        )
        result["change_value_unit"] = "%"
        result["change_type"] = (
            "positive" if countStore.get("total", 0) >= countStoreSamePeriod.get("total", 0) else "negative"
        )

    return result


def averageAndProportionOfSamePeriod(samePeriod=False, data=list, dataSamePeriod=list, store=None):
    averageStore = next(filter(lambda x: x["site_id"] == store, data), {"site_id": store, "average": 0})
    result = {"store": store, "value": round(averageStore.get("average", 0), NUM_OF_DECIMALS), "value_unit": "phút"}

    if samePeriod:
        averageStoreSamePeriod = next(
            filter(lambda x: x["site_id"] == store, dataSamePeriod), {"site_id": store, "average": 0}
        )

        result["change_value"] = (
            round(
                abs(averageStore.get("average", 0) - averageStoreSamePeriod.get("average", 0))
                / averageStoreSamePeriod.get("average", 0)
                * 100,
                NUM_OF_DECIMALS,
            )
            if averageStoreSamePeriod.get("average", 0)
            else 0
        )
        result["change_value_unit"] = "%"
        result["change_type"] = (
            "positive" if averageStore.get("average", 0) >= averageStoreSamePeriod.get("average", 0) else "negative"
        )

    return result


def maxQuestInTimeRange(data=list, dateRange=dict, store=None):
    range = (
        pd.date_range(start=dateRange.get("start_date", None), end=dateRange.get("end_date", None), freq="H")
        .to_pydatetime()
        .tolist()
    )
    result = {"store": store, "value": 0, "value_unit": "lượt", "peak_range": ""}

    data = list(filter(lambda x: x["site_id"] == store, data))

    for dateTime in range:
        startTime = dateTime
        endTime = dateTime + datetime.timedelta(hours=1)
        times = len(
            [
                item
                for item in data
                if (
                    item["in_time"].replace(tzinfo=None) >= startTime
                    and item["in_time"].replace(tzinfo=None) <= endTime
                )
                or (
                    item["out_time"].replace(tzinfo=None) >= startTime
                    and item["out_time"].replace(tzinfo=None) <= endTime
                )
                or (
                    item["in_time"].replace(tzinfo=None) <= startTime
                    and item["out_time"].replace(tzinfo=None) >= endTime
                )
            ]
        )
        if times >= result["value"]:
            result["value"] = times
            result["peak_range"] = startTime.strftime("%H") + "h-" + endTime.strftime("%H") + "h"

    return result


def countComeBackQuest(data=list, store=None):
    dataByStore = list(filter(lambda x: x["site_id"] == store, data))

    dataValueDossier = list(filter(lambda x: x["dossier_id"] != None, dataByStore))

    return {
        "store": store,
        "value": len(list(duplicates([d["dossier_id"] for d in dataValueDossier if "dossier_id" in d]))),
        "value_unit": "người",
    }


def searchLogsCustomer(dateRange=dict, store=int, conditions=dict, typesearch='all'):
    query = baseSearchVisitTurn(dateRange,store,conditions)
    print(len(list(query)))
    query = query.select_related('event_in').filter(site_id__in=store).order_by('in_time')
    
    if typesearch == 'matching':
        query = query.filter(out_time__isnull=False)
    logs_customer=[]
    for visit_in in query:
        event_out = HumanEvents.objects.filter(id=visit_in.event_out_id).first()
        i = {
            'frame_full_in':"http://10.124.64.120:9000/vinmart/"+visit_in.event_in.frame_full,
            'frame_thumb_in':"http://10.124.64.120:9000/vinmart/"+visit_in.event_in.frame_thumb,
            'frame_full_out': "http://10.124.64.120:9000/vinmart/"+ event_out.frame_full if event_out else 'assets/images/logo/vision-ai-user.svg',
            'frame_thumb_out': "http://10.124.64.120:9000/vinmart/"+ event_out.frame_thumb if event_out else 'assets/images/logo/vision-ai-user.svg',
            'in_time': visit_in.in_time,
            'out_time': visit_in.out_time,
            'gender': visit_in.gender,
            'age_range_id': visit_in.age_range_id
        }
        logs_customer.append(i)
    
    return logs_customer

# ----- End of calculator ----- #
