import { getPayload } from 'payload'
import configPromise from '../src/payload.config.ts'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Handle both promise and direct config
const config = await (typeof configPromise === 'function' ? configPromise() : configPromise)

/**
 * Migration script to convert old text-based background fields to new group-based structure
 * 
 * This script:
 * 1. Finds all pages with title-scale-scroll blocks
 * 2. Converts old initialBackground/finalBackground text fields to new group structure
 * 3. Saves the updated data
 */

async function migrateBackgroundFields() {
  try {
    console.log('🔄 Starting background fields migration...')
    
    const payload = await getPayload({ config })
    
    // Find all pages
    const { docs: pages } = await payload.find({
      collection: 'pages',
      limit: 1000,
      depth: 0,
    })
    
    let migratedCount = 0
    
    for (const page of pages) {
      if (!page.layout || !Array.isArray(page.layout)) continue
      
      let pageUpdated = false
      const updatedLayout = page.layout.map((block) => {
        if (block.blockType !== 'scroll' || block.variant !== 'title-scale-scroll') {
          return block
        }
        
        const titleScaleSettings = block.titleScaleSettings || {}
        const titleAnimation = titleScaleSettings.titleAnimation || {}
        
        // Check if we need to migrate
        const needsMigration = 
          (typeof titleAnimation.initialBackground === 'string') ||
          (typeof titleAnimation.finalBackground === 'string') ||
          (titleAnimation.cloudBackground !== undefined)
        
        if (!needsMigration) {
          return block
        }
        
        console.log(`  Migrating page: ${page.id} (${page.slug || 'no slug'})`)
        pageUpdated = true
        
        // Migrate initialBackground
        let initialBackground = titleAnimation.initialBackground
        if (typeof initialBackground === 'string') {
          // Convert text gradient to group structure
          initialBackground = {
            type: 'GRADIENT',
            gradient: initialBackground,
            opacity: 1,
          }
        } else if (!initialBackground) {
          // Default gradient
          initialBackground = {
            type: 'GRADIENT',
            gradient: 'linear-gradient(135deg, #0A1F44 0%, #1a3a6b 50%, #2c5aa0 100%)',
            opacity: 1,
          }
        }
        
        // Migrate finalBackground
        let finalBackground = titleAnimation.finalBackground
        if (typeof finalBackground === 'string') {
          // Convert text gradient to group structure
          finalBackground = {
            type: 'GRADIENT',
            gradient: finalBackground,
            opacity: 1,
          }
        } else if (!finalBackground) {
          // Default gradient
          finalBackground = {
            type: 'GRADIENT',
            gradient: 'linear-gradient(to bottom right, #eff6ff, #ffffff)',
            opacity: 1,
          }
        }
        
        // Remove cloudBackground (deprecated)
        const { cloudBackground, ...restTitleAnimation } = titleAnimation
        
        return {
          ...block,
          titleScaleSettings: {
            ...titleScaleSettings,
            titleAnimation: {
              ...restTitleAnimation,
              initialBackground,
              finalBackground,
            },
          },
        }
      })
      
      if (pageUpdated) {
        await payload.update({
          collection: 'pages',
          id: page.id,
          data: {
            layout: updatedLayout,
          },
        })
        migratedCount++
        console.log(`  ✅ Migrated page: ${page.id}`)
      }
    }
    
    console.log(`\n✅ Migration complete! Migrated ${migratedCount} page(s).`)
    console.log('📝 You can now safely push the schema changes.')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateBackgroundFields()

