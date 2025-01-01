// Copyright (c) 2024, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on("Quality Control QI", {
	refresh(frm) {
        if (!frm.is_new()) {
			frm.add_custom_button(__("TAS Po"), function() {
            //     select_multiple_po(frm)

            let d = erpnext.utils.map_current_doc({
                method: "",
                source_doctype: "TAS Purchase Order",
                target: frm,
                setters: [
                    {
                        label: "Vendor",
                        fieldname: "vendor",
                        fieldtype: "Link",
                        options: "Supplier",
                        default: frm.doc.vendor || undefined,
                    },
                ],
                get_query_filters: {
                    vendor: frm.doc.vendor,
                    docstatus: 0,
                    // status: ["!=", "Lost"],
                },
            });

            console.log(d, '=====d')

            // setTimeout(() => {
            //     d.$parent.append(`
            //         <span class='small text-muted'>
            //             ${__("Note: Please create.")}
            //         </span>
            // `);
            // }, 200);
			})

		}  
	},
});

let select_multiple_po = function (frm) {
    new frappe.ui.form.MultiSelectDialog({
        doctype: "TAS Purchase Order",
        target: frm,
        date_field: 'date_of_inspection',
        add_filters_group: 1,
        setters: {
            status: '',
        },
        columns: ["name"],
        get_query() {
            let filters = {
                docstatus: 0,
            };
            
            console.log(filters, '--')
            return {
                filters: filters,
            };
        },
        action(selections) {
            console.log(selections, '---selections')
            // const plan_name = frm.doc.__newname;
            // frappe
            //     .call({
            //         method: "set_job_requisitions",
            //         doc: frm.doc,
            //         args: selections,
            //     })
            //     .then(() => {
            //         // hack to retain prompt name that gets lost on frappe.call
            //         frm.doc.__newname = plan_name;
            //         refresh_field("staffing_details");
            //     });

            cur_dialog.hide();
        },
    });
}
