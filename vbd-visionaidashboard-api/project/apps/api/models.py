from operator import mod
from statistics import mode
from django.db import models


class Site(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50, blank=False)
    type = models.CharField(max_length=50, blank=False)
    code = models.CharField(max_length=50, blank=False)

    class Meta:
        db_table = "site"


class AgeRange(models.Model):
    id = models.IntegerField(primary_key=True)
    range_min = models.IntegerField(default=0, blank=False)
    range_max = models.IntegerField(default=0, blank=False)

    class Meta:
        # set name cho table trong database
        db_table = "age_range"


class HumanEvents(models.Model):
    created = models.DateTimeField(blank=False)
    frame_thumb = models.CharField(max_length=50, blank=False)
    frame_full = models.CharField(max_length=50, blank=False)
    class Meta:
        # set name cho table trong database
        db_table = "human_events"


class VisitTurn(models.Model):

    event_in =  models.ForeignKey('HumanEvents',on_delete=models.CASCADE)
    event_out_id = models.BigIntegerField(blank=False)
    dossier_id = models.BigIntegerField(blank=False)
    gender = models.SmallIntegerField(blank=False)
    age_range = models.ForeignKey(
        to=AgeRange, on_delete=models.CASCADE, blank=False, related_name="visit_event_age", db_column="age_range_id"
    )
    in_time = models.DateTimeField(blank=False)
    out_time = models.DateTimeField(blank=False)
    total_time = models.IntegerField(default=0, blank=False)
    name = models.CharField(max_length=50, blank=False)
    be_welcomed = models.SmallIntegerField(blank=False)
    site = models.ForeignKey(
        to=Site, on_delete=models.CASCADE, blank=False, related_name="site_info", db_column="site_id"
    )
    class Meta:
        # set name cho table trong database
        db_table = "visit_turn"


class VisitsPerHour(models.Model):
    day = models.IntegerField(blank=False)
    month = models.IntegerField(blank=False)
    year = models.IntegerField(blank=False)
    hour = models.IntegerField(blank=False)
    total = models.IntegerField(blank=False)
    site = models.ForeignKey(
        to=Site, on_delete=models.CASCADE, blank=False, related_name="site_info_withhour", db_column="site_id"
    )

    class Meta:
        # set name cho table trong database
        db_table = "visits_per_hour"


class CameraGroup(models.Model):
    created = models.DateTimeField(blank=False)
    modified = models.DateTimeField(blank=False)
    name = models.TextField(blank=False)
    comment = models.TextField(blank=False)
    active = models.IntegerField(blank=False)
    site_id = models.IntegerField(blank=False)

    class Meta:
        db_table = "camera_group"


class RestrictedEvent(models.Model):
    created_time = models.DateTimeField(blank=False)
    dossier_id = models.IntegerField(blank=False)
    camera_group = models.ForeignKey(to=CameraGroup, related_name="camera_group", on_delete=models.CASCADE)
    gender = models.IntegerField(blank=False)
    age_range_id = models.IntegerField(blank=False)
    media_source = models.CharField(max_length=100, blank=False)
    thumb_img = models.CharField(max_length=255, blank=False)

    class Meta:
        # set name cho table trong database
        db_table = "restricted_events"


class MarketingReport(models.Model):
    sites = models.ManyToManyField(Site, related_name="site_report_related", through="SiteReport")
    name = models.CharField(blank=False, max_length=255)
    campains = models.JSONField(blank=False, max_length=255)
    start_time = models.DateField(blank=False)
    end_time = models.DateField(blank=False)
    result = models.JSONField(blank=False)
    created_time = models.DateTimeField(blank=False)

    def __str__(self):
        return self.sites

    class Meta:
        db_table = "reports"


class SiteReport(models.Model):
    site = models.ForeignKey(Site, related_name="site_report_to_site", on_delete=models.CASCADE, db_column="site_id")
    report = models.ForeignKey(
        MarketingReport, related_name="site_report_to_marketing_report", on_delete=models.CASCADE, db_column="report_id"
    )

    class Meta:
        db_table = "site_reports"


class AverageVisitTimes(models.Model):
    site_id = models.IntegerField(blank=False, primary_key=True)
    average = models.FloatField(blank=False)


class AverageTimePeriodBack(models.Model):
    site_id = models.IntegerField(blank=False, primary_key=True)
    average = models.FloatField(blank=False)


class AverageTurn(models.Model):
    site_id = models.IntegerField(blank=False, primary_key=True)
    average = models.FloatField(blank=False)


class SituationByGender(models.Model):
    site_id = models.IntegerField(blank=False, primary_key=True)
    gender = models.SmallIntegerField(blank=False)
    group_type = models.CharField(max_length=50, blank=False)
    category = models.DateField(blank=False)
    num = models.IntegerField(blank=False)


class SituationByStore(models.Model):
    site_id = models.IntegerField(blank=False, primary_key=True)
    group_type = models.CharField(max_length=50, blank=False)
    category = models.DateField(blank=False)
    num = models.IntegerField(blank=False)
