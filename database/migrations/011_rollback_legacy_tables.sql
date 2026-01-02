-- ================================================
-- Migration 011: Rollback Legacy Tables
-- ================================================
-- This migration removes all legacy table data and structure
-- to start fresh with the dynamic table system.
--
-- WARNING: This will delete ALL data from the 5 built-in tables:
-- - coins, relics, stamps, bunnykins, comics
-- ================================================

BEGIN;

-- Drop all legacy physical tables (both old and migrated names)
DROP TABLE IF EXISTS custom_data_coins CASCADE;
DROP TABLE IF EXISTS custom_data_relics CASCADE;
DROP TABLE IF EXISTS custom_data_stamps CASCADE;
DROP TABLE IF EXISTS custom_data_bunnykins CASCADE;
DROP TABLE IF EXISTS custom_data_comics CASCADE;

DROP TABLE IF EXISTS coins CASCADE;
DROP TABLE IF EXISTS relics CASCADE;
DROP TABLE IF EXISTS stamps CASCADE;
DROP TABLE IF EXISTS bunnykins CASCADE;
DROP TABLE IF EXISTS comics CASCADE;

-- Drop all legacy lookup tables
DROP TABLE IF EXISTS lookup_cointypes CASCADE;
DROP TABLE IF EXISTS lookup_mintlocations CASCADE;
DROP TABLE IF EXISTS lookup_relictypes CASCADE;
DROP TABLE IF EXISTS lookup_comicpublishers CASCADE;

DROP TABLE IF EXISTS cointypes CASCADE;
DROP TABLE IF EXISTS mintlocations CASCADE;
DROP TABLE IF EXISTS relictypes CASCADE;
DROP TABLE IF EXISTS comicpublishers CASCADE;

-- Remove metadata for the 5 legacy tables from custom_tables
-- (This will cascade delete from custom_fields and table_permissions)
DELETE FROM custom_tables
WHERE table_name IN ('coins', 'relics', 'stamps', 'bunnykins', 'comics');

-- Remove legacy lookup table metadata
DELETE FROM custom_lookup_tables
WHERE table_name IN ('lookup_cointypes', 'lookup_mintlocations', 'lookup_relictypes', 'lookup_comicpublishers');

COMMIT;

-- Verification query (run manually to check)
-- SELECT table_name FROM custom_tables;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%coin%' OR table_name LIKE '%relic%' OR table_name LIKE '%stamp%' OR table_name LIKE '%bunnykin%' OR table_name LIKE '%comic%';
