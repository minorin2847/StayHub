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
                hotelid IN (SELECT id FROM hotels WHERE branchid = NULLIF(current_setting('app.branchid', true), '')::INT)
                AND
                -- Manager's best tier
                (SELECT MIN(tier) FROM roles WHERE name = ANY(string_to_array(current_setting('app.roles', true), ','))) 
                < 
                -- Employee's best tier (Defaults to 999 if no roles exist)
                (SELECT COALESCE(MIN(r.tier), 999) 
                 FROM employee_roles er 
                 JOIN roles r ON er.role = r.name 
                 WHERE er.employeeID = employees.id)
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
                AND
                -- Manager's best tier
                (SELECT MIN(tier) FROM roles WHERE name = ANY(string_to_array(current_setting('app.roles', true), ','))) 
                < 
                -- Employee's best tier (Defaults to 999 if no roles exist)
                (SELECT COALESCE(MIN(r.tier), 999) 
                 FROM employee_roles er 
                 JOIN roles r ON er.role = r.name 
                 WHERE er.employeeID = employees.id)
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
                -- 1. If the user is an ADMINISTRATOR, evaluate to TRUE (view all)
                'ADMINISTRATOR' = ANY(string_to_array(current_setting('app.roles', true), ','))
                OR 
                -- 2. If NOT an admin, only allow viewing roles where the tier is numerically greater
                --    than the user's minimum (best) tier.
                tier > (
                    SELECT MIN(r.tier) 
                    FROM roles r 
                    WHERE r.name = ANY(string_to_array(current_setting('app.roles', true), ','))
                )
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