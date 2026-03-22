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
IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'employees' 
          AND policyname = 'branch_manager_all_employees'
    ) THEN
        EXECUTE $POLICY$
            CREATE POLICY branch_manager_all_employees ON employees
            FOR ALL
            USING (
                'MANAGE_BRANCH' = ANY(string_to_array(current_setting('app.roles', true), ','))
                AND 
                hotelid IN (
                    SELECT id FROM hotels 
                    WHERE branchid = NULLIF(current_setting('app.branchid', true), '')::INT
                )
            );
        $POLICY$;
    END IF;
END
$$;


-- ============================================================================
-- 3. HOTEL MANAGER POLICIES FOR EMPLOYEE TABLE
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'employees' 
          AND policyname = 'hotel_manager_all_employees'
    ) THEN
        EXECUTE $POLICY$
            CREATE POLICY hotel_manager_all_employees ON employees
            FOR ALL
            USING (
                'MANAGE_HOTEL' = ANY(string_to_array(current_setting('app.roles', true), ','))
                AND 
                hotelid = NULLIF(current_setting('app.hotelid', true), '')::INT
            );
        $POLICY$;
    END IF;
END
$$;

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
-- 5. MANAGE_BRANCH POLICIES FOR BRANCH TABLE
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'branch' 
          AND policyname = 'manage_branch_all_branch'
    ) THEN
        EXECUTE $POLICY$
            CREATE POLICY manage_branch_all_branch ON branch
            FOR ALL
            USING (
                'MANAGE_BRANCH' = ANY(string_to_array(current_setting('app.roles', true), ','))
                AND
                id = NULLIF(current_setting('app.branchid', true), '')::INT
            );
        $POLICY$;
    END IF;
END
$$;