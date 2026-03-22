-- Link Users_Reserves -> Users
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_id' AND conrelid = 'users_reserves'::regclass) THEN 
        ALTER TABLE users_reserves ADD CONSTRAINT fk_users_id FOREIGN KEY (users_id) REFERENCES users (id);
    END IF; 
END $$;

-- Link Users_Reserves -> Reserves
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_reserves_userid' AND conrelid = 'users_reserves'::regclass) THEN 
        ALTER TABLE users_reserves ADD CONSTRAINT fk_reserves_userID FOREIGN KEY (reserves_userID) REFERENCES reserves (userID);
    END IF; 
END $$;

-- Link Rooms_Reserves -> Rooms
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rooms_id' AND conrelid = 'rooms_reserves'::regclass) THEN 
        ALTER TABLE rooms_reserves ADD CONSTRAINT fk_rooms_id FOREIGN KEY (rooms_id) REFERENCES rooms (id);
    END IF; 
END $$;

-- Link Rooms_Reserves -> Reserves
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_reserves_roomid' AND conrelid = 'rooms_reserves'::regclass) THEN 
        ALTER TABLE rooms_reserves ADD CONSTRAINT fk_reserves_roomID FOREIGN KEY (reserves_roomID) REFERENCES reserves (roomID);
    END IF; 
END $$;

-- Link Users_Reviews -> Users
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_id' AND conrelid = 'users_reviews'::regclass) THEN 
        ALTER TABLE users_reviews ADD CONSTRAINT fk_users_id FOREIGN KEY (users_id) REFERENCES users (id);
    END IF; 
END $$;

-- Link Users_Reviews -> Reviews
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_reviews_userid' AND conrelid = 'users_reviews'::regclass) THEN 
        ALTER TABLE users_reviews ADD CONSTRAINT fk_reviews_userID FOREIGN KEY (reviews_userID) REFERENCES reviews (userID);
    END IF; 
END $$;

-- Link Rooms_Reviews -> Rooms
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_rooms_id' AND conrelid = 'rooms_reviews'::regclass) THEN 
        ALTER TABLE rooms_reviews ADD CONSTRAINT fk_rooms_id FOREIGN KEY (rooms_id) REFERENCES rooms (id);
    END IF; 
END $$;

-- Link Rooms_Reviews -> Reviews
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_reviews_roomid' AND conrelid = 'rooms_reviews'::regclass) THEN 
        ALTER TABLE rooms_reviews ADD CONSTRAINT fk_reviews_roomID FOREIGN KEY (reviews_roomID) REFERENCES reviews (roomID);
    END IF; 
END $$;

-- Link Rooms -> Hotels
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_hotelid' AND conrelid = 'rooms'::regclass) THEN 
        ALTER TABLE rooms ADD CONSTRAINT fk_hotelID FOREIGN KEY (hotelID) REFERENCES hotels (id);
    END IF; 
END $$;

-- Link Booking -> Rooms
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_roomid' AND conrelid = 'booking'::regclass) THEN 
        ALTER TABLE booking ADD CONSTRAINT fk_roomID FOREIGN KEY (roomID) REFERENCES rooms (id);
    END IF; 
END $$;

-- Link Shifts -> Employees
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_employeeid' AND conrelid = 'shifts'::regclass) THEN 
        ALTER TABLE shifts ADD CONSTRAINT fk_employeeID FOREIGN KEY (employeeID) REFERENCES employees (id);
    END IF; 
END $$;

-- Link Works -> Employees
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_employeeid' AND conrelid = 'works'::regclass) THEN 
        ALTER TABLE works ADD CONSTRAINT fk_employeeID FOREIGN KEY (employeeID) REFERENCES employees (id);
    END IF; 
END $$;

-- Link Works -> Services
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_serviceid' AND conrelid = 'works'::regclass) THEN 
        ALTER TABLE works ADD CONSTRAINT fk_serviceID FOREIGN KEY (serviceID) REFERENCES services (id);
    END IF; 
END $$;

-- Link Employees -> Hotels
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_hotelid' AND conrelid = 'employees'::regclass) THEN 
        ALTER TABLE employees ADD CONSTRAINT fk_hotelid FOREIGN KEY (hotelid) REFERENCES hotels (id);
    END IF; 
END $$;

-- Link Employee -> Roles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_employee_roles' AND conrelid = 'employee_roles'::regclass) THEN 
        ALTER TABLE employee_roles ADD CONSTRAINT fk_employee_roles FOREIGN KEY (role) REFERENCES roles (name);
    END IF; 
END $$;

-- Link Employees -> Branch
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_employees_branchid' AND conrelid = 'employees'::regclass) THEN 
        ALTER TABLE employees ADD CONSTRAINT fk_employees_branchid FOREIGN KEY (branchID) REFERENCES branch (id);
    END IF; 
END $$;

-- Link Hotels -> Branch
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_hotels_branchid' AND conrelid = 'hotels'::regclass) THEN 
        ALTER TABLE hotels ADD CONSTRAINT fk_hotels_branchid FOREIGN KEY (branchID) REFERENCES branch (id);
    END IF; 
END $$;

-- Unique constraint for destinations
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_name_category' AND conrelid = 'destinations'::regclass) THEN 
        ALTER TABLE destinations ADD CONSTRAINT unique_name_category UNIQUE (name, category);
    END IF; 
END $$;

-- Unique constraint for deals
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_title_location' AND conrelid = 'deals'::regclass) THEN 
        ALTER TABLE deals ADD CONSTRAINT unique_title_location UNIQUE (title, location);
    END IF; 
END $$;

-- Unique constraint for top_sights
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_sights_name' AND conrelid = 'top_sights'::regclass) THEN 
        ALTER TABLE top_sights ADD CONSTRAINT unique_sights_name UNIQUE (name);
    END IF; 
END $$;

-- Unique constraint for things_to_do
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_things_to_do_name' AND conrelid = 'things_to_do'::regclass) THEN 
        ALTER TABLE things_to_do ADD CONSTRAINT unique_things_to_do_name UNIQUE (name);
    END IF; 
END $$;

-- Unique constraint for home_Guests
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_home_guests_title_location' AND conrelid = 'home_Guests'::regclass) THEN 
        ALTER TABLE home_Guests ADD CONSTRAINT unique_home_guests_title_location UNIQUE (title, location);
    END IF; 
END $$;