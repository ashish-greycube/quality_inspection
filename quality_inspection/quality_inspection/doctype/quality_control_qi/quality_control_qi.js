// Copyright (c) 2024, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on("Quality Control QI", {
    refresh(frm) {     
        setTimeout(() => {
            frm.fields_dict.pallet_details.grid.wrapper.find('.static-area').click()
            frm.fields_dict.pallet_details.grid.wrapper.find('div.select-icon').hide()
        }, 100);
        update_child_table_field_property(frm)
        frm.fields_dict.pallet_details.grid.update_docfield_property("status", "label", `<i class="fa fa-caret-right" style="border:1px solid black;padding:0px 3px;margin:2px 0px -13px -18px;height: 145%; font-size:1.6rem"></i>`);

        click_first_row_table(frm)
        set_html_details(frm)

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

            if (frm.doc.docstatus == 1){
                frm.add_custom_button(__('Get Pallet Excel'), () => {
                    let file_name="Quality"+frm.doc.name+".xlsx"
                    return frappe.call({
                        method: "quality_inspection.quality_inspection.doctype.quality_control_qi.quality_control_qi.download_excel",
                        args: {
                            doctype: frm.doc.doctype,
                            docname: frm.doc.name,
                            child_fieldname: "pallet_details",
                            file_name:file_name
                        },
                        callback: function (r) {
                        //   console.log(r.message)
                          function downloadURI(uri, name) 
                          {
                              var link = document.createElement("a");
                              // If you don't know the name or want to use
                              // the webserver default set name = ''
                              link.setAttribute('download', name);
                              link.href = uri;
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                          }                    
                          downloadURI(r.message,"Quality"+frm.doc.name)
                        //   console.log("22")
                          }
                      })
                  })
            }
        }

        // document.querySelector('.btn-primary[data-label="Save"]').addEventListener("click", frm.reload_doc());
        // $(document).ready(function () { 
        //     $(document).on('click','.btn-primary[data-label="Save"]',function(){
        //         console.log("GfG is clicked using click() method");
        //     });
        //     console.log("readyyy")
        //     // $('.btn-primary[data-label="Save"]').click(function () { 
        //     //     console.log("GfG is clicked using click() method"); 
        //     // }); 
        // }); 
        // frm.reload_doc();
    },

    onload: function (frm) {
        set_html_details(frm)
        // click_table_every_row(frm)
        // click_first_row_table(frm)
        // frm.scroll_to_field("po_color_1");
        
            // $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            //     // console.log(i, "====i")

            //     var target = $(e.target).attr('data-fieldname');
            //     console.log(e.target, "====e.target==")
            //     console.log(target, "===")
            //     if (target === 'tab_3_tab') {
            //         console.log("ACTIVEEEE")
                    
            //         let inner_outer_tables = create_child_table_list(frm, 'inner_and_outer_carton_details_')
            //         // setTimeout(() => {
            //             if (inner_outer_tables.length > 0) {
            //                 console.log('condition')  
            //                 for (const inner_table of inner_outer_tables) {
            //                     // select
            //                     frm.fields_dict[inner_table].grid.wrapper.find('div [data-fieldname="hologram_select"]').click()
            //                     // frm.fields_dict[inner_table].grid.wrapper.find('div [data-fieldname="hologram_select"]').click()
            //                     frm.fields_dict[inner_table].grid.wrapper.find('div.select-icon').hide()
            //                     frm.fields_dict[inner_table].grid.wrapper.find('div [data-idx="1"]').click()
            //                 }
            //             }
            //         // }, 100);
            //     } else {
            //         console.log("ELSEEEEEEE")
            //     }
            // })
    },

    flooring_class: function (frm){
        update_child_table_field_property(frm)
        click_first_row_table(frm)
        frm.save()
    },

    after_save: function (frm) {
        console.log('after_save')
        setTimeout(() => {
            window.location.reload();
        }, 100)
    },

    onload_post_render: function (frm) {
        set_button_label_arrow(frm)
        // set_pallet_button_css(frm)
        $('button.grid-add-row').hide()
        // $('div.select-icon').hide()
        click_table_every_row(frm)
        click_first_row_table(frm)
        change_table_button_css()
        // hide_select_fields()
        set_table_button_css(frm)
        
    },
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

let create_child_table_list = function(frm, child_table){
    let child_table_list = []
    if(frm.doc.no_of_po > 0){
        for (let i = 0; i < frm.doc.no_of_po; i++) {
            let child_table_name = child_table + (i + 1)
            child_table_list.push(child_table_name)
        }
    }
    // console.log(child_table_list, '====child_table_list')
    return child_table_list
}

let table_details_list = [
    {   'table_name':"Pallet Information QI",
        'table_field_name': "pallet_details",
        'table_button_details': [
            {'button': 'status', 'select': 'button_select', 'fieldname': '[data-fieldname="button_select"]'}
        ],
        'select_field': ['button_select']
    },
    {   'table_name':"Inner and Outer Carton Details QI",
        'table_field_name': "inner_and_outer_carton_details_",
        'table_button_details': [
            {'button': 'hologram', 'select': 'hologram_select', 'fieldname': '[data-fieldname="hologram_select"]'}, 
            {'button': 'carb', 'select': 'carb_select', 'fieldname': '[data-fieldname="carb_select"]'}, 
            {'button': 'floor_score', 'select': 'floor_select', 'fieldname': '[data-fieldname="floor_select"]'}, 
            {'button': 'shrink_wrap', 'select': 'shink_wrap_select', 'fieldname': '[data-fieldname="shink_wrap_select"]'}, 
            {'button': 'insert_sheet', 'select': 'insert_sheet_select', 'fieldname': '[data-fieldname="insert_sheet_select"]'},
        ],
        'select_field': ['hologram_select', 'carb_select', 'floor_select', 'shink_wrap_select', 'insert_sheet_select']
    },
    {   'table_name': "Color Match and Embossing Details Ql",
        'table_field_name': "color_match_and_embossing_details_",
        'table_button_details': [
            {'button': 'results', 'select': 'results_select', 'fieldname': '[data-fieldname="results_select"]'},
            {'button': 'embossing', 'select': 'embossing_select', 'fieldname': '[data-fieldname="embossing_select"]'}
        ],
        'select_field': ['results_select', 'embossing_select']
    },
    {   'table_name': "Over Wax and Edge Paint Ql",
        'table_field_name': "over_wax_and_edge_paint_",
        'table_button_details': [
            {'button': 'over_wax', 'select': 'over_wax_select', 'fieldname': '[data-fieldname="over_wax_select"]'},
            {'button': 'edge_paint', 'select': 'edge_paint_select', 'fieldname': '[data-fieldname="edge_paint_select"]'}
        ],
        'select_field': ['over_wax_select', 'edge_paint_select']
    },
    {   'table_name': "Gloss Level Details QI",
        'table_field_name': "gloss_level_details_",
        'table_button_details': [
            {'button': 'results_1', 'select': 'results_select_1', 'fieldname': '[data-fieldname="results_select_1"]'},
            {'button': 'results_2', 'select': 'results_select_2', 'fieldname': '[data-fieldname="results_select_2"]'},
            {'button': 'results_3', 'select': 'results_select_3', 'fieldname': '[data-fieldname="results_select_3"]'},
            {'button': 'results_4', 'select': 'results_select_4', 'fieldname': '[data-fieldname="results_select_4"]'}
        ],
        'select_field': ['results_select_1', 'results_select_2', 'results_select_3', 'results_select_4']
    },
    {   'table_name': "Moisture Content Details QI",
        'table_field_name': "moisture_content_details_",
        'table_button_details': [
            {'button': 'results_1', 'select': 'results_select_1', 'fieldname': '[data-fieldname="results_select_1"]'},
            {'button': 'results_2', 'select': 'results_select_2', 'fieldname': '[data-fieldname="results_select_2"]'},
            {'button': 'results_3', 'select': 'results_select_3', 'fieldname': '[data-fieldname="results_select_3"]'},
            {'button': 'results_4', 'select': 'results_select_4', 'fieldname': '[data-fieldname="results_select_4"]'}
        ],
        'select_field': ['results_select_1', 'results_select_2', 'results_select_3', 'results_select_4']
    },
    {   'table_name': "Open Box Inspection Details QI",
        'table_field_name': "open_box_inspection_details_",
        'table_button_details': [
            {'button': 'bowing', 'select': 'bowing_select', 'fieldname': '[data-fieldname="bowing_select"]'},
            {'button': 'squareness', 'select': 'squareness_select', 'fieldname': '[data-fieldname="squareness_select"]'},
            {'button': 'ledging_overwood', 'select': 'ledging_overwood_select', 'fieldname': '[data-fieldname="ledging_overwood_select"]'},
            {'button': 'pad_away', 'select': 'pad_away_select', 'fieldname': '[data-fieldname="pad_away_select"]'}
        ],
        'select_field': ['bowing_select', 'squareness_select', 'ledging_overwood_select', 'pad_away_select']
    },
    {   'table_name': "Width And Thickness Details QI",
        'table_field_name': "width_and_thickness_details_",
        'table_button_details': [
            {'button': 'manual_pull_test', 'select': 'manual_select', 'fieldname': '[data-fieldname="manual_select"]'}
        ],
        'select_field': ['manual_select']
    }
]

let change_table_button_css = function () {
    for (const a of table_details_list) {
        let table_name = a.table_name
        let buttons = a.table_button_details
        for (let b of buttons) {
            frappe.ui.form.on(table_name, b.button, function (frm, cdt, cdn) {
                let row = locals[cdt][cdn]
                let table_name_1 = frm.fields_dict[row.parentfield].grid.wrapper
                let button_select = row[b.select]
                let row_idx = row.name
                let fieldname1 = b.fieldname
                let select_field = b.select
                // change_button_css(frm, cdt, cdn, table_name_1, button_select, row_idx, fieldname1, select_field)
                change_select_css(frm, cdt, cdn, table_name_1, button_select, row_idx, fieldname1, select_field)
            })
        }
    }
}

let set_table_button_css = function (frm) {
    for (const a of table_details_list) {
        if (a.table_field_name == 'pallet_details') {
            let table_name = a.table_field_name
            let table = frm.doc[table_name]
            let table_name_1 = frm.fields_dict[table_name].grid.wrapper
            let buttons = a.table_button_details
            for (let b of buttons) {
                let fieldname1 = b.fieldname
                let select_field = b.select
                // set_button_css(frm, table, table_name_1, select_field, fieldname1)
                set_select_css(frm, table, table_name_1, select_field,fieldname1, cdt = undefined, cdn = undefined)
            }
        }
        else {
            let child_table_list = create_child_table_list(frm, a.table_field_name)
            // console.log(child_table_list, "==========child_table_list======")
            if (child_table_list.length > 0) {
                for (const table_name of child_table_list) {
                    let table = frm.doc[table_name]
                    let table_name_1 = frm.fields_dict[table_name].grid.wrapper
                    let buttons = a.table_button_details
                    for (let b of buttons) {
                        let fieldname1 = b.fieldname
                        let select_field = b.select
                        // set_button_css(frm, table, table_name_1, select_field, fieldname1)
                        set_select_css(frm, table, table_name_1, select_field,fieldname1, cdt = undefined, cdn = undefined)
                    }
                }
            }
        }

        
    }
}

let hide_select_fields = function(){
    for(const table of table_details_list){
        let table_name = table.table_name
        let select_fields = table.select_field
       
        frappe.ui.form.on(table_name, {
            form_render(frm, cdt, cdn) {
                let row = locals[cdt][cdn]
                for (const select_field of select_fields) {
                    frm.fields_dict[row.parentfield].grid.update_docfield_property(select_field, "hidden", 1);
                }

                setTimeout(() => {
                    frm.fields_dict[row.parentfield].grid.wrapper.find('.form-in-grid').click()
                }, 100);
            }
        })
    }
}

let click_table_every_row = function (frm) {
    for (const table of table_details_list) {
        if (table.table_field_name == 'pallet_details') {
            continue
        }
        else {
            let child_table_list = create_child_table_list(frm, table.table_field_name)
            if (child_table_list.length > 0) {
                let select_field_name = table.table_button_details[0].fieldname
                for (const table_name of child_table_list) {
                    // frm.fields_dict[table_name].grid.wrapper.find('div [data-fieldtype="Select"]').click()
                    // console.log(frm.fields_dict[table_name].grid.wrapper.find(`div ${select_field_name}`), "=======")
                    frm.fields_dict[table_name].grid.wrapper.find(`div ${select_field_name}`).click()
                    frm.fields_dict[table_name].grid.wrapper.find('div.select-icon').hide()
                }
            }
        }

    }
}

let set_button_label_arrow = function (frm) {
    for (const table of table_details_list) {
        if (table.table_field_name == 'pallet_details') {
            continue
        }
        else {
            let child_table_list = create_child_table_list(frm, table.table_field_name)
            if (child_table_list.length > 0) {
                for (const table_name of child_table_list) {
                    let buttons = table.table_button_details
                    for (let b of buttons) {
                        // frm.fields_dict[table_name].grid.update_docfield_property(b.button, "label", `<div style="border:1px solid black;padding:0px 3px;margin:-2px 0px -13px -11px;height: 145%;"><i class="fa fa-caret-right"style="font-size:1.6rem"></i></div>`);
                        frm.fields_dict[table_name].grid.update_docfield_property(b.button, "label", `<i class="fa fa-caret-right"style="border: 1px solid black; margin: 2px 0px -13px -17px; height: 23px; padding: 0px 3px; font-size:1.6rem"></i>`);
                    }
                }
            }
        }
    }
}

let click_first_row_table = function (frm) {
    for (const table of table_details_list) {
        if (table.table_field_name == 'pallet_details') {
            continue
        }
        else {
            let child_table_list = create_child_table_list(frm, table.table_field_name)
            if (child_table_list.length > 0) {

                for (const table_name of child_table_list) {
                    setTimeout(() => {
                        frm.fields_dict[table_name].grid.wrapper.find('div [data-idx="1"]').click()
                    }, 5)
                }
            }
        }
    }
}

let update_child_table_field_property = function (frm) {
    // console.log('update_child_table_field_property')
    let inner_outer_tables = create_child_table_list(frm, 'inner_and_outer_carton_details_')
    if (inner_outer_tables.length > 0) {
        // console.log('condition')
        for (const inner_table of inner_outer_tables) {
            if (frm.doc.flooring_class == 'LVP & WPC') {
                frm.fields_dict[inner_table].grid.update_docfield_property("carb_select", "hidden", 1);
                frm.fields_dict[inner_table].grid.update_docfield_property("carb", "hidden", 1);
                frm.fields_dict[inner_table].grid.update_docfield_property("carb_select", "in_list_view", 0);
                frm.fields_dict[inner_table].grid.update_docfield_property("carb", "in_list_view", 0);
                frm.fields_dict[inner_table].grid.reset_grid();
            }
            else{
                frm.fields_dict[inner_table].grid.update_docfield_property("carb_select", "hidden", 0);
                frm.fields_dict[inner_table].grid.update_docfield_property("carb", "hidden", 0);
                frm.fields_dict[inner_table].grid.update_docfield_property("carb_select", "in_list_view", 1);
                frm.fields_dict[inner_table].grid.update_docfield_property("carb", "in_list_view", 1);
                frm.fields_dict[inner_table].grid.reset_grid();
            }
        }
    }

    let over_wax_tables = create_child_table_list(frm, 'over_wax_and_edge_paint_')
    if (over_wax_tables.length > 0) {
        for (const over_table of over_wax_tables) {
            // console.log(over_table, "----over_table---")
            if (frm.doc.flooring_class == 'LVP & WPC') {
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax", "hidden", 1);
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax_select", "hidden", 1);
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax", "in_list_view", 0);
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax_select", "in_list_view", 0);
            }
            else{
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax", "hidden", 0);
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax_select", "hidden", 0);
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax", "in_list_view", 1);
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax_select", "in_list_view", 1);
            }

            if(frm.doc.flooring_class == 'HARDWOOD FLOORING'){
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint", "hidden", 1);
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint_select", "hidden", 1);
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint", "in_list_view", 0);
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint_select", "in_list_view", 0);
            }
            else{
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint", "hidden", 0);
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint_select", "hidden", 0);
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint", "in_list_view", 1);
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint_select", "in_list_view", 1);
            }
            frm.fields_dict[over_table].grid.reset_grid();
        }
    }
}

let change_button_css = function(frm, cdt, cdn, table_name, button_select, row_idx, fieldname1, select_field){
    // console.log("====change_button_css====")
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
    // console.log("====set_button_css====")
    table.forEach(row => {
        let row_idx = row.idx
        let button_select = row[select_field]
        
        switch (button_select) {
            case "To Do":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#758694");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("To Do");
                    $(`div [data-idx="${row_idx}"]`).find('.field-area').find(fieldname1).css("display", "");
                });
                break;
            case "Pass":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#76885B");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Pass");
                    $(`div [data-idx="${row_idx}"]`).find('.field-area').find(fieldname1).css("display", "");
                });
                break;
            case "Fail - Minor":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#CB80AB");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Minor");
                    $(`div [data-idx="${row_idx}"]`).find('.field-area').find(fieldname1).css("display", "");
                });
                break;
            case "Fail - Major":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#FF8343");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Major");
                    $(`div [data-idx="${row_idx}"]`).find('.field-area').find(fieldname1).css("display", "");
                });
                break;
            case "Fail - Critical":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#B43F3F");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Fail - Critical");
                    $(`div [data-idx="${row_idx}"]`).find('.field-area').find(fieldname1).css("display", "");
                });
                break;
            case "Undetermined":
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#FABC3F");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("Undetermined");
                    $(`div [data-idx="${row_idx}"]`).find('.field-area').find(fieldname1).css("display", "");
                });
                break;
            default:
                table_name.on('click', '.grid-row', function (event) {
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("background-color", "#758694");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).css("color", "white");
                    $(`div [data-idx="${row_idx}"]`).find(fieldname1).text("To Do");
                    $(`div [data-idx="${row_idx}"]`).find('.field-area').find(fieldname1).css("display", "");
                });
        }
    });
}

let change_select_css = function (frm, cdt, cdn, table_name, button_select, row_idx, fieldname1, select_field) {
    table_name.on('change', '.grid-row', function (event) {
        $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("border", "1px solid black");
        $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("text-align", "center");
        // $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("margin", "5px 7px");
        $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("width", "90%");
        $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("height", "auto");
        $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("font-size", "100%");
        $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("padding", "0px");
        $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("margin-left", "13px");
        $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("margin-top", "11px");
    })

    switch (button_select) {
        case "To Do":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#76885B");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'Pass')
            break;
        case "Pass":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#CB80AB");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'Fail - Minor')
            // frm.refresh()
            break;
        case "Fail - Minor":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#FF8343");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'Fail - Major')
            // frm.refresh()
            break;
        case "Fail - Major":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#B43F3F");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'Fail - Critical')
            // frm.refresh()
            break;
        case "Fail - Critical":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#FABC3F");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'Undetermined')
            // frm.refresh()
            break;
        case "Undetermined":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#758694");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'To Do')
            // frm.refresh()
            break;
        default:
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#758694");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            frappe.model.set_value(cdt, cdn, select_field, 'To Do')
    }
}

let set_select_css = function (frm, table, table_name, select_field, fieldname1, cdt = undefined, cdn = undefined) {
    table.forEach(row => {
        // console.log(table, "=========")
        let row_idx = row.name
        let button_select = row[select_field]
        // console.log(fieldname1, "=======fieldname1")

        table_name.on('click', '.grid-row', function (event) {
            $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("border", "1px solid black");
            $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("text-align", "center");
            // $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("margin", "5px 7px");
            $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("width", "90%");
            $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("height", "auto");
            $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("font-size", "100%");
            $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("padding", "0px");
            $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("margin-left", "13px");
            $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("margin-top", "11px");
        })
        if (table[0].parentfield == row.parentfield) {
            switch (button_select) {
                case "To Do":
                    table_name.on('click', '.grid-row', function (event) {
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("background-color", "#758694");
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("color", "white");
                    });
                    break;
                case "Pass":
                    table_name.on('click', '.grid-row', function (event) {
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("background-color", "#76885B");
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("color", "white");
                    });
                    break;
                case "Fail - Minor":
                    table_name.on('click', '.grid-row', function (event) {
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("background-color", "#CB80AB");
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("color", "white");
                    });
                    break;
                case "Fail - Major":
                    table_name.on('click', '.grid-row', function (event) {
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("background-color", "#FF8343");
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("color", "white");
                    });
                    break;
                case "Fail - Critical":
                    table_name.on('click', '.grid-row', function (event) {
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("background-color", "#B43F3F");
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("color", "white");
                    });
                    break;
                case "Undetermined":
                    table_name.on('click', '.grid-row', function (event) {
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("background-color", "#FABC3F");
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("color", "white");
                    });
                    break;
                default:
                    table_name.on('click', '.grid-row', function (event) {
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("background-color", "#758694");
                        $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("color", "white");
                    });
            }
        }


    });
}
