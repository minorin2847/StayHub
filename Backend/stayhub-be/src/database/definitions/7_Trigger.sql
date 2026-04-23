CREATE OR REPLACE TRIGGER trg_rooms_update_parent_status
AFTER INSERT OR UPDATE OF room_status OR DELETE
ON booked_room
FOR EACH ROW
EXECUTE FUNCTION fn_update_booking_status();