// Copyright (c) 2024, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Quality Control QI', {
    onload(frm) {
        setStatusInTableField(frm)
    },

    refresh(frm) {
        clickStatusColOfEachRow(frm)

        setTimeout(() => {
            $('button.grid-add-row').hide()
        }, 1000)

        update_child_table_field_property(frm)
        set_html_details(frm)
        set_row_above_table_header(frm)

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
                                            { name: 'TAS PO', id: 'tas_po', editable: false, dropdown: false, },
                                            { name: 'Vendor', id: 'vendor', editable: false, dropdown: false, }],
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

                                    $(".datatable").ready(function () {
                                        console.log("Datatable is ready!!!")
                                        $("#preloader").remove();
                                    })
                                }
                                else {
                                    $(".datatable").ready(function () {
                                        $("#preloader").remove();
                                    })
                                    setTimeout(() => {
                                        this.$child_selection_area = dialog.fields_dict.child_selection_area.$wrapper
                                        if (this.$child_selection_area.find("#nodata").length == 0) {
                                            this.$child_selection_area.prepend('<div id="nodata" class="text-center" style="color:#b52a2a">No Data Found...</div>');
                                        }
                                    }, 100);
                                }
                            }
                        })
                    }

                    let get_tas_po_items = function () {
                        frappe.call({
                            method: "quality_inspection.quality_inspection.doctype.quality_control_qi.quality_control_qi.get_tas_po_items",
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
                                        row["qty"],
                                        row["color"] || ''])
                                    });
                                    this.$child_wrapper = dialog.fields_dict.child_selection_area.$wrapper;
                                    this.$child_wrapper.addClass("my-3");

                                    dialog.child_datatable = new DataTable(this.$child_wrapper.get(0), {
                                        columns: [
                                            { name: 'TAS PO', id: 'tas_po', editable: false, dropdown: false, },
                                            { name: 'Item No', id: 'item_no', editable: false, dropdown: false, },
                                            { name: 'Qty', id: 'qty', editable: false, dropdown: false, },
                                            { name: 'Color', id: 'color', editable: false, dropdown: false, },
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

                                    $(".datatable").ready(function () {
                                        console.log("Datatable is ready!!!")
                                        $("#preloader").remove();
                                    })
                                }
                                else {
                                    $(".datatable").ready(function () {
                                        $("#preloader").remove();
                                    })
                                    setTimeout(() => {
                                        this.$child_selection_area = dialog.fields_dict.child_selection_area.$wrapper
                                        if (this.$child_selection_area.find("#nodata").length == 0) {
                                            this.$child_selection_area.prepend('<div id="nodata" class="text-center" style="color:#b52a2a">No Data Found...</div>');
                                        }
                                    }, 100);
                                }
                            }
                        })
                    }

                    let loading_html = function () {
                        setTimeout(() => {
                            this.$loading_html = dialog.fields_dict.loading_html.$wrapper
                            if (this.$loading_html.find("#preloader").length == 0) {
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

                                if (dialog.get_field("allow_child_item_selection").value == 1) {
                                    for (const i of checked_items) {
                                        let row_data = datatable_data[i]
                                        selected_items_list.push({
                                            "tas_po": row_data[0],
                                            "item_no": row_data[1],
                                            "qty": row_data[2],
                                            "color": row_data[3],
                                        })
                                    }

                                    frappe.call({
                                        method: "make_quality_control_item_using_tas_po_items",
                                        doc: frm.doc,
                                        args: selected_items_list,
                                    })
                                        .then(() => {
                                            refresh_field("tas_po_name_1");
                                        });
                                }
                                else {
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
        }
    },

    flooring_class: function (frm){
        update_child_table_field_property(frm)
        frm.save()
    },

})

const setStatusInTableField = function (frm) {
    for (const table of table_details) {
        if (table.table_field_name == 'pallet_details') {
            bindStatusOnRender(frm, table.table_field_name, 'button_select')
        }
        else {
            const table_list = create_child_table_list(frm, table.table_field_name)
            if (table_list.length > 0) {
                for (const t of table_list) {
                    for (const button of table.button_list) {
                        bindStatusOnRender(frm, t, button)
                    }
                }
            }
        }
    }
}

const clickStatusColOfEachRow = function (frm) {
    for (const table of table_details) {
        if (table.table_field_name == 'pallet_details') {
            frm.fields_dict["pallet_details"].grid.grid_rows.forEach((row, idx) => {
                row.columns['button_select'].click()
            })
        }
        else {
            const table_list = create_child_table_list(frm, table.table_field_name)
            if (table_list.length > 0) {
                for (const table_name of table_list) {
                    frm.fields_dict[table_name].grid.grid_rows.forEach((row, idx) => {
                        row.columns[table.button_list[0]].click()
                    })
                }
            }
        }
    }
}

const create_child_table_list = function (frm, child_table) {
    let child_table_list = []
    if (frm.doc.no_of_po > 0) {
        for (let i = 0; i < frm.doc.no_of_po; i++) {
            let child_table_name = child_table + (i + 1)
            child_table_list.push(child_table_name)
        }
    }
    return child_table_list
}

const table_details = [
    {
        'table_name': "Pallet Information QI",
        'table_field_name': "pallet_details",
        'button_list': ['button_select']
    },
    {
        'table_name': "Inner and Outer Carton Details QI",
        'table_field_name': "inner_and_outer_carton_details_",
        'button_list': ['hologram_select', 'carb_select', 'floor_select', 'shink_wrap_select', 'insert_sheet_select']
    },
    {
        'table_name': "Color Match and Embossing Details QI",
        'table_field_name': "color_match_and_embossing_details_",
        'button_list': ['results_select', 'embossing_select']
    },
    {
        'table_name': "Over Wax and Edge Paint QI",
        'table_field_name': "over_wax_and_edge_paint_",
        'button_list': ['over_wax_select', 'edge_paint_select']
    },
    {
        'table_name': "Gloss Level Details QI",
        'table_field_name': "gloss_level_details_",
        'button_list': ['results_select_1', 'results_select_2', 'results_select_3', 'results_select_4', 'results_select_5']
    },
    {
        'table_name': "Moisture Content Details QI",
        'table_field_name': "moisture_content_details_",
        'button_list': ['results_select_1', 'results_select_2', 'results_select_3', 'results_select_4', 'results_select_5']
    },
    {
        'table_name': "Open Box Inspection Details QI",
        'table_field_name': "open_box_inspection_details_",
        'button_list': ['bowing_select', 'squareness_select', 'ledging_overwood_select', 'pad_away_select']
    },
    {
        'table_name': "Width And Thickness Details QI",
        'table_field_name': "width_and_thickness_details_",
        'button_list': ['manual_select']
    }
]


const statusColorMap = {
    "To Do": "#758694",
    "Pass": "#76885B",
    "Fail - Minor": "#CB80AB",
    "Fail - Major": "#FF8343",
    "Fail - Critical": "#B43F3F",
    "Undetermined": "#FABC3F",
}

const btn_template = `
                <button class="float-status-btn" title="Change Status">
                    <i class="fa fa-solid fa-play"></i>
                    
                </button>
            `

const getStatusColor = (status) => {
    return statusColorMap[status] || statusColorMap["Undetermined"]
}

const getNextItem = (currentItem) => {
    const list = Object.keys(statusColorMap)
    const index = list.indexOf(currentItem);
    if (index === -1 || index === list.length - 1) {
        return list[0];
    }
    return list[index + 1];
}

const set_style = (el, status) => {
    if (!el.length)
        return;
    el.css({
        'background-color': getStatusColor(status),
        'text-align': 'center',
        'color': 'white',
        'font-size': '15px',
        'border': '1px solid black',
        'border-radius': '8px',
        'padding-right': '8%'
    });
}


function bindStatusOnRender(frm, child_table, fieldname) {

    const _attach_button = (grid_row, doctype, fieldname) => {
        // fn to attach a floating btn and handle btn click, 
        // used if not using handling cell events 
        grid_row.wrapper.find(`[data-fieldname="${fieldname}"]`).each(function () {
            const $cell = $(this);

            if ($cell.find('.float-status-btn').length) return;

            const $btn = $(btn_template);

            $cell.css('position', 'relative');
            $cell.append($btn);

            $btn.on('click', function (e) {
                e.stopPropagation();
                let cdn = $cell.closest('.grid-row').attr('data-name')
                // console.log('clicked for:', cdn);

                const current_state = locals[doctype][cdn][fieldname];
                const next_state = getNextItem(current_state);
                frappe.model.set_value(doctype, cdn, fieldname, next_state)

                set_style($(e.currentTarget).closest(`.grid-row`).find(`[data-fieldname=${fieldname}] input`), next_state);
                $(e.currentTarget).closest(`.grid-row`).find(`[data-fieldname=${fieldname}] input`).css({
                    'margin': 'auto',
                    'width': '90%'
                })
                set_style($(e.currentTarget).closest(`.grid-row`).find(`[data-fieldname=${fieldname}] div.static-area.ellipsis`), next_state);
            });
        });
    }
    $(frm.wrapper).on("grid-row-render", function (e, grid_row) {
        console.log('grid-row-render')

        if (grid_row.parent_df.fieldname !== child_table)
            return

        // set style on first render after refresh

        if (grid_row.columns[fieldname]) {
            set_style(grid_row.columns[fieldname].find('.static-area.ellipsis'), grid_row.doc[fieldname])
        }

        // set style when row is focussed
        // as grid row does a make_column and creates input newly each time
        grid_row.wrapper.on("focus", ".col", (e, f) => {
            console.log('focus grid-row')
            let val = locals[grid_row.doc.doctype][grid_row.doc.name][fieldname];

            set_style($(e.currentTarget).closest(".data-row")
                .find(`input[data-fieldname="${fieldname}"]`), val)

            $(e.currentTarget).closest(".data-row").find(`input[data-fieldname="${fieldname}"]`).css({
                'margin': 'auto',
                'width': '90%'
            })
            // console.log($(e.currentTarget).closest(".data-row").find(`input[data-fieldname="${fieldname}"]`), "====================")
        })

        // comment if using bindStatusColumn
        _attach_button(grid_row, grid_row.doc.doctype, fieldname)

    });
}

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

let update_child_table_field_property = function (frm) {
    let inner_outer_tables = create_child_table_list(frm, 'inner_and_outer_carton_details_')
    if (inner_outer_tables.length > 0) {
        for (const inner_table of inner_outer_tables) {
            if (frm.doc.flooring_class == 'LVP & WPC') {
                frm.fields_dict[inner_table].grid.update_docfield_property("carb_select", "hidden", 1);
                frm.fields_dict[inner_table].grid.update_docfield_property("carb_select", "in_list_view", 0);
                frm.fields_dict[inner_table].grid.reset_grid();
            }
            else{
                frm.fields_dict[inner_table].grid.update_docfield_property("carb_select", "hidden", 0);
                frm.fields_dict[inner_table].grid.update_docfield_property("carb_select", "in_list_view", 1);
                frm.fields_dict[inner_table].grid.reset_grid();
            }
        }
    }

    let over_wax_tables = create_child_table_list(frm, 'over_wax_and_edge_paint_')
    if (over_wax_tables.length > 0) {
        for (const over_table of over_wax_tables) {
            if (frm.doc.flooring_class == 'LVP & WPC') {
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax_select", "hidden", 1);
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax_select", "in_list_view", 0);
            }
            else{
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax_select", "hidden", 0);
                frm.fields_dict[over_table].grid.update_docfield_property("over_wax_select", "in_list_view", 1);
            }

            if(frm.doc.flooring_class == 'HARDWOOD FLOORING'){
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint_select", "hidden", 1);
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint_select", "in_list_view", 0);
            }
            else{
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint_select", "hidden", 0);
                frm.fields_dict[over_table].grid.update_docfield_property("edge_paint_select", "in_list_view", 1);
            }
            frm.fields_dict[over_table].grid.reset_grid();
        }
    }
}


let set_row_above_table_header = function(frm){
    let color_match_tables = create_child_table_list(frm, 'color_match_and_embossing_details_')
    if (color_match_tables.length > 0) {
        for (const color_table of color_match_tables) {
            if (frm.fields_dict[color_table].grid.wrapper.find('.grid-heading-row').find('#color_table').length == 0) {
                // padding-left: 4.4%;
                    frm.fields_dict[color_table].grid.wrapper.find('div.grid-heading-row').prepend(`
                        <div id="color_table" style="background-color: #f3f3f3;">
                            <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                                <div class="" style="width:71px"></div>
                                <div class="col grid-static-col col-xs-6 " style="">
                                </div>
                                <div class="col grid-static-col col-xs-6 text-right" style="border-left:1px solid #3b3838"> Color Match </div>
                                <div class="col grid-static-col col-xs-6 " style=""></div>
                                <div class="col grid-static-col col-xs-4 text-center" style="border-left:1px solid #3b3838"> Results </div>
                                <div class="col grid-static-col col-xs-4 text-center" style="border-left:1px solid #3b3838"> Embossing </div>
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
                    frm.fields_dict[over_wax_table].grid.wrapper.find('div.grid-heading-row').prepend(`
                            <div id="over_wax_table" style="background-color: #f3f3f3;" >
                                <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                                    <div class="" style="width:71px"></div>
                                    <div class="col grid-static-col col-xs-8 " style=""></div>
                                    <div class="col grid-static-col col-xs-7 text-center" style="border-right:1px solid #3b3838; border-left:1px solid #3b3838">Bevel
                                    </div>
                                    <div class="col grid-static-col col-xs-8 text-right" style="">
                                    Edge Paint
                                    </div>
                                    <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;">
                                    </div>
                                    <div class="" style="border-radius: 0px 10px 0px 0px; width: 30px">
                                    </div>
                                </div>
                            </div>
                    `)
                }
                else if (frm.doc.flooring_class == 'HARDWOOD FLOORING') {
                    frm.fields_dict[over_wax_table].grid.wrapper.find('div.grid-heading-row').prepend(`
                        <div id="over_wax_table" style="background-color: #f3f3f3;" >
                                <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                                    <div class="" style="width:71px"></div>
                                    <div class="col grid-static-col col-xs-8 " style=""></div>
                                    <div class="col grid-static-col col-xs-7 text-center" style="border-right:1px solid #3b3838; border-left:1px solid #3b3838">Bevel
                                    </div>
                                    <div class="col grid-static-col col-xs-4 ">
                                    </div>
                                    <div class="col grid-static-col col-xs-8 text-left"  style="border-right:1px solid #3b3838;">
                                    Over Wax
                                    </div>
                                    <div class="" style="border-radius: 0px 10px 0px 0px; width: 30px">
                                    </div>
                                </div>
                            </div>
                        `)
                } else {
                    frm.fields_dict[over_wax_table].grid.wrapper.find('div.grid-heading-row').prepend(`
                        <div id="over_wax_table" style="background-color: #f3f3f3;" >
                            <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                                <div class="" style="width:71px"></div>
                                <div class="col grid-static-col col-xs-8 " style="border-left:1px solid #3b3838">
                                </div>
                                <div class="col grid-static-col col-xs-7 text-center" style="border-left:1px solid #3b3838"> Bevel
                                </div>
                                <div class="col grid-static-col col-xs-4 " style="border-left:1px solid #3b3838">
                                </div>
                                <div class="col grid-static-col col-xs-8 text-left" style="">Over Wax 
                                </div>
                                <div class="col grid-static-col col-xs-4 text-center" style="border-left:1px solid #3b3838; border-right:1px solid #3b3838">Edge Paint
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
                frm.fields_dict[gloss_level_table].grid.wrapper.find('div.grid-heading-row').prepend(`
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
                            <div class="col grid-static-col col-xs-3 text-center" style=""> Matched
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-center" style=""> Highest
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-center" style=""> Lowest
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-center" style=""> Average Plank 1
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-center" style=""> Average Plank 2
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;">
                            </div>
                           <div class="" style="border-radius: 0px 10px 0px 0px; width: 30px">
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
                frm.fields_dict[moisture_content_table].grid.wrapper.find('div.grid-heading-row').prepend(`
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
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;" >
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">Finished Board 2 
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">Finished Board 3
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 " style="">Finished Board 4
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;">
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
                frm.fields_dict[open_box_table].grid.wrapper.find('div.grid-heading-row').prepend(`
                    <div id="open_box_table" style="background-color: #f3f3f3;">
                        <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                            <div class="" style="width:71px"></div>
                            <div class="col grid-static-col col-xs-5 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-center" style="border-left:1px solid #3b3838;"> Bowing
                            </div>
                            <div class="col grid-static-col col-xs-3 text-center" style="border-left:1px solid #3b3838;" > Squareness
                            </div>
                            <div class="col grid-static-col col-xs-3 text-center" style="border-left:1px solid #3b3838;" > Ledging Overwood 
                            </div>
                            <div class="col grid-static-col col-xs-4 text-right" style="border-left:1px solid #3b3838; padding-right: 5px !important;"> Pad Away From the
                            </div>
                            <div class="col grid-static-col col-xs-3 text-left" style="padding-left: 0px !important; border-right:1px solid #3b3838;"> Locking System
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
                frm.fields_dict[width_table].grid.wrapper.find('div.grid-heading-row').prepend(`
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
                            <div class="col grid-static-col col-xs-4" style="border-right:1px solid #3b3838;"> Manual Pull Test
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

frappe.ui.form.on("Over Wax and Edge Paint QI", {
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