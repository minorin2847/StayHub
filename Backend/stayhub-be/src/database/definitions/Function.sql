CREATE OR REPLACE FUNCTION get_employees_with_page_count(
    p_name TEXT,
    p_start INT,
    p_end INT
) 
RETURNS TABLE (
    id INT,
    username VARCHAR,
    email VARCHAR,
    hotelID INT,
    firstName VARCHAR,
    lastName VARCHAR,
    salary INT,
    roles JSONB, -- 1. Changed to JSONB to support structured data (role + tier)
    total_pages INT
) AS $$
DECLARE
    v_page_size INT := p_end - p_start;
BEGIN
    -- Safety check to prevent division by zero
    IF v_page_size <= 0 THEN
        RAISE EXCEPTION 'End index must be greater than start index';
    END IF;

    RETURN QUERY
    SELECT 
        e.id, 
        a.username,
        a.email,
        e.hotelid,
        e.firstname,
        e.lastname,
        e.salary,
        -- 2. Aggregate roles and tiers into a JSON array, sorted by tier
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
            '[]'::jsonb -- 3. Default to an empty JSON array if the employee has no roles
        ) AS roles,
        -- Window function to count total matches, then divide by page size
        CEIL(COUNT(*) OVER()::numeric / v_page_size)::INT AS total_pages
    FROM accounts a
    JOIN employees e ON a.id = e.accountID
    WHERE a.username ILIKE '%' || p_name || '%'
    ORDER BY a.id
    LIMIT v_page_size
    OFFSET p_start;
END;
$$ LANGUAGE plpgsql;