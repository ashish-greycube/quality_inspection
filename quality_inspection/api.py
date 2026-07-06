import frappe
import json

@frappe.whitelist()
def get_quality_inspection_events(doctype, start, end, field_map, filters=None, fields=None):
    # 1. Exactly replicate Frappe's incoming parsing steps
    field_map = frappe._dict(json.loads(field_map))
    fields = frappe.parse_json(fields)

    doc_meta = frappe.get_meta(doctype)
    for d in doc_meta.fields:
        if d.fieldtype == "Color":
            field_map.update({"color": d.fieldname})

    filters = json.loads(filters) if filters else []

    # 2. Crucial: Ensure BOTH "name" and "status" are fetched from the DB
    if not fields:
        fields = [field_map.start, field_map.end, field_map.title, "name", "workflow_state as status", "vendor"]

    if field_map.color:
        fields.append(field_map.color)

    # 3. Exactly replicate Frappe's custom SQL date range injection
    start_date = "ifnull({}, '0001-01-01 00:00:00')".format(field_map.start)
    end_date = "ifnull({}, '2199-12-31 00:00:00')".format(field_map.end)

    filters += [
        [doctype, start_date, "<=", end],
        [doctype, end_date, ">=", start],
    ]
    
    fields = list({field for field in fields if field})
    
    # 4. Fetch the clean list using Frappe's native get_list
    # Added limit=0 to ensure nothing is paginated/cut off
    raw_events = frappe.get_list(doctype, fields=fields, filters=filters, limit=0)

    # 5. Loop through and dynamically format the title field
    for event in raw_events:
        doc_name = event.get("name") or ""
        doc_status = event.get("status") or ""
        
        # Override the title key expected by JavaScript with your custom combo string
        event[field_map.title] = f"{doc_name} \n {doc_status}"
        event[field_map.color] = "#29CD42" if doc_status == "Approved" else "#FF4E37" if doc_status == "Draft" else "blue"  # Example: Green for Accepted, Red otherwise
    return raw_events