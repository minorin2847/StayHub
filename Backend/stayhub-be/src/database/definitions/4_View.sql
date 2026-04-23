CREATE OR REPLACE VIEW vw_guest_directory AS
SELECT 
    g.id,
    g.first_name,
    g.last_name,
    (g.first_name || ' ' || g.last_name) AS full_name,
    g.email,
    g.phone,
    g.id_card_number,
    g.address,
    -- Use DISTINCT to count the parent booking exactly once, regardless of how many rooms it has
    COUNT(DISTINCT b.id) AS total_bookings,
    -- Fetch the absolute latest checkout date across all rooms in all of their bookings
    MAX(br.checkout_date) AS last_stay_date,
    g.created_at
FROM guests g
LEFT JOIN booking b ON g.id = b.guestID
-- Join the booked_room table to access the dates
LEFT JOIN booked_room br ON b.id = br.bookingid
GROUP BY g.id;


CREATE OR REPLACE VIEW vw_booking_details AS
SELECT 
    b.id,
    b.guestID,
    (g.first_name || ' ' || g.last_name) AS guest_full_name,
    b.hotelID,
    b.reserveID,
    (SELECT MIN(checkin_date) FROM booked_room WHERE bookingid = b.id) AS checkin_date,
    (SELECT MAX(checkout_date) FROM booked_room WHERE bookingid = b.id) AS checkout_date,
    (SELECT COUNT(*) FROM booked_room WHERE bookingid = b.id) AS total_rooms,
    (SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'roomid', roomID, 
        'status', room_status, 
        'checkin', checkin_date, 
        'checkout', checkout_date,
        'price', room_price
    )) FROM booked_room WHERE bookingid = b.id) AS rooms,
    b.booking_status, -- Now reading directly from the table!
    -- Calculate total price on the fly
    (SELECT SUM(room_price) FROM booked_room WHERE bookingid = b.id) AS actual_total_price,
    b.created_at,
    (b.reserveID IS NOT NULL) AS has_reserve
FROM booking b
LEFT JOIN guests g ON b.guestID = g.id;