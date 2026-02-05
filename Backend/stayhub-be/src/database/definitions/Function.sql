CREATE OR REPLACE FUNCTION get_accounts_with_page_count(
    p_name TEXT,
    p_start INT,
    p_end INT
) 
RETURNS TABLE (
    -- Return all original columns from 'accounts'
    id INT,
    username VARCHAR,
    email VARCHAR,
    -- Add the calculated column
    total_pages INT
) AS $$
DECLARE
    v_page_size INT := p_end - p_start; -- Calculate the limit (page size)
BEGIN
    -- Safety check to prevent division by zero
    IF v_page_size <= 0 THEN
        RAISE EXCEPTION 'End index must be greater than start index';
    END IF;

    RETURN QUERY
    SELECT 
        a.id, 
        a.username,
        a.email,
        -- Window function to count total matches, then divide by page size
        CEIL(COUNT(*) OVER()::numeric / v_page_size)::INT AS total_pages
    FROM accounts a
    LEFT JOIN employees e ON a.id = e.accountID
    WHERE e.accountID IS NULL
    AND a.username ILIKE '%' || p_name || '%'
    ORDER BY a.id
    LIMIT v_page_size
    OFFSET p_start;
END;
$$ LANGUAGE plpgsql;