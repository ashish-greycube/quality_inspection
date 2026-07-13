<p>Dear Quality Inspector,<br>
Your submitted QI report {{doc.name}} has been rejected and closed by {{doc.last_workflow_actor_fn}}.<br>
Comments: {{ doc.last_workflow_comment or 'Rejected CLosed'}}<br>
No further action is required.<br>
<a href="{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}" target="_blank">
{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}
</a>
<br><br>
Thank you,<br>
 Workflow Notification System</p>
