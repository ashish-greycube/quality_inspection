import frappe

def after_migrate():
    update_dashboard_link_for_core_doctype(doctype='TAS Purchase Order',
                                           link_doctype='TAS Quality Control',
                                           link_fieldname='tas_po', 
                                           parent_doctype='TAS Quality Control',
                                           table_fieldname='pallet_details')
    
    ### Pallet Type QI ###

    if not frappe.db.exists("Pallet Type QI", "Plywood", cache=True):
        pallet_type = frappe.new_doc("Pallet Type QI")
        pallet_type.pallet_type = "Plywood"
        pallet_type.save(ignore_permissions=True)
        print("Pallet Type QI: Plywood created")
    else:
        pass

    if not frappe.db.exists("Pallet Type QI", "Hardwood", cache=True):
        pallet_type = frappe.new_doc("Pallet Type QI")
        pallet_type.pallet_type = "Hardwood"
        pallet_type.save(ignore_permissions=True)
        print("Pallet Type QI: Hardwood created")
    else:
        pass

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
        equipment.equipment_default_value = "6 to 9%"
        equipment.save(ignore_permissions=True)
        print("Equipment QI: Pin Meter created")
    else:
        pass

    if not frappe.db.exists("Equipment QI", "Surface Meter", cache=True):
        equipment = frappe.new_doc("Equipment QI")
        equipment.equipment = "Surface Meter"
        equipment.equipment_default_value = "9 to 12%"
        equipment.save(ignore_permissions=True)
        print("Equipment QI: Surface Meter created")

    if not frappe.db.exists("Equipment QI", "Vernier Calipers", cache=True):
        equipment = frappe.new_doc("Equipment QI")
        equipment.equipment = "Vernier Calipers"
        equipment.save(ignore_permissions=True)
        print("Equipment QI: Vernier Calipers created")

    qi = frappe.get_doc('Quality Inspection Settings QI')
    if qi.gloss_level == "" or qi.gloss_level == None or qi.gloss_level == '<div class="ql-editor read-mode"><p><br></p></div>':
        qi.gloss_level = '<div class="ql-editor" data-gramm="false" contenteditable="true"><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Reading from finished board that matches master sample</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Highest reading found on the finished board used for (1)</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>Lowest reading found on the finished board used for (1)</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>2 average readings from 2 different planks</li></ol></div>'

    if qi.open_box_inspection == "" or qi.open_box_inspection == None or qi.open_box_inspection == '<div class="ql-editor read-mode"><p><br></p></div>':
        qi.open_box_inspection = '<div class="ql-editor read-mode"><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Open box inspection: (Inspect against CIS) Open 3 cartons,</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>set aside for sample use after QC Layout minimum 2 end joints and 3 long joints on table Material is flat and uniform (e.g., if bowing – put on 24hr hold and re-inspect. Notify QC Reporting.)</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Squareness: measure number and size of gapping (FAIL = &gt; 0.2mm)</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Squareness = Assembling Gap</li></ol></div>'

    if qi.width_thickness == "" or qi.width_thickness == None or qi.width_thickness == '<div class="ql-editor read-mode"><p><br></p></div>':    
        qi.width_thickness = '<div class="ql-editor read-mode"><p>Assembling Gap</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Default value: Max 0.2mm</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Default value should be read only</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>If pallet height entered is &gt;0.2mm then font color should be red with a lighter red background and auto-change the Pass/Fail button status to Fail</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>If pallet height entered is &lt;0.2mm then font color should be default and auto-change the Pass/Fail button status to Pass</li></ol><p><em>Please ensure to capture images of the back of the board showing that the pad is away from the locking system</em></p></div>'

    if qi.pallet_default_value == "" or qi.pallet_default_value == None:
        qi.pallet_default_value = 8

    qi.save(ignore_permissions=True)


def update_dashboard_link_for_core_doctype(doctype,link_doctype,link_fieldname, parent_doctype=None, table_fieldname=None,group=None):
    print(doctype,link_doctype,link_fieldname,group)
    try:
        d = frappe.get_doc("Customize Form")
        if doctype:
            d.doc_type = doctype
        d.run_method("fetch_to_customize")
        for link in d.get('links'):
            if link.link_doctype==link_doctype and link.link_fieldname==link_fieldname:
                # found so just return
                return
        d.append('links', dict(link_doctype=link_doctype, 
                               link_fieldname=link_fieldname,
                               parent_doctype=parent_doctype, 
                               table_fieldname=table_fieldname,
                               group=group))
        d.run_method("save_customization")
        frappe.clear_cache()
    except Exception:
        frappe.log_error(frappe.get_traceback())