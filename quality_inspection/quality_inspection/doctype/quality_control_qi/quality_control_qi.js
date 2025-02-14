// Copyright (c) 2024, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on("Quality Control QI", {
    refresh(frm) {
        set_html_details(frm)
        // set_button_color_in_pallet_info(frm)

        // let pallet = frm.doc.pallet_details
        // let pallet_name = frm.fields_dict.pallet_details.grid.wrapper
        // let pallet_select_field = 'button_select'
        // let pallet_fieldname1 = '[data-fieldname="status"].btn-xs'
        // // console.log(table, '====table')
        // set_button_css(frm, pallet, pallet_name, pallet_select_field,pallet_fieldname1)

        // for (const table_name of create_child_table_list(frm, 'inner_and_outer_carton_details_')) {
        //     let table = frm.doc[table_name]
        //     let table_name_1 = frm.fields_dict[table_name].grid.wrapper

        //     let hologram_fieldname = '[data-fieldname="hologram"].btn-xs'
        //     let hologram_select_field = 'hologram_select'
        //     set_button_css(frm, table, table_name_1, hologram_select_field,hologram_fieldname)

        //     let carb_fieldname = '[data-fieldname="carb"].btn-xs'
        //     let carb_select_field = 'carb_select'
        //     set_button_css(frm, table, table_name_1, carb_select_field,carb_fieldname)

        //     let floor_fieldname = '[data-fieldname="floor_score"].btn-xs'
        //     let floor_select_field = 'floor_select'
        //     set_button_css(frm, table, table_name_1, floor_select_field,floor_fieldname)

        //     let shrink_wrap_fieldname = '[data-fieldname="shrink_wrap"].btn-xs'
        //     let shrink_wrap_select_field = 'shink_wrap_select'
        //     set_button_css(frm, table, table_name_1, shrink_wrap_select_field,shrink_wrap_fieldname)

        //     let insert_sheet_fieldname = '[data-fieldname="insert_sheet"].btn-xs'
        //     let insert_sheet_select_field = 'insert_sheet_select'
        //     set_button_css(frm, table, table_name_1, insert_sheet_select_field,insert_sheet_fieldname)
        // }
       

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
                                    // console.log("--data--")
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
                                    // console.log("--data11111111--")
                                    refresh_field("quality_control_item_1");
                                });
                            }

				            cur_dialog.hide();
                            // console.log(selections, '====selections')
                            // console.log(args, '====args')
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
        
    },

    onload_post_render: function (frm) {
        test()
        let pallet = frm.doc.pallet_details
        let pallet_name = frm.fields_dict.pallet_details.grid.wrapper
        let pallet_select_field = 'button_select'
        let pallet_fieldname1 = '[data-fieldname="status"].btn-xs'
        // console.log(table, '====table')
        set_button_css(frm, pallet, pallet_name, pallet_select_field,pallet_fieldname1)

        for (const table_name of create_child_table_list(frm, 'inner_and_outer_carton_details_')) {
            let table = frm.doc[table_name]
            let table_name_1 = frm.fields_dict[table_name].grid.wrapper

            let hologram_fieldname = '[data-fieldname="hologram"].btn-xs'
            let hologram_select_field = 'hologram_select'
            set_button_css(frm, table, table_name_1, hologram_select_field,hologram_fieldname)

            let carb_fieldname = '[data-fieldname="carb"].btn-xs'
            let carb_select_field = 'carb_select'
            set_button_css(frm, table, table_name_1, carb_select_field,carb_fieldname)

            let floor_fieldname = '[data-fieldname="floor_score"].btn-xs'
            let floor_select_field = 'floor_select'
            set_button_css(frm, table, table_name_1, floor_select_field,floor_fieldname)

            let shrink_wrap_fieldname = '[data-fieldname="shrink_wrap"].btn-xs'
            let shrink_wrap_select_field = 'shink_wrap_select'
            set_button_css(frm, table, table_name_1, shrink_wrap_select_field,shrink_wrap_fieldname)

            let insert_sheet_fieldname = '[data-fieldname="insert_sheet"].btn-xs'
            let insert_sheet_select_field = 'insert_sheet_select'
            set_button_css(frm, table, table_name_1, insert_sheet_select_field,insert_sheet_fieldname)
        }
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
            frm.fields_dict.pallet_details.grid.wrapper.find('[data-fieldname="status"]').click()
        }, 1000);

        let row = locals[cdt][cdn]
        let table = frm.doc.pallet_details
        let table_name = frm.fields_dict.pallet_details.grid.wrapper
        let select_field = 'button_select'
        let fieldname1 = '[data-fieldname="status"].btn-xs'

        set_button_css(frm, table, table_name, select_field, fieldname1, cdt, cdn,)
    },
    status: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn]
        let table_name = frm.fields_dict.pallet_details.grid.wrapper
        let button_select = row.button_select
        let row_idx = row.idx
        let fieldname1 = '[data-fieldname="status"].btn-xs'
        let select_field = 'button_select'
        change_button_css(frm, cdt, cdn, table_name, button_select, row_idx, fieldname1, select_field)
    },
    form_render(frm, cdt, cdn) {
        setTimeout(() => {
            frm.fields_dict.pallet_details.grid.wrapper.find('.form-in-grid').click()
        }, 100);
    }
})

let create_child_table_list = function(frm, child_table){
    let child_table_list = []
    if(frm.doc.no_of_po > 0){
        for (let i = 0; i < frm.doc.no_of_po; i++) {
            let child_table_name = child_table + (i + 1)
            child_table_list.push(child_table_name)
        }
    }
    console.log(child_table_list, '====child_table_list')
    return child_table_list
}

let inner_list = [
    {   'table_name':"Inner and Outer Carton Details QI",
        'table_fieldname': 'inner_and_outer_carton_details_',
        'table_button_details': [
            {'button': 'hologram', 'select': 'hologram_select', 'fieldname': '[data-fieldname="hologram"].btn-xs'}, 
            {'button': 'carb', 'select': 'carb_select', 'fieldname': '[data-fieldname="carb"].btn-xs'}, 
            {'button': 'floor_score', 'select': 'floor_select', 'fieldname': '[data-fieldname="floor_score"].btn-xs'}, 
            {'button': 'shrink_wrap', 'select': 'shink_wrap_select', 'fieldname': '[data-fieldname="shrink_wrap"].btn-xs'}, 
            {'button': 'insert_sheet', 'select': 'insert_sheet_select', 'fieldname': '[data-fieldname="insert_sheet"].btn-xs'},
        ],
    }]

let test = function(){
    for(const a of inner_list){
        let table_name = a.table_name
        let buttons = a.table_button_details
        for(let b of buttons) {
            frappe.ui.form.on(table_name, b.button, function (frm, cdt, cdn) {
                let row = locals[cdt][cdn]
                // for (const table_name of create_child_table_list(frm, a.table_fieldname)) {
                //     if (row.parentfield == table_name){
                        let table_name_1 = frm.fields_dict[row.parentfield].grid.wrapper
                        let button_select = row[b.select]
                        let row_idx = row.idx
                        let fieldname1 = b.fieldname
                        let select_field = b.select

                        console.log("======function called=====")
                        console.log(row.parentfield, '====row.parentfield')
                        change_button_css(frm, cdt, cdn, table_name_1, button_select, row_idx, fieldname1, select_field)
    
                //         break
                //     }
                // }
                // console.log(b, '====b')
                // console.log(table_name, '====table_name')
            })
        }
    }
}

// frappe.ui.form.on("Inner and Outer Carton Details QI", {
//     hologram: function (frm, cdt, cdn) {
//         let row = locals[cdt][cdn]
//         for (const table_name of create_child_table_list(frm, 'inner_and_outer_carton_details_')) {
//             if (row.parentfield == table_name){
//                 let table_name_1 = frm.fields_dict[table_name].grid.wrapper
//                 let button_select = row.hologram_select
//                 let row_idx = row.idx
//                 let fieldname1 = '[data-fieldname="hologram"].btn-xs'
//                 let select_field = 'hologram_select'
//                 change_button_css(frm, cdt, cdn, table_name_1, button_select, row_idx, fieldname1, select_field)
//             }
//         }
        
//     },
//     carb: function (frm, cdt, cdn) {
//         let row = locals[cdt][cdn]
//         for (const table_name of create_child_table_list(frm, 'inner_and_outer_carton_details_')) {
//             if (row.parentfield == table_name){
//                 let table_name_1 = frm.fields_dict[table_name].grid.wrapper
//                 let button_select = row.carb_select
//                 let row_idx = row.idx
//                 let fieldname1 = '[data-fieldname="carb"].btn-xs'
//                 let select_field = 'carb_select'
//                 change_button_css(frm, cdt, cdn, table_name_1, button_select, row_idx, fieldname1, select_field)
//             }
//         }
//     },

//     floor_score: function (frm, cdt, cdn) {
//         let row = locals[cdt][cdn]
//         for (const table_name of create_child_table_list(frm, 'inner_and_outer_carton_details_')) {
//             if (row.parentfield == table_name){
//                 let table_name_1 = frm.fields_dict[table_name].grid.wrapper
//                 let button_select = row.floor_select
//                 let row_idx = row.idx
//                 let fieldname1 = '[data-fieldname="floor_score"].btn-xs'
//                 let select_field = 'floor_select'
//                 change_button_css(frm, cdt, cdn, table_name_1, button_select, row_idx, fieldname1, select_field)
//             }
//         }
//     },

//     shrink_wrap: function (frm, cdt, cdn) {
//         let row = locals[cdt][cdn]
//         for (const table_name of create_child_table_list(frm, 'inner_and_outer_carton_details_')) {
//             if (row.parentfield == table_name){
//                 let table_name_1 = frm.fields_dict[table_name].grid.wrapper
//                 let button_select = row.shink_wrap_select
//                 let row_idx = row.idx
//                 let fieldname1 = '[data-fieldname="shrink_wrap"].btn-xs'
//                 let select_field = 'shink_wrap_select'
//                 change_button_css(frm, cdt, cdn, table_name_1, button_select, row_idx, fieldname1, select_field)
//             }
//         }
//     },

//     insert_sheet: function (frm, cdt, cdn) {
//         let row = locals[cdt][cdn]
//         for (const table_name of create_child_table_list(frm, 'inner_and_outer_carton_details_')) {
//             if (row.parentfield == table_name){
//                 let table_name_1 = frm.fields_dict[table_name].grid.wrapper
//                 let button_select = row.insert_sheet_select
//                 let row_idx = row.idx
//                 let fieldname1 = ''
//                 let select_field = 'insert_sheet_select'
//                 change_button_css(frm, cdt, cdn, table_name_1, button_select, row_idx, fieldname1, select_field)
//             }
//         }
//     },

//     form_render(frm, cdt, cdn) {
//         setTimeout(() => {
//             let row = locals[cdt][cdn]
//             for (const table_name of create_child_table_list(frm, 'inner_and_outer_carton_details_')) {
//                 if (row.parentfield == table_name){
//                     frm.fields_dict[table_name].grid.wrapper.find('.form-in-grid').click()
//                 }}
//         }, 500);
//     }
// })


let change_button_css = function(frm, cdt, cdn, table_name, button_select, row_idx, fieldname1, select_field){
    console.log("====change_button_css====")
    switch (button_select) {
        case "To Do":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#76885B");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Pass");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'Pass')
            // frm.refresh()
            break;
        case "Pass":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#CB80AB");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Minor");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'Fail - Minor')
            // frm.refresh()
            break;
        case "Fail - Minor":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#FF8343");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Major");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'Fail - Major')
            // frm.refresh()
            break;
        case "Fail - Major":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#B43F3F");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Critical");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'Fail - Critical')
            // frm.refresh()
            break;
        case "Fail - Critical":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#FABC3F");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Undetermined");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'Undetermined')
            // frm.refresh()
            break;
        case "Undetermined":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#758694");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("To Do");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'To Do')
            // frm.refresh()
            break;
        default:
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#758694");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("To Do");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'To Do')
    }
}

let set_button_css = function(frm, table, table_name, select_field,fieldname1, cdt = undefined, cdn = undefined){
    console.log("====set_button_css====")
    table.forEach(row => {
        let row_idx = row.idx
        let button_select = row[select_field]
        
        switch (button_select) {
            case "To Do":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#758694");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("To Do");
                });
                break;
            case "Pass":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#76885B");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Pass");
                });
                break;
            case "Fail - Minor":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#CB80AB");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Minor");
                });
                break;
            case "Fail - Major":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#FF8343");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Major");
                });
                break;
            case "Fail - Critical":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#B43F3F");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Critical");
                });
                break;
            case "Undetermined":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#FABC3F");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Undetermined");
                });
                break;
            default:
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#758694");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("To Do");
                });
        }
    });
}