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

4. Give Read access to QI User & QI Manager Role. e.g,
   
<img width="1494" height="483" alt="image" src="https://github.com/user-attachments/assets/61d3968a-8079-4627-8eaf-87f3b38e57b8" />

5. To view the TAS Quality control Form, a user must have one of the following roles: <br>
**System Manager, QI Manager, or QI User.**

<img width="1690" height="1016" alt="image" src="https://github.com/user-attachments/assets/e48286bc-618a-4fc9-a334-7ea3e1823ad3" />



#### License

mit
