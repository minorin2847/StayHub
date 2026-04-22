-- ============================================================================
-- ENABLE ROW LEVEL SECURITY FOR ALL RELEVANT TABLES
-- ============================================================================

-- Core Infrastructure & Staff
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- Hotel Detail Tables
ALTER TABLE hotel_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_images ENABLE ROW LEVEL SECURITY;

-- Room Detail Tables (based on your RoomType normalization)
ALTER TABLE roomTypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_type_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_type_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_type_images ENABLE ROW LEVEL SECURITY;

-- Services & Operations
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Optional: If you plan to add policies for these later, enable them now
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserves ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. ADMINISTRATOR POLICIES FOR EMPLOYEES TABLE
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'employees' 
          AND policyname = 'admin_all_employees'
    ) THEN
        EXECUTE $POLICY$
            CREATE POLICY admin_all_employees ON employees
            FOR ALL
            USING (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
            );
        $POLICY$;
    END IF;
END
$$;


-- ============================================================================
-- 2. BRANCH MANAGER POLICIES FOR EMPLOYEES TABLE
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'branch_manager_all_employees' AND tablename = 'employees') THEN
        EXECUTE $POLICY$
            CREATE POLICY branch_manager_all_employees ON employees FOR ALL
            USING (
                'MANAGE_BRANCH' = ANY(string_to_array(current_setting('app.roles', true), ','))
                AND 
                branchid = NULLIF(current_setting('app.branchid', true), '')::INT
            );
        $POLICY$;
    END IF;
END $$;


-- ============================================================================
-- 3. HOTEL MANAGER POLICIES FOR EMPLOYEE TABLE
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotel_manager_all_employees' AND tablename = 'employees') THEN
        EXECUTE $POLICY$
            CREATE POLICY hotel_manager_all_employees ON employees FOR ALL
            USING (
                'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                AND 
                hotelid = NULLIF(current_setting('app.hotelid', true), '')::INT
            );
        $POLICY$;
    END IF;
END $$;

-- ============================================================================
-- 4. ADMINISTRATOR POLICIES FOR BRANCH TABLE
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'branch' 
          AND policyname = 'admin_all_branch'
    ) THEN
        EXECUTE $POLICY$
            CREATE POLICY admin_all_branch ON branch
            FOR ALL
            USING (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
            );
        $POLICY$;
    END IF;
END
$$;

-- ============================================================================
-- 5. POLICIES FOR BRANCH TABLE
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'branch' 
          AND policyname = 'general_all_branch'
    ) THEN
        EXECUTE $POLICY$
            CREATE POLICY general_all_branch ON branch
            FOR ALL
            USING (
                'ADMINISTRATOR' != ALL(string_to_array(current_setting('app.roles', true), ','))
                AND
                id = NULLIF(current_setting('app.branchid', true), '')::INT
            );
        $POLICY$;
    END IF;
END
$$;


-- =============================================================================================
-- 6. POLICIES FOR ROLES TABLE (ONLY SELECT PERMISSION, CAN ONLY VIEW ROLES LOWER THAN THEIR OWN)
-- =============================================================================================
DO $$ 
BEGIN
    -- Policy for viewing the roles table
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'roles_view_policy' AND tablename = 'roles') THEN
        EXECUTE $POLICY$
            CREATE POLICY roles_view_policy ON roles FOR SELECT
            USING (
                -- 1. Admins see everything
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR 
                -- 2. Others only see tiers numerically GREATER than their own
                -- No more subquery here, just a function call!
                tier > get_current_user_best_tier()
            );
        $POLICY$;
    END IF;
END $$;



-- ============================================================================
-- 7. ADMINISTRATOR POLICIES FOR ROLES TABLE (ALL PERMISSIONS)
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_manage_roles' AND tablename = 'roles') THEN
        EXECUTE $POLICY$
            CREATE POLICY admin_manage_roles ON roles FOR ALL
            USING (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
            );
        $POLICY$;
    END IF;
END $$;

-- ============================================================================
-- 8. ENABLE ROW LEVEL SECURITY AND ADMINISTRATOR POLICIES FOR HOTELS TABLE
-- ============================================================================
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_all_hotels' AND tablename = 'hotels') THEN
        EXECUTE $POLICY$
            CREATE POLICY admin_all_hotels ON hotels FOR ALL
            USING (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
            );
        $POLICY$;
    END IF;
END $$;

-- ============================================================================
-- 9. MANAGE_BRANCH POLICIES FOR HOTELS TABLE
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'manage_branch_all_hotels' AND tablename = 'hotels') THEN
        EXECUTE $POLICY$
            CREATE POLICY manage_branch_all_hotels ON hotels FOR ALL
            USING (
                'MANAGE_BRANCH' = ANY(string_to_array(current_setting('app.roles', true), ','))
                AND
                branchid = NULLIF(current_setting('app.branchid', true), '')::INT
            );
        $POLICY$;
    END IF;
END $$;

-- ============================================================================
-- 10. MANAGE_HOTEL POLICIES FOR HOTELS TABLE
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'manage_hotel_own_hotel' AND tablename = 'hotels') THEN
        EXECUTE $POLICY$
            CREATE POLICY manage_hotel_own_hotel ON hotels FOR ALL
            USING (
                'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                AND
                id = NULLIF(current_setting('app.hotelid', true), '')::INT
            );
        $POLICY$;
    END IF;
END $$;


-- ===================================================================================
-- 11. POLICIES FOR HOTEL AMENITIES TABLE 
-- (FULL READ ACCESS, CRUD ALL FOR ADMIN, CRUD ONLY RESPECTIVE HOTEL FOR MANAGE_HOTEL)
-- ===================================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotel_amenities_policy' AND tablename = 'hotel_amenities') THEN
        EXECUTE $POLICY$
            CREATE POLICY hotel_amenities_policy ON hotel_amenities FOR ALL
            USING (
                -- Public Read Access
                (current_user = current_user) -- Always true for SELECT
                OR
                -- Administrator Full Access
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                -- Manage Hotel Own Hotel
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                )
            )
            WITH CHECK (
                -- Restrict Mutations (CUD) to Admin or Branch Manager
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                )
            );
        $POLICY$;
    END IF;
END $$;

-- ===================================================================================
-- 12. POLICIES FOR HOTEL POLICIES TABLE 
-- (FULL READ ACCESS, CRUD ALL FOR ADMIN, CRUD ONLY RESPECTIVE HOTEL FOR MANAGE_HOTEL)
-- ===================================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotel_policies_policy' AND tablename = 'hotel_policies') THEN
        EXECUTE $POLICY$
            CREATE POLICY hotel_policies_policy ON hotel_policies FOR ALL
            USING (
                true -- Everyone can read
            )
            WITH CHECK (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                )
            );
        $POLICY$;
    END IF;
END $$;


-- ===================================================================================
-- 13. POLICIES FOR HOTEL BEDS TABLE 
-- (FULL READ ACCESS, CRUD ALL FOR ADMIN, CRUD ONLY RESPECTIVE HOTEL FOR MANAGE_HOTEL)
-- ===================================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotel_beds_policy' AND tablename = 'hotel_beds') THEN
        EXECUTE $POLICY$
            CREATE POLICY hotel_beds_policy ON hotel_beds FOR ALL
            USING (true)
            WITH CHECK (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                )
            );
        $POLICY$;
    END IF;
END $$;

-- ===================================================================================
-- 13. POLICIES FOR HOTEL IMAGES TABLE 
-- (FULL READ ACCESS, CRUD ALL FOR ADMIN, CRUD ONLY RESPECTIVE HOTEL FOR MANAGE_HOTEL)
-- ===================================================================================


DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotel_images_policy' AND tablename = 'hotel_images') THEN
        EXECUTE $POLICY$
            CREATE POLICY hotel_images_policy ON hotel_images FOR ALL
            USING (true)
            WITH CHECK (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                )
            );
        $POLICY$;
    END IF;
END $$;


-- ===================================================================================
-- 14. POLICIES FOR ROOM AMENITIES TABLE 
-- (FULL READ ACCESS, CRUD ALL FOR ADMIN, CRUD ONLY RESPECTIVE HOTEL FOR MANAGE_HOTEL)
-- ===================================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'room_type_amenities_policy' AND tablename = 'room_type_amenities') THEN
        EXECUTE $POLICY$
            CREATE POLICY room_type_amenities_policy ON room_type_amenities FOR ALL
            USING (true)
            WITH CHECK (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    EXISTS (
                        SELECT 1 FROM roomTypes 
                        WHERE roomTypes.id = room_typeID 
                        AND roomTypes.hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                    )
                )
            );
        $POLICY$;
    END IF;
END $$;


-- ===================================================================================
-- 14. POLICIES FOR ROOM BEDS TABLE 
-- (FULL READ ACCESS, CRUD ALL FOR ADMIN, CRUD ONLY RESPECTIVE HOTEL FOR MANAGE_HOTEL)
-- ===================================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'room_type_beds_policy' AND tablename = 'room_type_beds') THEN
        EXECUTE $POLICY$
            CREATE POLICY room_type_beds_policy ON room_type_beds FOR ALL
            USING (true)
            WITH CHECK (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    EXISTS (
                        SELECT 1 FROM roomTypes 
                        WHERE roomTypes.id = room_typeID 
                        AND roomTypes.hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                    )
                )
            );
        $POLICY$;
    END IF;
END $$;


-- ===================================================================================
-- 15. POLICIES FOR ROOM IMAGES TABLE 
-- (FULL READ ACCESS, CRUD ALL FOR ADMIN, CRUD ONLY RESPECTIVE HOTEL FOR MANAGE_HOTEL)
-- ===================================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'room_type_images_policy' AND tablename = 'room_type_images') THEN
        EXECUTE $POLICY$
            CREATE POLICY room_type_images_policy ON room_type_images FOR ALL
            USING (true)
            WITH CHECK (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    EXISTS (
                        SELECT 1 FROM roomTypes 
                        WHERE roomTypes.id = room_typeID 
                        AND roomTypes.hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                    )
                )
            );
        $POLICY$;
    END IF;
END $$;

-- ===================================================================================
-- 16. POLICIES FOR SERVICES TABLE 
-- (FULL READ ACCESS, CRUD ALL FOR ADMIN, CRUD ONLY RESPECTIVE HOTEL FOR MANAGE_HOTEL)
-- ===================================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'services_policy' AND tablename = 'services') THEN
        EXECUTE $POLICY$
            CREATE POLICY services_policy ON services FOR ALL
            USING (
                -- Public Read Access
                (current_user = current_user) -- Always true for SELECT
                OR
                -- Administrator Full Access
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                -- Manage Hotel Own Hotel
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                )
            )
            WITH CHECK (
                -- Restrict Mutations (CUD) to Admin or Branch Manager
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                )
            );
        $POLICY$;
    END IF;
END $$;



-- ===================================================================================
-- 17. POLICIES FOR ROOM TYPES TABLE 
-- (FULL READ ACCESS, CRUD ALL FOR ADMIN, CRUD ONLY RESPECTIVE HOTEL FOR MANAGE_HOTEL)
-- ===================================================================================


DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'room_types_policy' AND tablename = 'roomtypes') THEN
        EXECUTE $POLICY$
            CREATE POLICY room_types_policy ON roomTypes FOR ALL
            USING (true)
            WITH CHECK (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                )
            );
        $POLICY$;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'guests_policy' AND tablename = 'guests') THEN
        EXECUTE $POLICY$
            CREATE POLICY guests_policy ON guests FOR ALL
            USING (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                )
            );
        $POLICY$;
    END IF;
END $$;


DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'booking_policy' AND tablename = 'booking') THEN
        EXECUTE $POLICY$
            CREATE POLICY booking_policy ON booking FOR ALL
            USING (
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR
                (
                    'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                    AND
                    hotelID = NULLIF(current_setting('app.hotelid', true), '')::INT
                )
            );
        $POLICY$;
    END IF;
END $$;