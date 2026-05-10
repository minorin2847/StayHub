-- =============================================================================
-- 9_Partition_And_PgCron.sql
-- Partitioning bootstrap & pg_cron scheduler for the `booking` table.
--
-- Run ONCE as a superuser (or a role with CREATE permission on the database).
-- The application's node-cron already handles partition creation at startup,
-- but pg_cron adds a pure-database backup scheduler that runs even when the
-- Node.js process is not running.
--
-- Execution order:
--   1. CALL create_booking_partitions();     -- bootstrap 12 months
--   2. CALL create_next_booking_partition(); -- verify on-demand creation
--   3. Uncomment pg_cron block after enabling extension
-- =============================================================================


-- ---------------------------------------------------------------------------
-- SECTION 1 — Master bootstrap procedure
-- Creates partitions for current month + next N months (default 11).
-- Idempotent: CREATE TABLE IF NOT EXISTS is safe to re-run anytime.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE PROCEDURE create_booking_partitions(
  p_months_ahead INT DEFAULT 11
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year        INT;
  v_month       INT;
  v_next_year   INT;
  v_next_month  INT;
  v_start       TEXT;
  v_end         TEXT;
  v_name        TEXT;
  i             INT;
BEGIN
  -- Guard: only run if booking is a partitioned table
  IF NOT EXISTS (
    SELECT 1 FROM pg_class
    WHERE relname      = 'booking'
      AND relkind       = 'p'
      AND relnamespace  = 'public'::regnamespace
  ) THEN
    RAISE NOTICE '[create_booking_partitions] Skipping — booking is not a partitioned table.';
    RETURN;
  END IF;

  FOR i IN 0..p_months_ahead LOOP
    v_year  := EXTRACT(YEAR  FROM (CURRENT_DATE + (i  || ' months')::interval))::INT;
    v_month := EXTRACT(MONTH FROM (CURRENT_DATE + (i  || ' months')::interval))::INT;

    v_next_year  := EXTRACT(YEAR  FROM (CURRENT_DATE + ((i + 1) || ' months')::interval))::INT;
    v_next_month := EXTRACT(MONTH FROM (CURRENT_DATE + ((i + 1) || ' months')::interval))::INT;

    v_name  := format('booking_y%sm%s', v_year, LPAD(v_month::TEXT, 2, '0'));
    v_start := format('%s-%s-01', v_year,      LPAD(v_month::TEXT,      2, '0'));
    v_end   := format('%s-%s-01', v_next_year, LPAD(v_next_month::TEXT, 2, '0'));

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF booking FOR VALUES FROM (%L) TO (%L)',
      v_name, v_start, v_end
    );

    RAISE NOTICE '[create_booking_partitions] Ready: % (% → %)', v_name, v_start, v_end;
  END LOOP;

  RAISE NOTICE '[create_booking_partitions] Done. % partition(s) ensured.', p_months_ahead + 1;
END;
$$;


-- ---------------------------------------------------------------------------
-- SECTION 2 — Rolling monthly procedure (called by pg_cron)
-- Ensures the partition for "current month + p_buffer months" exists.
-- Default buffer = 3 so we're always 3 months ahead of the current month.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE PROCEDURE create_next_booking_partition(
  p_buffer INT DEFAULT 3
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year        INT;
  v_month       INT;
  v_next_year   INT;
  v_next_month  INT;
  v_start       TEXT;
  v_end         TEXT;
  v_name        TEXT;
  i             INT;
BEGIN
  -- Guard: only run if booking is a partitioned table
  IF NOT EXISTS (
    SELECT 1 FROM pg_class
    WHERE relname      = 'booking'
      AND relkind       = 'p'
      AND relnamespace  = 'public'::regnamespace
  ) THEN
    RAISE NOTICE '[create_next_booking_partition] Skipping — booking is not a partitioned table.';
    RETURN;
  END IF;

  -- Create partitions from current month up to current + p_buffer months
  FOR i IN 0..p_buffer LOOP
    v_year  := EXTRACT(YEAR  FROM (CURRENT_DATE + (i  || ' months')::interval))::INT;
    v_month := EXTRACT(MONTH FROM (CURRENT_DATE + (i  || ' months')::interval))::INT;

    v_next_year  := EXTRACT(YEAR  FROM (CURRENT_DATE + ((i + 1) || ' months')::interval))::INT;
    v_next_month := EXTRACT(MONTH FROM (CURRENT_DATE + ((i + 1) || ' months')::interval))::INT;

    v_name  := format('booking_y%sm%s', v_year, LPAD(v_month::TEXT, 2, '0'));
    v_start := format('%s-%s-01', v_year,      LPAD(v_month::TEXT,      2, '0'));
    v_end   := format('%s-%s-01', v_next_year, LPAD(v_next_month::TEXT, 2, '0'));

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF booking FOR VALUES FROM (%L) TO (%L)',
      v_name, v_start, v_end
    );

    RAISE NOTICE '[create_next_booking_partition] Ready: % (% → %)', v_name, v_start, v_end;
  END LOOP;
END;
$$;


-- ---------------------------------------------------------------------------
-- SECTION 3 — Bootstrap call
-- Run this immediately after deploying the procedures to seed initial data.
-- Creates current month + next 11 months (1 full year of partitions).
-- ---------------------------------------------------------------------------

CALL create_booking_partitions(11);


-- ---------------------------------------------------------------------------
-- SECTION 4 — pg_cron scheduler setup
-- Step 4a: Check if pg_cron is installed and available
-- Check if extension is enabled in current DB:
-- SELECT * FROM pg_extension WHERE extname = 'pg_cron';
--
-- Check if extension is available to be installed:
-- SELECT * FROM pg_available_extensions WHERE name = 'pg_cron';
--
-- Check if the 'cron' schema exists (created by the extension):
-- SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'cron';

-- Step 4b: Enable the extension (Requires superuser and 'pg_cron' in shared_preload_libraries)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 4c (uncomment below after extension is enabled):
-- ---------------------------------------------------------------------------

-- Remove stale job if it already exists (safe no-op if not found):
-- SELECT cron.unschedule('booking_partition_monthly');

-- Register the rolling partition job — runs at 00:05 on the 1st of every month:
DO $$
BEGIN
  PERFORM cron.schedule(
    'booking_partition_monthly',
    '5 0 1 * *',
    'CALL create_next_booking_partition(3)'
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- PROCEDURE: refresh_materialized_views
-- Refreshes all materialized views used for the application.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE refresh_materialized_views()
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh the views CONCURRENTLY to avoid read locks during the background job
  -- (This requires the materialized views to have at least one UNIQUE index)
  REFRESH MATERIALIZED VIEW CONCURRENTLY searchpage_view;
  REFRESH MATERIALIZED VIEW CONCURRENTLY room_details_view;
  REFRESH MATERIALIZED VIEW CONCURRENTLY hotel_other_rooms_view;
  
  RAISE NOTICE 'Materialized views refreshed successfully at %', now();
END;
$$;

-- Register the view refresh job — runs every 30 minutes:
DO $$
BEGIN
  PERFORM cron.schedule(
    'refresh_materialized_views_job',
    '*/30 * * * *',
    'CALL refresh_materialized_views()'
  );
END;
$$;

-- Verify the jobs were registered:
-- SELECT jobid, jobname, schedule, command, active
-- FROM cron.job;


-- ---------------------------------------------------------------------------
-- SECTION 5 — Verification queries
-- ---------------------------------------------------------------------------

-- List all partitions of the booking table:
-- SELECT
--   parent.relname  AS parent_table,
--   child.relname   AS partition_name,
--   pg_get_expr(child.relpartbound, child.oid) AS partition_range
-- FROM pg_inherits
-- JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
-- JOIN pg_class child  ON pg_inherits.inhrelid  = child.oid
-- WHERE parent.relname = 'booking'
-- ORDER BY child.relname;

-- Count rows per partition (useful for load analysis):
-- SELECT
--   child.relname AS partition_name,
--   pg_stat_get_live_tuples(child.oid) AS live_rows
-- FROM pg_inherits
-- JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
-- JOIN pg_class child  ON pg_inherits.inhrelid  = child.oid
-- WHERE parent.relname = 'booking'
-- ORDER BY child.relname;
