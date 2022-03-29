from datetime import date, datetime, timedelta, time
import json
from django import forms

from project.apps.api.models import Site
from project.services.customer_service import isSamePeriod


class AnalysisSearchForm(forms.Form):
    search_by = forms.ChoiceField(choices=(("store", "1"), ("showroom_type", "2")), required=True)
    search_value = forms.Field(help_text="Giá trị tương ứng với search_by", required=False)

    search_date_by = forms.ChoiceField(choices=(("bydate", "1"), ("byrange", "2")), required=True)
    search_date_value = forms.Field(help_text="Giá trị tương ứng với search_date_by", required=True)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop("request")
        super().__init__(*args, **kwargs)

    def clean(self):
        # Check Stores
        stores = []
        if self.data.get("search_by") == "store":
            if isinstance(self.data.get("search_value"), int) and bool(
                self.request.user and self.request.user.is_staff
            ):
                stores = Site.objects.filter(id=self.data.get("search_value")).values()
            else:
                stores = Site.objects.filter(id=self.request.user.site_id).values()
        elif self.data.get("search_by") == "showroom_type" and bool(self.request.user and self.request.user.is_staff):
            stores = Site.objects.filter(type=self.data.get("search_value")).order_by("id").values()
        else:
            self.add_error("search_by", "Không tìm thấy giá trị tương ứng")

        self.data["stores"] = stores
        if len(stores) == 0:
            self.add_error("search_value", "Không tìm thấy thông tin cửa hàng")

        # Check date
        startDate = datetime.combine(date.today(), time(00, 00, 00))
        endDate = datetime.combine(date.today(), time(23, 59, 59))
        if self.data.get("search_date_by") == "bydate":
            startDate = datetime.combine(
                date.today() - timedelta(days=(self.data.get("search_date_value") - 1)), time(00, 00, 00)
            )
            endDate = datetime.combine(date.today(), time(23, 59, 59))
        elif self.data.get("search_date_by") == "byrange":
            range = self.data.get("search_date_value")
            try:
                startDate = datetime.strptime(range["start"] + " 00:00:00", "%m/%d/%Y %H:%M:%S")
                endDate = datetime.strptime(range["end"] + " 23:59:59", "%m/%d/%Y  %H:%M:%S")
            except ValueError:
                self.add_error("search_date_value", "Định dạng dữ liệu không hợp lệ")
            if endDate < startDate:
                self.add_error("search_date_value", "Start Date không thể lớn hơn End Date")
        else:
            self.add_error("search_date_by", "Không tìm thấy điều kiện tìm kiếm: bydate | byrange")

        self.data["date_range"] = {"start_date": startDate, "end_date": endDate}

        if isSamePeriod(self.data):
            startDateSamePeriod = datetime.combine(
                date.today() - timedelta(days=(self.data.get("search_date_value") * 2 - 1)), time(00, 00, 00)
            )
            endDateSamePeriod = datetime.combine(
                date.today() - timedelta(days=self.data.get("search_date_value")), time(23, 59, 59)
            )

            self.data["date_range_same_period"] = {"start_date": startDateSamePeriod, "end_date": endDateSamePeriod}

        return self.data


class SecuritySearchForm(forms.Form):
    store = forms.IntegerField(required=False)
    search_date_by = forms.ChoiceField(choices=(("bydate", "1"), ("byrange", "2")), required=True)
    search_date_value = forms.Field(help_text="Giá trị tương ứng với search_date_by", required=True)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop("request")
        super().__init__(*args, **kwargs)

    def clean(self):
        if bool(self.request.user and self.request.user.is_staff):
            self.add_error("store", "Admin không xem trang này")
        else:
            self.data["store"] = self.request.user.site_id

        # Check date
        startDate = datetime.combine(date.today(), time(00, 00, 00))
        endDate = datetime.combine(date.today(), time(23, 59, 59))
        if self.data.get("search_date_by") == "bydate":
            startDate = datetime.combine(
                date.today() - timedelta(days=(self.data.get("search_date_value") - 1)), time(00, 00, 00)
            )
            endDate = datetime.combine(date.today(), time(23, 59, 59))
        elif self.data.get("search_date_by") == "byrange":
            range = self.data.get("search_date_value")
            try:
                startDate = datetime.strptime(range["start"] + " 00:00:00", "%m/%d/%Y %H:%M:%S")
                endDate = datetime.strptime(range["end"] + " 23:59:59", "%m/%d/%Y  %H:%M:%S")
            except ValueError:
                self.add_error("search_date_value", "Định dạng dữ liệu không hợp lệ")
            if endDate < startDate:
                self.add_error("search_date_value", "Start Date không thể lớn hơn End Date")
        else:
            self.add_error("search_date_by", "Không tìm thấy điều kiện tìm kiếm: bydate | byrange")

        self.data["date_range"] = {"start_date": startDate, "end_date": endDate}

        if isSamePeriod(self.data):
            startDateSamePeriod = datetime.combine(
                date.today() - timedelta(days=(self.data.get("search_date_value") * 2 - 1)), time(00, 00, 00)
            )
            endDateSamePeriod = datetime.combine(
                date.today() - timedelta(days=self.data.get("search_date_value")), time(23, 59, 59)
            )

            self.data["date_range_same_period"] = {"start_date": startDateSamePeriod, "end_date": endDateSamePeriod}

        return self.data


class LogsCustomerSearchForm(forms.Form):
    store = forms.IntegerField(required=False)
    search_date_by = forms.ChoiceField(choices=(("bydate", "1"), ("byrange", "2")), required=True)
    search_date_value = forms.Field(help_text="Giá trị tương ứng với search_date_by", required=True)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop("request")
        super().__init__(*args, **kwargs)

    def clean(self):
        if bool(self.request.user and self.request.user.is_staff):
            self.add_error("store", "Admin không xem trang này")
        else:
            self.data["store"] = self.request.user.site_id

        # Check date
        startDate = datetime.combine(date.today(), time(00, 00, 00))
        endDate = datetime.combine(date.today(), time(23, 59, 59))
        if self.data.get("search_date_by") == "bydate":
            startDate = datetime.combine(
                date.today() - timedelta(days=(self.data.get("search_date_value") - 1)), time(00, 00, 00)
            )
            endDate = datetime.combine(date.today(), time(23, 59, 59))
        elif self.data.get("search_date_by") == "byrange":
            range = self.data.get("search_date_value")
            try:
                startDate = datetime.strptime(range["start"] + " 00:00:00", "%m/%d/%Y %H:%M:%S")
                endDate = datetime.strptime(range["end"] + " 23:59:59", "%m/%d/%Y  %H:%M:%S")
            except ValueError:
                self.add_error("search_date_value", "Định dạng dữ liệu không hợp lệ")
            if endDate < startDate:
                self.add_error("search_date_value", "Start Date không thể lớn hơn End Date")
        else:
            self.add_error("search_date_by", "Không tìm thấy điều kiện tìm kiếm: bydate | byrange")

        self.data["date_range"] = {"start_date": startDate, "end_date": endDate}

        if isSamePeriod(self.data):
            startDateSamePeriod = datetime.combine(
                date.today() - timedelta(days=(self.data.get("search_date_value") * 2 - 1)), time(00, 00, 00)
            )
            endDateSamePeriod = datetime.combine(
                date.today() - timedelta(days=self.data.get("search_date_value")), time(23, 59, 59)
            )

            self.data["date_range_same_period"] = {"start_date": startDateSamePeriod, "end_date": endDateSamePeriod}

        return self.data

class MarketingReportForm(forms.Form):
    name = forms.CharField(required=True)
    stores = forms.JSONField(required=True)
    campains = forms.JSONField(required=True)
    start_date = forms.DateField(required=True)
    end_date = forms.DateField(required=True)

    def clean(self):
        try:
            if self.data.get("start_date", False):
                startDate = datetime.strptime(self.data.get("start_date") + " 00:00:00", "%m/%d/%Y %H:%M:%S")
        except ValueError:
            self.add_error("start_date", "Định dạng dữ liệu không hợp lệ")

        try:
            if self.data.get("end_date", False):
                endDate = datetime.strptime(self.data.get("end_date") + " 23:59:59", "%m/%d/%Y %H:%M:%S")
        except ValueError:
            self.add_error("end_date", "Định dạng dữ liệu không hợp lệ")

        if "endDate" in locals() and "startDate" in locals() and endDate < startDate:
            self.add_error("start_date", "Start Date không thể lớn hơn End Date")

        return self.data
