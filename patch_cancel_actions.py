from pathlib import Path

p = Path(r".\frontend\railway-management-system\js\dashboard.js")
s = p.read_text(encoding="utf-8")

marker = """        if (isStationMaster && (pagePath === 'manage-routes.html' || pagePath === 'manage-platforms.html' || pagePath === 'manage-schedules.html')) {"""

replacement = """        if (pagePath === 'manage-cancellations.html') {
          const cancellationStatus = String(row.status || '').toUpperCase();

          if (cancellationStatus === 'PENDING') {
            actionsCell = `
              <button onclick="approveCancellationRecord('${row.id}')" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                Approve
              </button>
              <button onclick="rejectCancellationRecord('${row.id}')" class="btn btn-danger btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                Reject
              </button>
            `;
          } else {
            actionsCell = `<span class="inline-block px-2.5 py-0.5 text-xs text-slate-400 bg-slate-800/80 rounded border border-slate-700/60 font-semibold">View Only</span>`;
          }
        } else if (isStationMaster && (pagePath === 'manage-routes.html' || pagePath === 'manage-platforms.html' || pagePath === 'manage-schedules.html')) {"""

if marker not in s:
    print("MARKER NOT FOUND - NO CHANGE")
else:
    # Make sure we don't accidentally insert it twice.
    if "const cancellationStatus = String(row.status || '').toUpperCase();" in s:
        print("CANCELLATION ACTIONS ALREADY PRESENT - NO CHANGE")
    else:
        s = s.replace(marker, replacement, 1)
        p.write_text(s, encoding="utf-8")
        print("CANCELLATION ACTIONS INSERTED")
