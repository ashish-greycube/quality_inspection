(() => {
  // ../quality_inspection/quality_inspection/public/js/override.js
  frappe.provide("frappe.ui.form");
  var QuaGridRow = class extends frappe.ui.form.GridRow {
    make() {
      console.log("--------QuaGridRow");
    }
  };
})();
//# sourceMappingURL=override.bundle.PEQDQAHX.js.map
