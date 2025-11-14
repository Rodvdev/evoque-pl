# Customizing Views in Payload CMS

Complete guide to creating and customizing views in the Payload Admin Panel.

## Table of Contents

1. [Overview](#overview)
2. [View Types](#view-types)
3. [Configuration](#configuration)
4. [Building Custom Views](#building-custom-views)
5. [View Templates](#view-templates)
6. [Securing Custom Views](#securing-custom-views)
7. [Root Views](#root-views)
8. [Collection Views](#collection-views)
9. [Global Views](#global-views)
10. [Document Views](#document-views)
11. [Default Props](#default-props)
12. [Examples](#examples)
13. [Best Practices](#best-practices)

---

## Overview

Views are the individual pages that make up the Admin Panel, such as the Dashboard, List View, and Edit View. Custom Views are one of the most powerful ways to customize the Admin Panel, allowing you to either replace built-in views or create entirely new ones.

### Key Concepts

- **Custom Views**: Custom Components rendered at the page-level
- **Replace or Add**: You can replace existing views or add completely new ones
- **Server Components**: Custom Views are React Server Components by default
- **Templates**: Built-in templates provide consistent layout and navigation
- **Security**: Custom Views are public by default - you must handle authentication

---

## View Types

There are four types of views within the Admin Panel:

### 1. Root Views

Root Views are the main views scoped directly under the `/admin` route:
- Dashboard
- Account
- Custom root-level pages

**Route Examples:**
- `/admin` - Dashboard
- `/admin/account` - Account page
- `/admin/custom-view` - Custom root view

### 2. Collection Views

Collection Views are scoped under the `/admin/collections` route:
- List View - Shows all documents in a collection
- Edit View - Edits a specific document
- Custom collection-level pages

**Route Examples:**
- `/admin/collections/posts` - Posts list view
- `/admin/collections/posts/:id` - Edit post view
- `/admin/collections/posts/custom-view` - Custom collection view

### 3. Global Views

Global Views are scoped under the `/admin/globals` route:
- Edit View - Edits a global document
- Custom global-level pages

**Route Examples:**
- `/admin/globals/header` - Edit header global
- `/admin/globals/header/custom-view` - Custom global view

### 4. Document Views

Document Views are nested views within Edit Views for collections and globals:
- Default edit view
- Custom tabs/views within document editing

**Route Examples:**
- `/admin/collections/posts/:id` - Default document view
- `/admin/collections/posts/:id/preview` - Custom document view

---

## Configuration

### Replacing Views

To customize views, use the `admin.components.views` property in your Payload Config:

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    components: {
      views: {
        dashboard: {
          Component: '/path/to/MyCustomDashboard',
        },
      },
    },
  },
})
```

### View Configuration Properties

For more granular control, pass a configuration object instead:

| Property | Required | Description |
|----------|----------|-------------|
| `Component` | Yes | Component path that should be rendered when a user navigates to this route |
| `path` | Yes (for new views) | URL path or array of paths (must begin with `/`) |
| `exact` | No | Boolean. When `true`, only matches if path matches `usePathname()` exactly |
| `strict` | No | Boolean. When `true`, trailing slashes must match exactly |
| `sensitive` | No | Boolean. When `true`, path matching is case sensitive |
| `meta` | No | Page metadata overrides for the Admin Panel |

### Adding New Views

To add a new view to the Admin Panel, simply add your own key to the views object. New views require at least the `Component` and `path` properties:

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    components: {
      views: {
        myCustomView: {
          Component: '/path/to/MyCustomView#MyCustomViewComponent',
          path: '/my-custom-view',
        },
      },
    },
  },
})
```

**Important**: Routes are cascading. Unless explicitly given the `exact` property, they will match on URLs that start with the route's path. Define nested routes before parent routes to avoid conflicts.

---

## Building Custom Views

Custom Views are Custom Components rendered at the page-level. The process is the same regardless of the view type you're customizing.

### Prerequisites

Before building Custom Views, review the [Building Custom Components](REACT_COMPONENT_PERSONALIZATION.md) guide to understand:
- Server vs Client Components
- Component props
- Styling
- Performance best practices

### Basic Custom View

Here's a simple Custom View component:

```typescript
import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

export function MyCustomView(props: AdminViewServerProps) {
  return (
    <Gutter>
      <h1>Custom Root View</h1>
      <p>This is a custom view without a template.</p>
    </Gutter>
  )
}
```

---

## View Templates

Your Custom Root Views can optionally use one of the templates that Payload provides. The most common is the **Default Template**, which provides basic layout and navigation.

### Using the Default Template

```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

export function MyCustomView({
  initPageResult,
  params,
  searchParams,
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
        <h1>Custom Root View with Template</h1>
        <p>This view uses the Default Template.</p>
      </Gutter>
    </DefaultTemplate>
  )
}
```

### Available Templates

- **DefaultTemplate**: Provides basic layout with navigation sidebar
- Custom templates can be created by examining Payload's template structure

### When to Use Templates

**Use Templates When:**
- You want consistent navigation and layout
- You're replacing an existing view (dashboard, account, etc.)
- You want the standard Admin Panel header and sidebar

**Don't Use Templates When:**
- Creating a full-screen custom view
- Building a modal or embedded view
- You need complete control over layout

---

## Securing Custom Views

**Important**: All Custom Views are **public by default**. You must handle authentication and authorization within your view component.

### Basic Authentication Check

```typescript
import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

export function MyCustomView({ initPageResult }: AdminViewServerProps) {
  const {
    req: { user },
  } = initPageResult

  if (!user) {
    return (
      <Gutter>
        <p>You must be logged in to view this page.</p>
      </Gutter>
    )
  }

  return (
    <Gutter>
      <h1>Protected Custom View</h1>
      <p>Welcome, {user.email}!</p>
    </Gutter>
  )
}
```

### Role-Based Access Control

```typescript
import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

export function AdminOnlyView({ initPageResult }: AdminViewServerProps) {
  const {
    req: { user },
    permissions,
  } = initPageResult

  // Check if user is logged in
  if (!user) {
    return (
      <Gutter>
        <p>You must be logged in to view this page.</p>
      </Gutter>
    )
  }

  // Check if user has admin role
  if (user.roles && !user.roles.includes('admin')) {
    return (
      <Gutter>
        <p>You do not have permission to view this page.</p>
      </Gutter>
    )
  }

  // Check specific permission
  if (!permissions?.canAccessAdmin) {
    return (
      <Gutter>
        <p>Access denied.</p>
      </Gutter>
    )
  }

  return (
    <Gutter>
      <h1>Admin Only View</h1>
      <p>This view is only accessible to admins.</p>
    </Gutter>
  )
}
```

### Redirecting Unauthorized Users

```typescript
import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'

export async function SecureView({ initPageResult }: AdminViewServerProps) {
  const {
    req: { user },
  } = initPageResult

  if (!user) {
    redirect('/admin/login')
  }

  // Check permissions
  if (!initPageResult.permissions?.canAccessAdmin) {
    redirect('/admin/unauthorized')
  }

  return (
    <div>
      <h1>Secure View</h1>
      <p>Content here</p>
    </div>
  )
}
```

---

## Root Views

Root Views are the main views scoped directly under the `/admin` route.

### Configuration

Configure Root Views at the root of your Payload Config:

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    components: {
      views: {
        dashboard: {
          Component: '/path/to/Dashboard',
        },
        account: {
          Component: '/path/to/Account',
        },
        // Add custom root views
        analytics: {
          Component: '/path/to/Analytics',
          path: '/analytics',
        },
      },
    },
  },
})
```

### Available Root View Keys

| Key | Description | Default Route |
|-----|-------------|---------------|
| `dashboard` | Main landing page of the Admin Panel | `/admin` |
| `account` | Account page for the logged-in user | `/admin/account` |
| `[key]` | Any other key creates a new Root View | `/admin/[key]` |

### Example: Custom Dashboard

**payload.config.ts:**
```typescript
admin: {
  components: {
    views: {
      dashboard: {
        Component: '/src/views/Dashboard#CustomDashboard',
      },
    },
  },
}
```

**src/views/Dashboard.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

export async function CustomDashboard({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { payload } = initPageResult.req

  // Fetch data using the Local API
  const { docs: posts } = await payload.find({
    collection: 'posts',
    limit: 5,
  })

  const { docs: pages } = await payload.find({
    collection: 'pages',
    limit: 5,
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
        <h1>Custom Dashboard</h1>
        
        <section>
          <h2>Recent Posts ({posts.length})</h2>
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <a href={`/admin/collections/posts/${post.id}`}>
                  {post.title}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Recent Pages ({pages.length})</h2>
          <ul>
            {pages.map((page) => (
              <li key={page.id}>
                <a href={`/admin/collections/pages/${page.id}`}>
                  {page.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </Gutter>
    </DefaultTemplate>
  )
}
```

### Example: Adding a New Root View

**payload.config.ts:**
```typescript
admin: {
  components: {
    views: {
      analytics: {
        Component: '/src/views/Analytics',
        path: '/analytics',
        exact: true,
      },
    },
  },
}
```

**src/views/Analytics.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import React from 'react'

export async function Analytics({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  // Securing the view
  if (!initPageResult.req.user) {
    return (
      <Gutter>
        <p>You must be logged in to view analytics.</p>
      </Gutter>
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
        <h1>Analytics Dashboard</h1>
        <p>Analytics content goes here...</p>
      </Gutter>
    </DefaultTemplate>
  )
}
```

---

## Collection Views

Collection Views are scoped under the `/admin/collections` route.

### Configuration

Configure Collection Views in your Collection Config:

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollectionConfig: CollectionConfig = {
  slug: 'posts',
  // ... other collection config
  admin: {
    components: {
      views: {
        list: {
          Component: '/path/to/CustomListView',
        },
        edit: {
          default: {
            Component: '/path/to/CustomEditView',
          },
        },
        // Add custom collection views
        bulkActions: {
          Component: '/path/to/BulkActionsView',
          path: '/bulk-actions',
        },
      },
    },
  },
}
```

### Available Collection View Keys

| Key | Description | Default Route |
|-----|-------------|---------------|
| `list` | List View showing all documents | `/admin/collections/[slug]` |
| `edit` | Edit View for a document (contains Document Views) | `/admin/collections/[slug]/:id` |
| `[key]` | Any other key creates a new Collection View | `/admin/collections/[slug]/[key]` |

### Example: Custom List View

**src/collections/Posts.ts:**
```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  // ... fields, etc.
  admin: {
    components: {
      views: {
        list: {
          Component: '/src/views/PostsListView',
        },
      },
    },
  },
}
```

**src/views/PostsListView.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Table } from '@payloadcms/ui'
import React from 'react'

export async function PostsListView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { payload } = initPageResult.req
  const collection = 'posts'

  // Fetch documents with pagination
  const page = Number(searchParams?.page) || 1
  const limit = Number(searchParams?.limit) || 10

  const result = await payload.find({
    collection,
    limit,
    page,
    where: {
      // Add filters based on searchParams
    },
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
        <h1>Posts</h1>
        
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.docs.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post._status || 'draft'}</td>
                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                <td>
                  <a href={`/admin/collections/posts/${post.id}`}>
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Pagination */}
        <div>
          {result.hasPrevPage && (
            <a href={`?page=${result.prevPage}`}>Previous</a>
          )}
          {result.hasNextPage && (
            <a href={`?page=${result.nextPage}`}>Next</a>
          )}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
```

### Example: Custom Collection View

**src/collections/Posts.ts:**
```typescript
admin: {
  components: {
    views: {
      export: {
        Component: '/src/views/ExportPostsView',
        path: '/export',
        exact: true,
      },
    },
  },
}
```

**src/views/ExportPostsView.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Button } from '@payloadcms/ui'
import React from 'react'

export async function ExportPostsView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { payload } = initPageResult.req

  // Check permissions
  if (!initPageResult.req.user) {
    return (
      <Gutter>
        <p>You must be logged in to export posts.</p>
      </Gutter>
    )
  }

  const handleExport = async () => {
    // Export logic here
    const posts = await payload.find({
      collection: 'posts',
      limit: 1000,
    })
    // ... export to CSV, JSON, etc.
  }

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
        <h1>Export Posts</h1>
        <p>Export all posts to various formats.</p>
        <Button onClick={handleExport}>Export to CSV</Button>
      </Gutter>
    </DefaultTemplate>
  )
}
```

---

## Global Views

Global Views are scoped under the `/admin/globals` route.

### Configuration

Configure Global Views in your Global Config:

```typescript
import type { GlobalConfig } from 'payload'

export const MyGlobalConfig: GlobalConfig = {
  slug: 'header',
  // ... other global config
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '/path/to/CustomGlobalEditView',
          },
        },
        // Add custom global views
        preview: {
          Component: '/path/to/PreviewView',
          path: '/preview',
        },
      },
    },
  },
}
```

### Available Global View Keys

| Key | Description | Default Route |
|-----|-------------|---------------|
| `edit` | Edit View for the global (contains Document Views) | `/admin/globals/[slug]` |
| `[key]` | Any other key creates a new Global View | `/admin/globals/[slug]/[key]` |

### Example: Custom Global Edit View

**src/globals/Header.ts:**
```typescript
import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  // ... fields
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '/src/views/HeaderEditView',
          },
        },
      },
    },
  },
}
```

**src/views/HeaderEditView.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Form } from '@payloadcms/ui'
import React from 'react'

export async function HeaderEditView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { payload } = initPageResult.req
  const global = 'header'

  // Fetch global document
  const globalData = await payload.findGlobal({
    slug: global,
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
        <h1>Edit Header</h1>
        <p>Custom edit view for header global.</p>
        
        {/* Add custom form or fields here */}
        <div>
          <p>Current site name: {globalData?.siteName || 'Not set'}</p>
          {/* Custom form components */}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
```

---

## Document Views

Document Views are nested views within Edit Views for collections and globals. They allow you to create custom tabs or views within document editing.

### Configuration

Configure Document Views within the `edit` key:

```typescript
// Collection Document Views
admin: {
  components: {
    views: {
      edit: {
        default: {
          Component: '/path/to/DefaultEditView',
        },
        preview: {
          Component: '/path/to/PreviewView',
          path: '/preview',
        },
        history: {
          Component: '/path/to/HistoryView',
          path: '/history',
        },
      },
    },
  },
}

// Global Document Views (same structure)
admin: {
  components: {
    views: {
      edit: {
        default: {
          Component: '/path/to/DefaultGlobalEditView',
        },
        preview: {
          Component: '/path/to/PreviewView',
          path: '/preview',
        },
      },
    },
  },
}
```

### Example: Custom Document Views with Tabs

**src/collections/Posts.ts:**
```typescript
admin: {
  components: {
    views: {
      edit: {
        default: {
          Component: '/src/views/PostEditView#DefaultPostEdit',
        },
        preview: {
          Component: '/src/views/PostEditView#PreviewPostEdit',
          path: '/preview',
        },
        analytics: {
          Component: '/src/views/PostEditView#AnalyticsPostEdit',
          path: '/analytics',
        },
      },
    },
  },
}
```

**src/views/PostEditView.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Tabs } from '@payloadcms/ui'
import React from 'react'

// Default edit view
export async function DefaultPostEdit({
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
        <h1>Edit Post: {post.title}</h1>
        
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

        {/* Default edit form would go here */}
        <p>Edit form content...</p>
      </Gutter>
    </DefaultTemplate>
  )
}

// Preview view
export async function PreviewPostEdit({
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
        
        <Tabs>
          <Tabs.List>
            <Tabs.Tab href={`/admin/collections/posts/${id}`}>
              Edit
            </Tabs.Tab>
            <Tabs.Tab 
              href={`/admin/collections/posts/${id}/preview`}
              isActive
            >
              Preview
            </Tabs.Tab>
            <Tabs.Tab href={`/admin/collections/posts/${id}/analytics`}>
              Analytics
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Preview content */}
        <article>
          <h2>{post.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </Gutter>
    </DefaultTemplate>
  )
}

// Analytics view
export async function AnalyticsPostEdit({
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
        <h1>Analytics: {post.title}</h1>
        
        <Tabs>
          <Tabs.List>
            <Tabs.Tab href={`/admin/collections/posts/${id}`}>
              Edit
            </Tabs.Tab>
            <Tabs.Tab href={`/admin/collections/posts/${id}/preview`}>
              Preview
            </Tabs.Tab>
            <Tabs.Tab 
              href={`/admin/collections/posts/${id}/analytics`}
              isActive
            >
              Analytics
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Analytics content */}
        <div>
          <p>Views: {post.views || 0}</p>
          <p>Comments: {post.commentCount || 0}</p>
          {/* More analytics... */}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
```

---

## Default Props

Your Custom Views receive the following props automatically:

| Prop | Type | Description |
|------|------|-------------|
| `initPageResult` | Object | Contains `req`, `payload`, `permissions`, `locale`, `visibleEntities`, etc. |
| `clientConfig` | Object | The Client Config object (serializable version of config) |
| `importMap` | Object | The import map object |
| `params` | Object | Dynamic Route Parameters (e.g., `{ id: '123' }` for `/collections/posts/123`) |
| `searchParams` | Object | Search Parameters from the URL query string |
| `doc` | Object | The document being edited (only in Document Views) |
| `i18n` | Object | The i18n object for translations |
| `payload` | Payload | The Payload class (from `initPageResult.req.payload`) |

### initPageResult Structure

```typescript
{
  req: {
    payload: Payload,
    user: User | null,
    i18n: I18n,
    // ... other request properties
  },
  permissions: {
    canAccessAdmin: boolean,
    // ... other permissions
  },
  locale: string,
  visibleEntities: Array<Entity>,
  // ... other properties
}
```

### Example: Using Props

```typescript
import type { AdminViewServerProps } from 'payload'
import React from 'react'

export function MyCustomView({
  initPageResult,
  params,
  searchParams,
  doc,
}: AdminViewServerProps) {
  const { payload, user } = initPageResult.req
  const { id } = params || {}
  const { page = '1' } = searchParams || {}

  return (
    <div>
      <h1>Custom View</h1>
      {user && <p>Logged in as: {user.email}</p>}
      {id && <p>Document ID: {id}</p>}
      {doc && <p>Document: {doc.title}</p>}
      <p>Page: {page}</p>
    </div>
  )
}
```

---

## Examples

### Example 1: Simple Custom Dashboard

**payload.config.ts:**
```typescript
admin: {
  components: {
    views: {
      dashboard: {
        Component: '/src/views/CustomDashboard',
      },
    },
  },
}
```

**src/views/CustomDashboard.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Card } from '@payloadcms/ui'
import React from 'react'

export async function CustomDashboard({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { payload } = initPageResult.req
  const { user } = initPageResult.req

  // Fetch statistics
  const postsCount = await payload.count({
    collection: 'posts',
  })

  const pagesCount = await payload.count({
    collection: 'pages',
  })

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1>Welcome back, {user?.email}!</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <Card>
            <h2>Posts</h2>
            <p>{postsCount.totalDocs} total posts</p>
          </Card>
          <Card>
            <h2>Pages</h2>
            <p>{pagesCount.totalDocs} total pages</p>
          </Card>
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
```

### Example 2: Search View for Collection

**src/collections/Posts.ts:**
```typescript
admin: {
  components: {
    views: {
      search: {
        Component: '/src/views/SearchPostsView',
        path: '/search',
        exact: true,
      },
    },
  },
}
```

**src/views/SearchPostsView.tsx:**
```typescript
'use client'

import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Input } from '@payloadcms/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useTransition } from 'react'

export function SearchPostsView({
  initPageResult,
  params,
  searchParams: initialSearchParams,
}: AdminViewServerProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(initialSearchParams?.q || '')
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`/admin/collections/posts/search?q=${encodeURIComponent(searchTerm)}`)
    })
  }

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={initialSearchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1>Search Posts</h1>
        
        <form onSubmit={handleSearch}>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
          />
          <button type="submit" disabled={isPending}>
            {isPending ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search results would go here */}
      </Gutter>
    </DefaultTemplate>
  )
}
```

### Example 3: Settings View with Form

**payload.config.ts:**
```typescript
admin: {
  components: {
    views: {
      settings: {
        Component: '/src/views/SettingsView',
        path: '/settings',
        exact: true,
      },
    },
  },
}
```

**src/views/SettingsView.tsx:**
```typescript
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Button, Input } from '@payloadcms/ui'
import React from 'react'

export async function SettingsView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  // Secure the view
  if (!initPageResult.req.user) {
    return (
      <Gutter>
        <p>You must be logged in to access settings.</p>
      </Gutter>
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
        <h1>Settings</h1>
        
        <form action="/api/settings" method="POST">
          <div>
            <label htmlFor="siteName">Site Name</label>
            <Input
              id="siteName"
              name="siteName"
              defaultValue="My Site"
            />
          </div>
          
          <div>
            <label htmlFor="siteDescription">Site Description</label>
            <Input
              id="siteDescription"
              name="siteDescription"
              defaultValue=""
            />
          </div>

          <Button type="submit">Save Settings</Button>
        </form>
      </Gutter>
    </DefaultTemplate>
  )
}
```

---

## Best Practices

### 1. Always Secure Your Views

```typescript
// ✅ Good: Check authentication
if (!initPageResult.req.user) {
  return <div>Please log in</div>
}

// ✅ Good: Check permissions
if (!initPageResult.permissions?.canAccessAdmin) {
  return <div>Access denied</div>
}
```

### 2. Use Templates for Consistency

```typescript
// ✅ Good: Use DefaultTemplate for standard views
<DefaultTemplate {...props}>
  <Gutter>
    <h1>My View</h1>
  </Gutter>
</DefaultTemplate>

// ⚠️ Only skip templates for special cases
// (full-screen views, modals, etc.)
```

### 3. Handle Loading and Error States

```typescript
export async function MyView({ initPageResult }: AdminViewServerProps) {
  try {
    const data = await initPageResult.req.payload.find({
      collection: 'posts',
    })
    
    return <div>{/* Render data */}</div>
  } catch (error) {
    return <div>Error loading data: {error.message}</div>
  }
}
```

### 4. Use Server Components for Data Fetching

```typescript
// ✅ Good: Fetch data in Server Component
export async function MyView({ initPageResult }: AdminViewServerProps) {
  const data = await initPageResult.req.payload.find({
    collection: 'posts',
  })
  return <ClientComponent data={data.docs} />
}

// ❌ Avoid: Fetching in Client Component when possible
'use client'
export function MyView() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/posts').then(/* ... */)
  }, [])
}
```

### 5. Optimize Route Matching

```typescript
// ✅ Good: Use exact for specific routes
views: {
  specificView: {
    Component: '/path/to/Component',
    path: '/specific',
    exact: true, // Only matches /specific exactly
  },
}

// ✅ Good: Order nested routes before parent routes
views: {
  nested: {
    Component: '/path/to/Nested',
    path: '/parent/nested',
    exact: true,
  },
  parent: {
    Component: '/path/to/Parent',
    path: '/parent', // Matches /parent and /parent/*
  },
}
```

### 6. Access Document Data Efficiently

```typescript
// ✅ Good: Use doc prop when available (Document Views)
export function DocumentView({ doc }: AdminViewServerProps) {
  // doc is already fetched
  return <div>{doc.title}</div>
}

// ✅ Good: Fetch only when needed
export async function ListView({ initPageResult }: AdminViewServerProps) {
  const result = await initPageResult.req.payload.find({
    collection: 'posts',
    limit: 10, // Limit results
  })
  return <div>{/* Render */}</div>
}
```

### 7. Use TypeScript Types

```typescript
// ✅ Good: Use proper types
import type { AdminViewServerProps } from 'payload'

export function MyView(props: AdminViewServerProps) {
  // TypeScript will provide autocomplete and type checking
  const { initPageResult } = props
}
```

### 8. Handle Pagination and Filtering

```typescript
export async function ListView({
  initPageResult,
  searchParams,
}: AdminViewServerProps) {
  const page = Number(searchParams?.page) || 1
  const limit = Number(searchParams?.limit) || 10
  const search = searchParams?.search as string

  const result = await initPageResult.req.payload.find({
    collection: 'posts',
    limit,
    page,
    where: search
      ? {
          title: {
            contains: search,
          },
        }
      : undefined,
  })

  return (
    <div>
      {/* Results */}
      {result.hasPrevPage && <a href={`?page=${result.prevPage}`}>Previous</a>}
      {result.hasNextPage && <a href={`?page=${result.nextPage}`}>Next</a>}
    </div>
  )
}
```

---

## Quick Reference

### View Configuration Structure

```typescript
// Root Views (in payload.config.ts)
admin: {
  components: {
    views: {
      dashboard: { Component: '/path/to/Dashboard' },
      account: { Component: '/path/to/Account' },
      customView: {
        Component: '/path/to/Custom',
        path: '/custom',
        exact: true,
      },
    },
  },
}

// Collection Views (in Collection Config)
admin: {
  components: {
    views: {
      list: { Component: '/path/to/List' },
      edit: {
        default: { Component: '/path/to/Edit' },
        preview: {
          Component: '/path/to/Preview',
          path: '/preview',
        },
      },
      customView: {
        Component: '/path/to/Custom',
        path: '/custom',
      },
    },
  },
}

// Global Views (in Global Config)
admin: {
  components: {
    views: {
      edit: {
        default: { Component: '/path/to/Edit' },
        preview: {
          Component: '/path/to/Preview',
          path: '/preview',
        },
      },
    },
  },
}
```

### Default Props Quick Reference

```typescript
{
  initPageResult: {
    req: { payload, user, i18n, ... },
    permissions: { canAccessAdmin, ... },
    locale: string,
    visibleEntities: Array,
  },
  clientConfig: Object,
  importMap: Object,
  params: { [key: string]: string },
  searchParams: { [key: string]: string },
  doc?: Object, // Only in Document Views
  i18n: Object,
  payload: Payload,
}
```

### Security Checklist

- [ ] Check if user is logged in (`initPageResult.req.user`)
- [ ] Check permissions (`initPageResult.permissions`)
- [ ] Verify user roles if needed
- [ ] Handle unauthorized access gracefully
- [ ] Redirect or show error messages appropriately

---

## Troubleshooting

### View Not Showing

- Verify the path matches the route
- Check that `Component` path is correct
- Ensure the component is exported correctly
- Regenerate import map: `payload generate:importmap`
- Check browser console for errors

### Route Conflicts

- Use `exact: true` for specific routes
- Order nested routes before parent routes
- Check path patterns for conflicts

### Props Not Available

- Verify you're using the correct view type
- `doc` prop is only available in Document Views
- Check `initPageResult` structure

### Template Issues

- Ensure all required props are passed to templates
- Check that `initPageResult` contains expected data
- Verify user is logged in when accessing template

---

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Custom Components Guide](REACT_COMPONENT_PERSONALIZATION.md)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

---

*Last updated: 2024*

