-- ============================================================
-- JATRA / RAILWAY MANAGEMENT SYSTEM — FINAL SCHEMA
-- Fare formula implemented exactly as requested:
--   Distance x Rate/km x Coach Factor x Passenger Factor = Base Fare
--   Base Fare + VAT + Service Charge = Final Amount
-- ============================================================

-- ============================================================
-- 0. BASE USER / EMPLOYEE / ROLE TABLES
-- ============================================================

CREATE TABLE APP_USER (
    user_id       VARCHAR2(50) PRIMARY KEY,
    email         VARCHAR2(100) NOT NULL UNIQUE,
    password      VARCHAR2(255) NOT NULL,
    user_type     VARCHAR2(30) NOT NULL
                  CHECK (user_type IN
                  ('PASSENGER','EMPLOYEE','ADMIN','TRAIN_MANAGER',
                   'STATION_MASTER','TICKET_MANAGER')),
    first_name    VARCHAR2(50) NOT NULL,
    middle_name   VARCHAR2(50),
    last_name     VARCHAR2(50) NOT NULL,
    gender        VARCHAR2(20)
                  CHECK (gender IN ('MALE','FEMALE','OTHER')),
    nid           VARCHAR2(50) UNIQUE NOT NULL,
    city          VARCHAR2(50),
    house_no      VARCHAR2(50),
    post_code     VARCHAR2(20),
    date_of_birth DATE NOT NULL
);

CREATE TABLE USER_PHONE_NUMBER (
    user_id      VARCHAR2(50) NOT NULL,
    phone_number VARCHAR2(20) NOT NULL,

    CONSTRAINT pk_user_phone PRIMARY KEY (user_id, phone_number),
    CONSTRAINT fk_user_phone_user FOREIGN KEY (user_id)
        REFERENCES APP_USER(user_id) ON DELETE CASCADE
);

CREATE TABLE EMPLOYEE (
    user_id       VARCHAR2(50) PRIMARY KEY,
    salary        NUMBER(10,2) NOT NULL CHECK (salary >= 0),
    joining_date  DATE NOT NULL,
    role          VARCHAR2(50) NOT NULL,
    station       VARCHAR2(100),
    status        VARCHAR2(30) DEFAULT 'ACTIVE'
                  CHECK (status IN ('ACTIVE','ON_LEAVE')),

    CONSTRAINT fk_employee_user FOREIGN KEY (user_id)
        REFERENCES APP_USER(user_id) ON DELETE CASCADE
);

CREATE TABLE TICKET_MANAGER (
    user_id    VARCHAR2(50) PRIMARY KEY,
    location   VARCHAR2(100),
    counter_no VARCHAR2(20) NOT NULL,

    CONSTRAINT fk_ticket_mgr_employee FOREIGN KEY (user_id)
        REFERENCES EMPLOYEE(user_id) ON DELETE CASCADE
);

CREATE TABLE STATION_MASTER (
    user_id   VARCHAR2(50) PRIMARY KEY,
    shift     VARCHAR2(30) CHECK (shift IN ('MORNING','EVENING','NIGHT')),
    office_no VARCHAR2(20),

    CONSTRAINT fk_station_master_employee FOREIGN KEY (user_id)
        REFERENCES EMPLOYEE(user_id) ON DELETE CASCADE
);

CREATE TABLE TRAIN_MANAGER (
    user_id           VARCHAR2(50) PRIMARY KEY,
    assigned_train_id VARCHAR2(50),

    CONSTRAINT fk_train_mgr_employee FOREIGN KEY (user_id)
        REFERENCES EMPLOYEE(user_id) ON DELETE CASCADE
);

CREATE TABLE EMERGENCY_CONTACT (
    emergency_id VARCHAR2(50) PRIMARY KEY,
    employee_id  VARCHAR2(50) NOT NULL,
    name         VARCHAR2(100) NOT NULL,
    relationship VARCHAR2(50) NOT NULL,
    phone_number VARCHAR2(20) NOT NULL,

    CONSTRAINT fk_emergency_employee FOREIGN KEY (employee_id)
        REFERENCES EMPLOYEE(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 1. STATION / PLATFORM
-- ============================================================

CREATE TABLE STATION (
    station_id            VARCHAR2(50) PRIMARY KEY,
    station_name          VARCHAR2(100) NOT NULL UNIQUE,
    station_code          VARCHAR2(20) UNIQUE,
    city                  VARCHAR2(50),
    total_platform_number NUMBER DEFAULT 1 CHECK (total_platform_number > 0)
);

CREATE TABLE PLATFORM (
    platform_id VARCHAR2(50) PRIMARY KEY,
    station_id  VARCHAR2(50) NOT NULL,
    platform_no VARCHAR2(20) NOT NULL,
    gauge_type  VARCHAR2(30) CHECK (gauge_type IN
                ('BROAD_GAUGE','METER_GAUGE','DUAL_GAUGE')),
    status      VARCHAR2(30) DEFAULT 'AVAILABLE'
                CHECK (status IN ('AVAILABLE','OCCUPIED','MAINTENANCE')),

    CONSTRAINT uq_platform_station_no UNIQUE (station_id, platform_no),
    CONSTRAINT fk_platform_station FOREIGN KEY (station_id)
        REFERENCES STATION(station_id) ON DELETE CASCADE
);

-- ============================================================
-- 2. ROUTE
-- ============================================================

CREATE TABLE ROUTE (
    route_id       VARCHAR2(50) PRIMARY KEY,
    route_name     VARCHAR2(150),
    source_station VARCHAR2(100) NOT NULL,
    destination    VARCHAR2(100) NOT NULL,
    distance       NUMBER(8,2) NOT NULL CHECK (distance > 0),
    status         VARCHAR2(30) DEFAULT 'ACTIVE'
                   CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE ROUTE_STATION (
    route_id         VARCHAR2(50) NOT NULL,
    station_id       VARCHAR2(50) NOT NULL,
    stop_order       NUMBER NOT NULL CHECK (stop_order > 0),
    stoppage_minutes NUMBER DEFAULT 0 CHECK (stoppage_minutes >= 0),

    CONSTRAINT pk_route_station PRIMARY KEY (route_id, station_id),
    CONSTRAINT uq_route_stop_order UNIQUE (route_id, stop_order),
    CONSTRAINT fk_rs_route FOREIGN KEY (route_id)
        REFERENCES ROUTE(route_id) ON DELETE CASCADE,
    CONSTRAINT fk_rs_station FOREIGN KEY (station_id)
        REFERENCES STATION(station_id) ON DELETE CASCADE
);

-- ============================================================
-- 3. TRAIN (permanent info only — no source/destination/fare)
-- ============================================================

CREATE TABLE TRAIN (
    train_id          VARCHAR2(50) PRIMARY KEY,
    train_name        VARCHAR2(100) NOT NULL,
    train_category    VARCHAR2(30) CHECK (train_category IN
                       ('INTERCITY','SUPER FAST','EXPRESS','MAIL')),
    travel_duration   VARCHAR2(30),
    off_day           VARCHAR2(20),
    operational_status VARCHAR2(30) DEFAULT 'OPERATIONAL'
                       CHECK (operational_status IN
                       ('OPERATIONAL','DELAYED','RESCHEDULED','MAINTENANCE','CANCELLED'))
);

ALTER TABLE TRAIN_MANAGER
ADD CONSTRAINT fk_tm_assigned_train
FOREIGN KEY (assigned_train_id) REFERENCES TRAIN(train_id) ON DELETE SET NULL;

-- ============================================================
-- 4. PASSENGER
-- ============================================================

CREATE TABLE PASSENGER (
    user_id        VARCHAR2(50) PRIMARY KEY,
    passenger_type VARCHAR2(30) DEFAULT 'GENERAL'
                   CHECK (passenger_type IN ('GENERAL','STUDENT','SENIOR','CHILD')),

    CONSTRAINT fk_passenger_user FOREIGN KEY (user_id)
        REFERENCES APP_USER(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 5. COACH / SEAT
-- ============================================================

CREATE TABLE COACH (
    coach_id   VARCHAR2(50) PRIMARY KEY,
    train_id   VARCHAR2(50) NOT NULL,
    coach_name VARCHAR2(20) NOT NULL,
    coach_type VARCHAR2(30) NOT NULL CHECK (coach_type IN
               ('AC_SUITE','AC_BERTH','AC_CHAIR','SNIGDHA','SHOVON',
                'SHOVON_CHAIR','SLEEPER')),
    capacity   NUMBER DEFAULT 60 CHECK (capacity > 0),
    status     VARCHAR2(30) DEFAULT 'ACTIVE'
               CHECK (status IN ('ACTIVE','INACTIVE','MAINTENANCE')),

    CONSTRAINT uq_coach_train_name UNIQUE (train_id, coach_name),
    CONSTRAINT fk_coach_train FOREIGN KEY (train_id)
        REFERENCES TRAIN(train_id) ON DELETE CASCADE
);

CREATE TABLE SEAT (
    seat_id     VARCHAR2(50) PRIMARY KEY,
    coach_id    VARCHAR2(50) NOT NULL,
    seat_number VARCHAR2(20) NOT NULL,
    seat_status VARCHAR2(20) DEFAULT 'AVAILABLE'
                CHECK (seat_status IN ('AVAILABLE','BOOKED','RESERVED')),

    CONSTRAINT uq_seat_coach_number UNIQUE (coach_id, seat_number),
    CONSTRAINT fk_seat_coach FOREIGN KEY (coach_id)
        REFERENCES COACH(coach_id) ON DELETE CASCADE
);

-- ============================================================
-- 6. FARE ENGINE
-- Distance x Rate x Coach Factor x Passenger Factor = Base Fare
-- ============================================================

-- 6a. Coach premium factor (SHOVON = baseline 1.00)
CREATE TABLE COACH_FACTOR (
    coach_type VARCHAR2(30) PRIMARY KEY CHECK (coach_type IN
               ('AC_SUITE','AC_BERTH','AC_CHAIR','SNIGDHA','SHOVON',
                'SHOVON_CHAIR','SLEEPER')),
    factor     NUMBER(4,2) NOT NULL CHECK (factor > 0)
);

INSERT INTO COACH_FACTOR VALUES ('SHOVON',       1.00);
INSERT INTO COACH_FACTOR VALUES ('SHOVON_CHAIR', 1.10);
INSERT INTO COACH_FACTOR VALUES ('SLEEPER',      1.20);
INSERT INTO COACH_FACTOR VALUES ('SNIGDHA',      1.25);
INSERT INTO COACH_FACTOR VALUES ('AC_CHAIR',     1.35);
INSERT INTO COACH_FACTOR VALUES ('AC_BERTH',     1.50);
INSERT INTO COACH_FACTOR VALUES ('AC_SUITE',     1.60);

-- 6b. Passenger discount/premium factor
CREATE TABLE PASSENGER_FACTOR (
    passenger_type VARCHAR2(30) PRIMARY KEY CHECK (passenger_type IN
                   ('GENERAL','STUDENT','SENIOR','CHILD')),
    factor         NUMBER(4,2) NOT NULL CHECK (factor > 0)
);

INSERT INTO PASSENGER_FACTOR VALUES ('GENERAL', 1.00);
INSERT INTO PASSENGER_FACTOR VALUES ('STUDENT', 0.50);
INSERT INTO PASSENGER_FACTOR VALUES ('SENIOR',  0.70);
INSERT INTO PASSENGER_FACTOR VALUES ('CHILD',   0.50);

-- 6c. VAT / service charge config
CREATE TABLE FARE_CONFIG (
    config_id      VARCHAR2(20) PRIMARY KEY,
    vat_rate       NUMBER(4,3) NOT NULL CHECK (vat_rate >= 0),
    service_charge NUMBER(10,2) NOT NULL CHECK (service_charge >= 0)
);

INSERT INTO FARE_CONFIG VALUES ('DEFAULT', 0.05, 20);

-- 6d. Per-route base rate (per km). One row per route.
-- Example: Dhaka -> Chattogram, rate_per_km = 1.50
CREATE TABLE FARE (
    fare_id     VARCHAR2(50) PRIMARY KEY,
    route_id    VARCHAR2(50) NOT NULL UNIQUE,
    rate_per_km NUMBER(10,2) NOT NULL CHECK (rate_per_km > 0),

    CONSTRAINT fk_fare_route FOREIGN KEY (route_id)
        REFERENCES ROUTE(route_id) ON DELETE CASCADE
);

-- ============================================================
-- 7. TRAIN SCHEDULE
-- ============================================================

CREATE TABLE TRAIN_SCHEDULE (
    schedule_id            VARCHAR2(50) PRIMARY KEY,
    train_id               VARCHAR2(50) NOT NULL,
    route_id               VARCHAR2(50) NOT NULL,
    journey_date           DATE NOT NULL,
    origin_station_id      VARCHAR2(50),
    destination_station_id VARCHAR2(50),
    departure_time         VARCHAR2(20),
    arrival_time           VARCHAR2(20),
    delay                  VARCHAR2(30) DEFAULT '0 mins',
    assigned_platform_id   VARCHAR2(50),
    weekly_off_day         VARCHAR2(20),
    status                 VARCHAR2(30) DEFAULT 'OPERATIONAL'
                           CHECK (status IN
                           ('OPERATIONAL','DELAYED','RESCHEDULED','MAINTENANCE','CANCELLED')),

    CONSTRAINT fk_schedule_train FOREIGN KEY (train_id)
        REFERENCES TRAIN(train_id) ON DELETE CASCADE,
    CONSTRAINT fk_schedule_route FOREIGN KEY (route_id)
        REFERENCES ROUTE(route_id),
    CONSTRAINT fk_schedule_origin FOREIGN KEY (origin_station_id)
        REFERENCES STATION(station_id) ON DELETE SET NULL,
    CONSTRAINT fk_schedule_destination FOREIGN KEY (destination_station_id)
        REFERENCES STATION(station_id) ON DELETE SET NULL,
    CONSTRAINT fk_schedule_platform FOREIGN KEY (assigned_platform_id)
        REFERENCES PLATFORM(platform_id) ON DELETE SET NULL
);

-- ============================================================
-- 8. SCHEDULE UPDATE REQUEST
-- ============================================================

CREATE TABLE SCHEDULE_UPDATE_REQUEST (
    request_id       VARCHAR2(50) PRIMARY KEY,
    train_id         VARCHAR2(50) NOT NULL,
    schedule_id      VARCHAR2(50),
    requested_by     VARCHAR2(50) NOT NULL,
    requested_change VARCHAR2(1000) NOT NULL,
    reason           VARCHAR2(1000),
    request_date     DATE DEFAULT SYSDATE NOT NULL,
    status           VARCHAR2(30) DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
    reviewed_by      VARCHAR2(50),
    review_date      DATE,
    review_comment   VARCHAR2(500),

    CONSTRAINT fk_srq_train FOREIGN KEY (train_id)
        REFERENCES TRAIN(train_id) ON DELETE CASCADE,
    CONSTRAINT fk_srq_schedule FOREIGN KEY (schedule_id)
        REFERENCES TRAIN_SCHEDULE(schedule_id) ON DELETE SET NULL,
    CONSTRAINT fk_srq_requested_by FOREIGN KEY (requested_by)
        REFERENCES TRAIN_MANAGER(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_srq_reviewed_by FOREIGN KEY (reviewed_by)
        REFERENCES STATION_MASTER(user_id) ON DELETE SET NULL
);

-- ============================================================
-- 9. BOOKING
-- ============================================================

CREATE TABLE BOOKING (
    booking_id      VARCHAR2(50) PRIMARY KEY,
    user_id         VARCHAR2(50) NOT NULL,
    train_id        VARCHAR2(50) NOT NULL,
    schedule_id     VARCHAR2(50) NOT NULL,
    coach_id        VARCHAR2(50),
    seat_id         VARCHAR2(50),
    booking_date    DATE DEFAULT SYSDATE NOT NULL,
    booking_time    VARCHAR2(30),
    status          VARCHAR2(30) DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','CONFIRMED','CANCELLED')),
    number_and_seat VARCHAR2(50),
    base_fare       NUMBER(10,2),
    vat             NUMBER(10,2),
    service_charge  NUMBER(10,2),
    amount          NUMBER(10,2) NOT NULL CHECK (amount >= 0),

    CONSTRAINT fk_booking_passenger FOREIGN KEY (user_id)
        REFERENCES PASSENGER(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_train FOREIGN KEY (train_id)
        REFERENCES TRAIN(train_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_schedule FOREIGN KEY (schedule_id)
        REFERENCES TRAIN_SCHEDULE(schedule_id),
    CONSTRAINT fk_booking_coach FOREIGN KEY (coach_id)
        REFERENCES COACH(coach_id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_seat FOREIGN KEY (seat_id)
        REFERENCES SEAT(seat_id) ON DELETE SET NULL
);

-- ============================================================
-- 10. PAYMENT
-- ============================================================

CREATE TABLE PAYMENT (
    payment_id   VARCHAR2(50) PRIMARY KEY,
    booking_id   VARCHAR2(50) NOT NULL,
    payment_date DATE DEFAULT SYSDATE NOT NULL,
    payment_time VARCHAR2(30),
    amount       NUMBER(10,2) NOT NULL CHECK (amount >= 0),
    method       VARCHAR2(50) CHECK (method IN
                 ('BKASH','NAGAD','CREDIT_CARD','CASH','MOBILE_BANKING')),
    receipt      VARCHAR2(100),
    status       VARCHAR2(30) DEFAULT 'COMPLETED'
                 CHECK (status IN ('PENDING','COMPLETED','FAILED')),

    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id)
        REFERENCES BOOKING(booking_id) ON DELETE CASCADE
);

-- ============================================================
-- 11. TICKET
-- ============================================================

CREATE TABLE TICKET (
    ticket_id         VARCHAR2(50) PRIMARY KEY,
    payment_id        VARCHAR2(50) NOT NULL,
    booking_id        VARCHAR2(50) NOT NULL,
    schedule_id       VARCHAR2(50),
    ticket_manager_id VARCHAR2(50),
    seat_number       VARCHAR2(20) NOT NULL,
    coach_no          VARCHAR2(20) NOT NULL,
    seat_type         VARCHAR2(30),
    status            VARCHAR2(30) DEFAULT 'CONFIRMED'
                      CHECK (status IN ('CONFIRMED','USED','CANCELLED')),

    CONSTRAINT fk_ticket_payment FOREIGN KEY (payment_id)
        REFERENCES PAYMENT(payment_id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_booking FOREIGN KEY (booking_id)
        REFERENCES BOOKING(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_schedule FOREIGN KEY (schedule_id)
        REFERENCES TRAIN_SCHEDULE(schedule_id) ON DELETE SET NULL,
    CONSTRAINT fk_ticket_manager FOREIGN KEY (ticket_manager_id)
        REFERENCES TICKET_MANAGER(user_id) ON DELETE SET NULL
);

-- ============================================================
-- 12. CANCELLATION
-- ============================================================

CREATE TABLE CANCELLATION (
    cancellation_id   VARCHAR2(50) PRIMARY KEY,
    ticket_id         VARCHAR2(50) NOT NULL UNIQUE,
    status            VARCHAR2(30) DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    reason            VARCHAR2(255),
    cancellation_time VARCHAR2(30),
    cancellation_date DATE DEFAULT SYSDATE NOT NULL,

    CONSTRAINT fk_cancellation_ticket FOREIGN KEY (ticket_id)
        REFERENCES TICKET(ticket_id) ON DELETE CASCADE
);

-- ============================================================
-- 13. MANAGE_TICKET
-- ============================================================

CREATE TABLE MANAGE_TICKET (
    manage_id         VARCHAR2(50) PRIMARY KEY,
    ticket_manager_id VARCHAR2(50) NOT NULL,
    ticket_id         VARCHAR2(50) NOT NULL,
    action_type       VARCHAR2(50) DEFAULT 'ISSUE'
                      CHECK (action_type IN ('ISSUE','VERIFY','CANCEL','UPDATE','REISSUE')),
    action_date       DATE DEFAULT SYSDATE NOT NULL,

    CONSTRAINT fk_mt_ticket_mgr FOREIGN KEY (ticket_manager_id)
        REFERENCES TICKET_MANAGER(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_mt_ticket FOREIGN KEY (ticket_id)
        REFERENCES TICKET(ticket_id) ON DELETE CASCADE
);

-- ============================================================
-- 14. MAY_HAVE
-- ============================================================

CREATE TABLE MAY_HAVE (
    manage_id       VARCHAR2(50) PRIMARY KEY,
    cancellation_id VARCHAR2(50) NOT NULL UNIQUE,

    CONSTRAINT fk_mayhave_manage FOREIGN KEY (manage_id)
        REFERENCES MANAGE_TICKET(manage_id) ON DELETE CASCADE,
    CONSTRAINT fk_mayhave_cancellation FOREIGN KEY (cancellation_id)
        REFERENCES CANCELLATION(cancellation_id) ON DELETE CASCADE
);

-- ============================================================
-- 15. REFUND
-- ============================================================

CREATE TABLE REFUND (
    refund_id       VARCHAR2(50) PRIMARY KEY,
    cancellation_id VARCHAR2(50) NOT NULL UNIQUE,
    status          VARCHAR2(30) DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','PROCESSED','FAILED')),
    amount          NUMBER(10,2) NOT NULL CHECK (amount >= 0),
    refund_date     DATE,

    CONSTRAINT fk_refund_cancellation FOREIGN KEY (cancellation_id)
        REFERENCES CANCELLATION(cancellation_id) ON DELETE CASCADE
);

-- ============================================================
-- 16. COMPLAINT
-- ============================================================

CREATE TABLE COMPLAINT (
    complaint_id       VARCHAR2(50) PRIMARY KEY,
    user_id            VARCHAR2(50) NOT NULL,
    admin_id           VARCHAR2(50),
    status             VARCHAR2(30) DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING','IN_PROGRESS','RESOLVED','REJECTED')),
    description        VARCHAR2(500) NOT NULL,
    complaint_date     DATE DEFAULT SYSDATE NOT NULL,
    resolution_comment VARCHAR2(500),

    CONSTRAINT fk_complaint_passenger FOREIGN KEY (user_id)
        REFERENCES PASSENGER(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_admin FOREIGN KEY (admin_id)
        REFERENCES APP_USER(user_id) ON DELETE SET NULL
);

-- ============================================================
-- 17. LOST ITEM
-- ============================================================

CREATE TABLE LOST_ITEM (
    lost_id           VARCHAR2(50) PRIMARY KEY,
    station_master_id VARCHAR2(50) NOT NULL,
    item_name         VARCHAR2(100) NOT NULL,
    train_id          VARCHAR2(50),
    coach_no          VARCHAR2(20),
    seat_number       VARCHAR2(20),
    location_detail   VARCHAR2(200),
    status            VARCHAR2(30) DEFAULT 'UNCLAIMED'
                      CHECK (status IN ('UNCLAIMED','CLAIMED','DISPOSED')),
    found_date        DATE DEFAULT SYSDATE NOT NULL,
    description       VARCHAR2(500),

    CONSTRAINT fk_item_station_master FOREIGN KEY (station_master_id)
        REFERENCES STATION_MASTER(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_lost_item_train FOREIGN KEY (train_id)
        REFERENCES TRAIN(train_id) ON DELETE SET NULL
);

-- ============================================================
-- 18. TRAIN STATUS / OPERATION LOG
-- ============================================================

CREATE TABLE TRAIN_STATUS_LOG (
    status_log_id      VARCHAR2(50) PRIMARY KEY,
    train_id           VARCHAR2(50) NOT NULL,
    updated_by         VARCHAR2(50) NOT NULL,
    operational_status VARCHAR2(30) NOT NULL CHECK (operational_status IN
                       ('READY','BOARDING','IN_TRANSIT','ARRIVED',
                        'DELAYED','MAINTENANCE','OPERATIONAL')),
    delay_minutes      NUMBER DEFAULT 0 CHECK (delay_minutes >= 0),
    cause              VARCHAR2(200),
    status_date        DATE DEFAULT SYSDATE NOT NULL,

    CONSTRAINT fk_tsl_train FOREIGN KEY (train_id)
        REFERENCES TRAIN(train_id) ON DELETE CASCADE,
    CONSTRAINT fk_tsl_employee FOREIGN KEY (updated_by)
        REFERENCES EMPLOYEE(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 19. EMERGENCY / INCIDENT REPORT
-- ============================================================

CREATE TABLE EMERGENCY_REPORT (
    emergency_report_id VARCHAR2(50) PRIMARY KEY,
    train_id            VARCHAR2(50),
    reported_by         VARCHAR2(50) NOT NULL,
    incident_type       VARCHAR2(50) NOT NULL,
    description         VARCHAR2(500),
    priority            VARCHAR2(30) DEFAULT 'HIGH'
                        CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    report_time         DATE DEFAULT SYSDATE NOT NULL,
    status              VARCHAR2(30) DEFAULT 'OPEN'
                        CHECK (status IN ('OPEN','ACKNOWLEDGED','RESOLVED','CLOSED')),

    CONSTRAINT fk_er_train FOREIGN KEY (train_id)
        REFERENCES TRAIN(train_id) ON DELETE SET NULL,
    CONSTRAINT fk_er_employee FOREIGN KEY (reported_by)
        REFERENCES EMPLOYEE(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 20. NOTIFICATION
-- ============================================================

CREATE TABLE NOTIFICATION (
    notification_id    VARCHAR2(50) PRIMARY KEY,
    user_id            VARCHAR2(50),
    train_id           VARCHAR2(50),
    title              VARCHAR2(150) NOT NULL,
    message            VARCHAR2(500) NOT NULL,
    notification_type  VARCHAR2(50),
    created_at         DATE DEFAULT SYSDATE NOT NULL,
    is_read            CHAR(1) DEFAULT 'N' CHECK (is_read IN ('Y','N')),

    CONSTRAINT fk_notification_user FOREIGN KEY (user_id)
        REFERENCES APP_USER(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_train FOREIGN KEY (train_id)
        REFERENCES TRAIN(train_id) ON DELETE CASCADE
);


CREATE TABLE MAINTENANCE (
    maintenance_id   VARCHAR2(30)  PRIMARY KEY,
    train_id         VARCHAR2(30)  NOT NULL,
    category         VARCHAR2(100),
    target           VARCHAR2(200),
    severity         VARCHAR2(20),
    status           VARCHAR2(30)  DEFAULT 'Reported',
    logged_date      DATE          DEFAULT SYSDATE,
    reported_by      VARCHAR2(30),
 
    CONSTRAINT fk_maintenance_train
        FOREIGN KEY (train_id) REFERENCES TRAIN(train_id),
 
    CONSTRAINT fk_maintenance_reporter
        FOREIGN KEY (reported_by) REFERENCES EMPLOYEE(user_id),
 
    CONSTRAINT chk_maintenance_severity
        CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
 
    CONSTRAINT chk_maintenance_status
        CHECK (status IN ('Reported', 'Scheduled', 'In Progress',
                           'Under Repair', 'Resolved'))
);

-- ============================================================
-- 22. FARE CALCULATION FUNCTION
-- Base Fare = Distance x Rate/km x Coach Factor x Passenger Factor
-- Example: 320 x 1.50 x 1.35 (AC_CHAIR) x 1.00 (GENERAL) = 648 -> 650
-- ============================================================

CREATE OR REPLACE FUNCTION CALCULATE_FARE (
    p_route_id       IN VARCHAR2,
    p_coach_type     IN VARCHAR2,
    p_passenger_type IN VARCHAR2
)
RETURN NUMBER
IS
    v_distance    NUMBER(8,2);
    v_rate        NUMBER(10,2);
    v_coach_fac   NUMBER(4,2);
    v_pax_fac     NUMBER(4,2);
    v_base_fare   NUMBER(10,2);
BEGIN
    SELECT distance INTO v_distance
    FROM ROUTE WHERE route_id = p_route_id;

    SELECT rate_per_km INTO v_rate
    FROM FARE WHERE route_id = p_route_id;

    SELECT factor INTO v_coach_fac
    FROM COACH_FACTOR WHERE coach_type = p_coach_type;

    SELECT factor INTO v_pax_fac
    FROM PASSENGER_FACTOR WHERE passenger_type = p_passenger_type;

    v_base_fare := ROUND(v_distance * v_rate * v_coach_fac * v_pax_fac, -1);

    RETURN v_base_fare;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
END;
/

-- ============================================================
-- 23. BOOKING FARE TRIGGER
-- Auto-fills base_fare, vat, service_charge, and final amount
-- ============================================================

CREATE OR REPLACE TRIGGER TRG_BOOKING_CALCULATE_FARE
BEFORE INSERT OR UPDATE OF schedule_id, coach_id, user_id
ON BOOKING
FOR EACH ROW
DECLARE
    v_route_id       VARCHAR2(50);
    v_coach_type     VARCHAR2(30);
    v_passenger_type VARCHAR2(30);
    v_base_fare      NUMBER(10,2);
    v_vat_rate       NUMBER(4,3);
    v_service_charge NUMBER(10,2);
BEGIN
    SELECT route_id INTO v_route_id
    FROM TRAIN_SCHEDULE WHERE schedule_id = :NEW.schedule_id;

    SELECT passenger_type INTO v_passenger_type
    FROM PASSENGER WHERE user_id = :NEW.user_id;

    SELECT vat_rate, service_charge
    INTO v_vat_rate, v_service_charge
    FROM FARE_CONFIG WHERE config_id = 'DEFAULT';

    IF :NEW.coach_id IS NOT NULL THEN
        SELECT coach_type INTO v_coach_type
        FROM COACH WHERE coach_id = :NEW.coach_id;

        v_base_fare := CALCULATE_FARE(v_route_id, v_coach_type, v_passenger_type);

        :NEW.base_fare      := v_base_fare;
        :NEW.vat            := ROUND(v_base_fare * v_vat_rate, 2);
        :NEW.service_charge := v_service_charge;
        :NEW.amount         := ROUND(v_base_fare + (v_base_fare * v_vat_rate) + v_service_charge);
    END IF;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        NULL;
END;
/

-- ============================================================
-- 24. PAYMENT AMOUNT VALIDATION
-- ============================================================

CREATE OR REPLACE TRIGGER TRG_PAYMENT_AMOUNT_CHECK
BEFORE INSERT OR UPDATE OF amount, booking_id
ON PAYMENT
FOR EACH ROW
DECLARE
    v_booking_amount NUMBER(10,2);
BEGIN
    SELECT amount INTO v_booking_amount
    FROM BOOKING WHERE booking_id = :NEW.booking_id;

    IF :NEW.amount > v_booking_amount THEN
        RAISE_APPLICATION_ERROR(-20001, 'Payment amount cannot exceed booking amount.');
    END IF;
END;
/

-- ============================================================
-- 25. TICKET MANAGER ACTION -> TICKET STATUS
-- ============================================================

CREATE OR REPLACE TRIGGER TRG_MANAGE_TICKET_ACTION
BEFORE INSERT ON MANAGE_TICKET
FOR EACH ROW
BEGIN
    IF :NEW.action_type = 'CANCEL' THEN
        UPDATE TICKET SET status = 'CANCELLED' WHERE ticket_id = :NEW.ticket_id;
    END IF;
END;
/

-- ============================================================
-- 26. CANCELLATION -> TICKET STATUS
-- ============================================================



-- ============================================================
-- 27. REFUND AMOUNT DEFAULT FROM BOOKING
-- ============================================================



-- ============================================================
-- 28. VIEWS FOR UI
-- ============================================================

CREATE OR REPLACE VIEW V_TICKET_MANAGER_INDEX AS
SELECT t.ticket_id, b.booking_id,
       u.first_name || ' ' || u.last_name AS passenger_name,
       tr.train_name, t.coach_no, t.seat_number, t.seat_type,
       t.status AS ticket_status, b.status AS booking_status, b.amount
FROM TICKET t
JOIN BOOKING b ON b.booking_id = t.booking_id
JOIN PASSENGER p ON p.user_id = b.user_id
JOIN APP_USER u ON u.user_id = p.user_id
JOIN TRAIN tr ON tr.train_id = b.train_id;

CREATE OR REPLACE VIEW V_BOOKING_MASTER AS
SELECT b.booking_id,
       u.first_name || ' ' || u.last_name AS passenger_name,
       tr.train_name, c.coach_name, b.number_and_seat,
       b.base_fare, b.vat, b.service_charge, b.amount AS grand_total,
       b.status AS booking_status, b.booking_date
FROM BOOKING b
JOIN PASSENGER p ON p.user_id = b.user_id
JOIN APP_USER u ON u.user_id = p.user_id
JOIN TRAIN tr ON tr.train_id = b.train_id
LEFT JOIN COACH c ON c.coach_id = b.coach_id;

CREATE OR REPLACE VIEW V_CANCELLATION_MASTER AS
SELECT c.cancellation_id, c.ticket_id, tr.train_name, c.reason,
       c.status, b.amount, c.cancellation_date
FROM CANCELLATION c
JOIN TICKET t ON t.ticket_id = c.ticket_id
JOIN BOOKING b ON b.booking_id = t.booking_id
JOIN TRAIN tr ON tr.train_id = b.train_id;

CREATE OR REPLACE VIEW V_TRAIN_SCHEDULE_MASTER AS
SELECT s.schedule_id, tr.train_name, tr.train_id, s.journey_date,
       s.departure_time, s.arrival_time,
       os.station_name AS origin_station, ds.station_name AS destination_station,
       p.platform_no AS assigned_platform, s.status
FROM TRAIN_SCHEDULE s
JOIN TRAIN tr ON tr.train_id = s.train_id
LEFT JOIN STATION os ON os.station_id = s.origin_station_id
LEFT JOIN STATION ds ON ds.station_id = s.destination_station_id
LEFT JOIN PLATFORM p ON p.platform_id = s.assigned_platform_id;

CREATE OR REPLACE VIEW V_TRAIN_COACH_DIRECTORY AS
SELECT c.coach_id, c.train_id, tr.train_name, c.coach_name,
       c.coach_type, c.capacity, c.status
FROM COACH c
JOIN TRAIN tr ON tr.train_id = c.train_id;

CREATE OR REPLACE VIEW V_TRAIN_FLEET_DIRECTORY AS
SELECT tr.train_id, tr.train_name, tr.train_category,
       r.source_station, r.destination, tr.operational_status
FROM TRAIN tr
LEFT JOIN TRAIN_SCHEDULE ts ON ts.train_id = tr.train_id
LEFT JOIN ROUTE r ON r.route_id = ts.route_id;

-- Admin's Fare Directory: shows the calculated fare for every
-- route x coach-type combination, exactly like your example table.
CREATE OR REPLACE VIEW V_FARE_DIRECTORY AS
SELECT r.route_id, r.route_name, r.source_station, r.destination,
       r.distance, f.rate_per_km, cf.coach_type, cf.factor AS coach_factor,
       ROUND(r.distance * f.rate_per_km * cf.factor, -1) AS estimated_base_fare
FROM FARE f
JOIN ROUTE r ON r.route_id = f.route_id
CROSS JOIN COACH_FACTOR cf
ORDER BY r.route_name, cf.factor;

-- Amar--

-- 6. Schedule Update Request ID
CREATE SEQUENCE SCHEDULE_REQUEST_SEQ
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_SCHEDULE_REQUEST_ID
BEFORE INSERT ON SCHEDULE_UPDATE_REQUEST
FOR EACH ROW
BEGIN
    IF :NEW.REQUEST_ID IS NULL THEN
        :NEW.REQUEST_ID :=
            'REQ' || LPAD(SCHEDULE_REQUEST_SEQ.NEXTVAL, 3, '0');
    END IF;
END;
/



CREATE OR REPLACE TRIGGER TRG_CANCELLATION_STATUS
AFTER INSERT OR UPDATE OF STATUS ON CANCELLATION
FOR EACH ROW
DECLARE
    v_booking_id BOOKING.BOOKING_ID%TYPE;
    v_user_id    BOOKING.USER_ID%TYPE;
    v_train_id   BOOKING.TRAIN_ID%TYPE;
    v_base_fare  BOOKING.BASE_FARE%TYPE;
BEGIN

    IF :NEW.STATUS IN ('APPROVED', 'REJECTED')
       AND NVL(:OLD.STATUS, 'X') <> :NEW.STATUS
    THEN

        /* Find the passenger's booking and base fare */
        SELECT
            b.booking_id,
            b.user_id,
            b.train_id,
            b.base_fare
        INTO
            v_booking_id,
            v_user_id,
            v_train_id,
            v_base_fare
        FROM TICKET t
        JOIN BOOKING b
          ON b.booking_id = t.booking_id
        WHERE t.ticket_id = :NEW.ticket_id;


        /* APPROVED */
        IF :NEW.STATUS = 'APPROVED' THEN

            /* Cancel ticket */
            UPDATE TICKET
            SET STATUS = 'CANCELLED'
            WHERE TICKET_ID = :NEW.TICKET_ID;


            /* Cancel booking */
            UPDATE BOOKING
            SET STATUS = 'CANCELLED'
            WHERE BOOKING_ID = v_booking_id;


            /* Create refund */
            INSERT INTO REFUND (
                REFUND_ID,
                CANCELLATION_ID,
                STATUS,
                AMOUNT,
                REFUND_DATE
            )
            VALUES (
                'REF' || LPAD(REFUND_SEQ.NEXTVAL, 5, '0'),
                :NEW.CANCELLATION_ID,
                'PENDING',
                v_base_fare,
                SYSDATE
            );


            /* Notify passenger */
            INSERT INTO NOTIFICATION (
                NOTIFICATION_ID,
                USER_ID,
                TRAIN_ID,
                TITLE,
                MESSAGE,
                NOTIFICATION_TYPE,
                CREATED_AT,
                IS_READ
            )
            VALUES (
                'NOT-' || LPAD(NOTIFICATION_SEQ.NEXTVAL, 5, '0'),
                v_user_id,
                v_train_id,
                'Cancellation Approved',
                'Your cancellation request for ticket '
                || :NEW.TICKET_ID
                || ' has been approved. Your refund is pending.',
                'CANCELLATION',
                SYSDATE,
                'N'
            );

        END IF;


        /* REJECTED */
        IF :NEW.STATUS = 'REJECTED' THEN

            /* Ticket and booking remain CONFIRMED */

            /* Notify passenger */
            INSERT INTO NOTIFICATION (
                NOTIFICATION_ID,
                USER_ID,
                TRAIN_ID,
                TITLE,
                MESSAGE,
                NOTIFICATION_TYPE,
                CREATED_AT,
                IS_READ
            )
            VALUES (
                'NOT-' || LPAD(NOTIFICATION_SEQ.NEXTVAL, 5, '0'),
                v_user_id,
                v_train_id,
                'Cancellation Rejected',
                'Your cancellation request for ticket '
                || :NEW.TICKET_ID
                || ' has been rejected.',
                'CANCELLATION',
                SYSDATE,
                'N'
            );

        END IF;

    END IF;

END;
/









WITH schedule_data AS (
    SELECT
        ts.schedule_id,
        ts.train_id,
        t.train_name,
        t.train_category,
        ts.journey_date,
        os.station_name AS origin_station_name,
        ds.station_name AS destination_station_name,
        ts.departure_time,
        ts.arrival_time,
        ts.status
    FROM TRAIN_SCHEDULE ts
    JOIN TRAIN t
        ON t.train_id = ts.train_id
    LEFT JOIN STATION os
        ON os.station_id = ts.origin_station_id
    LEFT JOIN STATION ds
        ON ds.station_id = ts.destination_station_id
)
SELECT
    schedule_id,
    train_id,
    train_name,
    train_category,
    journey_date,
    origin_station_name,
    destination_station_name,
    departure_time,
    arrival_time,
    status
FROM schedule_data
WHERE LOWER(origin_station_name) LIKE LOWER('%' || :source || '%')
  AND LOWER(destination_station_name) LIKE LOWER('%' || :destination || '%')
  AND TRUNC(journey_date) = TO_DATE(:journey_date, 'YYYY-MM-DD')
ORDER BY journey_date, departure_time;




WITH available_seats AS (
    SELECT
        s.seat_id,
        s.seat_number,
        c.coach_id,
        c.coach_name,
        c.coach_type
    FROM SEAT s
    JOIN COACH c
        ON c.coach_id = s.coach_id
    WHERE c.train_id = :train_id
      AND s.seat_status = 'AVAILABLE'
      AND NOT EXISTS (
          SELECT 1
          FROM BOOKING b
          WHERE b.seat_id = s.seat_id
            AND b.schedule_id = :schedule_id
            AND b.status = 'CONFIRMED'
      )
)
SELECT
    coach_name,
    coach_type,
    COUNT(*) AS available_seats
FROM available_seats
GROUP BY
    coach_name,
    coach_type
ORDER BY coach_name;




















-- joy--

-- 1. Complaint ID
CREATE SEQUENCE COMPLAINT_SEQ
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_COMPLAINT_ID
BEFORE INSERT ON COMPLAINT
FOR EACH ROW
BEGIN
    IF :NEW.COMPLAINT_ID IS NULL THEN
        :NEW.COMPLAINT_ID :=
            'CMP' || LPAD(COMPLAINT_SEQ.NEXTVAL, 3, '0');
    END IF;
END;
/


-- 2. Lost Item ID
CREATE SEQUENCE LOST_ITEM_SEQ
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;


CREATE OR REPLACE TRIGGER TRG_LOST_ITEM_ID
BEFORE INSERT ON LOST_ITEM
FOR EACH ROW
BEGIN
    IF :NEW.LOST_ID IS NULL THEN
        :NEW.LOST_ID := 'LI' || LPAD(LOST_ITEM_SEQ.NEXTVAL, 3, '0');
    END IF;
END;
/

-- Zidan----

-- 3.
CREATE SEQUENCE PLATFORM_SEQ
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;


CREATE OR REPLACE TRIGGER TRG_PLATFORM_ID
BEFORE INSERT ON PLATFORM
FOR EACH ROW
BEGIN
    IF :NEW.PLATFORM_ID IS NULL THEN
        :NEW.PLATFORM_ID := 'PL' || LPAD(PLATFORM_SEQ.NEXTVAL, 3, '0');
    END IF;
END;
/


CREATE OR REPLACE TRIGGER TRG_PLATFORM_COUNT
AFTER INSERT OR DELETE ON PLATFORM
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        UPDATE STATION
        SET TOTAL_PLATFORM_NUMBER = (
            SELECT COUNT(*)
            FROM PLATFORM
            WHERE STATION_ID = :NEW.STATION_ID
        )
        WHERE STATION_ID = :NEW.STATION_ID;

    ELSIF DELETING THEN
        UPDATE STATION
        SET TOTAL_PLATFORM_NUMBER = (
            SELECT COUNT(*)
            FROM PLATFORM
            WHERE STATION_ID = :OLD.STATION_ID
        )
        WHERE STATION_ID = :OLD.STATION_ID
        AND EXISTS (
            SELECT 1
            FROM PLATFORM
            WHERE STATION_ID = :OLD.STATION_ID
        );
    END IF;
END;
/



-- Ema



CREATE SEQUENCE ROUTE_SEQ
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_ROUTE_ID
BEFORE INSERT ON ROUTE
FOR EACH ROW
BEGIN
    IF :NEW.ROUTE_ID IS NULL THEN
        :NEW.ROUTE_ID := 'R' || LPAD(ROUTE_SEQ.NEXTVAL, 3, '0');
    END IF;
END;
/



CREATE SEQUENCE TRAIN_SCHEDULE_SEQ
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_TRAIN_SCHEDULE_ID
BEFORE INSERT ON TRAIN_SCHEDULE
FOR EACH ROW
BEGIN
    IF :NEW.SCHEDULE_ID IS NULL THEN
        :NEW.SCHEDULE_ID :=
            'SCH' || LPAD(TRAIN_SCHEDULE_SEQ.NEXTVAL, 3, '0');
    END IF;
END;
/












--Sakir


-- 9. Notification ID
CREATE SEQUENCE NOTIFICATION_SEQ
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;



CREATE OR REPLACE TRIGGER TRG_SCHED_NOTIFY
AFTER UPDATE OF
    JOURNEY_DATE,
    ORIGIN_STATION_ID,
    DESTINATION_STATION_ID,
    DEPARTURE_TIME,
    ARRIVAL_TIME,
    DELAY,
    ASSIGNED_PLATFORM_ID,
    WEEKLY_OFF_DAY,
    STATUS
ON TRAIN_SCHEDULE
FOR EACH ROW
DECLARE
    v_notification_id VARCHAR2(50);
BEGIN

    IF
        TO_CHAR(:OLD.JOURNEY_DATE, 'YYYY-MM-DD')
            <> TO_CHAR(:NEW.JOURNEY_DATE, 'YYYY-MM-DD')
        OR :OLD.ORIGIN_STATION_ID
            <> :NEW.ORIGIN_STATION_ID
        OR :OLD.DESTINATION_STATION_ID
            <> :NEW.DESTINATION_STATION_ID
        OR :OLD.DEPARTURE_TIME
            <> :NEW.DEPARTURE_TIME
        OR :OLD.ARRIVAL_TIME
            <> :NEW.ARRIVAL_TIME
        OR :OLD.DELAY
            <> :NEW.DELAY
        OR :OLD.ASSIGNED_PLATFORM_ID
            <> :NEW.ASSIGNED_PLATFORM_ID
        OR :OLD.WEEKLY_OFF_DAY
            <> :NEW.WEEKLY_OFF_DAY
        OR :OLD.STATUS
            <> :NEW.STATUS
    THEN

        FOR passenger IN (
            SELECT DISTINCT
                b.user_id
            FROM BOOKING b
            WHERE b.schedule_id = :NEW.schedule_id
              AND b.status = 'CONFIRMED'
        )
        LOOP

            v_notification_id :=
                'NOT' || LPAD(NOTIFICATION_SEQ.NEXTVAL, 5, '0');

            INSERT INTO NOTIFICATION (
                notification_id,
                user_id,
                train_id,
                title,
                message,
                notification_type,
                created_at,
                is_read
            )
            VALUES (
                v_notification_id,
                passenger.user_id,
                :NEW.train_id,
                'Schedule Updated',
                'The schedule for your booked train has been updated. Please check your journey details.',
                'SCHEDULE',
                SYSDATE,
                'N'
            );

        END LOOP;

    END IF;

END;
/

