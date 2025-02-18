app_name = "quality_inspection"
app_title = "Quality Inspection"
app_publisher = "GreyCube Technologies"
app_description = "Quality Inspection For OutSourced Goods"
app_email = "admin@greycube.in"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "quality_inspection",
# 		"logo": "/assets/quality_inspection/logo.png",
# 		"title": "Quality Inspection",
# 		"route": "/quality_inspection",
# 		"has_permission": "quality_inspection.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/quality_inspection/css/quality_inspection.css"
# app_include_js = "/assets/quality_inspection/js/quality_inspection.js"

# include js, css files in header of web template
# web_include_css = "/assets/quality_inspection/css/quality_inspection.css"
# web_include_js = "/assets/quality_inspection/js/quality_inspection.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "quality_inspection/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# app_include_js = "override.bundle.js"

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "quality_inspection/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "quality_inspection.utils.jinja_methods",
# 	"filters": "quality_inspection.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "quality_inspection.install.before_install"
# after_install = "quality_inspection.install.after_install"
after_migrate = "quality_inspection.migrate.after_migrate"

# Uninstallation
# ------------

# before_uninstall = "quality_inspection.uninstall.before_uninstall"
# after_uninstall = "quality_inspection.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "quality_inspection.utils.before_app_install"
# after_app_install = "quality_inspection.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "quality_inspection.utils.before_app_uninstall"
# after_app_uninstall = "quality_inspection.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "quality_inspection.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"quality_inspection.tasks.all"
# 	],
# 	"daily": [
# 		"quality_inspection.tasks.daily"
# 	],
# 	"hourly": [
# 		"quality_inspection.tasks.hourly"
# 	],
# 	"weekly": [
# 		"quality_inspection.tasks.weekly"
# 	],
# 	"monthly": [
# 		"quality_inspection.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "quality_inspection.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "quality_inspection.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "quality_inspection.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["quality_inspection.utils.before_request"]
# after_request = ["quality_inspection.utils.after_request"]

# Job Events
# ----------
# before_job = ["quality_inspection.utils.before_job"]
# after_job = ["quality_inspection.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"quality_inspection.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

