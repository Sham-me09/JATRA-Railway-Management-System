from pathlib import Path

p = Path(r".\frontend\railway-management-system\js\dashboard_db.js")
s = p.read_text(encoding="utf-8")

marker = '''        case "lost-item.html":
'''

new_cases = '''        case "manage-tickets.html":
            return {
                id:
                    row.ticket_id ||
                    row.TICKET_ID ||
                    "N/A",

                ticketId:
                    row.ticket_id ||
                    row.TICKET_ID ||
                    "N/A",

                bookingId:
                    row.booking_id ||
                    row.BOOKING_ID ||
                    "N/A",

                passengerName:
                    row.passenger_name ||
                    row.PASSENGER_NAME ||
                    "N/A",

                trainName:
                    row.train_name ||
                    row.TRAIN_NAME ||
                    "N/A",

                coach:
                    row.coach_no ||
                    row.COACH_NO ||
                    "N/A",

                seatNumber:
                    row.seat_number ||
                    row.SEAT_NUMBER ||
                    "N/A",

                seatType:
                    row.seat_type ||
                    row.SEAT_TYPE ||
                    "N/A",

                bookingStatus:
                    row.booking_status ||
                    row.BOOKING_STATUS ||
                    "N/A",

                ticketStatus:
                    row.ticket_status ||
                    row.TICKET_STATUS ||
                    "N/A",

                grandTotal:
                    row.amount ??
                    row.AMOUNT ??
                    0
            };

        case "manage-cancellations.html":
            return {
                id:
                    row.cancellation_id ||
                    row.CANCELLATION_ID ||
                    "N/A",

                cancellationId:
                    row.cancellation_id ||
                    row.CANCELLATION_ID ||
                    "N/A",

                ticketId:
                    row.ticket_id ||
                    row.TICKET_ID ||
                    "N/A",

                train:
                    row.train_name ||
                    row.TRAIN_NAME ||
                    "N/A",

                trainName:
                    row.train_name ||
                    row.TRAIN_NAME ||
                    "N/A",

                reason:
                    row.reason ||
                    row.REASON ||
                    "N/A",

                refundAmount:
                    row.amount ??
                    row.AMOUNT ??
                    0,

                status:
                    row.status ||
                    row.STATUS ||
                    "N/A",

                cancellationDate:
                    row.cancellation_date ||
                    row.CANCELLATION_DATE ||
                    ""
            };

'''

assert marker in s, "NORMALIZATION MARKER NOT FOUND"

s = s.replace(marker, new_cases + marker, 1)

p.write_text(s, encoding="utf-8")

print("TICKET AND CANCELLATION NORMALIZATION ADDED")
