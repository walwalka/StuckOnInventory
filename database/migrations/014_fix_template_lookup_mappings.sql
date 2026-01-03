-- Migration 014: Fix lookup table mappings for comic books and stamps
-- Links publisher and country fields to their respective lookup tables

-- Update comics.publisher to use lookup_comicpublishers
UPDATE custom_fields
SET lookup_table_id = (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_comicpublishers')
WHERE field_name = 'publisher'
  AND table_id = (SELECT id FROM custom_tables WHERE table_name = 'comics')
  AND lookup_table_id IS NULL;

-- Update stamps.country to use lookup_countries
UPDATE custom_fields
SET lookup_table_id = (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_countries')
WHERE field_name = 'country'
  AND table_id = (SELECT id FROM custom_tables WHERE table_name = 'stamps')
  AND lookup_table_id IS NULL;
