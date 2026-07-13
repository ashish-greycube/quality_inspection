<p>QC Report {{doc.name}}<br>
Submitted By : {{doc.user}}<br>
Rejected Closed by : {{doc.previous_workflow_actor}}<br>
has been cancelled by {{doc.last_workflow_actor_fn}}<br>
Comments: {{ doc.last_workflow_comment or 'Rejected - Closed'}}<br>
No further action is required.<br>
<a href="{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}" target="_blank">
{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}
</a>
<br><br>
Thank you,<br>
    Workflow Notification System</p>
