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

def add_items_in_qc_critical_table_in_tas_po(self, method):
    if len(self.custom_qc_critical_details) != len(self.items) and self.status != "Closed":
        if len(self.custom_qc_critical_details) < 1:
            for row in self.items:
                self.append("custom_qc_critical_details", {
                    "item_no": row.item_no,
                    "color": row.color,
                    "item_name": row.item_desc
                })
        else:
            for row in self.items:
                if not any(d.item_no == row.item_no and d.color == row.color for d in self.custom_qc_critical_details):
                    self.append("custom_qc_critical_details", {
                        "item_no": row.item_no,
                        "color": row.color,
                        "item_name": row.item_desc,
                    })

def update_qc_critical_notes_in_quality_control(self, method):
    if len(self.custom_qc_critical_details) > 0 and self.custom_is_qc_critical == 1 and self.status != "Closed":
        for row in self.custom_qc_critical_details:
            if row.item_no and row.qc_critical_remarks:
                quality_control = frappe.db.get_all("Quality Control Item QI",
                                                    parent_doctype="TAS Quality Control",
                                                    filters={"tas_po_ref": self.name, "item_color": cstr(row.item_no) + "-" + (cstr(row.color).upper() or '')},
                                                    fields=["name", "qc_critical_remarks", "docstatus", "parent"],
                                                    limit=1
                                                    )
                if quality_control and quality_control[0].docstatus > 0 and quality_control[0].qc_critical_remarks != row.qc_critical_remarks:
                    frappe.msgprint(_("QC Critical Remarks for item {0} ({1}) were not updated in {2} because that Quality Control is already submitted.")
                            .format(frappe.bold(row.item_no), row.color, get_link_to_form("TAS Quality Control", quality_control[0].parent)),
                            indicator="orange",
                            alert=True,
                        )

                if quality_control and quality_control[0].qc_critical_remarks != row.qc_critical_remarks and quality_control[0].docstatus == 0:
                    frappe.db.set_value("Quality Control Item QI", quality_control[0].name, "qc_critical_remarks", row.qc_critical_remarks)

    
    qc_tas_po = frappe.db.get_all("Distinct TAS PO Details QI",
                                    parent_doctype="TAS Quality Control",
                                    filters={"tas_po": self.name, "docstatus": 0},
                                    fields=["name", "is_qc_critical"],
                                    )
    if len(qc_tas_po) > 0:
        unique_items = set((row.item_no, row.color) for row in self.items)
        if len(unique_items) != len(self.items):
            frappe.msgprint("Duplicate items may create issues in Quality Control. Please ensure that each item-color combination is unique in the QC Critical Details table.", alert=True)

    if self.custom_is_qc_critical == 1:
        for qc in qc_tas_po:
            if qc.is_qc_critical != 1:
                frappe.db.set_value("Distinct TAS PO Details QI", qc.name, "is_qc_critical", 1)