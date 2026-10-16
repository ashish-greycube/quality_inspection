import frappe
import json
from frappe.utils import cstr, get_link_to_form
from frappe import _

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


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_tas_po_items(doctype, txt, searchfield, start, page_len, filters):
    tas_po = filters.get("tas_po")
    tas_po_items = frappe.get_all("TAS Purchase Order Item", filters={"parent": tas_po}, fields=["item_no", "color", "item_desc"])
    qc_critical_items = frappe.get_all("TAS QC Critical Details QI", filters={"parent": tas_po}, fields=["item_no", "color"])
    qc_critical_set = set((row.item_no, row.color) for row in qc_critical_items)

    txt = (txt or "").lower()
    not_in_qc_critical_items = []
    for item in tas_po_items:
        if (item.item_no, item.color) in qc_critical_set:
            continue
        if txt and not any(txt in (value or "").lower() for value in (item.item_no, item.color, item.item_desc)):
            continue
        # search queries must return list of lists/tuples: first value is the link value, rest is the description
        not_in_qc_critical_items.append((item.item_no, item.color, item.item_desc))

    start, page_len = int(start or 0), int(page_len or 20)
    return not_in_qc_critical_items[start : start + page_len]
    

def set_qc_critical_flag_and_remars_in_qc(self, method):
    if len(self.custom_qc_critical_details) > 0 and self.status != "Closed":
        for qc_critical in self.custom_qc_critical_details:
            qc_item = frappe.db.get_all("Quality Control Item QI",
                                        parent_doctype="TAS Quality Control",
                                        filters={"tas_po_ref": self.name, "item_color": cstr(qc_critical.item_no) + "-" + (cstr(qc_critical.color).upper() or '')},
                                        fields=["name", "qc_critical_remarks", "docstatus", "parent"],
                                        limit=1
                                        )
            qc_doc_name = qc_item[0].parent if len(qc_item) > 0 else None
            
            if len(qc_item) > 0 and  qc_item[0].docstatus == 0 and qc_item[0].qc_critical_remarks != qc_critical.qc_critical_remarks:
                frappe.db.set_value("Quality Control Item QI", qc_item[0].name, "qc_critical_remarks", qc_critical.qc_critical_remarks)
                qc_doc = frappe.get_doc("TAS Quality Control", qc_doc_name)

                qc_doc.add_comment("Comment", "QC Critical Remarks for item {0}-{1} were updated in {2}. <br> Remarks : {3}".format(frappe.bold(qc_critical.item_no), qc_critical.color, get_link_to_form("TAS Quality Control", qc_doc_name), qc_critical.qc_critical_remarks), comment_by=frappe.session.user)

                distinct_tas_po = frappe.get_all("Distinct TAS PO Details QI", filters={"tas_po": self.name, "is_qc_critical": 0, "is_removed": 0}, fields=["name"], limit=1)
                if len(distinct_tas_po) > 0:
                    frappe.db.set_value("Distinct TAS PO Details QI", distinct_tas_po[0].name, "is_qc_critical", 1)