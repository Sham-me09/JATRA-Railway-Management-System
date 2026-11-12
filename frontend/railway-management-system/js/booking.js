/**
 * Interactive Seat Selection & Passenger Form Engine
 */

let selectedSeats = [];
let selectedSeatId = '';
let currentCoach = '';
let currentCoachType = '';
let baseSeatPrice = 0;
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('seat-selection.html')) {
    initSeatSelectionPage();
  }

  if (window.location.pathname.includes('passenger-details.html')) {
    initPassengerDetailsPage();
  }
});

async function initSeatSelectionPage() {
  const trainId = localStorage.getItem('selectedTrainId');
  const selectedTrain = JSON.parse(
    localStorage.getItem('selectedTrain') || 'null'
  );

  const train = selectedTrain;

  if (!train || !trainId) {
    const gridContainer = document.getElementById('seatGridContainer');

    if (gridContainer) {
      gridContainer.innerHTML =
        '<p>Train or schedule information is missing.</p>';
    }

    console.error(
      '[SEAT SELECTION] Selected database train information is missing.'
    );

    return;
  }

  const infoHeader = document.getElementById('selectedTrainHeader');
  if (infoHeader) {
    infoHeader.innerHTML = `
      <h2>${train.name} (${train.id})</h2>
      <p style="margin: 0; color: var(--text-muted);">
        Route: <strong>${train.source}</strong> to <strong>${train.destination}</strong> | Departure: <strong>${train.deptTime}</strong>
      </p>
    `;
  }
  // ============================================================
  // Load coaches from the real database API.
  // Keep the existing button design, but remove hardcoded
  // KA/KHA/GA coach assumptions.
  // ============================================================

  const coachContainer =
    document.getElementById('coachSelectorContainer');

  if (!coachContainer) {
    console.error('[COACH] Coach selector container not found.');
    return;
  }

  const coachResult =
    await apiCall(
      'GET',
      '/api/trains/' + encodeURIComponent(trainId) + '/coaches'
    );

  if (
    !coachResult ||
    !coachResult.ok ||
    !coachResult.data ||
    !Array.isArray(coachResult.data.coaches)
  ) {
    coachContainer.innerHTML =
      '<p>Unable to load coaches from the database.</p>';

    console.error(
      '[COACH] Database coach loading failed:',
      coachResult
    );

    return;
  }

  const coaches = coachResult.data.coaches;

  console.log('[COACH] Coaches from database:', coaches);

  if (coaches.length === 0) {
    coachContainer.innerHTML =
      '<p>No coaches available for this train.</p>';

    return;
  }

  coachContainer.innerHTML = coaches.map(function(coach, index) {

    const coachId = coach.coach_id;
    const coachName = coach.coach_name || coachId;
    const coachType = coach.coach_type || 'UNKNOWN';
    const fare = Number(coach.fare) || 0;

    const buttonClass =
      index === 0
        ? 'btn btn-navy coach-btn'
        : 'btn btn-outline coach-btn';

    return `
      <button
        class="${buttonClass}"
        data-coach="${coachId}"
        data-coach-type="${coachType}"
        data-price="${fare}"
      >
        ${coachName} (${coachType} - ৳${fare.toLocaleString()})
      </button>
    `;
  }).join('');

  function selectCoach(btn) {

    document
      .querySelectorAll('.coach-btn')
      .forEach(function(b) {
        b.classList.remove('btn-navy');
        b.classList.add('btn-outline');
      });

    btn.classList.remove('btn-outline');
    btn.classList.add('btn-navy');

    currentCoach = btn.dataset.coach;
    currentCoachType = btn.dataset.coachType || '';
    baseSeatPrice = Number(btn.dataset.price) || 0;

    selectedSeats = [];
    selectedSeatId = '';

    renderSeatGrid();
    updateBookingSummary();
  }

  document
    .querySelectorAll('.coach-btn')
    .forEach(function(btn) {
      btn.addEventListener('click', function() {
        selectCoach(btn);
      });
    });

  // Automatically select the first real database coach.
  selectCoach(
    document.querySelector('.coach-btn')
  );

  renderSeatGrid();
  updateBookingSummary();

  const proceedBtn = document.getElementById('proceedToPassengerBtn');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      if (selectedSeats.length === 0) {
        showToast('Please select at least one seat to continue.', 'warning');
        return;
      }

      // Save seat selection state
      const currentBooking = {
        trainId: train.id,
        scheduleId: train.scheduleId || train.schedule_id || localStorage.getItem('selectedScheduleId') || null,
        journeyDate: train.journeyDate || new Date().toISOString().split('T')[0],
        trainName: train.name,
        source: train.source,
        destination: train.destination,
        deptTime: train.deptTime || train.departure || '07:00 AM',
        arrTime: train.arrTime || train.arrival || '12:15 PM',
        coach: currentCoach,
        coachId: currentCoach,
        coachType: currentCoachType,
        seats: selectedSeats,
        seatId: selectedSeatId,
        unitFare: baseSeatPrice,
        totalFare: baseSeatPrice * selectedSeats.length,
        vat: Math.round(baseSeatPrice * selectedSeats.length * 0.05),
        serviceCharge: 20
      };
      currentBooking.grandTotal = currentBooking.totalFare + currentBooking.vat + currentBooking.serviceCharge;

      localStorage.setItem('currentBooking', JSON.stringify(currentBooking));
      window.location.href = 'passenger-details.html';
    });
  }
}

async function renderSeatGrid() {
  const gridContainer = document.getElementById('seatGridContainer');

  if (!gridContainer) {
    return;
  }

  const trainId = localStorage.getItem('selectedTrainId');
  const scheduleId = localStorage.getItem('selectedScheduleId');

  if (!trainId || !scheduleId) {
    gridContainer.innerHTML = '<p>Train or schedule information is missing.</p>';
    return;
  }

  try {
    const url =
      '/api/seats?train_id=' + encodeURIComponent(trainId) +
      '&schedule_id=' + encodeURIComponent(scheduleId);

    const apiResult = await apiCall('GET', url);

    console.log('SEAT API RESULT:', apiResult);

    if (!apiResult || !apiResult.ok) {
      gridContainer.innerHTML = '<p>Unable to load seats.</p>';
      return;
    }

    let seats = [];

    if (apiResult.data && Array.isArray(apiResult.data.value)) {
      seats = apiResult.data.value;
    } else if (apiResult.data && Array.isArray(apiResult.data)) {
      seats = apiResult.data;
    } else if (Array.isArray(apiResult.value)) {
      seats = apiResult.value;
    }

    console.log('SEATS FROM DATABASE:', seats);

    if (seats.length === 0) {
      gridContainer.innerHTML = '<p>No seats found.</p>';
      return;
    }

    // Only show seats belonging to the currently selected
    // database coach.
    seats = seats.filter(function(seat) {
      const seatCoachId =
        seat.coachId ||
        seat.coach_id ||
        '';

      return seatCoachId === currentCoach;
    });

    if (seats.length === 0) {
      gridContainer.innerHTML =
        '<p>No seats found for the selected coach.</p>';
      return;
    }

    gridContainer.innerHTML = seats.map(function(seat) {
      const seatNum =
        seat.seatNumber ||
        seat.seat_number ||
        seat.number;

      const seatId =
        seat.seatId ||
        seat.seat_id ||
        seat.id ||
        '';

      const status =
        seat.status ||
        seat.seat_status ||
        'AVAILABLE';

      const isBooked = status !== 'AVAILABLE';
      const isSelected = selectedSeatId === seatId;

      return `
        <button
          class="seat-item ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}"
          onclick="toggleSeatSelection('${seatNum}', '${seatId}', ${isBooked})"
          ${isBooked ? 'disabled' : ''}
        >
          ${seatNum}
        </button>
      `;
    }).join('');

  } catch (error) {
    console.error('SEAT LOADING ERROR:', error);
    gridContainer.innerHTML = '<p>Unable to load seats.</p>';
  }
}

function toggleSeatSelection(seatNum, seatId, isBooked) {
  if (isBooked) return;

  // This booking table stores one SEAT_ID,
  // so keep one seat selected per booking.
  if (selectedSeatId === seatId) {
    selectedSeats = [];
    selectedSeatId = '';
    selectedSeatId = '';
  } else {
    selectedSeats = [seatNum];
    selectedSeatId = seatId;
  }

  renderSeatGrid();
  updateBookingSummary();
}

function updateBookingSummary() {
  const countEl = document.getElementById('summarySeatCount');
  const seatsEl = document.getElementById('summarySeatList');
  const fareEl = document.getElementById('summaryTotalFare');
  const vatEl = document.getElementById('summaryVat');
  const grandEl = document.getElementById('summaryGrandTotal');

  const count = selectedSeats.length;
  const subTotal = count * baseSeatPrice;
  const vat = Math.round(subTotal * 0.05);
  const serviceCharge = count > 0 ? 20 : 0;
  const grandTotal = subTotal + vat + serviceCharge;

  if (countEl) countEl.textContent = count;
  if (seatsEl) seatsEl.textContent = count > 0 ? selectedSeats.join(', ') : 'None selected';
  if (fareEl) fareEl.textContent = formatBDT(subTotal);
  if (vatEl) vatEl.textContent = formatBDT(vat);
  if (grandEl) grandEl.textContent = formatBDT(grandTotal);
}

function initPassengerDetailsPage() {
  const currentBooking = JSON.parse(localStorage.getItem('currentBooking') || 'null');
  if (!currentBooking) {
    showToast('No booking session found. Please select seats first.', 'warning');
    setTimeout(() => { window.location.href = 'search-train.html'; }, 1000);
    return;
  }


  // Render booking summary side card
  const summaryBox = document.getElementById('passengerBookingSummary');
  if (summaryBox) {
    summaryBox.innerHTML = `
      <h3>Trip Summary</h3>
      <div style="margin: 1rem 0; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
        <div style="font-weight: 700; color: var(--primary-navy);">${currentBooking.trainName}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">${currentBooking.source} â†’ ${currentBooking.destination}</div>
      </div>
      <div style="font-size: 0.9rem; line-height: 1.8;">
        <div>Coach: <strong>${currentBooking.coach}</strong></div>
        <div>Seats: <strong>${currentBooking.seats.join(', ')}</strong></div>
        <div>Fare: <strong>${formatBDT(currentBooking.totalFare)}</strong></div>
        <div>VAT & Fees: <strong>${formatBDT(currentBooking.vat + currentBooking.serviceCharge)}</strong></div>
        <div style="font-size: 1.1rem; font-weight: 800; color: var(--accent-blue); margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
          Total Payable: ${formatBDT(currentBooking.grandTotal)}
        </div>
      </div>
    `;
  }

  const form = document.getElementById('passengerDetailsForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const pName = document.getElementById('pName').value.trim();
      const pAge = document.getElementById('pAge').value;
      const pGender = document.getElementById('pGender').value;
      const pPhone = document.getElementById('pPhone').value.trim();
      const pType = document.getElementById('pType').value;

      if (!pName || !pAge || !pPhone) {
        showToast('Please fill out all passenger details.', 'danger');
        return;
      }

      currentBooking.passengerName = pName;
      currentBooking.passengerAge = pAge;
      currentBooking.passengerGender = pGender;
      currentBooking.passengerPhone = pPhone;
      currentBooking.passengerType = pType;

      localStorage.setItem('currentBooking', JSON.stringify(currentBooking));
      window.location.href = 'payment.html';
    });
  }
}











