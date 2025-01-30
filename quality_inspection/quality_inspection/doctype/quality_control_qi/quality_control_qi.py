# Copyright (c) 2024, GreyCube Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc

class QualityControlQI(Document):
	@frappe.whitelist()
	def make_quality_control_item_using_tas_po_items(self, items):
		if items:
			tas_po_list = frappe.db.get_list(
				"TAS Purchase Order Item",
				parent_doctype="TAS Purchase Order",
				filters={"name": ["in", items]},
				fields=["name", "parent", "item_no", "item_desc", "qty", "color", "cost"],
			)

			self.quality_control_item = []

			for item in tas_po_list:
				self.append(
					"quality_control_item",
					{
						"item": item.item_no,
						"item_name": item.item_desc,
						"qty": item.qty,
						"color": item.color,
						"amount": item.cost,
						"tas_po_ref": item.parent,
					},
				)

		print(items, "=======tas_po========")
		print(tas_po_list, "=======tas_po_list========")
		return self
	
	@frappe.whitelist()
	def make_quality_control_item_using_tas_po(self, tas_po):
		if tas_po:
			tas_po_list = frappe.db.get_list(
				"TAS Purchase Order",
				filters={"name": ["in", tas_po]},
				fields=["name"],
			)
			print(tas_po, "=======tas_po========")
			print(tas_po_list, "=======tas_po_list========")

			self.quality_control_item = []
			for po in tas_po_list:
				po_doc = frappe.get_doc("TAS Purchase Order", po.name)

				for item in po_doc.items:
					print(item.item_no, "=======item========")
					self.append(
						"quality_control_item",
					{
						"item": item.item_no,
						"item_name": item.item_desc,
						"qty": item.qty,
						"color": item.color,
						"amount": item.cost,
						"tas_po_ref": item.parent,
					},
					)

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