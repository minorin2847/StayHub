-- ============================================================================
-- 1. ADMINISTRATOR POLICIES
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
-- 2. BRANCH MANAGER POLICIES
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
                    SELECT hotel_id FROM branch_hotels 
                    WHERE branch_id = ANY(
                        string_to_array(NULLIF(current_setting('app.branchid', true), ''), ',')::int[]
                    )
                )
            );
        $POLICY$;
    END IF;
END
$$;


-- ============================================================================
-- 3. HOTEL MANAGER POLICIES
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

