import frappe

def execute():
    qi_list = frappe.db.get_all("TAS Quality Control", filters={"docstatus": ["!=", 2]},  fields=["name"])
    if len(qi_list) > 0:
        for qi in qi_list:
            qi_doc = frappe.get_doc("TAS Quality Control", qi)
            if len(qi_doc.tas_po_details) < 1 and len(qi_doc.pallet_details) > 0:
                for pallet in qi_doc.pallet_details:
                    qi_doc.append("tas_po_details", {
                        "tas_po": pallet.tas_po,
                        "status": "Active",
                    })
                
                qi_doc.flags.ignore_mandatory = True
                qi_doc.save(ignore_permissions = True)