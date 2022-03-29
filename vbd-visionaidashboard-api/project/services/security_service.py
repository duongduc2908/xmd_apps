from project.apps.api.models import RestrictedEvent


def searchSecurity(dateRange=dict, store=int, conditions=dict):
    query = RestrictedEvent.objects.filter(camera_group__site_id=store).filter(camera_group__active=1)

    startDate = dateRange.get("start_date")
    endDate = dateRange.get("end_date")
    query = query.filter(created_time__gte=startDate, created_time__lte=endDate)

    return query.order_by("-created_time")
