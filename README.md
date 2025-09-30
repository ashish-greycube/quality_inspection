## Quality Inspection

Quality Inspection For OutSourced Goods

Below Mentioned Steps do manually on fresh install.
### Follow Below Steps For Scrollable child table

#### Replace the following files:

<ol>
<li>grid_row.js: </li>
  
**Path** : frappe/frappe/public/js/frappe/form/grid_row.js <br>
**Source**: https://github.com/frappe/frappe/blob/develop/frappe/public/js/frappe/form/grid_row.js
   
<li>grid.js:</li>

**Path**: frappe/frappe/public/js/frappe/form/grid.js <br>
**Source**: https://github.com/frappe/frappe/blob/develop/frappe/public/js/frappe/form/grid.js
   
<li> grid.scss:</li>

**Path**: frappe/frappe/public/scss/common/grid.scss <br>
**Source**: https://github.com/frappe/frappe/blob/develop/frappe/public/scss/common/grid.scss
</ol>

 After replacing the files, make sure to build your assets using:
 ```
bench build
```

### Require Setup

1. Before installation or update, create two new roles: QI Manager and QI User.

2. Copy the following letterheads for the QI Report print:

	T&A SUPPLY CO INC - https://quality.greycube.in/app/letter-head/T%26A <br>
	PACIFIC MAT & COMML - https://quality.greycube.in/app/letter-head/Pac%20Mat <br>
	ARCH DIRECTIONS - https://quality.greycube.in/app/letter-head/AD

3. Set the default letterhead in the Company doctype.

<img width="1428" height="432" alt="image" src="https://github.com/user-attachments/assets/8b35f18a-9d08-43e4-955f-27dcc3763b43" />
<br><br>

4. Give Read access to Quality User Internal, Quality User External & QI Manager Role. e.g,
   
<img width="1494" height="483" alt="image" src="https://github.com/user-attachments/assets/61d3968a-8079-4627-8eaf-87f3b38e57b8" />

5. To view the TAS Quality control Form, a user must have one of the following roles: <br>
**System Manager, QI Manager, Quality User Internal or Quality User External.**

<img width="1558" height="931" alt="image" src="https://github.com/user-attachments/assets/6f6f7325-150f-40c5-bd00-9c0a60e79319" />

#### Permission Rules For Quality Form

<img width="1290" height="496" alt="image" src="https://github.com/user-attachments/assets/eb927efa-ed36-4127-ac5b-a480fa132661" />


Note:<br>
QI Manager: Allow to create New Quality Control & edit form <br>
Quality User Internal: Allow to edit details tab & other tabs  <br>
Quality User External: Allow to edit all tabs except details tab <br>

<img width="1292" height="551" alt="image" src="https://github.com/user-attachments/assets/eb12a828-b5e4-4661-82b9-1ef53cf408c0" />

<img width="1273" height="541" alt="image" src="https://github.com/user-attachments/assets/23fa0483-05ba-4b72-bd65-b08beaa08a7e" />

<img width="1300" height="556" alt="image" src="https://github.com/user-attachments/assets/1c076230-1968-42a6-af32-b147e83f3dfd" />




#### License

mit
