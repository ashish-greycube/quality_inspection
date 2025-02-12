// Copyright (c) 2024, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on("Quality Control QI", {
    refresh(frm) {

        set_button_color_in_pallet_info(frm)
        if (!frm.is_new()) {
            frm.add_custom_button(__("TAS Po"), function () {

                if (frm.doc.vendor == "" || frm.doc.vendor == undefined) {
                    frappe.throw("Please select vendor first!")
                }
                else {
                    new frappe.ui.form.MultiSelectDialog({
                        doctype: "TAS Purchase Order",
                        target: cur_frm,
                        setters: {
                            vendor: frm.doc.vendor || undefined,
                        },
                        add_filters_group: 1,
                        // date_field: "transaction_date",
                        allow_child_item_selection: 1,
                        child_fieldname: "items",
                        child_columns:  ["item_no", "qty", "color"],
                        // get_query() {
                        //     return {
                        //         filters: { docstatus: ['!=', 2] }
                        //     }
                        // },
                        action(selections, args) {
                            if (args.filtered_children.length > 0 && selections.length > 0){
                                frappe
                                .call({
                                    method: "make_quality_control_item_using_tas_po_items",
                                    doc: frm.doc,
                                    args: args.filtered_children,
                                })
                                .then(() => {
                                    console.log("--data--")
                                    refresh_field("tas_po_name_1");
                                });
                            }
                            else if (selections.length > 0){
                                frappe
                                .call({
                                    method: "make_quality_control_item_using_tas_po",
                                    doc: frm.doc,
                                    args: selections,
                                })
                                .then(() => {
                                    console.log("--data11111111--")
                                    refresh_field("quality_control_item_1");
                                });
                            }

				            cur_dialog.hide();
                            console.log(selections, '====selections')
                            console.log(args, '====args')
                            // console.log(args.filtered_children); // list of selected item names
                        }
                    });

                    // setTimeout(() => {
                    //     d.$parent.append(`
                    //         <span class='small text-muted'>
                    //             ${__("Note: Please create.")}
                    //         </span>
                    // `);
                    // }, 200);
                }

            })
        }
    },

    onload: function (frm) {
        set_html_details(frm)
        // let a = setInterval(() => {
        //     console.log("-----interval--------")
        //     if(frm.fields_dict.pallet_details.grid.wrapper.find('.editable-row').length > 0){
        //         frm.fields_dict.pallet_details.grid.wrapper.find('.editable-row').click()
        //         clearInterval(a);
        //     }

        // }, 100);
        
    }
});

let make_html =  function(frm, field_name, html_details){
    if (
        frm.fields_dict[field_name] &&
        frm.is_new() == undefined &&
        frm.doc.__onload && html_details in frm.doc.__onload
    ) {
        frm.set_df_property(field_name, 'options', frm.doc.__onload[html_details])
        frm.refresh_field(field_name)
    }else{
        frm.set_df_property(field_name, 'options', "<div><div>")
        frm.refresh_field(field_name)
    }
}


let set_html_details = function(frm){

    make_html(frm, "pallet", "pallet_html")
    make_html(frm, "inner", "inner_outer_html")
    make_html(frm, "color", "color_match_html")
    make_html(frm, "over_wax", "over_wax_html")
    make_html(frm, "gloss_level", "gloss_level_html")
    make_html(frm, "moisture", "moisture_html")
    make_html(frm, "open_box", "open_box_html")
    make_html(frm, "width_thick", "width_thickness_html")
    
}


frappe.ui.form.on("Pallet Information QI", {
    pallet_details_add: function (frm, cdt, cdn) {
        setTimeout(() => {
            console.log("click")
            frm.fields_dict.pallet_details.grid.wrapper.find('.editable-row').click()
        }, 100);

        set_button_color_in_pallet_info(frm, cdt, cdn)
    },
    status: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn]
        let table_name = frm.fields_dict.pallet_details.grid.wrapper
        let button_select = row.button_select
        let row_idx = row.idx
        let fieldname1 = '[data-fieldname="status"].btn-xs'
        // change_button_status_in_pallet_info(frm, cdt, cdn)
        // row.click()
        change_button_css(frm, cdt, cdn, table_name, button_select, row_idx, fieldname1)
    },
    form_render(frm, cdt, cdn) {
        let row = locals[cdt][cdn]
        console.log(row, '---row')

        // let button_select = row.button_select
        setTimeout(() => {
            frm.fields_dict.pallet_details.grid.wrapper.find('.form-in-grid').click()
        }, 100);
    }
})

let change_button_status_in_pallet_info = function (frm, cdt, cdn) {
    let row = locals[cdt][cdn]
    let button_select = row.button_select

    let row_idx = row.idx
    let fieldname1 = '[data-fieldname="status"].btn-xs'

    setTimeout(() => {
        frm.fields_dict.pallet_details.grid.wrapper.find('.grid-row').click()
    }, 100);

    console.log(button_select, '----------button_select')
    switch (button_select) {
        case "To Do":
            frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#76885B");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Pass");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'Pass')
            // frm.refresh()
            break;
        case "Pass":
            frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("background-color", "#CB80AB");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("color", "white");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').text("Fail - Minor");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'Fail - Minor')
            // frm.refresh()
            break;
        case "Fail - Minor":
            frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("background-color", "#FF8343");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("color", "white");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').text("Fail - Major");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'Fail - Major')
            // frm.refresh()
            break;
        case "Fail - Major":
            frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("background-color", "#B43F3F");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("color", "white");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').text("Fail - Critical");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'Fail - Critical')
            // frm.refresh()
            break;
        case "Fail - Critical":
            frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("background-color", "#FABC3F");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("color", "white");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').text("Undetermined");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'Undetermined')
            // frm.refresh()
            break;
        case "Undetermined":
            frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("background-color", "#758694");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("color", "white");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').text("To Do");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'To Do')
            // frm.refresh()
            break;
        default:
            frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("background-color", "#758694");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').css("color", "white");
                $(`div [data-idx="${row.idx}"]`).find('[data-fieldname="status"].btn-xs').text("To Do");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'To Do')
        // frm.refresh()
    }
}

let set_button_color_in_pallet_info = function (frm, cdt = undefined, cdn = undefined) {
    frm.doc.pallet_details.forEach(row => {
        // frm.fields_dict.pallet_details.grid.wrapper.find('.grid-row').addClass('editable-row')

        console.log(row.button_select, '-=== name')
        let button_select = row.button_select

        switch (button_select) {
            case "To Do":
                frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("background-color", "#758694");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("color", "white");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').text("To Do");
                });
                // frappe.model.set_value(row.cdt, row.cdn, 'task', 'Pass')
                break;
            case "Pass":
                console.log(row.task, '+++++++++= Pass')
                frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("background-color", "#76885B");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("color", "white");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').text("Pass");
                });
                break;
            case "Fail - Minor":
                frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("background-color", "#CB80AB");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("color", "white");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').text("Fail - Minor");
                });
                break;
            case "Fail - Major":
                frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("background-color", "#FF8343");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("color", "white");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').text("Fail - Major");
                });
                break;
            case "Fail - Critical":
                frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("background-color", "#B43F3F");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("color", "white");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').text("Fail - Critical");
                });
                break;
            case "Undetermined":
                frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("background-color", "#FABC3F");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("color", "white");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').text("Undetermined");

                });
                break;
            default:
                frm.fields_dict.pallet_details.grid.wrapper.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("background-color", "#758694");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').css("color", "white");
                    $(`div [data-idx="${row.idx}"]`).find('[data-fieldtype="Button"].btn-xs').text("To Do");

                });
        }
    });
}

let change_button_css = function(frm, cdt, cdn, table_name, button_select, row_idx, fieldname1){
    // console.log(table_name, '---table_name')
    switch (button_select) {
        case "To Do":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#76885B");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Pass");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'Pass')
            // frm.refresh()
            break;
        case "Pass":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#CB80AB");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Minor");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'Fail - Minor')
            // frm.refresh()
            break;
        case "Fail - Minor":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#FF8343");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Major");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'Fail - Major')
            // frm.refresh()
            break;
        case "Fail - Major":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#B43F3F");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Critical");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'Fail - Critical')
            // frm.refresh()
            break;
        case "Fail - Critical":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#FABC3F");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Undetermined");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'Undetermined')
            // frm.refresh()
            break;
        case "Undetermined":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#758694");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("To Do");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'To Do')
            // frm.refresh()
            break;
        default:
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#758694");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("To Do");
            });
            frappe.model.set_value(cdt, cdn, 'button_select', 'To Do')
    }
}