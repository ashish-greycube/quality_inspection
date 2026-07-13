<p>Dear Quality Inspector, <br>
Your submitted QI report has been placed on hold by {{doc.last_workflow_actor_fn}}. <br>
Comments: {{ doc.last_workflow_comment or 'On Hold'}} <br>
Further action will be communicated once the hold is resolved. <br>
<a href="{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}" target="_blank">
{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}
</a>
<br><br>
Thank you,<br>
 Workflow Notification System</p>
