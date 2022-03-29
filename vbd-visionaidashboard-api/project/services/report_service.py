from datetime import datetime
import pandas as pd

from project.apps.api.models import SituationByStore


def orderByCategory(store=None, orders=pd.DataFrame, categories=list, dateRange=dict):
    orderByStore = orders.loc[orders["BU"] == store.code]
    orderByCategories = []

    for category in categories:
        if type(category) == int:
            startTimeDate = dateRange.get("start_date").strftime("%m/%d/%Y " + str(category) + ":00:00")
            endTimeDate = dateRange.get("start_date").strftime("%m/%d/%Y " + str(category) + ":59:59")
        else:
            startTimeDate = category.strftime("%m/%d/%Y 00:00:00")
            endTimeDate = category.strftime("%m/%d/%Y 23:59:59")
        filterByDate = orderByStore.loc[orderByStore["Transaction Date"] >= startTimeDate]
        filterByDate = filterByDate.loc[filterByDate["Transaction Date"] <= endTimeDate]
        orderByCategories.append(filterByDate.shape[0])

    return orderByCategories


def visitsByCategory(store=None, visits=list, categories=list):
    visitByCategories = []

    for category in categories:
        search = next(
            filter(lambda visit: visit.site_id == store.id and visit.category == category, visits), SituationByStore()
        )
        visitByCategories.append(0 if search.num == None else search.num)

    return visitByCategories
