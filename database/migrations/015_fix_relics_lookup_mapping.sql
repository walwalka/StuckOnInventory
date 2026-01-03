-- Migration 015: Fix lookup table mapping for relics type field
-- Links the type field to lookup_relictypes

-- Update relics.type to use lookup_relictypes
UPDATE custom_fields
SET lookup_table_id = (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_relictypes')
WHERE field_name = 'type'
  AND table_id = (SELECT id FROM custom_tables WHERE table_name = 'relics')
  AND lookup_table_id IS NULL;
