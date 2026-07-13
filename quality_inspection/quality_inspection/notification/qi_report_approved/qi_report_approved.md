<p>Dear Quality Inspector,<br>
Your submitted QI report has been approved by {{doc.last_workflow_actor_fn}}.<br>
Comments: {{ doc.last_workflow_comment or 'Approved'}}<br>
You may proceed with the next steps as per process.<br>
<a href="{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}" target="_blank">
{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}
</a>
<br><br>
Thank you,<br>
 Workflow Notification System</p>
