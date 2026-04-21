CREATE OR REPLACE FUNCTION get_employees_by_page(
        current_username TEXT DEFAULT NULL,
        p_name TEXT DEFAULT NULL,
        p_hotel_id INT DEFAULT NULL,
        p_branch_id INT DEFAULT NULL,
        p_roles TEXT [] DEFAULT NULL,
        p_min_salary INT DEFAULT 0,
        p_max_salary INT DEFAULT 2147483647,
        p_sort_column TEXT DEFAULT 'id',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        id INT,
        username VARCHAR,
        email VARCHAR,
        hotelID INT,
        branchID INT,
        firstName VARCHAR,
        lastName VARCHAR,
        salary INT,
        roles JSONB,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_max_pages INT;
v_actual_page INT;
v_offset INT;
v_where TEXT := ' WHERE e.username <> ''' || current_username || '''';
v_query TEXT;
v_sort_clause TEXT;
BEGIN -- ### Build the Dynamic WHERE clause (shared by Count and Fetch) ##
-- 1. Filter by username, full name and email
IF p_name IS NOT NULL
AND p_name <> '' THEN v_where := v_where || format(
    ' AND (e.username ILIKE %L OR e.email ILIKE %L OR (e.firstName || '' '' || e.lastName) ILIKE %L)',
    '%' || p_name || '%',
    '%' || p_name || '%',
    '%' || p_name || '%'
);
END IF;
-- 2. Filter by hotelid
IF p_hotel_id IS NOT NULL THEN v_where := v_where || format(' AND e.hotelID = %L', p_hotel_id);
END IF;
-- 3. Filter by branchid
IF p_branch_id IS NOT NULL THEN v_where := v_where || format(' AND e.branchID = %L', p_branch_id);
END IF;
-- 4. Filter by salary range
v_where := v_where || format(
    ' AND e.salary BETWEEN %L AND %L',
    p_min_salary,
    p_max_salary
);
-- 5. Filter by roles
IF p_roles IS NOT NULL
AND array_length(p_roles, 1) > 0 THEN v_where := v_where || format(
    ' AND EXISTS (SELECT 1 FROM employee_roles er WHERE er.employeeID = e.id AND er.role = ANY(%L))',
    p_roles
);
END IF;
-- ### Boundary Check: Get Total Count based on filters ###
EXECUTE 'SELECT COUNT(*) FROM employees e' || v_where INTO v_total_rows;
-- ### Calculate max pages (handle division by zero if table is empty) ###
v_max_pages := GREATEST(1, CEIL(v_total_rows::numeric / v_limit)::INT);
-- ### Underflow check: Page < 1 becomes Page 1 ###
-- ### Overflow check: Requested page > Max pages becomes Max Page ###
v_actual_page := LEAST(v_max_pages, GREATEST(1, p_page));
-- ### Offset Calculation ###
v_offset := (v_actual_page - 1) * v_limit;
-- ### Dynamic Sorting Logic ###
v_sort_clause := CASE
    p_sort_column -- Sort by username
    WHEN 'username' THEN 'e.username' -- Sort by fullname
    WHEN 'full_name' THEN 'e.firstName || '' '' || e.lastName' -- Sort by salary
    WHEN 'salary' THEN 'e.salary' -- Default sort by id
    ELSE 'e.id'
END;
-- Sort direction (ascending/descending)
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
-- ### Execution ###
v_query := format(
    '
        WITH raw_data AS (
            SELECT 
                e.id, e.username, e.email, e.hotelid, e.branchid, e.firstname, e.lastname, e.salary,
                COALESCE(
                    (SELECT jsonb_agg(jsonb_build_object(''name'', er.role, ''tier'', r.tier) ORDER BY r.tier ASC)
                     FROM employee_roles er JOIN roles r ON er.role = r.name
                     WHERE er.employeeID = e.id), ''[]''::jsonb
                ) AS roles
            FROM employees e
            -- Filter clause
            %s
            -- Sort clause, sort direction
            ORDER BY %s %s
            -- Limit by limit+1
            LIMIT %L 
            -- Offset clause
            OFFSET %L
        )
        SELECT rd.*, 
        -- If we fetched 11 items, or if the current offset + rows is less than total, has_next is true
        (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd
        LIMIT %L',
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows,
    v_limit
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_branches_by_page(
        p_query TEXT DEFAULT NULL,
        p_min_hotel_count INT DEFAULT 0,
        p_max_hotel_count INT DEFAULT 2147483647,
        p_sort_column TEXT DEFAULT 'id',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        id INT,
        name VARCHAR,
        location VARCHAR,
        manager_firstname VARCHAR,
        manager_lastname VARCHAR,
        manager_email VARCHAR,
        hotel_count INT,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_max_pages INT;
v_actual_page INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT;
BEGIN -- ### 1. Define the Base Data Source ###
-- Using the new managerID column to join directly to employees
v_base_from := '
        FROM branch b
        LEFT JOIN employees m ON b.managerID = m.id
        LEFT JOIN (
            SELECT branchID, COUNT(*)::INT as h_count 
            FROM hotels 
            GROUP BY branchID
        ) hc ON b.id = hc.branchID';
-- ### 2. Build the Dynamic WHERE clause ###
-- Filter by branch name, location, or manager full name
IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(
    ' AND (b.name ILIKE %L OR b.location ILIKE %L OR (m.firstName || '' '' || m.lastName) ILIKE %L)',
    '%' || p_query || '%',
    '%' || p_query || '%',
    '%' || p_query || '%'
);
END IF;
-- Filter by hotel count range
v_where := v_where || format(
    ' AND COALESCE(hc.h_count, 0) BETWEEN %L AND %L',
    p_min_hotel_count,
    p_max_hotel_count
);
-- ### 3. Boundary Check & Pagination Math ###
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_max_pages := GREATEST(1, CEIL(v_total_rows::numeric / v_limit)::INT);
v_actual_page := LEAST(v_max_pages, GREATEST(1, p_page));
v_offset := (v_actual_page - 1) * v_limit;
-- ### 4. Dynamic Sorting Logic ###
v_sort_clause := CASE
    p_sort_column
    WHEN 'name' THEN 'b.name'
    WHEN 'location' THEN 'b.location'
    WHEN 'hotel_count' THEN 'COALESCE(hc.h_count, 0)'
    WHEN 'manager_name' THEN 'm.firstName || '' '' || m.lastName'
    ELSE 'b.id'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
-- ### 5. Execution ###
v_query := format(
    '
        WITH raw_data AS (
            SELECT 
                b.id, b.name, b.location,
                m.firstName as manager_firstname,
                m.lastName as manager_lastname,
                m.email as manager_email,
                COALESCE(hc.h_count, 0) as hotel_count
            %s
            %s
            ORDER BY %s %s
            LIMIT %L 
            OFFSET %L
        )
        SELECT rd.*, 
               (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd
        LIMIT %L',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows,
    v_limit
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_roles_by_page(
        p_query TEXT DEFAULT NULL,
        p_tier INT DEFAULT NULL,
        p_min_user_count INT DEFAULT 0,
        p_max_user_count INT DEFAULT 1000,
        p_sort_column TEXT DEFAULT 'tier',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        name VARCHAR,
        tier INT,
        usercount INT,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_max_pages INT;
v_actual_page INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT;
BEGIN --- ### 1. Define base source
v_base_from := '
        FROM roles r
        LEFT JOIN (
            SELECT role, COUNT(*)::INT as usercount
            FROM employee_roles
            GROUP BY role 
        ) er ON r.name = er.role';
--- ### 2. Build WHERE clause
-- Filter by role name
IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND r.name ILIKE %L', '%' || p_query || '%');
END IF;
-- Filter by tier
IF p_tier IS NOT NULL THEN v_where := v_where || format(' AND COALESCE(r.tier, 999) = %L', p_tier);
END IF;
-- Filter by user count
v_where := v_where || format(
    ' AND COALESCE(er.usercount, 0) BETWEEN %L AND %L',
    p_min_user_count,
    p_max_user_count
);
--- ### 3. Boundary check & pagination
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_max_pages := GREATEST(1, CEIL(v_total_rows::numeric / v_limit)::INT);
v_actual_page := LEAST(v_max_pages, GREATEST(1, p_page));
v_offset := (v_actual_page - 1) * v_limit;
-- ### 4. Dynamic Sort
v_sort_clause := CASE
    p_sort_column
    WHEN 'name' THEN 'r.name'
    WHEN 'tier' THEN 'COALESCE(r.tier, 999)'
    WHEN 'user_count' THEN 'COALESCE(er.usercount, 0)'
    ELSE 'COALESCE(r.tier, 999)'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
-- ### 5. Execution ###
v_query := format(
    '
        WITH raw_data AS (
            SELECT 
                r.name, r.tier,
                COALESCE(er.usercount, 0) as usercount
            %s
            %s
            ORDER BY %s %s
            LIMIT %L 
            OFFSET %L
        )
        SELECT rd.*, 
               (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd
        LIMIT %L',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows,
    v_limit
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_user_auth_context(p_username VARCHAR) RETURNS TABLE (
        id INT,
        username VARCHAR,
        email VARCHAR,
        hotelid INT,
        firstname VARCHAR,
        lastname VARCHAR,
        salary INT,
        branchid INT,
        roles JSONB
    ) SECURITY DEFINER
SET search_path = public LANGUAGE plpgsql AS $$ BEGIN RETURN QUERY
SELECT e.id,
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
                    jsonb_build_object('name', er.role, 'tier', r.tier)
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
GROUP BY e.id,
    e.username,
    e.email,
    e.hotelid,
    e.firstname,
    e.lastname,
    e.salary;
END;
$$;
CREATE OR REPLACE FUNCTION get_branches_auth_context(p_name VARCHAR) RETURNS TABLE (
        id INT,
        managerid INT,
        name VARCHAR,
        location VARCHAR,
        description TEXT
    ) SECURITY DEFINER
SET search_path = public LANGUAGE plpgsql AS $$ BEGIN RETURN QUERY
SELECT *
FROM branch
WHERE branch.name = name;
END;
$$;
CREATE OR REPLACE FUNCTION get_roles_auth_context(p_name VARCHAR) RETURNS TABLE (name VARCHAR, tier INT) SECURITY DEFINER
SET search_path = public LANGUAGE plpgsql AS $$ BEGIN RETURN QUERY
SELECT *
FROM roles
WHERE roles.name = name;
END;
$$;
CREATE OR REPLACE FUNCTION get_current_user_best_tier() RETURNS INT LANGUAGE sql SECURITY DEFINER -- Crucial: This bypasses the recursion
SET search_path = public,
    pg_temp AS $$
SELECT MIN(tier)
FROM roles
WHERE name = ANY(
        string_to_array(current_setting('app.roles', true), ',')
    );
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
    ) RETURNS TABLE (
        id INT,
        username VARCHAR,
        email VARCHAR,
        firstName VARCHAR,
        lastName VARCHAR,
        salary INT,
        hotelid INT,
        branchid INT
    ) SECURITY DEFINER -- Bypasses RLS so you can create the user before they log in
SET search_path = public -- Security best practice for SECURITY DEFINER
    LANGUAGE plpgsql AS $$ BEGIN RETURN QUERY -- 1. Attempt to insert the new employee
    WITH inserted_admin AS (
        INSERT INTO employees (
                username,
                salt,
                hash,
                email,
                firstName,
                lastName,
                salary,
                hotelid,
                branchid
            )
        VALUES (
                p_username,
                p_salt,
                p_hash,
                p_email,
                p_firstName,
                p_lastName,
                p_salary,
                p_hotelid,
                p_branchid
            ) -- NOTE: You must specify the unique column that triggers the conflict
            ON CONFLICT DO NOTHING
        RETURNING employees.id,
            employees.username,
            employees.email,
            employees.firstName,
            employees.lastName,
            employees.salary,
            employees.hotelid,
            employees.branchid
    ),
    -- 2. If a new user WAS inserted, automatically assign them the Admin role
    assigned_role AS (
        INSERT INTO employee_roles (employeeid, role)
        SELECT inserted_admin.id,
            'ADMINISTRATOR'
        FROM inserted_admin
    ) -- 3. Return the newly inserted row
SELECT *
FROM inserted_admin
UNION ALL
-- 4. If no row was inserted (meaning they already exist), return the existing row
SELECT e.id,
    e.username,
    e.email,
    e.firstName,
    e.lastName,
    e.salary,
    e.hotelid,
    e.branchid
FROM employees e
WHERE e.username = p_username;
END;
$$;
CREATE OR REPLACE FUNCTION get_user_from_id(p_id INT) RETURNS TABLE (
        id INT,
        username VARCHAR,
        email VARCHAR,
        hotelid INT,
        firstname VARCHAR,
        lastname VARCHAR,
        salary INT,
        branchid INT,
        roles JSONB
    ) LANGUAGE plpgsql AS $$ BEGIN RETURN QUERY
SELECT e.id,
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
                    jsonb_build_object('name', er.role, 'tier', r.tier)
                    ORDER BY r.tier ASC
                )
            FROM employee_roles er
                JOIN roles r ON er.role = r.name
            WHERE er.employeeID = e.id
        ),
        '[]'::jsonb -- Default to an empty JSON array
    ) AS roles
FROM employees e
WHERE e.id = p_id -- Now filters based on the passed-in username
GROUP BY e.id,
    e.username,
    e.email,
    e.hotelid,
    e.firstname,
    e.lastname,
    e.salary;
END;
$$;
CREATE OR REPLACE FUNCTION get_hotels_by_page(
        p_branch_id INT DEFAULT NULL,
        p_id INT DEFAULT 0,
        p_name TEXT DEFAULT '',
        p_classification INT DEFAULT 0,
        p_contact_email TEXT DEFAULT '',
        p_contact_phone TEXT DEFAULT '',
        p_location TEXT DEFAULT '',
        p_min_room_count INT DEFAULT 0,
        p_max_room_count INT DEFAULT 2147483647,
        p_sort_column TEXT DEFAULT 'id',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        id INT,
        name VARCHAR,
        classification INT,
        branchid INT,
        location VARCHAR,
        description TEXT,
        contact_email VARCHAR,
        contact_phone VARCHAR,
        room_count INT,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_max_pages INT;
v_actual_page INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT;
BEGIN v_base_from := '
        FROM hotels h
        LEFT JOIN (
            SELECT hotelid, COUNT(*)::INT as r_count
            FROM rooms
            GROUP BY hotelid
        ) rc ON h.id = rc.hotelid';
IF p_branch_id IS NOT NULL THEN v_where := v_where || format(' AND h.branchid = %L', p_branch_id);
END IF;
IF p_id > 0 THEN v_where := v_where || format(' AND h.id = %L', p_id);
END IF;
IF p_name <> '' THEN v_where := v_where || format(
    ' AND h.name ILIKE %L',
    '''%'' || %L || ''%''',
    p_name
);
END IF;
IF p_classification > 0 THEN v_where := v_where || format(' AND h.classification = %L', p_classification);
END IF;
IF p_contact_email <> '' THEN v_where := v_where || format(
    ' AND h.contact_email ILIKE %L',
    '''%'' || %L || ''%''',
    p_contact_email
);
END IF;
IF p_contact_phone <> '' THEN v_where := v_where || format(
    ' AND h.contact_phone ILIKE %L',
    '''%'' || %L || ''%''',
    p_contact_phone
);
END IF;
IF p_location <> '' THEN v_where := v_where || format(
    ' AND h.location ILIKE %L',
    '''%'' || %L || ''%''',
    p_location
);
END IF;
v_where := v_where || format(
    ' AND COALESCE(rc.r_count, 0) BETWEEN %L AND %L',
    p_min_room_count,
    p_max_room_count
);
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_max_pages := GREATEST(1, CEIL(v_total_rows::numeric / v_limit)::INT);
v_actual_page := LEAST(v_max_pages, GREATEST(1, p_page));
v_offset := (v_actual_page - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'classification' THEN 'h.classification'
    WHEN 'room_count' THEN 'COALESCE(rc.r_count, 0)'
    ELSE 'h.id'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    '
        WITH raw_data AS (
            SELECT 
                h.id, h.name, h.classification, h.branchid, h.location, h.description, 
                h.contact_email, h.contact_phone,
                COALESCE(rc.r_count, 0) as room_count
            %s
            %s
            ORDER BY %s %s, h.id ASC
            LIMIT %L 
            OFFSET %L
        )
        SELECT rd.*, 
               (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd
        LIMIT %L',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows,
    v_limit
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_beds_by_page(
        p_query TEXT DEFAULT NULL,
        p_exclude_hotel_id INT DEFAULT NULL,
        -- New Parameter
        p_min_count INT DEFAULT 0,
        p_max_count INT DEFAULT 1000,
        p_sort_column TEXT DEFAULT 'name',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        bed_name VARCHAR,
        hotel_count INT,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_actual_page INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT;
BEGIN -- 1. Source: Count how many hotels have each bed name
v_base_from := '
        FROM beds r
        LEFT JOIN (
            SELECT hb.bed_name, COUNT(hb.hotelID)::INT as hotel_count
            FROM hotel_beds hb
            GROUP BY hb.bed_name
        ) b ON r.name = b.bed_name';
-- 2. Filters
IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND r.name ILIKE %L', '%' || p_query || '%');
END IF;
v_where := v_where || format(
    ' AND COALESCE(b.hotel_count, 0) BETWEEN %L AND %L',
    p_min_count,
    p_max_count
);
-- NEW: Exclude beds already owned by this hotel
IF p_exclude_hotel_id IS NOT NULL THEN v_where := v_where || format(
    ' 
            AND r.name NOT IN (
                SELECT bed_name FROM hotel_beds WHERE hotelid = %L
            )',
    p_exclude_hotel_id
);
END IF;
-- 3. Pagination Logic
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_actual_page := LEAST(
    GREATEST(1, p_page),
    GREATEST(1, CEIL(v_total_rows::numeric / v_limit)::INT)
);
v_offset := (v_actual_page - 1) * v_limit;
-- 4. Sorting
v_sort_clause := CASE
    p_sort_column
    WHEN 'count' THEN 'COALESCE(b.hotel_count, 0)'
    ELSE 'b.bed_name'
END;
-- 5. Execution
v_query := format(
    '
        WITH raw_data AS (
            SELECT r.name AS bed_name, COALESCE(b.hotel_count, 0) AS hotel_count
            %s %s
            ORDER BY %s %s
            LIMIT %L OFFSET %L
        )
        SELECT rd.*, 
               (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd
        LIMIT %L',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows,
    v_limit
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_hotel_beds_by_page(
        p_hotel_id INT,
        p_query TEXT DEFAULT NULL,
        p_min_count INT DEFAULT 0,
        p_max_count INT DEFAULT 1000,
        p_sort_column TEXT DEFAULT 'name',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        bed_name VARCHAR,
        total_qty INT,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT;
BEGIN -- 1. Source: Start with hotel_beds and LEFT JOIN aggregated room counts
v_base_from := format(
    '
        FROM (
            SELECT 
                hb.bed_name, 
                COALESCE(room_sums.sum_qty, 0)::INT as total_qty
            FROM hotel_beds hb
            LEFT JOIN (
                SELECT rb.bed_name, SUM(rb.bed_count) as sum_qty
                FROM room_type_beds rb
                JOIN roomTypes r ON rb.room_typeID = r.id
                WHERE r.hotelID = %L
                GROUP BY rb.bed_name
            ) room_sums ON hb.bed_name = room_sums.bed_name
            WHERE hb.hotelID = %L
        ) b',
    p_hotel_id,
    p_hotel_id
);
-- 2. Filters (COALESCE already handled in subquery 'b')
IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(
    ' AND b.bed_name ILIKE %L',
    '%' || p_query || '%'
);
END IF;
v_where := v_where || format(
    ' AND b.total_qty BETWEEN %L AND %L',
    p_min_count,
    p_max_count
);
-- 3. Pagination Logic
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
-- 4. Sorting
v_sort_clause := CASE
    p_sort_column
    WHEN 'count' THEN 'b.total_qty'
    ELSE 'b.bed_name'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
-- 5. Final Execution
v_query := format(
    '
        WITH raw_data AS (
            SELECT b.bed_name, b.total_qty
            %s %s
            ORDER BY %s %s
            LIMIT %L OFFSET %L
        )
        SELECT rd.*, 
                (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd
        LIMIT %L',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows,
    v_limit
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_services_by_page(
        p_query TEXT DEFAULT NULL,
        p_type TEXT DEFAULT NULL,
        p_min_price INT DEFAULT 0,
        p_max_price INT DEFAULT 2147483647,
        p_sort_column TEXT DEFAULT 'id',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        id INT,
        hotelID INT,
        type VARCHAR,
        name VARCHAR,
        description TEXT,
        coverImage TEXT,
        price INT,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_max_pages INT;
v_actual_page INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT;
BEGIN -- ### 1. Define the Base Data Source ###
v_base_from := ' FROM services s ';
-- ### 2. Build the Dynamic WHERE clause ###
-- Filter by text query (name or description)
IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(
    ' AND (s.name ILIKE %L OR s.description ILIKE %L)',
    '%' || p_query || '%',
    '%' || p_query || '%'
);
END IF;
-- Filter by specific service type
IF p_type IS NOT NULL
AND p_type <> '' THEN v_where := v_where || format(' AND s.type = %L', p_type);
END IF;
-- Filter by price range
v_where := v_where || format(
    ' AND s.price BETWEEN %L AND %L',
    p_min_price,
    p_max_price
);
-- ### 3. Boundary Check & Pagination Math ###
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_max_pages := GREATEST(1, CEIL(v_total_rows::numeric / v_limit)::INT);
v_actual_page := LEAST(v_max_pages, GREATEST(1, p_page));
v_offset := (v_actual_page - 1) * v_limit;
-- ### 4. Dynamic Sorting Logic ###
v_sort_clause := CASE
    p_sort_column
    WHEN 'name' THEN 's.name'
    WHEN 'price' THEN 's.price'
    ELSE 's.id'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
-- ### 5. Execution ###
v_query := format(
    '
        WITH raw_data AS (
            SELECT 
                s.id, s.hotelID, s.type, s.name, s.description, s.coverImage, s.price
            %s
            %s
            ORDER BY %s %s
            LIMIT %L 
            OFFSET %L
        )
        SELECT rd.*, 
               (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd
        LIMIT %L',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows,
    v_limit
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_room_types_by_page(
        p_query TEXT DEFAULT NULL,
        p_min_size INT DEFAULT 0,
        p_max_size INT DEFAULT 1000,
        p_min_capacity INT DEFAULT 0,
        p_max_capacity INT DEFAULT 1000,
        p_min_price INT DEFAULT 0,
        p_max_price INT DEFAULT 2147483647,
        p_min_total_beds INT DEFAULT 0,
        p_max_total_beds INT DEFAULT 100,
        p_amenities TEXT [] DEFAULT NULL,
        p_beds TEXT [] DEFAULT NULL,
        p_sort_column TEXT DEFAULT 'name',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        id INT,
        hotelID INT,
        name VARCHAR,
        size INT,
        capacity INT,
        base_price INT,
        description TEXT,
        total_beds BIGINT,
        amenities JSONB,
        -- Changed from TEXT[] to JSONB
        beds JSONB,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_actual_page INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT;
BEGIN -- ### 1. Define Data Source with Full Amenity Objects and Beds ###
v_base_from := ' 
        FROM roomTypes rt
        LEFT JOIN (
            SELECT room_typeID, 
                   SUM(bed_count) as total_beds,
                   jsonb_agg(jsonb_build_object(''name'', bed_name, ''count'', bed_count)) as beds_json
            FROM room_type_beds 
            GROUP BY room_typeID
        ) b_info ON rt.id = b_info.room_typeID
        LEFT JOIN (
            SELECT rta.room_typeID, 
                   -- Aggregate full objects from the master amenities table
                   jsonb_agg(jsonb_build_object(
                       ''name'', am.name, 
                       ''icon'', am.icon, 
                       ''category'', am.category
                   )) as amenities_json,
                   -- Also aggregate just the names into an array for the filtering logic below
                   array_agg(am.name) as names_arr
            FROM room_type_amenities rta
            JOIN amenities am ON rta.amenity_name = am.name
            GROUP BY rta.room_typeID
        ) a_info ON rt.id = a_info.room_typeID ';
-- ### 2. Build the Dynamic WHERE clause ###
IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND rt.name ILIKE %L', '%' || p_query || '%');
END IF;
v_where := v_where || format(
    ' AND rt.size BETWEEN %L AND %L',
    p_min_size,
    p_max_size
);
v_where := v_where || format(
    ' AND rt.capacity BETWEEN %L AND %L',
    p_min_capacity,
    p_max_capacity
);
v_where := v_where || format(
    ' AND rt.base_price BETWEEN %L AND %L',
    p_min_price,
    p_max_price
);
v_where := v_where || format(
    ' AND COALESCE(b_info.total_beds, 0) BETWEEN %L AND %L',
    p_min_total_beds,
    p_max_total_beds
);
-- Multi-Select Amenities Filter (checks against the names_arr we created in the join)
IF p_amenities IS NOT NULL
AND array_length(p_amenities, 1) > 0 THEN v_where := v_where || format(
    ' AND %L <= COALESCE(a_info.names_arr, ''{}'')',
    p_amenities
);
END IF;
-- Multi-Select Bed Types Filter
IF p_beds IS NOT NULL
AND array_length(p_beds, 1) > 0 THEN v_where := v_where || format(
    ' AND EXISTS (
            SELECT 1 FROM room_type_beds rtb 
            WHERE rtb.room_typeID = rt.id AND rtb.bed_name = ANY(%L)
        )',
    p_beds
);
END IF;
-- ### 3. Pagination & Execution ###
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_actual_page := GREATEST(1, p_page);
v_offset := (v_actual_page - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'size' THEN 'rt.size'
    WHEN 'capacity' THEN 'rt.capacity'
    WHEN 'price' THEN 'rt.base_price'
    WHEN 'totalBeds' THEN 'COALESCE(b_info.total_beds, 0)'
    ELSE 'rt.name'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    '
        WITH filtered_data AS (
            SELECT 
                rt.id, rt.hotelID, rt.name, rt.size, rt.capacity, rt.base_price, rt.description,
                COALESCE(b_info.total_beds, 0)::BIGINT as total_beds,
                COALESCE(a_info.amenities_json, ''[]''::jsonb) as amenities,
                COALESCE(b_info.beds_json, ''[]''::jsonb) as beds
            %s
            %s
            ORDER BY %s %s, rt.id ASC
            LIMIT %L 
            OFFSET %L
        )
        SELECT fd.*, 
               (%L + (SELECT COUNT(*) FROM filtered_data)) < %L AS has_next
        FROM filtered_data fd',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit,
    v_offset,
    v_offset,
    v_total_rows
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION create_full_room_type(
        p_hotelID INT,
        p_name TEXT,
        -- Added the missing comma here
        p_size INT,
        p_capacity INT,
        p_price INT,
        p_description TEXT,
        p_amenities TEXT [],
        p_beds JSONB
    ) RETURNS INT AS $$
DECLARE new_type_id INT;
bed_record RECORD;
amenity_name TEXT;
BEGIN -- 1. Insert into the main table
INSERT INTO roomTypes (
        hotelID,
        name,
        size,
        capacity,
        base_price,
        description
    )
VALUES (
        p_hotelID,
        p_name,
        p_size,
        p_capacity,
        p_price,
        p_description
    )
RETURNING id INTO new_type_id;
-- 2. Loop and insert amenities
IF p_amenities IS NOT NULL THEN FOREACH amenity_name IN ARRAY p_amenities LOOP
INSERT INTO room_type_amenities (room_typeID, amenity_name)
VALUES (new_type_id, amenity_name);
END LOOP;
END IF;
-- 3. Loop and insert beds from JSONB
IF p_beds IS NOT NULL
AND jsonb_array_length(p_beds) > 0 THEN FOR bed_record IN
SELECT *
FROM jsonb_to_recordset(p_beds) AS x(name TEXT, count INT) LOOP
INSERT INTO room_type_beds (room_typeID, bed_name, bed_count)
VALUES (new_type_id, bed_record.name, bed_record.count);
END LOOP;
END IF;
RETURN new_type_id;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION update_room_type(
        p_id INT,
        p_name VARCHAR DEFAULT NULL,
        p_size INT DEFAULT NULL,
        p_capacity INT DEFAULT NULL,
        p_price INT DEFAULT NULL,
        p_description TEXT DEFAULT NULL,
        p_amenities TEXT [] DEFAULT NULL,
        -- Pass NULL to skip, [] to clear
        p_beds JSONB DEFAULT NULL -- Pass NULL to skip, [] to clear
    ) RETURNS VOID AS $$
DECLARE bed_record RECORD;
amenity_item TEXT;
BEGIN -- 1. Update the main roomTypes table (Partial Update)
UPDATE roomTypes
SET name = COALESCE(p_name, name),
    size = COALESCE(p_size, size),
    capacity = COALESCE(p_capacity, capacity),
    base_price = COALESCE(p_price, base_price),
    description = COALESCE(p_description, description)
WHERE id = p_id;
-- 2. Update Amenities (Only if an array was passed)
IF p_amenities IS NOT NULL THEN
DELETE FROM room_type_amenities
WHERE room_typeID = p_id;
FOREACH amenity_item IN ARRAY p_amenities LOOP
INSERT INTO room_type_amenities (room_typeID, amenity_name)
VALUES (p_id, amenity_item);
END LOOP;
END IF;
-- 3. Update Beds (Only if JSONB was passed)
IF p_beds IS NOT NULL THEN
DELETE FROM room_type_beds
WHERE room_typeID = p_id;
FOR bed_record IN
SELECT *
FROM jsonb_to_recordset(p_beds) AS x(name TEXT, count INT) LOOP
INSERT INTO room_type_beds (room_typeID, bed_name, bed_count)
VALUES (p_id, bed_record.name, bed_record.count);
END LOOP;
END IF;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_rooms_by_page(
        p_query TEXT DEFAULT NULL,
        p_type_id INT DEFAULT NULL,
        p_sort_column TEXT DEFAULT 'id',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        id INT,
        hotelID INT,
        name VARCHAR,
        typeID INT,
        note TEXT,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_max_pages INT;
v_actual_page INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT;
BEGIN -- ### 1. Define the Base Data Source ###
v_base_from := ' FROM rooms r ';
-- ### 2. Build the Dynamic WHERE clause ###
-- Filter by text query (search by name)
IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND r.name ILIKE %L', '%' || p_query || '%');
END IF;
-- Filter by specific room type (using typeID)
IF p_type_id IS NOT NULL THEN v_where := v_where || format(' AND r.typeID = %L', p_type_id);
END IF;
-- ### 3. Boundary Check & Pagination Math ###
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_max_pages := GREATEST(1, CEIL(v_total_rows::numeric / v_limit)::INT);
v_actual_page := LEAST(v_max_pages, GREATEST(1, p_page));
v_offset := (v_actual_page - 1) * v_limit;
-- ### 4. Dynamic Sorting Logic ###
v_sort_clause := CASE
    p_sort_column
    WHEN 'name' THEN 'r.name'
    ELSE 'r.id'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
-- ### 5. Execution ###
v_query := format(
    '
        WITH raw_data AS (
            SELECT 
                r.id, r.hotelID, r.name, r.typeID, r.note
            %s
            %s
            ORDER BY %s %s
            LIMIT %L 
            OFFSET %L
        )
        SELECT rd.*, 
               (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd
        LIMIT %L',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows,
    v_limit
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_amenities_by_page(
        p_query TEXT DEFAULT NULL,
        p_category TEXT DEFAULT NULL,
        p_exclude_hotel_id INT DEFAULT NULL,
        p_min_count INT DEFAULT 0,
        p_max_count INT DEFAULT 1000,
        p_sort_column TEXT DEFAULT 'name',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        name VARCHAR,
        icon TEXT,
        category VARCHAR,
        hotel_count INT,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_actual_page INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT;
BEGIN
v_base_from := '
        FROM amenities a
        LEFT JOIN (
            SELECT ha.amenity_name, COUNT(ha.hotelID)::INT as hotel_count
            FROM hotel_amenities ha
            GROUP BY ha.amenity_name
        ) h ON a.name = h.amenity_name';
-- Filters
IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND a.name ILIKE %L', '%' || p_query || '%');
END IF;

IF p_category IS NOT NULL
AND p_category <> '' THEN v_where := v_where || format(' AND a.category = %L', p_category);
END IF;

v_where := v_where || format(
    ' AND COALESCE(h.hotel_count, 0) BETWEEN %L AND %L',
    p_min_count,
    p_max_count
);

-- Exclude
IF p_exclude_hotel_id IS NOT NULL THEN v_where := v_where || format(
    ' 
            AND a.name NOT IN (
                SELECT amenity_name FROM hotel_amenities WHERE hotelid = %L
            )',
    p_exclude_hotel_id
);
END IF;

-- Pagination Logic
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_actual_page := LEAST(
    GREATEST(1, p_page),
    GREATEST(1, CEIL(v_total_rows::numeric / v_limit)::INT)
);
v_offset := (v_actual_page - 1) * v_limit;

-- Sorting
v_sort_clause := CASE
    p_sort_column
    WHEN 'count' THEN 'COALESCE(h.hotel_count, 0)'
    WHEN 'category' THEN 'a.category'
    ELSE 'a.name'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;

-- Execution
v_query := format(
    '
        WITH raw_data AS (
            SELECT a.name, a.icon, a.category, COALESCE(h.hotel_count, 0) AS hotel_count
            %s %s
            ORDER BY %s %s
            LIMIT %L OFFSET %L
        )
        SELECT rd.*, 
               (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd
        LIMIT %L',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows,
    v_limit
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_hotel_amenities_by_page(
        p_hotel_id INT,
        p_query TEXT DEFAULT NULL,
        p_category TEXT DEFAULT NULL,
        p_sort_column TEXT DEFAULT 'name',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        name VARCHAR,
        icon TEXT,
        category VARCHAR,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_offset INT;
v_where TEXT := ' WHERE ha.hotelID = ' || p_hotel_id;
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT;
BEGIN
v_base_from := '
        FROM hotel_amenities ha
        JOIN amenities a ON ha.amenity_name = a.name';

IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(
    ' AND a.name ILIKE %L',
    '%' || p_query || '%'
);
END IF;

IF p_category IS NOT NULL
AND p_category <> '' THEN v_where := v_where || format(' AND a.category = %L', p_category);
END IF;

-- Pagination Logic
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;

-- Sorting
v_sort_clause := CASE
    p_sort_column
    WHEN 'category' THEN 'a.category'
    ELSE 'a.name'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;

-- Final Execution
v_query := format(
    '
        WITH raw_data AS (
            SELECT a.name, a.icon, a.category
            %s %s
            ORDER BY %s %s
            LIMIT %L OFFSET %L
        )
        SELECT rd.*, 
                (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd
        LIMIT %L',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows,
    v_limit
);
RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql;