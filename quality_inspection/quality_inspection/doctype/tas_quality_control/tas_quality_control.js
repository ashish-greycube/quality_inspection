// Copyright (c) 2024, GreyCube Technologies and contributors
// For license information, please see license.txt

//////////////// Whenever a child table field is updated, the following will also be updated: ////////////////
// JS: table_details, set_row_above_table_header, update_child_table_field_property(if display depends on condition)
// PY: doc_tab_wise_field_list (field_list), set_attachments_details, fill_missing_data_details (if display depends on condition)
// html: document_report_pdf.html

frappe.ui.form.on('TAS Quality Control', {
    onload(frm) {
        setStatusInTableField(frm)
        if(frm.doc.docstatus < 2) {
            frm.call("set_default_values_and_guidelines")
        }
        // ("[data-fieldname='color_equipment']").scrollIntoView();
        frm.set_query('installation_id', 'pallet_details', () => {
            return {
                filters: {
                    flooring_class: frm.doc.flooring_class || '',
                }
            }
        })

        frm.set_query('user', () => {
            return {
                query: "quality_inspection.quality_inspection.doctype.tas_quality_control.tas_quality_control.get_qi_users_list",
            };
        })
    },

    refresh(frm) {
        bindAttachButton(frm)
        if (frm.doc.docstatus > 0 && (frappe.user.has_role("System Manager") || frappe.user.has_role("QI Manager") || frappe.user.has_role("Quality User Internal"))){
            frm.set_df_property("tas_po_details", "read_only", 1)
        }
        if (frm.doc.docstatus < 2 && !frm.is_new()) {
            ////////////// Create PDF //////////////
            frm.add_custom_button(__("Report"), () => {
                // let url = `/api/method/quality_inspection.quality_inspection.doctype.tas_quality_control.tas_quality_control.get_document_report_pdf`;
                // let args = {
                //     doc: frm.doc
                // };
                // open_url_post(url, args, true);
                frappe.call({
                    method: "quality_inspection.quality_inspection.doctype.tas_quality_control.tas_quality_control.get_document_report_pdf",
                    args: {
                        "doc": frm.doc
                    }
                })
            })

            clickStatusColOfEachRow(frm)
        }

        setTimeout(hideGridBulkActionButtons, 1000)
        setTimeout(hideFormSidebar, 50)

        update_child_table_field_property(frm)
        set_html_details(frm)
        set_row_above_table_header(frm)
        set_pallet_details_each_row_property(frm)

        if (!frm.is_new() && frm.doc.workflow_state === "Draft" && (frappe.user.has_role("System Manager") || frappe.user.has_role("QI Manager") || frappe.user.has_role("Quality User Internal"))) {
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
                            label: __("Allow Primary item selection"),
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
                        // console.log("------get_tas_po------")
                        frappe.call({
                            method: "quality_inspection.quality_inspection.doctype.tas_quality_control.tas_quality_control.get_tas_po",
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
                            method: "quality_inspection.quality_inspection.doctype.tas_quality_control.tas_quality_control.get_tas_po_items",
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

    flooring_class: function (frm) {
        update_child_table_field_property(frm)
        frm.save()
    },

    before_workflow_action: async (frm) => {
        if (frm.doc.workflow_state){

            const r = await frappe.db.set_value(frm.doc.doctype, frm.doc.name, {
                previous_workflow_state: frm.doc.workflow_state,
                previous_workflow_actor: frm.doc.last_workflow_actor || ''
            })
            if (r && r.message) {
                frm.doc.modified = r.message.modified
                frm.doc.previous_workflow_state = r.message.previous_workflow_state
                frm.doc.previous_workflow_actor = r.message.previous_workflow_actor
            }
        }

        if (frm.doc.workflow_state && frm.doc.workflow_state == "Completed"){
            await check_missing_data_before_completion(frm)
        }

        if (frm.doc.workflow_state && ["Approved", "Rejected - Closed"].includes(frm.doc.workflow_state)) {
            // console.log("========before_workflow_action==========")
            await take_notes_on_workflow_action_change(frm, "Cancelled")
        }
    },
    after_workflow_action: (frm) => {
        // console.log("========after_workflow_action==========")
        if (frm.doc.docstatus < 2){
            take_notes_on_workflow_action_change(frm, frm.doc.workflow_state)
        }
    },
})

// Only the bulk add/remove-row buttons 
function hideGridBulkActionButtons() {
    $(`div.form-group button.grid-add-row`).hide()
    $(`div.form-group button.grid-remove-rows`).hide()
    $(`div.form-group button.grid-remove-all-rows`).hide()
    $(`div.modal-dialog button.grid-add-row`).show()
    $(`div.modal-dialog button.grid-remove-rows`).show()
}

function hideFormSidebar() {
    $(`div[data-page-route="TAS Quality Control"] div.col-lg-2.layout-side-section`).hide()
}

function bindAttachButton(frm) {
    if (frm.doc.docstatus <= 1) {
        const po_table_list = create_child_table_list(frm, "quality_control_item_")
        if (po_table_list.length > 0) {
            for (const table_name of po_table_list) {
                cur_frm.fields_dict[table_name].$wrapper.find('.grid-body .rows').find(".grid-row").each(function (i, item) {
                    $(item).find('[data-fieldname="add_attachments"]').css({
                        "display": "flex",
                        "justify-content": "center",
                        "align-items": "center",
                        "width": "100%",
                        "height": "100%",
                    })
                    $(item).find('[data-fieldname="add_attachments"]').empty().append(`<button class="btn btn-primary btn-xs" style="line-height: 1rem; font-size: 0.8rem; border-radius: 6px; background-color: #4c90ad; font-weight: bold;">Attach</button>`).click(function (e) {
                        e.preventDefault()
                        let cdn = $(item).attr('data-name')
                        let cdt = cur_frm.fields_dict[table_name].grid.doctype
                        let row = locals[cdt][cdn]
                        show_multi_attach_dialog(frm, row, table_name)
                    })
                });
            }
        }
    }
}

function show_multi_attach_dialog(frm, row, table_name) {
    let pending = [];
    let uploaded_count = 0;

    let add_disclosure_row = (file_url) => {
        frm.add_child('additional_disclosure', {
            po: row.tas_po_ref || table_name,
            item_color: row.item_color,
            attachment: file_url,
            remark: $remark.val() || '',
        });
        frm.refresh_field('additional_disclosure');
        frm.dirty();
    };

    let file_uploader = new frappe.ui.FileUploader({
        doctype: frm.doctype,
        docname: frm.docname,
        allow_multiple: true,
        dialog_title: __('Add Attachments') + (row.item_color ? ` - ${row.item_color}` : ''),
        on_success: (file_doc) => {
            uploaded_count++;
            if (file_doc.file_url) {
                add_disclosure_row(file_doc.file_url);
            } else {
                let p = frappe.call({
                    method: 'frappe.client.get_value',
                    args: {
                        doctype: 'File',
                        filters: { name: file_doc.name },
                        fieldname: 'file_url',
                    },
                    callback: function (res) {
                        if (res.message && res.message.file_url) {
                            add_disclosure_row(res.message.file_url);
                        }
                    }
                });
               
                pending.push(p);
            }
        }
    });

    let dialog = file_uploader.dialog;
    let $body = $(dialog.body);

    // Sits as a sibling right after the uploader's own root element (drop-zone +
    // file preview area), so it is untouched by the uploader's own re-renders.
    let $remark_wrapper = $(`
        <div class="custom-attachment-remark" style="display:none; margin-top:15px; padding-top:15px; border-top:1px solid var(--border-color);">
            <label class="control-label" style="padding-bottom:5px;">${__('Remark')}</label>
            <textarea class="form-control" rows="2"
                placeholder="${__('This remark will be saved against every attachment added above')}"></textarea>
            <p class="text-muted small" style="margin-top:3px;">${__('Applies to all files selected in this upload')}</p>
        </div>
    `).appendTo($body);
    let $remark = $remark_wrapper.find('textarea');

    // FileUploader's file preview area uses v-show (toggles inline display:none),
    // so watch for that instead of hooking into Vue internals.
    let observer = new MutationObserver(() => {
        let has_files = $body.find('.file-preview-area').is(':visible');
        $remark_wrapper.toggle(has_files);
    });
    observer.observe($body.get(0), { attributes: true, subtree: true, attributeFilter: ['style'] });

    dialog.$wrapper.one('hidden.bs.modal', () => {
        observer.disconnect();
        Promise.all(pending).then(() => {
            if (uploaded_count > 0) {
                frm.refresh_field('additional_disclosure');
                frm.save();
            }
        });
    });
}

const check_missing_data_before_completion = async function (frm) {
    frappe.dom.unfreeze()
    let promise = new Promise((resolve, reject) => {
        frappe.confirm('Are you sure you want to proceed?',
            async () => {
                await frm.reload_doc()
                frappe.call({
                    method: "check_all_data_mark_as_completed",
                    doc: frm.doc,
                })
                    .then(() => {
                        refresh_field("missing_data_details");
                        // console.log("===================")
                        resolve()
                    })
            }, () => {
                // action to perform if No is selected
                frm.reload_doc();
                reject()
            })
    })

    await promise.then(() => {});
}

const take_notes_on_workflow_action_change = async function (frm, action) {
    await frm.reload_doc()

    let dialog_field = []

    dialog_field.push(
        {
            fieldtype: "Table MultiSelect",
            fieldname: "tags",
            label: __("Tags"),
            options: "Quality Tags Table QI",
            read_only: 0,
        }
    )

    let table_fields = [
        {
            fieldtype: "Link",
            fieldname: "tab_field",
            label: __("Tab-Fieldname"),
            options: "Tab Wise Field Name QI",
            read_only: 0,
            in_list_view: 1,
        },
        {
            fieldtype: "Small Text",
            fieldname: "notes",
            label: __("Notes"),
            read_only: 0,
            in_list_view: 1,
        }
    ]

    if (frm.doc.workflow_state && ["Approved", "Rejected", "On Hold", "Cancelled"].includes(frm.doc.workflow_state)) {
        dialog_field.push(
            {
                label: "Notes (Field Wise)",
                fieldname: "field_wise_notes",
                fieldtype: "Table",
                cannot_add_rows: false,
                cannot_delete_rows: false,
                in_place_edit: false,
                reqd: 0,
                fields: table_fields,
            })
    }
    else {
        dialog_field.push(
            {
                fieldtype: "Small Text",
                fieldname: "notes",
                label: __("Notes"),
                read_only: 0,
            })
    }
    

    let promise = new Promise((resolve, reject) => {
    frappe.dom.unfreeze()
    dialog = new frappe.ui.Dialog({
        title: __("Notes"),
        fields: dialog_field,
        primary_action_label: 'Add Notes',
        primary_action: async function (values) {
            // console.log(values, "===========values========")
            if (values) {
                let remarks = [values]
                await frappe.call({
                    method: "fill_remarks_table",
                    doc: frm.doc,
                    args: {
                        "remarks" : remarks,
                        "action": action
                    },
                })
                // Must finish reloading frm.doc BEFORE resolve()
                await frm.reload_doc()
                refresh_field("quality_remarks");
                resolve()
            }
            dialog.hide()

        },
        secondary_action_label: __('Skip'),
        secondary_action: async () => {
            await frappe.call({
                    method: "set_comments_details",
                    doc: frm.doc,
                    args: {
                        "action": action
                    },
                })
            dialog.hide()
            await frm.reload_doc()
            resolve()
        },
    })

    dialog.show()
    })
    await promise.then(() => {});
}

//  set css in table columns based on values/data
const setStatusInTableField = function (frm) {
    if (frm.doc.docstatus <= 1) {
        for (const table of table_details) {
        if (table.table_field_name == 'pallet_details') {
            // bindStatusOnRender(frm, table.table_field_name, 'button_select')
            for (const button of table.button_list) {
                bindStatusOnRender(frm, table.table_field_name, button)
            }
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
}

// click every row to tables to reflact css/button
const clickStatusColOfEachRow = function (frm) {
    if (frm.doc.docstatus < 1) {
        for (const table of table_details) {
            if (table.table_field_name == 'pallet_details') {
                frm.fields_dict["pallet_details"].grid.grid_rows.forEach((row, idx) => {
                    row.columns['installation_status'].click()
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
}

// create child table name list
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
        'button_list': ['button_select', 'installation_status', 'iipa']
    },
    {
        'table_name': "Inner and Outer Carton Details QI",
        'table_field_name': "inner_and_outer_carton_details_",
        'button_list': ['hologram_select', 'carb_select', 'floor_select', 'shink_wrap_select', 'insert_sheet_select', 'title_iv', 'mfg_production_run', 'item_matches_ir_tag']
    },
    {
        'table_name': "Color Match and Embossing Details QI",
        'table_field_name': "color_match_and_embossing_details_",
        'button_list': ['results_select', 'embossing_select', 'pattern_repeat']
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
        'button_list': ['bowing_select', 'ledging_overwood_select', 'max_opening_result', 'pad_away_select', 'master_depth_result','depth_result']
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
    "Not Applicable": "#5EABD6",
}

const btn_template = `
                <button class="float-status-btn" title="Change Status">
                    <i class="fa fa-solid fa-play"></i>
                    
                </button>
            `

// get color based on status value
const getStatusColor = (status) => {
    return statusColorMap[status] || statusColorMap["Undetermined"]
}

// get next status
const getNextItem = (currentItem) => {
    const list = Object.keys(statusColorMap)
    const index = list.indexOf(currentItem);
    if (index === -1 || index === list.length - 1) {
        return list[0];
    }
    return list[index + 1];
}

// set css in data field
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

            if (!frm.is_new() && frm.doc.docstatus == 0) {
                if ((frappe.user.has_role("Quality User External") || frappe.user.has_role("Quality User Internal")) && ["Pending Approval", "On Hold"].includes(frm.doc.workflow_state)){}
                else{
                    $cell.append($btn);
                }
            }

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
        // console.log('grid-row-render')

        if (grid_row.parent_df.fieldname !== child_table)
            return

        // set style on first render after refresh

        if (grid_row.columns[fieldname]) {
            set_style(grid_row.columns[fieldname].find('.static-area.ellipsis'), grid_row.doc[fieldname])
        }

        // set style when row is focussed
        // as grid row does a make_column and creates input newly each time
        grid_row.wrapper.on("focus", ".col", (e, f) => {
            // console.log('focus grid-row')
            let val = locals[grid_row.doc.doctype][grid_row.doc.name][fieldname];

            set_style($(e.currentTarget).closest(".data-row")
                .find(`input[data-fieldname="${fieldname}"]`), val)

            $(e.currentTarget).closest(".data-row").find(`input[data-fieldname="${fieldname}"]`).css({
                'margin': 'auto',
                'width': '90%'
            })
            // console.log($(e.currentTarget).closest(".data-row").find(`input[data-fieldname="${fieldname}"]`), "====================")
        })

        if (frm.doc.docstatus == 0) {
            _attach_button(grid_row, grid_row.doc.doctype, fieldname)
        }

    });
}

let make_html = function (frm, field_name, html_details) {
    if (
        frm.fields_dict[field_name] &&
        frm.is_new() == undefined &&
        frm.doc.__onload && html_details in frm.doc.__onload
    ) {
        frm.set_df_property(field_name, 'options', frm.doc.__onload[html_details])
        frm.refresh_field(field_name)
    } else {
        frm.set_df_property(field_name, 'options', "<div><div>")
        frm.refresh_field(field_name)
    }
}

let set_html_details = function (frm) {
    make_html(frm, "pallet", "pallet_html")
    make_html(frm, "inner", "inner_outer_html")
    make_html(frm, "color", "color_match_html")
    make_html(frm, "over_wax", "over_wax_html")
    make_html(frm, "gloss_level", "gloss_level_html")
    make_html(frm, "moisture", "moisture_html")
    make_html(frm, "open_box", "open_box_html")
    make_html(frm, "width_thick", "width_thickness_html")
}

function toggleRowFieldsDisplay(grid, rowname, fieldnames, visible) {
    const grid_row = grid.grid_rows_by_docname[rowname]
    for (const fieldname of fieldnames) {
        grid_row.toggle_display(fieldname, visible)
    }
}

function toggleRowFloatButton(grid, rowname, fieldname, show) {
    grid.wrapper.find(`div[data-name="${rowname}"] div[data-fieldname="${fieldname}"] button.float-status-btn`).css('display', show ? '' : 'none')
}

let set_pallet_details_each_row_property = function (frm) {
    const grid = frm.fields_dict['pallet_details'].grid

    frm.doc.pallet_details.forEach(e => {
        if (e.pallet_type == "Plywood") {
            toggleRowFieldsDisplay(grid, e.name, ['corner_height', 'current_width', 'height_photo', 'width_photo', 'button_select'], true)
            toggleRowFieldsDisplay(grid, e.name, ['iipa', 'ippc_photo'], false)
            toggleRowFloatButton(grid, e.name, 'iipa', false)
            toggleRowFloatButton(grid, e.name, 'button_select', true)
        }
        else if (e.pallet_type == "Hardwood") {
            toggleRowFieldsDisplay(grid, e.name, ['iipa', 'ippc_photo'], true)
            toggleRowFieldsDisplay(grid, e.name, ['corner_height', 'current_width', 'height_photo', 'width_photo', 'button_select'], false)
            toggleRowFloatButton(grid, e.name, 'button_select', false)
            toggleRowFloatButton(grid, e.name, 'iipa', true)
        }
        else {
            toggleRowFieldsDisplay(grid, e.name, ['corner_height', 'current_width', 'width', 'button_select', 'height_photo', 'width_photo', 'ippc_photo'], false)
            toggleRowFloatButton(grid, e.name, 'iipa', false)
            toggleRowFloatButton(grid, e.name, 'button_select', false)
        }
    })

    if (frm.doc.docstatus == 0) {
        grid.grid_rows.forEach((row) => {
            row.columns['button_select'].click()
        })
    }
}

// Show (in_list_view=1, hidden=0) or hide (hidden=1, in_list_view=0) a set of grid
// columns in one shot. Replaces the repeated hidden/in_list_view pairs per field/table.
function setFieldsVisibility(grid, fieldnames, visible) {
    for (const fieldname of fieldnames) {
        grid.update_docfield_property(fieldname, "hidden", visible ? 0 : 1)
        grid.update_docfield_property(fieldname, "in_list_view", visible ? 1 : 0)
    }
}

// based on conditions hide unhide table columns
let update_child_table_field_property = function (frm) {
    const is_rc_spc = frm.doc.flooring_class == 'RC/SPC/WPC/LVGD'
    const is_hardwood = frm.doc.flooring_class == 'HARDWOOD FLOORING'

    for (const inner_table of create_child_table_list(frm, 'inner_and_outer_carton_details_')) {
        const grid = frm.fields_dict[inner_table].grid
        setFieldsVisibility(grid, ["carb_select"], !is_rc_spc)
        grid.reset_grid()
    }

    for (const over_table of create_child_table_list(frm, 'over_wax_and_edge_paint_')) {
        const grid = frm.fields_dict[over_table].grid
        setFieldsVisibility(grid, ["over_wax_select"], !is_rc_spc)
        setFieldsVisibility(grid, ["edge_paint_select"], !is_hardwood)
        grid.reset_grid()
    }

    for (const open_table of create_child_table_list(frm, 'open_box_inspection_details_')) {
        const grid = frm.fields_dict[open_table].grid
        // Pad Away (and its evidence photos) doesn't apply to Hardwood Flooring
        setFieldsVisibility(grid, ["finished_board", "finished_board_2", "pad_away_select"], !is_hardwood)
        grid.reset_grid()
    }

    for (const width_table of create_child_table_list(frm, 'width_and_thickness_details_')) {
        const grid = frm.fields_dict[width_table].grid
        // Hardwood reports a single "Thickness"; every other flooring class splits it
        // into "without padding" / "with padding" readings.
        setFieldsVisibility(grid, ["finished_board_1", "thickness"], is_hardwood)
        setFieldsVisibility(grid, ["finished_board_2", "thickness_without_padding_1", "finished_board_3", "thickness_with_padding_1"], !is_hardwood)
        grid.reset_grid()
    }
}


function prependGridHeaderRow(grid, marker_id, html) {
    if (grid.wrapper.find('.grid-heading-row').find(`#${marker_id}`).length == 0) {
        grid.wrapper.find('div.grid-heading-row').prepend(html)
    }
    grid.wrapper.find('.grid-heading-row').css('height', 'auto')
}

let set_row_above_table_header = function (frm) {
    if (frm.doc.pallet_details.length > 0) {
        prependGridHeaderRow(frm.fields_dict.pallet_details.grid, 'pallet_table', `
                <div id="pallet_table" style="background-color: #f3f3f3;">
                    <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                        <div class="" style="width:71px"></div>
                        <div class="col grid-static-col col-xs-3" style=""></div>
                        <div class="col grid-static-col col-xs-3" style=""></div>
                        <div class="col grid-static-col col-xs-3" style="border-left:1px solid #3b3838"></div>
                        <div class="col grid-static-col col-xs-3 text-center" style="">Installation</div>
                        <div class="col grid-static-col col-xs-4" style=""> </div>
                        <div class="col grid-static-col col-xs-3" style="border-left:1px solid #3b3838"></div>
                        <div class="col grid-static-col col-xs-3"></div>
                        <div class="col grid-static-col col-xs-3" style="">Corner Reading</div>
                        <div class="col grid-static-col col-xs-3" style=""></div>
                        <div class="col grid-static-col col-xs-4" style=""></div>
                        <div class="col grid-static-col col-xs-4 text-right" style="border-left:1px solid #3b3838">IPPC</div>
                        <div class="col grid-static-col col-xs-3" style=""></div>
                        <div class="" style="border-radius: 0px 10px 0px 0px; width: 30px;">
                        </div>
                    </div>
                </div>
                `)
    }

    for (const color_table of create_child_table_list(frm, 'color_match_and_embossing_details_')) {
        prependGridHeaderRow(frm.fields_dict[color_table].grid, 'color_table', `
                        <div id="color_table" style="background-color: #f3f3f3;">
                            <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                                <div class="" style="width:71px"></div>
                                <div class="col grid-static-col col-xs-4 " style="">
                                </div>
                                <div class="col grid-static-col col-xs-4" style="border-left:1px solid #3b3838"> </div>
                                <div class="col grid-static-col col-xs-4 text-center" style="">  Color Match </div>
                                <div class="col grid-static-col col-xs-4 text-center" style="">  </div>
                                <div class="col grid-static-col col-xs-4 text-center" style="border-left:1px solid #3b3838"> Embossing </div>
                                <div class="col grid-static-col col-xs-4" style="border-left:1px solid #3b3838"></div>
                                <div class="col grid-static-col col-xs-4 text-center" style="">Pattern Repeat</div>
                                <div class="col grid-static-col col-xs-4" style="">  </div>
                                <div class="" style="border-radius: 0px 10px 0px 0px; width: 30px;">
                                </div>
                            </div>
                        </div>
                        `)
    }

    for (const over_wax_table of create_child_table_list(frm, 'over_wax_and_edge_paint_')) {
        let html
        if (frm.doc.flooring_class == 'RC/SPC/WPC/LVGD') {
            html = `
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
                    `
        }
        else if (frm.doc.flooring_class == 'HARDWOOD FLOORING') {
            html = `
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
                        `
        } else {
            html = `
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
                        `
        }
        prependGridHeaderRow(frm.fields_dict[over_wax_table].grid, 'over_wax_table', html)
    }

    for (const gloss_level_table of create_child_table_list(frm, 'gloss_level_details_')) {
        prependGridHeaderRow(frm.fields_dict[gloss_level_table].grid, 'gloss_level_table', `
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

    for (const moisture_content_table of create_child_table_list(frm, 'moisture_content_details_')) {
        prependGridHeaderRow(frm.fields_dict[moisture_content_table].grid, 'moisture_content_table', `
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

    for (const open_box_table of create_child_table_list(frm, 'open_box_inspection_details_')) {
        let html
        if (frm.doc.flooring_class == 'HARDWOOD FLOORING') {
            html = `
                    <div id="open_box_table" style="background-color: #f3f3f3;">
                        <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                            <div class="" style="width:71px"></div>
                            <div class="col grid-static-col col-xs-4 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-4 text-center" style="border-left:1px solid #3b3838;"> Bowing
                            </div>
                            <div class="col grid-static-col col-xs-4 text-center" style="border-left:1px solid #3b3838;" > Ledging Overwood
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-left:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-4 text-right" style="padding-right: 5px !important;">Max Opening Between
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="padding-left: 0px !important" >Boards
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-left:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="">Master Depth for BP Press
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="" >
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-left:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="">Depth for BP Press
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;" >
                            </div>
                            <div class="" style="border-radius: 0px 10px 0px 0px; width:30px">
                            </div>
                        </div>
                    </div>
                    `
        }
        else {
            html = `
                    <div id="open_box_table" style="background-color: #f3f3f3;">
                        <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                            <div class="" style="width:71px"></div>
                            <div class="col grid-static-col col-xs-4 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-4 text-center" style="border-left:1px solid #3b3838;"> Bowing
                            </div>
                            <div class="col grid-static-col col-xs-4 text-center" style="border-left:1px solid #3b3838;" > Ledging Overwood
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-left:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-4 text-right" style="padding-right: 5px !important;">Max Opening Between
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="padding-left: 0px !important" >Boards
                            </div>
                            <div class="col grid-static-col col-xs-4" style="border-left:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-4 text-right" style="padding-right: 5px !important;"> Pad Away From the Locking
                            </div>
                            <div class="col grid-static-col col-xs-4 text-left" style="padding-left: 0px !important;">  System
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-left:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="">Master Depth for BP Press
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="" >
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-left:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="">Depth for BP Press
                            </div>
                            <div class="col grid-static-col col-xs-4 " style="border-right:1px solid #3b3838;" >
                            </div>
                            <div class="" style="border-radius: 0px 10px 0px 0px; width:30px">
                            </div>
                        </div>
                    </div>
                    `
        }
        prependGridHeaderRow(frm.fields_dict[open_box_table].grid, 'open_box_table', html)
    }

    for (const width_table of create_child_table_list(frm, 'width_and_thickness_details_')) {
        let html
        if (frm.doc.flooring_class == 'HARDWOOD FLOORING') {
            html = `
                    <div id="width_table" style="background-color: #f3f3f3;">
                        <div class="data-row row m-0" style="font-size:14px; color:#3b3838; border:1px solid #3b3838; border-radius: 10px 10px 0px 0px;">
                            <div class="" style="width:71px"></div>
                            <div class="col grid-static-col col-xs-3 " style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-right" style="border-left:1px solid #3b3838;">Width
                            </div>
                            <div class="col grid-static-col col-xs-3" style="">
                            </div>
                            <div class="col grid-static-col col-xs-3 text-right" style="border-left:1px solid #3b3838; padding-right: 5px !important;">Thickness
                            </div>
                            <div class="col grid-static-col col-xs-3 text-left" style="padding-left: 0px !important;">
                            </div>
                            <div class="col grid-static-col col-xs-3" style="border-left:1px solid #3b3838;">
                            </div>
                            <div class="col grid-static-col col-xs-4" style="border-right:1px solid #3b3838;"> Manual Pull Test
                            </div>
                            <div class="" style="border-radius: 0px 10px 0px 0px; width:30px">
                            </div>
                        </div>
                    </div>
                    `
        }
        else {
            html = `
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
                    `
        }
        prependGridHeaderRow(frm.fields_dict[width_table].grid, 'width_table', html)
    }
}

// frappe.ui.form.on("Over Wax and Edge Paint QI", {
//     over_wax_select(frm, cdt, cdn) {
//         let row = locals[cdt][cdn]
//         if (row.over_wax_select) {
//             let table_no = row.parentfield.slice(-1)
//             if (['Fail - Minor', 'Fail - Major', 'Fail - Critical'].includes(row.over_wax_select)) {
//                 if (!row.finished_board) {
//                     frappe.msgprint({
//                         title: __('<span style="color:#b52a2a">Mandatory</span>'),
//                         indicator: 'red',
//                         message: __('<p style="color:#b52a2a; font-size: 1rem;">Please upload image of failed overwax finished board for following : <br> Table {0} : Row {1} : {2} </p>',[table_no,  row.idx, row.item_color])
//                     });
//                 }
//             }
//         }
//     }
// })

frappe.ui.form.on("Pallet Information QI", {
    pallet_type(frm, cdt, cdn) {
        // console.log("==================pallet_type==================")
        set_pallet_details_each_row_property(frm)
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
                        message: __('<p style="color:#b52a2a; font-size: 1rem;">Please upload image of failed Pad finished board for following : <br> Table {0} : Row {1} : {2} </p>', [table_no, row.idx, row.item_color])
                    });
                }
            }
        }
    }
})

frappe.ui.form.on("Color Match and Embossing Details QI", {
    pattern_repeat_count(frm, cdt, cdn) {
        let row = locals[cdt][cdn]

        if (row.pattern_repeat_count) {
            frappe.confirm('Are you sure, the data entered is as per Pattern Repeat Formula mentioned in guideline?',
                () => {
                    // action to perform if Yes is selected
                },
                () => {
                    // action to perform if No is selected
                    frappe.show_alert({
                        message: __('Please recheck the data entered.'),
                        indicator: 'red'
                    }, 5);
                }
            )
        }
    }
})


frappe.ui.form.on("Distinct TAS PO Details QI", {
    status(frm, cdt, cdn){
        let row = locals[cdt][cdn]
        if (row.status == "Remove"){
            frappe.confirm(__("Are you sure, You want to remove PO : <b>{0}</b>?", [row.tas_po]),
                () => {
                    // action to perform if Yes is selected
                    frm.save().then(() => {frm.reload_doc()})
                   
                },
                () => {
                    // action to perform if No is selected
                    frm.reload_doc()
                }
            )
        }
        else{
            frm.reaload_doc()
        }
    },
    tas_po_details_move(frm, cdt, cdn){
        frm.reload_doc()
    }
})


frappe.ui.form.on("Missing Data Fields Details QI", {
    missing_data_details_remove(frm) {
        frappe.show_alert({
            message: __("You can't delete a row"), indicator: 'red'
        }, 5);
        frm.reload_doc()
    }
})