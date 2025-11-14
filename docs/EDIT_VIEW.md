# Edit View in Payload CMS

Complete guide to customizing the Edit View for Collections and Globals in Payload CMS.

## Table of Contents

1. [Overview](#overview)
2. [Custom Edit View](#custom-edit-view)
3. [Custom Components](#custom-components)
4. [Collections Configuration](#collections-configuration)
5. [Globals Configuration](#globals-configuration)
6. [Component Reference](#component-reference)
7. [Examples](#examples)
8. [Best Practices](#best-practices)
9. [Quick Reference](#quick-reference)

---

## Overview

The Edit View is where users interact with individual Collection and Global Documents within the Admin Panel. The Edit View contains the actual form that submits data to the server, allowing users to view, edit, and save their content. It contains controls for saving, publishing, and previewing the document.

### Key Concepts

- **Form Interface**: The Edit View contains the form that submits data
- **Document Controls**: Buttons for Save, Publish, Preview, etc.
- **Customization Levels**: Replace the entire view or individual components
- **Collections vs Globals**: Different configuration paths for each
- **Component Injection**: Add components before/after built-in elements

### Customization Options

**Complete Replacement:**
- Replace the entire Edit View with a Custom View

**Component Overrides:**
- Override individual components (buttons, menus, etc.)
- Inject components before/after built-in controls
- Customize specific UI elements

---

## Custom Edit View

To swap out the entire Edit View with a Custom View, use the `views.edit.default` property in your Collection Config or Global Config.

### Configuration

**Collections:**
```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '/path/to/MyCustomEditViewComponent',
          },
        },
      },
    },
  },
}
```

**Globals:**
```typescript
import type { GlobalConfig } from 'payload'

export const MyGlobal: GlobalConfig = {
  slug: 'header',
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '/path/to/MyCustomEditViewComponent',
          },
        },
      },
    },
  },
}
```

### Server Component Example

```typescript
import React from 'react'
import type { DocumentViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, Form } from '@payloadcms/ui'

export function MyCustomServerEditView(props: DocumentViewServerProps) {
  const {
    doc,
    initPageResult,
    params,
    searchParams,
  } = props

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
        <h1>Edit: {doc?.title || 'New Document'}</h1>
        <p>This is a custom Edit View (Server Component)</p>
        
        {/* Custom form implementation */}
        <Form>
          {/* Form fields */}
        </Form>
      </Gutter>
    </DefaultTemplate>
  )
}
```

### Client Component Example

```typescript
'use client'

import React from 'react'
import type { DocumentViewClientProps } from 'payload'
import { Gutter, Form } from '@payloadcms/ui'

export function MyCustomClientEditView(props: DocumentViewClientProps) {
  const {
    clientDoc,
    initPageResult,
    params,
    searchParams,
  } = props

  return (
    <Gutter>
      <h1>Edit: {clientDoc?.title || 'New Document'}</h1>
      <p>This is a custom Edit View (Client Component)</p>
      
      {/* Custom form implementation */}
      <Form>
        {/* Form fields */}
      </Form>
    </Gutter>
  )
}
```

**Note**: For details on building Custom Views, including all available props, see the [Customizing Views Guide](CUSTOMIZING_VIEWS.md).

---

## Custom Components

In addition to swapping out the entire Edit View, you can override individual components. This allows you to customize specific parts of the Edit View without replacing the entire view.

### Important: Collections vs Globals

**Collections** use `admin.components.edit`:
```typescript
admin: {
  components: {
    edit: {
      // Collection Edit View components
    },
  },
}
```

**Globals** use `admin.components.elements`:
```typescript
admin: {
  components: {
    elements: {
      // Global Edit View components
    },
  },
}
```

---

## Collections Configuration

To override Edit View components for a Collection, use the `admin.components.edit` property in your Collection Config.

### Configuration Structure

```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['/path/to/Component'],
        editMenuItems: ['/path/to/Component'],
        SaveButton: '/path/to/SaveButton',
        SaveDraftButton: '/path/to/SaveDraftButton',
        PublishButton: '/path/to/PublishButton',
        PreviewButton: '/path/to/PreviewButton',
        Description: '/path/to/Description',
        Upload: '/path/to/Upload', // Collections only
      },
    },
  },
}
```

### Available Components

| Property | Type | Description |
|----------|------|-------------|
| `beforeDocumentControls` | Array | Components injected before Save/Publish buttons |
| `editMenuItems` | Array | Components in the 3-dot menu dropdown |
| `SaveButton` | Component | Button that saves the document |
| `SaveDraftButton` | Component | Button that saves as draft |
| `PublishButton` | Component | Button that publishes the document |
| `PreviewButton` | Component | Button that previews the document |
| `Description` | Component | Description of the collection |
| `Upload` | Component | File upload component (Collections only) |

---

## Globals Configuration

To override Edit View components for Globals, use the `admin.components.elements` property in your Global Config.

### Configuration Structure

```typescript
import type { GlobalConfig } from 'payload'

export const MyGlobal: GlobalConfig = {
  slug: 'header',
  admin: {
    components: {
      elements: {
        beforeDocumentControls: ['/path/to/Component'],
        editMenuItems: ['/path/to/Component'],
        SaveButton: '/path/to/SaveButton',
        SaveDraftButton: '/path/to/SaveDraftButton',
        PublishButton: '/path/to/PublishButton',
        PreviewButton: '/path/to/PreviewButton',
        Description: '/path/to/Description',
      },
    },
  },
}
```

### Available Components

| Property | Type | Description |
|----------|------|-------------|
| `beforeDocumentControls` | Array | Components injected before Save/Publish buttons |
| `editMenuItems` | Array | Components in the 3-dot menu dropdown |
| `SaveButton` | Component | Button that saves the document |
| `SaveDraftButton` | Component | Button that saves as draft |
| `PublishButton` | Component | Button that publishes the document |
| `PreviewButton` | Component | Button that previews the document |
| `Description` | Component | Description of the global |

**Note**: `Upload` component is not available for Globals.

---

## Component Reference

### SaveButton

The `SaveButton` property allows you to render a custom Save Button in the Edit View.

**Configuration:**
```typescript
admin: {
  components: {
    edit: {
      SaveButton: '/path/to/MySaveButton',
    },
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import { SaveButton } from '@payloadcms/ui'
import type { SaveButtonServerProps } from 'payload'

export function MySaveButton(props: SaveButtonServerProps) {
  return <SaveButton label="Save" />
}
```

**Client Component:**
```typescript
'use client'

import React from 'react'
import { SaveButton } from '@payloadcms/ui'
import type { SaveButtonClientProps } from 'payload'

export function MySaveButton(props: SaveButtonClientProps) {
  return <SaveButton label="Save" />
}
```

**Available Props:**
- Server: `SaveButtonServerProps` - Contains document data and form state
- Client: `SaveButtonClientProps` - Contains serializable document data and form state

---

### beforeDocumentControls

The `beforeDocumentControls` property allows you to render custom components just before the default document action buttons (Save, Publish, Preview).

**Configuration (Collections):**
```typescript
export const MyCollection: CollectionConfig = {
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['/path/to/CustomComponent'],
      },
    },
  },
}
```

**Configuration (Globals):**
```typescript
export const MyGlobal: GlobalConfig = {
  admin: {
    components: {
      elements: {
        beforeDocumentControls: ['/path/to/CustomComponent'],
      },
    },
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import type { BeforeDocumentControlsServerProps } from 'payload'
import { Button } from '@payloadcms/ui'

export function MyCustomDocumentControlButton(
  props: BeforeDocumentControlsServerProps,
) {
  const { doc, collectionSlug } = props

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button
        onClick={() => {
          // Custom action
          console.log('Custom button clicked')
        }}
      >
        Custom Action
      </Button>
      {doc && (
        <Button
          onClick={() => {
            window.open(`/preview/${collectionSlug}/${doc.id}`, '_blank')
          }}
        >
          Preview
        </Button>
      )}
    </div>
  )
}
```

**Client Component:**
```typescript
'use client'

import React, { useState } from 'react'
import type { BeforeDocumentControlsClientProps } from 'payload'
import { Button } from '@payloadcms/ui'

export function MyCustomDocumentControlButton(
  props: BeforeDocumentControlsClientProps,
) {
  const { clientDoc, collectionSlug } = props
  const [loading, setLoading] = useState(false)

  const handleCustomAction = async () => {
    setLoading(true)
    try {
      // Custom async action
      await fetch(`/api/custom-action/${clientDoc?.id}`)
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button
        onClick={handleCustomAction}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Custom Action'}
      </Button>
    </div>
  )
}
```

**Use Cases:**
- Custom action buttons
- Status indicators
- Quick navigation buttons
- Integration buttons (e.g., "Push to CMS", "Export to JSON")
- Custom workflow actions

**Available Props:**
- Server: `BeforeDocumentControlsServerProps` - Contains document data
- Client: `BeforeDocumentControlsClientProps` - Contains serializable document data

---

### editMenuItems

The `editMenuItems` property allows you to inject custom components into the 3-dot menu dropdown located in the document controls bar.

**Configuration (Collections):**
```typescript
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    components: {
      edit: {
        editMenuItems: ['/path/to/CustomEditMenuItem'],
      },
    },
  },
}
```

**Configuration (Globals):**
```typescript
import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: {
    components: {
      elements: {
        editMenuItems: ['/path/to/CustomEditMenuItem'],
      },
    },
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import type { EditMenuItemsServerProps } from 'payload'
import { Link } from '@payloadcms/ui'

export const EditMenuItems = async (props: EditMenuItemsServerProps) => {
  const { id, collectionSlug } = props
  const href = `/admin/collections/${collectionSlug}/${id}/custom-action`

  return (
    <>
      <Link href={href}>
        Custom Edit Menu Item
      </Link>
      <Link href={`/admin/collections/${collectionSlug}/${id}/duplicate`}>
        Duplicate Document
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
import type { EditViewMenuItemClientProps } from 'payload'

export const EditMenuItems = (props: EditViewMenuItemClientProps) => {
  const { id, collectionSlug } = props

  const handleCustomAction = () => {
    console.log('Custom action triggered!')
    // Custom action logic
  }

  const handleExport = () => {
    window.open(`/api/export/${collectionSlug}/${id}`, '_blank')
  }

  return (
    <PopupList.ButtonGroup>
      <PopupList.Button onClick={handleCustomAction}>
        Custom Action
      </PopupList.Button>
      <PopupList.Button onClick={handleExport}>
        Export to JSON
      </PopupList.Button>
      <PopupList.Button 
        onClick={() => window.open(`/admin/collections/${collectionSlug}/${id}/duplicate`, '_blank')}
      >
        Duplicate Document
      </PopupList.Button>
    </PopupList.ButtonGroup>
  )
}
```

**Styling Tip**: Use Payload's built-in `PopupList.Button` to ensure your menu items match the default dropdown styles. You can customize with `className` or use custom buttons if needed.

**Use Cases:**
- Custom document actions
- Export/import functionality
- Duplicate/clone actions
- Integration actions (e.g., "Push to external service")
- Analytics actions
- Bulk operations

**Available Props:**
- Server: `EditMenuItemsServerProps` - Contains document ID and collection/global slug
- Client: `EditViewMenuItemClientProps` - Contains serializable document ID and collection/global slug

---

### SaveDraftButton

The `SaveDraftButton` property allows you to render a custom Save Draft Button in the Edit View.

**Configuration:**
```typescript
admin: {
  components: {
    edit: {
      SaveDraftButton: '/path/to/MySaveDraftButton',
    },
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import { SaveDraftButton } from '@payloadcms/ui'
import type { SaveDraftButtonServerProps } from 'payload'

export function MySaveDraftButton(props: SaveDraftButtonServerProps) {
  return <SaveDraftButton />
}
```

**Client Component:**
```typescript
'use client'

import React from 'react'
import { SaveDraftButton } from '@payloadcms/ui'
import type { SaveDraftButtonClientProps } from 'payload'

export function MySaveDraftButton(props: SaveDraftButtonClientProps) {
  return <SaveDraftButton />
}
```

**Custom Implementation Example:**
```typescript
'use client'

import React from 'react'
import { Button } from '@payloadcms/ui'
import type { SaveDraftButtonClientProps } from 'payload'

export function MySaveDraftButton(props: SaveDraftButtonClientProps) {
  return (
    <Button
      onClick={() => {
        // Custom save draft logic
        console.log('Saving draft...')
      }}
      buttonStyle="secondary"
    >
      Save Draft
    </Button>
  )
}
```

---

### PublishButton

The `PublishButton` property allows you to render a custom Publish Button in the Edit View.

**Configuration:**
```typescript
admin: {
  components: {
    edit: {
      PublishButton: '/path/to/MyPublishButton',
    },
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import { PublishButton } from '@payloadcms/ui'
import type { PublishButtonServerProps } from 'payload'

export function MyPublishButton(props: PublishButtonServerProps) {
  return <PublishButton label="Publish" />
}
```

**Client Component:**
```typescript
'use client'

import React from 'react'
import { PublishButton } from '@payloadcms/ui'
import type { PublishButtonClientProps } from 'payload'

export function MyPublishButton(props: PublishButtonClientProps) {
  return <PublishButton label="Publish" />
}
```

**Custom Implementation with Confirmation:**
```typescript
'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'
import type { PublishButtonClientProps } from 'payload'

export function MyPublishButton(props: PublishButtonClientProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handlePublish = () => {
    if (showConfirm) {
      // Proceed with publish
      console.log('Publishing...')
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }

  return (
    <Button
      onClick={handlePublish}
      buttonStyle="primary"
    >
      {showConfirm ? 'Confirm Publish?' : 'Publish'}
    </Button>
  )
}
```

---

### PreviewButton

The `PreviewButton` property allows you to render a custom Preview Button in the Edit View.

**Configuration:**
```typescript
admin: {
  components: {
    edit: {
      PreviewButton: '/path/to/MyPreviewButton',
    },
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import { PreviewButton } from '@payloadcms/ui'
import type { PreviewButtonServerProps } from 'payload'

export function MyPreviewButton(props: PreviewButtonServerProps) {
  return <PreviewButton />
}
```

**Client Component:**
```typescript
'use client'

import React from 'react'
import { PreviewButton } from '@payloadcms/ui'
import type { PreviewButtonClientProps } from 'payload'

export function MyPreviewButton(props: PreviewButtonClientProps) {
  return <PreviewButton />
}
```

**Custom Implementation Example:**
```typescript
'use client'

import React from 'react'
import { Button } from '@payloadcms/ui'
import type { PreviewButtonClientProps } from 'payload'

export function MyPreviewButton(props: PreviewButtonClientProps) {
  const { clientDoc, collectionSlug } = props

  const handlePreview = () => {
    if (clientDoc?.id) {
      window.open(`/preview/${collectionSlug}/${clientDoc.id}`, '_blank')
    }
  }

  return (
    <Button
      onClick={handlePreview}
      buttonStyle="secondary"
      disabled={!clientDoc?.id}
    >
      Preview in New Tab
    </Button>
  )
}
```

---

### Description

The `Description` property allows you to render a custom description of the Collection or Global in the Edit View.

**Important**: The Description component is shared between the Edit View and the List View.

**Configuration:**
```typescript
admin: {
  components: {
    edit: {
      Description: '/path/to/MyDescriptionComponent',
    },
  },
}
```

**Server Component:**
```typescript
import React from 'react'
import type { ViewDescriptionServerProps } from 'payload'

export function MyDescriptionComponent(props: ViewDescriptionServerProps) {
  return (
    <div style={{ padding: '1rem', backgroundColor: 'var(--theme-elevation-50)' }}>
      <p>
        This is a custom description component (Server Component).
        Use this collection to manage your posts.
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

export function MyDescriptionComponent(props: ViewDescriptionClientProps) {
  return (
    <div style={{ padding: '1rem', backgroundColor: 'var(--theme-elevation-50)' }}>
      <p>
        This is a custom description component (Client Component).
        Use this collection to manage your posts.
      </p>
    </div>
  )
}
```

**Enhanced Description with Dynamic Content:**
```typescript
'use client'

import React from 'react'
import type { ViewDescriptionClientProps } from 'payload'
import { Link } from '@payloadcms/ui'

export function MyDescriptionComponent(props: ViewDescriptionClientProps) {
  const { collectionSlug, globalSlug } = props
  const entity = collectionSlug || globalSlug

  return (
    <div style={{ 
      padding: '1rem', 
      backgroundColor: 'var(--theme-elevation-50)',
      borderRadius: '4px',
      marginBottom: '1rem',
    }}>
      <p>
        Manage your <strong>{entity}</strong> content here.
      </p>
      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
        <Link href={`/docs/${entity}`} target="_blank">
          View documentation →
        </Link>
      </p>
    </div>
  )
}
```

---

### Upload

The `Upload` property allows you to render a custom file upload component in the Edit View.

**Note**: The Upload component is only available for Collections, not Globals.

**Configuration:**
```typescript
import type { CollectionConfig } from 'payload'

export const MyCollection: CollectionConfig = {
  slug: 'media',
  admin: {
    components: {
      edit: {
        Upload: '/path/to/MyUploadComponent',
      },
    },
  },
}
```

**Basic Example:**
```typescript
import React from 'react'

export function MyUploadComponent() {
  return <input type="file" />
}
```

**Enhanced Upload Component:**
```typescript
'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'

export function MyUploadComponent() {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
    
    if (selectedFiles.length > 0) {
      setUploading(true)
      
      // Handle file upload
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      try {
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          console.log('Files uploaded successfully')
        }
      } catch (error) {
        console.error('Upload failed:', error)
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        style={{ marginBottom: '1rem' }}
      />
      {uploading && <p>Uploading...</p>}
      {files.length > 0 && (
        <div>
          <p>Selected files: {files.length}</p>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

---

## Examples

### Example 1: Custom Document Controls with Status Indicator

**src/collections/Posts.ts:**
```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['/src/components/PostStatusIndicator'],
        editMenuItems: ['/src/components/PostMenuItems'],
      },
    },
  },
}
```

**src/components/PostStatusIndicator.tsx:**
```typescript
'use client'

import React from 'react'
import type { BeforeDocumentControlsClientProps } from 'payload'
import { Banner } from '@payloadcms/ui/elements/Banner'

export function PostStatusIndicator(
  props: BeforeDocumentControlsClientProps,
) {
  const { clientDoc } = props
  const status = clientDoc?._status

  if (!status) return null

  return (
    <div style={{ marginBottom: '1rem' }}>
      {status === 'draft' && (
        <Banner type="warning">
          This post is currently a draft and will not be visible on the site.
        </Banner>
      )}
      {status === 'published' && (
        <Banner type="success">
          This post is published and visible on the site.
        </Banner>
      )}
    </div>
  )
}
```

### Example 2: Enhanced Edit Menu with Export

**src/components/PostMenuItems.tsx:**
```typescript
'use client'

import React from 'react'
import { PopupList } from '@payloadcms/ui'
import type { EditViewMenuItemClientProps } from 'payload'

export function PostMenuItems(props: EditViewMenuItemClientProps) {
  const { id, collectionSlug } = props

  const handleExportJSON = () => {
    fetch(`/api/posts/${id}/export`)
      .then((res) => res.json())
      .then((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `post-${id}.json`
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  const handleExportMarkdown = () => {
    fetch(`/api/posts/${id}/export-markdown`)
      .then((res) => res.text())
      .then((text) => {
        const blob = new Blob([text], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `post-${id}.md`
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  return (
    <PopupList.ButtonGroup>
      <PopupList.Button onClick={handleExportJSON}>
        Export as JSON
      </PopupList.Button>
      <PopupList.Button onClick={handleExportMarkdown}>
        Export as Markdown
      </PopupList.Button>
    </PopupList.ButtonGroup>
  )
}
```

### Example 3: Complete Edit View Customization

**src/collections/Posts.ts:**
```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      edit: {
        beforeDocumentControls: [
          '/src/components/PostStatusIndicator',
          '/src/components/PostQuickActions',
        ],
        editMenuItems: ['/src/components/PostMenuItems'],
        SaveButton: '/src/components/CustomSaveButton',
        PublishButton: '/src/components/CustomPublishButton',
        PreviewButton: '/src/components/CustomPreviewButton',
        Description: '/src/components/PostDescription',
      },
    },
  },
}
```

---

## Best Practices

### 1. Choose the Right Customization Level

```typescript
// ✅ Good: Use component overrides for specific UI elements
admin: {
  components: {
    edit: {
      SaveButton: '/path/to/CustomSaveButton',
    },
  },
}

// ✅ Good: Use Custom View only when you need complete control
admin: {
  components: {
    views: {
      edit: {
        default: {
          Component: '/path/to/CustomEditView',
        },
      },
    },
  },
}

// ❌ Avoid: Overriding everything when you only need one component
```

### 2. Use TypeScript Types

```typescript
// ✅ Good: Use proper types for props
import type { SaveButtonClientProps } from 'payload'

export function MySaveButton(props: SaveButtonClientProps) {
  // TypeScript provides type checking and autocomplete
}
```

### 3. Reuse Payload Components

```typescript
// ✅ Good: Use Payload's built-in components
import { SaveButton, PublishButton } from '@payloadcms/ui'

export function MyButton(props: SaveButtonClientProps) {
  return <SaveButton label="Custom Save" />
}

// ❌ Avoid: Recreating components unnecessarily
export function MyButton() {
  return <button onClick={handleSave}>Save</button> // Missing form integration
}
```

### 4. Handle Loading States

```typescript
// ✅ Good: Show loading state during async operations
'use client'

export function MyCustomButton() {
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    setLoading(true)
    try {
      await performAction()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleAction} disabled={loading}>
      {loading ? 'Processing...' : 'Action'}
    </Button>
  )
}
```

### 5. Maintain Consistency

```typescript
// ✅ Good: Use consistent styling and behavior
import { Button } from '@payloadcms/ui'

export function MyButton() {
  return (
    <Button
      buttonStyle="primary" // Consistent with Payload's design
      onClick={handleClick}
    >
      Custom Action
    </Button>
  )
}
```

### 6. Collections vs Globals

```typescript
// ✅ Good: Use correct configuration path
// Collections
admin: {
  components: {
    edit: { /* ... */ },
  },
}

// Globals
admin: {
  components: {
    elements: { /* ... */ },
  },
}
```

---

## Quick Reference

### Configuration Template

**Collections:**
```typescript
admin: {
  components: {
    edit: {
      beforeDocumentControls: ['/path/to/Component'],
      editMenuItems: ['/path/to/Component'],
      SaveButton: '/path/to/SaveButton',
      SaveDraftButton: '/path/to/SaveDraftButton',
      PublishButton: '/path/to/PublishButton',
      PreviewButton: '/path/to/PreviewButton',
      Description: '/path/to/Description',
      Upload: '/path/to/Upload',
    },
    views: {
      edit: {
        default: {
          Component: '/path/to/CustomEditView',
        },
      },
    },
  },
}
```

**Globals:**
```typescript
admin: {
  components: {
    elements: {
      beforeDocumentControls: ['/path/to/Component'],
      editMenuItems: ['/path/to/Component'],
      SaveButton: '/path/to/SaveButton',
      SaveDraftButton: '/path/to/SaveDraftButton',
      PublishButton: '/path/to/PublishButton',
      PreviewButton: '/path/to/PreviewButton',
      Description: '/path/to/Description',
    },
    views: {
      edit: {
        default: {
          Component: '/path/to/CustomEditView',
        },
      },
    },
  },
}
```

### Component Props

**Server Component Props:**
- `DocumentViewServerProps` - Full Edit View
- `SaveButtonServerProps` - Save button
- `SaveDraftButtonServerProps` - Save draft button
- `PublishButtonServerProps` - Publish button
- `PreviewButtonServerProps` - Preview button
- `BeforeDocumentControlsServerProps` - Before controls
- `EditMenuItemsServerProps` - Edit menu items
- `ViewDescriptionServerProps` - Description
- `SaveButtonServerProps` - Save button

**Client Component Props:**
- `DocumentViewClientProps` - Full Edit View
- `SaveButtonClientProps` - Save button
- `SaveDraftButtonClientProps` - Save draft button
- `PublishButtonClientProps` - Publish button
- `PreviewButtonClientProps` - Preview button
- `BeforeDocumentControlsClientProps` - Before controls
- `EditViewMenuItemClientProps` - Edit menu items
- `ViewDescriptionClientProps` - Description

### Component Types Summary

| Component | Collections | Globals | Multiple |
|-----------|-------------|---------|----------|
| `beforeDocumentControls` | ✅ | ✅ | ✅ (Array) |
| `editMenuItems` | ✅ | ✅ | ✅ (Array) |
| `SaveButton` | ✅ | ✅ | ❌ (Single) |
| `SaveDraftButton` | ✅ | ✅ | ❌ (Single) |
| `PublishButton` | ✅ | ✅ | ❌ (Single) |
| `PreviewButton` | ✅ | ✅ | ❌ (Single) |
| `Description` | ✅ | ✅ | ❌ (Single) |
| `Upload` | ✅ | ❌ | ❌ (Single) |

---

## Troubleshooting

### Component Not Rendering

**Problem**: Custom component doesn't appear in Edit View.

**Solutions:**
- Verify path is correct relative to `baseDir`
- Check component is exported correctly (default or named)
- Regenerate import map: `payload generate:importmap`
- Ensure using correct config path (`edit` for Collections, `elements` for Globals)
- Check browser console for errors

### Props Undefined

**Problem**: Props are undefined in custom component.

**Solutions:**
- Verify component type (Server vs Client)
- Use correct TypeScript types
- Check that component receives props from Payload
- Ensure component is properly registered in config

### Button Actions Not Working

**Problem**: Custom buttons don't trigger form actions.

**Solutions:**
- Use Payload's built-in button components when possible
- Integrate with form state if using custom buttons
- Check form submission handlers
- Verify button events are properly bound

---

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Customizing Views Guide](CUSTOMIZING_VIEWS.md)
- [Document Views Guide](DOCUMENT_VIEWS.md)
- [React Component Personalization Guide](REACT_COMPONENT_PERSONALIZATION.md)
- [Payload UI Components](https://payloadcms.com/docs/ui/overview)

---

*Last updated: 2024*

