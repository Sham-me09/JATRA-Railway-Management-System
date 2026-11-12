/**
 * Main JavaScript Engine - Data Store Initializer & Utilities
 */

// ============================================================
// JATRA API Integration Layer
// ============================================================

/** Base URL for the Flask REST API backend */
const API_BASE = 'http://localhost:5000';

/**
 * Helper: fetch from the Flask API with optional auth token and JSON body.
 * Returns { ok, data, status, error } — callers decide what to do on failure.
 */
async function apiCall(method, path, body = null) {
  const token = localStorage.getItem('jatra_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body && method !== 'GET') options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    let data = null;
    try { data = await res.json(); } catch (_) { data = {}; }
    return { ok: res.ok, data, status: res.status, error: res.ok ? null : (data.error || 'API error') };
  } catch (networkErr) {
    console.warn(`[API] Network error for ${method} ${path}:`, networkErr.message);
    return { ok: false, data: null, status: 0, error: 'Cannot reach server. Running in offline mode.' };
  }
}

/**
 * Store JWT token and user object in localStorage after login.
 * Maintains the existing currentUser object shape the frontend pages expect.
 */
function setApiSession(token, apiUser) {
  if (token) localStorage.setItem('jatra_token', token);
  if (apiUser) {
    const user = {
      id: apiUser.user_id || apiUser.id || '',
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role,
      station: apiUser.station || '',
      phone: apiUser.phone || '',
      gender: apiUser.gender || '',
      nid: apiUser.nid || '',
      assignedTrainId: apiUser.assignedTrainId || null,
      assignedTrainName: apiUser.assignedTrainName || null,
      passenger_type: apiUser.passenger_type || 'GENERAL',
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}

/** Clear API session (token + currentUser) on logout. */
function clearApiSession() {
  localStorage.removeItem('jatra_token');
  localStorage.removeItem('currentUser');
}

// Initialize LocalStorage Data Store
function initDataStore() {
  if (!localStorage.getItem('rms_initialized')) {
    // Seed Default Users
    const defaultUsers = [
      {
        id: 'USR-1001',
        name: 'Rahim Ahmed',
        email: 'user@railway.com',
        password: 'user123',
        phone: '01711223344',
        nid: '1994829102931',
        dob: '1994-05-12',
        gender: 'Male',
        address: '12 Dhanmondi, Dhaka',
        role: 'user',
        createdAt: '2026-01-15'
      },
      {
        id: 'USR-1002',
        name: 'System Admin',
        email: 'admin@railway.com',
        password: 'admin123',
        phone: '01899887766',
        nid: '1988123456789',
        dob: '1988-10-20',
        gender: 'Female',
        address: 'Railway HQ, Dhaka',
        role: 'admin',
        emergencyContactName: 'Farhana Begum',
        emergencyContactPhone: '01811224466',
        emergencyContactRelation: 'Spouse',
        createdAt: '2025-12-01'
      },
      {
        id: 'USR-1003',
        name: 'Anisur Rahman',
        email: 'tm@railway.com',
        password: 'tm123',
        phone: '01755443322',
        nid: '1991234567890',
        dob: '1989-08-14',
        gender: 'Male',
        address: 'Kamalapur Railway HQ, Dhaka',
        role: 'ticket_manager',
        designation: 'Ticket Manager',
        station: 'Dhaka (Kamalapur)',
        emergencyContactName: 'Farhana Rahman',
        emergencyContactPhone: '01733221100',
        emergencyContactRelation: 'Spouse',
        createdAt: '2026-01-20'
      },
      {
        id: 'USR-1004',
        name: 'Kamal Hossain',
        email: 'sm@railway.com',
        password: 'sm123',
        phone: '01811223344',
        nid: '1985123456789',
        dob: '1985-04-10',
        gender: 'Male',
        address: 'Station Master Residence, Kamalapur',
        role: 'station_master',
        designation: 'Chief Station Master',
        station: 'Dhaka (Kamalapur)',
        emergencyContactName: 'Fatema Begum',
        emergencyContactPhone: '01711998877',
        emergencyContactRelation: 'Spouse',
        createdAt: '2026-01-18'
      },
      {
        id: 'USR-1006',
        name: 'Tanvir Hossain',
        email: 'trainmanager@railway.com',
        password: 'train123',
        phone: '01722334455',
        nid: '1987654321098',
        dob: '1987-09-15',
        gender: 'Male',
        address: 'Railway Staff Quarter, Kamalapur',
        role: 'train_manager',
        designation: 'Train Manager',
        station: 'Dhaka (Kamalapur)',
        assignedTrainId: 'TR-701',
        assignedTrainName: 'Sonar Bangla Express',
        emergencyContactName: 'Momena Khatun',
        emergencyContactPhone: '01799881122',
        emergencyContactRelation: 'Mother',
        createdAt: '2026-01-22'
      },
      {
        id: 'USR-1005',
        name: 'Tariqul Islam',
        email: 'tariq@gmail.com',
        password: 'pass123',
        phone: '01912345678',
        nid: '1990456123789',
        dob: '1990-03-25',
        gender: 'Male',
        address: 'GEC Circle, Chittagong',
        role: 'user',
        createdAt: '2026-02-10'
      }
    ];

    // Seed Stations
    const defaultStations = [
      { id: 'ST-101', name: 'Dhaka (Kamalapur)', code: 'DKA', city: 'Dhaka', platforms: 11, status: 'Active' },
      { id: 'ST-102', name: 'Chattogram Junction', code: 'CTG', city: 'Chittagong', platforms: 8, status: 'Active' },
      { id: 'ST-103', name: 'Sylhet Station', code: 'SYL', city: 'Sylhet', platforms: 5, status: 'Active' },
      { id: 'ST-104', name: 'Rajshahi Station', code: 'RJH', city: 'Rajshahi', platforms: 6, status: 'Active' },
      { id: 'ST-105', name: 'Cox\'s Bazar Station', code: 'CXB', city: 'Cox\'s Bazar', platforms: 4, status: 'Active' },
      { id: 'ST-106', name: 'Khulna Station', code: 'KLN', city: 'Khulna', platforms: 5, status: 'Active' },
      { id: 'ST-107', name: 'Airport Station', code: 'APT', city: 'Dhaka', platforms: 4, status: 'Active' },
      { id: 'ST-108', name: 'Cumilla Station', code: 'CML', city: 'Cumilla', platforms: 3, status: 'Active' }
    ];

    // Seed Trains
    const defaultTrains = [
      {
        id: 'TR-701',
        name: 'Sonar Bangla Express',
        type: 'Intercity',
        source: 'Dhaka (Kamalapur)',
        destination: 'Chattogram Junction',
        deptTime: '07:00 AM',
        arrTime: '12:15 PM',
        duration: '5h 15m',
        fare: 650,
        availableSeats: 84,
        totalCoaches: 14,
        offDay: 'Saturday',
        status: 'Operational'
      },
      {
        id: 'TR-702',
        name: 'Suborno Express',
        type: 'Intercity',
        source: 'Chattogram Junction',
        destination: 'Dhaka (Kamalapur)',
        deptTime: '03:00 PM',
        arrTime: '08:20 PM',
        duration: '5h 20m',
        fare: 650,
        availableSeats: 62,
        totalCoaches: 14,
        offDay: 'Monday',
        status: 'Operational'
      },
      {
        id: 'TR-713',
        name: 'Cox\'s Bazar Express',
        type: 'Super Fast',
        source: 'Dhaka (Kamalapur)',
        destination: 'Cox\'s Bazar Station',
        deptTime: '06:30 AM',
        arrTime: '03:00 PM',
        duration: '8h 30m',
        fare: 950,
        availableSeats: 45,
        totalCoaches: 18,
        offDay: 'Tuesday',
        status: 'Operational'
      },
      {
        id: 'TR-717',
        name: 'Kalindi Express',
        type: 'Intercity',
        source: 'Dhaka (Kamalapur)',
        destination: 'Sylhet Station',
        deptTime: '06:40 AM',
        arrTime: '01:20 PM',
        duration: '6h 40m',
        fare: 520,
        availableSeats: 110,
        totalCoaches: 12,
        offDay: 'Wednesday',
        status: 'Operational'
      },
      {
        id: 'TR-755',
        name: 'Silkcity Express',
        type: 'Intercity',
        source: 'Dhaka (Kamalapur)',
        destination: 'Rajshahi Station',
        deptTime: '02:40 PM',
        arrTime: '08:30 PM',
        duration: '5h 50m',
        fare: 480,
        availableSeats: 92,
        totalCoaches: 12,
        offDay: 'Sunday',
        status: 'Operational'
      },
      {
        id: 'TR-725',
        name: 'Sundarban Express',
        type: 'Intercity',
        source: 'Dhaka (Kamalapur)',
        destination: 'Khulna Station',
        deptTime: '08:15 AM',
        arrTime: '04:00 PM',
        duration: '7h 45m',
        fare: 580,
        availableSeats: 70,
        totalCoaches: 12,
        offDay: 'Wednesday',
        status: 'Operational'
      }
    ];

    // Seed Coaches
    const defaultCoaches = [
      { id: 'CCH-01', trainId: 'TR-701', name: 'KA', type: 'AC Berth', seatsCount: 36, status: 'Active' },
      { id: 'CCH-02', trainId: 'TR-701', name: 'KHA', type: 'AC Seat / Snigdha', seatsCount: 60, status: 'Active' },
      { id: 'CCH-03', trainId: 'TR-701', name: 'GA', type: 'Shovon Chair', seatsCount: 70, status: 'Active' },
      { id: 'CCH-04', trainId: 'TR-713', name: 'A', type: 'AC Berth', seatsCount: 36, status: 'Active' },
      { id: 'CCH-05', trainId: 'TR-713', name: 'B', type: 'AC Seat / Snigdha', seatsCount: 60, status: 'Active' },
      { id: 'CCH-06', trainId: 'TR-713', name: 'C', type: 'Shovon Chair', seatsCount: 70, status: 'Active' }
    ];

    // Seed Bookings & Tickets
    const defaultBookings = [
      {
        id: 'BKG-88901',
        ticketId: 'TKT-99101',
        userId: 'USR-1001',
        passengerName: 'Rahim Ahmed',
        passengerPhone: '01711223344',
        trainId: 'TR-701',
        trainName: 'Sonar Bangla Express',
        source: 'Dhaka (Kamalapur)',
        destination: 'Chattogram Junction',
        journeyDate: '2026-08-10',
        coach: 'KA (AC Berth)',
        seats: ['KA-04', 'KA-05'],
        passengerType: 'Adult',
        totalFare: 1300,
        vat: 65,
        serviceCharge: 20,
        grandTotal: 1385,
        paymentMethod: 'bKash',
        paymentStatus: 'Paid',
        bookingStatus: 'Confirmed',
        createdAt: '2026-08-01 10:30 AM'
      },
      {
        id: 'BKG-88902',
        ticketId: 'TKT-99102',
        userId: 'USR-1001',
        passengerName: 'Rahim Ahmed',
        passengerPhone: '01711223344',
        trainId: 'TR-713',
        trainName: 'Cox\'s Bazar Express',
        source: 'Dhaka (Kamalapur)',
        destination: 'Cox\'s Bazar Station',
        journeyDate: '2026-08-15',
        coach: 'B (Snigdha)',
        seats: ['B-12'],
        passengerType: 'Adult',
        totalFare: 950,
        vat: 47,
        serviceCharge: 20,
        grandTotal: 1017,
        paymentMethod: 'Credit Card',
        paymentStatus: 'Paid',
        bookingStatus: 'Confirmed',
        createdAt: '2026-08-01 11:15 AM'
      }
    ];

    // Seed Complaints
    const defaultComplaints = [
      { id: 'CMP-501', userId: 'USR-1001', name: 'Rahim Ahmed', category: 'AC Non-Functional', train: 'Sonar Bangla Express', date: '2026-07-28', description: 'AC unit in KA coach was blowing warm air throughout the journey.', status: 'Pending' },
      { id: 'CMP-502', userId: 'USR-1003', name: 'Tariqul Islam', category: 'Cleanliness Issue', train: 'Suborno Express', date: '2026-07-20', description: 'Washroom in GHA coach lacked running water and hand soap.', status: 'Resolved' }
    ];

    // Seed Lost Items
    const defaultLostItems = [
      { id: 'LST-301', userId: 'USR-1001', item: 'Black Leather Backpack', train: 'Sonar Bangla Express', date: '2026-07-25', description: 'Left under seat KA-04. Contains HP laptop and notebook.', status: 'In Review' },
      { id: 'LST-302', userId: 'USR-1003', item: 'Reading Glasses Case', train: 'Cox\'s Bazar Express', date: '2026-07-29', description: 'Brown rayban glasses case on seat window ledge.', status: 'Found & Verified' }
    ];

    // Seed Cancellations & Refunds
    const defaultCancellations = [
      { id: 'CNC-101', ticketId: 'TKT-99080', userId: 'USR-1003', train: 'Kalindi Express', reason: 'Personal Emergency', refundAmount: 440, status: 'Approved', requestedAt: '2026-07-30' }
    ];

    const defaultRefunds = [
      { id: 'RFD-201', cancellationId: 'CNC-101', userId: 'USR-1003', amount: 440, status: 'Completed', processedAt: '2026-07-31' }
    ];

    // Seed Employees
    const defaultEmployees = [
      { id: 'EMP-001', name: 'Kamal Hossain', designation: 'Station Master', station: 'Dhaka (Kamalapur)', phone: '01700011233', emergencyContactName: 'Fatema Begum', emergencyContactPhone: '01711998877', emergencyContactRelation: 'Spouse', status: 'Active' },
      { id: 'EMP-002', name: 'Mahmudul Hasan', designation: 'Locomotive Pilot', station: 'Chattogram Junction', phone: '01800022344', emergencyContactName: 'Rashid Hasan', emergencyContactPhone: '01822334455', emergencyContactRelation: 'Brother', status: 'On Leave' },
      { id: 'EMP-003', name: 'Nasreen Akhter', designation: 'Ticket Examiner (TTE)', station: 'Dhaka (Kamalapur)', phone: '01900334455', emergencyContactName: 'Shahidul Islam', emergencyContactPhone: '01911445566', emergencyContactRelation: 'Spouse', status: 'Active' },
      { id: 'EMP-004', name: 'Anisur Rahman', designation: 'Ticket Manager', station: 'Dhaka (Kamalapur)', phone: '01755443322', emergencyContactName: 'Farhana Rahman', emergencyContactPhone: '01733221100', emergencyContactRelation: 'Spouse', status: 'Active' },
      { id: 'EMP-005', name: 'Tanvir Hossain', designation: 'Train Manager', station: 'Dhaka (Kamalapur)', phone: '01722334455', emergencyContactName: 'Momena Khatun', emergencyContactPhone: '01799881122', emergencyContactRelation: 'Mother', status: 'Active' }
    ];

    // Seed Routes & Platforms & Seats
    const defaultRoutes = [
      { id: 'ROT-01', routeName: 'Dhaka - Chittagong Direct', source: 'Dhaka (Kamalapur)', destination: 'Chattogram Junction', distanceKm: 320, totalStations: 4, status: 'Active' },
      { id: 'ROT-02', routeName: 'Dhaka - Cox\'s Bazar Express Route', source: 'Dhaka (Kamalapur)', destination: 'Cox\'s Bazar Station', distanceKm: 460, totalStations: 5, status: 'Active' },
      { id: 'ROT-03', routeName: 'Dhaka - Sylhet Scenic Route', source: 'Dhaka (Kamalapur)', destination: 'Sylhet Station', distanceKm: 310, totalStations: 6, status: 'Active' }
    ];

    const defaultPlatforms = [
      { id: 'PLT-01', station: 'Dhaka (Kamalapur)', platformNumber: 1, type: 'Broad Gauge', status: 'Available' },
      { id: 'PLT-02', station: 'Dhaka (Kamalapur)', platformNumber: 2, type: 'Meter Gauge', status: 'Occupied' },
      { id: 'PLT-03', station: 'Chattogram Junction', platformNumber: 1, type: 'Broad Gauge', status: 'Available' }
    ];

    const defaultSeats = [
      { id: 'ST-01', trainId: 'TR-701', coach: 'KA', seatNumber: 'KA-01', classType: 'AC Berth', status: 'Available' },
      { id: 'ST-02', trainId: 'TR-701', coach: 'KA', seatNumber: 'KA-02', classType: 'AC Berth', status: 'Available' },
      { id: 'ST-03', trainId: 'TR-701', coach: 'KA', seatNumber: 'KA-04', classType: 'AC Berth', status: 'Booked' },
      { id: 'ST-04', trainId: 'TR-701', coach: 'KA', seatNumber: 'KA-05', classType: 'AC Berth', status: 'Booked' }
    ];

    // Seed Schedules
    const defaultSchedules = [
      {
        id: 'SCH-101',
        trainId: 'TR-701',
        trainName: 'Sonar Bangla Express',
        source: 'Dhaka (Kamalapur)',
        destination: 'Chattogram Junction',
        departureTime: '07:00 AM',
        arrivalTime: '12:15 PM',
        platform: 'Platform #1',
        routeInfo: 'Dhaka → Airport → Cumilla → Feni → Chattogram',
        offDay: 'Saturday',
        status: 'Operational'
      },
      {
        id: 'SCH-102',
        trainId: 'TR-702',
        trainName: 'Suborno Express',
        source: 'Chattogram Junction',
        destination: 'Dhaka (Kamalapur)',
        departureTime: '03:00 PM',
        arrivalTime: '08:20 PM',
        platform: 'Platform #2',
        routeInfo: 'Chattogram → Feni → Cumilla → Airport → Dhaka',
        offDay: 'Monday',
        status: 'Operational'
      },
      {
        id: 'SCH-103',
        trainId: 'TR-713',
        trainName: 'Cox\'s Bazar Express',
        source: 'Dhaka (Kamalapur)',
        destination: 'Cox\'s Bazar Station',
        departureTime: '06:30 AM',
        arrivalTime: '03:00 PM',
        platform: 'Platform #3',
        routeInfo: 'Dhaka → Airport → Chattogram → Dohazari → Cox\'s Bazar',
        offDay: 'Tuesday',
        status: 'Operational'
      },
      {
        id: 'SCH-104',
        trainId: 'TR-717',
        trainName: 'Kalindi Express',
        source: 'Dhaka (Kamalapur)',
        destination: 'Sylhet Station',
        departureTime: '06:40 AM',
        arrivalTime: '01:20 PM',
        platform: 'Platform #4',
        routeInfo: 'Dhaka → Bhairab Bazar → Brahmanbaria → Sreemangal → Sylhet',
        offDay: 'Wednesday',
        status: 'Operational'
      },
      {
        id: 'SCH-105',
        trainId: 'TR-755',
        trainName: 'Silkcity Express',
        source: 'Dhaka (Kamalapur)',
        destination: 'Rajshahi Station',
        departureTime: '02:40 PM',
        arrivalTime: '08:30 PM',
        platform: 'Platform #5',
        routeInfo: 'Dhaka → Joydebpur → Tangail → Ishwardi Bypass → Rajshahi',
        offDay: 'Sunday',
        status: 'Operational'
      }
    ];

    const defaultMaintenance = [
      { id: 'MNT-401', trainId: 'TR-701', trainName: 'Sonar Bangla Express', category: 'AC / Cooling System', target: 'Coach KA', severity: 'Medium', desc: 'AC cooling thermostat calibrated at Kamalapur depot.', inspector: 'Tanvir Hossain', status: 'Under Repair', date: '2026-08-28' },
      { id: 'MNT-402', trainId: 'TR-701', trainName: 'Sonar Bangla Express', category: 'Brake Check', target: 'Locomotive Engine #3204', severity: 'Low', desc: 'Routine pneumatic pressure certified by Loco foreman.', inspector: 'Kamal Hossain', status: 'Resolved', date: '2026-08-27' },
      { id: 'MNT-403', trainId: 'TR-713', trainName: 'Cox\'s Bazar Express', category: 'Coupler & Suspension', target: 'Coach B', severity: 'High', desc: 'Suspension spring inspection completed before long run.', inspector: 'Mahmudul Hasan', status: 'Reported', date: '2026-08-28' }
    ];

    localStorage.setItem('users', JSON.stringify(defaultUsers));
    localStorage.setItem('stations', JSON.stringify(defaultStations));
    localStorage.setItem('trains', JSON.stringify(defaultTrains));
    localStorage.setItem('coaches', JSON.stringify(defaultCoaches));
    localStorage.setItem('bookings', JSON.stringify(defaultBookings));
    localStorage.setItem('tickets', JSON.stringify(defaultBookings)); // tickets mirror confirmed bookings
    localStorage.setItem('complaints', JSON.stringify(defaultComplaints));
    localStorage.setItem('lostItems', JSON.stringify(defaultLostItems));
    localStorage.setItem('cancellations', JSON.stringify(defaultCancellations));
    localStorage.setItem('refunds', JSON.stringify(defaultRefunds));
    localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    localStorage.setItem('routes', JSON.stringify(defaultRoutes));
    localStorage.setItem('platforms', JSON.stringify(defaultPlatforms));
    localStorage.setItem('seats', JSON.stringify(defaultSeats));
    localStorage.setItem('schedules', JSON.stringify(defaultSchedules));
    localStorage.setItem('maintenanceLogs', JSON.stringify(defaultMaintenance));

    // Seed Emergencies Reported by Train Managers
    const defaultEmergencies = [
      {
        id: 'EMG-201',
        trainId: 'TR-701',
        trainName: 'Sonar Bangla Express',
        type: 'Track Obstruction / Danger Ahead',
        severity: 'Critical - Emergency Halt Required',
        location: 'KM 42 near Tongi Junction',
        description: 'Fallen overhead tree branch crossing northbound mainline track. Emergency halt initiated. Station Master & track rescue squad dispatched.',
        reportedBy: 'Tanvir Hossain (Train Manager)',
        reportedAt: 'Today, 08:15 AM',
        status: 'Active'
      },
      {
        id: 'EMG-202',
        trainId: 'TR-713',
        trainName: "Cox's Bazar Express",
        type: 'Medical Emergency on Board',
        severity: 'High Priority - Immediate Control Action',
        location: 'Coach B (Snigdha), approaching Dohazari',
        description: 'Elderly passenger experiencing acute respiratory distress. First aid administered by guard. Platform medical team requested upon arrival.',
        reportedBy: 'Tanvir Hossain (Train Manager)',
        reportedAt: 'Today, 07:40 AM',
        status: 'Acknowledged'
      },
      {
        id: 'EMG-203',
        trainId: 'TR-702',
        trainName: 'Suborno Express',
        type: 'Locomotive Mechanical Failure',
        severity: 'Moderate - Assistance at Next Station',
        location: 'KM 118 near Feni Junction',
        description: 'Auxiliary power unit pressure drop warning. Secondary generator switched on; inspection scheduled at Feni platform.',
        reportedBy: 'Mahmudul Hasan (Locomotive Pilot)',
        reportedAt: 'Yesterday, 06:10 PM',
        status: 'Resolved'
      }
    ];
    localStorage.setItem('emergencies', JSON.stringify(defaultEmergencies));

    // Seed System and Passenger Notifications
    const defaultNotifications = [
      {
        id: 'NOTIF-101',
        type: 'delay',
        targetUserId: 'USR-1001',
        trainId: 'TR-701',
        trainName: 'Sonar Bangla Express',
        delayMinutes: 25,
        delayReason: 'Signal Congestion',
        scheduledDept: '07:00 AM',
        revisedDept: '07:25 AM',
        title: 'âš  Train Delay Alert: Sonar Bangla Express',
        message: 'Your booked train Sonar Bangla Express (TR-701) is currently delayed by 25 minutes due to Signal Congestion. Revised departure: 07:25 AM.',
        timestamp: new Date().toISOString(),
        timeStr: '15 mins ago',
        read: false
      },
      {
        id: 'NOTIF-102',
        type: 'emergency',
        title: 'ðŸš¨ Operational Alert: Track Clearance',
        message: 'Emergency caution advisory active near Tongi Junction. All intercity trains running with 15-min safety spacing.',
        timestamp: new Date().toISOString(),
        timeStr: '45 mins ago',
        read: false
      }
    ];
    localStorage.setItem('system_notifications', JSON.stringify(defaultNotifications));

    const defaultScheduleRequests = [
      {
        id: 'SRQ-501',
        trainId: 'TR-701',
        train: 'Sonar Bangla Express',
        currentSchedule: 'Dept: 07:00 AM | Arr: 12:15 PM | Platform: Platform #1',
        requestedChange: 'Shift departure to 07:20 AM and assign Platform #2',
        reason: 'Locomotive maintenance clearance and morning track congestion near Airport station',
        status: 'Pending',
        requestedBy: 'Tanvir Hossain (Train Manager)',
        createdAt: 'Today, 08:30 AM'
      },
      {
        id: 'SRQ-502',
        trainId: 'TR-702',
        train: 'Suborno Express',
        currentSchedule: 'Dept: 03:00 PM | Arr: 08:30 PM | Platform: Platform #2',
        requestedChange: 'Add temporary stoppage at Cumilla Junction (10 mins)',
        reason: 'Passenger connectivity request during peak weekend rush',
        status: 'Approved',
        requestedBy: 'Train Operations Division',
        createdAt: 'Yesterday, 04:15 PM'
      },
      {
        id: 'SRQ-503',
        trainId: 'TR-713',
        train: "Cox's Bazar Express",
        currentSchedule: 'Dept: 10:30 PM | Arr: 07:20 AM | Platform: Platform #3',
        requestedChange: 'Early departure at 09:45 PM',
        reason: 'Single line crossing optimization',
        status: 'Rejected',
        requestedBy: 'Train Manager',
        createdAt: '2 days ago'
      }
    ];
    localStorage.setItem('schedule_update_requests', JSON.stringify(defaultScheduleRequests));

    localStorage.setItem('rms_initialized', 'true');
  }

  // Ensure schedule_update_requests exists
  if (!localStorage.getItem('schedule_update_requests')) {
    const defaultScheduleRequests = [
      {
        id: 'SRQ-501',
        trainId: 'TR-701',
        train: 'Sonar Bangla Express',
        currentSchedule: 'Dept: 07:00 AM | Arr: 12:15 PM | Platform: Platform #1',
        requestedChange: 'Shift departure to 07:20 AM and assign Platform #2',
        reason: 'Locomotive maintenance clearance and morning track congestion near Airport station',
        status: 'Pending',
        requestedBy: 'Tanvir Hossain (Train Manager)',
        createdAt: 'Today, 08:30 AM'
      },
      {
        id: 'SRQ-502',
        trainId: 'TR-702',
        train: 'Suborno Express',
        currentSchedule: 'Dept: 03:00 PM | Arr: 08:30 PM | Platform: Platform #2',
        requestedChange: 'Add temporary stoppage at Cumilla Junction (10 mins)',
        reason: 'Passenger connectivity request during peak weekend rush',
        status: 'Approved',
        requestedBy: 'Train Operations Division',
        createdAt: 'Yesterday, 04:15 PM'
      },
      {
        id: 'SRQ-503',
        trainId: 'TR-713',
        train: "Cox's Bazar Express",
        currentSchedule: 'Dept: 10:30 PM | Arr: 07:20 AM | Platform: Platform #3',
        requestedChange: 'Early departure at 09:45 PM',
        reason: 'Single line crossing optimization',
        status: 'Rejected',
        requestedBy: 'Train Manager',
        createdAt: '2 days ago'
      }
    ];
    localStorage.setItem('schedule_update_requests', JSON.stringify(defaultScheduleRequests));
  }

  // Ensure emergencies exist
  if (!localStorage.getItem('emergencies')) {
    const defaultEmergencies = [
      {
        id: 'EMG-201',
        trainId: 'TR-701',
        trainName: 'Sonar Bangla Express',
        type: 'Track Obstruction / Danger Ahead',
        severity: 'Critical - Emergency Halt Required',
        location: 'KM 42 near Tongi Junction',
        description: 'Fallen overhead tree branch crossing northbound mainline track. Emergency halt initiated. Station Master & track rescue squad dispatched.',
        reportedBy: 'Tanvir Hossain (Train Manager)',
        reportedAt: 'Today, 08:15 AM',
        status: 'Active'
      },
      {
        id: 'EMG-202',
        trainId: 'TR-713',
        trainName: "Cox's Bazar Express",
        type: 'Medical Emergency on Board',
        severity: 'High Priority - Immediate Control Action',
        location: 'Coach B (Snigdha), approaching Dohazari',
        description: 'Elderly passenger experiencing acute respiratory distress. First aid administered by guard. Platform medical team requested upon arrival.',
        reportedBy: 'Tanvir Hossain (Train Manager)',
        reportedAt: 'Today, 07:40 AM',
        status: 'Acknowledged'
      },
      {
        id: 'EMG-203',
        trainId: 'TR-702',
        trainName: 'Suborno Express',
        type: 'Locomotive Mechanical Failure',
        severity: 'Moderate - Assistance at Next Station',
        location: 'KM 118 near Feni Junction',
        description: 'Auxiliary power unit pressure drop warning. Secondary generator switched on; inspection scheduled at Feni platform.',
        reportedBy: 'Mahmudul Hasan (Locomotive Pilot)',
        reportedAt: 'Yesterday, 06:10 PM',
        status: 'Resolved'
      }
    ];
    localStorage.setItem('emergencies', JSON.stringify(defaultEmergencies));
  }

  // Ensure system_notifications exist
  if (!localStorage.getItem('system_notifications')) {
    const defaultNotifications = [
      {
        id: 'NOTIF-101',
        type: 'delay',
        targetUserId: 'USR-1001',
        trainId: 'TR-701',
        trainName: 'Sonar Bangla Express',
        delayMinutes: 25,
        delayReason: 'Signal Congestion',
        scheduledDept: '07:00 AM',
        revisedDept: '07:25 AM',
        title: 'âš  Train Delay Alert: Sonar Bangla Express',
        message: 'Your booked train Sonar Bangla Express (TR-701) is delayed by 25 minutes due to Signal Congestion. Revised departure: 07:25 AM.',
        timestamp: new Date().toISOString(),
        timeStr: '15 mins ago',
        read: false
      },
      {
        id: 'NOTIF-102',
        type: 'emergency',
        title: 'ðŸš¨ Operational Alert: Track Clearance',
        message: 'Emergency caution advisory active near Tongi Junction. All intercity trains running with 15-min safety spacing.',
        timestamp: new Date().toISOString(),
        timeStr: '45 mins ago',
        read: false
      }
    ];
    localStorage.setItem('system_notifications', JSON.stringify(defaultNotifications));
  }
}

// Call store initializer
initDataStore();

// Guarantee default role accounts exist
(function ensureRoleAccounts() {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const requiredAccounts = [
    { id: 'USR-1001', name: 'Rahim Ahmed', email: 'user@railway.com', password: 'user123', role: 'user', phone: '01711223344' },
    { id: 'USR-1002', name: 'System Admin', email: 'admin@railway.com', password: 'admin123', role: 'admin', phone: '01899887766', emergencyContactName: 'Farhana Begum', emergencyContactPhone: '01811224466', emergencyContactRelation: 'Spouse' },
    { id: 'USR-1003', name: 'Anisur Rahman', email: 'tm@railway.com', password: 'tm123', role: 'ticket_manager', phone: '01755443322', designation: 'Ticket Manager', station: 'Dhaka (Kamalapur)', emergencyContactName: 'Farhana Rahman', emergencyContactPhone: '01733221100', emergencyContactRelation: 'Spouse' },
    { id: 'USR-1004', name: 'Kamal Hossain', email: 'sm@railway.com', password: 'sm123', role: 'station_master', phone: '01811223344', designation: 'Chief Station Master', station: 'Dhaka (Kamalapur)', emergencyContactName: 'Fatema Begum', emergencyContactPhone: '01711998877', emergencyContactRelation: 'Spouse' },
    { id: 'USR-1006', name: 'Tanvir Hossain', email: 'trainmanager@railway.com', password: 'train123', role: 'train_manager', phone: '01722334455', designation: 'Train Manager', station: 'Dhaka (Kamalapur)', assignedTrainId: 'TR-701', assignedTrainName: 'Sonar Bangla Express', emergencyContactName: 'Momena Khatun', emergencyContactPhone: '01799881122', emergencyContactRelation: 'Mother' }
  ];

  let modified = false;
  requiredAccounts.forEach(acc => {
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === acc.email.toLowerCase());
    if (existingIndex === -1) {
      users.push(acc);
      modified = true;
    } else {
      // Sync emergency contact if missing for staff
      if (acc.emergencyContactName && !users[existingIndex].emergencyContactName) {
        users[existingIndex].emergencyContactName = acc.emergencyContactName;
        users[existingIndex].emergencyContactPhone = acc.emergencyContactPhone;
        users[existingIndex].emergencyContactRelation = acc.emergencyContactRelation;
        modified = true;
      }
    }
  });

  if (modified) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Also sync currentUser in session if missing emergency contact for staff
  const curUserJson = localStorage.getItem('currentUser');
  if (curUserJson) {
    try {
      const curUser = JSON.parse(curUserJson);
      if (curUser && curUser.role !== 'user' && curUser.role !== 'passenger' && !curUser.emergencyContactName) {
        const match = requiredAccounts.find(r => r.email.toLowerCase() === (curUser.email || '').toLowerCase());
        if (match && match.emergencyContactName) {
          curUser.emergencyContactName = match.emergencyContactName;
          curUser.emergencyContactPhone = match.emergencyContactPhone;
          curUser.emergencyContactRelation = match.emergencyContactRelation;
          localStorage.setItem('currentUser', JSON.stringify(curUser));
        }
      }
    } catch (e) {
      console.error('Session sync error', e);
    }
  }

  // Ensure default staff directory records are clean and standardized
  try {
    let employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const defaultEmps = [
      { id: 'EMP-001', name: 'Kamal Hossain', designation: 'Station Master', station: 'Dhaka (Kamalapur)', phone: '01700011233', emergencyContactName: 'Fatema Begum', emergencyContactPhone: '01711998877', emergencyContactRelation: 'Spouse', status: 'Active' },
      { id: 'EMP-002', name: 'Mahmudul Hasan', designation: 'Locomotive Pilot', station: 'Chattogram Junction', phone: '01800022344', emergencyContactName: 'Rashid Hasan', emergencyContactPhone: '01822334455', emergencyContactRelation: 'Brother', status: 'On Leave' },
      { id: 'EMP-003', name: 'Nasreen Akhter', designation: 'Ticket Examiner (TTE)', station: 'Dhaka (Kamalapur)', phone: '01900334455', emergencyContactName: 'Shahidul Islam', emergencyContactPhone: '01911445566', emergencyContactRelation: 'Spouse', status: 'Active' },
      { id: 'EMP-004', name: 'Anisur Rahman', designation: 'Ticket Manager', station: 'Dhaka (Kamalapur)', phone: '01755443322', emergencyContactName: 'Farhana Rahman', emergencyContactPhone: '01733221100', emergencyContactRelation: 'Spouse', status: 'Active' },
      { id: 'EMP-005', name: 'Tanvir Hossain', designation: 'Train Manager', station: 'Dhaka (Kamalapur)', phone: '01722334455', emergencyContactName: 'Momena Khatun', emergencyContactPhone: '01799881122', emergencyContactRelation: 'Mother', status: 'Active' }
    ];

    if (!employees || employees.length === 0) {
      localStorage.setItem('employees', JSON.stringify(defaultEmps));
    } else {
      let empModified = false;
      employees.forEach((emp, idx) => {
        if (!emp.status || emp.status === 'undefined') {
          emp.status = 'Active';
          empModified = true;
        }
        if (!emp.emergencyContactName) {
          const match = defaultEmps.find(d => d.name === emp.name || d.id === emp.id);
          if (match) {
            emp.emergencyContactName = match.emergencyContactName;
            emp.emergencyContactPhone = match.emergencyContactPhone;
            emp.emergencyContactRelation = match.emergencyContactRelation;
            empModified = true;
          } else {
            emp.emergencyContactName = 'Emergency Ops Desk';
            emp.emergencyContactPhone = '01700000000';
            emp.emergencyContactRelation = 'Official';
            empModified = true;
          }
        }
      });
      if (empModified) {
        localStorage.setItem('employees', JSON.stringify(employees));
      }
    }
  } catch (e) {
    console.error('Employee store sync error', e);
  }
})();

// User Session Management
function getCurrentUser() {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
}


function logoutUser() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('jatra_token');  // clear JWT token
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}


// Toast Notifications
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Format Currency
function formatBDT(amount) {
  return `à§³${Number(amount).toLocaleString('en-IN')}`;
}

// Setup Global Navbar State
function updateNavbar() {
  const user = getCurrentUser();
  const navActions = document.getElementById('navActions');
  if (!navActions) return;

  if (user) {
    let roleLabel = 'Passenger';
    let portalLink = 'user-dashboard.html';
    let portalBtnText = 'My Portal';

    if (user.role === 'admin') {
      roleLabel = 'Admin';
      portalLink = 'admin-dashboard.html';
      portalBtnText = 'Admin Portal';
    } else if (user.role === 'ticket_manager') {
      roleLabel = 'Ticket Manager';
      portalLink = 'manage-tickets.html';
      portalBtnText = 'Tickets Portal';
    } else if (user.role === 'station_master') {
      roleLabel = 'Station Master';
      portalLink = 'manage-stations.html';
      portalBtnText = 'Station Portal';
    } else if (user.role === 'train_manager') {
      roleLabel = 'Train Manager';
      portalLink = 'train-manager-dashboard.html';
      portalBtnText = 'Train Portal';
    }

    navActions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <span style="color: #cbd5e1; font-size: 0.875rem;">
          Hi, <strong>${(user.name || user.username || "User").split(" ")[0]}</strong>
          <span class="inline-block ml-1 px-2 py-0.5 text-xs font-bold rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">${roleLabel}</span>
        </span>
        <a href="${portalLink}" class="btn btn-sm btn-outline" style="color: #ffffff; border-color: #38bdf8;">${portalBtnText}</a>
        <button onclick="logoutUser()" class="btn btn-sm btn-danger">Logout</button>
      </div>
    `;
  } else {
    navActions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <a href="login.html" class="btn btn-sm btn-outline" style="color: #ffffff; border-color: #38bdf8;">Login</a>
        <a href="register.html" class="btn btn-sm btn-primary">Register</a>
      </div>
    `;
  }

  // Set active nav link & clean up restricted navbar items
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

// Render Dynamic Role-Based Sidebar with Sticky Logout
function renderRoleSidebar() {
  const sidebarEl = document.querySelector('aside.sidebar');
  if (!sidebarEl) return;

  const user = getCurrentUser();
  if (!user) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  let roleHeader = 'Portal Navigation';
  let navItems = [];

  if (user.role === 'admin') {
    roleHeader = 'System Admin HQ';
    navItems = [
      { label: '📊 Main Dashboard', href: 'admin-dashboard.html' },
      { label: 'ðŸ‘¤ Profile', href: 'profile.html' },
      { label: '👔 Employee Management', href: 'manage-employees.html' },
      { label: '🚆 Train Fleet', href: 'manage-trains.html' },
      { label: '📅 Train Schedules', href: 'manage-schedules.html' },
      { label: '🚉 Station Management', href: 'manage-stations.html' },
      { label: '🛠️¤ Platform Management', href: 'manage-platforms.html' },
      { label: 'ðŸ—º Route Management', href: 'manage-routes.html' },
      { label: '🎫 Ticket Management', href: 'manage-tickets.html' },
      { label: 'âŒ Cancellation Management', href: 'manage-cancellations.html' },
      { label: 'ðŸ’¬ Complaints Management', href: 'manage-complaints.html' },
      { label: '🧳³ Lost Item Management', href: 'manage-lost-items.html' },
      { label: '📑 All Bookings', href: 'manage-bookings.html' },
      { label: 'ðŸ’³ Payment Records', href: 'manage-payments.html' }
    ];
  } else if (user.role === 'ticket_manager') {
    roleHeader = 'Ticket Manager Portal';
    navItems = [
      { label: '📊 Dashboard', href: 'manage-tickets.html' },
      { label: 'ðŸ‘¤ Profile', href: 'profile.html' },
      { label: '🎫 Ticket Management', href: 'manage-tickets.html' },
      { label: '📑 Booking Management', href: 'manage-bookings.html' },
      { label: '📊 Reports & Cancellations', href: 'manage-cancellations.html' }
    ];
  } else if (user.role === 'station_master') {
    roleHeader = 'Station Master Portal';
    navItems = [
      { label: '📊 Operations Dashboard', href: 'manage-stations.html' },
      { label: 'ðŸ‘¤ Profile', href: 'profile.html' },
      { label: '🚉 Station Management', href: 'manage-stations.html' },
      { label: '🛠️¤ Platform Management', href: 'manage-platforms.html' },
      { label: 'ðŸ—º Route Management', href: 'manage-routes.html' },
      { label: '📅 Train Schedule Management', href: 'manage-schedules.html' },
      { label: '🧳³ Lost Item Management', href: 'manage-lost-items.html' },
      { label: '🔔 Notifications', href: 'javascript:void(0)', onclick: 'showNotificationsModal()' }
    ];
  } else if (user.role === 'train_manager') {
    roleHeader = 'Train Manager Portal';
    navItems = [
      { label: '📊 Operations Dashboard', href: 'train-manager-dashboard.html' },
      { label: 'ðŸ‘¤ Profile', href: 'profile.html' },
      { label: '📅 Train Schedules', href: 'manage-schedules.html' },
      { label: '🚆 Train Fleet Details', href: 'manage-trains.html' },
      { label: 'ðŸšƒ Coaches Management', href: 'manage-coaches.html' },
      { label: '🚉 Platform Operations', href: 'manage-platforms.html' },
      { label: '🔔 Notifications', href: 'javascript:void(0)', onclick: 'showNotificationsModal()' }
    ];
  } else {
    // Passenger / User
    roleHeader = 'Passenger Portal';
    navItems = [
      { label: '📊 Dashboard', href: 'user-dashboard.html' },
      { label: 'ðŸ‘¤ Profile', href: 'profile.html' },
      { label: '🔍 Search/Book Ticket', href: 'search-train.html' },
      { label: '🎟️ My Tickets', href: 'my-tickets.html' },
      { label: 'âŒ Cancel Ticket', href: 'cancellation.html' },
      { label: 'ðŸ’µ Refund Status', href: 'refund.html' },
      { label: 'ðŸ’¬ Complaints', href: 'complaint.html' },
      { label: '🧳³ Lost Item', href: 'lost-item.html' },
      { label: '🔔 Notifications', href: 'javascript:void(0)', onclick: 'showNotificationsModal()' }
    ];
  }

  const linksHtml = navItems.map(item => {
    const isActive = (currentPath === item.href) ? 'active' : '';
    const onclickAttr = item.onclick ? `onclick="${item.onclick}"` : '';
    return `<a href="${item.href}" ${onclickAttr} class="sidebar-link ${isActive}"><span>${item.label}</span></a>`;
  }).join('');

  sidebarEl.innerHTML = `
    <div class="sidebar-header flex items-center justify-between">
      <span>${roleHeader}</span>
      <button onclick="toggleMobileSidebar()" class="md:hidden text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer" aria-label="Close Sidebar">✕</button>
    </div>
    <nav class="sidebar-nav">
      ${linksHtml}
    </nav>
  `;

  // Attach click listener on mobile to close drawer
  sidebarEl.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebarEl.classList.remove('active');
        const backdrop = document.getElementById('sidebarDrawerBackdrop');
        if (backdrop) backdrop.remove();
      }
    });
  });
}

// Global Toggle Mobile Sidebar Drawer
window.toggleMobileSidebar = function() {
  const sidebar = document.querySelector('aside.sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('active');
  let backdrop = document.getElementById('sidebarDrawerBackdrop');
  if (sidebar.classList.contains('active')) {
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebarDrawerBackdrop';
      backdrop.className = 'fixed inset-0 bg-slate-950/70 z-40 md:hidden transition-opacity cursor-pointer';
      backdrop.onclick = () => {
        sidebar.classList.remove('active');
        backdrop.remove();
      };
      document.body.appendChild(backdrop);
    }
  } else if (backdrop) {
    backdrop.remove();
  }
};

// Utility to calculate revised arrival / departure time based on delay minutes
function calculateRevisedTime(timeStr, delayMins) {
  if (!timeStr || !delayMins || delayMins <= 0) return timeStr || '07:00 AM';
  try {
    const parts = timeStr.trim().split(' ');
    const timeParts = parts[0].split(':');
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    const isPM = parts[1] && parts[1].toUpperCase() === 'PM';
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes + delayMins, 0, 0);

    let newHours = date.getHours();
    const newMinutes = date.getMinutes().toString().padStart(2, '0');
    const newPeriod = newHours >= 12 ? 'PM' : 'AM';
    newHours = newHours % 12;
    if (newHours === 0) newHours = 12;

    return `${newHours.toString().padStart(2, '0')}:${newMinutes} ${newPeriod}`;
  } catch (e) {
    return timeStr;
  }
}

// Fetch active delay alerts for a passenger's confirmed booked tickets
function getPassengerDelayAlerts(userId, userPhone) {
  const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const trains = JSON.parse(localStorage.getItem('trains') || '[]');
  const dismissedAlerts = JSON.parse(sessionStorage.getItem('dismissed_delay_alerts') || '[]');

  const myTickets = tickets.filter(t => 
    (t.userId === userId || (userPhone && t.passengerPhone === userPhone) || (!userId && t.userId === 'USR-1001')) &&
    t.bookingStatus === 'Confirmed'
  );

  const alerts = [];
  myTickets.forEach(ticket => {
    const train = trains.find(tr => tr.id === ticket.trainId || tr.name === ticket.trainName);
    const hasDelay = train && ((train.delayMinutes && train.delayMinutes > 0) || train.status === 'Delayed' || train.status === 'Cancelled');
    const ticketKey = ticket.ticketId || ticket.id;

    if (hasDelay && !dismissedAlerts.includes(ticketKey)) {
      const scheduledDept = train.departure || train.deptTime || '07:00 AM';
      const delayMins = train.delayMinutes || 0;
      const revisedDept = calculateRevisedTime(scheduledDept, delayMins);

      alerts.push({
        ticketId: ticketKey,
        trainId: train.id,
        trainName: train.name,
        source: ticket.source || train.source,
        destination: ticket.destination || train.destination,
        coach: ticket.coach,
        seats: ticket.seats,
        journeyDate: ticket.journeyDate || 'Today',
        delayMinutes: delayMins,
        delayReason: train.delayReason || (train.status === 'Cancelled' ? 'Service Cancelled' : 'Operational Congestion'),
        scheduledDept: scheduledDept,
        revisedDept: revisedDept,
        status: train.status || 'Delayed'
      });
    }
  });

  return alerts;
}

// Render dynamic Passenger Travel Delay Alert Banner on dashboard/tickets
function renderPassengerDelayAlertBanner(containerId = 'passengerDelayAlertContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentUser = getCurrentUser() || { id: 'USR-1001', phone: '01711223344' };
  const alerts = getPassengerDelayAlerts(currentUser.id, currentUser.phone);

  if (alerts.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = alerts.map(alert => `
    <div class="relative p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-500/50 rounded-2xl shadow-lg mb-6 backdrop-blur-sm">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            âš 
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 uppercase tracking-wide">
                Live Delay Alert
              </span>
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                Ticket #${alert.ticketId}
              </span>
              <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">
                ${alert.source} → ${alert.destination}
              </span>
            </div>
            
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
              Your booked train <span class="text-amber-600 dark:text-amber-400 font-black">${alert.trainName} (${alert.trainId})</span> is delayed by 
              <span class="px-2 py-0.5 rounded bg-rose-500 text-white font-black text-sm ml-1">+${alert.delayMinutes} Mins</span>
            </h3>
            
            <div class="mt-2 text-xs text-slate-700 dark:text-slate-300 flex flex-wrap gap-y-1 gap-x-4 items-center">
              <div><strong>Delay Reason:</strong> <span class="text-rose-600 dark:text-rose-400 font-semibold">${alert.delayReason}</span></div>
              <div><strong>Scheduled Dept:</strong> <span class="line-through text-slate-500">${alert.scheduledDept}</span></div>
              <div><strong>Revised Estimated Dept:</strong> <span class="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">${alert.revisedDept}</span></div>
              <div><strong>Coach / Seats:</strong> <span class="font-medium">${alert.coach || 'Standard'} (${Array.isArray(alert.seats) ? alert.seats.join(', ') : alert.seats || 'Assigned'})</span></div>
            </div>
          </div>
        </div>

        <button onclick="dismissPassengerDelayAlert('${alert.ticketId}')" class="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-lg p-1 transition-colors cursor-pointer" title="Dismiss Alert">
          ✕
        </button>
      </div>
    </div>
  `).join('');
}

// Dismiss alert for current session
window.dismissPassengerDelayAlert = function(ticketId) {
  const dismissed = JSON.parse(sessionStorage.getItem('dismissed_delay_alerts') || '[]');
  if (!dismissed.includes(ticketId)) {
    dismissed.push(ticketId);
    sessionStorage.setItem('dismissed_delay_alerts', JSON.stringify(dismissed));
  }
  renderPassengerDelayAlertBanner('passengerDelayAlertContainer');
};

// Dispatch delay notifications to all confirmed passengers of a train
function dispatchPassengerDelayNotification(trainId, delayMins, delayReason) {
  const trains = JSON.parse(localStorage.getItem('trains') || '[]');
  const train = trains.find(t => t.id === trainId);
  if (!train) return 0;

  const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const notifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
  const scheduledDept = train.departure || train.deptTime || '07:00 AM';
  const revisedDept = calculateRevisedTime(scheduledDept, delayMins);

  let notifiedCount = 0;
  tickets.forEach(t => {
    if ((t.trainId === trainId || t.trainName === train.name) && t.bookingStatus === 'Confirmed') {
      notifiedCount++;
      t.delayMinutes = delayMins;
      t.delayReason = delayReason;
      t.revisedDept = revisedDept;

      notifications.unshift({
        id: `NOTIF-${Date.now()}-${t.ticketId || t.id}`,
        type: 'delay',
        targetUserId: t.userId,
        targetTicketId: t.ticketId || t.id,
        trainId: train.id,
        trainName: train.name,
        delayMinutes: delayMins,
        delayReason: delayReason,
        scheduledDept: scheduledDept,
        revisedDept: revisedDept,
        title: `âš  Train Delay Notice: ${train.name}`,
        message: `Your booked train ${train.name} (${train.id}) for ticket ${t.ticketId || t.id} is delayed by ${delayMins} minutes due to ${delayReason}. Revised departure: ${revisedDept}.`,
        timestamp: new Date().toISOString(),
        timeStr: 'Just now',
        read: false
      });
    }
  });

  localStorage.setItem('tickets', JSON.stringify(tickets));
  localStorage.setItem('system_notifications', JSON.stringify(notifications));
  return notifiedCount;
}

// Global System Notifications Modal with Live Delay Notices
function showNotificationsModal() {
  const currentUser = getCurrentUser() || { id: 'USR-1001', role: 'user' };
  const notifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');

  // Check if passenger has active train delays and ensure real-time notice is included
  const delayAlerts = getPassengerDelayAlerts(currentUser.id, currentUser.phone);
  
  // Format items
  let displayList = [...notifications];
  if (currentUser.role === 'user' || currentUser.role === 'passenger') {
    displayList = notifications.filter(n => !n.targetUserId || n.targetUserId === currentUser.id || n.targetUserId === 'USR-1001');
  }

  let modal = document.getElementById('notificationsModalOverlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'notificationsModalOverlay';
    modal.className = 'modal-overlay active';
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  const unreadCount = displayList.filter(n => !n.read).length + delayAlerts.length;

  modal.innerHTML = `
    <div class="modal-container max-w-lg bg-slate-800 text-white border border-slate-700 rounded-2xl p-6 shadow-2xl">
      <div class="flex justify-between items-center pb-3 border-b border-slate-700 mb-4">
        <div class="flex items-center gap-2">
          <span class="text-xl">🔔</span>
          <h3 class="text-lg font-bold text-white">System & Travel Notifications</h3>
          ${unreadCount > 0 ? `<span class="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">${unreadCount} New</span>` : ''}
        </div>
        <button onclick="document.getElementById('notificationsModalOverlay').remove()" class="text-slate-400 hover:text-white text-xl font-bold cursor-pointer">&times;</button>
      </div>

      <!-- Real-time Passenger Delay Alerts in Notification Center -->
      ${delayAlerts.length > 0 ? `
        <div class="mb-4 space-y-2">
          ${delayAlerts.map(da => `
            <div class="p-3.5 bg-amber-500/20 border-2 border-amber-500/60 rounded-xl text-xs">
              <div class="flex items-center justify-between font-bold text-amber-400 mb-1">
                <span class="flex items-center gap-1.5">âš  ACTIVE TRAIN DELAY ALERT</span>
                <span class="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black text-[10px]">+${da.delayMinutes}m Delayed</span>
              </div>
              <p class="text-slate-200 leading-relaxed">
                Your train <strong>${da.trainName} (${da.trainId})</strong> is delayed by <strong>${da.delayMinutes} mins</strong> due to <em>${da.delayReason}</em>.
              </p>
              <div class="mt-2 pt-1 border-t border-amber-500/30 flex justify-between text-[11px] text-amber-200">
                <span>Sched: ${da.scheduledDept}</span>
                <strong class="text-white bg-slate-900/80 px-2 py-0.5 rounded border border-amber-400/40">Est. Departure: ${da.revisedDept}</strong>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
        ${displayList.length === 0 && delayAlerts.length === 0 ? `
          <div class="text-center py-6 text-slate-400 text-xs">No notifications to display.</div>
        ` : displayList.map(n => {
          let badgeClass = 'border-sky-500/30 text-sky-400';
          let icon = '🚆';
          if (n.type === 'delay') {
            badgeClass = 'border-amber-500/40 text-amber-400 bg-amber-500/10';
            icon = 'âš ';
          } else if (n.type === 'emergency') {
            badgeClass = 'border-rose-500/40 text-rose-400 bg-rose-500/10';
            icon = 'ðŸš¨';
          }

          return `
            <div class="p-3 bg-slate-900/80 rounded-xl border ${badgeClass} text-xs">
              <div class="flex justify-between items-start mb-1">
                <div class="font-bold flex items-center gap-1.5">
                  <span>${icon}</span>
                  <span>${n.title || 'System Notification'}</span>
                </div>
                <span class="text-[10px] text-slate-500 whitespace-nowrap">${n.timeStr || 'Recent'}</span>
              </div>
              <p class="text-slate-300 leading-relaxed">${n.message || ''}</p>
            </div>
          `;
        }).join('')}
      </div>

      <div class="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
        <button onclick="markAllNotificationsAsRead()" class="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer">
          ✓ Mark all as read
        </button>
        <button onclick="document.getElementById('notificationsModalOverlay').remove()" class="py-2 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
          Close
        </button>
      </div>
    </div>
  `;
}

window.markAllNotificationsAsRead = function() {
  const notifs = JSON.parse(localStorage.getItem('system_notifications') || '[]');
  notifs.forEach(n => n.read = true);
  localStorage.setItem('system_notifications', JSON.stringify(notifs));
  showToast('All notifications marked as read', 'info');
  showNotificationsModal();
};

// Strict Role-Based Access Protection Guard
function enforcePageRolePermissions() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  // Public pages accessible without login
  const publicPages = ['index.html', 'login.html', 'register.html', 'search-train.html', 'train-results.html', 'train-details.html'];
  if (publicPages.includes(currentPath)) {
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please sign in to access portal features.', 'danger');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
    return;
  }

  const role = currentUser.role;

  // Rule 1: Employee Management ONLY Admin
  if (currentPath === 'manage-employees.html' && role !== 'admin') {
    showToast('Access Denied: Employee Management is restricted to System Admin.', 'danger');
    redirectToDefaultPortal(role);
    return;
  }

  // Rule 2: Admin-only portals
  const adminOnlyPages = ['admin-dashboard.html'];
  if (adminOnlyPages.includes(currentPath) && role !== 'admin') {
    showToast('Access Denied: System Admin privileges required.', 'danger');
    redirectToDefaultPortal(role);
    return;
  }

  // Rule 3: Lost Item Management backend CRUD accessible to Station Master and Admin
  const stationMasterAndAdminPages = ['manage-lost-items.html'];
  if (stationMasterAndAdminPages.includes(currentPath) && role !== 'station_master' && role !== 'admin') {
    showToast('Access Denied: Lost Item Management is restricted to Station Staff & Admin.', 'danger');
    redirectToDefaultPortal(role);
    return;
  }

  // Rule 4: Payment Management accessible only to Admin and Ticket Manager
  if (currentPath === 'manage-payments.html' && !['admin', 'ticket_manager'].includes(role)) {
    showToast('Access Denied: Payment Management is restricted to Ticket Staff and Admin.', 'danger');
    redirectToDefaultPortal(role);
    return;
  }

  // Rule 4: Train Schedule Management accessible to Station Master, Train Manager, Admin
  if (currentPath === 'manage-schedules.html' && !['station_master', 'train_manager', 'admin'].includes(role)) {
    showToast('Access Denied: Schedule Management is restricted to Station Master, Train Manager, and Admin.', 'danger');
    redirectToDefaultPortal(role);
    return;
  }

  // Rule 5: Maintenance Management accessible to Admin, Train Manager, Station Master
  if (currentPath === 'manage-maintenance.html' && !['admin', 'train_manager', 'station_master'].includes(role)) {
    showToast('Access Denied: Maintenance Management is restricted to Operations Staff.', 'danger');
    redirectToDefaultPortal(role);
    return;
  }

  // Rule 5: Train Manager Portal ONLY Train Manager & Admin
  if (currentPath === 'train-manager-dashboard.html' && role !== 'train_manager' && role !== 'admin') {
    showToast('Access Denied: Train Manager Portal is restricted to Train Managers.', 'danger');
    redirectToDefaultPortal(role);
    return;
  }

  // Rule 5: Passenger Portal pages redirect if staff
  if (currentPath === 'user-dashboard.html' && role !== 'user' && role !== 'passenger') {
    redirectToDefaultPortal(role);
    return;
  }
}

function redirectToDefaultPortal(role) {
  let target = 'user-dashboard.html';
  if (role === 'admin') target = 'admin-dashboard.html';
  else if (role === 'ticket_manager') target = 'manage-tickets.html';
  else if (role === 'station_master') target = 'manage-stations.html';
  else if (role === 'train_manager') target = 'train-manager-dashboard.html';

  setTimeout(() => {
    window.location.href = target;
  }, 600);
}

document.addEventListener('DOMContentLoaded', () => {
  enforcePageRolePermissions();
  updateNavbar();
  renderRoleSidebar();

  // Mobile nav toggle
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
});


