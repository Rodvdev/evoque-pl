# List View in Payload CMS

Complete guide to customizing the List View for Collections in Payload CMS.

## Table of Contents

1. [Overview](#overview)
2. [Custom List View](#custom-list-view)
3. [Custom Components](#custom-components)
4. [Component Reference](#component-reference)
5. [Examples](#examples)
6. [Best Practices](#best-practices)
7. [Quick Reference](#quick-reference)

---

## Overview

The List View is where users interact with a list of Collection Documents within the Admin Panel. This is where they can view, sort, filter, and paginate their documents to find exactly what they're looking for. Users can also perform bulk operations on multiple documents at once, such as deleting, editing, or publishing many.

### Key Concepts

- **Collection-Only**: Only Collections have a List View (Globals are single documents)
- **View and Manage**: Users can view, sort, filter, and paginate documents
- **Bulk Operations**: Perform operations on multiple documents at once
- **Customization Levels**: Replace the entire view or inject custom components
- **Component Injection**: Add components before/after list elements

### Customization Options

**Complete Replacement:**
- Replace the entire List View with a Custom View

**Component Overrides:**
- Inject components before/after the list
- Inject components before/after the table
- Add custom menu items
- Customize the description

**Note**: Globals do not have a List View as they are single documents.

---

## Custom List View

To swap out the entire List View with a Custom View, use the `admin.components.views.list` property in your Collection Config.

### Configuration

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      views: {
        list: {
          Component: '/path/to/MyCustomListView',
        },
      },
    },
  },
}
```

### Server Component Example

```typescript
import React from 'react'
import type { ListViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Table } from '@payloadcms/ui'

export async function MyCustomServerListView(props: ListViewServerProps) {
  const {
    initPageResult,
    params,
    searchParams,
  } = props

  const { payload } = initPageResult.req
  const collection = params?.slug as string

  // Fetch documents with pagination
  const page = Number(searchParams?.page) || 1
  const limit = Number(searchParams?.limit) || 10

  const result = await payload.find({
    collection,
    limit,
    page,
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
        <h1>Custom List View (Server Component)</h1>
        
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {result.docs.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.title}</td>
                <td>{doc._status || 'draft'}</td>
                <td>{new Date(doc.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination */}
        {result.hasPrevPage && (
          <a href={`?page=${result.prevPage}`}>Previous</a>
        )}
        {result.hasNextPage && (
          <a href={`?page=${result.nextPage}`}>Next</a>
        )}
      </Gutter>
    </DefaultTemplate>
  )
}
```

### Client Component Example

```typescript
'use client'

import React, { useEffect, useState } from 'react'
import type { ListViewClientProps } from 'payload'
import { Gutter, Table } from '@payloadcms/ui'

export function MyCustomClientListView(props: ListViewClientProps) {
  const {
    initPageResult,
    params,
    searchParams,
  } = props

  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch documents
    const fetchDocs = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/${params?.slug}?page=${searchParams?.page || 1}`
        )
        const data = await response.json()
        setDocs(data.docs || [])
      } catch (error) {
        console.error('Failed to fetch documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocs()
  }, [params?.slug, searchParams?.page])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Gutter>
      <h1>Custom List View (Client Component)</h1>
      
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc: any) => (
            <tr key={doc.id}>
              <td>{doc.title}</td>
              <td>{doc._status || 'draft'}</td>
              <td>{new Date(doc.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Gutter>
  )
}
```

**Note**: For details on building Custom Views, including all available props, see the [Customizing Views Guide](CUSTOMIZING_VIEWS.md).

---

## Custom Components

In addition to swapping out the entire List View, you can override individual components. This allows you to customize specific parts of the List View without replacing the entire view.

### Configuration

To override List View components for a Collection, use the `admin.components` property in your Collection Config:

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      beforeList: ['/path/to/Component'],
      beforeListTable: ['/path/to/Component'],
      afterListTable: ['/path/to/Component'],
      afterList: ['/path/to/Component'],
      listMenuItems: ['/path/to/Component'],
      Description: '/path/to/Description',
    },
  },
}
```

### Available Components

| Property | Type | Description |
|----------|------|-------------|
| `beforeList` | Array | Components injected before the list of documents |
| `beforeListTable` | Array | Components injected before the table of documents |
| `afterListTable` | Array | Components injected after the table of documents |
| `afterList` | Array | Components injected after the list of documents |
| `listMenuItems` | Array | Components in menu next to List Controls (after Columns and Filters) |
| `Description` | Component | Description of the Collection (shared with Edit View) |

---

## Component Reference

### beforeList

The `beforeList` property allows you to inject custom components before the list of documents in the List View.

**Configuration:**
```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      beforeList: ['/path/to/MyBeforeListComponent'],
    },
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import type { BeforeListServerProps } from 'payload'
import { Banner } from '@payloadcms/ui/elements/Banner'

export function MyBeforeListComponent(props: BeforeListServerProps) {
  const { collectionSlug } = props

  return (
    <Banner type="info">
      <p>You are viewing the <strong>{collectionSlug}</strong> collection.</p>
      <p>Use filters and search to find specific documents.</p>
    </Banner>
  )
}
```

**Client Component:**
```typescript
'use client'

import React, { useState } from 'react'
import type { BeforeListClientProps } from 'payload'
import { Button, Banner } from '@payloadcms/ui'

export function MyBeforeListComponent(props: BeforeListClientProps) {
  const { collectionSlug } = props
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Banner type="info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Welcome to the {collectionSlug} collection</span>
          <Button
            buttonStyle="secondary"
            onClick={() => setShowHelp(!showHelp)}
          >
            {showHelp ? 'Hide' : 'Show'} Help
          </Button>
        </div>
      </Banner>
      {showHelp && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--theme-elevation-50)',
          marginTop: '0.5rem',
          borderRadius: '4px',
        }}>
          <p>Tips for using this collection:</p>
          <ul>
            <li>Use the search bar to find documents</li>
            <li>Click column headers to sort</li>
            <li>Use filters to narrow results</li>
          </ul>
        </div>
      )}
    </div>
  )
}
```

**Use Cases:**
- Welcome messages or instructions
- Collection statistics or summaries
- Quick action buttons
- Search tips or help content
- Announcements or notifications

**Available Props:**
- Server: `BeforeListServerProps` - Contains collection slug and list metadata
- Client: `BeforeListClientProps` - Contains serializable collection slug and list metadata

---

### beforeListTable

The `beforeListTable` property allows you to inject custom components before the table of documents in the List View.

**Configuration:**
```typescript
admin: {
  components: {
    beforeListTable: ['/path/to/MyBeforeListTableComponent'],
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import type { BeforeListTableServerProps } from 'payload'
import { Button } from '@payloadcms/ui'

export function MyBeforeListTableComponent(props: BeforeListTableServerProps) {
  const { collectionSlug } = props

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '1rem',
    }}>
      <h2>Documents</h2>
      <Button
        href={`/admin/collections/${collectionSlug}/create`}
        buttonStyle="primary"
      >
        Create New
      </Button>
    </div>
  )
}
```

**Client Component:**
```typescript
'use client'

import React from 'react'
import type { BeforeListTableClientProps } from 'payload'
import { Button } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export function MyBeforeListTableComponent(props: BeforeListTableClientProps) {
  const { collectionSlug } = props
  const router = useRouter()

  const handleCreate = () => {
    router.push(`/admin/collections/${collectionSlug}/create`)
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '1rem',
      padding: '1rem',
      backgroundColor: 'var(--theme-elevation-50)',
      borderRadius: '4px',
    }}>
      <h3 style={{ margin: 0 }}>All Documents</h3>
      <Button
        onClick={handleCreate}
        buttonStyle="primary"
      >
        + Create New
      </Button>
    </div>
  )
}
```

**Use Cases:**
- Table header information
- Quick action buttons
- Bulk operation controls
- Summary statistics
- Custom filters

**Available Props:**
- Server: `BeforeListTableServerProps` - Contains collection slug and table metadata
- Client: `BeforeListTableClientProps` - Contains serializable collection slug and table metadata

---

### afterListTable

The `afterListTable` property allows you to inject custom components after the table of documents in the List View.

**Configuration:**
```typescript
admin: {
  components: {
    afterListTable: ['/path/to/MyAfterListTableComponent'],
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import type { AfterListTableServerProps } from 'payload'
import { Button } from '@payloadcms/ui'

export function MyAfterListTableComponent(props: AfterListTableServerProps) {
  const { collectionSlug, data } = props
  const totalDocs = data?.totalDocs || 0

  return (
    <div style={{ 
      padding: '1rem', 
      backgroundColor: 'var(--theme-elevation-50)',
      borderRadius: '4px',
      marginTop: '1rem',
    }}>
      <p style={{ margin: 0 }}>
        Total documents: <strong>{totalDocs}</strong>
      </p>
      <Button
        href={`/admin/collections/${collectionSlug}/export`}
        buttonStyle="secondary"
      >
        Export All
      </Button>
    </div>
  )
}
```

**Client Component:**
```typescript
'use client'

import React from 'react'
import type { AfterListTableClientProps } from 'payload'
import { Button } from '@payloadcms/ui'

export function MyAfterListTableComponent(props: AfterListTableClientProps) {
  const { collectionSlug, clientData } = props
  const totalDocs = clientData?.totalDocs || 0

  const handleExport = () => {
    window.open(`/api/${collectionSlug}/export`, '_blank')
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: 'var(--theme-elevation-50)',
      borderRadius: '4px',
      marginTop: '1rem',
    }}>
      <p style={{ margin: 0 }}>
        Showing {clientData?.docs?.length || 0} of {totalDocs} documents
      </p>
      <Button
        onClick={handleExport}
        buttonStyle="secondary"
      >
        Export All
      </Button>
    </div>
  )
}
```

**Use Cases:**
- Pagination controls
- Summary statistics
- Export/import actions
- Bulk operation results
- Quick navigation

**Available Props:**
- Server: `AfterListTableServerProps` - Contains collection slug and table data
- Client: `AfterListTableClientProps` - Contains serializable collection slug and table data

---

### afterList

The `afterList` property allows you to inject custom components after the list of documents in the List View.

**Configuration:**
```typescript
admin: {
  components: {
    afterList: ['/path/to/MyAfterListComponent'],
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import type { AfterListServerProps } from 'payload'
import { Link } from '@payloadcms/ui'

export function MyAfterListComponent(props: AfterListServerProps) {
  const { collectionSlug } = props

  return (
    <div style={{ 
      marginTop: '2rem', 
      padding: '1rem',
      borderTop: '1px solid var(--theme-elevation-200)',
    }}>
      <h3>Need Help?</h3>
      <p>
        Check out our{' '}
        <Link href={`/docs/collections/${collectionSlug}`} target="_blank">
          documentation
        </Link>
        {' '}or{' '}
        <Link href="/support" target="_blank">
          contact support
        </Link>
        .
      </p>
    </div>
  )
}
```

**Client Component:**
```typescript
'use client'

import React from 'react'
import type { AfterListClientProps } from 'payload'
import { Link, Button } from '@payloadcms/ui'

export function MyAfterListComponent(props: AfterListClientProps) {
  const { collectionSlug } = props

  return (
    <div style={{ 
      marginTop: '2rem', 
      padding: '1rem',
      backgroundColor: 'var(--theme-elevation-50)',
      borderRadius: '4px',
    }}>
      <h3>Related Actions</h3>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <Button
          href={`/admin/collections/${collectionSlug}/bulk-edit`}
          buttonStyle="secondary"
        >
          Bulk Edit
        </Button>
        <Button
          href={`/admin/collections/${collectionSlug}/archive`}
          buttonStyle="secondary"
        >
          View Archive
        </Button>
      </div>
    </div>
  )
}
```

**Use Cases:**
- Help links and resources
- Related actions or navigation
- Footer information
- Support links
- Additional collection information

**Available Props:**
- Server: `AfterListServerProps` - Contains collection slug and list metadata
- Client: `AfterListClientProps` - Contains serializable collection slug and list metadata

---

### listMenuItems

The `listMenuItems` property allows you to inject custom components into a menu next to the List Controls (after the Columns and Filters options).

**Configuration:**
```typescript
admin: {
  components: {
    listMenuItems: ['/path/to/MyListMenuItems'],
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import type { ListMenuItemsServerProps } from 'payload'
import { Link } from '@payloadcms/ui'

export function MyListMenuItems(props: ListMenuItemsServerProps) {
  const { collectionSlug } = props

  return (
    <>
      <Link href={`/admin/collections/${collectionSlug}/export`}>
        Export All
      </Link>
      <Link href={`/admin/collections/${collectionSlug}/import`}>
        Import
      </Link>
    </>
  )
}
```

**Client Component:**
```typescript
'use client'

import React from 'react'
import { PopupList } from '@payloadcms/ui'
import type { ListViewMenuItemClientProps } from 'payload'

export function MyListMenuItems(props: ListViewMenuItemClientProps) {
  const { collectionSlug } = props

  const handleExport = () => {
    window.open(`/api/${collectionSlug}/export`, '_blank')
  }

  const handleImport = () => {
    window.open(`/admin/collections/${collectionSlug}/import`, '_blank')
  }

  const handleBulkDelete = () => {
    if (confirm('Are you sure you want to delete all selected items?')) {
      // Bulk delete logic
      console.log('Bulk delete triggered')
    }
  }

  return (
    <PopupList.ButtonGroup>
      <PopupList.Button onClick={handleExport}>
        Export All
      </PopupList.Button>
      <PopupList.Button onClick={handleImport}>
        Import Data
      </PopupList.Button>
      <PopupList.Button onClick={handleBulkDelete}>
        Bulk Delete
      </PopupList.Button>
    </PopupList.ButtonGroup>
  )
}
```

**Styling Tip**: Use Payload's built-in `PopupList.Button` to ensure your menu items match the default dropdown styles.

**Use Cases:**
- Export/import functionality
- Bulk operations
- Collection management actions
- Custom workflows
- Integration actions

**Available Props:**
- Server: `ListMenuItemsServerProps` - Contains collection slug
- Client: `ListViewMenuItemClientProps` - Contains serializable collection slug

---

### Description

The `Description` property allows you to render a custom description of the Collection in the List View.

**Important**: The Description component is shared between the List View and the Edit View.

**Configuration:**
```typescript
admin: {
  components: {
    Description: '/path/to/MyDescriptionComponent',
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import type { ViewDescriptionServerProps } from 'payload'

export function MyDescriptionComponent(props: ViewDescriptionServerProps) {
  const { collectionSlug } = props

  return (
    <div style={{ 
      padding: '1rem', 
      backgroundColor: 'var(--theme-elevation-50)',
      borderRadius: '4px',
      marginBottom: '1rem',
    }}>
      <p style={{ margin: 0 }}>
        Use this collection to manage your <strong>{collectionSlug}</strong>.
        You can create, edit, and organize your documents here.
      </p>
    </div>
  )
}
```

**Client Component:**
```typescript
'use client'

import React from 'react'
import type { ViewDescriptionClientProps } from 'payload'
import { Link } from '@payloadcms/ui'

export function MyDescriptionComponent(props: ViewDescriptionClientProps) {
  const { collectionSlug } = props

  return (
    <div style={{ 
      padding: '1rem', 
      backgroundColor: 'var(--theme-elevation-50)',
      borderRadius: '4px',
      marginBottom: '1rem',
    }}>
      <p style={{ margin: 0, marginBottom: '0.5rem' }}>
        Manage your <strong>{collectionSlug}</strong> collection.
      </p>
      <p style={{ margin: 0, fontSize: '0.875rem' }}>
        <Link href={`/docs/collections/${collectionSlug}`} target="_blank">
          View documentation →
        </Link>
      </p>
    </div>
  )
}
```

**Use Cases:**
- Collection overview and instructions
- Usage guidelines
- Links to documentation
- Important notices
- Feature highlights

**Available Props:**
- Server: `ViewDescriptionServerProps` - Contains collection slug
- Client: `ViewDescriptionClientProps` - Contains serializable collection slug

---

## Examples

### Example 1: Enhanced List View with Statistics

**src/collections/Posts.ts:**
```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      beforeList: ['/src/components/PostStatistics'],
      beforeListTable: ['/src/components/PostQuickActions'],
      afterListTable: ['/src/components/PostSummary'],
      listMenuItems: ['/src/components/PostMenuItems'],
    },
  },
}
```

**src/components/PostStatistics.tsx:**
```typescript
'use client'

import React, { useEffect, useState } from 'react'
import type { BeforeListClientProps } from 'payload'
import { Card } from '@payloadcms/ui'

export function PostStatistics(props: BeforeListClientProps) {
  const { collectionSlug } = props
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
  })

  useEffect(() => {
    fetch(`/api/${collectionSlug}/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => console.error('Failed to fetch stats:', error))
  }, [collectionSlug])

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '1rem',
      marginBottom: '2rem',
    }}>
      <Card>
        <h3>Total Posts</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</p>
      </Card>
      <Card>
        <h3>Published</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'green' }}>
          {stats.published}
        </p>
      </Card>
      <Card>
        <h3>Drafts</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'orange' }}>
          {stats.draft}
        </p>
      </Card>
    </div>
  )
}
```

### Example 2: Bulk Actions Menu

**src/components/PostMenuItems.tsx:**
```typescript
'use client'

import React from 'react'
import { PopupList } from '@payloadcms/ui'
import type { ListViewMenuItemClientProps } from 'payload'

export function PostMenuItems(props: ListViewMenuItemClientProps) {
  const { collectionSlug } = props

  const handleBulkPublish = () => {
    if (confirm('Publish all selected posts?')) {
      // Bulk publish logic
      console.log('Bulk publish')
    }
  }

  const handleBulkDelete = () => {
    if (confirm('Delete all selected posts? This cannot be undone.')) {
      // Bulk delete logic
      console.log('Bulk delete')
    }
  }

  const handleExport = () => {
    window.open(`/api/${collectionSlug}/export`, '_blank')
  }

  return (
    <PopupList.ButtonGroup>
      <PopupList.Button onClick={handleBulkPublish}>
        Publish Selected
      </PopupList.Button>
      <PopupList.Button onClick={handleBulkDelete}>
        Delete Selected
      </PopupList.Button>
      <PopupList.Button onClick={handleExport}>
        Export All
      </PopupList.Button>
    </PopupList.ButtonGroup>
  )
}
```

### Example 3: Complete List View Customization

**src/collections/Posts.ts:**
```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      Description: '/src/components/PostDescription',
      beforeList: [
        '/src/components/PostStatistics',
        '/src/components/PostBanner',
      ],
      beforeListTable: ['/src/components/PostQuickActions'],
      afterListTable: ['/src/components/PostPagination'],
      afterList: ['/src/components/PostHelp'],
      listMenuItems: ['/src/components/PostMenuItems'],
    },
    views: {
      list: {
        Component: '/src/views/PostsListView', // Optional: custom view
      },
    },
  },
}
```

---

## Best Practices

### 1. Choose the Right Customization Level

```typescript
// ✅ Good: Use component injection for specific elements
admin: {
  components: {
    beforeList: ['/path/to/Component'],
  },
}

// ✅ Good: Use custom view when you need complete control
admin: {
  components: {
    views: {
      list: {
        Component: '/path/to/CustomListView',
      },
    },
  },
}

// ❌ Avoid: Overriding everything when you only need one component
```

### 2. Performance Considerations

```typescript
// ✅ Good: Use Server Components for data fetching
export async function MyComponent(props: BeforeListServerProps) {
  const data = await fetchData()
  return <div>{/* Render */}</div>
}

// ✅ Good: Client Components for interactivity only
'use client'

export function MyComponent(props: BeforeListClientProps) {
  const [state, setState] = useState(false)
  return <div>{/* Interactive UI */}</div>
}
```

### 3. Reuse Payload Components

```typescript
// ✅ Good: Use Payload's UI components
import { Button, Card, Banner } from '@payloadcms/ui'

export function MyComponent() {
  return (
    <Card>
      <Banner type="info">Message</Banner>
      <Button buttonStyle="primary">Action</Button>
    </Card>
  )
}
```

### 4. Handle Loading States

```typescript
// ✅ Good: Show loading states
'use client'

export function MyComponent() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchData().then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Loading...</div>
  return <div>{/* Render data */}</div>
}
```

### 5. Maintain Consistency

```typescript
// ✅ Good: Consistent styling with Payload
<div style={{
  padding: '1rem',
  backgroundColor: 'var(--theme-elevation-50)',
  borderRadius: '4px',
}}>
  Content
</div>
```

---

## Quick Reference

### Configuration Template

```typescript
admin: {
  components: {
    // List View Components
    Description: '/path/to/Description',
    beforeList: ['/path/to/Component'],
    beforeListTable: ['/path/to/Component'],
    afterListTable: ['/path/to/Component'],
    afterList: ['/path/to/Component'],
    listMenuItems: ['/path/to/Component'],
    
    // Custom List View
    views: {
      list: {
        Component: '/path/to/CustomListView',
      },
    },
  },
}
```

### Component Props

**Server Component Props:**
- `ListViewServerProps` - Full List View
- `BeforeListServerProps` - Before list
- `BeforeListTableServerProps` - Before table
- `AfterListTableServerProps` - After table
- `AfterListServerProps` - After list
- `ListMenuItemsServerProps` - Menu items
- `ViewDescriptionServerProps` - Description

**Client Component Props:**
- `ListViewClientProps` - Full List View
- `BeforeListClientProps` - Before list
- `BeforeListTableClientProps` - Before table
- `AfterListTableClientProps` - After table
- `AfterListClientProps` - After list
- `ListViewMenuItemClientProps` - Menu items
- `ViewDescriptionClientProps` - Description

### Component Types Summary

| Component | Type | Multiple | Collections | Globals |
|-----------|------|----------|-------------|---------|
| `beforeList` | Array | ✅ | ✅ | ❌ |
| `beforeListTable` | Array | ✅ | ✅ | ❌ |
| `afterListTable` | Array | ✅ | ✅ | ❌ |
| `afterList` | Array | ✅ | ✅ | ❌ |
| `listMenuItems` | Array | ✅ | ✅ | ❌ |
| `Description` | Component | ❌ | ✅ | ✅ |
| `views.list` | Component | ❌ | ✅ | ❌ |

---

## Troubleshooting

### Component Not Rendering

**Problem**: Custom component doesn't appear in List View.

**Solutions:**
- Verify path is correct relative to `baseDir`
- Check component is exported correctly
- Regenerate import map: `payload generate:importmap`
- Ensure component is in `admin.components` (not `admin.components.views`)
- Check browser console for errors

### Props Undefined

**Problem**: Props are undefined in custom component.

**Solutions:**
- Verify component type (Server vs Client)
- Use correct TypeScript types
- Check that props match expected structure
- Ensure component receives props from Payload

### Performance Issues

**Problem**: List View loads slowly with custom components.

**Solutions:**
- Use Server Components for data fetching
- Lazy load heavy components
- Minimize data fetching in Client Components
- Optimize component renders with React.memo

---

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Customizing Views Guide](CUSTOMIZING_VIEWS.md)
- [Edit View Guide](EDIT_VIEW.md)
- [React Component Personalization Guide](REACT_COMPONENT_PERSONALIZATION.md)

---

*Last updated: 2024*

