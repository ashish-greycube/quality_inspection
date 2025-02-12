import frappe

def after_migrate():

    ### Bevel Type QI ###

    if not frappe.db.exists("Bevel Type QI", "Square Edge", cache=True):
        bevel_type = frappe.new_doc("Bevel Type QI")
        bevel_type.bevel_type = "Square Edge"
        bevel_type.save(ignore_permissions=True)
        print("Bevel Type QI: Square Edge created")
    else:
        pass

    if not frappe.db.exists("Bevel Type QI", "4-Side Micro Bevel", cache=True):   
        bevel_type = frappe.new_doc("Bevel Type QI")
        bevel_type.bevel_type = "4-Side Micro Bevel"
        bevel_type.save(ignore_permissions=True)
        print("Bevel Type QI: 4-Side Micro Bevel created")
    else:
        pass

    if not frappe.db.exists("Bevel Type QI", "Micro Bevel", cache=True):
        bevel_type = frappe.new_doc("Bevel Type QI")
        bevel_type.bevel_type = "Micro Bevel"
        bevel_type.save(ignore_permissions=True)
        print("Bevel Type QI: Micro Bevel created")
    else:
        pass


    ### Equipment QI ###

    if not frappe.db.exists("Equipment QI", "LOV", cache=True):
        equipment = frappe.new_doc("Equipment QI")
        equipment.equipment = "LOV"
        equipment.save(ignore_permissions=True)
        print("Equipment QI: LOV created")
    else:
        pass

    if not frappe.db.exists("Equipment QI", "Pin Meter", cache=True):
        equipment = frappe.new_doc("Equipment QI")
        equipment.equipment = "Pin Meter"
        equipment.save(ignore_permissions=True)
        print("Equipment QI: Pin Meter created")
    else:
        pass

    if not frappe.db.exists("Equipment QI", "Surface Meter", cache=True):
        equipment = frappe.new_doc("Equipment QI")
        equipment.equipment = "Surface Meter"
        equipment.save(ignore_permissions=True)
        print("Equipment QI: Surface Meter created")

    if not frappe.db.exists("Equipment QI", "Vernier Calipers", cache=True):
        equipment = frappe.new_doc("Equipment QI")
        equipment.equipment = "Vernier Calipers"
        equipment.save(ignore_permissions=True)
        print("Equipment QI: Vernier Calipers created")
