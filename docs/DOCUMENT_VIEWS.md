# Document Views in Payload CMS

Complete guide to customizing Document Views within Collection and Global Edit interfaces.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Document Root](#document-root)
4. [Edit View (Default)](#edit-view-default)
5. [Document Tabs](#document-tabs)
6. [Tab Components](#tab-components)
7. [Built-in Views](#built-in-views)
8. [Custom Views](#custom-views)
9. [Examples](#examples)
10. [Best Practices](#best-practices)
11. [Quick Reference](#quick-reference)

---

## Overview

Document Views consist of multiple, individual views that together represent any single Collection or Global Document. All Document Views are scoped under:
- Collections: `/admin/collections/:collectionSlug/:id`
- Globals: `/admin/globals/:globalSlug`

### Key Concepts

- **Multiple Views per Document**: Each document can have multiple views (Edit, API, Versions, etc.)
- **Tab-Based Navigation**: Views can be organized as tabs within the document interface
- **Shared Layout**: All Document Views share a common layout and navigation
- **Complete Control**: Replace individual views or the entire document interface
- **Custom Views**: Add entirely new views for your specific use case

### Available Views

**Built-in Views:**
- `default` - Primary edit view
- `root` - Complete document interface override
- `api` - REST API JSON response viewer
- `versions` - Version history browser
- `version` - Individual version editor
- `livePreview` - Live preview interface

**Custom Views:**
- Any custom key you define creates a new Document View

---

## Configuration

To customize Document Views, use the `admin.components.views.edit[key]` property in your Collection Config or Global Config:

### Collection Configuration

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'posts',
  // ... other collection config
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '/path/to/MyCustomEditView',
          },
          // Other options...
        },
      },
    },
  },
}
```

### Global Configuration

```typescript
import type { GlobalConfig } from 'payload'

export const MyGlobal: GlobalConfig = {
  slug: 'header',
  // ... other global config
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '/path/to/MyCustomEditView',
          },
          // Other options...
        },
      },
    },
  },
}
```

### Configuration Options

| Property | Description |
|----------|-------------|
| `Component` | Path to the component that should be rendered |
| `path` | URL path for the view (required for custom views) |
| `tab` | Tab configuration (label, href, order, Component) |
| `exact` | Boolean. When `true`, only matches exact path |
| `strict` | Boolean. When `true`, trailing slashes must match |
| `sensitive` | Boolean. When `true`, path matching is case sensitive |

---

## Document Root

The Document Root is mounted on the top-level route for a Document. Setting this property will completely take over the entire Document View layout, including the title, Document Tabs, and all other nested Document Views.

### Important Notes

- **Complete Control**: No document controls or tabs are rendered when `root` is set
- **Full Responsibility**: You are responsible for rendering all necessary components and controls
- **No Built-in Views**: Built-in views (Edit, API, Versions, etc.) won't be accessible
- **Use Default Instead**: If you only want to replace the Edit View, use `edit.default` instead

### Configuration

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      views: {
        edit: {
          root: {
            Component: '/path/to/MyCustomRootComponent',
          },
        },
      },
    },
  },
}
```

### Example: Custom Document Root

**src/collections/Posts.ts:**
```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  // ... fields
  admin: {
    components: {
      views: {
        edit: {
          root: {
            Component: '/src/views/PostRootView',
          },
        },
      },
    },
  },
}
```

**src/views/PostRootView.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Button, Tabs } from '@payloadcms/ui'
import React from 'react'

export async function PostRootView({
  initPageResult,
  params,
  searchParams,
  doc,
}: AdminViewServerProps) {
  const { payload } = initPageResult.req
  const { id } = params

  // Fetch document
  const post = doc || await payload.findByID({
    collection: 'posts',
    id: id as string,
  })

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        {/* Custom header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <h1>{post.title}</h1>
          <Button onClick={() => window.location.href = `/admin/collections/posts/${id}`}>
            Save
          </Button>
        </div>

        {/* Custom tabs */}
        <Tabs>
          <Tabs.List>
            <Tabs.Tab href={`/admin/collections/posts/${id}`}>
              Edit
            </Tabs.Tab>
            <Tabs.Tab href={`/admin/collections/posts/${id}/preview`}>
              Preview
            </Tabs.Tab>
            <Tabs.Tab href={`/admin/collections/posts/${id}/analytics`}>
              Analytics
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Custom content area */}
        <div style={{ marginTop: '2rem' }}>
          {/* Your custom edit interface */}
          <h2>Edit Post</h2>
          <p>Full control over the document interface</p>
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
```

### When to Use Document Root

**Use Document Root When:**
- You need complete control over the document interface
- You're building a custom editing experience
- You need custom navigation that doesn't match the default tabs
- You're creating a specialized interface for a specific collection

**Don't Use Document Root When:**
- You only want to customize the Edit View (use `default` instead)
- You want to keep built-in features like API view, Versions, etc.
- You want to add custom views alongside default views

---

## Edit View (Default)

The Edit View is where users interact with individual Collection and Global Documents. This is the primary view for viewing, editing, and saving content. The Edit View is keyed under the `default` property.

### Configuration

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '/path/to/MyCustomEditView',
          },
        },
      },
    },
  },
}
```

### Example: Custom Edit View

**src/collections/Posts.ts:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        default: {
          Component: '/src/views/CustomPostEdit',
        },
      },
    },
  },
}
```

**src/views/CustomPostEdit.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Form } from '@payloadcms/ui'
import React from 'react'

export async function CustomPostEdit({
  initPageResult,
  params,
  searchParams,
  doc,
}: AdminViewServerProps) {
  const { payload } = initPageResult.req
  const { id } = params

  // Fetch document
  const post = doc || await payload.findByID({
    collection: 'posts',
    id: id as string,
  })

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1>Edit Post: {post.title}</h1>
        
        {/* Custom edit form or use Payload's form components */}
        <Form>
          {/* Form fields */}
        </Form>
      </Gutter>
    </DefaultTemplate>
  )
}
```

---

## Document Tabs

Each Document View can be given a tab for navigation. Tabs are highly configurable, from changing the label to replacing the entire tab component.

### Tab Configuration Options

| Property | Description |
|----------|-------------|
| `label` | The text label to display in the tab |
| `href` | The URL to navigate to when clicked (defaults to view's path) |
| `order` | Numeric order for tab positioning (lower numbers appear first) |
| `Component` | Custom component to render as the tab |

### Simple Tab Configuration

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      views: {
        edit: {
          preview: {
            Component: '/path/to/PreviewView',
            path: '/preview',
            tab: {
              label: 'Preview',
              href: '/preview',
              order: 200,
            },
          },
        },
      },
    },
  },
}
```

### Reordering Default Tabs

You can reorder built-in tabs by setting their `order` property:

```typescript
admin: {
  components: {
    views: {
      edit: {
        default: {
          tab: {
            order: 100, // Edit tab order
          },
        },
        api: {
          tab: {
            order: 300, // API tab order
          },
        },
        versions: {
          tab: {
            order: 400, // Versions tab order
          },
        },
      },
    },
  },
}
```

### Multiple Custom Views with Tabs

```typescript
admin: {
  components: {
    views: {
      edit: {
        default: {
          Component: '/src/views/PostEdit#DefaultEdit',
          tab: {
            label: 'Edit',
            order: 100,
          },
        },
        preview: {
          Component: '/src/views/PostEdit#Preview',
          path: '/preview',
          tab: {
            label: 'Preview',
            order: 200,
          },
        },
        analytics: {
          Component: '/src/views/PostEdit#Analytics',
          path: '/analytics',
          tab: {
            label: 'Analytics',
            order: 250,
          },
        },
        api: {
          tab: {
            order: 300,
          },
        },
      },
    },
  },
}
```

---

## Tab Components

If changing the label or href is not enough, you can replace the entire tab component with your own custom component.

### Server Component Tab

```typescript
import React from 'react'
import type { DocumentTabServerProps } from 'payload'
import { Link } from '@payloadcms/ui'

export function MyCustomTabComponent(props: DocumentTabServerProps) {
  const {
    doc,
    isActive,
    path,
  } = props

  return (
    <Link 
      href={path}
      className={isActive ? 'active' : ''}
    >
      Custom Tab (Server)
      {doc && <span> - {doc.title}</span>}
    </Link>
  )
}
```

### Client Component Tab

```typescript
'use client'

import React from 'react'
import type { DocumentTabClientProps } from 'payload'
import { Link } from '@payloadcms/ui'

export function MyCustomTabComponent(props: DocumentTabClientProps) {
  const {
    clientDoc,
    isActive,
    path,
  } = props

  return (
    <Link 
      href={path}
      className={isActive ? 'active' : ''}
      style={{
        fontWeight: isActive ? 'bold' : 'normal',
        padding: '0.5rem 1rem',
        borderBottom: isActive ? '2px solid blue' : 'none',
      }}
    >
      Custom Tab (Client)
      {clientDoc && <span> - {clientDoc.title}</span>}
    </Link>
  )
}
```

### Tab Component Props

**Server Component Props (`DocumentTabServerProps`):**
- `doc` - The document being edited (full document with all fields)
- `isActive` - Boolean indicating if this tab is currently active
- `path` - The URL path for this tab
- `collectionSlug` - The collection slug (for collections only)
- `globalSlug` - The global slug (for globals only)
- `id` - The document ID (for collections only)

**Client Component Props (`DocumentTabClientProps`):**
- `clientDoc` - The document being edited (serializable version)
- `isActive` - Boolean indicating if this tab is currently active
- `path` - The URL path for this tab
- `collectionSlug` - The collection slug (for collections only)
- `globalSlug` - The global slug (for globals only)
- `id` - The document ID (for collections only)

### Configuration with Custom Tab Component

```typescript
admin: {
  components: {
    views: {
      edit: {
        preview: {
          Component: '/src/views/PreviewView',
          path: '/preview',
          tab: {
            Component: '/src/components/CustomPreviewTab',
            label: 'Preview',
            order: 200,
          },
        },
      },
    },
  },
}
```

---

## Built-in Views

### API View

The API View displays the REST API JSON response for a given document.

**Configuration:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        api: {
          tab: {
            label: 'API Response',
            order: 300,
          },
        },
      },
    },
  },
}
```

**Custom API View:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        api: {
          Component: '/src/views/CustomAPIView',
          tab: {
            label: 'API',
            order: 300,
          },
        },
      },
    },
  },
}
```

### Versions View

The Versions View is used to navigate the version history of a single document.

**Configuration:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        versions: {
          tab: {
            label: 'Version History',
            order: 400,
          },
        },
      },
    },
  },
}
```

**Custom Versions View:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        versions: {
          Component: '/src/views/CustomVersionsView',
          path: '/versions',
          tab: {
            label: 'History',
            order: 400,
          },
        },
      },
    },
  },
}
```

### Version View

The Version View is used to edit a single version of a document.

**Configuration:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        version: {
          Component: '/src/views/CustomVersionView',
          path: '/version/:versionId',
        },
      },
    },
  },
}
```

### Live Preview View

The Live Preview View displays the Live Preview interface.

**Configuration:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        livePreview: {
          tab: {
            label: 'Live Preview',
            order: 250,
          },
        },
      },
    },
  },
}
```

**Custom Live Preview View:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        livePreview: {
          Component: '/src/views/CustomLivePreview',
          path: '/preview',
          tab: {
            label: 'Preview',
            order: 250,
          },
        },
      },
    },
  },
}
```

---

## Custom Views

You can create entirely new Document Views by adding your own keys to the `edit` object.

### Basic Custom View

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      views: {
        edit: {
          analytics: {
            Component: '/src/views/AnalyticsView',
            path: '/analytics',
            tab: {
              label: 'Analytics',
              order: 250,
            },
          },
        },
      },
    },
  },
}
```

### Multiple Custom Views

```typescript
admin: {
  components: {
    views: {
      edit: {
        default: {
          Component: '/src/views/EditView',
          tab: {
            label: 'Edit',
            order: 100,
          },
        },
        preview: {
          Component: '/src/views/PreviewView',
          path: '/preview',
          tab: {
            label: 'Preview',
            order: 200,
          },
        },
        analytics: {
          Component: '/src/views/AnalyticsView',
          path: '/analytics',
          tab: {
            label: 'Analytics',
            order: 250,
          },
        },
        seo: {
          Component: '/src/views/SEOView',
          path: '/seo',
          tab: {
            label: 'SEO',
            order: 260,
          },
        },
        comments: {
          Component: '/src/views/CommentsView',
          path: '/comments',
          tab: {
            label: 'Comments',
            order: 270,
          },
        },
      },
    },
  },
}
```

---

## Examples

### Example 1: Preview View with Custom Tab

**src/collections/Posts.ts:**
```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  // ... fields
  admin: {
    components: {
      views: {
        edit: {
          preview: {
            Component: '/src/views/PostPreview',
            path: '/preview',
            tab: {
              label: 'Preview',
              href: '/preview',
              order: 200,
            },
          },
        },
      },
    },
  },
}
```

**src/views/PostPreview.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

export async function PostPreview({
  initPageResult,
  params,
  searchParams,
  doc,
}: AdminViewServerProps) {
  const { payload } = initPageResult.req
  const { id } = params

  const post = doc || await payload.findByID({
    collection: 'posts',
    id: id as string,
  })

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1>Preview: {post.title}</h1>
        
        <div style={{ 
          border: '1px solid var(--theme-elevation-200)',
          padding: '2rem',
          borderRadius: '4px',
        }}>
          <article>
            <h2>{post.title}</h2>
            {post.content && (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            )}
          </article>
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
```

### Example 2: Analytics View

**src/collections/Posts.ts:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        analytics: {
          Component: '/src/views/PostAnalytics',
          path: '/analytics',
          tab: {
            label: 'Analytics',
            order: 250,
          },
        },
      },
    },
  },
}
```

**src/views/PostAnalytics.tsx:**
```typescript
'use client'

import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Card } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

export function PostAnalytics({
  initPageResult,
  params,
  searchParams,
  doc: initialDoc,
}: AdminViewServerProps) {
  const { id } = params
  const [analytics, setAnalytics] = useState({
    views: 0,
    likes: 0,
    shares: 0,
    comments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch analytics data
    fetch(`/api/posts/${id}/analytics`)
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch analytics:', error)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <DefaultTemplate {...defaultTemplateProps}>
        <Gutter>Loading analytics...</Gutter>
      </DefaultTemplate>
    )
  }

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1>Analytics: {initialDoc?.title}</h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '1rem',
          marginTop: '2rem',
        }}>
          <Card>
            <h3>Views</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.views}</p>
          </Card>
          <Card>
            <h3>Likes</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.likes}</p>
          </Card>
          <Card>
            <h3>Shares</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.shares}</p>
          </Card>
          <Card>
            <h3>Comments</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.comments}</p>
          </Card>
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
```

### Example 3: SEO View

**src/collections/Posts.ts:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        seo: {
          Component: '/src/views/SEOView',
          path: '/seo',
          tab: {
            Component: '/src/components/SEOTab#SEOTab',
            label: 'SEO',
            order: 260,
          },
        },
      },
    },
  },
}
```

**src/components/SEOTab.tsx:**
```typescript
'use client'

import React from 'react'
import type { DocumentTabClientProps } from 'payload'
import { Link } from '@payloadcms/ui'

export function SEOTab({ isActive, path, clientDoc }: DocumentTabClientProps) {
  const hasSEOData = clientDoc?.meta?.title || clientDoc?.meta?.description

  return (
    <Link 
      href={path}
      className={isActive ? 'active' : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: isActive ? 'bold' : 'normal',
        color: hasSEOData ? 'green' : 'orange',
      }}
    >
      SEO
      {!hasSEOData && <span title="SEO data missing">⚠️</span>}
      {hasSEOData && <span title="SEO data complete">✓</span>}
    </Link>
  )
}
```

**src/views/SEOView.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Form } from '@payloadcms/ui'
import React from 'react'

export async function SEOView({
  initPageResult,
  params,
  searchParams,
  doc,
}: AdminViewServerProps) {
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1>SEO Settings: {doc?.title}</h1>
        
        <div style={{ marginTop: '2rem' }}>
          <h2>Meta Tags</h2>
          <p>Configure SEO meta tags for this post...</p>
          
          {/* SEO form fields would go here */}
          <Form>
            {/* Meta title, description, image, etc. */}
          </Form>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Preview</h2>
          <div style={{
            border: '1px solid var(--theme-elevation-200)',
            padding: '1rem',
            borderRadius: '4px',
          }}>
            {/* SEO preview component */}
            <h3>Google Search Preview</h3>
            <p>Preview how your post will appear in search results...</p>
          </div>
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
```

### Example 4: Complete Document View Setup

**src/collections/Posts.ts:**
```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  // ... fields
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '/src/views/PostEdit#DefaultEdit',
            tab: {
              label: 'Edit',
              order: 100,
            },
          },
          preview: {
            Component: '/src/views/PostEdit#Preview',
            path: '/preview',
            tab: {
              label: 'Preview',
              order: 200,
            },
          },
          analytics: {
            Component: '/src/views/PostEdit#Analytics',
            path: '/analytics',
            tab: {
              Component: '/src/components/AnalyticsTab',
              order: 250,
            },
          },
          seo: {
            Component: '/src/views/PostEdit#SEO',
            path: '/seo',
            tab: {
              Component: '/src/components/SEOTab#SEOTab',
              order: 260,
            },
          },
          api: {
            tab: {
              label: 'API',
              order: 300,
            },
          },
          versions: {
            tab: {
              label: 'Versions',
              order: 400,
            },
          },
        },
      },
    },
  },
}
```

---

## Best Practices

### 1. Use Appropriate View Types

```typescript
// ✅ Good: Use default for Edit View customization
edit: {
  default: {
    Component: '/path/to/EditView',
  },
}

// ✅ Good: Use custom views for additional functionality
edit: {
  preview: {
    Component: '/path/to/PreviewView',
    path: '/preview',
    tab: { label: 'Preview', order: 200 },
  },
}

// ❌ Avoid: Using root unless absolutely necessary
edit: {
  root: {
    Component: '/path/to/RootView', // Only if you need complete control
  },
}
```

### 2. Tab Organization

```typescript
// ✅ Good: Logical tab ordering
edit: {
  default: { tab: { order: 100 } },      // Edit
  preview: { tab: { order: 200 } },      // Preview
  analytics: { tab: { order: 250 } },    // Analytics
  api: { tab: { order: 300 } },          // API
  versions: { tab: { order: 400 } },     // Versions
}
```

### 3. Tab Labels

```typescript
// ✅ Good: Clear, concise labels
tab: {
  label: 'SEO Settings',
  order: 260,
}

// ❌ Avoid: Unclear or too long labels
tab: {
  label: 'Search Engine Optimization Settings and Configuration',
  order: 260,
}
```

### 4. Path Configuration

```typescript
// ✅ Good: Descriptive paths
preview: {
  Component: '/src/views/Preview',
  path: '/preview',
}

analytics: {
  Component: '/src/views/Analytics',
  path: '/analytics',
}

// ❌ Avoid: Unclear or conflicting paths
custom: {
  Component: '/src/views/Custom',
  path: '/', // Conflicts with default
}
```

### 5. Component Organization

```typescript
// ✅ Good: Organized by feature
views: {
  PostEdit: {
    DefaultEdit: '/src/views/PostEdit#DefaultEdit',
    Preview: '/src/views/PostEdit#Preview',
    Analytics: '/src/views/PostEdit#Analytics',
  },
}

// ✅ Good: Separate files for complex views
views: {
  PreviewView: '/src/views/PreviewView',
  AnalyticsView: '/src/views/AnalyticsView',
}
```

### 6. Type Safety

```typescript
// ✅ Good: Use TypeScript types
import type { AdminViewServerProps } from 'payload'
import type { DocumentTabServerProps } from 'payload'

export function MyView(props: AdminViewServerProps) {
  // TypeScript will provide type checking
}

export function MyTab(props: DocumentTabServerProps) {
  // TypeScript will provide type checking
}
```

### 7. Error Handling

```typescript
// ✅ Good: Handle errors gracefully
export async function MyView({ initPageResult, params }: AdminViewServerProps) {
  try {
    const doc = await initPageResult.req.payload.findByID({
      collection: 'posts',
      id: params.id as string,
    })
    return <div>{/* Render */}</div>
  } catch (error) {
    return <div>Error loading document: {error.message}</div>
  }
}
```

---

## Quick Reference

### Configuration Template

```typescript
admin: {
  components: {
    views: {
      edit: {
        // Document Root (complete override)
        root: {
          Component: '/path/to/RootView',
        },
        
        // Edit View (default)
        default: {
          Component: '/path/to/EditView',
          tab: {
            label: 'Edit',
            order: 100,
          },
        },
        
        // Custom Views
        preview: {
          Component: '/path/to/PreviewView',
          path: '/preview',
          tab: {
            label: 'Preview',
            href: '/preview',
            order: 200,
            Component: '/path/to/CustomTab', // Optional
          },
        },
        
        // Built-in Views
        api: {
          tab: {
            label: 'API',
            order: 300,
          },
        },
        versions: {
          tab: {
            label: 'Versions',
            order: 400,
          },
        },
        version: {
          Component: '/path/to/VersionView',
          path: '/version/:versionId',
        },
        livePreview: {
          tab: {
            label: 'Live Preview',
            order: 250,
          },
        },
      },
    },
  },
}
```

### Tab Configuration Options

```typescript
tab: {
  label: 'Tab Label',              // Display text
  href: '/path/to/view',           // Navigation URL (optional)
  order: 200,                      // Tab order (numeric)
  Component: '/path/to/Tab',       // Custom tab component (optional)
}
```

### View Props

**AdminViewServerProps (for views):**
- `initPageResult` - Contains req, payload, permissions, etc.
- `params` - Route parameters (e.g., `{ id: '123' }`)
- `searchParams` - URL query parameters
- `doc` - The document being edited (available in Document Views)

**DocumentTabServerProps (for tabs):**
- `doc` - The document being edited
- `isActive` - Boolean if tab is active
- `path` - Tab URL path
- `collectionSlug` - Collection slug (collections only)
- `globalSlug` - Global slug (globals only)
- `id` - Document ID (collections only)

---

## Troubleshooting

### View Not Rendering

**Problem**: Custom view doesn't appear.

**Solutions:**
- Verify the path is correct relative to `baseDir`
- Check that the component is exported correctly
- Ensure `path` property is set for custom views
- Regenerate import map: `payload generate:importmap`
- Check browser console for errors

### Tabs Not Showing

**Problem**: Custom tabs don't appear in navigation.

**Solutions:**
- Ensure `tab` property is configured
- Check that `order` values don't conflict
- Verify `path` matches the view path
- Check that view component is rendering correctly

### Document Not Loading

**Problem**: Document data is undefined in view.

**Solutions:**
- Use the `doc` prop when available (Document Views)
- Fetch document using `payload.findByID` if needed
- Check that `params.id` is available
- Verify collection/global slug is correct

### Routing Conflicts

**Problem**: Routes conflict or don't match.

**Solutions:**
- Use descriptive, unique paths
- Ensure paths don't conflict with built-in routes
- Use `exact: true` if needed for exact matching
- Check path ordering (nested before parent)

---

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Customizing Views Guide](CUSTOMIZING_VIEWS.md)
- [React Component Personalization Guide](REACT_COMPONENT_PERSONALIZATION.md)
- [Next.js App Router](https://nextjs.org/docs/app)

---

*Last updated: 2024*

