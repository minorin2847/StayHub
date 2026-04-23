-- ============================================================================
-- FUNCTIONS DÀNH CHO NHÂN SỰ
-- ============================================================================
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
v_offset INT;
v_where TEXT := ' WHERE v.username <> ''' || COALESCE(current_username, '') || '''';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT := ' FROM vw_employee_details v ';
BEGIN IF p_name IS NOT NULL
AND p_name <> '' THEN v_where := v_where || format(
    ' AND (v.username ILIKE %L OR v.email ILIKE %L OR v.full_name ILIKE %L)',
    '%' || p_name || '%',
    '%' || p_name || '%',
    '%' || p_name || '%'
);
END IF;
IF p_hotel_id IS NOT NULL THEN v_where := v_where || format(' AND v.hotelID = %L', p_hotel_id);
END IF;
IF p_branch_id IS NOT NULL THEN v_where := v_where || format(' AND v.branchID = %L', p_branch_id);
END IF;
v_where := v_where || format(
    ' AND v.salary BETWEEN %L AND %L',
    p_min_salary,
    p_max_salary
);
IF p_roles IS NOT NULL
AND array_length(p_roles, 1) > 0 THEN v_where := v_where || format(
    ' AND EXISTS (SELECT 1 FROM employee_roles er WHERE er.employeeID = v.id AND er.role = ANY(%L))',
    p_roles
);
END IF;
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'username' THEN 'v.username'
    WHEN 'full_name' THEN 'v.full_name'
    WHEN 'salary' THEN 'v.salary'
    ELSE 'v.id'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    '
    WITH raw_data AS (SELECT v.id, v.username, v.email, v.hotelid, v.branchid, v.firstname, v.lastname, v.salary, v.roles %s %s ORDER BY %s %s LIMIT %L OFFSET %L)
    SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd',
    v_base_from,
    v_where,
    v_sort_clause,
    p_sort_dir,
    v_limit + 1,
    v_offset,
    v_offset,
    v_total_rows
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
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT := ' FROM vw_branch_details v ';
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(
    ' AND (v.name ILIKE %L OR v.location ILIKE %L OR v.manager_full_name ILIKE %L)',
    '%' || p_query || '%',
    '%' || p_query || '%',
    '%' || p_query || '%'
);
END IF;
v_where := v_where || format(
    ' AND v.hotel_count BETWEEN %L AND %L',
    p_min_hotel_count,
    p_max_hotel_count
);
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'name' THEN 'v.name'
    WHEN 'location' THEN 'v.location'
    WHEN 'hotel_count' THEN 'v.hotel_count'
    WHEN 'manager_name' THEN 'v.manager_full_name'
    ELSE 'v.id'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT v.id, v.name, v.location, v.manager_firstname, v.manager_lastname, v.manager_email, v.hotel_count %s %s ORDER BY %s %s LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd LIMIT %L',
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
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT := ' FROM vw_role_details v ';
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND v.name ILIKE %L', '%' || p_query || '%');
END IF;
IF p_tier IS NOT NULL THEN v_where := v_where || format(' AND COALESCE(v.tier, 999) = %L', p_tier);
END IF;
v_where := v_where || format(
    ' AND v.usercount BETWEEN %L AND %L',
    p_min_user_count,
    p_max_user_count
);
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'name' THEN 'v.name'
    WHEN 'tier' THEN 'COALESCE(v.tier, 999)'
    WHEN 'user_count' THEN 'v.usercount'
    ELSE 'COALESCE(v.tier, 999)'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT v.name, v.tier, v.usercount %s %s ORDER BY %s %s LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd LIMIT %L',
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
-- ============================================================================
-- FUNCTIONS DÀNH CHO TIỆN ÍCH VÀ KHÁCH SẠN
-- ============================================================================
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
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT := ' FROM vw_hotel_details v ';
BEGIN IF p_branch_id IS NOT NULL THEN v_where := v_where || format(' AND v.branchid = %L', p_branch_id);
END IF;
IF p_id > 0 THEN v_where := v_where || format(' AND v.id = %L', p_id);
END IF;
IF p_name <> '' THEN v_where := v_where || format(
    ' AND v.name ILIKE %L',
    '''%'' || %L || ''%''',
    p_name
);
END IF;
IF p_classification > 0 THEN v_where := v_where || format(' AND v.classification = %L', p_classification);
END IF;
IF p_contact_email <> '' THEN v_where := v_where || format(
    ' AND v.contact_email ILIKE %L',
    '''%'' || %L || ''%''',
    p_contact_email
);
END IF;
IF p_contact_phone <> '' THEN v_where := v_where || format(
    ' AND v.contact_phone ILIKE %L',
    '''%'' || %L || ''%''',
    p_contact_phone
);
END IF;
IF p_location <> '' THEN v_where := v_where || format(
    ' AND v.location ILIKE %L',
    '''%'' || %L || ''%''',
    p_location
);
END IF;
v_where := v_where || format(
    ' AND v.room_count BETWEEN %L AND %L',
    p_min_room_count,
    p_max_room_count
);
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'classification' THEN 'v.classification'
    WHEN 'room_count' THEN 'v.room_count'
    ELSE 'v.id'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT v.id, v.name, v.classification, v.branchid, v.location, v.description, v.contact_email, v.contact_phone, v.room_count %s %s ORDER BY %s %s, v.id ASC LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd LIMIT %L',
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
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT := ' FROM vw_amenity_details v ';
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND v.name ILIKE %L', '%' || p_query || '%');
END IF;
IF p_category IS NOT NULL
AND p_category <> '' THEN v_where := v_where || format(' AND v.category = %L', p_category);
END IF;
v_where := v_where || format(
    ' AND v.hotel_count BETWEEN %L AND %L',
    p_min_count,
    p_max_count
);
IF p_exclude_hotel_id IS NOT NULL THEN v_where := v_where || format(
    ' AND v.name NOT IN (SELECT amenity_name FROM hotel_amenities WHERE hotelid = %L)',
    p_exclude_hotel_id
);
END IF;
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'count' THEN 'v.hotel_count'
    WHEN 'category' THEN 'v.category'
    ELSE 'v.name'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT v.name, v.icon, v.category, v.hotel_count %s %s ORDER BY %s %s LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd LIMIT %L',
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
-- FIX COALESCE: Chống lỗi NULL khi không có hotel_id
v_where TEXT := ' WHERE v.hotelID = ' || COALESCE(p_hotel_id, -1);
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT := ' FROM vw_hotel_amenity_details v ';
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND v.name ILIKE %L', '%' || p_query || '%');
END IF;
IF p_category IS NOT NULL
AND p_category <> '' THEN v_where := v_where || format(' AND v.category = %L', p_category);
END IF;
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'category' THEN 'v.category'
    ELSE 'v.name'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT v.name, v.icon, v.category %s %s ORDER BY %s %s LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd LIMIT %L',
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
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT := ' FROM vw_bed_details v ';
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(
    ' AND v.bed_name ILIKE %L',
    '%' || p_query || '%'
);
END IF;
v_where := v_where || format(
    ' AND v.hotel_count BETWEEN %L AND %L',
    p_min_count,
    p_max_count
);
IF p_exclude_hotel_id IS NOT NULL THEN v_where := v_where || format(
    ' AND v.bed_name NOT IN (SELECT bed_name FROM hotel_beds WHERE hotelid = %L)',
    p_exclude_hotel_id
);
END IF;
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'count' THEN 'v.hotel_count'
    ELSE 'v.bed_name'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT v.bed_name, v.hotel_count %s %s ORDER BY %s %s LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd LIMIT %L',
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
-- FIX COALESCE: Chống lỗi NULL
v_where TEXT := ' WHERE v.hotelID = ' || COALESCE(p_hotel_id, -1);
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT := ' FROM vw_hotel_bed_details v ';
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(
    ' AND v.bed_name ILIKE %L',
    '%' || p_query || '%'
);
END IF;
v_where := v_where || format(
    ' AND v.total_qty BETWEEN %L AND %L',
    p_min_count,
    p_max_count
);
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'count' THEN 'v.total_qty'
    ELSE 'v.bed_name'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT v.bed_name, v.total_qty %s %s ORDER BY %s %s LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd LIMIT %L',
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
-- ============================================================================
-- FUNCTIONS DÀNH CHO PHÒNG VÀ LOẠI PHÒNG
-- ============================================================================
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
        beds JSONB,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT := ' FROM vw_room_type_details v ';
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND v.name ILIKE %L', '%' || p_query || '%');
END IF;
v_where := v_where || format(
    ' AND v.size BETWEEN %L AND %L',
    p_min_size,
    p_max_size
);
v_where := v_where || format(
    ' AND v.capacity BETWEEN %L AND %L',
    p_min_capacity,
    p_max_capacity
);
v_where := v_where || format(
    ' AND v.base_price BETWEEN %L AND %L',
    p_min_price,
    p_max_price
);
v_where := v_where || format(
    ' AND v.total_beds BETWEEN %L AND %L',
    p_min_total_beds,
    p_max_total_beds
);
IF p_amenities IS NOT NULL
AND array_length(p_amenities, 1) > 0 THEN v_where := v_where || format(
    ' AND %L <= COALESCE(v.names_arr, ''{}'')',
    p_amenities
);
END IF;
IF p_beds IS NOT NULL
AND array_length(p_beds, 1) > 0 THEN v_where := v_where || format(
    ' AND EXISTS (SELECT 1 FROM room_type_beds rtb WHERE rtb.room_typeID = v.id AND rtb.bed_name = ANY(%L))',
    p_beds
);
END IF;
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'size' THEN 'v.size'
    WHEN 'capacity' THEN 'v.capacity'
    WHEN 'price' THEN 'v.base_price'
    WHEN 'totalBeds' THEN 'v.total_beds'
    ELSE 'v.name'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT v.id, v.hotelID, v.name, v.size, v.capacity, v.base_price, v.description, v.total_beds, v.amenities, v.beds %s %s ORDER BY %s %s, v.id ASC LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd',
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
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND r.name ILIKE %L', '%' || p_query || '%');
END IF;
IF p_type_id IS NOT NULL THEN v_where := v_where || format(' AND r.typeID = %L', p_type_id);
END IF;
EXECUTE 'SELECT COUNT(*) FROM rooms r ' || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'name' THEN 'r.name'
    ELSE 'r.id'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT r.id, r.hotelID, r.name, r.typeID, r.note FROM rooms r %s ORDER BY %s %s LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd LIMIT %L',
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
-- ============================================================================
-- FUNCTIONS DÀNH CHO KHÁCH HÀNG & BOOKING
-- ============================================================================
CREATE OR REPLACE FUNCTION get_guests_by_page(
        p_query TEXT DEFAULT NULL,
        p_min_visit INT DEFAULT 0,
        p_max_visit INT DEFAULT 2147483647,
        p_from_last_stay DATE DEFAULT NULL,
        p_to_last_stay DATE DEFAULT NULL,
        p_sort_column TEXT DEFAULT 'id',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        id INT,
        first_name VARCHAR,
        last_name VARCHAR,
        full_name TEXT,
        email VARCHAR,
        phone VARCHAR,
        id_card_number VARCHAR,
        address TEXT,
        total_bookings BIGINT,
        last_stay_date DATE,
        created_at TIMESTAMP,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
v_base_from TEXT := ' FROM vw_guest_directory v ';
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(
    ' AND (v.full_name ILIKE %L OR v.email ILIKE %L OR v.phone ILIKE %L)',
    '%' || p_query || '%',
    '%' || p_query || '%',
    '%' || p_query || '%'
);
END IF;
v_where := v_where || format(
    ' AND v.total_bookings BETWEEN %L AND %L',
    p_min_visit,
    p_max_visit
);
IF p_from_last_stay IS NOT NULL THEN v_where := v_where || format(' AND v.last_stay_date >= %L', p_from_last_stay);
END IF;
IF p_to_last_stay IS NOT NULL THEN v_where := v_where || format(' AND v.last_stay_date <= %L', p_to_last_stay);
END IF;
EXECUTE 'SELECT COUNT(*) ' || v_base_from || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'name' THEN 'v.full_name'
    WHEN 'bookings' THEN 'v.total_bookings'
    WHEN 'recent' THEN 'v.last_stay_date'
    ELSE 'v.id'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
-- 5. Final Execution
v_query := format(
    '
        WITH raw_data AS (
            SELECT 
                v.id, v.first_name, v.last_name, v.full_name, v.email, v.phone, v.id_card_number, 
                v.address, v.total_bookings, v.last_stay_date, v.created_at
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
CREATE OR REPLACE FUNCTION get_bookings_by_page(
        p_query TEXT DEFAULT NULL,
        p_room_id INT DEFAULT NULL,
        p_checkin_after DATE DEFAULT NULL,
        p_checkin_before DATE DEFAULT NULL,
        p_checkout_after DATE DEFAULT NULL,
        p_checkout_before DATE DEFAULT NULL,
        p_status VARCHAR DEFAULT NULL,
        p_has_reserve BOOLEAN DEFAULT NULL,
        p_sort_column TEXT DEFAULT 'checkin',
        p_sort_dir TEXT DEFAULT 'ASC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        id INT,
        guest_full_name TEXT,
        guestID INT,
        checkin_date DATE,
        checkout_date DATE,
        total_rooms BIGINT,
        rooms JSONB,
        booking_status VARCHAR,
        actual_total_price DECIMAL,
        has_reserve BOOLEAN,
        reserveID INT,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
BEGIN 

-- 1. Dynamic Filtering
IF p_query IS NOT NULL AND p_query <> '' THEN 
    v_where := v_where || format(' AND v.guest_full_name ILIKE %L', '%' || p_query || '%');
END IF;

-- Room ID filter: Check if the booking contains the specified room ID
IF p_room_id IS NOT NULL THEN 
    v_where := v_where || format(' AND v.id IN (SELECT bookingid FROM booked_room WHERE roomID = %L)', p_room_id);
END IF;

IF p_checkin_after IS NOT NULL THEN v_where := v_where || format(' AND v.checkin_date >= %L', p_checkin_after); END IF;
IF p_checkin_before IS NOT NULL THEN v_where := v_where || format(' AND v.checkin_date <= %L', p_checkin_before); END IF;
IF p_checkout_after IS NOT NULL THEN v_where := v_where || format(' AND v.checkout_date >= %L', p_checkout_after); END IF;
IF p_checkout_before IS NOT NULL THEN v_where := v_where || format(' AND v.checkout_date <= %L', p_checkout_before); END IF;

IF p_status IS NOT NULL AND p_status <> '' THEN 
    v_where := v_where || format(' AND v.booking_status = %L', p_status);
END IF;

IF p_has_reserve IS NOT NULL THEN 
    v_where := v_where || format(' AND v.has_reserve = %L', p_has_reserve);
END IF;

-- 2. Pagination Math
EXECUTE 'SELECT COUNT(*) FROM vw_booking_details v ' || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;

-- 3. Dynamic Sorting
v_sort_clause := CASE
    p_sort_column
    WHEN 'guest' THEN 'v.guest_full_name'
    WHEN 'checkin' THEN 'v.checkin_date'
    WHEN 'checkout' THEN 'v.checkout_date'
    WHEN 'status' THEN 'v.booking_status'
    WHEN 'price' THEN 'v.actual_total_price'
    ELSE 'v.checkin_date'
END;

IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC'; END IF;

-- 4. Final Execution
v_query := format(
    '
        WITH raw_data AS (
            SELECT 
                v.id, v.guest_full_name, v.guestID, v.checkin_date, v.checkout_date,
                v.total_rooms, v.rooms, v.booking_status, v.actual_total_price, 
                v.has_reserve, v.reserveID
            FROM vw_booking_details v
            %s
            ORDER BY %s %s, v.id ASC
            LIMIT %L 
            OFFSET %L
        )
        SELECT rd.*, 
                (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next
        FROM raw_data rd',
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
-- ============================================================================
-- CÁC HÀM TIỆN ÍCH KHÁC (AUTH, SINGLE TABLE)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_policies_by_page(
        p_query TEXT DEFAULT NULL,
        p_category TEXT DEFAULT NULL,
        p_sort_column TEXT DEFAULT 'updated_at',
        p_sort_dir TEXT DEFAULT 'DESC',
        p_page INT DEFAULT 1
    ) RETURNS TABLE (
        name VARCHAR,
        icon TEXT,
        description TEXT,
        category VARCHAR,
        updated_at TIMESTAMP,
        has_next BOOLEAN
    ) AS $$
DECLARE v_limit INT := 10;
v_total_rows INT;
v_offset INT;
v_where TEXT := ' WHERE 1=1';
v_query TEXT;
v_sort_clause TEXT;
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(' AND p.name ILIKE %L', '%' || p_query || '%');
END IF;
IF p_category IS NOT NULL
AND p_category <> '' THEN v_where := v_where || format(' AND p.category = %L', p_category);
END IF;
EXECUTE 'SELECT COUNT(*) FROM policies p' || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'name' THEN 'p.name'
    WHEN 'category' THEN 'p.category'
    ELSE 'p.updated_at'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'DESC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT p.name, p.icon, p.description, p.category, p.updated_at FROM policies p %s ORDER BY %s %s LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd LIMIT %L',
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
v_offset INT;
v_where TEXT := ' WHERE TRUE';
v_query TEXT;
v_sort_clause TEXT;
BEGIN IF p_query IS NOT NULL
AND p_query <> '' THEN v_where := v_where || format(
    ' AND (s.name ILIKE %L OR s.description ILIKE %L)',
    '%' || p_query || '%',
    '%' || p_query || '%'
);
END IF;
IF p_type IS NOT NULL
AND p_type <> '' THEN v_where := v_where || format(' AND s.type = %L', p_type);
END IF;
v_where := v_where || format(
    ' AND s.price BETWEEN %L AND %L',
    p_min_price,
    p_max_price
);
EXECUTE 'SELECT COUNT(*) FROM services s ' || v_where INTO v_total_rows;
v_offset := (GREATEST(1, p_page) - 1) * v_limit;
v_sort_clause := CASE
    p_sort_column
    WHEN 'name' THEN 's.name'
    WHEN 'price' THEN 's.price'
    ELSE 's.id'
END;
IF UPPER(p_sort_dir) NOT IN ('ASC', 'DESC') THEN p_sort_dir := 'ASC';
END IF;
v_query := format(
    'WITH raw_data AS (SELECT s.id, s.hotelID, s.type, s.name, s.description, s.coverImage, s.price FROM services s %s ORDER BY %s %s LIMIT %L OFFSET %L) SELECT rd.*, (%L + (SELECT COUNT(*) FROM raw_data)) < %L AS has_next FROM raw_data rd LIMIT %L',
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
SELECT v.id,
    v.username,
    v.email,
    v.hotelid,
    v.firstname,
    v.lastname,
    v.salary,
    v.branchid,
    v.roles
FROM vw_employee_details v
WHERE v.username = p_username;
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
SELECT v.id,
    v.username,
    v.email,
    v.hotelid,
    v.firstname,
    v.lastname,
    v.salary,
    v.branchid,
    v.roles
FROM vw_employee_details v
WHERE v.id = p_id;
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
CREATE OR REPLACE FUNCTION get_current_user_best_tier() RETURNS INT LANGUAGE sql SECURITY DEFINER
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
    ) SECURITY DEFINER
SET search_path = public LANGUAGE plpgsql AS $$ BEGIN RETURN QUERY WITH inserted_admin AS (
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
            ) ON CONFLICT DO NOTHING
        RETURNING employees.id,
            employees.username,
            employees.email,
            employees.firstName,
            employees.lastName,
            employees.salary,
            employees.hotelid,
            employees.branchid
    ),
    assigned_role AS (
        INSERT INTO employee_roles (employeeid, role)
        SELECT inserted_admin.id,
            'ADMINISTRATOR'
        FROM inserted_admin
    )
SELECT *
FROM inserted_admin
UNION ALL
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
CREATE OR REPLACE FUNCTION create_full_room_type(
        p_hotelID INT,
        p_name TEXT,
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
BEGIN
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
IF p_amenities IS NOT NULL THEN FOREACH amenity_name IN ARRAY p_amenities LOOP
INSERT INTO room_type_amenities (room_typeID, amenity_name)
VALUES (new_type_id, amenity_name);
END LOOP;
END IF;
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
        p_beds JSONB DEFAULT NULL
    ) RETURNS VOID AS $$
DECLARE bed_record RECORD;
amenity_item TEXT;
BEGIN
UPDATE roomTypes
SET name = COALESCE(p_name, name),
    size = COALESCE(p_size, size),
    capacity = COALESCE(p_capacity, capacity),
    base_price = COALESCE(p_price, base_price),
    description = COALESCE(p_description, description)
WHERE id = p_id;
IF p_amenities IS NOT NULL THEN
DELETE FROM room_type_amenities
WHERE room_typeID = p_id;
FOREACH amenity_item IN ARRAY p_amenities LOOP
INSERT INTO room_type_amenities (room_typeID, amenity_name)
VALUES (p_id, amenity_item);
END LOOP;
END IF;
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
CREATE OR REPLACE FUNCTION fn_update_booking_status()
RETURNS TRIGGER AS $$
DECLARE
    v_total_rooms INT;
    v_count_in INT;
    v_count_out INT;
    v_count_cancelled INT;
    v_new_status VARCHAR(30);
    v_target_booking_id INT;
BEGIN
    -- Determine which booking_id to update (handles Insert/Update/Delete)
    v_target_booking_id := COALESCE(NEW.bookingid, OLD.bookingid);

    -- Gather stats for all rooms in this booking
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN room_status = 'Checked-In' THEN 1 END),
        COUNT(CASE WHEN room_status = 'Checked-Out' THEN 1 END),
        COUNT(CASE WHEN room_status = 'Cancelled' THEN 1 END)
    INTO 
        v_total_rooms, v_count_in, v_count_out, v_count_cancelled
    FROM booked_room
    WHERE bookingid = v_target_booking_id;

    -- Apply your Business Logic
    IF v_total_rooms = 0 THEN
        v_new_status := 'Empty';
    ELSIF v_count_cancelled = v_total_rooms THEN
        v_new_status := 'Cancelled';
    ELSIF v_count_out = v_total_rooms THEN
        v_new_status := 'Stayed'; -- All finished
    ELSIF v_count_out > 0 THEN
        v_new_status := 'Partial Checked-Out';
    ELSIF v_count_in = v_total_rooms THEN
        v_new_status := 'Checked-In';
    ELSIF v_count_in > 0 THEN
        v_new_status := 'Partial Checked-In';
    ELSE
        v_new_status := 'Confirmed Booking';
    END IF;

    -- Update the parent table
    UPDATE booking 
    SET booking_status = v_new_status 
    WHERE id = v_target_booking_id;

    RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql;