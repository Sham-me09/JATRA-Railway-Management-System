/**
 * Payment Gateway Simulator & Ticket Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('payment.html')) {
    initPaymentPage();
  }

  if (window.location.pathname.includes('booking-confirmation.html')) {
    initConfirmationPage();
  }
});

function initPaymentPage() {
  const currentBooking = JSON.parse(localStorage.getItem('currentBooking') || 'null');
  if (!currentBooking) {
    showToast('No pending payment found. Redirecting to home...', 'warning');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    return;
  }

  // Display Payable Details
  const amountEl = document.getElementById('paymentAmount');
  if (amountEl) amountEl.textContent = formatBDT(currentBooking.grandTotal);

  const overviewEl = document.getElementById('paymentBookingOverview');
  if (overviewEl) {
    overviewEl.innerHTML = `
      <div style="font-size: 0.95rem; line-height: 1.8;">
        <div>Train: <strong>${currentBooking.trainName} (${currentBooking.trainId})</strong></div>
        <div>Passenger: <strong>${currentBooking.passengerName} (${currentBooking.passengerPhone})</strong></div>
        <div>Seats: <strong>${currentBooking.seats.join(', ')}</strong> (${currentBooking.coach})</div>
        <div>Journey Date: <strong>${new Date().toISOString().split('T')[0]}</strong></div>
      </div>
    `;
  }

  // Payment Method Tab Switcher
  let activeMethod = 'Mobile Banking';
  document.querySelectorAll('.payment-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('btn-primary'));
      document.querySelectorAll('.payment-tab').forEach(t => t.classList.add('btn-outline'));
      tab.classList.remove('btn-outline');
      tab.classList.add('btn-primary');
      activeMethod = tab.dataset.method;
    });
  });

  // Confirm Payment Button
  const payBtn = document.getElementById('confirmPaymentBtn');
  if (payBtn) {
    payBtn.addEventListener('click', async () => {


      const pin = document.getElementById('paymentPin')?.value;
      if (!pin) {
        showToast('Please enter your account/PIN number to complete transaction.', 'warning');
        return;
      }

      payBtn.disabled = true;
      payBtn.textContent = 'Processing Transaction...';

      // Map frontend payment method label to Oracle PAYMENT.method CHECK values: ('BKASH','NAGAD','CARD','CASH')
      const methodMap = {
        'Mobile Banking': 'BKASH',
        'bKash': 'BKASH',
        'Nagad': 'NAGAD',
        'Credit Card': 'CREDIT_CARD',
        'Cash': 'CASH',
      };
      const oracleMethod = methodMap[activeMethod] || 'BKASH';

      const currentUser = getCurrentUser();

      // â€”â€” Try real API booking â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
      const apiResult = await apiCall('POST', '/api/bookings', {
        schedule_id: currentBooking.scheduleId || currentBooking.schedule_id || '',
        train_id: currentBooking.trainId || currentBooking.id || '',
        coach_id: currentBooking.coachId || null,
        seat_id: currentBooking.seatId || null,
        payment_method: oracleMethod,
        number_and_seat: Array.isArray(currentBooking.seats)
          ? currentBooking.seats.join(',')
          : (currentBooking.seats || ''),
        seat_number: Array.isArray(currentBooking.seats)
          ? currentBooking.seats.join(',')
          : (currentBooking.seats || ''),
        coach_name: currentBooking.coach || '',
        seat_type: currentBooking.coachType || 'SHOVON',
        amount: currentBooking.grandTotal || 0,
        grand_total: currentBooking.grandTotal || 0,
      });

      const bookingData = apiResult.data && (apiResult.data.booking || apiResult.data);

      if (apiResult.ok && bookingData && bookingData.booking_id) {
        // â€”â€” Success: API returned real IDs â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
        const { booking_id, ticket_id, payment_id, amount } = bookingData;

        const completedBooking = {
          ...currentBooking,
          id: booking_id,
          bookingId: booking_id,
          ticketId: ticket_id,
          paymentId: payment_id,
          userId: currentUser ? currentUser.id : 'GUEST',
          paymentMethod: activeMethod,
          paymentStatus: 'Paid',
          bookingStatus: 'Confirmed',
          grandTotal: amount || currentBooking.grandTotal,
          journeyDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toLocaleString(),
        };

        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.unshift(completedBooking);
        localStorage.setItem('bookings', JSON.stringify(bookings));

        const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
        tickets.unshift(completedBooking);
        localStorage.setItem('tickets', JSON.stringify(tickets));

        localStorage.setItem('lastConfirmedTicket', JSON.stringify(completedBooking));
        localStorage.removeItem('currentBooking');

        showToast('Payment Successful! Ticket Issued.', 'success');
        setTimeout(() => { window.location.href = 'booking-confirmation.html'; }, 1000);
        return;
      }

      // â€”â€” API error (not network â€” e.g. seat unavailable) â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
      if (apiResult.status >= 400 && apiResult.status < 600 && apiResult.status !== 0) {
        payBtn.disabled = false;
        payBtn.textContent = 'Confirm & Pay';
        showToast(apiResult.error || 'Booking failed. Please try again.', 'danger');
        return;
      }

      // â€”â€” Offline fallback: mock booking (no backend running) â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
      payBtn.disabled = false;
      payBtn.textContent = 'Confirm & Pay';

      showToast(
        apiResult.error ||
        'Unable to complete the booking through the database.',
        'danger'
      );

      console.error(
        '[PAYMENT] Database booking failed:',
        apiResult
      );
    });
  }

}

function initConfirmationPage() {
  const ticket = JSON.parse(localStorage.getItem('lastConfirmedTicket') || 'null');
  const ticketBox = document.getElementById('confirmedTicketVoucher');

  if (!ticket || !ticketBox) {
    if (ticketBox) {
      ticketBox.innerHTML = `
        <div class="card text-center" style="padding: 3rem;">
          <h2>No Recent Ticket Found</h2>
          <p>You have not completed any ticket booking in this session.</p>
          <a href="my-tickets.html" class="btn btn-primary">View My Tickets</a>
        </div>
      `;
    }
    return;
  }

  ticketBox.innerHTML = `
    <div class="card" style="border: 2px solid var(--accent-blue); padding: 2rem; background: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="color: var(--primary-navy); margin: 0;">BANGLADESH RAILWAY E-TICKET</h2>
          <div style="font-size: 0.85rem; color: var(--text-muted);">Official Digital Boarding Pass</div>
        </div>
        <div style="text-align: right;">
          <span class="badge badge-success" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">CONFIRMED</span>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">Issued: ${ticket.createdAt}</div>
        </div>
      </div>

      <div class="form-row" style="margin-bottom: 1.5rem;">
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Booking ID</div>
          <div style="font-weight: 700; color: var(--primary-navy); font-size: 1.1rem;">${ticket.id}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Ticket / PNR ID</div>
          <div style="font-weight: 800; color: var(--accent-blue); font-size: 1.1rem;">${ticket.ticketId}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Passenger Name</div>
          <div style="font-weight: 700; color: var(--primary-navy);">${ticket.passengerName}</div>
        </div>
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Phone Number</div>
          <div style="font-weight: 600;">${ticket.passengerPhone}</div>
        </div>
      </div>

      <div style="background-color: var(--surface-bg); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary-navy);">${ticket.trainName} (${ticket.trainId})</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">From <strong>${ticket.source}</strong> to <strong>${ticket.destination}</strong></div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.9rem; font-weight: 700; color: var(--accent-blue);">Coach: ${ticket.coach}</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary-navy);">Seats: ${ticket.seats.join(', ')}</div>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Total Paid (${ticket.paymentMethod})</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--success);">${formatBDT(ticket.grandTotal)}</div>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button onclick="window.print()" class="btn btn-navy">ðŸ–¨ï¸Â Print Ticket</button>
          <a href="my-tickets.html" class="btn btn-primary">My Tickets Dashboard</a>
        </div>
      </div>
    </div>
  `;
}





