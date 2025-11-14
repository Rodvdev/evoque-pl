import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

// Try to find pg in node_modules
let pg
try {
  pg = require('pg')
} catch (e) {
  // Try pnpm structure
  try {
    const pgPath = resolve(__dirname, 'node_modules/.pnpm/pg@8.16.3/node_modules/pg')
    pg = require(pgPath)
  } catch (e2) {
    console.error('Could not find pg package. Please install it: pnpm add pg')
    process.exit(1)
  }
}
const { Client } = pg

// Load .env files manually
function loadEnv() {
  const envPaths = ['.env.local', '.env']
  const env = {}
  
  for (const envPath of envPaths) {
    try {
      const content = readFileSync(resolve(process.cwd(), envPath), 'utf-8')
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          const value = match[2].trim().replace(/^["']|["']$/g, '')
          if (!process.env[key]) {
            process.env[key] = value
          }
        }
      })
    } catch (e) {
      // File doesn't exist, continue
    }
  }
}

loadEnv()

const connectionString = process.env.DATABASE_URI || ''

if (!connectionString) {
  console.error('❌ DATABASE_URI not found in environment')
  process.exit(1)
}

// Extract database connection details
const url = new URL(connectionString.replace(/^postgresql/, 'postgres'))

const dbName = url.pathname.slice(1)
const dbHost = url.hostname
const dbPort = url.port || '5432'
const dbUser = url.username
const dbPassword = url.password

// SQL to fix border radius columns
const fixSQL = `
-- Create enum types if they don't exist
DO $$ BEGIN
  CREATE TYPE "public"."tl" AS ENUM('0', '8', '16', '24', '32', '48', '64', '96');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."tr" AS ENUM('0', '8', '16', '24', '32', '48', '64', '96');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."br" AS ENUM('0', '8', '16', '24', '32', '48', '64', '96');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."bl" AS ENUM('0', '8', '16', '24', '32', '48', '64', '96');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Fix border radius columns in pages table
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

-- Fix border radius columns in version table if it exists
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
`

console.log('🔧 Fixing border radius columns in database...')
console.log(`Database: ${dbName}`)
console.log(`Host: ${dbHost}`)

// Use pg client directly
const client = new Client({
  host: dbHost,
  port: parseInt(dbPort),
  user: dbUser,
  password: dbPassword,
  database: dbName,
  connectionString: connectionString,
})

try {
  await client.connect()
  console.log('Connected to database')
  
  await client.query(fixSQL)
  
  console.log('\n✅ Border radius columns fixed successfully!')
  console.log('You can now restart your dev server.')
  await client.end()
  process.exit(0)
} catch (error) {
  console.error('❌ Error fixing columns:', error.message)
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('\nThe pg package is not available. Please run this SQL manually in your database client:')
    console.log('=' .repeat(60))
    console.log(fixSQL)
    console.log('=' .repeat(60))
  }
  await client.end().catch(() => {})
  process.exit(1)
}

