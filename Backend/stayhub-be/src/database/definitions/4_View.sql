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
    COUNT(b.id) AS total_bookings,
    MAX(b.checkin_date) AS last_stay_date,
    g.created_at
FROM guests g
LEFT JOIN booking b ON g.id = b.guestID
GROUP BY g.id;