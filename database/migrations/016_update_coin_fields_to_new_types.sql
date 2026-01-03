-- Migration: Update coin table fields to use new field types
-- Description: Updates existing coin tables to use year field type for mintyear,
--              select type with options for circulation and grade fields
-- Date: 2026-01-03

-- Update mintyear field to use year type
UPDATE custom_fields
SET
  field_type = 'year',
  placeholder = 'e.g., 1964'
WHERE table_id IN (SELECT id FROM custom_tables WHERE table_name = 'coins')
  AND field_name = 'mintyear';

-- Update circulation field to use select type with Yes/No/N/A options
UPDATE custom_fields
SET
  field_type = 'select',
  placeholder = 'Select circulation status',
  options = '["Yes", "No", "N/A"]'::jsonb
WHERE table_id IN (SELECT id FROM custom_tables WHERE table_name = 'coins')
  AND field_name = 'circulation';

-- Update grade field to use select type with standard coin grades
UPDATE custom_fields
SET
  field_type = 'select',
  placeholder = 'Select grade',
  options = '["Poor", "Fair", "Good", "Very Good", "Fine", "Very Fine", "Extremely Fine", "About Uncirculated", "Uncirculated", "Proof"]'::jsonb
WHERE table_id IN (SELECT id FROM custom_tables WHERE table_name = 'coins')
  AND field_name = 'grade';
