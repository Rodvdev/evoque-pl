import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

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

// Use psql if available, otherwise provide SQL commands
import { spawn } from 'child_process'

// Extract database connection details
const url = new URL(connectionString.replace(/^postgresql/, 'postgres'))

const dbName = url.pathname.slice(1)
const dbHost = url.hostname
const dbPort = url.port || '5432'
const dbUser = url.username
const dbPassword = url.password

// SQL to drop everything
const dropSQL = `
-- Drop all tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public."' || r.tablename || '" CASCADE';
    END LOOP;
    
    -- Drop all enums
    FOR r IN (
        SELECT typname 
        FROM pg_type 
        WHERE typtype = 'e' 
        AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) 
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS public."' || r.typname || '" CASCADE';
    END LOOP;
    
    -- Drop all sequences
    FOR r IN (
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    ) 
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public."' || r.sequence_name || '" CASCADE';
    END LOOP;
END $$;
`

console.log('Dropping all tables, enums, and sequences...')
console.log(`Database: ${dbName}`)
console.log(`Host: ${dbHost}`)

// Find psql in common locations
let psqlPath = 'psql'
const possiblePaths = [
  'psql', // In PATH
  '/opt/homebrew/opt/libpq/bin/psql',
  '/usr/local/opt/libpq/bin/psql',
  '/usr/bin/psql',
]

for (const path of possiblePaths) {
  if (path === 'psql' || existsSync(path)) {
    psqlPath = path
    break
  }
}

// Use psql if available
const psqlProcess = spawn(psqlPath, [
  '-h', dbHost,
  '-p', dbPort,
  '-U', dbUser,
  '-d', dbName,
  '-c', dropSQL
], {
  env: { ...process.env, PGPASSWORD: dbPassword },
  stdio: 'inherit'
})

psqlProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All database objects dropped successfully!')
    console.log('You can now run: npm run payload migrate')
    process.exit(0)
  } else {
    console.error(`\n❌ psql exited with code ${code}`)
    console.log('\nIf psql is not available, please run this SQL manually:')
    console.log('=' .repeat(60))
    console.log(dropSQL)
    console.log('=' .repeat(60))
    process.exit(1)
  }
})

psqlProcess.on('error', (error) => {
  if (error.code === 'ENOENT') {
    console.error('❌ psql command not found')
    console.log('\nPlease install PostgreSQL client tools or run this SQL manually:')
    console.log('=' .repeat(60))
    console.log(dropSQL)
    console.log('=' .repeat(60))
  } else {
    console.error('❌ Error:', error.message)
  }
  process.exit(1)
})

