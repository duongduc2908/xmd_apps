from project.services.customer_service import baseSearchVisitTurn
from django.db.models import F, Count, Sum, Max, Min, Case, When
from django.db.models.functions import ExtractHour, TruncDate, ExtractWeek


def welcomedAnalysis(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)

    return list(query.values("site_id").annotate(total=Count("*")).annotate(welcomed=Sum("be_welcomed")))


def welcomedGenderAnalysis(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)
    query = query.filter(be_welcomed=1)
    return list(query.values("site_id", "gender").annotate(num=Count("*")))


def welcomedAgeAnalysis(dateRange=dict, stores=list, conditions=dict):
    query = baseSearchVisitTurn(dateRange=dateRange, stores=stores, conditions=conditions)
    query = query.filter(be_welcomed=1)
    print(query.values("site_id", "age_range_id").annotate(num=Count("*")).query)
    return list(query.values("site_id", "age_range_id").annotate(num=Count("*")))
