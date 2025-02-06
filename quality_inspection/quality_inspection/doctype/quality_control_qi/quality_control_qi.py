# Copyright (c) 2024, GreyCube Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from frappe.utils import cstr

class QualityControlQI(Document):

	def onload(self):
		self.get_pallet_information_html()

	def get_pallet_information_html(self):
		pallet_default_value = frappe.db.get_single_value('Quality Assurance Settings TAS', 'pallet_default_value')
		if pallet_default_value:
			template_path = "templates/pallet_information.html"
			html = frappe.render_template(template_path,  dict(minimum=pallet_default_value))  
			# print(html, '---html')  
			self.set_onload("pallet_html", html) 

	@frappe.whitelist()
	def make_quality_control_item_using_tas_po_items(self, items):

		# empty child table values
		total_no_of_child_table=10
		for idx in range(total_no_of_child_table):
			child_table_name="quality_control_item_"+cstr(idx+1)
			child_table_tas_po_name_name="tas_po_name_"+cstr(idx+1)
			self.set(child_table_name,[])
			self.set(child_table_tas_po_name_name,None)

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
				child_table_tas_po_name_name="tas_po_name_"+cstr(idx+1)
				for po in tas_po_list:
					if unique == po.parent:
						print(po.parent)			
						self.set(child_table_tas_po_name_name,po.parent)
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
						po1.item_color = cstr(po.item_no) + cstr(po.color)
						po1.tas_po_ref = po.parent
			
			self.save(ignore_permissions=True)

		# 	self.quality_control_item_1 = []

		# 	for item in tas_po_list:
		# 		self.append(
		# 			"quality_control_item_1",
		# 			{
		# 				"item": item.item_no,
		# 				"item_name": item.item_desc,
		# 				"qty": item.qty,
		# 				"color": item.color,
		# 				"amount": item.cost,
		# 				"tas_po_ref": item.parent,
		# 			},
		# 		)

		# print(items, "=======tas_po========")
		# print(tas_po_list, "=======tas_po_list========")
		return self
	
	@frappe.whitelist()
	def make_quality_control_item_using_tas_po(self, tas_po):
		# empty child table values
		total_no_of_child_table=10
		for idx in range(total_no_of_child_table):
			child_table_name="quality_control_item_"+cstr(idx+1)
			child_table_tas_po_name_name="tas_po_name_"+cstr(idx+1)
			self.set(child_table_name,[])
			self.set(child_table_tas_po_name_name,None)

		if tas_po:
			tas_po_list = frappe.db.get_list(
				"TAS Purchase Order",
				filters={"name": ["in", tas_po]},
				fields=["name"],
			)
			print(tas_po, "=======tas_po========")
			print(tas_po_list, "=======tas_po_list========")

			unique_tas_po = []
			for po in tas_po_list:
				if po.name not in unique_tas_po:
					unique_tas_po.append(po.name)

			self.no_of_po = len(unique_tas_po)

			# set tas po name
			for idx,unique in enumerate(unique_tas_po):
				child_table_tas_po_name_name="tas_po_name_"+cstr(idx+1)
				for po in tas_po_list:
					if unique == po.name:
						print(po.name)			
						self.set(child_table_tas_po_name_name,po.name)
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
							po1.item_color = cstr(po.item_no) + cstr(po.color)
							po1.tas_po_ref = item.parent
			
			self.save(ignore_permissions=True)

			# self.quality_control_item_1 = []
			# for po in tas_po_list:
			# 	po_doc = frappe.get_doc("TAS Purchase Order", po.name)

			# 	for item in po_doc.items:
			# 		print(item.item_no, "=======item========")
			# 		self.append(
			# 			"quality_control_item_1",
			# 		{
			# 			"item": item.item_no,
			# 			"item_name": item.item_desc,
			# 			"qty": item.qty,
			# 			"color": item.color,
			# 			"amount": item.cost,
			# 			"tas_po_ref": item.parent,
			# 		},
			# 		)

		return self

@frappe.whitelist()
def make_quality_inspection_order(source_name,target_doc=None, ignore_permissions=False):

	# def postprocess(source, target):
		# doc = frappe.get_doc('TAS Purchase Order', source_name)

		# supplier_items = []
		# for d in target.quality_control_item:
		# 	supplier_items.append(d)

		# target.quality_control_item = supplier_items
		# target_doc.run_method("set_missing_values")
		# for item in doc.items:
		# 	row = target.append('quality_control_item', {})
		# 	row.item = item.item_no
		# 	row.item_name = item.item_desc
		# 	row.qty = item.qty
		# 	row.color = item.color
		# 	row.amount = item.cost
	
	doclist = get_mapped_doc(
		from_doctype="TAS Purchase Order",
		from_docname=source_name,
		target_doc=target_doc,
		table_maps={
			"TAS Purchase Order": {
				"doctype": "Quality Control QI",
				"field_map": [["name","tas_po_ref"]],
			},
			"TAS Purchase Order Item": {
				"doctype": "Quality Control Item QI",
				"field_map": [
					["item_no", "item"],
					["item_desc", "item_name"],
					["qty", "qty"],
					["color", "color"],
					["cost", "amount"],
					["parent", "tas_po_ref"],
				],
				# "condition": lambda doc: len(doc.name) < 0,
				"condition": lambda doc: doc.qty > 0,
			},
		},
		ignore_permissions=ignore_permissions,
	)

	print(doclist, "=======doclist========")

	return doclist