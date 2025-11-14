# Live Preview in Payload CMS

Complete guide to setting up and configuring Live Preview in Payload CMS.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [URL Configuration](#url-configuration)
4. [Dynamic URLs](#dynamic-urls)
5. [Conditional Rendering](#conditional-rendering)
6. [Breakpoints](#breakpoints)
7. [Collection-Specific Configuration](#collection-specific-configuration)
8. [Global-Specific Configuration](#global-specific-configuration)
9. [Examples](#examples)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [Quick Reference](#quick-reference)

---

## Overview

Live Preview allows you to render your front-end application directly within the Admin Panel. As you type, your changes take effect in real-time without needing to save a draft or publish. Live Preview works in both Server-side and Client-side environments.

### Key Concepts

- **Real-Time Preview**: See changes as you type, without saving
- **Iframe Rendering**: Front-end app loads in an iframe within the Admin Panel
- **postMessage Communication**: Admin Panel communicates via `window.postMessage` events
- **Event-Driven**: Events emitted on every document change
- **Universal Support**: Works with Server-side and Client-side applications

### How It Works

1. **Configuration**: Enable Live Preview in Payload Config or Collection/Global Config
2. **Preview Button**: "Live Preview" button appears in enabled documents
3. **Iframe Loading**: Clicking the button opens an iframe with your front-end app
4. **Event Emission**: Admin Panel emits `window.postMessage` events on document changes
5. **Front-end Listener**: Your app listens for events and re-renders with new data
6. **Real-Time Updates**: Changes appear instantly in the preview

---

## Configuration

Live Preview can be configured either globally through the Root Admin Config, or on individual Collection Admin Configs and Global Admin Configs. Settings defined in Collection/Global configs will merge into and override the top-level configuration.

### Global Configuration

Configure Live Preview globally in your Payload Config:

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    livePreview: {
      url: 'http://localhost:3000',
      collections: ['pages', 'posts'],
      globals: ['header', 'footer'],
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
      ],
    },
  },
})
```

### Collection-Specific Configuration

Configure Live Preview for specific collections:

```typescript
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    livePreview: {
      url: ({ data, req }) => `/pages/${data?.slug}`,
    },
  },
  // ... fields
}
```

### Global-Specific Configuration

Configure Live Preview for specific globals:

```typescript
import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    livePreview: {
      url: '/',
    },
  },
  // ... fields
}
```

---

## URL Configuration

The `url` property resolves to a string that points to your front-end application. This value is used as the `src` attribute of the iframe rendering your front-end.

### Static URL

Use a static string for a simple, unchanging URL:

```typescript
admin: {
  livePreview: {
    url: 'http://localhost:3000',
    collections: ['pages'],
  },
}
```

### Dynamic URL Function

Use a function to dynamically generate URLs based on document data:

```typescript
admin: {
  livePreview: {
    url: ({ data, collectionConfig, locale, req }) => {
      // Generate URL based on document data
      const baseUrl = req.protocol ? `${req.protocol}//${req.host}` : 'http://localhost:3000'
      const slug = data?.slug || ''
      
      if (collectionConfig.slug === 'posts') {
        return `${baseUrl}/posts/${slug}`
      }
      
      return slug === 'home' ? baseUrl : `${baseUrl}/${slug}`
    },
    collections: ['pages', 'posts'],
  },
}
```

### URL Function Arguments

The `url` function receives the following arguments:

| Argument | Description |
|----------|-------------|
| `data` | The data of the Document being edited (includes unsaved changes) |
| `locale` | The locale currently being edited (if applicable) |
| `collectionConfig` | The Collection Admin Config of the Document being edited |
| `globalConfig` | The Global Admin Config of the Document being edited |
| `req` | The Payload Request object |

### Absolute vs Relative URLs

**Relative URLs** (recommended for dynamic domains):
```typescript
url: ({ data }) => `/pages/${data?.slug}`
```

Payload automatically constructs an absolute URL by injecting the protocol, domain, and port from the browser window. This is helpful for platforms like Vercel with preview deployment URLs.

**Absolute URLs** (for different domains):
```typescript
url: ({ data, req }) => `${req.protocol}//${req.host}/${data.slug}`
```

Use absolute URLs when:
- Previewing on a different domain
- Front-end is on a separate server
- You need full control over the URL

---

## Dynamic URLs

Dynamic URLs are useful for multi-tenant applications, localization, or any scenario where the URL needs to be generated based on the document being edited.

### Multi-Tenant Example

```typescript
admin: {
  livePreview: {
    url: ({ data, req }) => {
      if (!data?.tenant?.url) return null
      return `${data.tenant.url}/pages/${data.slug}`
    },
    collections: ['pages'],
  },
}
```

### Localization Example

```typescript
admin: {
  livePreview: {
    url: ({ data, locale, collectionConfig }) => {
      const baseUrl = 'http://localhost:3000'
      const localeParam = locale ? `?locale=${locale.code}` : ''
      
      if (collectionConfig.slug === 'posts') {
        return `${baseUrl}/posts/${data?.slug}${localeParam}`
      }
      
      const slug = data?.slug === 'home' ? '' : `/${data?.slug}`
      return `${baseUrl}${slug}${localeParam}`
    },
    collections: ['pages', 'posts'],
  },
}
```

### Complex Routing Example

```typescript
admin: {
  livePreview: {
    url: ({ data, collectionConfig, locale, req }) => {
      const baseUrl = req.protocol ? `${req.protocol}//${req.host}` : 'http://localhost:3000'
      const slug = data?.slug || ''
      const localePrefix = locale?.code === 'en' ? '' : `/${locale.code}`
      
      // Different routing logic based on collection
      switch (collectionConfig.slug) {
        case 'posts':
          return `${baseUrl}${localePrefix}/blog/${slug}${locale ? `?locale=${locale.code}` : ''}`
        case 'pages':
          return slug === 'home' 
            ? `${baseUrl}${localePrefix}${locale ? `?locale=${locale.code}` : ''}`
            : `${baseUrl}${localePrefix}/${slug}${locale ? `?locale=${locale.code}` : ''}`
        default:
          return `${baseUrl}${localePrefix}/${slug}${locale ? `?locale=${locale.code}` : ''}`
      }
    },
    collections: ['pages', 'posts'],
  },
}
```

---

## Conditional Rendering

You can conditionally enable Live Preview by returning `undefined` or `null` from the `url` function. This is similar to access control, allowing you to restrict Live Preview based on user roles, document data, or other criteria.

### Role-Based Conditional Rendering

```typescript
admin: {
  livePreview: {
    url: ({ req }) => {
      // Only allow admins to use Live Preview
      if (req.user?.role === 'admin') {
        return 'http://localhost:3000'
      }
      return null // Disable Live Preview for non-admins
    },
    collections: ['pages'],
  },
}
```

### Document-Based Conditional Rendering

```typescript
admin: {
  livePreview: {
    url: ({ data, req }) => {
      // Only enable for published or draft documents
      if (data?._status === 'published' || data?._status === 'draft') {
        return `http://localhost:3000/${data?.slug}`
      }
      return null // Disable for archived or other statuses
    },
    collections: ['pages'],
  },
}
```

### Environment-Based Conditional Rendering

```typescript
admin: {
  livePreview: {
    url: ({ data }) => {
      // Only enable in development
      if (process.env.NODE_ENV === 'development') {
        return `http://localhost:3000/${data?.slug}`
      }
      return null // Disable in production
    },
    collections: ['pages'],
  },
}
```

### Multi-Condition Example

```typescript
admin: {
  livePreview: {
    url: ({ data, req }) => {
      // Multiple conditions
      if (!req.user) return null // No user
      if (!data?.slug) return null // No slug
      if (data._status === 'archived') return null // Archived documents
      if (req.user.role !== 'admin' && req.user.role !== 'editor') return null // Wrong role
      
      return `http://localhost:3000/${data.slug}`
    },
    collections: ['pages'],
  },
}
```

---

## Breakpoints

Breakpoints are used as "device sizes" in the preview window. Each breakpoint appears as an option in the toolbar, and selecting one resizes the iframe to the specified dimensions.

### Configuration

```typescript
admin: {
  livePreview: {
    url: 'http://localhost:3000',
    breakpoints: [
      {
        label: 'Mobile',
        name: 'mobile',
        width: 375,
        height: 667,
      },
      {
        label: 'Tablet',
        name: 'tablet',
        width: 768,
        height: 1024,
      },
      {
        label: 'Desktop',
        name: 'desktop',
        width: 1440,
        height: 900,
      },
    ],
  },
}
```

### Breakpoint Options

| Property | Required | Description |
|----------|----------|-------------|
| `label` | Yes | The label displayed in the dropdown (what users see) |
| `name` | Yes | Internal name identifier for the breakpoint |
| `width` | Yes | Width of the iframe in pixels |
| `height` | Yes | Height of the iframe in pixels |

### Common Breakpoint Presets

```typescript
const commonBreakpoints = [
  // Mobile
  {
    label: 'Mobile Small',
    name: 'mobile-small',
    width: 320,
    height: 568,
  },
  {
    label: 'Mobile',
    name: 'mobile',
    width: 375,
    height: 667,
  },
  {
    label: 'Mobile Large',
    name: 'mobile-large',
    width: 414,
    height: 896,
  },
  // Tablet
  {
    label: 'Tablet Portrait',
    name: 'tablet-portrait',
    width: 768,
    height: 1024,
  },
  {
    label: 'Tablet Landscape',
    name: 'tablet-landscape',
    width: 1024,
    height: 768,
  },
  // Desktop
  {
    label: 'Desktop Small',
    name: 'desktop-small',
    width: 1280,
    height: 720,
  },
  {
    label: 'Desktop',
    name: 'desktop',
    width: 1440,
    height: 900,
  },
  {
    label: 'Desktop Large',
    name: 'desktop-large',
    width: 1920,
    height: 1080,
  },
]
```

### Responsive Option

The "Responsive" option is always available and requires no configuration. It's the default breakpoint that:
- Sets iframe width and height to 100%
- Fills the screen at maximum size
- Automatically resizes as the window changes

### Custom Resize

Users can manually resize the Live Preview using inputs in the toolbar. This temporarily sets the selection to "Custom" until a predefined breakpoint is selected again.

### New Window Mode

Users can open Live Preview in a new window by clicking the button in the toolbar. This:
- Closes the iframe
- Opens a new resizable window
- Automatically re-opens the iframe when closed

---

## Collection-Specific Configuration

Configure Live Preview per collection. Settings defined here merge into and override global settings.

### Configuration

```typescript
import type { CollectionConfig } from 'payload'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    // ... other admin config
  },
  // ... fields
}
```

### Example: Pages Collection

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    livePreview: {
      url: ({ data, req }) => {
        const slug = data?.slug || ''
        const baseUrl = req.protocol ? `${req.protocol}//${req.host}` : 'http://localhost:3000'
        
        // Homepage special case
        if (slug === 'home' || !slug) {
          return baseUrl
        }
        
        return `${baseUrl}/${slug}`
      },
    },
  },
}
```

### Example: Posts Collection

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    livePreview: {
      url: ({ data, req }) => {
        const baseUrl = req.protocol ? `${req.protocol}//${req.host}` : 'http://localhost:3000'
        return `${baseUrl}/posts/${data?.slug}`
      },
    },
  },
}
```

---

## Global-Specific Configuration

Configure Live Preview per global. Settings defined here merge into and override global settings.

### Configuration

```typescript
import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    livePreview: {
      url: '/', // Always preview from homepage for header global
    },
  },
  // ... fields
}
```

### Example: Header Global

```typescript
export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    livePreview: {
      url: '/', // Header appears on all pages, preview from homepage
    },
  },
}
```

### Example: Footer Global

```typescript
export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    livePreview: {
      url: ({ req }) => {
        const baseUrl = req.protocol ? `${req.protocol}//${req.host}` : 'http://localhost:3000'
        return baseUrl // Footer appears on all pages
      },
    },
  },
}
```

### Example: Settings Global with Conditional URL

```typescript
export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    livePreview: {
      url: ({ data }) => {
        // Preview settings on a specific test page
        if (data?.previewPage) {
          return `/${data.previewPage}`
        }
        return '/' // Default to homepage
      },
    },
  },
}
```

---

## Examples

### Example 1: Basic Setup

**Global Configuration:**
```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  admin: {
    livePreview: {
      url: 'http://localhost:3000',
      collections: ['pages'],
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
})
```

### Example 2: Dynamic URL with Preview Path Generator

**src/utilities/generatePreviewPath.ts:**
```typescript
import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
  projects: '/projects',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  const encodedSlug = encodeURIComponent(slug)
  const prefix = collectionPrefixMap[collection] || ''
  const path = prefix ? `${prefix}/${encodedSlug}` : `/${encodedSlug}`

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  return `/next/preview?${encodedParams.toString()}`
}
```

**Collection Configuration:**
```typescript
import type { CollectionConfig } from 'payload'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
  },
}
```

### Example 3: Multi-Tenant with Locale Support

```typescript
admin: {
  livePreview: {
    url: ({ data, locale, req }) => {
      if (!data?.tenant?.url) return null
      
      const baseUrl = data.tenant.url
      const localePrefix = locale && locale.code !== 'en' ? `/${locale.code}` : ''
      const slug = data?.slug === 'home' ? '' : `/${data.slug}`
      const localeParam = locale ? `?locale=${locale.code}` : ''
      
      return `${baseUrl}${localePrefix}${slug}${localeParam}`
    },
    collections: ['pages', 'posts'],
  },
}
```

### Example 4: Conditional Rendering with Access Control

```typescript
admin: {
  livePreview: {
    url: ({ data, req }) => {
      // Check user role
      if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
        return null
      }
      
      // Check document status
      if (data?._status === 'archived') {
        return null
      }
      
      // Check environment
      if (process.env.NODE_ENV === 'production' && !req.user.isSuperAdmin) {
        return null // Only super admins in production
      }
      
      return `http://localhost:3000/${data?.slug}`
    },
    collections: ['pages'],
  },
}
```

### Example 5: Complete Configuration with All Options

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  admin: {
    livePreview: {
      // Global URL function
      url: ({ data, collectionConfig, locale, req }) => {
        const baseUrl = req.protocol ? `${req.protocol}//${req.host}` : 'http://localhost:3000'
        const slug = data?.slug || ''
        const localeParam = locale ? `?locale=${locale.code}` : ''
        
        // Different routing per collection
        if (collectionConfig.slug === 'posts') {
          return `${baseUrl}/blog/${slug}${localeParam}`
        }
        
        return slug === 'home' 
          ? `${baseUrl}${localeParam}`
          : `${baseUrl}/${slug}${localeParam}`
      },
      
      // Enable for specific collections
      collections: ['pages', 'posts'],
      
      // Enable for specific globals
      globals: ['header', 'footer'],
      
      // Breakpoints
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
        {
          label: 'Desktop Large',
          name: 'desktop-large',
          width: 1920,
          height: 1080,
        },
      ],
    },
  },
})
```

---

## Best Practices

### 1. Use Dynamic URLs for Flexibility

```typescript
// ✅ Good: Dynamic URL based on document data
url: ({ data, req }) => {
  const baseUrl = req.protocol ? `${req.protocol}//${req.host}` : 'http://localhost:3000'
  return `${baseUrl}/${data?.slug}`
}

// ⚠️ Less flexible: Static URL
url: 'http://localhost:3000'
```

### 2. Handle Missing Data

```typescript
// ✅ Good: Handle missing slug
url: ({ data }) => {
  if (!data?.slug) return null
  return `http://localhost:3000/${data.slug}`
}

// ❌ Avoid: Potential errors with missing data
url: ({ data }) => `http://localhost:3000/${data.slug}` // Error if slug is undefined
```

### 3. Use Preview Path Utilities

```typescript
// ✅ Good: Centralized URL generation
import { generatePreviewPath } from '@/utilities/generatePreviewPath'

url: ({ data, req }) =>
  generatePreviewPath({
    slug: data?.slug,
    collection: 'pages',
    req,
  })

// ❌ Avoid: Duplicated logic
url: ({ data, req }) => {
  // URL generation logic duplicated in every collection
}
```

### 4. Environment-Aware URLs

```typescript
// ✅ Good: Different URLs per environment
url: ({ data, req }) => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://your-production-site.com'
    : req.protocol ? `${req.protocol}//${req.host}` : 'http://localhost:3000'
  
  return `${baseUrl}/${data?.slug}`
}
```

### 5. Conditional Rendering for Security

```typescript
// ✅ Good: Restrict Live Preview access
url: ({ req }) => {
  if (!req.user || req.user.role !== 'admin') {
    return null // Only admins can use Live Preview
  }
  return 'http://localhost:3000'
}
```

### 6. Appropriate Breakpoints

```typescript
// ✅ Good: Realistic device sizes
breakpoints: [
  { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
  { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
  { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
]

// ❌ Avoid: Unrealistic or too many breakpoints
breakpoints: [
  { label: 'Tiny', name: 'tiny', width: 100, height: 100 },
  // ... 20 more breakpoints
]
```

### 7. Collection-Specific Overrides

```typescript
// ✅ Good: Global config with collection overrides
admin: {
  livePreview: {
    url: 'http://localhost:3000', // Default
    collections: ['pages', 'posts'],
  },
}

// Collection override
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    livePreview: {
      url: ({ data }) => `/blog/${data?.slug}`, // Override for posts
    },
  },
}
```

---

## Troubleshooting

### Live Preview Button Not Appearing

**Problem**: "Live Preview" button doesn't appear in the Admin Panel.

**Solutions**:
- Ensure collection/global is listed in `collections` or `globals` array
- Check that `url` function returns a valid string (not `null` or `undefined`)
- Verify configuration is in the correct location (global or collection/global config)
- Check browser console for errors

```typescript
// ✅ Ensure collection is enabled
admin: {
  livePreview: {
    collections: ['pages'], // Include your collection
  },
}
```

### URL Not Loading

**Problem**: Iframe shows error or blank page.

**Solutions**:
- Verify URL is accessible from the browser
- Check CORS settings on your front-end application
- Ensure URL is correct (absolute or relative)
- Check iframe src attribute in browser DevTools
- Verify Content Security Policy allows iframes

### Events Not Received

**Problem**: Front-end doesn't receive `window.postMessage` events.

**Solutions**:
- Ensure your front-end implements Live Preview listener (see [Server-side Live Preview Guide](SERVER_SIDE_LIVE_PREVIEW.md))
- Verify `window.postMessage` listener is set up correctly
- Check that Admin Panel and front-end are on the same domain (or handle cross-origin)
- Check browser console for postMessage errors

### Conditional Rendering Not Working

**Problem**: Live Preview appears when it shouldn't (or vice versa).

**Solutions**:
- Verify `url` function returns `null` or `undefined` when disabled
- Check conditions in the function (user roles, document status, etc.)
- Ensure function logic is correct
- Test with different users/roles

```typescript
// ✅ Verify null/undefined return
url: ({ req }) => {
  if (req.user?.role !== 'admin') {
    return null // Explicitly return null
  }
  return 'http://localhost:3000'
}
```

### Breakpoints Not Working

**Problem**: Breakpoints don't resize iframe correctly.

**Solutions**:
- Verify breakpoint configuration (all required fields present)
- Check width and height values are numbers (not strings)
- Ensure breakpoint names are unique
- Test with browser DevTools to see iframe dimensions

### Relative URLs Not Resolving

**Problem**: Relative URLs don't work in iframe.

**Solutions**:
- Use absolute URLs if front-end is on different domain
- Verify protocol/domain/port are correct
- Check that relative URLs are properly formatted
- Use `req` object to build absolute URLs if needed

---

## Quick Reference

### Configuration Structure

**Global:**
```typescript
admin: {
  livePreview: {
    url: 'http://localhost:3000' | ({ data, locale, collectionConfig, globalConfig, req }) => string | null,
    collections: ['pages', 'posts'],
    globals: ['header', 'footer'],
    breakpoints: [
      {
        label: 'Mobile',
        name: 'mobile',
        width: 375,
        height: 667,
      },
    ],
  },
}
```

**Collection-Specific:**
```typescript
admin: {
  livePreview: {
    url: ({ data, req }) => `/pages/${data?.slug}`,
  },
}
```

**Global-Specific:**
```typescript
admin: {
  livePreview: {
    url: '/',
  },
}
```

### URL Function Arguments

```typescript
url: ({
  data,            // Document data (includes unsaved changes)
  locale,          // Current locale (if applicable)
  collectionConfig, // Collection config
  globalConfig,    // Global config
  req,             // Payload Request object
}) => string | null | undefined
```

### Breakpoint Structure

```typescript
{
  label: string,   // Display name
  name: string,    // Internal identifier
  width: number,   // Width in pixels
  height: number,  // Height in pixels
}
```

### Common Patterns

**Simple Static URL:**
```typescript
url: 'http://localhost:3000'
```

**Dynamic Based on Slug:**
```typescript
url: ({ data }) => `http://localhost:3000/${data?.slug}`
```

**Homepage Special Case:**
```typescript
url: ({ data }) => {
  const slug = data?.slug
  return slug === 'home' ? 'http://localhost:3000' : `http://localhost:3000/${slug}`
}
```

**With Request Object:**
```typescript
url: ({ data, req }) => {
  const baseUrl = req.protocol ? `${req.protocol}//${req.host}` : 'http://localhost:3000'
  return `${baseUrl}/${data?.slug}`
}
```

**Conditional Rendering:**
```typescript
url: ({ req }) => req.user?.role === 'admin' ? 'http://localhost:3000' : null
```

---

## Additional Resources

- [Payload CMS Live Preview Documentation](https://payloadcms.com/docs/live-preview/overview)
- [Server-side Live Preview Guide](SERVER_SIDE_LIVE_PREVIEW.md)
- [Client-side Live Preview](https://payloadcms.com/docs/live-preview/client-side)
- [Customizing Views Guide](CUSTOMIZING_VIEWS.md)

---

*Last updated: 2024*

