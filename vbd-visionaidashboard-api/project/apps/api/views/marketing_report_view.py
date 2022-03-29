from datetime import date, datetime, timedelta
import json
from ntpath import join
from project.apps.api.forms import MarketingReportForm
from project.apps.api.models import MarketingReport, Site, SiteReport
from project.services.customer_service import (
    averageVisitsTime,
    averageVisitsTimeOfStores,
    categoriesTrans,
    countAndProportionOfSamePeriod,
    getSituationRange,
    situationByStores,
    totalVisitOfStores,
    totalVisitWithStores,
)
from project.services.report_service import orderByCategory, visitsByCategory
from project.settings.settings import NUM_OF_DECIMALS
from project.utils import api_response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
import pandas as pd
from project import error
import os
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator


@api_view(["POST"])
@permission_classes([IsAdminUser])
def get_reports(request):
    data = json.loads(request.body.decode("utf-8"))
    page = data.get("page", 1)
    perpage = data.get("per_page", 10)

    paginatorReports = Paginator(MarketingReport.objects.order_by("-created_time"), perpage)

    reports = paginatorReports.page(page)

    result = []
    index = (int(page) - 1) * int(perpage) + 1
    for report in reports:
        sites = report.sites.all().values_list("name", flat=True)
        showroom = ", ".join(sites)
        start_date = report.start_time.strftime("%d-%m-%Y")
        end_date = report.end_time.strftime("%d-%m-%Y")
        result.append(
            {
                "index": index,
                "id": report.id,
                "name": report.name,
                "campains": report.campains,
                "showroom": showroom,
                "time_range": f"Từ {start_date} đến {end_date}",
                "time": report.created_time.strftime("%d-%m-%Y"),
            }
        )
        index += 1
    return api_response(
        data={
            "count": paginatorReports.count,
            "num_pages": paginatorReports.num_pages,
            "page": page,
            "result": result,
        }
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def get_report_detail(request, reportId):
    report = MarketingReport.objects.filter(id=reportId).values()
    return api_response(report)


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def delete_report_detail(request, reportId):
    SiteReport.objects.filter(report_id=reportId).delete()
    MarketingReport.objects.filter(id=reportId).delete()
    return api_response({})


@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_report(request):
    # Check form
    form = MarketingReportForm(request.POST)
    if form.is_valid() == False:
        return api_response(data=form.errors, status=error.STATUS_ERROR)
    elif not request.FILES.get("data_file", False):
        return api_response(data={"data_file": ["This field is required."]}, status=error.STATUS_ERROR)
    else:
        pathName = request.FILES.get("data_file")
        ext = os.path.splitext(pathName.name)[1]
        valid_extensions = [".xlsx", ".xls"]
        if not ext.lower() in valid_extensions:
            return api_response(data={"data_file": ["Not is Excel file"]}, status=error.STATUS_ERROR)

    stores = Site.objects.filter(id__in=json.loads(request.POST.get("stores", "[]")))
    site_codes = set(store.code for store in stores)
    if not len(stores):
        return api_response(data={"stores": ["Không tìm thấy thông tin Store nào"]}, status=error.STATUS_ERROR)

    # Load the xlsx file
    dataFile = pd.ExcelFile(request.FILES["data_file"])

    # Check columns header
    columns = dataFile.parse(dataFile.sheet_names[0]).columns
    for col in ["BU", "State", "Transaction Date"]:
        if col not in columns:
            return api_response(data={"data_file": ["Thiếu cột " + col]}, status=error.STATUS_ERROR)

    orders = pd.DataFrame(dataFile.parse(dataFile.sheet_names[0]), columns=["BU", "State", "Transaction Date"])

    # Filter by State
    orders = orders.loc[~orders["State"].isin(["Canceled", "Cancel Invoice Processing", "Review Rejected"])]

    # Filter by Store
    orders = orders.loc[orders["BU"].isin(site_codes)]

    # Filter by Date
    startDate = datetime.strptime(form.data.get("start_date") + " 00:00:00", "%m/%d/%Y %H:%M:%S")
    endDate = datetime.strptime(form.data.get("end_date") + " 23:59:59", "%m/%d/%Y  %H:%M:%S")

    delta = (endDate - startDate).days + 1
    startDateSamePeriod = startDate - timedelta(days=delta)
    endDateSamePeriod = endDate - timedelta(days=delta)
    ordersSamePeriod = orders.loc[orders["Transaction Date"] >= startDateSamePeriod.strftime("%Y-%m-%d %H:%M:%S")]
    ordersSamePeriod = ordersSamePeriod.loc[
        ordersSamePeriod["Transaction Date"] <= endDateSamePeriod.strftime("%Y-%m-%d %H:%M:%S")
    ]

    orders = orders.loc[orders["Transaction Date"] >= startDate.strftime("%Y-%m-%d %H:%M:%S")]
    orders = orders.loc[orders["Transaction Date"] <= endDate.strftime("%Y-%m-%d %H:%M:%S")]

    # same period
    same_period = f'({startDateSamePeriod.strftime("%d-%m-%Y")} đến {endDateSamePeriod.strftime("%d-%m-%Y")})'

    # marketing toal cost
    marketing_total_cost = []
    for campain in json.loads(form.data.get("campains")):
        marketing_total_cost.append(
            {
                "campain": campain.get("name", False),
                "value": int(campain.get("fee", "0").replace(",", "")),
                "value_unit": "VNĐ",
            }
        )

    # Total visits
    totalVisits = totalVisitOfStores(
        dateRange={"start_date": startDate, "end_date": endDate}, stores=stores.values("id"), conditions={}
    )
    totalVisitsSamePeriod = totalVisitOfStores(
        dateRange={"start_date": startDateSamePeriod, "end_date": endDateSamePeriod},
        stores=stores.values("id"),
        conditions={},
    )
    visitChange = round(
        0 if totalVisitsSamePeriod == 0 else abs(totalVisits - totalVisitsSamePeriod) / totalVisitsSamePeriod * 100,
        NUM_OF_DECIMALS,
    )
    visitChangeType = 1 if totalVisits >= totalVisitsSamePeriod else 0

    # Average Visit Time
    averageVisitsTime = averageVisitsTimeOfStores(
        dateRange={"start_date": startDate, "end_date": endDate},
        stores=stores.values("id"),
        conditions={},
    )
    if not averageVisitsTime:
        averageVisitsTime = 0
    averageVisitsTimeSamePeriod = averageVisitsTimeOfStores(
        dateRange={"start_date": startDateSamePeriod, "end_date": endDateSamePeriod},
        stores=stores.values("id"),
        conditions={},
    )
    if not averageVisitsTimeSamePeriod:
        averageVisitsTimeSamePeriod = 0
    averageChange = round(
        0
        if averageVisitsTimeSamePeriod == 0
        else abs(averageVisitsTime - averageVisitsTimeSamePeriod) / averageVisitsTimeSamePeriod * 100,
        NUM_OF_DECIMALS,
    )
    averageChangeType = 1 if averageVisitsTime >= averageVisitsTimeSamePeriod else 0

    # Total Order
    totalOrders = orders.shape[0]
    totalOrdersSamePeriod = ordersSamePeriod.shape[0]
    ordersChange = round(
        0 if totalOrdersSamePeriod == 0 else abs(totalOrders - totalOrdersSamePeriod) / totalOrdersSamePeriod * 100,
        NUM_OF_DECIMALS,
    )
    ordersChangeType = 1 if totalOrders >= totalOrdersSamePeriod else 0

    # Order Conversation
    orderConversation = 0 if totalVisits == 0 else round(totalOrders / totalVisits * 100, NUM_OF_DECIMALS)
    orderConversationSamePeriod = (
        0 if totalVisitsSamePeriod == 0 else round(totalOrdersSamePeriod / totalVisitsSamePeriod * 100, NUM_OF_DECIMALS)
    )
    conversationChange = round(
        0
        if orderConversationSamePeriod == 0
        else abs(orderConversation - orderConversationSamePeriod) / orderConversationSamePeriod * 100,
        NUM_OF_DECIMALS,
    )
    conversationChangeType = 1 if orderConversation >= orderConversationSamePeriod else 0

    # Orders
    ordersByStore = []
    visits = []
    conversionRates = []
    situations = []
    visitTurns = totalVisitWithStores(
        dateRange={"start_date": startDate, "end_date": endDate}, stores=stores.values("id"), conditions=form.data
    )
    situationBy = getSituationRange(dateRange={"start_date": startDate, "end_date": endDate})
    situationaByStores = situationByStores(
        dateRange={"start_date": startDate, "end_date": endDate},
        stores=stores.values("id"),
        conditions={},
        situationBy=situationBy,
    )

    for store in stores:
        orderByStore = orders.loc[orders["BU"] == store.code].shape[0]
        visitByStore = next(filter(lambda x: x["site_id"] == store.id, visitTurns), {"site_id": store, "total": 0})[
            "total"
        ]
        conversionRateByStore = 0 if visitByStore == 0 else round(orderByStore / visitByStore * 100, NUM_OF_DECIMALS)

        ordersByStore.append({"store": store.id, "value": orderByStore, "value_unit": "lượt"})
        visits.append({"store": store.id, "value": visitByStore, "value_unit": "đơn"})
        conversionRates.append({"store": store.id, "value": conversionRateByStore, "value_unit": "%"})
        situations.append(
            {
                "store": store.id,
                "categories": categoriesTrans(situationBy.get("categories", None), situationBy=situationBy),
                "data": [
                    {
                        "type": "Đơn hàng",
                        "value": orderByCategory(
                            store=store,
                            orders=orders,
                            categories=situationBy.get("categories", None),
                            dateRange={"start_date": startDate, "end_date": endDate},
                        ),
                    },
                    {
                        "type": "Footfall",
                        "value": visitsByCategory(
                            store=store, visits=situationaByStores, categories=situationBy.get("categories", None)
                        ),
                    },
                ],
            }
        )
    result = {
        "overview": {
            "same_period": same_period,
            "marketing_total_cost": marketing_total_cost,
            "total_visits": {
                "value": totalVisits,
                "value_unit": "",
                "value_change": visitChange,
                "value_change_type": "positive" if visitChangeType == 1 else "negative",
                "value_change_unit": "%",
                "text": ("Tăng" if visitChangeType == 1 else "Giảm") + f" {visitChange}% so với kỳ trước",
            },
            "average_visit_time": {
                "value": round(averageVisitsTime, NUM_OF_DECIMALS),
                "value_unit": "phút",
                "value_change": averageChange,
                "value_change_type": "positive" if averageChangeType == 1 else "negative",
                "value_change_unit": "%",
                "text": ("Tăng" if averageChangeType == 1 else "Giảm") + f" {averageChange}% so với kỳ trước",
            },
            "total_order": {
                "value": totalOrders,
                "value_unit": "",
                "value_change": ordersChange,
                "value_change_type": "positive" if ordersChangeType == 1 else "negative",
                "value_change_unit": "%",
                "text": ("Tăng" if ordersChangeType == 1 else "Giảm") + f" {ordersChange}% so với kỳ trước",
            },
            "order_conversion_rate": {
                "value": orderConversation,
                "value_unit": "%",
                "value_change": conversationChange,
                "value_change_type": "positive" if conversationChangeType == 1 else "negative",
                "value_change_unit": "%",
                "text": ("Tăng" if conversationChangeType == 1 else "Giảm") + f" {conversationChange}% so với kỳ trước",
            },
        },
        "detail_by_store": {
            "order_conversion_rate": conversionRates,
            "orders": ordersByStore,
            "visits": visits,
            "situations": situations,
        },
    }

    if not request.POST.get("unsave", False):
        report = MarketingReport()
        report.name = form.data.get("name")
        report.campains = form.data.get("campains")
        report.start_time = startDate
        report.end_time = endDate
        report.result = result
        report.created_time = datetime.now()
        report.save()

        for store in stores:
            report.sites.add(store)

    data = {
        "name": form.data.get("name"),
        "stores": form.data.get("stores"),
        "campains": form.data.get("campains"),
        "start_time": startDate.strftime("%Y-%m-%d"),
        "end_time": endDate.strftime("%Y-%m-%d"),
        "result": result,
    }
    return api_response(data=data)
