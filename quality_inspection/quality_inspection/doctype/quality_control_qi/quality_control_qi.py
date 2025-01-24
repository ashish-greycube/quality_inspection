# Copyright (c) 2024, GreyCube Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc

class QualityControlQI(Document):
	pass

@frappe.whitelist()
def make_quality_inspection_order(source_name,target_doc=None, ignore_permissions=False, args=None):
	if args is None:
		args = {}
	# if isinstance(args, str):
	# 	args = json.loads(args)

	def postprocess(source, target):
		doc = frappe.get_doc('TAS Purchase Order', source_name)

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

	def select_item(d):
		filtered_items = args.get("filtered_children", [])
		print(filtered_items, "====filtered_items===")
		child_filter = d.name in filtered_items if filtered_items else True
		print(d.name, "====d.name===")
		print(child_filter, "====child_filter===")
		# qty = d.received_qty or d.ordered_qty

		return child_filter
	
	print(select_item, "====select_item===")

	doclist = get_mapped_doc(
		"TAS Purchase Order",
		source_name,
		{
			"TAS Purchase Order": {
				"doctype": "Quality Control QI",
			},
			"TAS Purchase Order Item": {
				"doctype": "Quality Control Item QI",
				"field_map": [
					["item_no", "item"],
					["item_desc", "item_name"],
					["qty", "qty"],
					["color", "color"],
					["cost", "amount"],
				],
				# "condition": lambda doc: len(doc.name) < 0,
				"condition": select_item,
			},
		},
		target_doc,
		postprocess,
		ignore_permissions=ignore_permissions,
	)

	print(doclist, "=======doclist========")

	return doclist