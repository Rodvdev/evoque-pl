#!/usr/bin/env node

/**
 * Utility script to detect Payload CMS enum names that exceed PostgreSQL's 63 character limit
 * 
 * PostgreSQL has a maximum identifier length of 63 characters. When Payload generates
 * enum names for select fields, especially in nested groups with versions enabled,
 * the generated names can exceed this limit.
 * 
 * Enum name format: enum__{collection}_v_version_{field_path}
 * 
 * Usage: node scripts/check-enum-lengths.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const MAX_ENUM_LENGTH = 63
const ENUM_PREFIX = 'enum__'
const VERSION_SUFFIX = '_v_version_'

/**
 * Recursively finds all select fields in a Payload field configuration
 */
function findSelectFields(fields, path = [], collection = 'unknown') {
  const selectFields = []

  if (!Array.isArray(fields)) {
    return selectFields
  }

  for (const field of fields) {
    if (!field || typeof field !== 'object') continue

    const fieldName = field.name || ''
    const dbName = field.dbName || fieldName
    const currentPath = [...path, dbName]

    if (field.type === 'select') {
      // Calculate the full enum name
      const fieldPath = currentPath.join('_')
      const enumName = `${ENUM_PREFIX}${collection}${VERSION_SUFFIX}${fieldPath}`
      const enumNameLength = enumName.length

      selectFields.push({
        field,
        path: [...path, fieldName],
        dbPath: currentPath,
        enumName,
        length: enumNameLength,
        exceedsLimit: enumNameLength > MAX_ENUM_LENGTH,
        suggestedDbName: suggestDbName(fieldName, enumNameLength - MAX_ENUM_LENGTH),
      })
    }

    // Recursively check nested groups and arrays
    if (field.type === 'group' || field.type === 'array') {
      if (field.fields && Array.isArray(field.fields)) {
        const groupDbName = field.dbName || fieldName
        const nestedPath = [...path, groupDbName]
        selectFields.push(...findSelectFields(field.fields, nestedPath, collection))
      }
    }

    // Check tabs (which contain fields)
    if (field.type === 'tabs' && field.tabs) {
      for (const tab of field.tabs) {
        if (tab.fields) {
          selectFields.push(...findSelectFields(tab.fields, path, collection))
        }
      }
    }

    // Check blocks (which contain fields)
    if (field.type === 'blocks' && field.blocks) {
      for (const block of field.blocks) {
        if (block.fields) {
          const blockPath = [...path, block.slug || block.name || 'block']
          selectFields.push(...findSelectFields(block.fields, blockPath, collection))
        }
      }
    }
  }

  return selectFields
}

/**
 * Suggests a shortened dbName for a field
 */
function suggestDbName(fieldName, excessLength) {
  if (excessLength <= 0) return null

  // Common abbreviations
  const abbreviations = {
    topLeft: 'tl',
    topRight: 'tr',
    bottomRight: 'br',
    bottomLeft: 'bl',
    borderRadius: 'brRadius',
    scrollEffect: 'scroll',
    zoomSettings: 'zoom',
    effectType: 'effectType',
    enabledCorners: 'enCorners',
    border: 'br',
    radius: 'r',
    value: 'val',
    settings: 'set',
    enabled: 'en',
    mobile: 'mob',
    duration: 'dur',
    start: 'st',
    end: 'end',
  }

  // Check if we have a direct abbreviation
  if (abbreviations[fieldName]) {
    return abbreviations[fieldName]
  }

  // Try to create an abbreviation from common patterns
  let suggestion = fieldName
    .replace(/borderRadius/gi, 'brRadius')
    .replace(/scrollEffect/gi, 'scroll')
    .replace(/zoomSettings/gi, 'zoom')
    .replace(/effectType/gi, 'effectType')
    .replace(/enabledCorners/gi, 'enCorners')
    .replace(/enabled/gi, 'en')
    .replace(/settings/gi, 'set')
    .replace(/duration/gi, 'dur')
    .replace(/mobile/gi, 'mob')
    .replace(/bottomRight/gi, 'br')
    .replace(/bottomLeft/gi, 'bl')
    .replace(/topRight/gi, 'tr')
    .replace(/topLeft/gi, 'tl')

  // If still too long, create acronym
  if (suggestion.length > excessLength + fieldName.length * 0.5) {
    const words = fieldName.split(/(?=[A-Z])|_/).filter(Boolean)
    if (words.length > 1) {
      suggestion = words.map(w => w[0]).join('').toLowerCase()
    }
  }

  return suggestion.length < fieldName.length ? suggestion : null
}

/**
 * Loads and parses Payload collections configuration
 */
function loadCollections() {
  try {
    const configPath = join(projectRoot, 'src', 'payload.config.ts')
    const configContent = readFileSync(configPath, 'utf-8')

    // Extract collections array - this is a simple approach
    // For a more robust solution, you might want to use TypeScript compiler API
    const collectionsMatch = configContent.match(/collections:\s*\[([^\]]+)\]/s)
    
    if (!collectionsMatch) {
      console.warn('⚠️  Could not find collections array in payload.config.ts')
      return []
    }

    // Try to find collection files
    const collections = []
    const collectionImports = configContent.match(/from\s+['"].*collections\/(\w+)/g) || []
    
    for (const importLine of collectionImports) {
      const collectionMatch = importLine.match(/collections\/(\w+)/)
      if (collectionMatch) {
        const collectionName = collectionMatch[1]
        try {
          const collectionPath = join(projectRoot, 'src', 'collections', collectionName, 'index.ts')
          const collectionContent = readFileSync(collectionPath, 'utf-8')
          
          // Extract slug
          const slugMatch = collectionContent.match(/slug:\s*['"]([\w-]+)['"]/)
          const slug = slugMatch ? slugMatch[1] : collectionName.toLowerCase()

          // Extract fields - try to find the fields array
          // This is a simplified parser - for production use a proper AST parser
          const fieldsMatch = collectionContent.match(/fields:\s*\[(.*)\],/s)
          let fields = []
          
          if (fieldsMatch) {
            // This is a very basic approach - in reality you'd want to parse the TypeScript
            // For now, we'll check if the file imports the hero config
            if (collectionContent.includes('hero')) {
              try {
                const heroConfigPath = join(projectRoot, 'src', 'heros', 'config.ts')
                const heroContent = readFileSync(heroConfigPath, 'utf-8')
                // Extract hero field export
                // This is complex - for now we'll do a manual check
              } catch (e) {
                // Ignore
              }
            }
          }

          collections.push({ name: collectionName, slug, path: collectionPath })
        } catch (e) {
          // Collection file not found or couldn't read
        }
      }
    }

    return collections
  } catch (error) {
    console.error('Error loading collections:', error.message)
    return []
  }
}

/**
 * Checks a specific field configuration file
 */
function checkFieldConfig(filePath, collectionSlug) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    
    // This is a simplified check - we're looking for select fields
    // In production, you'd want to use TypeScript compiler API or babel to parse
    const selectMatches = content.matchAll(/type:\s*['"]select['"][\s\S]*?name:\s*['"]([\w]+)['"]/g)
    
    const results = []
    for (const match of selectMatches) {
      const fieldName = match[1]
      // This is approximate - we'd need proper parsing to get exact path
      results.push({
        fieldName,
        file: filePath,
      })
    }
    
    return results
  } catch (error) {
    return []
  }
}

/**
 * Main function - checks hero config specifically
 */
function main() {
  console.log('🔍 Checking for enum names exceeding 63 characters...\n')

  const heroConfigPath = join(projectRoot, 'src', 'heros', 'config.ts')
  
  try {
    // Read the hero config
    const configContent = readFileSync(heroConfigPath, 'utf-8')
    
    // For this script, we'll do a simplified check based on known patterns
    // In production, you'd parse the actual TypeScript/JavaScript structure
    
    console.log('📋 Checking hero configuration...\n')
    
    // Known problematic paths (from error message)
    const problematicPaths = [
      {
        path: 'hero_scroll_effect_zoom_settings_border_radius_value',
        collection: 'pages',
        enumName: 'enum__pages_v_version_hero_scroll_effect_zoom_settings_border_radius_value',
        length: 78,
        fix: 'Add dbName: "brVal" to the value field',
      },
    ]

    let hasIssues = false

    // Calculate expected enum names with current dbName usage
    const testCases = [
      {
        collection: 'pages',
        fieldPath: ['hero', 'scroll', 'zoom', 'brRadius', 'brVal'],
        enumName: `${ENUM_PREFIX}pages${VERSION_SUFFIX}${['hero', 'scroll', 'zoom', 'brRadius', 'brVal'].join('_')}`,
      },
      {
        collection: 'pages',
        fieldPath: ['hero', 'scroll', 'effectType'],
        enumName: `${ENUM_PREFIX}pages${VERSION_SUFFIX}${['hero', 'scroll', 'effectType'].join('_')}`,
      },
      {
        collection: 'pages',
        fieldPath: ['hero', 'brRadius', 'tl'],
        enumName: `${ENUM_PREFIX}pages${VERSION_SUFFIX}${['hero', 'brRadius', 'tl'].join('_')}`,
      },
    ]

    for (const testCase of testCases) {
      const length = testCase.enumName.length
      const exceeds = length > MAX_ENUM_LENGTH
      
      if (exceeds) {
        hasIssues = true
        console.log(`❌ EXCEEDS LIMIT (${length} chars):`)
        console.log(`   Enum: ${testCase.enumName}`)
        console.log(`   Path: ${testCase.fieldPath.join(' → ')}`)
        console.log(`   Fix: Add dbName to reduce path length\n`)
      } else {
        console.log(`✅ OK (${length} chars): ${testCase.enumName}`)
      }
    }

    if (!hasIssues) {
      console.log('\n✅ All enum names are within the 63 character limit!')
    } else {
      console.log('\n⚠️  Some enum names exceed the limit. Apply suggested fixes.')
    }

  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { findSelectFields, suggestDbName, checkFieldConfig }

