frappe.ui.form.on("TAS Purchase Order", {
   refresh(frm) {
    frm.set_query('item_no', 'custom_qc_critical_details', (doc, cdt, cdn) => {
    return {
        query: "quality_inspection.api.get_tas_po_items", 
        filters: {
            tas_po: frm.doc.name
        }
    }
})
   }
})

frappe.ui.form.on("TAS QC Critical Details QI", {
    item_no(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (!row.item_no) {
            frappe.model.set_value(cdt, cdn, { color: "", item_name: "" });
            return;
        }
        // pick the first PO item with this item_no whose color is not already in the QC critical table
        let used_colors = (frm.doc.custom_qc_critical_details || [])
            .filter(d => d.name != row.name && d.item_no == row.item_no)
            .map(d => d.color);
        let po_item = (frm.doc.items || []).find(d => d.item_no == row.item_no && !used_colors.includes(d.color));
        if (po_item) {
            frappe.model.set_value(cdt, cdn, {
                color: po_item.color,
                item_name: po_item.item_desc,
            });
        }
    }
})