# Server-side Live Preview in Payload CMS

Complete guide to implementing Server-side Live Preview in Payload CMS with Next.js App Router and other server-side frameworks.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Next.js App Router Implementation](#nextjs-app-router-implementation)
4. [Configuration](#configuration)
5. [Building Custom Components](#building-custom-components)
6. [Examples](#examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Quick Reference](#quick-reference)

---

## Overview

Server-side Live Preview is designed for front-end frameworks that support Server Components, such as Next.js App Router. Unlike client-side Live Preview, it works by making a roundtrip to the server every time a document is saved (draft save, autosave, or publish), refreshing the HTML with new data from the Local API.

### Key Concepts

- **Server Components Only**: Designed for React Server Components (Next.js App Router, etc.)
- **Roundtrip Refresh**: Refreshes the route on each save event
- **Autosave Recommended**: Enable Autosave for more responsive updates
- **postMessage Events**: Admin Panel emits `window.postMessage` events on save
- **Route Refresh**: Front-end refreshes the route to get new server-rendered HTML

### How It Works

1. **Admin Panel**: User edits a document in the Admin Panel
2. **Save Event**: Document is saved (draft, autosave, or publish)
3. **Message Event**: Admin Panel emits a `window.postMessage` event
4. **Front-end Listener**: Front-end component listens for the event
5. **Route Refresh**: Front-end calls `router.refresh()` (Next.js) or equivalent
6. **Server Render**: Server re-renders the page with fresh data from Payload
7. **Update Display**: Updated HTML is displayed in the iframe

### Server-side vs Client-side

| Aspect | Server-side | Client-side |
|--------|-------------|-------------|
| **Framework** | Next.js App Router, Server Components | Next.js Pages Router, React Router, Vue, etc. |
| **Update Method** | Route refresh → Server re-render | Form state → Direct DOM update |
| **Performance** | Slightly slower (server roundtrip) | Faster (client-side only) |
| **Data Freshness** | Always fresh from database | Uses cached form state |
| **Best For** | SSR apps, Server Components | Client-side apps, SPA |

---

## Prerequisites

### Required Packages

**For React/Next.js App Router:**
```bash
npm install @payloadcms/live-preview-react
```

**For Custom Implementation:**
```bash
npm install @payloadcms/live-preview
```

### Framework Requirements

- **Next.js App Router**: React Server Components support
- **Other Frameworks**: Server-side rendering capability
- **Draft Mode**: Enable draft/preview mode in your framework

---

## Next.js App Router Implementation

### Step 1: Create Refresh Component

Create a client component that handles route refreshing:

**src/components/LivePreviewListener/index.tsx:**
```typescript
'use client'

import { getClientSideURL } from '@/utilities/getURL'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()

  return (
    <PayloadLivePreview
      refresh={() => router.refresh()}
      serverURL={getClientSideURL()}
    />
  )
}
```

### Step 2: Add to Page Component

Add the component to your page, conditionally rendered when in draft mode:

**src/app/(frontend)/[slug]/page.tsx:**
```typescript
import { draftMode } from 'next/headers'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export default async function Page({ params }: { params: { slug: string } }) {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  // Fetch document with draft support
  const page = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: params.slug,
      },
    },
    draft: draft, // Use draft data when in preview mode
    limit: 1,
  })

  if (!page.docs?.[0]) {
    return <div>Page not found</div>
  }

  const pageData = page.docs[0]

  return (
    <article>
      {/* Render LivePreviewListener only in draft mode */}
      {draft && <LivePreviewListener />}

      <h1>{pageData.title}</h1>
      {/* Rest of your page content */}
    </article>
  )
}
```

### Step 3: Configure Collection

Configure Live Preview URL in your Collection Config:

**src/collections/Pages/index.ts:**
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
  versions: {
    drafts: {
      autosave: {
        interval: 100, // Recommended: Enable autosave for better UX
      },
    },
  },
  // ... fields, etc.
}
```

### Step 4: Configure Preview Path Generator

**src/utilities/generatePreviewPath.ts:**
```typescript
import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
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

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path: `${collectionPrefixMap[collection]}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
```

### Step 5: Create Preview Route Handler

**src/app/(frontend)/next/preview/route.ts:**
```typescript
import type { CollectionSlug, PayloadRequest } from 'payload'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import configPromise from '@payload-config'

export async function GET(req: NextRequest): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  const { searchParams } = new URL(req.url)

  const path = searchParams.get('path')
  const collection = searchParams.get('collection') as CollectionSlug
  const slug = searchParams.get('slug')
  const previewSecret = searchParams.get('previewSecret')

  // Verify preview secret
  if (previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  if (!path || !collection || !slug) {
    return new Response('Insufficient search params', { status: 404 })
  }

  if (!path.startsWith('/')) {
    return new Response('This endpoint can only be used for relative previews', { status: 500 })
  }

  // Verify authentication
  let user

  try {
    user = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    })
  } catch (error) {
    payload.logger.error({ err: error }, 'Error verifying token for live preview')
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  const draft = await draftMode()

  if (!user) {
    draft.disable()
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  // Enable draft mode
  draft.enable()

  redirect(path)
}
```

---

## Configuration

### Collection Configuration

**Live Preview URL:**
```typescript
admin: {
  livePreview: {
    url: ({ data, req }) => {
      // Generate preview URL based on document data
      return `/preview/${data?.slug}`
    },
  },
}
```

**Autosave Configuration:**
```typescript
versions: {
  drafts: {
    autosave: {
      interval: 100, // Milliseconds between autosaves (recommended: 100-500)
    },
  },
}
```

### Payload Config Configuration

**Breakpoints (Optional):**
```typescript
admin: {
  livePreview: {
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

### Environment Variables

```env
# Preview secret for secure preview access
PREVIEW_SECRET=your-secret-key-here

# Payload server URL (for LivePreviewListener)
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3000
```

---

## Building Custom Components

If you're using a different framework or need custom behavior, you can build your own router refresh component using the base `@payloadcms/live-preview` package.

### Installation

```bash
npm install @payloadcms/live-preview
```

### Available Functions

| Function | Description |
|----------|-------------|
| `ready` | Sends a `window.postMessage` event to the Admin Panel to indicate the front-end is ready |
| `isDocumentEvent` | Checks if a `MessageEvent` originates from the Admin Panel and is a document-level event |

### Custom React Component Example

**src/components/CustomLivePreview.tsx:**
```typescript
'use client'

import type React from 'react'
import { isDocumentEvent, ready } from '@payloadcms/live-preview'
import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export const CustomLivePreview: React.FC<{
  apiRoute?: string
  depth?: number
  refresh: () => void
  serverURL: string
}> = (props) => {
  const { apiRoute, depth, refresh, serverURL } = props
  const router = useRouter()
  const hasSentReadyMessage = useRef<boolean>(false)

  const onMessage = useCallback(
    (event: MessageEvent) => {
      if (isDocumentEvent(event, serverURL)) {
        if (typeof refresh === 'function') {
          refresh()
        }
      }
    },
    [refresh, serverURL],
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', onMessage)
    }

    if (!hasSentReadyMessage.current) {
      hasSentReadyMessage.current = true

      ready({
        serverURL,
      })
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', onMessage)
      }
    }
  }, [serverURL, onMessage, depth, apiRoute])

  return null
}
```

### Usage

```typescript
'use client'

import { CustomLivePreview } from '@/components/CustomLivePreview'
import { useRouter } from 'next/navigation'

export function MyPage() {
  const router = useRouter()

  return (
    <div>
      <CustomLivePreview
        refresh={() => router.refresh()}
        serverURL={process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}
      />
      {/* Page content */}
    </div>
  )
}
```

---

## Examples

### Example 1: Basic Implementation

**Complete setup with Pages collection:**

**src/components/LivePreviewListener/index.tsx:**
```typescript
'use client'

import { getClientSideURL } from '@/utilities/getURL'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()

  return (
    <PayloadLivePreview
      refresh={() => router.refresh()}
      serverURL={getClientSideURL()}
    />
  )
}
```

**src/app/(frontend)/[slug]/page.tsx:**
```typescript
import { draftMode } from 'next/headers'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

export default async function Page({ params }: { params: { slug: string } }) {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: params.slug,
      },
    },
    draft: draft,
    limit: 1,
  })

  const page = result.docs?.[0]

  if (!page) {
    return <div>Page not found</div>
  }

  return (
    <article>
      {draft && <LivePreviewListener />}
      <h1>{page.title}</h1>
      {/* Page content */}
    </article>
  )
}
```

**src/collections/Pages/index.ts:**
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
  versions: {
    drafts: {
      autosave: {
        interval: 100, // Autosave every 100ms for responsive preview
      },
    },
  },
  // ... fields
}
```

### Example 2: Posts Collection with Trash Support

**src/app/(frontend)/posts/[slug]/page.tsx:**
```typescript
import { draftMode } from 'next/headers'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export default async function Post({ params }: { params: { slug: string } }) {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  // Support for trashed documents in preview
  const result = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: params.slug,
      },
    },
    draft: draft,
    trash: draft, // Include trashed documents in draft mode
    limit: 1,
  })

  const post = result.docs?.[0]

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <article>
      {draft && <LivePreviewListener />}
      <h1>{post.title}</h1>
      {/* Post content */}
    </article>
  )
}
```

**src/collections/Posts/index.ts:**
```typescript
import type { CollectionConfig } from 'payload'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
    },
  },
  // ... fields
}
```

### Example 3: Multiple Collections

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

---

## Best Practices

### 1. Enable Autosave

```typescript
// ✅ Good: Enable autosave for responsive preview
versions: {
  drafts: {
    autosave: {
      interval: 100, // 100-500ms recommended
    },
  },
}

// ❌ Avoid: Disabling autosave makes preview less responsive
versions: {
  drafts: {
    autosave: false, // Updates only on manual save
  },
}
```

### 2. Conditional Rendering

```typescript
// ✅ Good: Only render listener in draft mode
export default async function Page() {
  const { isEnabled: draft } = await draftMode()
  
  return (
    <article>
      {draft && <LivePreviewListener />}
      {/* Content */}
    </article>
  )
}

// ❌ Avoid: Always rendering (unnecessary in production)
export default async function Page() {
  return (
    <article>
      <LivePreviewListener /> {/* Always rendered */}
      {/* Content */}
    </article>
  )
}
```

### 3. Use Draft Mode Correctly

```typescript
// ✅ Good: Fetch draft data when in draft mode
const { isEnabled: draft } = await draftMode()

const result = await payload.find({
  collection: 'pages',
  draft: draft, // Use draft data in preview mode
  where: {
    slug: { equals: params.slug },
  },
})
```

### 4. Handle Trashed Documents

```typescript
// ✅ Good: Include trashed documents in preview
const result = await payload.find({
  collection: 'posts',
  draft: draft,
  trash: draft, // Include trashed items in preview
  where: {
    slug: { equals: params.slug },
  },
})
```

### 5. Secure Preview Route

```typescript
// ✅ Good: Verify preview secret and authentication
export async function GET(req: NextRequest) {
  const previewSecret = searchParams.get('previewSecret')
  
  if (previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response('Unauthorized', { status: 403 })
  }

  const user = await payload.auth({ req, headers: req.headers })
  if (!user) {
    return new Response('Unauthorized', { status: 403 })
  }

  draft.enable()
  redirect(path)
}
```

### 6. Optimize Autosave Interval

```typescript
// ✅ Good: Balance responsiveness and performance
versions: {
  drafts: {
    autosave: {
      interval: 100, // Responsive without excessive server load
    },
  },
}

// ⚠️ Too frequent: May impact performance
interval: 50, // Very responsive but more server load

// ⚠️ Too slow: Less responsive
interval: 1000, // Less server load but slower updates
```

---

## Troubleshooting

### Updates Do Not Appear as Fast as Client-side Live Preview

**Problem**: Server-side Live Preview feels less snappy than client-side.

**Solution**: This is expected behavior. Server-side Live Preview refreshes the route after saves, while client-side updates form state directly.

**Recommendations**:
1. **Enable Autosave**: Makes updates feel more responsive
2. **Decrease Autosave Interval**: Try `100-375ms` for better responsiveness

```typescript
versions: {
  drafts: {
    autosave: {
      interval: 100, // Decrease for faster updates
    },
  },
}
```

### Iframe Refuses to Connect

**Problem**: Iframe cannot load your front-end application.

**Solution**: Update your Content Security Policy (CSP) to allow the Admin Panel domain:

```http
Content-Security-Policy: frame-ancestors "self" localhost:* https://your-site.com;
```

**Example for Next.js:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' localhost:* https://your-site.com;",
          },
        ],
      },
    ]
  },
}
```

### Preview Route Returns 403

**Problem**: Preview route returns "You are not allowed to preview this page".

**Solutions**:
1. **Check Preview Secret**: Ensure `PREVIEW_SECRET` matches in both `.env` files
2. **Verify Authentication**: User must be logged into Admin Panel
3. **Check Auth Hook**: Verify `payload.auth()` is working correctly

```typescript
// Verify in preview route
const user = await payload.auth({
  req: req as unknown as PayloadRequest,
  headers: req.headers,
})

if (!user) {
  return new Response('Unauthorized', { status: 403 })
}
```

### Changes Not Reflecting

**Problem**: Changes in Admin Panel don't appear in preview.

**Solutions**:
1. **Check Draft Mode**: Ensure draft mode is enabled in preview route
2. **Verify Draft Flag**: Use `draft: true` when fetching in preview
3. **Check Autosave**: Ensure autosave is working and saving successfully
4. **Browser Cache**: Hard refresh the preview iframe (Cmd+Shift+R)

```typescript
// Ensure draft mode is enabled
const { isEnabled: draft } = await draftMode()

// Fetch with draft flag
const result = await payload.find({
  collection: 'pages',
  draft: draft, // Important!
  where: { slug: { equals: params.slug } },
})
```

### LivePreviewListener Not Working

**Problem**: LivePreviewListener doesn't refresh the route.

**Solutions**:
1. **Check Server URL**: Ensure `serverURL` matches your Payload admin URL
2. **Verify Router**: Ensure using Next.js App Router (`next/navigation`)
3. **Check Client Component**: Ensure component has `'use client'` directive
4. **Verify Draft Mode**: Only works when `draft` is `true`

```typescript
// ✅ Correct: Client component with router
'use client'

import { useRouter } from 'next/navigation' // App Router

export const LivePreviewListener = () => {
  const router = useRouter()
  return <PayloadLivePreview refresh={() => router.refresh()} serverURL={...} />
}
```

### Preview URL Not Generating

**Problem**: Live Preview URL is null or incorrect.

**Solutions**:
1. **Check Slug**: Ensure document has a slug value
2. **Verify URL Function**: Check return value of `livePreview.url` function
3. **Check Collection Mapping**: Verify collection prefix mapping

```typescript
// ✅ Good: Handle missing slug
admin: {
  livePreview: {
    url: ({ data, req }) => {
      if (!data?.slug) return null // Handle missing slug
      return generatePreviewPath({
        slug: data.slug,
        collection: 'pages',
        req,
      })
    },
  },
}
```

---

## Quick Reference

### Package Installation

```bash
# For React/Next.js App Router
npm install @payloadcms/live-preview-react

# For custom implementation
npm install @payloadcms/live-preview
```

### Basic Setup

**1. Create LivePreviewListener:**
```typescript
'use client'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

export const LivePreviewListener = () => {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={process.env.NEXT_PUBLIC_PAYLOAD_URL} />
}
```

**2. Add to Page:**
```typescript
import { draftMode } from 'next/headers'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export default async function Page() {
  const { isEnabled: draft } = await draftMode()
  
  return (
    <article>
      {draft && <LivePreviewListener />}
      {/* Content */}
    </article>
  )
}
```

**3. Configure Collection:**
```typescript
admin: {
  livePreview: {
    url: ({ data, req }) => `/preview/${data?.slug}`,
  },
}
versions: {
  drafts: {
    autosave: { interval: 100 },
  },
}
```

### Configuration Options

**RefreshRouteOnSave Props:**
- `refresh` (required): Function to refresh the route
- `serverURL` (required): Payload server URL
- `apiRoute` (optional): API route path
- `depth` (optional): Query depth

**Collection Config:**
- `admin.livePreview.url`: Function to generate preview URL
- `versions.drafts.autosave.interval`: Autosave interval in milliseconds

**Payload Config:**
- `admin.livePreview.breakpoints`: Array of breakpoint configurations

### Environment Variables

```env
PREVIEW_SECRET=your-secret-key
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3000
```

### Common Patterns

**Multiple Collections:**
```typescript
const collectionPrefixMap = {
  posts: '/posts',
  pages: '',
  projects: '/projects',
}
```

**Trash Support:**
```typescript
const result = await payload.find({
  collection: 'posts',
  draft: draft,
  trash: draft, // Include trashed items
})
```

---

## Additional Resources

- [Payload CMS Live Preview Documentation](https://payloadcms.com/docs/live-preview/overview)
- [Next.js Draft Mode](https://nextjs.org/docs/app/api-reference/functions/draft-mode)
- [Official Live Preview Example](https://github.com/payloadcms/payload/tree/examples/live-preview)
- [Customizing Views Guide](CUSTOMIZING_VIEWS.md)

---

*Last updated: 2024*

