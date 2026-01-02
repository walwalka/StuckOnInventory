-- Migration 013: Fix coin field types and link to lookup tables
-- This migration fixes the coin table fields to use proper types and lookup tables

-- Update coin fields to use lookup tables
UPDATE custom_fields
SET lookup_table_id = (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_cointypes')
WHERE field_name = 'type'
  AND table_id = (SELECT id FROM custom_tables WHERE table_name = 'coins');

UPDATE custom_fields
SET lookup_table_id = (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_mintlocations')
WHERE field_name = 'mintlocation'
  AND table_id = (SELECT id FROM custom_tables WHERE table_name = 'coins');

-- Change mintyear from date to text (for year input)
UPDATE custom_fields
SET field_type = 'text',
    placeholder = 'e.g., 1964'
WHERE field_name = 'mintyear'
  AND table_id = (SELECT id FROM custom_tables WHERE table_name = 'coins');

-- Change grade from select to text
UPDATE custom_fields
SET field_type = 'text',
    placeholder = 'e.g., MS-65, AU-50',
    options = NULL
WHERE field_name = 'grade'
  AND table_id = (SELECT id FROM custom_tables WHERE table_name = 'coins');

-- Now we need to alter the actual physical coin tables for ALL users
-- Get all physical coin tables and alter their mintyear column
DO $$
DECLARE
    table_record RECORD;
    physical_table_name TEXT;
    column_type TEXT;
BEGIN
    -- Find all users who have coin tables
    FOR table_record IN
        SELECT DISTINCT u.email, ct.table_name
        FROM custom_tables ct
        INNER JOIN users u ON ct.created_by = u.id
        WHERE ct.table_name = 'coins'
    LOOP
        -- Build physical table name: username_data_coins
        physical_table_name := LOWER(REGEXP_REPLACE(SPLIT_PART(table_record.email, '@', 1), '[^a-z0-9]', '_', 'g')) || '_data_coins';

        -- Check if table exists before altering
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = physical_table_name
        ) THEN
            -- Check current column type
            SELECT data_type INTO column_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = physical_table_name
            AND column_name = 'mintyear';

            -- Only alter if it's currently a date type
            IF column_type = 'date' THEN
                -- Alter mintyear column from date to text
                EXECUTE format(
                    'ALTER TABLE %I ALTER COLUMN mintyear TYPE TEXT USING EXTRACT(YEAR FROM mintyear)::TEXT',
                    physical_table_name
                );

                RAISE NOTICE 'Updated table: % (was date type)', physical_table_name;
            ELSIF column_type = 'text' OR column_type = 'character varying' THEN
                RAISE NOTICE 'Skipped table: % (already text type)', physical_table_name;
            ELSE
                RAISE NOTICE 'Skipped table: % (unexpected type: %)', physical_table_name, column_type;
            END IF;
        END IF;
    END LOOP;
END $$;
