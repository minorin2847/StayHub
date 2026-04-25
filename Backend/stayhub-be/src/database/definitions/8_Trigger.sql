CREATE OR REPLACE TRIGGER trg_rooms_update_parent_status
AFTER INSERT OR UPDATE OF room_status OR DELETE
ON booked_room
FOR EACH ROW
EXECUTE FUNCTION fn_update_booking_status();

CREATE OR REPLACE TRIGGER trg_update_reserve_status
AFTER INSERT OR UPDATE OF booking_status OR DELETE
ON reserved_room
FOR EACH ROW
EXECUTE FUNCTION update_reserve_status();