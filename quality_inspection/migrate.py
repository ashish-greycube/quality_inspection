import frappe

def after_migrate():

    ### Bevel Edge Type QI ###

    if not frappe.db.exists("Bevel Edge Type QI", "Square Edge", cache=True):
        bevel_type = frappe.new_doc("Bevel Edge Type QI")
        bevel_type.bevel_type = "Square Edge"
        bevel_type.save(ignore_permissions=True)
        print("Bevel Edge Type QI: Square Edge created")
    else:
        pass

    if not frappe.db.exists("Bevel Edge Type QI", "4-Side Micro Bevel", cache=True):   
        bevel_type = frappe.new_doc("Bevel Edge Type QI")
        bevel_type.bevel_type = "4-Side Micro Bevel"
        bevel_type.save(ignore_permissions=True)
        print("Bevel Edge Type QI: 4-Side Micro Bevel created")
    else:
        pass

    if not frappe.db.exists("Bevel Edge Type QI", "Micro Bevel", cache=True):
        bevel_type = frappe.new_doc("Bevel Edge Type QI")
        bevel_type.bevel_type = "Micro Bevel"
        bevel_type.save(ignore_permissions=True)
        print("Bevel Edge Type QI: Micro Bevel created")
    else:
        pass


    ### Equipment QI ###

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

    qi = frappe.get_doc('Quality Inspection Settings QI')
    if qi.open_box_inspection == "" or qi.open_box_inspection == None or qi.open_box_inspection == '<div class="ql-editor read-mode"><p><br></p></div>':
        qi.open_box_inspection = '<div class="ql-editor read-mode"><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Open box inspection: (Inspect against CIS) Open 3 cartons,</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>set aside for sample use after QC Layout minimum 2 end joints and 3 long joints on table Material is flat and uniform (e.g., if bowing – put on 24hr hold and re-inspect. Notify QC Reporting.)</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Squareness: measure number and size of gapping (FAIL = &gt; 0.2mm)</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Squareness = Assembling Gap</li></ol></div>'

    if qi.width_thickness == "" or qi.width_thickness == None or qi.width_thickness == '<div class="ql-editor read-mode"><p><br></p></div>':    
        qi.width_thickness = '<div class="ql-editor read-mode"><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Default value: Max 0.2mm</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Default value should be read only</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>If pallet height entered is &gt;0.2mm then font color should be red with a lighter red background and auto-change the Pass/Fail button status to Fail</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>If pallet height entered is &lt;0.2mm then font color should be default and auto-change the Pass/Fail button status to Pass</li></ol></div>'

    if qi.pallet_default_value == "" or qi.pallet_default_value == None:
        qi.pallet_default_value = 8

    qi.save(ignore_permissions=True)
