CREATE OR REPLACE FUNCTION get_employees_by_page(
    p_name TEXT,
    p_page INT
) 
RETURNS TABLE (
    id INT,
    username VARCHAR,
    email VARCHAR,
    hotelID INT,
    branchID INT[],
    firstName VARCHAR,
    lastName VARCHAR,
    salary INT,
    roles JSONB,
    has_next BOOLEAN
) AS $$
DECLARE
    v_limit INT := 10;
    v_fetch_limit INT := 11; 
    v_total_rows INT;
    v_max_pages INT;
    v_actual_page INT;
    v_offset INT;
BEGIN
    -- 1. Boundary Check: Handle Underflow (Page < 1)
    v_actual_page := GREATEST(1, p_page);

    -- 2. Boundary Check: Handle Overflow
    -- We still need the count to know if the requested page is "too high"
    SELECT COUNT(*) INTO v_total_rows 
    FROM employees e 
    WHERE e.username ILIKE '%' || p_name || '%';

    v_max_pages := CEIL(v_total_rows::numeric / v_limit)::INT;
    
    -- If they ask for page 100 but only 5 exist, give them page 5
    IF v_actual_page > v_max_pages AND v_max_pages > 0 THEN
        v_actual_page := v_max_pages;
    END IF;

    -- 3. Calculate Offset
    v_offset := (v_actual_page - 1) * v_limit;

    -- 4. Execution with "Plus One" logic
    RETURN QUERY
    WITH raw_data AS (
        SELECT 
            e.id, 
            e.username,
            e.email,
            e.hotelid,
            array_agg(DISTINCT bh.branch_id) AS branchID,
            e.firstname,
            e.lastname,
            e.salary,
            COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object('role', er.role, 'tier', r.tier) 
                        ORDER BY r.tier ASC
                    )
                    FROM employee_roles er
                    JOIN roles r ON er.role = r.name
                    WHERE er.employeeID = e.id
                ), 
                '[]'::jsonb
            ) AS roles
        FROM employees e
        LEFT JOIN branch_hotels bh ON e.hotelid = bh.hotel_id
        WHERE e.username ILIKE '%' || p_name || '%'
        GROUP BY e.id
        ORDER BY e.id
        LIMIT v_fetch_limit -- Fetch 16
        OFFSET v_offset
    )
    SELECT 
        rd.id, rd.username, rd.email, rd.hotelid, rd.branchid, 
        rd.firstname, rd.lastname, rd.salary, rd.roles,
        (SELECT COUNT(*) FROM raw_data) > v_limit AS has_next -- True if we got 16
    FROM raw_data rd
    LIMIT v_limit; -- Return only 15 to the UI
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_user_auth_context(p_username VARCHAR)
RETURNS TABLE (
    id INT,
    username VARCHAR,
    email VARCHAR,
    hotelid INT,
    firstname VARCHAR,
    lastname VARCHAR,
    salary INT,
    branchid INT[],
    roles JSONB
) 
SECURITY DEFINER 
SET search_path = public 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.username,
        e.email,
        e.hotelid,
        e.firstname,
        e.lastname,
        e.salary,
        array_agg(DISTINCT bh.branch_id),
        -- Aggregate roles and tiers into a JSON array, sorted by tier
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object('role', er.role, 'tier', r.tier) 
                    ORDER BY r.tier ASC
                )
                FROM employee_roles er
                JOIN roles r ON er.role = r.name
                WHERE er.employeeID = e.id
            ), 
            '[]'::jsonb -- Default to an empty JSON array
        ) AS roles
    FROM employees e
    LEFT JOIN branch_hotels bh ON e.hotelid = bh.hotel_id
    WHERE e.username = p_username -- Now filters based on the passed-in username
    GROUP BY 
        e.id, 
        e.username, 
        e.email, 
        e.hotelid, 
        e.firstname, 
        e.lastname, 
        e.salary;
END;
$$;

CREATE OR REPLACE FUNCTION create_initial_admin(
    p_username VARCHAR,
    p_salt BYTEA,
    p_hash BYTEA,
    p_email VARCHAR,
    p_firstName VARCHAR,
    p_lastName VARCHAR,
    p_salary INT
) 
RETURNS TABLE (
    id INT, 
    username VARCHAR, 
    email VARCHAR, 
    firstName VARCHAR, 
    lastName VARCHAR, 
    salary INT
) 
SECURITY DEFINER -- Bypasses RLS so you can create the user before they log in
SET search_path = public -- Security best practice for SECURITY DEFINER
LANGUAGE plpgsql 
AS $$
BEGIN
    RETURN QUERY
    -- 1. Attempt to insert the new employee
    WITH inserted_admin AS (
        INSERT INTO employees (username, salt, hash, email, firstName, lastName, salary)
        VALUES (p_username, p_salt, p_hash, p_email, p_firstName, p_lastName, p_salary)
        -- NOTE: You must specify the unique column that triggers the conflict
        ON CONFLICT DO NOTHING 
        RETURNING employees.id, employees.username, employees.email, employees.firstName, employees.lastName, employees.salary
    ),
    -- 2. If a new user WAS inserted, automatically assign them the Admin role
    assigned_role AS (
        INSERT INTO employee_roles (employeeid, role)
        SELECT inserted_admin.id, 'ADMINISTRATOR' FROM inserted_admin
    )
    -- 3. Return the newly inserted row
    SELECT * FROM inserted_admin
    
    UNION ALL
    
    -- 4. If no row was inserted (meaning they already exist), return the existing row
    SELECT e.id, e.username, e.email, e.firstName, e.lastName, e.salary
    FROM employees e
    WHERE e.username = p_username;
END;
$$;