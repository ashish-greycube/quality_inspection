// Camera-only attachments for TAS Quality Control
// (Quality Inspection Settings QI > restrict_tqc_upload_to_camera)
//
// Works on the uploader's rendered markup instead of FileUploader options, because:
// - the dialog is opened from many places (sidebar, Attach fields, custom Attach button)
// - cloud_storage locks frappe.ui.FileUploader and its Vue component ignores allow_web_link
// Both Frappe's and cloud_storage's uploader render the same .file-uploader / .btn-file-upload markup.

(function () {
	const DOCTYPE = "TAS Quality Control";
	const BODY_CLASS = "qi-camera-only";
	let active = false;

	function is_tqc_form() {
		const route = frappe.get_route();
		return route && route[0] === "Form" && route[1] === DOCTYPE;
	}

	function set_active(value) {
		active = value;
		document.body.classList.toggle(BODY_CLASS, value);
		if (value) restrict_uploaders();
	}

	function restrict_uploaders() {
		const hidden_labels = [__("My Device"), __("Library"), __("Link")];
		const drop_text = __("Drag and drop files here or upload from");

		document.querySelectorAll(".file-uploader .btn-file-upload:not(.qi-checked)").forEach((btn) => {
			btn.classList.add("qi-checked");
			const label = btn.querySelector(".mt-1")?.textContent.trim();
			if (hidden_labels.includes(label)) btn.classList.add("qi-hide");
		});

		document.querySelectorAll(".file-uploader .file-upload-area .text-center").forEach((el) => {
			if (el.textContent.trim() === drop_text) el.textContent = __("Take a photo using the Camera");
		});
	}

	frappe.ui.form.on(DOCTYPE, {
		refresh() {
			frappe.db
				.get_single_value("Quality Inspection Settings QI", "restrict_tqc_upload_to_camera")
				.then((value) => set_active(is_tqc_form() && !!value));
		},
	});

	frappe.router.on("change", () => {
		if (active && !is_tqc_form()) set_active(false);
	});

	// uploader dialogs are created on demand and appended to <body>
	new MutationObserver(() => active && restrict_uploaders()).observe(document.body, {
		childList: true,
		subtree: true,
	});

	// block file drag & drop, both inside the upload dialog and on the form page (form.js setup_file_drop).
	// Capture phase on window runs before Vue's @drop and jQuery's drop handlers.
	["dragenter", "dragover", "drop"].forEach((type) => {
		window.addEventListener(
			type,
			(e) => {
				if (!active || !e.dataTransfer?.types?.includes("Files")) return;
				e.preventDefault();
				e.stopPropagation();
				e.dataTransfer.dropEffect = "none";
			},
			true
		);
	});
})();
