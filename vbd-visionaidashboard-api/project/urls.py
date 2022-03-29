"""project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from unicodedata import name
from django.contrib import admin
from django.urls import include, path

from project.apps.api.views import customer_view, showroom_view, config_view, security_view, marketing_report_view

# router = routers.DefaultRouter(trailing_slash=False)
# router.register("visit-detail", customers_view.ChartDetailViewSet)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("project.apps.authentication.urls")),
    path("api/config", config_view.get_config, name="config"),
    path("api/customer/total-visits", customer_view.get_total_visits, name="customer-total-visits-chart"),
    path(
        "api/customer/average-visits-time",
        customer_view.get_average_visits_time,
        name="customer-average-visits-time-chart",
    ),
    path(
        "api/customer/quests-in-peak-hour",
        customer_view.get_quests_in_peak_hour,
        name="customer-quests-in-peak-hour-chart",
    ),
    path("api/customer/come-back-quests", customer_view.get_come_back_quests, name="customer-come-back-quests-chart"),
    path("api/customer/situation", customer_view.get_situation, name="customer-situation-chart"),
    path(
        "api/customer/situation-compare", customer_view.get_situation_compare, name="customer-situation-compare-chart"
    ),
    path("api/customer/rate-by-gender", customer_view.get_rate_by_gender, name="customer-rate-by-gender-chart"),
    path("api/customer/rate-by-age", customer_view.get_rate_by_age, name="customer-rate-by-age-chart"),
    path(
        "api/customer/average-by-gender", customer_view.get_average_by_gender, name="customer-average-by-gender-chart"
    ),
    path(
        "api/customer/nearest-average-by-times",
        customer_view.get_nearest_average_by_times,
        name="customer-nearest-average-by-times-chart",
    ),
    path(
        "api/customer/average-by-time-period-back",
        customer_view.get_average_by_time_period_back,
        name="customer-average-by-time-period-back-chart",
    ),
    path("api/customer/average-by-turns", customer_view.get_average_by_turns, name="customer-average-by-turns-chart"),
    path(
        "api/showroom/rate-being-welcomed",
        showroom_view.get_rate_being_welcomed,
        name="showroom-rate-being-welcomed-chart",
    ),
    path(
        "api/showroom/rate-being-welcomed-by-gender",
        showroom_view.get_rate_being_welcomed_by_gender,
        name="showroom-rate-being-welcomed-by-gender-chart",
    ),
    path(
        "api/showroom/rate-being-welcomed-by-age",
        showroom_view.get_rate_being_welcomed_by_age,
        name="showroom-rate-being-welcomed-by-age-chart",
    ),
    path("api/security", security_view.get_security, name="security"),
      path("api/logs-customer", customer_view.get_logs, name="logs-customer"),
    path("api/reports", marketing_report_view.get_reports, name="reports"),
    path("api/report/<int:reportId>/", marketing_report_view.get_report_detail, name="report-detail"),
    path("api/report/<int:reportId>/delete", marketing_report_view.delete_report_detail, name="report-delete"),
    path("api/reports/create", marketing_report_view.create_report, name="reports-create"),
]
