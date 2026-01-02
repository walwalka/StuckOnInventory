-- Migration: Migrate Existing Tables to Custom Tables System
-- Description: Converts hardcoded collectible tables to metadata-driven system
-- Created: 2025-01-01

-- Step 1: Insert metadata for existing tables
INSERT INTO custom_tables (table_name, display_name, description, icon, is_system, created_by, is_shared) VALUES
  ('coins', 'Coin Inventory', 'Numismatic coin collection', 'FaCoins', TRUE, 1, TRUE),
  ('relics', 'Native American Relics', 'Historical artifacts and relics', 'GiArrowhead', TRUE, 1, TRUE),
  ('stamps', 'Stamps', 'Philatelic stamp collection', 'GiStamper', TRUE, 1, TRUE),
  ('bunnykins', 'Bunnykins', 'Royal Doulton Bunnykins figurines', 'GiRabbit', TRUE, 1, TRUE),
  ('comics', 'Comic Books', 'Comic book collection', 'GiBookCover', TRUE, 1, TRUE);

-- Step 2: Insert custom_fields metadata for coins table
INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'coins'),
  'type',
  'Type',
  'select',
  TRUE,
  1,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'coins'),
  'mintlocation',
  'Mint Location',
  'select',
  TRUE,
  2,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'coins'),
  'mintyear',
  'Mint Year',
  'date',
  TRUE,
  3,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'coins'),
  'circulation',
  'Circulation',
  'text',
  TRUE,
  4,
  TRUE,
  FALSE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'coins'),
  'grade',
  'Grade',
  'text',
  TRUE,
  5,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'coins'),
  'face_value',
  'Face Value',
  'currency',
  FALSE,
  6,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'coins'),
  'estimated_value',
  'Estimated Value',
  'currency',
  FALSE,
  7,
  TRUE,
  TRUE;

-- Step 3: Insert custom_fields metadata for relics table
INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'relics'),
  'type',
  'Type',
  'select',
  TRUE,
  1,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'relics'),
  'origin',
  'Origin',
  'text',
  TRUE,
  2,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'relics'),
  'era',
  'Era',
  'text',
  TRUE,
  3,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'relics'),
  'condition',
  'Condition',
  'text',
  TRUE,
  4,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'relics'),
  'description',
  'Description',
  'textarea',
  FALSE,
  5,
  FALSE,
  FALSE;

-- Step 4: Insert custom_fields metadata for stamps table
INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'stamps'),
  'country',
  'Country',
  'text',
  TRUE,
  1,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'stamps'),
  'denomination',
  'Denomination',
  'text',
  TRUE,
  2,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'stamps'),
  'issueyear',
  'Issue Year',
  'text',
  TRUE,
  3,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'stamps'),
  'condition',
  'Condition',
  'text',
  TRUE,
  4,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'stamps'),
  'description',
  'Description',
  'textarea',
  FALSE,
  5,
  FALSE,
  FALSE;

-- Step 5: Insert custom_fields metadata for bunnykins table
INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'bunnykins'),
  'name',
  'Name',
  'text',
  TRUE,
  1,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'bunnykins'),
  'series',
  'Series',
  'text',
  TRUE,
  2,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'bunnykins'),
  'productionyear',
  'Production Year',
  'text',
  TRUE,
  3,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'bunnykins'),
  'condition',
  'Condition',
  'text',
  TRUE,
  4,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'bunnykins'),
  'description',
  'Description',
  'textarea',
  FALSE,
  5,
  FALSE,
  FALSE;

-- Step 6: Insert custom_fields metadata for comics table
INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'comics'),
  'title',
  'Title',
  'text',
  TRUE,
  1,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'comics'),
  'publisher',
  'Publisher',
  'select',
  TRUE,
  2,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'comics'),
  'series',
  'Series',
  'text',
  TRUE,
  3,
  TRUE,
  FALSE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'comics'),
  'issuenumber',
  'Issue Number',
  'text',
  TRUE,
  4,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'comics'),
  'publicationyear',
  'Publication Year',
  'text',
  TRUE,
  5,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'comics'),
  'grade',
  'Grade',
  'text',
  TRUE,
  6,
  TRUE,
  TRUE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'comics'),
  'condition',
  'Condition',
  'text',
  TRUE,
  7,
  TRUE,
  FALSE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'comics'),
  'variant',
  'Variant',
  'text',
  FALSE,
  8,
  TRUE,
  FALSE;

INSERT INTO custom_fields (table_id, field_name, field_label, field_type, is_required, display_order, show_in_table, show_in_mobile)
SELECT
  (SELECT id FROM custom_tables WHERE table_name = 'comics'),
  'description',
  'Description',
  'textarea',
  FALSE,
  9,
  FALSE,
  FALSE;

-- Step 7: Migrate lookup tables to custom_lookup_tables
INSERT INTO custom_lookup_tables (table_name, display_name, created_by, is_shared) VALUES
  ('lookup_cointypes', 'Coin Types', 1, TRUE),
  ('lookup_mintlocations', 'Mint Locations', 1, TRUE),
  ('lookup_relictypes', 'Relic Types', 1, TRUE),
  ('lookup_comicpublishers', 'Comic Publishers', 1, TRUE);

-- Step 8: Migrate lookup data to custom_lookup_values
-- Coin types
INSERT INTO custom_lookup_values (lookup_table_id, value_data, display_order)
SELECT
  (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_cointypes'),
  jsonb_build_object('id', ct.id, 'name', ct.name, 'face_value', ct.face_value),
  ct.id
FROM cointypes ct
ORDER BY ct.id;

-- Mint locations
INSERT INTO custom_lookup_values (lookup_table_id, value_data, display_order)
SELECT
  (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_mintlocations'),
  jsonb_build_object('id', ml.id, 'name', ml.name, 'city', ml.city, 'state', ml.state),
  ml.id
FROM mintlocations ml
ORDER BY ml.id;

-- Relic types
INSERT INTO custom_lookup_values (lookup_table_id, value_data, display_order)
SELECT
  (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_relictypes'),
  jsonb_build_object('id', rt.id, 'name', rt.name),
  rt.id
FROM relictypes rt
ORDER BY rt.id;

-- Comic publishers
INSERT INTO custom_lookup_values (lookup_table_id, value_data, display_order)
SELECT
  (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_comicpublishers'),
  jsonb_build_object('id', cp.id, 'name', cp.name),
  cp.id
FROM comicpublishers cp
ORDER BY cp.id;

-- Step 9: Update custom_fields to reference lookup tables
UPDATE custom_fields SET lookup_table_id = (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_cointypes')
WHERE table_id = (SELECT id FROM custom_tables WHERE table_name = 'coins') AND field_name = 'type';

UPDATE custom_fields SET lookup_table_id = (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_mintlocations')
WHERE table_id = (SELECT id FROM custom_tables WHERE table_name = 'coins') AND field_name = 'mintlocation';

UPDATE custom_fields SET lookup_table_id = (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_relictypes')
WHERE table_id = (SELECT id FROM custom_tables WHERE table_name = 'relics') AND field_name = 'type';

UPDATE custom_fields SET lookup_table_id = (SELECT id FROM custom_lookup_tables WHERE table_name = 'lookup_comicpublishers')
WHERE table_id = (SELECT id FROM custom_tables WHERE table_name = 'comics') AND field_name = 'publisher';

-- Step 10: Rename existing tables to new naming convention
ALTER TABLE coins RENAME TO custom_data_coins;
ALTER TABLE relics RENAME TO custom_data_relics;
ALTER TABLE stamps RENAME TO custom_data_stamps;
ALTER TABLE bunnykins RENAME TO custom_data_bunnykins;
ALTER TABLE comics RENAME TO custom_data_comics;

-- Step 11: Add created_by column to all renamed tables
-- Default to user ID 1 (admin) for existing records
ALTER TABLE custom_data_coins ADD COLUMN created_by INTEGER;
UPDATE custom_data_coins SET created_by = 1;
ALTER TABLE custom_data_coins ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE custom_data_coins ADD CONSTRAINT fk_coins_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_custom_data_coins_created_by ON custom_data_coins(created_by);

ALTER TABLE custom_data_relics ADD COLUMN created_by INTEGER;
UPDATE custom_data_relics SET created_by = 1;
ALTER TABLE custom_data_relics ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE custom_data_relics ADD CONSTRAINT fk_relics_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_custom_data_relics_created_by ON custom_data_relics(created_by);

-- Ensure relics has added_date column
ALTER TABLE custom_data_relics ADD COLUMN IF NOT EXISTS added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE custom_data_stamps ADD COLUMN created_by INTEGER;
UPDATE custom_data_stamps SET created_by = 1;
ALTER TABLE custom_data_stamps ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE custom_data_stamps ADD CONSTRAINT fk_stamps_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_custom_data_stamps_created_by ON custom_data_stamps(created_by);

-- Ensure stamps has added_date column
ALTER TABLE custom_data_stamps ADD COLUMN IF NOT EXISTS added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE custom_data_bunnykins ADD COLUMN created_by INTEGER;
UPDATE custom_data_bunnykins SET created_by = 1;
ALTER TABLE custom_data_bunnykins ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE custom_data_bunnykins ADD CONSTRAINT fk_bunnykins_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_custom_data_bunnykins_created_by ON custom_data_bunnykins(created_by);

-- Ensure bunnykins has added_date column
ALTER TABLE custom_data_bunnykins ADD COLUMN IF NOT EXISTS added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE custom_data_comics ADD COLUMN created_by INTEGER;
UPDATE custom_data_comics SET created_by = 1;
ALTER TABLE custom_data_comics ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE custom_data_comics ADD CONSTRAINT fk_comics_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_custom_data_comics_created_by ON custom_data_comics(created_by);

-- Step 12: Rename lookup tables (keep for now, mark as legacy)
-- We'll keep the old lookup tables but they won't be used by new code
-- They can be dropped in a future migration after verifying everything works
ALTER TABLE cointypes RENAME TO legacy_cointypes;
ALTER TABLE mintlocations RENAME TO legacy_mintlocations;
ALTER TABLE relictypes RENAME TO legacy_relictypes;
ALTER TABLE comicpublishers RENAME TO legacy_comicpublishers;
