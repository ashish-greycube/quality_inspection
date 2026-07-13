<p>Dear Quality Inspector,<br>
Your QI report {{doc.name}} has been reviewed by {{doc.last_workflow_actor_fn}} and rejected due to required fixes.<br>
Comments: {{ doc.last_workflow_comment or 'Require Fixes'}} <br>
Please make the necessary corrections and resubmit the report for approval. <br>
<a href="{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}" target="_blank">
{{ frappe.utils.get_url() }}/app/tas-quality-control/{{ doc.name }}
</a>
<br><br>
Thank you,<br>
Workflow Notification System</p>
