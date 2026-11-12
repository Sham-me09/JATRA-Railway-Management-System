from pathlib import Path

p = Path(r".\frontend\railway-management-system\js\dashboard.js")
s = p.read_text(encoding="utf-8")

marker = "async function initAdminCrudTable(pagePath) {"

new_functions = r'''
async function approveCancellationRecord(cancellationId) {
  if (!cancellationId) {
    alert('Cancellation ID is missing.');
    return;
  }

  try {
    const res = await apiCall(
      'POST',
      '/api/cancellations/' + encodeURIComponent(cancellationId) + '/approve'
    );

    if (!res.ok) {
      throw new Error(res.error || 'Cancellation approval failed.');
    }

    alert('Cancellation approved successfully.');
    window.location.reload();

  } catch (error) {
    console.error('[APPROVE CANCELLATION]', error);
    alert(error.message || 'Cancellation approval failed.');
  }
}

async function rejectCancellationRecord(cancellationId) {
  if (!cancellationId) {
    alert('Cancellation ID is missing.');
    return;
  }

  try {
    const res = await apiCall(
      'POST',
      '/api/cancellations/' + encodeURIComponent(cancellationId) + '/reject'
    );

    if (!res.ok) {
      throw new Error(res.error || 'Cancellation rejection failed.');
    }

    alert('Cancellation rejected successfully.');
    window.location.reload();

  } catch (error) {
    console.error('[REJECT CANCELLATION]', error);
    alert(error.message || 'Cancellation rejection failed.');
  }
}

'''

if marker not in s:
    print("MARKER NOT FOUND - NO CHANGE")
elif "async function approveCancellationRecord(cancellationId)" in s:
    print("FUNCTIONS ALREADY EXIST - NO CHANGE")
else:
    s = s.replace(marker, new_functions + marker, 1)
    p.write_text(s, encoding="utf-8")
    print("CANCELLATION FUNCTIONS ADDED")
