# Copyright (c) 2024, GreyCube Technologies and contributors
# For license information, please see license.txt

import frappe
import erpnext
from frappe import _
from frappe.model.document import Document
from frappe.utils import cstr, flt, getdate, nowdate, add_to_date, now, get_url
from frappe.desk.form.assign_to import get as get_assignees, add as add_assign

from frappe.utils.pdf import get_pdf, prepare_options, inline_private_images, get_cookie_options
import json
from six import string_types
# from frappe.www.printview import get_print_style

PASS_STATUS = ["Pass"]
UNDETERMINED = ["Undetermined"]
TODO_STATUS = ["To Do"]
FAIL_STATUS = ['Fail - Minor', 'Fail - Major', 'Fail - Critical']
class TASQualityControl(Document):

	def onload(self):
		self.get_pallet_information_html()

	def validate(self):
		self.set_default_values_and_guidelines()
		self.set_attachments_details()
		self.set_color_count_for_color_match_and_embossing()
		self.fill_missing_data_details()
		self.check_all_data_mark_as_completed()	
		self.add_assign_to_user()

	def on_submit(self):
		# self.validate_over_wax_and_edge_paint_child_table()
		self.validate_open_box_child_table()
		
	def get_pallet_information_html(self):

		template_path = "templates/pallet_information.html"

		pallet_html = frappe.render_template(template_path,  
									   dict(total_attach=self.pallet_total_attachment, pending=self.pallet_pending_attachment, 
				 							pass_ration=self.pallet_pass_ration,color=None, undetermined_ratio=self.pallet_undetermined_ratio, todo_ration=self.pallet_todo_ratio))  
		inner_outer_html = frappe.render_template(template_path,  
										dict(total_attach=self.inner_total_attachment, pending=self.inner_pending_attachment, 
			   								pass_ration=self.inner_pass_ration,color=None, undetermined_ratio=self.inner_undetermined_ratio, todo_ration=self.inner_todo_ratio))
		color_match_html = frappe.render_template(template_path,
										dict(total_attach=self.color_total_attachment, pending=self.color_pending_attachment, 
			   								pass_ration=self.color_pass_ration,color=self.color_count, undetermined_ratio=self.color_undetermined_ratio, todo_ration=self.color_todo_ratio))
		over_wax_html = frappe.render_template(template_path,  
										dict(total_attach=self.over_total_attachment, pending=self.over_pending_attachment, 
			   								pass_ration=self.over_pass_ration,color=None, undetermined_ratio=self.over_undetermined_ratio, todo_ration=self.over_todo_ratio))
		gloss_level_html = frappe.render_template(template_path,  
										dict(total_attach=self.gloss_total_attachment, pending=self.gloss_pending_attachment, 
			   								pass_ration=self.gloss_pass_ration,color=None, undetermined_ratio=self.gloss_undetermined_ratio, todo_ration=self.gloss_todo_ratio))
		moisture_html = frappe.render_template(template_path,  
										dict(total_attach=self.moisture_total_attachment, pending=self.moisture_pending_attachment, 
			   								pass_ration=self.moisture_pass_ration,color=None, undetermined_ratio=self.moisture_undetermined_ratio, todo_ration=self.moisture_todo_ratio))
		open_box_html = frappe.render_template(template_path,  
										dict(total_attach=self.open_total_attachment, pending=self.open_pending_attachment, 
			   								pass_ration=self.open_pass_ration,color=None, undetermined_ratio=self.open_undetermined_ratio, todo_ration=self.open_todo_ratio))
		width_thickness_html = frappe.render_template(template_path,  
										dict(total_attach=self.width_total_attachment, pending=self.width_pending_attachment, 
			   								pass_ration=self.width_pass_ration,color=None, undetermined_ratio=self.open_undetermined_ratio, todo_ration=self.width_todo_ratio))

		self.set_onload("pallet_html", pallet_html)
		self.set_onload("inner_outer_html", inner_outer_html)
		self.set_onload("color_match_html", color_match_html)
		self.set_onload("over_wax_html", over_wax_html)
		self.set_onload("gloss_level_html", gloss_level_html)
		self.set_onload("moisture_html", moisture_html)
		self.set_onload("open_box_html", open_box_html)
		self.set_onload("width_thickness_html", width_thickness_html)

	def calculate_attachments_details(self, child_table, attach_field_list, select_field_list):
		
		total_attachments = 0
		pendings = 0
		total_pass = 0
		pass_ration = 0
		total_undetermined = 0
		undetermined_ratio = 0
		total_todo = 0
		todo_ration = 0

		if self.get("no_of_po") and self.get("no_of_po") > 0:
			if child_table == "pallet_details":
				# total_select_fields = len(self.pallet_details)	* len(select_field_list)
				total_select_fields = 0

				for row in self.get(child_table):

					for attach in attach_field_list:
						if row.pallet_type != "Plywood" and attach == "width":
							continue
						elif row.pallet_type != "Hardwood" and attach == "ippc_photo":
							continue
						else:
							if not row.get(attach):
								pendings = pendings + 1
							total_attachments = total_attachments + 1

					for select in select_field_list:
						if row.pallet_type != "Plywood" and select == "button_select":
							continue
						elif row.pallet_type != "Hardwood" and select == "iipa":
							continue
						else:
							total_select_fields = total_select_fields + 1
							if row.get(select) in PASS_STATUS:
								total_pass = total_pass + 1
							elif row.get(select) in UNDETERMINED:
								total_undetermined = total_undetermined + 1
							elif row.get(select) in TODO_STATUS:
								total_todo = total_todo + 1
							else:
								pass

				pass_ration = ((total_pass * 100)/ total_select_fields)
				undetermined_ratio = ((total_undetermined * 100) / total_select_fields)
				todo_ration = ((total_todo * 100) / total_select_fields)

			else:
				table_length = 0
				total_select_fields = 0
				for i in range(self.no_of_po):
					child_table_name=child_table+cstr(i+1)
					
					if len(self.get(child_table_name)) > 0:
						table_length = table_length +  len(self.get(child_table_name))

						for row in self.get(child_table_name):
							for attach in attach_field_list:
								if not row.get(attach):
									pendings = pendings + 1
								total_attachments = total_attachments + 1

							for select in select_field_list:
								if child_table_name == "inner_and_outer_carton_details_" + cstr(i+1) and self.flooring_class == "RC/SPC/WPC/LVGD" and select == "carb_select":
									continue
								elif child_table_name == "over_wax_and_edge_paint_" + cstr(i+1) and self.flooring_class == "RC/SPC/WPC/LVGD" and select == "over_wax_select":
									continue
								elif child_table_name == "over_wax_and_edge_paint_" + cstr(i+1) and self.flooring_class == "HARDWOOD FLOORING" and select == "edge_paint_select":
									continue
								else:
									total_select_fields = total_select_fields + 1
									if row.get(select) in PASS_STATUS:
										total_pass = total_pass + 1
									elif row.get(select) in UNDETERMINED:
										total_undetermined = total_undetermined + 1
									elif row.get(select) in TODO_STATUS:
										total_todo = total_todo + 1
									else:
										pass

						# total_select_fields = table_length * len(select_field_list)
				if total_select_fields > 0:
					pass_ration = ((total_pass * 100)/ total_select_fields)
					undetermined_ratio = ((total_undetermined * 100) / total_select_fields)
					todo_ration = ((total_todo * 100) / total_select_fields)
		
		return total_attachments, pendings, pass_ration, undetermined_ratio, todo_ration
	
	def set_attachments_details(self):
		pallet = self.calculate_attachments_details("pallet_details", ['installation_photo','width', 'ippc_photo'], ['button_select', 'installation_status', 'iipa'])
		self.pallet_total_attachment = pallet[0]
		self.pallet_pending_attachment = pallet[1]
		self.pallet_pass_ration = flt((pallet[2]), 2)
		self.pallet_undetermined_ratio = flt((pallet[3]), 2)
		self.pallet_todo_ratio = flt((pallet[4]), 2)

		inner = self.calculate_attachments_details("inner_and_outer_carton_details_", ['end_label'],
											 ['hologram_select', 'carb_select', 'floor_select', 'shink_wrap_select', 'insert_sheet_select', 'title_iv', 'mfg_production_run', 'item_matches_ir_tag'])
		self.inner_total_attachment = inner[0]
		self.inner_pending_attachment = inner[1]
		self.inner_pass_ration = flt((inner[2]), 2)
		self.inner_undetermined_ratio = flt((inner[3]), 2)
		self.inner_todo_ratio = flt((inner[4]), 2)

		color = self.calculate_attachments_details("color_match_and_embossing_details_", ['master_sample', 'finished_board', 'pattern_repeat_photo'], ['results_select', 'embossing_select', 'pattern_repeat'])
		self.color_total_attachment = color[0]
		self.color_pending_attachment = color[1]
		self.color_pass_ration = flt((color[2]), 2)
		self.color_undetermined_ratio = flt((color[3]), 2)
		self.color_todo_ratio = flt((color[4]), 2)

		over = self.calculate_attachments_details("over_wax_and_edge_paint_", ['finished_board'], ['over_wax_select', 'edge_paint_select'])
		self.over_total_attachment = over[0]
		self.over_pending_attachment = over[1]
		self.over_pass_ration = flt((over[2]), 2)
		self.over_undetermined_ratio = flt((over[3]), 2)
		self.over_todo_ratio = flt((over[4]), 2)

		gloss = self.calculate_attachments_details("gloss_level_details_", ['master_sample', 'finished_board_1', 'finished_board_2', 'finished_board_3', 'finished_board_4', 'finished_board_5'], 
											 ['results_select_1', 'results_select_2', 'results_select_3', 'results_select_4', 'results_select_5'])
		self.gloss_total_attachment = gloss[0]
		self.gloss_pending_attachment = gloss[1]
		self.gloss_pass_ration = flt((gloss[2]), 2)
		self.gloss_undetermined_ratio = flt(gloss[3], 2)
		self.gloss_todo_ratio = flt((gloss[4]), 2)

		moisture = self.calculate_attachments_details("moisture_content_details_", 
												['master_sample', 'finished_board_1', 'finished_board_2', 'finished_board_3', 'finished_board_4'],
												['results_select_1', 'results_select_2', 'results_select_3', 'results_select_4'])
		self.moisture_total_attachment = moisture[0]
		self.moisture_pending_attachment = moisture[1]
		self.moisture_pass_ration = flt((moisture[2]), 2)
		self.moisture_undetermined_ratio = flt((moisture[3]), 2)
		self.moisture_todo_ratio = flt((moisture[4]), 2)

		open = self.calculate_attachments_details("open_box_inspection_details_", ['max_opening_photo','finished_board', 'master_depth_photo', 'depth_photo'],
											['bowing_select', 'ledging_overwood_select', 'max_opening_result','pad_away_select', 'master_depth_result','depth_result'])
		self.open_total_attachment = open[0]
		self.open_pending_attachment = open[1]
		self.open_pass_ration = flt((open[2]), 2)
		self.open_undetermined_ratio = flt(open[3], 2)
		self.open_todo_ratio = flt((open[4]), 2)

		width = self.calculate_attachments_details("width_and_thickness_details_", 
											 ['finished_board_2', 'finished_board_3', 'master_sample_matching_board'],
											 ['manual_select'])
		self.width_total_attachment = width[0]
		self.width_pending_attachment = width[1]
		self.width_pass_ration =flt(( width[2]), 2)
		self.width_undetermined_ratio = flt((width[3]), 2)
		self.width_todo_ratio = flt((width[4]), 2)

	def set_color_count_for_color_match_and_embossing(self):
		total_color = 0
		if self.get("no_of_po") and self.no_of_po > 0:
			for i in range(self.no_of_po):
				child_table_name="color_match_and_embossing_details_"+cstr(i+1)
				if len(self.get(child_table_name)) > 0:
					total_color = total_color + len(self.get(child_table_name))
		
		self.color_count = total_color

	@frappe.whitelist()
	def make_quality_control_item_using_tas_po_items(self, selected_items_list):
		print(selected_items_list, "=========selected_items_list", type(selected_items_list))
		
		# empty child table values
		total_no_of_child_table=10
		for idx in range(total_no_of_child_table):
			child_table_name="quality_control_item_"+cstr(idx+1)
			parent_po_field_name="tas_po_name_"+cstr(idx+1)
			self.set(child_table_name,[])
			self.set(parent_po_field_name,None)

		# get tas po items
		if selected_items_list:
			# tas_po_list = frappe.db.get_list(
			# 	"TAS Purchase Order Item",
			# 	parent_doctype="TAS Purchase Order",
			# 	filters={"name": ["in", items]},
			# 	fields=["name", "parent", "item_no", "item_desc", "qty", "color", "cost"],
			# )

			unique_tas_po = []
			for po in selected_items_list:
				if po.get('tas_po') not in unique_tas_po:
					unique_tas_po.append(po.get('tas_po'))

			self.no_of_po = len(unique_tas_po)

			# set tas po name
			for idx,unique in enumerate(unique_tas_po):
				parent_po_field_name="tas_po_name_"+cstr(idx+1)
				for po in selected_items_list:
					if unique == po.get('tas_po'):
						self.set(parent_po_field_name,unique)
						break

			#  set items
			for idx,unique in enumerate(unique_tas_po):
				for po in selected_items_list:
					if unique == po.get('tas_po'):
						item_doc = frappe.db.get_all("TAS Purchase Order Item",
								   parent_doctype="TAS Purchase Order",
								   filters={"parent": po.get('tas_po'), "item_no": po.get('item_no'), "custom_qty_ord": po.get('qty') },
								   fields=["name", "parent", "item_no", "item_desc", "custom_qty_ord", "color"],
								   limit=1
								   )
						
						if len(item_doc) > 0:
							child_table_name="quality_control_item_"+cstr(idx+1)
							po1 = self.append(child_table_name, {})
							# po1.item = po.item_no
							po1.item_name = item_doc[0].item_desc
							po1.qty = item_doc[0].custom_qty_ord
							po1.item_color = cstr(item_doc[0].item_no) + "-" +(cstr(item_doc[0].color).upper() or '')
							po1.tas_po_ref = item_doc[0].parent
							po1.tas_po_item_ref = item_doc[0].name

			self.set_pallet_details_table(unique_tas_po)

			self.set_po_ref_and_child_tables(unique_tas_po, "carton_po_", "inner_and_outer_carton_details_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_color_", "color_match_and_embossing_details_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_over_", "over_wax_and_edge_paint_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_gloss_", "gloss_level_details_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_moisture_", "moisture_content_details_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_open_", "open_box_inspection_details_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_width_", "width_and_thickness_details_")
			
			self.save(ignore_permissions=True)

		return self
	
	@frappe.whitelist()
	def make_quality_control_item_using_tas_po(self, tas_po):

		# empty child table values
		total_no_of_child_table=10
		for idx in range(total_no_of_child_table):
			child_table_name="quality_control_item_"+cstr(idx+1)
			parent_po_field_name="tas_po_name_"+cstr(idx+1)
			self.set(child_table_name,[])
			self.set(parent_po_field_name,None)

		if tas_po:
			tas_po_list = frappe.db.get_list(
				"TAS Purchase Order",
				filters={"name": ["in", tas_po]},
				fields=["name"],
			)

			unique_tas_po = []
			for po in tas_po_list:
				if po.name not in unique_tas_po:
					unique_tas_po.append(po.name)

			self.no_of_po = len(unique_tas_po)

			# set tas po name
			for idx,unique in enumerate(unique_tas_po):
				parent_po_field_name="tas_po_name_"+cstr(idx+1)
				for po in tas_po_list:
					if unique == po.name:
						self.set(parent_po_field_name,po.name)
						break
			#  set items
			for idx,unique in enumerate(unique_tas_po):
				for po in tas_po_list:
					if unique == po.name:
						child_table_name="quality_control_item_"+cstr(idx+1)
						
						not_used_items = frappe.db.sql(""" 
							SELECT ti.item_no ,ti.item_desc, ti.custom_qty_ord as qty , ti.color, ti.parent, ti.name  
								FROM `tabTAS Purchase Order Item` as ti 
								WHERE ti.parent = '{0}' 
								and ti.name NOT IN (SELECT qi.tas_po_item_ref FROM `tabQuality Control Item QI` as qi WHERE qi.docstatus = 1)
						""".format(po.name), as_dict=1)

						if (len(not_used_items) > 0):
							for item in not_used_items:
								po1 = self.append(child_table_name, {})
								po1.item_name = item.item_desc
								po1.qty = item.qty
								po1.item_color = cstr(item.item_no) + "-" + (cstr(item.color).upper() or '')
								po1.tas_po_ref = item.parent
								po1.tas_po_item_ref = item.name

						# po_doc = frappe.get_doc("TAS Purchase Order", po.name)
						
						# for item in po_doc.items:
						# 	po1 = self.append(child_table_name, {})
						# 	# po1.item = item.item_no
						# 	po1.item_name = item.item_desc
						# 	po1.qty = item.qty
						# 	# po1.color = item.color
						# 	# po1.amount = item.cost
						# 	po1.item_color = cstr(item.item_no) + "-" + (cstr(item.color) or 'red')
						# 	po1.tas_po_ref = item.parent
			
			self.set_pallet_details_table(unique_tas_po)

			self.set_po_ref_and_child_tables(unique_tas_po, "carton_po_", "inner_and_outer_carton_details_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_color_", "color_match_and_embossing_details_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_over_", "over_wax_and_edge_paint_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_gloss_", "gloss_level_details_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_moisture_", "moisture_content_details_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_open_", "open_box_inspection_details_")
			self.set_po_ref_and_child_tables(unique_tas_po, "po_width_", "width_and_thickness_details_")
			
			self.save(ignore_permissions=True)

		return self
	
	def set_po_ref_and_child_tables(self, po_list, parent_field, child_table):
		for idx,unique in enumerate(po_list):
			# parent po field
			parent_po_field_name=parent_field+cstr(idx+1)
			self.set(parent_po_field_name,unique)

			# child table
			qi_items_table = "quality_control_item_"+cstr(idx+1)
			child_table_name=child_table+cstr(idx+1)

			# clear child table
			self.get(child_table_name).clear()

			# set child table
			if len(self.get(qi_items_table)) > 0:
				for item in self.get(qi_items_table):
					row = self.append(child_table_name, {})
					row.item_color = item.item_color

	def set_pallet_details_table(self, po_list):
		if len(po_list) > 0:
			self.pallet_details = []
			for po in po_list:
				row = self.append("pallet_details")
				row.tas_po = po

	@frappe.whitelist()
	def set_default_values_and_guidelines(self):
		qi_settings = frappe.get_doc('Quality Inspection Settings QI')

		if qi_settings.pallet_default_value:
			self.default_corner_width = ">=" + cstr(qi_settings.pallet_default_value)

		# moisture equipment default value
		default_value = ""
		if self.moisture_equipment and len(self.moisture_equipment) > 0:
			default_value = frappe.db.get_value('Equipment QI', self.moisture_equipment, 'equipment_default_value')
		self.default_moisture = default_value

		# set guidelines
		if qi_settings.hide_pallet_information_guide == 0 and qi_settings.pallet_information_guide:
			self.pallet_information_guide = qi_settings.pallet_information_guide

		if qi_settings.hide_inner_outer_carton_guide == 0 and qi_settings.inner_outer_carton_guide:
			self.inner_outer_carton_guide = qi_settings.inner_outer_carton_guide
		
		if qi_settings.hide_color_match_embossing_guide == 0 and qi_settings.color_match_embossing_guide:
			self.color_match_embossing_guide = qi_settings.color_match_embossing_guide

		if qi_settings.hide_bevel_over_wax_guide == 0 and qi_settings.bevel_over_wax_guide:
			self.bevel_over_wax_guide = qi_settings.bevel_over_wax_guide

		if qi_settings.hide_gloss_level_guide == 0 and qi_settings.gloss_level_guide:
			self.gloss_level_guide = qi_settings.gloss_level_guide

		if qi_settings.hide_moisture_content_guide == 0 and qi_settings.moisture_content_guide:
			self.moisture_content_guide = qi_settings.moisture_content_guide

		if qi_settings.open_box_inspection_guide:
			self.open_box_inspection_guide = qi_settings.open_box_inspection_guide

		if qi_settings.width_thickness_guide:
			self.assembling_gap = qi_settings.width_thickness_guide

	def validate_over_wax_and_edge_paint_child_table(self):
		if self.get("no_of_po") and self.no_of_po > 0 and self.flooring_class != "RC/SPC/WPC/LVGD":
			items = []
			for i in range(self.no_of_po):
				child_table_name="over_wax_and_edge_paint_"+cstr(i+1)
				if len(self.get(child_table_name)) > 0:
					for row in self.get(child_table_name):
						if row.over_wax_select in FAIL_STATUS and not row.finished_board:
							a = "Table " + cstr(i+1) + " : Row " + cstr(row.idx) + " : " + cstr(row.item_color)							
							items.append(a)
			
			if len(items) > 0:
				joint_items = ",<br> ".join((ele if ele!=None else '') for ele in items)

				frappe.throw(
					msg=_("Please attach pictures for following : <br> {0}").format(joint_items),
					title=_("Finished board pictures are required for failed over wax."),
				)

	def validate_open_box_child_table(self):
		if self.get("no_of_po") and self.no_of_po > 0:
			items = []
			for i in range(self.no_of_po):
				child_table_name="open_box_inspection_details_"+cstr(i+1)
				if len(self.get(child_table_name)) > 0:
					for row in self.get(child_table_name):
						if row.pad_away_select in FAIL_STATUS and not row.finished_board:
							a = "Table " + cstr(i+1) + " : Row " + cstr(row.idx) + " : " + cstr(row.item_color)							
							items.append(a)
			
			if len(items) > 0:
				joint_items = ",<br> ".join((ele if ele!=None else '') for ele in items)

				frappe.throw(
					msg=_("Please attach pictures for following : <br> {0}").format(joint_items),
					title=_("Finished board pictures are required for failed pad."),
				)

	def create_child_table_list(self, child_table_name):
		child_table_list = []
		if self.no_of_po and self.no_of_po > 0:
			for i in range(self.no_of_po):
				child_table = child_table_name + cstr(i+1)
				child_table_list.append(child_table)

		return child_table_list
	
	# def check_missing_row_field_is_already_exists(self, row_ref, field_name):
	# 	row_exists = False
	# 	if len(self.missing_data_details) > 0:
	# 		for row in self.missing_data_details:
	# 			if row.row_ref == row_ref and row.field_name_ref == field_name:
	# 				row_exists = True
	# 				break

	# 	return row_exists

	def fill_missing_data_details(self):

		if self.workflow_state and self.workflow_state == "Completed" and len(self.missing_data_details) < 1:
			print("Inside Workflow State Condition")
			TABLE_LIST = [
				{"table_name": "pallet_details", "tab_name": "Pallet Information", "parent_name": "Tas PO Details"},
				{"table_name": "inner_and_outer_carton_details_", "tab_name": "Inner & Outer Carton", "parent_name": "po_over_"},
				{"table_name": "color_match_and_embossing_details_", "tab_name": "Color Match & Embossing", "parent_name": "po_color_"},
				{"table_name": "over_wax_and_edge_paint_", "tab_name": "Bevel, Over Wax & Edge Paint", "parent_name": "po_over_"},
				{"table_name": "gloss_level_details_", "tab_name": "Gloss Level", "parent_name": "po_gloss_"},
				{"table_name": "moisture_content_details_", "tab_name": "Moisture Content", "parent_name": "po_moisture_"},
				{"table_name": "open_box_inspection_details_", "tab_name": "Open Box Inspection", "parent_name": "po_open_"},
				{"table_name": "width_and_thickness_details_", "tab_name": "Width & Thickness", "parent_name": "po_width_"},
			]
			
			for table in TABLE_LIST:
				# print(table.get("table_name"), "==========================table.get(table_name)==============")
				if table.get("table_name") == "pallet_details":
					child_table_list = [table.get("table_name")]
				else:
					child_table_list = self.create_child_table_list(table.get("table_name"))

				if len(child_table_list) > 0:
					for child_table in child_table_list:
						if len(self.get(child_table)) > 0:

							### get row fields details from meta
							for row in self.get(child_table):
								
								######### using meta 
								row_fields = row.meta.fields
								
								for field in row_fields:
									# row_already_exists = self.check_missing_row_field_is_already_exists(row.name, field.fieldname)
									# print(row_already_exists, "=====================row_already_exists==================")

									missing_row_data = False
									if field.fieldtype in ["Attach", "Currency", "Data", "Date", "Datetime", "Float", "Int","Link", "Percent", "Select"] and field.hidden == 0:
										
										if table.get("table_name") == "inner_and_outer_carton_details_" and field.fieldname == "carb_select" and self.flooring_class == "RC/SPC/WPC/LVGD":
											missing_row_data = False

										elif table.get("table_name") == "over_wax_and_edge_paint_" and field.fieldname == "over_wax_select" and self.flooring_class == "RC/SPC/WPC/LVGD":
											missing_row_data = False

										elif table.get("table_name") == "over_wax_and_edge_paint_" and field.fieldname == "edge_paint_select" and self.flooring_class == "HARDWOOD FLOORING":
											missing_row_data = False
										
										elif table.get("table_name") == "pallet_details" and field.fieldname in ["corner_height","current_width", "width", "button_select"] and row.pallet_type != "Plywood":
											missing_row_data = False
										
										elif table.get("table_name") == "pallet_details" and field.fieldname in ["iipa", "ippc_photo"] and row.pallet_type != "Hardwood":
											missing_row_data = False

										elif field.fieldtype == "Data":
											if not row.get(field.fieldname) or row.get(field.fieldname) in TODO_STATUS:
												missing_row_data = True
											
										elif not row.get(field.fieldname):
											missing_row_data = True
									
									# print(missing_row_data, "=========================missing_row_data=====================")
									if missing_row_data == True:
										missing_row = self.append("missing_data_details", {})
										missing_row.table_row_no = row.idx
										missing_row.field_label = field.label
										missing_row.field_name_ref = field.fieldname
										missing_row.row_ref = row.name
										missing_row.tab_name = table.get("tab_name")

										if table.get("table_name") == "pallet_details":
											missing_row.po_or_item_color = row.tas_po
											missing_row.child_or_parent_name = table.get("parent_name")
										else:
											parent_field_name = table.get("parent_name") + child_table[-1]
											# print(parent_field_name, "==========")
											missing_row.po_or_item_color = row.item_color
											missing_row.child_or_parent_name = self.get(parent_field_name)

	def check_all_data_mark_as_completed(self):
		if self.workflow_state and self.workflow_state in ["Completed", "Pending Approval"] and len(self.missing_data_details) > 0:
			mark_as_completed = True

			for row in self.missing_data_details:
				if row.mark_as_completed == 0:
					mark_as_completed = False
					break
			
			if mark_as_completed == False:
				frappe.throw(_("Please mark all rows as 'Complete' in the Missing tab before proceeding."))

	def add_assign_to_user(self):
		if self.user:
			assignees = get_assignees({"doctype": self.doctype, "name": self.name})

			assign_to_found = False
			if len(assignees) > 0:
				for owner in assignees:
					if self.user == owner.owner:
						assign_to_found = True
						break

			if assign_to_found == False:
				add_assign({
				"doctype": self.doctype,
				"name": self.name,
				"assign_to": [self.user],
			})

	@frappe.whitelist()
	def add_new_tag(self, new_tag):
		if new_tag:
			if not frappe.db.exists("Quality Tags QI", new_tag):
				new_tag_doc = frappe.new_doc("Quality Tags QI")
				new_tag_doc.tags = new_tag
				new_tag_doc.save(ignore_permissions=True)
		
		return new_tag

	@frappe.whitelist()
	def fill_remarks_table(self, remarks):
		# print("========================fill_remarks_table======================", remarks)
		
		if remarks:
			data = remarks[0]
			# remarks = remarks.as_dict()
			# if data.get("notes"):
			print(data, "======data======")
			# if self.tags:
			# 	self.tags = self.tags + " ," + (data.get("tags") or '')
			# else:
			# self.tags = (self.tags or "") + (data.get("tags") or '')
			if data.get("tags") and len(data.get("tags")):
				for t in data.get("tags"):
					self.append("tags", {
						"tags": t.get("tags")
					})
					self.add_tag(t.get("tags"))
					

			print(self.tags, "==========self.tags====")

			if data.get("field_wise_notes") and len(data.get("field_wise_notes")) > 0:
				for d in data.get("field_wise_notes"):
					row = self.append("quality_remarks", {})
					row.action = self.workflow_state
					row.actor = frappe.session.user
					row.date_time = now()
					row.notes = d.get("notes")
					row.field_notes = d.get("tab_field")

			elif data.get("notes"):
				row = self.append("quality_remarks", {})
				row.action = self.workflow_state
				row.actor = frappe.session.user
				row.date_time = now()
				row.notes = data.get("notes")
				
				# field_details = []
				# if data.get("field_notes"):
				# 	for f in data.get("field_notes"):
				# 		field_details.append(f.get("tab_wise_field_name"))
				# 		# d = row.append("field_notes", {})
				# 		# d.tab_wise_field_name = f.get("tab_wise_field_name")
				
				# 	row.field_notes = ", ".join((ele if ele!=None else '') for ele in field_details)

			self.flags.ignore_validate = True
			self.save()
				# row.fields = data.get("field_notes") or None



@frappe.whitelist()
def get_tas_po(vendor):
	tas_po_list = frappe.db.sql("""
		SELECT tas.name as tas_po, tas.vendor From `tabTAS Purchase Order Item` as ti 
			INNER JOIN `tabTAS Purchase Order` as tas ON  tas.name = ti.parent 
			WHERE tas.vendor = '{0}' and 
			ti.name NOT IN (SELECT qi.tas_po_item_ref FROM `tabQuality Control Item QI` as qi WHERE qi.docstatus = 1) 
			GROUP BY tas_po;""".format(vendor), as_dict=1, debug=1)
	
	return tas_po_list

@frappe.whitelist()
def get_tas_po_items(vendor):	
	tas_po_items = frappe.db.sql("""
		SELECT tas.name as tas_po, ti.item_no, ti.custom_qty_ord as qty, ti.color, ti.name as item_name 
			From `tabTAS Purchase Order Item` as ti INNER JOIN `tabTAS Purchase Order` as tas ON  tas.name = ti.parent 
			WHERE tas.vendor = '{0}' 
							  and ti.name NOT IN (SELECT qi.tas_po_item_ref FROM `tabQuality Control Item QI` as qi WHERE qi.docstatus = 1);
	""".format(vendor), as_dict=1, debug=1)

	# SELECT tas.name as tas_po, tas.vendor From `tabTAS Purchase Order Item` as ti INNER JOIN `tabTAS Purchase Order` as tas ON  tas.name = ti.parent 
# WHERE tas.vendor = '001573' and ti.name NOT IN (SELECT qi.tas_po_item_ref FROM `tabQuality Control Item QI` as qi WHERE qi.docstatus = 1) GROUP BY tas_po;

	return tas_po_items

@frappe.whitelist()
def get_document_report_pdf(doc):
	import pdfkit

	if isinstance(doc, string_types):
		doc = json.loads(doc)

	# base_template_path = "frappe/www/printview.html"
	# html = frappe.get_template("quality_inspection/templates/document_report_pdf.html").render(dict(doc=doc))
	# html = frappe.render_template(
	# 			base_template_path,
	# 			{"body": html, "css": get_print_style(),"lang": frappe.local.lang, "title":"Quality Inspection Report"}
	# 		)

	template_path = "quality_inspection/templates/document_report_pdf.html"

	company = doc.get("company") or erpnext.get_default_company()
	letter_head = get_letter_head_name(company)
	header_html, footer_html = frappe.db.get_value("Letter Head", letter_head, ["content", "footer"])
	# print(footer_html, "==============footer_html====================", type(footer_html), "===========")

	html = frappe.render_template(template_path,  dict(doc=doc))
	# print(html, "================html")

	import tempfile

	header = tempfile.NamedTemporaryFile(delete=True,suffix='.html')
	with open(header.name, 'w') as h:
		h.write("""
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="UTF-8">
				</head>
				<body>
		  			{0}
				</body>
				</html>
				""".format(header_html.format(get_url=get_url())))
		
	footer = tempfile.NamedTemporaryFile(delete=True,suffix='.html')
	with open(footer.name, 'w') as f:
		f.write("""
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="UTF-8">
				</head>
				<body>
		 		 <br>
					{0}
				</body>
				</html>
				""".format(footer_html.format(get_url=get_url())))
	
	options = {
		'enable-internal-links': '',
		"page-size": "A3", 
		"margin-top": "28mm", "margin-right": "10mm", "margin-bottom": "30mm", "margin-left": "10mm",
		"disable-javascript": "", 
		"disable-local-file-access": "",
		'encoding': "UTF-8",
		'user-style-sheet': 'frappe/templates/styles/standard.css',
		'header-html': header.name,
		'header-right': '[page] of [topage]',
		'footer-html': footer.name,
		'footer-font-size': "9",
		'custom-header': [
        ('Accept-Encoding', 'gzip'),
    ],
	}

	# print(options, "==============before options")

	### cookies (for private images)
	options.update(get_cookie_options())
	html = inline_private_images(html)

	# print(options, "==============after options")

	# html, options = prepare_options(html, options)

	docname = doc.get("name")
	frappe.local.response.filename = "{name}.pdf".format(name=docname.replace(" ", "-").replace("/", "-"))
	# frappe.local.response.filecontent = get_pdf(html, options=options)

	frappe.local.response.filecontent = pdfkit.from_string(html, options=options or {}, verbose=True)
	frappe.local.response.type = "pdf"

	header.close()
	footer.close()


	# pdfkit.from_string(html, options=options or {}, verbose=True)

def get_letter_head_name(company):
	company_letter_head = frappe.db.get_value("Company", company, "default_letter_head")
	if company_letter_head:
		return company_letter_head
	else:
		default_letter_head = frappe.db.get_value("Letter Head", {"is_default": 1}, "name")
		return default_letter_head

@frappe.whitelist()
def doc_tab_wise_field_list():
	field_list = [
		{ 	"tab_name": "Pallet Information", "result_field_prefix": "pallet_", "table_fieldname": "pallet_details",
			"table_field_list": [
				{"label": "TAS PO", "fieldname": ["tas_po"], "width": "12.5%"},
				{"label": "Pallet Type", "fieldname": ["pallet_type"], "width": "12.5%"},
				{"label": "Installation ID", "fieldname": ["installation_id"], "width": "12.5%"},
				{"label": "Installation Status", "fieldname": ["installation_status"], "width": "12.5%"},
				{"label": "Corner Reading (inch)", "fieldname": ["corner_height","current_width"], "width": "12.5%"},
				{"label": "Corner Status", "fieldname": ["button_select"], "width": "12.5%"},
				{"label": "IIPA", "fieldname": ["iipa"], "width": "12.5%"},
				{"label": "Height Reading (cm)", "fieldname": ["height_reading"], "width": "12.5%"},
			],
			"attachment_fields": ["installation_photo", "width", "ippc_photo"]
		},
		{ 	"tab_name": "Inner & Outer Carton", "result_field_prefix": "inner_",  "tas_po_field": "carton_po_", "table_fieldname" : "inner_and_outer_carton_details_",
			"table_field_list": [
				{"label": "Carton Weight (lbs)", "fieldname": ["carton_weight"], "width": "8.33%"},
				{"label": "Country Of Origin", "fieldname": ["country_of_origin"], "width": "8.33%"},
				{"label": "Production Date", "fieldname": ["production_date"], "width": "8.33%"},
				{"label": "Hologram", "fieldname": ["hologram_select"], "width": "8.33%"},
				{"label": "Carb II", "fieldname": ["carb_select"], "width": "8.33%"},
				{"label": "Floor Score", "fieldname": ["floor_select"], "width": "8.33%"},
				{"label": "Inner/Outer Shrink wrap", "fieldname": ["shink_wrap_select"], "width": "8.33%"},
				{"label": "Insert Sheet", "fieldname": ["insert_sheet_select"], "width": "8.33%"},
				{"label": "Title IV", "fieldname": ["title_iv"], "width": "8.33%"},
				{"label": "Production Run No.#", "fieldname": ["production_run_no"], "width": "8.33%"},
				{"label": "Mfg Production Run#", "fieldname": ["mfg_production_run"], "width": "8.33%"},
				{"label": "Item# matches IR TAG", "fieldname": ["item_matches_ir_tag"], "width": "8.33%"},
			],
			"attachment_fields": ["end_label"]
		},
		{ 	"tab_name": "Color Match & Embossing", "result_field_prefix": "color_",  "tas_po_field": "po_color_", "table_fieldname" : "color_match_and_embossing_details_",
			"table_field_list": [
				{"label": "Result", "fieldname": ["results_select"], "width": "33.33%"},
				{"label": "Embossing", "fieldname": ["embossing_select"], "width": "33.33%"},
				{"label": "Pattern Repeat", "fieldname": ["pattern_repeat"], "width": "33.33%"},
			],
			"attachment_fields": ["master_sample", "finished_board", "pattern_repeat_photo"]
		},
		{ 	"tab_name": "Bevel, Over Wax & Edge Paint", "result_field_prefix": "over_",  "tas_po_field": "po_over_", "table_fieldname" : "over_wax_and_edge_paint_",
			"table_field_list": [
				{"label": "Bevel", "fieldname": ["bevel"], "width": "33.33%"},
				{"label": "Over Wax", "fieldname": ["over_wax_select"], "width": "33.33%"},
				{"label": "Edge Paint", "fieldname": ["edge_paint_select"], "width": "33.33%"},
			],
			"attachment_fields": ['finished_board'],
		},
		{ 	"tab_name": "Gloss Level", "result_field_prefix": "gloss_",  "tas_po_field": "po_gloss_", "table_fieldname" : "gloss_level_details_",
			"table_field_list": [
				{"label": "Master Sample", "fieldname": ["master_gl"], "width": "12%"},
				{"label": "Matched", "fieldname": ["fb_gl_1", "results_select_1"], "width": "17.6%"},
				{"label": "Highest Matched", "fieldname": ["fb_gl_2", "results_select_2"], "width": "17.6%"},
				{"label": "Lowest Matched", "fieldname": ["fb_gl_3", "results_select_3"], "width": "17.6%"},
				{"label": "Average Plank 1", "fieldname": ["fb_gl_4", "results_select_4"], "width": "17.6%"},
				{"label": "Average Plank 2", "fieldname": ["fb_gl_5", "results_select_5"], "width": "17.6%"},
			],
			"attachment_fields": ['master_sample', 'finished_board_1', 'finished_board_2', 'finished_board_3', 'finished_board_4', 'finished_board_5'],
		},
		{ 	"tab_name": "Moisture Content", "result_field_prefix": "moisture_",  "tas_po_field": "po_moisture_", "table_fieldname" : "moisture_content_details_",
			"table_field_list": [
				{"label": "Moisture Content", "fieldname": ["current_moisture"], "width": "12%"},
				{"label": "Finished Board 1", "fieldname": ["current_1", "results_select_1"], "width": "17.6%"},
				{"label": "Finished Board 2", "fieldname": ["current_2", "results_select_2"], "width": "17.6%"},
				{"label": "Finished Board 3", "fieldname": ["current_3", "results_select_3"], "width": "17.6%"},
				{"label": "Finished Board 4", "fieldname": ["current_4", "results_select_4"], "width": "17.6%"},
			],
			"attachment_fields": ['master_sample', 'finished_board_1', 'finished_board_2', 'finished_board_3', 'finished_board_4'],
		},
		{ 	"tab_name": "Open Box Inspection", "result_field_prefix": "open_",  "tas_po_field": "po_open_", "table_fieldname" : "open_box_inspection_details_",
			"table_field_list": [
				{"label": "Bowing", "fieldname": ["bowing_select"], "width": "16.6%"},
				{"label": "Ledging Overwood", "fieldname": ["ledging_overwood_select"], "width": "16.6%"},
				{"label": "Max Opening Between Boards", "fieldname": ["max_opening", "max_opening_result"], "width": "16.6%"},
				{"label": "Pad Away From the Locking System", "fieldname": ["pad_away_select"], "width": "16.6%"},
				{"label": "Master Depth for BP Press", "fieldname": ["master_bp_press_depth", "master_depth_result"], "width": "16.6%"},
				{"label": "Depth for BP Press", "fieldname": ["bp_press_depth", "depth_result"], "width": "16.6%"},
			],
			"attachment_fields": ['max_opening_photo','finished_board', 'master_depth_photo', 'depth_photo'],
		}, 
		{ 	"tab_name": "Width & Thickness", "result_field_prefix": "width_",  "tas_po_field": "po_width_", "table_fieldname" : "width_and_thickness_details_",
			"table_field_list": [
				{"label": "Length (mm)", "fieldname": ["length"], "width": "20%"},
				{"label": "Width (mm)", "fieldname": ["width_1"], "width": "20%"},
				{"label": "Thickness without padding", "fieldname": ["thickness_without_padding_1"], "width": "20%"},
				{"label": "Thickness with Padding", "fieldname": ["thickness_with_padding_1"], "width": "20%"},
				{"label": "Manual Pull Test", "fieldname": ["manual_select"], "width": "20%"},
			],
			"attachment_fields": ['finished_board_2', 'finished_board_3', 'master_sample_matching_board'],
		},
	]
	return field_list

@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_qi_users_list(doctype, txt, searchfield, start, page_len, filters):
	from frappe.core.doctype.role.role import get_users

	qi_user_internal = get_users("Quality User Internal")
	qi_user_external = get_users("Quality User External")

	user_list = list(set(qi_user_internal + qi_user_external))

	users = frappe.get_all("User", filters={"enabled":1, "email": ("like", f"{txt}%"), "name": ["in", user_list]}, fields=["distinct name", "full_name"], as_list=1)
	# print(users, "=============users=============")
	unique = tuple(set(users))
	return unique
