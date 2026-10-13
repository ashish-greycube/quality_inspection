frappe.ui.form.on("TAS Purchase Order", {
    custom_is_qc_critical(frm) {
        add_qc_critical_items_in_table(frm);
    }
})

// same logic as quality_inspection.api.add_items_in_qc_critical_table_in_tas_po (runs on validate)
function add_qc_critical_items_in_table(frm) {
    if (frm.doc.custom_is_qc_critical == 1) {
        let qc_critical_details = frm.doc.custom_qc_critical_details || []
        if (qc_critical_details.length != (frm.doc.items || []).length) {
            for (const row of frm.doc.items || []) {
                if (!qc_critical_details.some(d => d.item_no == row.item_no && d.color == row.color)) {
                    frm.add_child("custom_qc_critical_details", {
                        item_no: row.item_no,
                        color: row.color,
                        item_name: row.item_desc,
                    });
                }
            }
            frm.refresh_field("custom_qc_critical_details");
        }
    }
}
