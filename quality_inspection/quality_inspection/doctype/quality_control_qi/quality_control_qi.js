// Copyright (c) 2024, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on("Quality Control QI", {
    refresh(frm) {  
        setTimeout(() => {
            frm.fields_dict.pallet_details.grid.wrapper.find('.static-area').click()
            frm.fields_dict.pallet_details.grid.wrapper.find('div.select-icon').hide()
        }, 100);

        setTimeout(() => {
            $('button.grid-add-row').hide()
        }, 2000)
        
        update_child_table_field_property(frm)
        // frm.fields_dict.pallet_details.grid.update_docfield_property("status", "label", `<i class="fa fa-caret-right" style="border:1px solid black;padding:0px 3px;margin:2px 0px -13px -18px;height: 145%; font-size:1.6rem"></i>`);

        click_first_row_table(frm)
        set_html_details(frm)
        set_row_above_table_header(frm)
        
// ===============================================================

        if (!frm.is_new() && frm.doc.docstatus === 0) {
            frm.add_custom_button(__("TAS Po"), function () {

                if (frm.doc.vendor == "" || frm.doc.vendor == undefined) {
                    frappe.throw("Please select vendor first!")
                }
                else {                       
                    let dialog = undefined
                    const dialog_field = []

                    dialog_field.push(
                        { fieldtype: "Column Break", fieldname: "column_break_1" },
                        {
                            fieldtype: "Link",
                            fieldname: "vendor_no",
                            label: __("Vendor No"),
                            options: "Supplier",
                            read_only: 1,
                            default: frm.doc.vendor
                        },
                        { fieldtype: "Column Break", fieldname: "column_break_2" },
                        { fieldtype: "Section Break", fieldname: "section_break_1" },
                        {
                            fieldtype: "Check",
                            fieldname: "allow_child_item_selection",
                            label: __("Allow Child Item Selection"),
                            read_only: 0,
                            default: 1,
                            onchange: function (e) {
                                if (this.value == 0) {
                                    setTimeout(() => {
                                        loading_html()
                                    }, 100);
                                    $(".datatable").empty()
                                    dialog.set_df_property("instruction", "hidden", 1)
                                    get_tas_po()
                                }
                                else {
                                    setTimeout(() => {
                                        loading_html()
                                    }, 100);
                                    $(".datatable").empty()
                                    dialog.set_df_property("instruction", "hidden", 1)
                                    get_tas_po_items()
                                }
                            }
                        },
                        { fieldtype: "HTML", fieldname: "loading_html" },
                        { fieldtype: "HTML", fieldname: "child_selection_area" },
                        { fieldtype: "HTML", fieldname: "instruction", hidden: 1 }
                    )

                    let get_tas_po = function () {
                        console.log("------get_tas_po------")
                        frappe.call({
                            method: "quality_inspection.quality_inspection.doctype.quality_control_qi.quality_control_qi.get_tas_po",
                            args: {
                                vendor: frm.doc.vendor
                            },
                            callback: function (r) {
                                let po_list = r.message
                                if (po_list.length > 0) {
                                    let po_list_1 = []
                                    po_list.forEach((row) => {
                                        po_list_1.push([
                                            row["tas_po"],
                                            row["vendor"]
                                        ])
                                    })
                                    this.$child_wrapper = dialog.fields_dict.child_selection_area.$wrapper;
                                    this.$child_wrapper.addClass("my-3");
                                    dialog.child_datatable = new DataTable(this.$child_wrapper.get(0), {
                                        columns: [
                                            {name: 'TAS PO', id: 'tas_po', editable: false, dropdown: false,},
                                            {name: 'Vendor', id: 'vendor', editable: false, dropdown: false,}],
                                        data: po_list_1,
                                        layout: "fluid",
                                        inlineFilters: true,
                                        serialNoColumn: false,
                                        checkboxColumn: true,
                                        cellHeight: 35,
                                        noDataMessage: __("No Data"),
                                        disableReorderColumn: true,
                                    });
                                    this.$child_wrapper.find(".dt-scrollable").css("height", "300px");

                                    dialog.set_df_property("instruction", "hidden", 0)
                                    
                                    $(".datatable").ready(function(){
                                        console.log("Datatable is ready!!!")
                                        $("#preloader").remove();
                                    })
                                }
                                else{
                                    $(".datatable").ready(function(){
                                        $("#preloader").remove();
                                    })
                                    setTimeout(() => {
                                        this.$child_selection_area = dialog.fields_dict.child_selection_area.$wrapper
                                        if (this.$child_selection_area.find("#nodata").length == 0){
                                            this.$child_selection_area.prepend('<div id="nodata" class="text-center" style="color:#b52a2a">No Data Found...</div>');
                                        }
                                    }, 100);
                                }
                            }
                        })
                    }

                    let get_tas_po_items = function(){
                        frappe.call({
                            method:"quality_inspection.quality_inspection.doctype.quality_control_qi.quality_control_qi.get_tas_po_items",
                            args: {
                                vendor: frm.doc.vendor,
                            },
                            callback: function (r) {
                                let item_list = r.message
                                if (item_list.length > 0) {
                                    let item_list_1 = []
                                    item_list.forEach((row) => {
                                        item_list_1.push([row["tas_po"],
                                            row["item_no"],
                                            row["qty"] ,
                                            row["color"] || ''])
                                    });
                                    this.$child_wrapper = dialog.fields_dict.child_selection_area.$wrapper;
                                    this.$child_wrapper.addClass("my-3");
    
                                    dialog.child_datatable = new DataTable(this.$child_wrapper.get(0), {
                                        columns: [
                                            {name: 'TAS PO', id: 'tas_po', editable: false, dropdown: false,},
                                            {name: 'Item No', id: 'item_no', editable: false, dropdown: false,},
                                            {name: 'Qty', id: 'qty', editable: false, dropdown: false,},
                                            {name: 'Color', id: 'color', editable: false, dropdown: false,},
                                            ],
                                        data: item_list_1,
                                        layout: "fluid",
                                        inlineFilters: true,
                                        serialNoColumn: false,
                                        checkboxColumn: true,
                                        cellHeight: 35,
                                        noDataMessage: __("No Data"),
                                        disableReorderColumn: true,
                                    });

                                    dialog.set_df_property("instruction", "hidden", 0)

                                    this.$child_wrapper.find(".dt-scrollable").css("height", "300px");

                                    $(".datatable").ready(function(){
                                        console.log("Datatable is ready!!!")
                                        $("#preloader").remove();
                                    })
                                }
                                else{
                                    $(".datatable").ready(function(){
                                        $("#preloader").remove();
                                    })
                                    setTimeout(() => {
                                        this.$child_selection_area = dialog.fields_dict.child_selection_area.$wrapper
                                        if (this.$child_selection_area.find("#nodata").length == 0){
                                            this.$child_selection_area.prepend('<div id="nodata" class="text-center" style="color:#b52a2a">No Data Found...</div>');
                                        }
                                    }, 100);
                                }
                            }
                        })
                    }
                    
                    let loading_html = function(){
                        setTimeout(() => {
                            this.$loading_html = dialog.fields_dict.loading_html.$wrapper
                            if (this.$loading_html.find("#preloader").length == 0){
                                this.$loading_html.prepend('<div id="preloader" class="text-center">Loading data...</div>');
                            }
                        }, 100);
                    }
                    loading_html()
                    get_tas_po_items()

                    dialog = new frappe.ui.Dialog({
                        title: __("Select TAS Purchase Order"),
                        fields: dialog_field,
                        primary_action_label: 'Get Items',
                        primary_action: function (values) {

                            let checked_items = dialog.child_datatable.rowmanager.getCheckedRows()

                            if (checked_items.length > 0) {
                                let datatable_data = dialog.child_datatable.datamanager.data
                                let selected_items_list = []

                                if (dialog.get_field("allow_child_item_selection").value == 1){
                                    for (const i of checked_items) {
                                        let row_data = datatable_data[i]     
                                        selected_items_list.push({
                                            "tas_po" : row_data[0],
                                            "item_no" : row_data[1],
                                            "qty" : row_data[2],
                                            "color" : row_data[3],
                                        })
                                    }

                                    frappe.call({
                                        method: "make_quality_control_item_using_tas_po_items",
                                        doc: frm.doc,
                                        args: selected_items_list,
                                    })
                                    .then(() => {
                                        refresh_field("tas_po_name_1");
                                        setTimeout(() => {
                                            location.reload();
                                        }, 100)
                                    });
                                }
                                else{
                                    for (const i of checked_items) {
                                        let row_data = datatable_data[i]     
                                        selected_items_list.push(row_data[0])
                                    }

                                    frappe.call({
                                        method: "make_quality_control_item_using_tas_po",
                                        doc: frm.doc,
                                        args: selected_items_list,
                                    })
                                    .then(() => {
                                        refresh_field("tas_po_name_1");
                                        setTimeout(() => {
                                            location.reload();
                                        }, 100)
                                    });
                                }
                            }

                            dialog.hide();
                        }
                    })
                    dialog.set_df_property("instruction", "options", "<div class='text-center'>Above are eligible items that have NOT participated in submitted quality inspection earlier</div>")
                    dialog.show()
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
    },

    onload: function (frm) {
        set_html_details(frm)
        
        let current_tab_id = localStorage.getItem('current_tab_id_1')
        let current_tab_fieldname = localStorage.getItem('current_tab_fieldname_1') 

        if (current_tab_id && current_tab_fieldname) {
            setTimeout(() => {
                $(`.nav-link[aria-controls=${current_tab_id}][data-fieldname=${current_tab_fieldname}]`).click()
                localStorage.removeItem('current_tab_id_1')
                localStorage.removeItem('current_tab_fieldname_1')
            }, 100)
        }

        setTimeout(() => {
            $('button.grid-add-row').hide()
        }, 2000)
        
        // let fullwidth = JSON.parse(localStorage.container_fullwidth || "false");
        // if (fullwidth == false){
        //     frappe.ui.toolbar.toggle_full_width(); 
        // }
        
    },

    flooring_class: function (frm){
        update_child_table_field_property(frm)
    },

    before_save: function (frm) {
        localStorage.setItem('current_tab_id_1', cur_frm.get_active_tab()?.wrapper[0].id)
        localStorage.setItem('current_tab_fieldname_1', cur_frm.get_active_tab()?.df.fieldname)
    },

    after_save: function (frm) {
        if (frm.doc.docstatus == 0){
            setTimeout(() => {
                // window.location.reload();
                location.reload();
            }, 100)
        }
    },

    onload_post_render: function (frm) {
        

        // $('button.grid-add-row').hide()
        if(frm.doc.docstatus == 0){
            click_table_every_row(frm)
            click_first_row_table(frm)
        }
        set_button_label_arrow(frm)
        set_table_select_field_css(frm)
        change_table_select_field_css()

        if(frm.doc.docstatus == 1){
            frm.fields_dict.pallet_details.grid.wrapper.find(`div [data-idx="1"]`).find(`.btn-open-row`).click()
            $('.form-in-grid').click()
            $('.freeze-message').click()
        }

        setTimeout(() => {
            $('div[data-fieldtype="Button"]').find(".btn-default").hover(function(){
                $(this).css("background-color", "white");
                $(this).css("border-color: white;")
            });
    
            $('.btn-default').click(function() {
                $(this).css({"box-shadow": "none"});
              });
        }, 1000);
        
        
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
            {'button': 'results_4', 'select': 'results_select_4', 'fieldname': '[data-fieldname="results_select_4"]'},
            {'button': 'results_5', 'select': 'results_select_5', 'fieldname': '[data-fieldname="results_select_5"]'}
        ],
        'select_field': ['results_select_1', 'results_select_2', 'results_select_3', 'results_select_4', 'results_select_5']
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

let change_table_select_field_css = function () {
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
                change_select_css(frm, cdt, cdn, table_name_1, button_select, row_idx, fieldname1, select_field)
            })
        }
    }
}

let set_table_select_field_css = function (frm) {
    for (const a of table_details_list) {
        if (a.table_field_name == 'pallet_details') {
            let table_name = a.table_field_name
            let table = frm.doc[table_name]
            let table_name_1 = frm.fields_dict[table_name].grid.wrapper
            let buttons = a.table_button_details
            for (let b of buttons) {
                let fieldname1 = b.fieldname
                let select_field = b.select
                set_select_css(frm, table, table_name_1, select_field,fieldname1, cdt = undefined, cdn = undefined)
            }
        }
        else {
            let child_table_list = create_child_table_list(frm, a.table_field_name)
            if (child_table_list.length > 0) {
                for (const table_name of child_table_list) {
                    let table = frm.doc[table_name]
                    let table_name_1 = frm.fields_dict[table_name].grid.wrapper
                    let buttons = a.table_button_details
                    for (let b of buttons) {
                        let fieldname1 = b.fieldname
                        let select_field = b.select
                        set_select_css(frm, table, table_name_1, select_field,fieldname1, cdt = undefined, cdn = undefined)
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

                    if ( frm.doc.flooring_class == "LVP & WPC" && table.table_field_name == 'over_wax_and_edge_paint_'){
                        frm.fields_dict[table_name].grid.wrapper.find(`div [data-fieldname="edge_paint_select"]`).click()
                        frm.fields_dict[table_name].grid.wrapper.find('div.select-icon').hide()
                    }
                    else{
                        frm.fields_dict[table_name].grid.wrapper.find(`div ${select_field_name}`).click()
                        frm.fields_dict[table_name].grid.wrapper.find('div.select-icon').hide()
                    }
                    
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
                        frm.fields_dict[table_name].grid.update_docfield_property(b.button, "label", `<i class="fa fa-caret-right"style="border: 1px solid black; margin: 2px 0px -13px -17px; height: 23px; padding: 0px 3px; font-size:1.6rem"></i>`);
                    }
                }
            }
        }
    }
}

let update_child_table_field_property = function (frm) {
    let inner_outer_tables = create_child_table_list(frm, 'inner_and_outer_carton_details_')
    if (inner_outer_tables.length > 0) {
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

let change_select_css = function (frm, cdt, cdn, table_name, button_select, row_idx, fieldname1, select_field) {
    table_name.on('click', '.grid-row', function (event) {
        $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("border", "1px solid black");
        $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("text-align", "center");
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
            $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#76885B");
            frappe.model.set_value(cdt, cdn, select_field, 'Pass')
            break;
        case "Pass":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#CB80AB");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#CB80AB");
            frappe.model.set_value(cdt, cdn, select_field, 'Fail - Minor')
            break;
        case "Fail - Minor":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#FF8343");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#FF8343");
            frappe.model.set_value(cdt, cdn, select_field, 'Fail - Major')
            break;
        case "Fail - Major":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#B43F3F");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#B43F3F");
            frappe.model.set_value(cdt, cdn, select_field, 'Fail - Critical')
            break;
        case "Fail - Critical":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#FABC3F");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#FABC3F");
            frappe.model.set_value(cdt, cdn, select_field, 'Undetermined')
            break;
        case "Undetermined":
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#758694");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#758694");
            frappe.model.set_value(cdt, cdn, select_field, 'To Do')
            break;
        default:
            table_name.on('click', '.grid-row', function (event) {
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#758694");
                $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("color", "white");
            });
            $(`div [data-name="${row_idx}"]`).find(fieldname1).find('.ellipsis').css("background-color", "#758694");
            frappe.model.set_value(cdt, cdn, select_field, 'To Do')
    }
}

let set_select_css = function (frm, table, table_name, select_field, fieldname1, cdt = undefined, cdn = undefined) {
    table.forEach(row => {
        let row_idx = row.name
        let button_select = row[select_field]

        table_name.on('click', '.grid-row', function (event) {
            $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("border", "1px solid black");
            $(`div [data-name="${row_idx}"]`).find(`div ${fieldname1}`).find('.ellipsis').css("text-align", "center");
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

let set_row_above_table_header = function(frm){
    let color_match_tables = create_child_table_list(frm, 'color_match_and_embossing_details_')
    if (color_match_tables.length > 0) {
        for (const color_table of color_match_tables) {
            if (frm.fields_dict[color_table].grid.wrapper.find('.grid-heading-row').find('#color_table').length == 0) {
                // padding-left: 4.4%;
                    frm.fields_dict[color_table].grid.wrapper.find('.grid-heading-row').append(`
                        <div id="color_table" style="background-color: #f3f3f3;">
                            <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                                <div class="" style="width:71px"></div>
                                <div class="col grid-static-col col-xs-6 " style="">
                                </div>
                                <div class="col grid-static-col col-xs-6 text-right" style="border-left:1px solid #3b3838"> Color Match </div>
                                <div class="col grid-static-col col-xs-6 " style=""></div>
                                <div class="col grid-static-col col-xs-3 text-right" style="border-left:1px solid #3b3838"> Results </div>
                                <div class="col grid-static-col col-xs-1 " style=""></div>
                                <div class="col grid-static-col col-xs-3 text-right" style="border-left:1px solid #3b3838"> Embossing </div>
                                <div class="col grid-static-col col-xs-1 text-right" style="border-right:1px solid #3b3838;"></div>
                                <div class="" style="border-radius: 0px 10px 0px 0px; width: 30px;">
                                </div>
                            </div>
                        </div>
                        `)    
            }
            frm.fields_dict[color_table].grid.wrapper.find('.grid-heading-row').css('height', 'auto')
        }
    }

    let over_wax_tables = create_child_table_list(frm, 'over_wax_and_edge_paint_')
    if (over_wax_tables.length > 0) {
        for (const over_wax_table of over_wax_tables) {
            if (frm.fields_dict[over_wax_table].grid.wrapper.find('.grid-heading-row').find('#over_wax_table').length == 0) {
                if (frm.doc.flooring_class == 'LVP & WPC') {
                    frm.fields_dict[over_wax_table].grid.wrapper.find('.grid-heading-row').append(`
                            <div id="over_wax_table" style="background-color: #f3f3f3;" >
                                <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                                    <div class="" style="width:71px"></div>
                                    <div class="col grid-static-col col-xs-8 " style=""></div>
                                    <div class="col grid-static-col col-xs-7 text-center" style="border-right:1px solid #3b3838; border-left:1px solid #3b3838">Bevel
                                    </div>
                                    <div class="col grid-static-col col-xs-8 text-right" style="">
                                    Edge Paint
                                    </div>
                                    <div class="col grid-static-col col-xs-3 " style="">
                                    </div>
                                    <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                                    </div>
                                    <div class="" style="border-radius: 0px 10px 0px 0px; width: 30px">
                                    </div>
                                </div>
                            </div>
                    `)
                }
                else if (frm.doc.flooring_class == 'HARDWOOD FLOORING') {
                    frm.fields_dict[over_wax_table].grid.wrapper.find('.grid-heading-row').append(`
                        <div id="over_wax_table" style="background-color: #f3f3f3;" >
                                <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                                    <div class="" style="width:71px"></div>
                                    <div class="col grid-static-col col-xs-8 " style=""></div>
                                    <div class="col grid-static-col col-xs-7 text-center" style="border-right:1px solid #3b3838; border-left:1px solid #3b3838">Bevel
                                    </div>
                                    <div class="col grid-static-col col-xs-8 text-right" style="">
                                    Over Wax
                                    </div>
                                    <div class="col grid-static-col col-xs-3 " style="">
                                    </div>
                                    <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                                    </div>
                                    <div class="" style="border-radius: 0px 10px 0px 0px; width: 30px">
                                    </div>
                                </div>
                            </div>
                        `)
                } else {
                    frm.fields_dict[over_wax_table].grid.wrapper.find('.grid-heading-row').append(`
                        <div id="over_wax_table" style="background-color: #f3f3f3;" >
                            <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                                <div class="" style="width:71px"></div>
                                <div class="col grid-static-col col-xs-8 " style="border-left:1px solid #3b3838">
                                </div>
                                <div class="col grid-static-col col-xs-7 " style="border-left:1px solid #3b3838"> Bevel
                                </div>
                                <div class="col grid-static-col col-xs-3 " style="border-left:1px solid #3b3838">
                                </div>
                                <div class="col grid-static-col col-xs-1 " style="">
                                </div>
                                <div class="col grid-static-col col-xs-8 text-left" style="">Over Wax 
                                </div>
                                <div class="col grid-static-col col-xs-3 text-right" style="border-left:1px solid #3b3838">Edge Paint
                                </div>
                                <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838">
                                </div>
                                <div class="" style="border-radius: 0px 10px 0px 0px; width: 30px">
                                </div>
                            </div>
                        </div>
                        `)
                }
            }
            frm.fields_dict[over_wax_table].grid.wrapper.find('.grid-heading-row').css('height', 'auto')
        }
    }

    let gloss_level_tables = create_child_table_list(frm, 'gloss_level_details_')
    if (gloss_level_tables.length > 0) {
        for (const gloss_level_table of gloss_level_tables) {
            if (frm.fields_dict[gloss_level_table].grid.wrapper.find('.grid-heading-row').find('#gloss_level_table').length == 0) {
                frm.fields_dict[gloss_level_table].grid.wrapper.find('.grid-heading-row').append(`
                    <div id="gloss_level_table" style="background-color: #f3f3f3;">
                        <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                            <div class="" style="width:71px"></div>
                            <div class="col grid-static-col col-xs-3 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-right" style=""> Master
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style=""> Matched
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style=""> Highest
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style=""> Lowest
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style=""> Average Plank 1
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style=""> Average Plank 2
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col pointer">
                            </div>
                        </div>
                    </div>
                    
                    `)
            }
            frm.fields_dict[gloss_level_table].grid.wrapper.find('.grid-heading-row').css('height', 'auto')
        }
    }

    let moisture_content_tables = create_child_table_list(frm, 'moisture_content_details_')
    if (moisture_content_tables.length > 0) {
        for (const moisture_content_table of moisture_content_tables) {
            if (frm.fields_dict[moisture_content_table].grid.wrapper.find('.grid-heading-row').find('#moisture_content_table').length == 0) {
                frm.fields_dict[moisture_content_table].grid.wrapper.find('.grid-heading-row').append(`
                    <div id="moisture_content_table" style="background-color: #f3f3f3;">
                        <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                            <div class="" style="width:71px"></div>
                            <div class="col grid-static-col col-xs-3 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-right" style="padding-right: 5px !important;">Moisture
                            </div>
                            <div class="col grid-static-col col-xs-3 text-left" style="border-right:1px solid #3b3838; padding-left: 0px !important;">Content
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">Finished Board 1
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="" >
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;" >
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">Finished Board 2 
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">Finished Board 3
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">Finished Board 4
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="" style="border-radius: 0px 10px 0px 0px; width:30px">
                            </div>
                        </div>
                    </div>
                    `)
            }
            frm.fields_dict[moisture_content_table].grid.wrapper.find('.grid-heading-row').css('height', 'auto')
        }
    }

    let open_box_tables = create_child_table_list(frm, 'open_box_inspection_details_')
    if (open_box_tables.length > 0) {
        for (const open_box_table of open_box_tables) {
            if (frm.fields_dict[open_box_table].grid.wrapper.find('.grid-heading-row').find('#open_box_table').length == 0) {
                frm.fields_dict[open_box_table].grid.wrapper.find('.grid-heading-row').append(`
                    <div id="open_box_table" style="background-color: #f3f3f3;">
                        <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                            <div class="" style="width:71px"></div>
                            <div class="col grid-static-col col-xs-5 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="border-left:1px solid #3b3838;"> Bowing
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="border-left:1px solid #3b3838;" > Squareness
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="border-left:1px solid #3b3838;" > Ledging Overwood 
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-4 text-right" style="border-left:1px solid #3b3838; padding-right: 5px !important;"> Pad Away From the
                            </div>
                            <div class="col grid-static-col col-xs-3 text-left" style="padding-left: 0px !important;"> Locking System
                            </div>
                            <div class="col grid-static-col col-xs-1 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="" style="border-radius: 0px 10px 0px 0px; width:30px">
                            </div>
                        </div>
                    </div>
                    `)
            }
            frm.fields_dict[open_box_table].grid.wrapper.find('.grid-heading-row').css('height', 'auto')
        }
    }

    let width_tables = create_child_table_list(frm, 'width_and_thickness_details_')
    if (width_tables.length > 0) {
        for (const width_table of width_tables) {
            if (frm.fields_dict[width_table].grid.wrapper.find('.grid-heading-row').find('#width_table').length == 0) {
                frm.fields_dict[width_table].grid.wrapper.find('.grid-heading-row').append(`
                    <div id="width_table" style="background-color: #f3f3f3;">
                        <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                            <div class="" style="width:71px"></div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-right" style="border-left:1px solid #3b3838;">Width
                            </div>
                            <div class="col grid-static-col col-xs-3" style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-right" style="border-left:1px solid #3b3838; padding-right: 5px !important;"> Thickness without 
                            </div>
                            <div class="col grid-static-col col-xs-3 text-left" style="padding-left: 0px !important;"> padding
                            </div>
                            <div class="col grid-static-col col-xs-3 text-right" style="border-left:1px solid #3b3838; padding-right: 5px !important;">Thickness with 
                            </div>
                            <div class="col grid-static-col col-xs-3 text-left" style="padding-left: 0px !important;">Padding
                            </div>
                            <div class="col grid-static-col col-xs-3" style="border-left:1px solid #3b3838;"> 
                            </div>
                            <div class="col grid-static-col col-xs-3" style=""> Manual Pull Test
                            </div>
                            <div class="col grid-static-col col-xs-1" style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="" style="border-radius: 0px 10px 0px 0px; width:30px">
                            </div>
                        </div>
                    </div>
                    `)
            }
            frm.fields_dict[width_table].grid.wrapper.find('.grid-heading-row').css('height', 'auto')
        }
    }
}

frappe.ui.form.on("Over Wax and Edge Paint Ql", {
    over_wax_select(frm, cdt, cdn) {
        let row = locals[cdt][cdn]
        if (row.over_wax_select) {
            let table_no = row.parentfield.slice(-1)
            if (['Fail - Minor', 'Fail - Major', 'Fail - Critical'].includes(row.over_wax_select)) {
                if (!row.finished_board) {
                    frappe.msgprint({
                        title: __('<span style="color:#b52a2a">Mandatory</span>'),
                        indicator: 'red',
                        message: __('<p style="color:#b52a2a; font-size: 1rem;">Please upload image of failed overwax finished board for following : <br> Table {0} : Row {1} : {2} </p>',[table_no,  row.idx, row.item_color])
                    });
                }
            }
        }
    }
})

frappe.ui.form.on("Open Box Inspection Details QI", {
    pad_away_select(frm, cdt, cdn) {
        let row = locals[cdt][cdn]
        if (row.pad_away_select) {
            let table_no = row.parentfield.slice(-1)
            if (['Fail - Minor', 'Fail - Major', 'Fail - Critical'].includes(row.pad_away_select)) {
                if (!row.finished_board) {
                    frappe.msgprint({
                        title: __('<span style="color:#b52a2a">Mandatory</span>'),
                        indicator: 'red',
                        message: __('<p style="color:#b52a2a; font-size: 1rem;">Please upload image of failed Pad finished board for following : <br> Table {0} : Row {1} : {2} </p>',[table_no,  row.idx, row.item_color])
                    });
                }
            }
        }
    }
})