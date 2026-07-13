<p>QC Report {{doc.name}}<br>
Submitted By : {{doc.user}}<br>
Marked Submit Fixed : {{doc.previous_workflow_actor}} <br>
has been resubmitted after making required fixes by {{doc.user}}<br>
Comments: {{ doc.last_workflow_comment or 'Submit Fixes'}}<br>
No further action is required.<br>
<a href="{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}" target="_blank">
{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}
</a>
<br><br>
Thank you,<br>
 Workflow Notification System</p>
