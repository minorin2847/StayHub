DO $$ 
BEGIN 
    --------------------------------------------------------------------------------
    -- PHASE 1: UNIQUE CONSTRAINTS & CHECKS
    -- These must exist before other tables can point to them.
    --------------------------------------------------------------------------------
    
    -- RoomTypes: Composite Unique for the Rooms link
    IF to_regclass('roomTypes') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_roomtypes_id_hotel' AND conrelid = 'roomTypes'::regclass) THEN 
        ALTER TABLE roomTypes ADD CONSTRAINT uq_roomtypes_id_hotel UNIQUE (id, hotelID);
    END IF;

    -- Branch: Unique location
    IF to_regclass('branch') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_branch_name_location' AND conrelid = 'branch'::regclass) THEN 
        ALTER TABLE branch ADD CONSTRAINT unique_branch_name_location UNIQUE (name, location);
    END IF;

    -- Salary Check
    IF to_regclass('employees') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_employee_salary_positive' AND conrelid = 'employees'::regclass) THEN 
        ALTER TABLE employees ADD CONSTRAINT check_employee_salary_positive CHECK (salary >= 0);
    END IF;

    -- Content Uniques (Marketing Tables)
    IF to_regclass('destinations') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_dest_name' AND conrelid = 'destinations'::regclass) THEN 
        ALTER TABLE destinations ADD CONSTRAINT unique_dest_name UNIQUE (name, category);
    END IF;
    IF to_regclass('deals') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_deal_title' AND conrelid = 'deals'::regclass) THEN 
        ALTER TABLE deals ADD CONSTRAINT unique_deal_title UNIQUE (title, location);
    END IF;

    --------------------------------------------------------------------------------
    -- PHASE 2: CORE INFRASTRUCTURE (Branch -> Hotels -> RoomTypes -> Rooms)
    --------------------------------------------------------------------------------
    
    -- Hotels -> Branch
    IF to_regclass('hotels') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_hotels_branch' AND conrelid = 'hotels'::regclass) THEN 
        ALTER TABLE hotels ADD CONSTRAINT fk_hotels_branch FOREIGN KEY (branchID) REFERENCES branch (id) ON DELETE SET NULL;
    END IF;

    -- RoomTypes -> Hotels
    IF to_regclass('roomTypes') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_roomtypes_hotel' AND conrelid = 'roomTypes'::regclass) THEN 
        ALTER TABLE roomTypes ADD CONSTRAINT fk_roomtypes_hotel FOREIGN KEY (hotelID) REFERENCES hotels (id) ON DELETE CASCADE;
    END IF;

    -- Rooms -> Hotels
    IF to_regclass('rooms') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rooms_hotel' AND conrelid = 'rooms'::regclass) THEN 
        ALTER TABLE rooms ADD CONSTRAINT fk_rooms_hotel FOREIGN KEY (hotelID) REFERENCES hotels (id) ON DELETE CASCADE;
    END IF;

    -- Rooms -> RoomTypes (COMPOSITE LINK)
    IF to_regclass('rooms') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rooms_roomtype_hotel' AND conrelid = 'rooms'::regclass) THEN 
        ALTER TABLE rooms ADD CONSTRAINT fk_rooms_roomtype_hotel FOREIGN KEY (typeID, hotelID) REFERENCES roomTypes (id, hotelID) ON UPDATE CASCADE;
    END IF;

    --------------------------------------------------------------------------------
    -- PHASE 3: STAFF & AUTH
    --------------------------------------------------------------------------------
    
    -- Employees -> Branch/Hotel
    IF to_regclass('employees') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_emp_branch' AND conrelid = 'employees'::regclass) THEN 
            ALTER TABLE employees ADD CONSTRAINT fk_emp_branch FOREIGN KEY (branchID) REFERENCES branch (id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_emp_hotel' AND conrelid = 'employees'::regclass) THEN 
            ALTER TABLE employees ADD CONSTRAINT fk_emp_hotel FOREIGN KEY (hotelID) REFERENCES hotels (id) ON DELETE SET NULL;
        END IF;
    END IF;

    -- Branch Manager
    IF to_regclass('branch') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_branch_manager' AND conrelid = 'branch'::regclass) THEN 
        ALTER TABLE branch ADD CONSTRAINT fk_branch_manager FOREIGN KEY (managerID) REFERENCES employees (id) ON DELETE SET NULL;
    END IF;

    -- Employee Roles
    IF to_regclass('employee_roles') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_er_emp' AND conrelid = 'employee_roles'::regclass) THEN 
            ALTER TABLE employee_roles ADD CONSTRAINT fk_er_emp FOREIGN KEY (employeeID) REFERENCES employees (id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_er_role' AND conrelid = 'employee_roles'::regclass) THEN 
            ALTER TABLE employee_roles ADD CONSTRAINT fk_er_role FOREIGN KEY (role) REFERENCES roles (name) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Password Reset -> Users
    IF to_regclass('passwordResetTokens') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_reset_user' AND conrelid = 'passwordResetTokens'::regclass) THEN 
        ALTER TABLE passwordResetTokens ADD CONSTRAINT fk_reset_user FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE;
    END IF;

    --------------------------------------------------------------------------------
    -- PHASE 4: BOOKINGS, RESERVES, REVIEWS & SERVICES
    --------------------------------------------------------------------------------
    
    -- Reserves & Reviews Core
    IF to_regclass('reserves') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_res_user' AND conrelid = 'reserves'::regclass) THEN 
            ALTER TABLE reserves ADD CONSTRAINT fk_res_user FOREIGN KEY (userID) REFERENCES users (id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_res_room' AND conrelid = 'reserves'::regclass) THEN 
            ALTER TABLE reserves ADD CONSTRAINT fk_res_room FOREIGN KEY (roomID) REFERENCES rooms (id) ON DELETE CASCADE;
        END IF;
    END IF;

    IF to_regclass('reviews') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rev_user' AND conrelid = 'reviews'::regclass) THEN 
            ALTER TABLE reviews ADD CONSTRAINT fk_rev_user FOREIGN KEY (userID) REFERENCES users (id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rev_room' AND conrelid = 'reviews'::regclass) THEN 
            ALTER TABLE reviews ADD CONSTRAINT fk_rev_room FOREIGN KEY (roomID) REFERENCES rooms (id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Booking
    IF to_regclass('booking') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_book_room' AND conrelid = 'booking'::regclass) THEN 
        ALTER TABLE booking ADD CONSTRAINT fk_book_room FOREIGN KEY (roomID) REFERENCES rooms (id) ON DELETE CASCADE;
    END IF;

    -- Services & Work
    IF to_regclass('services') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_serv_hotel' AND conrelid = 'services'::regclass) THEN 
        ALTER TABLE services ADD CONSTRAINT fk_serv_hotel FOREIGN KEY (hotelID) REFERENCES hotels (id) ON DELETE CASCADE;
    END IF;

    IF to_regclass('works') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_work_emp' AND conrelid = 'works'::regclass) THEN 
            ALTER TABLE works ADD CONSTRAINT fk_work_emp FOREIGN KEY (employeeID) REFERENCES employees (id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_work_serv' AND conrelid = 'works'::regclass) THEN 
            ALTER TABLE works ADD CONSTRAINT fk_work_serv FOREIGN KEY (serviceID) REFERENCES services (id) ON DELETE CASCADE;
        END IF;
    END IF;

    IF to_regclass('shifts') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_shift_emp' AND conrelid = 'shifts'::regclass) THEN 
        ALTER TABLE shifts ADD CONSTRAINT fk_shift_emp FOREIGN KEY (employeeID) REFERENCES employees (id) ON DELETE CASCADE;
    END IF;

    --------------------------------------------------------------------------------
    -- PHASE 5: JUNCTION TABLES & ASSET TABLES
    --------------------------------------------------------------------------------
    
    -- Reserves Junctions
    IF to_regclass('users_reserves') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ur_user' AND conrelid = 'users_reserves'::regclass) THEN 
            ALTER TABLE users_reserves ADD CONSTRAINT fk_ur_user FOREIGN KEY (users_id) REFERENCES users (id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ur_res' AND conrelid = 'users_reserves'::regclass) THEN 
            ALTER TABLE users_reserves ADD CONSTRAINT fk_ur_res FOREIGN KEY (reserves_userID) REFERENCES reserves (id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Reviews Junctions
    IF to_regclass('users_reviews') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_uw_user' AND conrelid = 'users_reviews'::regclass) THEN 
        ALTER TABLE users_reviews ADD CONSTRAINT fk_uw_user FOREIGN KEY (users_id) REFERENCES users (id) ON DELETE CASCADE;
    END IF;

    -- Hotel Assets
    IF to_regclass('hotel_amenities') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ha_hotel' AND conrelid = 'hotel_amenities'::regclass) THEN 
            ALTER TABLE hotel_amenities ADD CONSTRAINT fk_ha_hotel FOREIGN KEY (hotelID) REFERENCES hotels (id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ha_ame' AND conrelid = 'hotel_amenities'::regclass) THEN 
            ALTER TABLE hotel_amenities ADD CONSTRAINT fk_ha_ame FOREIGN KEY (amenity_name) REFERENCES amenities (name) ON UPDATE CASCADE;
        END IF;
    END IF;

    IF to_regclass('hotel_images') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_hi_hotel' AND conrelid = 'hotel_images'::regclass) THEN 
        ALTER TABLE hotel_images ADD CONSTRAINT fk_hi_hotel FOREIGN KEY (hotelID) REFERENCES hotels (id) ON DELETE CASCADE;
    END IF;

    -- RoomType Assets
    IF to_regclass('room_type_amenities') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rta_type' AND conrelid = 'room_type_amenities'::regclass) THEN 
            ALTER TABLE room_type_amenities ADD CONSTRAINT fk_rta_type FOREIGN KEY (room_typeID) REFERENCES roomTypes (id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rta_ame' AND conrelid = 'room_type_amenities'::regclass) THEN 
            ALTER TABLE room_type_amenities ADD CONSTRAINT fk_rta_ame FOREIGN KEY (amenity_name) REFERENCES amenities (name) ON UPDATE CASCADE;
        END IF;
    END IF;

    IF to_regclass('room_type_beds') IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rtb_type' AND conrelid = 'room_type_beds'::regclass) THEN 
            ALTER TABLE room_type_beds ADD CONSTRAINT fk_rtb_type FOREIGN KEY (room_typeID) REFERENCES roomTypes (id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rtb_bed' AND conrelid = 'room_type_beds'::regclass) THEN 
            ALTER TABLE room_type_beds ADD CONSTRAINT fk_rtb_bed FOREIGN KEY (bed_name) REFERENCES beds (name) ON UPDATE CASCADE;
        END IF;
    END IF;

    IF to_regclass('room_type_images') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rti_type' AND conrelid = 'room_type_images'::regclass) THEN 
        ALTER TABLE room_type_images ADD CONSTRAINT fk_rti_type FOREIGN KEY (room_typeID) REFERENCES roomTypes (id) ON DELETE CASCADE;
    END IF;

END $$;