CREATE OR REPLACE PROCEDURE process_online_checkout(p_reserve_id INT)
LANGUAGE plpgsql AS $$
DECLARE
    v_reserve_record RECORD;
    v_hotel_id INT;
    v_booking_id INT;
    v_room RECORD;
BEGIN
    -- Validate that the cart exists and is waiting for staff approval
    SELECT * INTO v_reserve_record 
    FROM reserves 
    WHERE id = p_reserve_id AND status = 'Awaiting Confirmation';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserve ID % is not awaiting confirmation.', p_reserve_id;
    END IF;

    FOR v_hotel_id IN 
        SELECT DISTINCT hotelID FROM reserved_room 
        WHERE reserveID = p_reserve_id AND booking_status = 'Awaiting Confirmation'
    LOOP
        INSERT INTO booking (guestID, hotelID, reserveID, booking_status)
        VALUES (v_reserve_record.guestID, v_hotel_id, p_reserve_id, 'Confirmed')
        RETURNING id INTO v_booking_id;

        FOR v_room IN 
            SELECT * FROM reserved_room 
            WHERE reserveID = p_reserve_id AND hotelID = v_hotel_id AND booking_status = 'Awaiting Confirmation'
        LOOP
            INSERT INTO booked_room (
                bookingID, roomID, checkin_date, checkout_date, room_status, room_price
            ) VALUES (
                v_booking_id, v_room.roomID, v_room.checkin_date, v_room.checkout_date, 'Reserved', v_room.final_price
            );

            UPDATE reserved_room 
            SET booking_status = 'Confirmed', payment_status = 'Paid', updated_at = now()
            WHERE id = v_room.id;
        END LOOP;
    END LOOP;
END;
$$;

CREATE OR REPLACE PROCEDURE cancel_online_reserve(p_reserve_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    -- 1. Cancel all rooms in the online cart
    UPDATE reserved_room 
    SET booking_status = 'Cancelled' 
    WHERE reserveID = p_reserve_id 
    AND booking_status NOT IN ('Cancelled', 'Completed');

    -- 2. Cancel all physical booked rooms tied to this online cart
    -- We find the bookingID via the reserveID in the booking table
    UPDATE booked_room 
    SET room_status = 'Cancelled'
    WHERE bookingID IN (SELECT id FROM booking WHERE reserveID = p_reserve_id)
    AND room_status NOT IN ('Cancelled', 'Checked-Out');
    
    -- Triggers on both tables will automatically roll up the 'Cancelled' 
    -- status to the parent `reserves` and `booking` tables.
END;
$$;