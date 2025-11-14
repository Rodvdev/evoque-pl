#!/usr/bin/env node

/**
 * Utility script to detect Payload CMS enum names that exceed PostgreSQL's 63 character limit
 * 
 * PostgreSQL has a maximum identifier length of 63 characters. When Payload generates
 * enum names for select fields, especially in nested groups with versions enabled,
 * the generated names can exceed this limit.
 * 
 * Enum name formats:
 * - Collection fields: enum__{collection}_v_version_{field_path}
 * - Block fields: enum_{collection}_blocks_{block_slug}_{field_path}
 * 
 * Usage: node scripts/check-enum-lengths.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const MAX_ENUM_LENGTH = 63
const ENUM_PREFIX_COLLECTION = 'enum__'
const ENUM_PREFIX_BLOCK = 'enum_'
const VERSION_SUFFIX = '_v_version_'

/**
 * Converts camelCase to snake_case
 */
function toSnakeCase(str) {
  if (!str) return ''
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
}

/**
 * Recursively finds all select fields and calculates enum names
 * This function works with actual field objects from Payload configs
 */
function findSelectFieldsRecursive(fields, path = [], collection = 'unknown', isBlock = false, blockSlug = '') {
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
      // Calculate enum name based on context
      let enumName
      if (isBlock) {
        // Block field enum format: enum_{collection}_blocks_{block_slug}_{field_path}
        // Field path uses snake_case versions of dbNames
        const fieldPath = currentPath.map(toSnakeCase).join('_')
        enumName = `${ENUM_PREFIX_BLOCK}${collection}_blocks_${blockSlug}_${fieldPath}`
      } else {
        // Collection field enum format: enum__{collection}_v_version_{field_path}
        const fieldPath = currentPath.map(toSnakeCase).join('_')
        enumName = `${ENUM_PREFIX_COLLECTION}${collection}${VERSION_SUFFIX}${fieldPath}`
      }
      
      const enumNameLength = enumName.length
      const exceedsLimit = enumNameLength > MAX_ENUM_LENGTH
      
      selectFields.push({
        field,
        path: [...path, fieldName],
        dbPath: currentPath,
        enumName,
        length: enumNameLength,
        exceedsLimit,
        isBlock,
        blockSlug: isBlock ? blockSlug : null,
        suggestedDbName: exceedsLimit ? suggestDbName(fieldName, enumNameLength - MAX_ENUM_LENGTH) : null,
      })
    }
    
    // Recursively check nested groups and arrays
    if (field.type === 'group' || field.type === 'array') {
      if (field.fields && Array.isArray(field.fields)) {
        const groupDbName = field.dbName || fieldName
        const nestedPath = [...path, groupDbName]
        selectFields.push(...findSelectFieldsRecursive(
          field.fields,
          nestedPath,
          collection,
          isBlock,
          blockSlug
        ))
      }
    }
    
    // Check tabs (which contain fields)
    if (field.type === 'tabs' && field.tabs) {
      for (const tab of field.tabs) {
        if (tab.fields) {
          selectFields.push(...findSelectFieldsRecursive(
            tab.fields,
            path,
            collection,
            isBlock,
            blockSlug
          ))
        }
      }
    }
    
    // Check blocks (which contain fields)
    if (field.type === 'blocks' && field.blocks) {
      for (const block of field.blocks) {
        if (block.fields) {
          const blockSlugName = block.slug || block.name || 'block'
          selectFields.push(...findSelectFieldsRecursive(
            block.fields,
            [],
            collection,
            true,
            blockSlugName
          ))
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
    titleScaleSettings: 'titleScale',
    titleAnimation: 'titleAnim',
    initialBackground: 'initBg',
    finalBackground: 'finalBg',
    background: 'bg',
    animation: 'anim',
    variant: 'var',
    button: 'btn',
    alignment: 'align',
  }
  
  // Check if we have a direct abbreviation
  if (abbreviations[fieldName]) {
    return abbreviations[fieldName]
  }
  
  // Try to create an abbreviation from common patterns
  let suggestion = fieldName
    .replace(/titleScaleSettings/gi, 'titleScale')
    .replace(/titleAnimation/gi, 'titleAnim')
    .replace(/initialBackground/gi, 'initBg')
    .replace(/finalBackground/gi, 'finalBg')
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
    .replace(/background/gi, 'bg')
    .replace(/animation/gi, 'anim')
    .replace(/variant/gi, 'var')
    .replace(/button/gi, 'btn')
    .replace(/alignment/gi, 'align')
  
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
 * Extracts field structure from source code using regex patterns
 * This is a simplified parser - for production use TypeScript compiler API
 */
function extractFieldStructure(content, knownFields = {}) {
  const fields = []
  
  // Extract field definitions
  // Pattern: { name: 'fieldName', type: 'select', dbName: '...', ... }
  const fieldPattern = /\{\s*name:\s*['"]([^'"]+)['"][\s\S]*?type:\s*['"]([^'"]+)['"][\s\S]*?\}/g
  let match
  
  while ((match = fieldPattern.exec(content)) !== null) {
    const fieldText = match[0]
    const fieldName = match[1]
    const fieldType = match[2]
    
    // Extract dbName
    const dbNameMatch = fieldText.match(/dbName:\s*['"]([^'"]+)['"]/)
    const dbName = dbNameMatch ? dbNameMatch[1] : fieldName
    
    const field = {
      name: fieldName,
      type: fieldType,
      dbName,
    }
    
    // Check if this field references a known field array (like createBackgroundFields)
    const fieldsRefMatch = fieldText.match(/fields:\s*(\w+)\s*\(\)/)
    if (fieldsRefMatch && knownFields[fieldsRefMatch[1]]) {
      field.fields = knownFields[fieldsRefMatch[1]]
    } else {
      // Try to extract inline fields
      const fieldsMatch = fieldText.match(/fields:\s*\[([\s\S]*?)\]/)
      if (fieldsMatch) {
        // Recursively extract nested fields
        field.fields = extractFieldStructure(fieldsMatch[1], knownFields)
      }
    }
    
    // Extract blocks array
    if (fieldType === 'blocks') {
      const blocksMatch = fieldText.match(/blocks:\s*\[([^\]]+)\]/s)
      if (blocksMatch) {
        const blockRefs = blocksMatch[1].match(/(\w+)/g) || []
        field.blocks = blockRefs.map(ref => ({ 
          name: ref, 
          slug: ref.replace(/Block$/, '').toLowerCase() 
        }))
      }
    }
    
    fields.push(field)
  }
  
  return fields
}

/**
 * Loads block configurations and extracts their field structures
 */
function loadBlocks() {
  const blocksDir = join(projectRoot, 'src', 'blocks')
  const blocks = []
  
  try {
    const entries = readdirSync(blocksDir, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const configPath = join(blocksDir, entry.name, 'config.ts')
        try {
          if (statSync(configPath).isFile()) {
            const content = readFileSync(configPath, 'utf-8')
            
            // Extract slug
            const slugMatch = content.match(/slug:\s*['"]([^'"]+)['"]/)
            const slug = slugMatch ? slugMatch[1] : entry.name.toLowerCase()
            
            // Extract known field arrays (like createBackgroundFields)
            const knownFields = {}
            const fieldArrayPattern = /const\s+(\w+)\s*=\s*\(\)\s*=>\s*\[([\s\S]*?)\]\s*as\s*Field\[\]/g
            let fieldArrayMatch
            while ((fieldArrayMatch = fieldArrayPattern.exec(content)) !== null) {
              const arrayName = fieldArrayMatch[1]
              const arrayContent = fieldArrayMatch[2]
              knownFields[arrayName] = extractFieldStructure(arrayContent, knownFields)
            }
            
            // Extract main fields
            const fieldsMatch = content.match(/fields:\s*\[([\s\S]*?)\]\s*[,}]/s)
            let fields = []
            if (fieldsMatch) {
              fields = extractFieldStructure(fieldsMatch[1], knownFields)
            }
            
            blocks.push({
              name: entry.name,
              slug,
              path: configPath,
              fields,
            })
          }
        } catch (e) {
          // File doesn't exist or can't be read
        }
      }
    }
  } catch (e) {
    console.warn('⚠️  Could not read blocks directory:', e.message)
  }
  
  return blocks
}

/**
 * Loads collection configurations
 */
function loadCollections() {
  const collections = []
  const configPath = join(projectRoot, 'src', 'payload.config.ts')
  
  try {
    const configContent = readFileSync(configPath, 'utf-8')
    const collectionImports = configContent.match(/from\s+['"].*collections\/(\w+)/g) || []
    
    for (const importLine of collectionImports) {
      const collectionMatch = importLine.match(/collections\/(\w+)/)
      if (collectionMatch) {
        const collectionName = collectionMatch[1]
        try {
          const collectionPath = join(projectRoot, 'src', 'collections', collectionName, 'index.ts')
          if (statSync(collectionPath).isFile()) {
            const collectionContent = readFileSync(collectionPath, 'utf-8')
            const slugMatch = collectionContent.match(/slug:\s*['"]([^'"]+)['"]/)
            const slug = slugMatch ? slugMatch[1] : collectionName.toLowerCase()
            
            // Extract block references
            const blocksMatch = collectionContent.match(/blocks:\s*\[([^\]]+)\]/s)
            const blockRefs = blocksMatch ? blocksMatch[1].match(/(\w+)/g) || [] : []
            
            collections.push({
              name: collectionName,
              slug,
              path: collectionPath,
              blockRefs,
            })
          }
        } catch (e) {
          // Collection file not found
        }
      }
    }
  } catch (error) {
    console.error('Error loading collections:', error.message)
  }
  
  return collections
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Checking for enum names exceeding 63 characters...\n')
  
  const issues = []
  
  // Load collections
  const collections = loadCollections()
  console.log(`📋 Found ${collections.length} collections`)
  
  // Load blocks
  const blocks = loadBlocks()
  console.log(`📦 Found ${blocks.length} blocks\n`)
  
  // Check blocks within collections
  for (const collection of collections) {
    for (const blockRef of collection.blockRefs) {
      const block = blocks.find(b => 
        b.name === blockRef || 
        b.name === `${blockRef}Block` ||
        b.slug === blockRef.toLowerCase()
      )
      
      if (block && block.fields) {
        const selectFields = findSelectFieldsRecursive(
          block.fields,
          [],
          collection.slug,
          true,
          block.slug
        )
        
        for (const selectField of selectFields) {
          if (selectField.exceedsLimit) {
            issues.push({
              ...selectField,
              collection: collection.slug,
              block: block.slug,
              file: block.path,
            })
          }
        }
      }
    }
  }
  
  // Report issues
  if (issues.length === 0) {
    console.log('✅ All enum names are within the 63 character limit!')
    process.exit(0)
  } else {
    console.log(`\n❌ Found ${issues.length} enum name(s) exceeding the limit:\n`)
    
    for (const issue of issues) {
      console.log(`📌 ${issue.enumName}`)
      console.log(`   Length: ${issue.length} chars (exceeds by ${issue.length - MAX_ENUM_LENGTH})`)
      console.log(`   Collection: ${issue.collection}`)
      if (issue.block) {
        console.log(`   Block: ${issue.block}`)
      }
      console.log(`   Path: ${issue.path.join(' → ')}`)
      console.log(`   DB Path: ${issue.dbPath.join(' → ')}`)
      console.log(`   File: ${issue.file}`)
      if (issue.suggestedDbName) {
        console.log(`   💡 Suggestion: Add dbName: '${issue.suggestedDbName}' to the '${issue.path[issue.path.length - 1]}' field`)
      }
      console.log('')
    }
    
    console.log('⚠️  Some enum names exceed the limit. Apply suggested fixes.')
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { findSelectFieldsRecursive, suggestDbName, loadCollections, loadBlocks }
