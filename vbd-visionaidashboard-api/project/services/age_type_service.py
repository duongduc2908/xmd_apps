import pprint
from project.apps.api.models import AgeRange


def getAgeType(age_colors=list):
    age_ranges = AgeRange.objects.order_by("range_min").values()
    if len(age_ranges) > len(age_colors):
        for i in range(len(age_ranges) - len(age_colors)):
            age_colors.append(age_colors[0])

    age_types = []
    item = 1
    for age_type in age_ranges:
        if item == 1:
            name = "<" + str(age_type["range_max"])
        elif item == len(age_ranges):
            name = ">" + str(age_type["range_min"])
        else:
            name = str(age_type["range_min"]) + " - " + str(age_type["range_max"])
        age_types.append({"id": age_type["id"], "name": name, "color": age_colors[item - 1]})
        item = item + 1

    return age_types
