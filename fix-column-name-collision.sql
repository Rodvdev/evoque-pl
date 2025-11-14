-- Fix Column Name Collision
-- Run this SQL directly in Neon's SQL Editor
-- This fixes the issue where column names exceed PostgreSQL's 63-character limit

-- Step 1: Find and drop ALL columns that match the pattern (including truncated ones)
DO $$ 
DECLARE
  col_record RECORD;
BEGIN
  -- Drop all matching columns from pages table
  FOR col_record IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'pages' 
    AND (
      column_name LIKE 'hero_scroll_effect_zoom_settings_border_radius_enabled_corners%'
      OR column_name LIKE 'hero_scroll_effect_zoom_settings_br_radius_en_corners%'
      OR column_name = 'hero_scroll_effect_zoom_settings_border_radius_enabled_corners_'
    )
  LOOP
    RAISE NOTICE 'Dropping column: %', col_record.column_name;
    EXECUTE format('ALTER TABLE "pages" DROP COLUMN IF EXISTS %I', col_record.column_name);
  END LOOP;
  
  -- Drop all matching columns from version table
  FOR col_record IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = '_pages_v' 
    AND (
      column_name LIKE 'version_hero_scroll_effect_zoom_settings_border_radius_enabled_corners%'
      OR column_name LIKE 'version_hero_scroll_effect_zoom_settings_br_radius_en_corners%'
      OR column_name = 'version_hero_scroll_effect_zoom_settings_border_radius_enabled_corners_'
    )
  LOOP
    RAISE NOTICE 'Dropping column from version table: %', col_record.column_name;
    EXECUTE format('ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS %I', col_record.column_name);
  END LOOP;
  
  RAISE NOTICE 'All conflicting columns have been dropped. Payload will recreate them with correct names.';
END $$;

-- Done! Restart your dev server and Payload will recreate the columns with the correct names.

