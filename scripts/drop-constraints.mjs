import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { Client } = pg

async function dropConstraints() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI || '',
  })

  try {
    await client.connect()
    console.log('🔌 Connected to database')

    // Find and drop the problematic constraint
    const constraintName = 'pages_blocks_scroll_title_scale_settings_title_animation_initia'
    
    // First, let's find all constraints that match this pattern
    const query = `
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'pages_blocks_scroll' 
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE 'pages_blocks_scroll_title_scale_settings_title_animation_initial_background%'
    `
    
    const result = await client.query(query)
    console.log('Found constraints:', result.rows)
    
    // Drop each constraint
    for (const row of result.rows) {
      const dropQuery = `ALTER TABLE pages_blocks_scroll DROP CONSTRAINT IF EXISTS "${row.constraint_name}" CASCADE`
      console.log(`Dropping constraint: ${row.constraint_name}`)
      await client.query(dropQuery)
      console.log(`✅ Dropped: ${row.constraint_name}`)
    }
    
    // Also check the version table
    const versionQuery = `
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = '_pages_v_blocks_scroll' 
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%title_scale_settings_title_animation_initial_background%'
    `
    
    const versionResult = await client.query(versionQuery)
    console.log('Found version table constraints:', versionResult.rows)
    
    for (const row of versionResult.rows) {
      const dropQuery = `ALTER TABLE _pages_v_blocks_scroll DROP CONSTRAINT IF EXISTS "${row.constraint_name}" CASCADE`
      console.log(`Dropping constraint: ${row.constraint_name}`)
      await client.query(dropQuery)
      console.log(`✅ Dropped: ${row.constraint_name}`)
    }
    
    console.log('\n✅ All constraints dropped successfully!')
    console.log('You can now restart the server to push the schema again.')
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await client.end()
  }
}

dropConstraints().catch(console.error)

