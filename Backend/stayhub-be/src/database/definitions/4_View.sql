CREATE OR REPLACE VIEW vw_guest_directory AS
SELECT g.id,
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
SELECT b.id,
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
CREATE OR REPLACE VIEW vw_employee_details AS
SELECT e.id,
    e.username,
    e.email,
    e.hotelid,
    e.branchid,
    e.firstname,
    e.lastname,
    e.salary,
    (e.firstName || ' ' || e.lastName) AS full_name,
    COALESCE(
        (
            SELECT jsonb_agg(
                    jsonb_build_object('name', er.role, 'tier', r.tier)
                    ORDER BY r.tier ASC
                )
            FROM employee_roles er
                JOIN roles r ON er.role = r.name
            WHERE er.employeeID = e.id
        ),
        '[]'::jsonb
    ) AS roles
FROM employees e;
CREATE OR REPLACE VIEW vw_branch_details AS
SELECT b.id,
    b.name,
    b.location,
    m.firstName as manager_firstname,
    m.lastName as manager_lastname,
    (m.firstName || ' ' || m.lastName) as manager_full_name,
    m.email as manager_email,
    COALESCE(hc.h_count, 0) as hotel_count
FROM branch b
    LEFT JOIN employees m ON b.managerID = m.id
    LEFT JOIN (
        SELECT branchID,
            COUNT(*)::INT as h_count
        FROM hotels
        GROUP BY branchID
    ) hc ON b.id = hc.branchID;
CREATE OR REPLACE VIEW vw_role_details AS
SELECT r.name,
    r.tier,
    COALESCE(er.usercount, 0) as usercount
FROM roles r
    LEFT JOIN (
        SELECT role,
            COUNT(*)::INT as usercount
        FROM employee_roles
        GROUP BY role
    ) er ON r.name = er.role;
-- ==========================================
-- VIEWS DÀNH CHO KHÁCH SẠN VÀ TIỆN ÍCH (HOTEL, AMENITIES, BEDS)
-- ==========================================
CREATE OR REPLACE VIEW vw_hotel_details AS
SELECT h.id,
    h.name,
    h.classification,
    h.branchid,
    h.location,
    h.description,
    h.contact_email,
    h.contact_phone,
    COALESCE(rc.r_count, 0) as room_count
FROM hotels h
    LEFT JOIN (
        SELECT hotelid,
            COUNT(*)::INT as r_count
        FROM rooms
        GROUP BY hotelid
    ) rc ON h.id = rc.hotelid;
CREATE OR REPLACE VIEW vw_bed_details AS
SELECT r.name AS bed_name,
    COALESCE(b.hotel_count, 0) AS hotel_count
FROM beds r
    LEFT JOIN (
        SELECT hb.bed_name,
            COUNT(hb.hotelID)::INT as hotel_count
        FROM hotel_beds hb
        GROUP BY hb.bed_name
    ) b ON r.name = b.bed_name;
CREATE OR REPLACE VIEW vw_hotel_bed_details AS
SELECT hb.hotelID,
    hb.bed_name,
    COALESCE(room_sums.sum_qty, 0)::INT as total_qty
FROM hotel_beds hb
    LEFT JOIN (
        SELECT r.hotelID,
            rb.bed_name,
            SUM(rb.bed_count) as sum_qty
        FROM room_type_beds rb
            JOIN roomTypes r ON rb.room_typeID = r.id
        GROUP BY r.hotelID,
            rb.bed_name
    ) room_sums ON hb.bed_name = room_sums.bed_name
    AND hb.hotelID = room_sums.hotelID;
CREATE OR REPLACE VIEW vw_amenity_details AS
SELECT a.name,
    a.icon,
    a.category,
    COALESCE(h.hotel_count, 0) AS hotel_count
FROM amenities a
    LEFT JOIN (
        SELECT ha.amenity_name,
            COUNT(ha.hotelID)::INT as hotel_count
        FROM hotel_amenities ha
        GROUP BY ha.amenity_name
    ) h ON a.name = h.amenity_name;
CREATE OR REPLACE VIEW vw_hotel_amenity_details AS
SELECT ha.hotelID,
    a.name,
    a.icon,
    a.category
FROM hotel_amenities ha
    JOIN amenities a ON ha.amenity_name = a.name;
-- ==========================================
-- VIEWS DÀNH CHO PHÒNG & LOẠI PHÒNG (ROOM TYPES, ROOMS)
-- ==========================================
CREATE OR REPLACE VIEW vw_room_type_details AS
SELECT rt.id,
    rt.hotelID,
    rt.name,
    rt.size,
    rt.capacity,
    rt.base_price,
    rt.description,
    COALESCE(b_info.total_beds, 0)::BIGINT as total_beds,
    COALESCE(a_info.amenities_json, '[]'::jsonb) as amenities,
    COALESCE(b_info.beds_json, '[]'::jsonb) as beds,
    COALESCE(a_info.names_arr, '{}'::text []) as names_arr
FROM roomTypes rt
    LEFT JOIN (
        SELECT room_typeID,
            SUM(bed_count) as total_beds,
            jsonb_agg(
                jsonb_build_object('name', bed_name, 'count', bed_count)
            ) as beds_json
        FROM room_type_beds
        GROUP BY room_typeID
    ) b_info ON rt.id = b_info.room_typeID
    LEFT JOIN (
        SELECT rta.room_typeID,
            jsonb_agg(
                jsonb_build_object(
                    'name',
                    am.name,
                    'icon',
                    am.icon,
                    'category',
                    am.category
                )
            ) as amenities_json,
            array_agg(am.name) as names_arr
        FROM room_type_amenities rta
            JOIN amenities am ON rta.amenity_name = am.name
        GROUP BY rta.room_typeID
    ) a_info ON rt.id = a_info.room_typeID;


CREATE OR REPLACE VIEW vw_reserve_details AS
SELECT 
    r.id,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_full_name,
    r.guestID,
    r.userID,
    r.status AS overall_status,
    r.created_at,
    COUNT(rr.id) AS total_rooms,
    COALESCE(SUM(rr.final_price), 0) AS total_price,
    -- Concatenate confirmation codes so we can perform text searches against them
    string_agg(rr.confirmation_code, ' ') AS confirmation_codes, 
    -- Bundle all room data into a JSON array
    jsonb_agg(
        jsonb_build_object(
            'id', rr.id,
            'roomID', rr.roomID,
            'hotelID', rr.hotelID,
            'confirmation_code', rr.confirmation_code,
            'booking_status', rr.booking_status,
            'payment_status', rr.payment_status,
            'checkin_date', rr.checkin_date,
            'checkout_date', rr.checkout_date,
            'final_price', rr.final_price
        )
    ) AS rooms
FROM reserves r
LEFT JOIN guests g ON r.guestID = g.id 
LEFT JOIN reserved_room rr ON r.id = rr.reserveID
GROUP BY 
    r.id, g.first_name, g.last_name, r.guestID, r.userID, r.status, r.created_at;