#!/usr/bin/env node

/**
 * Script to help diagnose and fix database naming issues with hero fields
 * 
 * This script will:
 * 1. Drop all existing database objects (tables, enums, sequences)
 * 2. Suggest restarting the Payload server to regenerate schema
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env files
function loadEnv() {
  const envPaths = ['.env.local', '.env']
  
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

const url = new URL(connectionString.replace(/^postgresql/, 'postgres'))
const dbName = url.pathname.slice(1)
const dbHost = url.hostname
const dbPort = url.port || '5432'
const dbUser = url.username
const dbPassword = url.password

console.log('🔍 Verifying hero field configuration...\n')

// Read the hero config to verify dbName settings
try {
  const heroConfigPath = resolve(__dirname, '../src/heros/config.ts')
  const configContent = readFileSync(heroConfigPath, 'utf-8')
  
  const expectedDbNames = [
    { group: 'borderRadius', dbName: 'brRadius' },
    { group: 'scrollEffect', dbName: 'scroll' },
    { group: 'zoomSettings', dbName: 'zoom' },
    { group: 'borderRadius (in zoom)', dbName: 'brRadius' },
    { group: 'enabledCorners', dbName: 'enCorners' },
  ]
  
  console.log('✅ Checking dbName configuration:')
  for (const { group, dbName: expectedName } of expectedDbNames) {
    const pattern = new RegExp(`${group}[^}]*dbName:\\s*['"]${expectedName}['"]`, 's')
    if (pattern.test(configContent)) {
      console.log(`   ✓ ${group}: dbName="${expectedName}"`)
    } else {
      console.log(`   ✗ ${group}: dbName="${expectedName}" NOT FOUND`)
    }
  }
  
  console.log('\n📋 Expected column names (with dbName):')
  console.log('   hero_brRadius_tl')
  console.log('   hero_brRadius_tr')
  console.log('   hero_scroll_zoom_brRadius_enCorners_tl')
  console.log('   hero_scroll_zoom_brRadius_enCorners_tr')
  console.log('   hero_scroll_zoom_brRadius_enCorners_br')
  console.log('   hero_scroll_zoom_brRadius_enCorners_bl')
  
  console.log('\n⚠️  Current issue:')
  console.log('   Payload is creating enum types with short names (tl, tr, etc.)')
  console.log('   but column names are still using full paths.')
  console.log('   This suggests cached schema or a Payload limitation.')
  
  console.log('\n🔧 Solution:')
  console.log('   1. Drop all database objects (run this script with --drop flag)')
  console.log('   2. Restart your Payload server')
  console.log('   3. Payload will regenerate the schema with correct column names')
  
} catch (error) {
  console.error('Error reading hero config:', error.message)
}

// Drop database objects if --drop flag is provided
if (process.argv.includes('--drop')) {
  console.log('\n🗑️  Dropping all database objects...')
  
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
  
  const dropSQL = `
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
      console.log('\n✅ Database objects dropped successfully!')
      console.log('\n📝 Next steps:')
      console.log('   1. Restart your Payload server')
      console.log('   2. Payload will regenerate the schema with correct column names')
      process.exit(0)
    } else {
      console.error(`\n❌ psql exited with code ${code}`)
      process.exit(1)
    }
  })
  
  psqlProcess.on('error', (error) => {
    if (error.code === 'ENOENT') {
      console.error('❌ psql command not found')
      console.log('\nPlease install PostgreSQL client tools')
    } else {
      console.error('❌ Error:', error.message)
    }
    process.exit(1)
  })
} else {
  console.log('\n💡 To drop database objects, run:')
  console.log('   node scripts/fix-hero-db-names.mjs --drop')
}

