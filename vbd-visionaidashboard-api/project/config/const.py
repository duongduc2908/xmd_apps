genders = [
    {"id": 1, "name": "Nam", "is_search": True, "color": "#5A3FFF"},
    {"id": 0, "name": "Nữ", "is_search": True, "color": "#1ED6FF"},
    {"id": None, "name": "Không xác định", "is_search": False, "color": "#FFCD1E"},
]

age_colors = ["#FFDAFB", "#F9B0F1", "#E36AD7", "#B63BA9", "#791C70"]

# Config store compare colors
store_compare_colors = [
    "#FC993E",
    "#5A3FFF",
    "#B63BA9",
    "#1ED6FF",
    "#219653",
    "#7C2EFB",
    "#EB5757",
    "#2D9CDB",
    "#FFCD1E",
    "#43E7B5",
]

charts = {
    "total_visits": {
        "title": "Tổng số lượt ghé thăm",
        "title_compare": "Tổng số lượt ghé thăm",
        "tooltip": "So sánh với cùng kỳ trong quá khứ",
    },
    "average_visits_time": {
        "title": "Thời gian ghé thăm trung bình",
        "title_compare": "Thời gian ghé thăm trung bình",
        "tooltip": "So sánh với cùng kỳ trong quá khứ",
    },
    "quests_in_peak_hour": {
        "title": "Tổng số khách trong giờ cao điểm",
        "title_compare": "Số lượng khách vào giờ cao điểm",
        "tooltip": "",
    },
    "come_back_quests": {"title": "Khách hàng quay lại", "title_compare": "Khách hàng quay lại", "tooltip": ""},
    "situation": {
        "title": "Diễn biến khách hàng theo thời gian",
        "title_compare": "Diễn biến khách hàng theo thời gian",
        "tooltip": "",
    },
    "situation_compare": {
        "title": "Diễn biến khách hàng theo thời gian",
        "title_compare": "Diễn biến khách hàng theo thời gian",
        "tooltip": "",
    },
    "rate_by_gender": {
        "title": "Tỉ lệ giới tính khách hàng ghé thăm",
        "title_compare": "Tỉ lệ giới tính khách hàng ghé thăm",
        "tooltip": "",
    },
    "rate_by_age": {
        "title": "Tỉ lệ độ tuổi khách hàng ghé thăm",
        "title_compare": "Tỉ lệ độ tuổi khách hàng ghé thăm",
        "tooltip": "",
    },
    "average_by_gender": {
        "title": "Thời gian ghé thăm trung bình theo giới tính",
        "title_compare": "Thời gian ghé thăm trung bình theo giới tính",
        "tooltip": "",
    },
    "nearest_average_by_times": {
        "title": "Thời gian trung bình gần nhất khách hàng xuất hiện",
        "title_compare": "Thời gian trung bình gần nhất khách hàng xuất hiện",
        "tooltip": "Là khoảng thời gian gần nhất khách hàng cũ quay lại showroom. Chỉ tính với các khách hàng xuất hiện ít nhất 02 lần",
    },
    "average_by_time_period_back": {
        "title": "Khoảng thời gian trung bình giữa các lần ghé thăm",
        "title_compare": "Khoảng thời gian trung bình giữa các lần ghé thăm",
        "tooltip": "Là trung bình cộng thời gian giữa các lần ghé thăm của khách hàng. Chỉ tính với các khách hàng xuất hiện ít nhất 02 lần",
    },
    "average_by_turns": {
        "title": "Tần suất ghé thăm trung bình",
        "title_compare": "Tần suất ghé thăm trung bình",
        "tooltip": "Là trung bình cộng của tổng số thời gian khách hàng xuất hiện",
    },
    "rate_being_welcomed": {
        "title": "Tỉ lệ khách được đón tiếp tại khu vực mặt tiền",
        "title_compare": "Tỉ lệ khách được đón tiếp tại khu vực mặt tiền",
        "tooltip": "",
    },
    "average_exposure_time": {"title": "Thời gian tiếp xúc trung bình giữa nhân viên và khách hàng", "tooltip": ""},
    "rate_being_welcomed_by_gender": {
        "title": "Tỉ lệ khách hàng được đón tiếp theo giới tính",
        "title_compare": "Tỉ lệ khách hàng được đón tiếp theo giới tính",
        "tooltip": "",
    },
    "rate_being_welcomed_by_age": {
        "title": "Tỉ lệ khách hàng được đón tiếp theo độ tuổi",
        "title_compare": "Tỉ lệ khách hàng được đón tiếp theo độ tuổi",
        "tooltip": "",
    },
}
