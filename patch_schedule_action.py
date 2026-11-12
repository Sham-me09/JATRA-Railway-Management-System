from pathlib import Path

p = Path(r".\frontend\railway-management-system\js\dashboard.js")
s = p.read_text(encoding="utf-8")

old = """        } else if (isTrainManager && pagePath === 'manage-schedules.html') {
          actionsCell = `<button onclick="openScheduleRequestModal('${row.id}')" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;"> Update Schedule' : 'Edit';
          const showDelete = !(['station_master', 'ticket_manager', 'train_manager'].includes(userRole));
          actionsCell = `
            <button onclick="editCrudRecord('${row.id}')" class="btn ${pagePath === 'manage-schedules.html' ? 'btn-primary' : 'btn-outline'} btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">${editBtnText}</button>
            ${showDelete ? `<button onclick="deleteCrudRecord('${row.id}')" class="btn btn-danger btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>` : ''}
          `;
        }"""

new = """        } else if (isTrainManager && pagePath === 'manage-schedules.html') {
          actionsCell = `<button onclick="openScheduleRequestModal('${row.id}')" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Update Schedule</button>`;
        } else {
          const editBtnText = pagePath === 'manage-schedules.html' ? 'Update Schedule' : 'Edit';
          const showDelete = !(['station_master', 'ticket_manager', 'train_manager'].includes(userRole));

          actionsCell = `
            <button onclick="editCrudRecord('${row.id}')" class="btn ${pagePath === 'manage-schedules.html' ? 'btn-primary' : 'btn-outline'} btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">${editBtnText}</button>
            ${showDelete ? `<button onclick="deleteCrudRecord('${row.id}')" class="btn btn-danger btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>` : ''}
          `;
        }"""

if old not in s:
    print("SCHEDULE BLOCK NOT FOUND - NO CHANGE")
else:
    s = s.replace(old, new, 1)
    p.write_text(s, encoding="utf-8")
    print("SCHEDULE ACTION BLOCK FIXED")
