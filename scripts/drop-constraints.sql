-- Drop foreign key constraints that are causing issues
-- These constraints have names that exceed 63 characters

-- Drop constraints from pages_blocks_scroll table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Find and drop all foreign key constraints related to initial_background_image_id
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'pages_blocks_scroll' 
        AND constraint_type = 'FOREIGN KEY'
        AND (
            constraint_name LIKE '%title_scale_settings_title_animation_initial_background%'
            OR constraint_name LIKE '%title_scale_settings_title_animation_final_background%'
        )
    ) 
    LOOP
        RAISE NOTICE 'Dropping constraint: %', r.constraint_name;
        EXECUTE format('ALTER TABLE pages_blocks_scroll DROP CONSTRAINT IF EXISTS %I CASCADE', r.constraint_name);
    END LOOP;
    
    -- Find and drop all foreign key constraints from version table
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = '_pages_v_blocks_scroll' 
        AND constraint_type = 'FOREIGN KEY'
        AND (
            constraint_name LIKE '%title_scale_settings_title_animation_initial_background%'
            OR constraint_name LIKE '%title_scale_settings_title_animation_final_background%'
        )
    ) 
    LOOP
        RAISE NOTICE 'Dropping constraint from version table: %', r.constraint_name;
        EXECUTE format('ALTER TABLE _pages_v_blocks_scroll DROP CONSTRAINT IF EXISTS %I CASCADE', r.constraint_name);
    END LOOP;
    
    RAISE NOTICE 'All problematic constraints have been dropped.';
END $$;

