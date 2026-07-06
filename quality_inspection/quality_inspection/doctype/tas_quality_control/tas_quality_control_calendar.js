frappe.views.calendar["TAS Quality Control"] = {
    field_map: {
        start: "date_of_inspection",
        end: "date_of_inspection",
        id: "name",
        title: "title",
        allDay: "allDay",
        color: "color",
        tooltip: "name"
    },
    gantt: true,
    get_events_method: "quality_inspection.api.get_quality_inspection_events",
    get_css_class: function (data) {
        if (data.color === "#29CD42") {
            return "green";
        }
        if (data.color === "#FF4E37") {
            return "red";
        }
        return "blue";
    }
};