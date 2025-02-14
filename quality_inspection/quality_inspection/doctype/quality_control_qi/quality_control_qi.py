# Copyright (c) 2024, GreyCube Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from frappe.utils import cstr, flt

PASS_STATUS = ["Pass"]
class QualityControlQI(Document):

	def onload(self):
		self.get_pallet_information_html()

	def validate(self):
		self.set_attachments_details()
		self.set_color_count_for_color_match_and_embossing()
		# self.validate_over_wax_and_edge_paint_child_table()
		
	def get_pallet_information_html(self):

		template_path = "templates/pallet_information.html"

		pallet_html = frappe.render_template(template_path,  
									   dict(total_attach=self.pallet_total_attachment, pending=self.pallet_pending_attachment, pass_ration=self.pallet_pass_ration,color=None))  
		inner_outer_html = frappe.render_template(template_path,  
										dict(total_attach=self.inner_total_attachment, pending=self.inner_pending_attachment, pass_ration=self.inner_pass_ration,color=None))
		color_match_html = frappe.render_template(template_path,
										dict(total_attach=self.color_total_attachment, pending=self.color_pending_attachment, pass_ration=self.color_pass_ration,color=self.color_count))
		over_wax_html = frappe.render_template(template_path,  
										dict(total_attach=self.over_total_attachment, pending=self.over_pending_attachment, pass_ration=self.over_pass_ration,color=None))
		gloss_level_html = frappe.render_template(template_path,  
										dict(total_attach=self.gloss_total_attachment, pending=self.gloss_pending_attachment, pass_ration=self.gloss_pass_ration,color=None))
		moisture_html = frappe.render_template(template_path,  
										dict(total_attach=self.moisture_total_attachment, pending=self.moisture_pending_attachment, pass_ration=self.moisture_pass_ration,color=None))
		open_box_html = frappe.render_template(template_path,  
										dict(total_attach=self.open_total_attachment, pending=self.open_pending_attachment, pass_ration=self.open_pass_ration,color=None))
		width_thickness_html = frappe.render_template(template_path,  
										dict(total_attach=self.width_total_attachment, pending=self.width_pending_attachment, pass_ration=self.width_pass_ration,color=None))

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

		if self.no_of_po > 0:
			if child_table == "pallet_details":
				total_select_fields = len(self.pallet_details)	

				for row in self.get(child_table):

					for attach in attach_field_list:
						if not row.get(attach):
							pendings = pendings + 1
						total_attachments = total_attachments + 1

					for select in select_field_list:
						if row.get(select) in PASS_STATUS:
							total_pass = total_pass + 1

				print(total_pass, '---total_pass', total_select_fields, '---total_select_fields')
				pass_ration = (total_pass * 100/ total_select_fields) 

			else:	
				total_select_fields = self.no_of_po * len(select_field_list)

				for i in range(self.no_of_po):
					child_table_name=child_table+cstr(i+1)
					if len(self.get(child_table_name)) > 0:
						for row in self.get(child_table_name):

							for attach in attach_field_list:
								if not row.get(attach):
									pendings = pendings + 1
								total_attachments = total_attachments + 1

							for select in select_field_list:
								if row.get(select) in PASS_STATUS:
									total_pass = total_pass + 1

				pass_ration = (total_pass * 100/ total_select_fields) 
		
		print(pass_ration, '---pass_ration')

		return total_attachments, pendings, pass_ration
	
	def set_attachments_details(self):
		pallet = self.calculate_attachments_details("pallet_details", ['width', 'height'], ['button_select'])
		self.pallet_total_attachment = pallet[0]
		self.pallet_pending_attachment = pallet[1]
		self.pallet_pass_ration = flt((pallet[2]), 2)

		inner = self.calculate_attachments_details("inner_and_outer_carton_details_", ['end_label'],
											 ['hologram_select', 'carb_select', 'floor_select', 'shink_wrap_select', 'insert_sheet_select'])
		self.inner_total_attachment = inner[0]
		self.inner_pending_attachment = inner[1]
		self.inner_pass_ration = flt((inner[2]), 2)

		color = self.calculate_attachments_details("color_match_and_embossing_details_", ['master_sample', 'finished_board'], ['results_select', 'embossing_select'])
		self.color_total_attachment = color[0]
		self.color_pending_attachment = color[1]
		self.color_pass_ration = flt((color[2]), 2)

		over = self.calculate_attachments_details("over_wax_and_edge_paint_", ['finished_board'], ['over_wax_select', 'edge_paint_select'])
		self.over_total_attachment = over[0]
		self.over_pending_attachment = over[1]
		self.over_pass_ration = flt((over[2]), 2)

		gloss = self.calculate_attachments_details("gloss_level_details_", ['master_sample', 'finished_board_1', 'finished_board_2', 'finished_board_3', 'finished_board_4'], 
											 ['results_select_1', 'results_select_2', 'results_select_3', 'results_select_4'])
		self.gloss_total_attachment = gloss[0]
		self.gloss_pending_attachment = gloss[1]
		self.gloss_pass_ration = flt((gloss[2]), 2)

		moisture = self.calculate_attachments_details("moisture_content_details_", 
												['master_sample', 'finished_board_1', 'finished_board_2', 'finished_board_3', 'finished_board_4'],
												['results_select_1', 'results_select_2', 'results_select_3', 'results_select_4'])
		self.moisture_total_attachment = moisture[0]
		self.moisture_pending_attachment = moisture[1]
		self.moisture_pass_ration = flt((moisture[2]), 2)

		open = self.calculate_attachments_details("open_box_inspection_details_", ['finished_board'],
											['bowing_select', 'squareness_select', 'ledging_overwood_select', 'pad_away_select'])
		self.open_total_attachment = open[0]
		self.open_pending_attachment = open[1]
		self.open_pass_ration = flt((open[2]), 2)

		width = self.calculate_attachments_details("width_and_thickness_details_", 
											 ['finished_board_1', 'finished_board_2', 'finished_board_3', 'master_sample_matching_board'],
											 ['manual_select'])
		self.width_total_attachment = width[0]
		self.width_pending_attachment = width[1]
		self.width_pass_ration =flt(( width[2]), 2)

	def set_color_count_for_color_match_and_embossing(self):
		total_color = 0
		if self.no_of_po > 0:
			for i in range(self.no_of_po):
				child_table_name="color_match_and_embossing_details_"+cstr(i+1)
				if len(self.get(child_table_name)) > 0:
					total_color = total_color + len(self.get(child_table_name))
		
		self.color_count = total_color

	@frappe.whitelist()
	def make_quality_control_item_using_tas_po_items(self, items):

		# empty child table values
		total_no_of_child_table=10
		for idx in range(total_no_of_child_table):
			child_table_name="quality_control_item_"+cstr(idx+1)
			parent_po_field_name="tas_po_name_"+cstr(idx+1)
			self.set(child_table_name,[])
			self.set(parent_po_field_name,None)

		# get tas po items
		if items:
			tas_po_list = frappe.db.get_list(
				"TAS Purchase Order Item",
				parent_doctype="TAS Purchase Order",
				filters={"name": ["in", items]},
				fields=["name", "parent", "item_no", "item_desc", "qty", "color", "cost"],
			)

			unique_tas_po = []
			for po in tas_po_list:
				if po.parent not in unique_tas_po:
					unique_tas_po.append(po.parent)

			self.no_of_po = len(unique_tas_po)

			# set tas po name
			for idx,unique in enumerate(unique_tas_po):
				parent_po_field_name="tas_po_name_"+cstr(idx+1)
				for po in tas_po_list:
					if unique == po.parent:
						self.set(parent_po_field_name,po.parent)
						break
			#  set items
			for idx,unique in enumerate(unique_tas_po):
				for po in tas_po_list:
					if unique == po.parent:
						child_table_name="quality_control_item_"+cstr(idx+1)
						po1 = self.append(child_table_name, {})
						po1.item = po.item_no
						po1.item_name = po.item_desc
						po1.color = po.color
						po1.amount = po.cost
						po1.item_color = cstr(po.item_no) + (cstr(po.color) or 'red')
						po1.tas_po_ref = po.parent

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
						po_doc = frappe.get_doc("TAS Purchase Order", po.name)

						for item in po_doc.items:
							po1 = self.append(child_table_name, {})
							po1.item = item.item_no
							po1.item_name = item.item_desc
							po1.color = item.color
							po1.amount = item.cost
							po1.item_color = cstr(item.item_no) + "-" + (cstr(item.color) or 'red')
							po1.tas_po_ref = item.parent
			
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

			# moisture equipment default value
			defauly_value = ""
			if len(self.moisture_equipment) > 0:
				for e in self.moisture_equipment:
					if e.equipment == "Pin Meter":
						defauly_value = "6-9%"
						break
					elif e.equipment == "Surface Meter":
						defauly_value = "9-12%"
						break

			# clear child table
			self.get(child_table_name).clear()

			# set child table
			if len(self.get(qi_items_table)) > 0:
				for item in self.get(qi_items_table):
					row = self.append(child_table_name, {})
					row.item_color = item.item_color

					if child_table_name == "moisture_content_details_" + cstr(idx+1):
						row.default_moisture = defauly_value

	def set_pallet_details_table(self, po_list):
		pallet_default_value = frappe.db.get_single_value('Quality Assurance Settings QI', 'pallet_default_value')

		if len(po_list) > 0:
			self.pallet_details = []
			for po in po_list:
				row = self.append("pallet_details")
				row.tas_po = po
				row.default_width = ">=" + cstr(pallet_default_value)


	def validate_over_wax_and_edge_paint_child_table(self):
		if self.no_of_po > 0:
			for i in range(self.no_of_po):
				child_table_name="over_wax_and_edge_paint_"+cstr(i+1)
				if len(self.get(child_table_name)) > 0:
					for row in self.get(child_table_name):
						print(PASS_STATUS, '---PASS_STATUS')
						if row.over_wax_select not in PASS_STATUS and not row.finished_board:
							frappe.msgprint(_("In Over Wax Child Table, For {0} Item, Finished Board Picture is Require.").format(row.item_color), alert=True)
