CREATE OR REPLACE FUNCTION get_employees_by_page(
    p_name TEXT,
    p_page INT
) 
RETURNS TABLE (
    id INT,
    username VARCHAR,
    email VARCHAR,
    hotelID INT,
    branchID INT,
    firstName VARCHAR,
    lastName VARCHAR,
    salary INT,
    roles JSONB
) AS $$
DECLARE
    v_limit INT := 15; -- Fixed page size
    v_total_rows INT;
    v_total_pages INT;
    v_actual_page INT;
    v_offset INT;
BEGIN
    -- 1. Get the total number of matching rows to calculate the max pages
    SELECT COUNT(*)
    INTO v_total_rows
    FROM employees e
    WHERE e.username ILIKE '%' || p_name || '%';

    -- 2. Calculate the total number of pages
    IF v_total_rows = 0 THEN
        v_total_pages := 1; -- Default to 1 to prevent math errors if no results
    ELSE
        v_total_pages := CEIL(v_total_rows::numeric / v_limit)::INT;
    END IF;

    -- 3. Enforce page boundaries (Return last page if input is too high)
    IF p_page > v_total_pages THEN
        v_actual_page := v_total_pages;
    ELSIF p_page < 1 THEN
        v_actual_page := 1; -- Safety check for negative or zero page inputs
    ELSE
        v_actual_page := p_page;
    END IF;

    -- 4. Calculate the offset based on the validated page
    v_offset := (v_actual_page - 1) * v_limit;

    -- 5. Return the requested page of data
    RETURN QUERY
    SELECT 
        e.id, 
        e.username,
        e.email,
        e.hotelid,
        e.branchid,
        e.firstname,
        e.lastname,
        e.salary,
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
    WHERE e.username ILIKE '%' || p_name || '%'
    GROUP BY e.id
    ORDER BY e.id
    LIMIT v_limit
    OFFSET v_offset;
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
    branchid INT,
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
        e.branchid,
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
    p_salary INT,
    p_hotelid INT,
    p_branchid INT
) 
RETURNS TABLE (
    id INT, 
    username VARCHAR, 
    email VARCHAR, 
    firstName VARCHAR, 
    lastName VARCHAR, 
    salary INT,
    hotelid INT,
    branchid INT
) 
SECURITY DEFINER -- Bypasses RLS so you can create the user before they log in
SET search_path = public -- Security best practice for SECURITY DEFINER
LANGUAGE plpgsql 
AS $$
BEGIN
    RETURN QUERY
    -- 1. Attempt to insert the new employee
    WITH inserted_admin AS (
        INSERT INTO employees (username, salt, hash, email, firstName, lastName, salary, hotelid, branchid)
        VALUES (p_username, p_salt, p_hash, p_email, p_firstName, p_lastName, p_salary, p_hotelid, p_branchid)
        -- NOTE: You must specify the unique column that triggers the conflict
        ON CONFLICT DO NOTHING 
        RETURNING employees.id, employees.username, employees.email, employees.firstName, employees.lastName, employees.salary, employees.hotelid, employees.branchid
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
    SELECT e.id, e.username, e.email, e.firstName, e.lastName, e.salary, e.hotelid, e.branchid
    FROM employees e
    WHERE e.username = p_username;
END;
$$;
