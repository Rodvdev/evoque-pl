import 'dotenv/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

const connectionString = process.env.DATABASE_URI || ''

if (!connectionString) {
  console.error('❌ DATABASE_URI not found in environment')
  process.exit(1)
}

async function fixColumns() {
  try {
    console.log('🔧 Fixing border radius columns in database...')
    
    // Create adapter without initializing Payload (which would try to sync schema)
    const adapter = postgresAdapter({
      pool: {
        connectionString,
      },
    })
    
    // Get the database connection
    await adapter.connect({ payload: null as any })
    const db = adapter
    
    // Create enum types if they don't exist
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "public"."tl" AS ENUM('0', '8', '16', '24', '32', '48', '64', '96');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `)
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "public"."tr" AS ENUM('0', '8', '16', '24', '32', '48', '64', '96');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `)
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "public"."br" AS ENUM('0', '8', '16', '24', '32', '48', '64', '96');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `)
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "public"."bl" AS ENUM('0', '8', '16', '24', '32', '48', '64', '96');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `)
    
    // Fix border radius columns in pages table
    await db.execute(sql`
      DO $$ 
      BEGIN
        -- Check if pages table exists and has numeric columns
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'pages' 
          AND column_name = 'hero_border_radius_top_left' 
          AND data_type = 'numeric'
        ) THEN
          RAISE NOTICE 'Converting numeric columns to enum types...';
          
          -- Convert numeric columns to text first, then to enum
          ALTER TABLE "pages" 
            ALTER COLUMN "hero_border_radius_top_left" TYPE text USING "hero_border_radius_top_left"::text,
            ALTER COLUMN "hero_border_radius_top_right" TYPE text USING "hero_border_radius_top_right"::text,
            ALTER COLUMN "hero_border_radius_bottom_right" TYPE text USING "hero_border_radius_bottom_right"::text,
            ALTER COLUMN "hero_border_radius_bottom_left" TYPE text USING "hero_border_radius_bottom_left"::text;
          
          -- Now convert to enum types
          ALTER TABLE "pages" 
            ALTER COLUMN "hero_border_radius_top_left" TYPE "tl" USING "hero_border_radius_top_left"::"tl",
            ALTER COLUMN "hero_border_radius_top_right" TYPE "tr" USING "hero_border_radius_top_right"::"tr",
            ALTER COLUMN "hero_border_radius_bottom_right" TYPE "br" USING "hero_border_radius_bottom_right"::"br",
            ALTER COLUMN "hero_border_radius_bottom_left" TYPE "bl" USING "hero_border_radius_bottom_left"::"bl";
          
          -- Set default values
          ALTER TABLE "pages" 
            ALTER COLUMN "hero_border_radius_top_left" SET DEFAULT '0'::"tl",
            ALTER COLUMN "hero_border_radius_top_right" SET DEFAULT '0'::"tr",
            ALTER COLUMN "hero_border_radius_bottom_right" SET DEFAULT '0'::"br",
            ALTER COLUMN "hero_border_radius_bottom_left" SET DEFAULT '0'::"bl";
          
          RAISE NOTICE 'Successfully converted border radius columns!';
        ELSE
          RAISE NOTICE 'Columns are already enum types or table does not exist.';
        END IF;
      END $$;
    `)
    
    // Fix border radius columns in version table if it exists
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = '_pages_v' 
          AND column_name = 'version_hero_border_radius_top_left' 
          AND data_type = 'numeric'
        ) THEN
          RAISE NOTICE 'Converting numeric columns in version table to enum types...';
          
          -- Convert numeric columns to text first, then to enum
          ALTER TABLE "_pages_v" 
            ALTER COLUMN "version_hero_border_radius_top_left" TYPE text USING "version_hero_border_radius_top_left"::text,
            ALTER COLUMN "version_hero_border_radius_top_right" TYPE text USING "version_hero_border_radius_top_right"::text,
            ALTER COLUMN "version_hero_border_radius_bottom_right" TYPE text USING "version_hero_border_radius_bottom_right"::text,
            ALTER COLUMN "version_hero_border_radius_bottom_left" TYPE text USING "version_hero_border_radius_bottom_left"::text;
          
          -- Now convert to enum types
          ALTER TABLE "_pages_v" 
            ALTER COLUMN "version_hero_border_radius_top_left" TYPE "tl" USING "version_hero_border_radius_top_left"::"tl",
            ALTER COLUMN "version_hero_border_radius_top_right" TYPE "tr" USING "version_hero_border_radius_top_right"::"tr",
            ALTER COLUMN "version_hero_border_radius_bottom_right" TYPE "br" USING "version_hero_border_radius_bottom_right"::"br",
            ALTER COLUMN "version_hero_border_radius_bottom_left" TYPE "bl" USING "version_hero_border_radius_bottom_left"::"bl";
          
          -- Set default values
          ALTER TABLE "_pages_v" 
            ALTER COLUMN "version_hero_border_radius_top_left" SET DEFAULT '0'::"tl",
            ALTER COLUMN "version_hero_border_radius_top_right" SET DEFAULT '0'::"tr",
            ALTER COLUMN "version_hero_border_radius_bottom_right" SET DEFAULT '0'::"br",
            ALTER COLUMN "version_hero_border_radius_bottom_left" SET DEFAULT '0'::"bl";
          
          RAISE NOTICE 'Successfully converted version table border radius columns!';
        END IF;
      END $$;
    `)
    
    console.log('✅ Border radius columns fixed successfully!')
    console.log('You can now restart your dev server.')
    await adapter.pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error fixing columns:', error)
    process.exit(1)
  }
}

fixColumns()

