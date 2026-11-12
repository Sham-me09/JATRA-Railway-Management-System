"""
Comprehensive Test Suite for JATRA Railway System
Tests all endpoints against Oracle Database 11g XE using Flask test_client.
"""
import json
import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from db import OracleConnection

def run_tests():
    client = app.test_client()
    passed = 0
    failed = 0
    errors = []

    def test(name, func):
        nonlocal passed, failed
        try:
            func()
            print(f"  [PASS] {name}")
            passed += 1
        except AssertionError as ae:
            print(f"  [FAIL] {name}: {ae}")
            failed += 1
            errors.append((name, str(ae)))
        except Exception as e:
            print(f"  [ERROR] {name}: {e}")
            failed += 1
            errors.append((name, str(e)))

    print("=" * 60)
    print("STARTING JATRA RAILWAY END-TO-END TEST SUITE")
    print("=" * 60)

    # 1. Health Check
    def test_health():
        res = client.get("/api/health")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.data}"
        data = res.get_json()
        assert data["database"] == "connected", f"DB not connected: {data}"
    test("Health Check (GET /api/health)", test_health)

    # 2. Login Tests for All Roles
    tokens = {}
    roles = [
        ("user@railway.com", "user123", "user"),
        ("admin@railway.com", "admin123", "admin"),
        ("trainmanager@railway.com", "train123", "train_manager"),
        ("sm@railway.com", "sm123", "station_master"),
        ("tm@railway.com", "tm123", "ticket_manager"),
    ]

    for email, password, expected_role in roles:
        def test_login(e=email, p=password, r=expected_role):
            res = client.post("/api/auth/login", json={"email": e, "password": p})
            assert res.status_code == 200, f"Login failed for {e} ({res.status_code}): {res.data.decode()}"
            data = res.get_json()
            assert "token" in data, f"No token in response: {data}"
            user_data = data.get("user") or {}
            assert user_data.get("role") == r, f"Role mismatch: expected {r}, got {user_data.get('role')}"
            tokens[r] = data["token"]
        test(f"Login for {email} ({expected_role})", test_login)

    # 3. Registration & Profile Test
    import time
    test_user_email = f"test_audit_{int(time.time())}@railway.com"
    reg_token = None

    def test_registration():
        nonlocal reg_token
        res = client.post("/api/auth/register", json={
            "first_name": "Audit",
            "last_name": "Tester",
            "email": test_user_email,
            "password": "Password123!",
            "phone": "01700000099",
            "gender": "MALE",
            "date_of_birth": "1995-05-15",
            "city": "Dhaka",
            "nid": f"NID{int(time.time()) % 100000000}"
        })
        assert res.status_code == 201, f"Register failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        assert "token" in data, "No token returned upon registration"
        reg_token = data["token"]
    test(f"Register New Passenger ({test_user_email})", test_registration)

    def test_profile():
        res = client.get("/api/profile", headers={"Authorization": f"Bearer {reg_token}"})
        assert res.status_code == 200, f"Profile failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        profile = data.get("profile") or {}
        assert profile.get("email") == test_user_email, f"Email mismatch: {data}"
        assert profile.get("first_name") == "Audit", f"Name mismatch: {data}"
    test("User Profile (GET /api/profile)", test_profile)

    # 4. Station List
    station_names = []
    def test_stations():
        nonlocal station_names
        res = client.get("/api/stations")
        assert res.status_code == 200, f"Stations failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        assert len(data.get("stations", [])) > 0, "No stations returned"
        station_names = [s["station_name"] for s in data["stations"]]
    test("Stations List (GET /api/stations)", test_stations)

    # 5. Trains Fleet
    train_ids = []
    def test_trains():
        nonlocal train_ids
        res = client.get("/api/trains")
        assert res.status_code == 200, f"Trains failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        assert len(data.get("trains", [])) > 0, "No trains returned"
        train_ids = [t["train_id"] for t in data["trains"]]
    test("Trains Fleet (GET /api/trains)", test_trains)

    # 6. Train Search
    search_results = []
    def test_train_search():
        nonlocal search_results
        res = client.get("/api/trains/search?from_station=Dhaka&to_station=Chattogram&date=2026-09-10")
        assert res.status_code == 200, f"Search failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        trains = data.get("trains", [])
        assert len(trains) > 0, "Expected at least 1 train for Dhaka -> Chattogram"
        search_results = trains
    test("Train Schedule Search (GET /api/trains/search)", test_train_search)

    # 7. Train Coaches & Seats
    coach_id = None
    seat_id = None
    seat_num = None
    coach_num = None

    def test_train_coaches():
        nonlocal coach_id, coach_num
        assert len(train_ids) > 0, "No trains available"
        tid = train_ids[0]
        res = client.get(f"/api/trains/{tid}/coaches")
        assert res.status_code == 200, f"Coaches failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        coaches = data.get("coaches", [])
        assert len(coaches) > 0, f"No coaches for train {tid}"
        coach_id = coaches[0]["coach_id"]
        coach_num = coaches[0].get("coach_name") or coaches[0].get("coach_type")
    test("Train Coaches (GET /api/trains/<id>/coaches)", test_train_coaches)

    def test_coach_seats():
        nonlocal seat_id, seat_num, coach_id, coach_num
        assert len(train_ids) > 0, "No trains available"

        res_c = client.get(f"/api/trains/{train_ids[0]}/coaches")
        assert res_c.status_code == 200, f"Coaches failed: {res_c.data.decode()}"
        coaches = res_c.get_json().get("coaches", [])
        assert len(coaches) > 0, "No coaches for train"

        found = False
        for coach in coaches:
            res = client.get(f"/api/coaches/{coach['coach_id']}/seats")
            assert res.status_code == 200, f"Seats failed ({res.status_code}): {res.data.decode()}"
            seats = res.get_json().get("seats", [])
            avail = [s for s in seats if s.get("seat_status") == "AVAILABLE"]
            if avail:
                coach_id = coach["coach_id"]
                coach_num = coach.get("coach_name") or coach.get("coach_type")
                seat_id = avail[0]["seat_id"]
                seat_num = avail[0]["seat_number"]
                found = True
                break

        assert found, "No available seat found in any coach for this train"
    test("Coach Seats (GET /api/coaches/<id>/seats)", test_coach_seats)

    # 8. Create Booking & Fetch Bookings
    booking_id = None
    ticket_id = None

    def test_create_booking():
        nonlocal booking_id, ticket_id
        user_tok = tokens.get("user")
        assert user_tok is not None, "User token missing"
        assert len(train_ids) > 0, "No train id"
        assert coach_id is not None, "No coach id"
        assert seat_id is not None, "No seat id"

        res = client.post("/api/bookings", headers={"Authorization": f"Bearer {user_tok}"}, json={
            "train_id": train_ids[0],
            "coach_id": coach_id,
            "seat_id": seat_id,
            "payment_method": "BKASH"
        })
        assert res.status_code in (200, 201), f"Create booking failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        booking = data.get("booking") or {}
        booking_id = booking.get("booking_id")
        assert booking_id is not None, f"No booking_id returned: {data}"
        ticket_id = booking.get("ticket_id")
    test("Create Booking (POST /api/bookings)", test_create_booking)

    def test_get_user_bookings():
        nonlocal ticket_id
        user_tok = tokens.get("user")
        res = client.get("/api/bookings", headers={"Authorization": f"Bearer {user_tok}"})
        assert res.status_code == 200, f"Get bookings failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        bookings = data.get("bookings", [])
        assert len(bookings) > 0, "Expected at least 1 booking"
        if not ticket_id:
            ticket_id = bookings[0].get("ticket_id") or bookings[0].get("ticketId")
    test("Get User Bookings (GET /api/bookings)", test_get_user_bookings)

    # 9. Cancel Ticket Flow
    def test_cancel_ticket():
        user_tok = tokens.get("user")
        assert ticket_id is not None, "No ticket_id to cancel"
        res = client.post(f"/api/tickets/{ticket_id}/cancel", headers={"Authorization": f"Bearer {user_tok}"}, json={
            "reason": "Plans changed - Automated Audit Test"
        })
        assert res.status_code == 200, f"Cancel ticket failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        assert "refund_amount" in data or "refund" in data or "message" in data, f"Unexpected response: {data}"
    test("Cancel Ticket (POST /api/tickets/<id>/cancel)", test_cancel_ticket)

    # 10. Delay Notifications
    def test_delay_notifications():
        user_tok = tokens.get("user")
        res = client.get("/api/notifications/delays", headers={"Authorization": f"Bearer {user_tok}"})
        assert res.status_code == 200, f"Delays failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        assert "notifications" in data, f"No notifications key: {data}"
    test("Delay Notifications (GET /api/notifications/delays)", test_delay_notifications)

    # 11. Manager Operations (Train Manager)
    tm_tok = tokens.get("train_manager")

    def test_manager_update_delay():
        assert len(train_ids) > 0, "No train id"
        tid = train_ids[0]
        res = client.put(f"/api/manager/trains/{tid}/delay", headers={"Authorization": f"Bearer {tm_tok}"}, json={
            "delay_minutes": 15,
            "reason": "Signal Maintenance"
        })
        assert res.status_code == 200, f"Update delay failed ({res.status_code}): {res.data.decode()}"
    test("Manager Update Delay (PUT /api/manager/trains/<id>/delay)", test_manager_update_delay)

    def test_manager_update_status():
        assert len(train_ids) > 0, "No train id"
        tid = train_ids[0]
        res = client.put(f"/api/manager/trains/{tid}/status", headers={"Authorization": f"Bearer {tm_tok}"}, json={
            "operational_status": "OPERATIONAL"
        })
        assert res.status_code == 200, f"Update status failed ({res.status_code}): {res.data.decode()}"
    test("Manager Update Train Status (PUT /api/manager/trains/<id>/status)", test_manager_update_status)

    def test_manager_report_incident():
        assert len(train_ids) > 0, "No train id"
        tid = train_ids[0]
        res = client.post("/api/manager/incidents", headers={"Authorization": f"Bearer {tm_tok}"}, json={
            "train_id": tid,
            "incident_type": "Track Inspection",
            "description": "Routine track switch inspection completed.",
            "priority": "LOW"
        })
        assert res.status_code == 201, f"Report incident failed ({res.status_code}): {res.data.decode()}"
    test("Manager Report Incident (POST /api/manager/incidents)", test_manager_report_incident)

    def test_manager_schedule_requests():
        assert len(train_ids) > 0, "No train id"
        tid = train_ids[0]
        res_post = client.post("/api/manager/schedule-requests", headers={"Authorization": f"Bearer {tm_tok}"}, json={
            "train_id": tid,
            "requested_change": "Adjust departure to 08:30 AM",
            "reason": "Platform congestion avoidance"
        })
        assert res_post.status_code == 201, f"Post schedule request failed ({res_post.status_code}): {res_post.data.decode()}"

        res_get = client.get("/api/manager/schedule-requests", headers={"Authorization": f"Bearer {tm_tok}"})
        assert res_get.status_code == 200, f"Get schedule requests failed ({res_get.status_code}): {res_get.data.decode()}"
        data = res_get.get_json()
        assert len(data.get("requests", [])) > 0, "No schedule requests returned"
    test("Manager Schedule Requests (GET & POST /api/manager/schedule-requests)", test_manager_schedule_requests)

    # 12. Admin Endpoints
    adm_tok = tokens.get("admin")

    def test_admin_incidents():
        res = client.get("/api/admin/incidents", headers={"Authorization": f"Bearer {adm_tok}"})
        assert res.status_code == 200, f"Admin incidents failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        assert "incidents" in data, f"No incidents in response: {data}"
    test("Admin Incidents (GET /api/admin/incidents)", test_admin_incidents)

    def test_admin_schedules():
        res = client.get("/api/admin/schedules", headers={"Authorization": f"Bearer {adm_tok}"})
        assert res.status_code == 200, f"Admin schedules failed ({res.status_code}): {res.data.decode()}"
        data = res.get_json()
        assert len(data.get("schedules", [])) > 0, "No schedules returned"
    test("Admin Schedules (GET /api/admin/schedules)", test_admin_schedules)

    # 13. Passenger Complaints
    def test_complaints():
        user_tok = tokens.get("user")
        res_post = client.post("/api/complaints", headers={"Authorization": f"Bearer {user_tok}"}, json={
            "description": "AC cooling was slightly delayed in coach C-1."
        })
        assert res_post.status_code == 201, f"Post complaint failed ({res_post.status_code}): {res_post.data.decode()}"

        res_get = client.get("/api/complaints", headers={"Authorization": f"Bearer {user_tok}"})
        assert res_get.status_code == 200, f"Get complaints failed ({res_get.status_code}): {res_get.data.decode()}"
        data = res_get.get_json()
        assert len(data.get("complaints", [])) > 0, "Expected at least 1 complaint"
    test("Passenger Complaints (GET & POST /api/complaints)", test_complaints)

    print("=" * 60)
    print(f"RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 60)
    if errors:
        print("FAILURES:")
        for name, err in errors:
            print(f" - {name}: {err}")
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)