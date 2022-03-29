from pprint import pprint
from rest_framework.response import Response

from .error import STATUS_SUCCESS


def api_response(data=None, stores=None, tooltip=None, status=STATUS_SUCCESS, message=None, http_status=200):
    response_formatted = {"status": status, "data": data}
    if stores:
        response_formatted["stores"] = stores
    if tooltip:
        response_formatted["tooltip"] = tooltip
    if message:
        response_formatted["data"] = {"message": message}

    return Response(response_formatted, status=http_status)


def searchItem(items=list, value=None, key=None):
    for counter, item in enumerate(items):
        if item.get(key) == value:
            return counter

    return None


def numOfDays(date1, date2):
    return (date2 - date1).days
