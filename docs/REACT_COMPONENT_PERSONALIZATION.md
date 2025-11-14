# React Component Personalization in Payload CMS

Complete guide to customizing the Payload Admin Panel with your own React components.

## Table of Contents

1. [Overview](#overview)
2. [Component Types](#component-types)
3. [Defining Custom Components](#defining-custom-components)
4. [Component Paths](#component-paths)
5. [Component Config](#component-config)
6. [Import Map](#import-map)
7. [Building Custom Components](#building-custom-components)
8. [Server vs Client Components](#server-vs-client-components)
9. [Props](#props)
10. [Accessing Payload Config](#accessing-payload-config)
11. [Internationalization](#internationalization)
12. [Localization](#localization)
13. [Using Hooks](#using-hooks)
14. [Adding Styles](#adding-styles)
15. [Performance Best Practices](#performance-best-practices)
16. [Examples](#examples)

---

## Overview

The Payload Admin Panel is designed to be minimal and straightforward, allowing for easy customization and full control over the UI. Payload provides a pattern for you to supply your own React components through your Payload Config.

### Key Concepts

- **React Server Components by Default**: All Custom Components in Payload are React Server Components by default, enabling the use of the Local API directly on the front-end
- **Client Components Supported**: Include the `'use client'` directive to use Client Components
- **Component Paths**: Components are identified by file paths, not direct imports, keeping the config Node.js compatible
- **Granular Control**: Custom Components are available for nearly every part of the Admin Panel

---

## Component Types

Payload supports four main types of Custom Components:

### 1. Root Components

Root Components customize the top-level Admin Panel structure, such as:
- Navigation
- Layout
- Authentication views
- Global UI elements

**Example Locations:**
- `beforeLogin` - Message shown during login
- `beforeDashboard` - Welcome block after login
- `afterLogin` - Component shown after login
- `logout` - Logout button component

### 2. Collection Components

Collection Components customize how collections are displayed and managed:
- List views
- Edit views
- Create views
- Collection-specific actions

**Example Locations:**
- `List.view` - Custom list view
- `Edit.view` - Custom edit view
- `Create.view` - Custom create view
- `List.field` - Field in list view

### 3. Global Components

Global Components customize global document management:
- Edit views for globals
- Global-specific actions

**Example Locations:**
- `Edit.view` - Custom edit view for globals
- `Edit.field` - Field in global edit view

### 4. Field Components

Field Components customize how individual fields are rendered:
- Input components
- Display components
- Validation UI
- Field-specific actions

**Example Locations:**
- `components.Field` - Custom field component
- `components.Condition` - Conditional field rendering
- `components.Label` - Custom field label
- `components.Description` - Custom field description

---

## Defining Custom Components

To add a Custom Component, point to its file path in your Payload Config:

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    components: {
      logout: {
        Button: '/src/components/Logout#MyComponent',
      },
    },
  },
})
```

### Component Path Format

- **Default Export**: `/src/components/Logout` or `/src/components/Logout#default`
- **Named Export**: `/src/components/Logout#MyComponent`

---

## Component Paths

Component paths are relative to your project's base directory by default. This is either:
- Your current working directory, OR
- The directory specified in `config.admin.importMap.baseDir`

### Setting Base Directory

```typescript
import { buildConfig } from 'payload'
import { fileURLToPath } from 'node:url'
import path from 'path'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const config = buildConfig({
  // ...
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
    },
    components: {
      logout: {
        Button: '/components/Logout#MyComponent', // No /src/ prefix needed
      },
    },
  },
})
```

### Path Resolution

- Paths are resolved relative to `baseDir`
- Use absolute paths from `baseDir` (starting with `/`)
- Named exports use `#` separator: `/path/to/component#ExportName`

---

## Component Config

While Custom Components are usually defined as a string, you can also pass an object with additional options:

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  admin: {
    components: {
      logout: {
        Button: {
          path: '/src/components/Logout',
          exportName: 'MyComponent',
          clientProps: {
            test: 'hello',
          },
        },
      },
    },
  },
})
```

### Config Options

| Property | Description |
|----------|-------------|
| `path` | File path to the Custom Component. Named exports can be appended with `#` |
| `exportName` | Named export name (alternative to using `#` in path) |
| `clientProps` | Props to be passed to Client Components (must be serializable) |
| `serverProps` | Props to be passed to Server Components |

### Example: Multiple Config Formats

```typescript
admin: {
  components: {
    // String format (simple)
    beforeLogin: ['@/components/BeforeLogin'],
    
    // Object format with path only
    logout: {
      Button: {
        path: '/src/components/Logout',
      },
    },
    
    // Object format with named export
    logout: {
      Button: {
        path: '/src/components/Logout',
        exportName: 'LogoutButton',
      },
    },
    
    // Object format with custom props
    logout: {
      Button: {
        path: '/src/components/Logout#MyComponent',
        clientProps: {
          customMessage: 'Goodbye!',
        },
      },
    },
  },
}
```

---

## Import Map

Payload automatically generates an Import Map at:
- `src/app/(payload)/admin/importMap.js` OR
- `app/(payload)/admin/importMap.js`

This file contains every Custom Component in your config, keyed to their respective paths.

### Import Map Regeneration

The Import Map is automatically regenerated:
- At startup
- When Hot Module Replacement (HMR) runs
- Manually: `payload generate:importmap`

### Overriding Import Map Location

```typescript
import { buildConfig } from 'payload'
import { fileURLToPath } from 'node:url'
import path from 'path'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const config = buildConfig({
  // ...
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
      importMapFile: path.resolve(
        dirname,
        'app',
        '(payload)',
        'custom-import-map.js',
      ),
    },
  },
})
```

### Custom Imports (Dependencies)

For plugin authors or custom imports not referenced in known locations:

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  admin: {
    dependencies: {
      myTestComponent: {
        path: '/components/TestComponent.js#TestComponent',
        type: 'component',
        clientProps: {
          test: 'hello',
        },
      },
    },
  },
})
```

---

## Building Custom Components

### Server Components (Default)

All Custom Components are React Server Components by default. This enables:
- Direct use of Local API on the front-end
- Server-side data fetching
- Reduced client-side JavaScript

```typescript
import React from 'react'
import type { Payload } from 'payload'

async function MyServerComponent({
  payload,
}: {
  payload: Payload
}) {
  const page = await payload.findByID({
    collection: 'pages',
    id: '123',
  })

  return <p>{page.title}</p>
}

export default MyServerComponent
```

### Client Components

Add the `'use client'` directive to create Client Components:

```typescript
'use client'

import React, { useState } from 'react'

export function MyClientComponent() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  )
}
```

**Important**: Client Components cannot receive non-serializable props.

---

## Props

### Default Props

All Custom Components automatically receive these props:

| Prop | Description |
|------|-------------|
| `payload` | The Payload class (Server Components only) |
| `i18n` | The i18n object for translations |

```typescript
import React from 'react'
import type { Payload } from 'payload'

async function MyServerComponent({
  payload,
  i18n,
}: {
  payload: Payload
  i18n: any
}) {
  // Use payload and i18n here
  return <div>Component</div>
}
```

### Custom Props

Pass custom props using `clientProps` or `serverProps`:

```typescript
// In payload.config.ts
admin: {
  components: {
    logout: {
      Button: {
        path: '/src/components/Logout#MyComponent',
        clientProps: {
          myCustomProp: 'Hello, World!',
        },
        serverProps: {
          serverOnlyProp: 'Server data',
        },
      },
    },
  },
}
```

```typescript
// In your component
import React from 'react'
import { Link } from '@payloadcms/ui'

export function MyComponent({ 
  myCustomProp 
}: { 
  myCustomProp: string 
}) {
  return <Link href="/admin/logout">{myCustomProp}</Link>
}
```

### Field Component Props

Field Components receive special props:

**Server Components:**
```typescript
import React from 'react'
import type { TextFieldServerComponent } from 'payload'

export const MyServerFieldComponent: TextFieldServerComponent = ({
  field: { name, label, value },
}) => {
  return <p>{`Field: ${name}, Value: ${value}`}</p>
}
```

**Client Components:**
```typescript
'use client'

import React from 'react'
import type { TextFieldClientComponent } from 'payload'

export const MyClientFieldComponent: TextFieldClientComponent = ({
  clientField: { name, label },
  path,
}) => {
  return <p>{`This field's name is ${name}`}</p>
}
```

---

## Accessing Payload Config

### In Server Components

Access the full Payload Config directly from the `payload` prop:

```typescript
import React from 'react'
import type { Payload } from 'payload'

export default async function MyServerComponent({
  payload: { config },
}: {
  payload: Payload
}) {
  return <Link href={config.serverURL}>Go Home</Link>
}
```

### In Client Components

Use the `useConfig` hook to access a serializable version of the config:

```typescript
'use client'

import React from 'react'
import { useConfig, Link } from '@payloadcms/ui'

export function MyClientComponent() {
  const {
    config: { serverURL },
  } = useConfig()

  return <Link href={serverURL}>Go Home</Link>
}
```

---

## Internationalization

All Custom Components can support language translations to be consistent with Payload's I18n.

### Adding Translation Resources

First, add your translation resources to the I18n Config in your payload config:

```typescript
i18n: {
  supportedLanguages: { en: 'English', es: 'Spanish' },
  translations: {
    en: {
      'myNamespace:myKey': 'My English Text',
    },
    es: {
      'myNamespace:myKey': 'Mi Texto en Español',
    },
  },
}
```

### In Server Components

Use `getTranslation` from `@payloadcms/translations`:

```typescript
import React from 'react'
import { getTranslation } from '@payloadcms/translations'

export default async function MyServerComponent({ i18n }) {
  const translatedTitle = getTranslation(
    'myNamespace:myKey',
    i18n
  )
  
  return <p>{translatedTitle}</p>
}
```

### In Client Components

Use the `useTranslation` hook:

```typescript
'use client'

import React from 'react'
import { useTranslation } from '@payloadcms/ui'

export function MyClientComponent() {
  const { t, i18n } = useTranslation()
  
  return (
    <ul>
      <li>{t('namespace1:key', { variable: 'value' })}</li>
      <li>{t('namespace2:key', { variable: 'value' })}</li>
      <li>Current language: {i18n.language}</li>
    </ul>
  )
}
```

---

## Localization

Custom Views can support multiple locales to be consistent with Payload's Localization feature.

### In Server Components

The `locale` prop is automatically provided:

```typescript
import React from 'react'
import type { Payload } from 'payload'

export default async function MyServerComponent({ 
  payload, 
  locale 
}: { 
  payload: Payload
  locale: string
}) {
  const localizedPage = await payload.findByID({
    collection: 'pages',
    id: '123',
    locale,
  })
  
  return <p>{localizedPage.title}</p>
}
```

### In Client Components

Use the `useLocale` hook:

```typescript
'use client'

import React from 'react'
import { useLocale } from '@payloadcms/ui'

function Greeting() {
  const locale = useLocale()
  
  const trans = {
    en: 'Hello',
    es: 'Hola',
    fr: 'Bonjour',
  }
  
  return <span>{trans[locale.code] || 'Hello'}</span>
}
```

---

## Using Hooks

Payload provides built-in React Hooks for Client Components to interact with Payload's React Contexts.

### Available Hooks

Common hooks from `@payloadcms/ui`:

- `useConfig()` - Access Payload config
- `useDocumentInfo()` - Current document information
- `useTranslation()` - Translation utilities
- `useLocale()` - Current locale
- `useFormFields()` - Form field state (prevents unnecessary re-renders)
- `useFields()` - All form fields

### Example: useDocumentInfo

```typescript
'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export function MyClientComponent() {
  const { slug, id, collectionSlug } = useDocumentInfo()
  
  return (
    <div>
      <p>Collection: {collectionSlug}</p>
      <p>ID: {id}</p>
      <p>Slug: {slug}</p>
    </div>
  )
}
```

### Example: useFormFields (Optimized)

Prevent unnecessary re-renders by only subscribing to specific fields:

```typescript
'use client'

import { useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

const MyComponent: TextFieldClientComponent = ({ path }) => {
  // Only re-renders when this specific field changes
  const value = useFormFields(([fields]) => fields[path]?.value)
  
  return <div>Field value: {value}</div>
}
```

**Note**: Use `useFormFields` instead of `useFields` when you only need specific fields to prevent unnecessary re-renders.

---

## Adding Styles

Payload has a robust CSS Library that you can use to style your Custom Components to match Payload's built-in styling.

### Basic Styling

Import your own CSS or SCSS file:

```typescript
import './index.scss'

export function MyComponent() {
  return <div className="my-component">My Custom Component</div>
}
```

```scss
// index.scss
.my-component {
  background-color: var(--theme-elevation-500);
  padding: 1rem;
  border-radius: 4px;
}
```

### Using Payload's SCSS Library

Import Payload's SCSS library for mixins and utilities:

```scss
@import '~@payloadcms/ui/scss';

.my-component {
  background-color: var(--theme-elevation-500);
  
  @include mid-break {
    background-color: var(--theme-elevation-900);
  }
}
```

### CSS Variables

Payload provides CSS variables for theming:

- `--theme-elevation-0` through `--theme-elevation-1000` (background colors)
- `--theme-text` (text color)
- `--theme-success-500`, `--theme-warning-500`, `--theme-error-500` (status colors)
- `--base` (base font size)
- Breakpoint variables for responsive design

### Example: Styled Component

```typescript
import React from 'react'
import './Component.scss'

const baseClass = 'custom-component'

export function CustomComponent() {
  return (
    <div className={baseClass}>
      <h2 className={`${baseClass}__title`}>Custom Title</h2>
      <p className={`${baseClass}__description`}>Description text</p>
    </div>
  )
}
```

```scss
// Component.scss
@import '~@payloadcms/ui/scss';

.custom-component {
  padding: var(--base);
  background-color: var(--theme-elevation-50);
  border: 1px solid var(--theme-elevation-200);
  
  &__title {
    color: var(--theme-text);
    margin-bottom: calc(var(--base) * 0.5);
  }
  
  &__description {
    color: var(--theme-elevation-600);
  }
  
  @include mid-break {
    padding: calc(var(--base) * 1.5);
  }
}
```

---

## Performance Best Practices

### Follow React and Next.js Best Practices

- Use React best practices: memoization, proper hooks usage, optimized renders
- Follow Next.js patterns: proper server/client boundaries, bundling strategies

### Reducing Initial HTML Size

With Server Components, be aware of what is being sent through the server/client boundary:

```typescript
// ❌ Bad: Sending too much data
async function MyServerComponent({ payload }: { payload: Payload }) {
  const allPages = await payload.find({
    collection: 'pages',
    limit: 1000, // Too much data!
  })
  
  return <ClientComponent pages={allPages} />
}

// ✅ Good: Send only necessary data
async function MyServerComponent({ payload }: { payload: Payload }) {
  const pages = await payload.find({
    collection: 'pages',
    limit: 10, // Only what's needed
    select: {
      title: true,
      slug: true,
    },
  })
  
  return <ClientComponent pages={pages} />
}
```

**Tips:**
- Prefer Server Components and only send necessary props to Client Components
- Use React Suspense to progressively load components
- Be explicit about what props are sent to the client
- Offset JS execution to the server when possible

### Prevent Unnecessary Re-renders

Use `useFormFields` instead of `useFields` when you only need specific fields:

```typescript
// ❌ Bad: Subscribes to all fields, re-renders on any change
'use client'

import { useFields } from '@payloadcms/ui'

const MyComponent = () => {
  const fields = useFields()
  const value = fields['myField']?.value
  // Component re-renders when ANY field changes
}

// ✅ Good: Only subscribes to specific field
'use client'

import { useFormFields } from '@payloadcms/ui'

const MyComponent = ({ path }) => {
  const value = useFormFields(([fields]) => fields[path]?.value)
  // Component only re-renders when this field changes
}
```

### Component Memoization

Use React.memo for expensive Client Components:

```typescript
'use client'

import React, { memo } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  // Expensive rendering logic
  return <div>{/* Complex UI */}</div>
})

export default ExpensiveComponent
```

---

## Examples

### Example 1: Custom Before Login Component

**payload.config.ts:**
```typescript
admin: {
  components: {
    beforeLogin: ['@/components/BeforeLogin'],
  },
}
```

**src/components/BeforeLogin/index.tsx:**
```typescript
import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <div>
      <p>
        <b>Welcome to your dashboard!</b>
        {' This is where site admins will log in to manage your website.'}
      </p>
    </div>
  )
}

export default BeforeLogin
```

### Example 2: Custom Before Dashboard Component with Styles

**payload.config.ts:**
```typescript
admin: {
  components: {
    beforeDashboard: ['@/components/BeforeDashboard'],
  },
}
```

**src/components/BeforeDashboard/index.tsx:**
```typescript
import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to your dashboard!</h4>
      </Banner>
      <p>Here's what to do next:</p>
      <ul className={`${baseClass}__instructions`}>
        <li>Customize your collections</li>
        <li>Add custom fields</li>
        <li>Configure your admin panel</li>
      </ul>
    </div>
  )
}

export default BeforeDashboard
```

**src/components/BeforeDashboard/index.scss:**
```scss
@import '~@payloadcms/ui/scss';

.before-dashboard {
  padding: var(--base);
  
  &__banner {
    margin-bottom: calc(var(--base) * 0.5);
  }
  
  &__instructions {
    list-style: disc;
    margin-left: calc(var(--base) * 1.5);
  }
}
```

### Example 3: Custom Field Component (Server Component)

**payload.config.ts:**
```typescript
collections: [
  {
    slug: 'pages',
    fields: [
      {
        name: 'title',
        type: 'text',
        admin: {
          components: {
            Field: '/src/components/custom/TitleField#ServerTitleField',
          },
        },
      },
    ],
  },
]
```

**src/components/custom/TitleField.tsx:**
```typescript
import React from 'react'
import type { TextFieldServerComponent } from 'payload'

export const ServerTitleField: TextFieldServerComponent = ({
  field,
  path,
  value,
}) => {
  return (
    <div>
      <label htmlFor={path}>
        {field.label} {field.required && <span>*</span>}
      </label>
      <input
        id={path}
        name={path}
        type="text"
        defaultValue={value || ''}
      />
      {field.description && <p>{field.description}</p>}
    </div>
  )
}
```

### Example 4: Custom Field Component (Client Component)

**payload.config.ts:**
```typescript
collections: [
  {
    slug: 'posts',
    fields: [
      {
        name: 'excerpt',
        type: 'textarea',
        admin: {
          components: {
            Field: '/src/components/custom/ExcerptField#ClientExcerptField',
          },
        },
      },
    ],
  },
]
```

**src/components/custom/ExcerptField.tsx:**
```typescript
'use client'

import React, { useState } from 'react'
import { useFormFields, useField } from '@payloadcms/ui'
import type { TextareaFieldClientComponent } from 'payload'

export const ClientExcerptField: TextareaFieldClientComponent = ({
  path,
  field,
}) => {
  const { value, setValue } = useField<string>({ path })
  const [charCount, setCharCount] = useState(value?.length || 0)
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    setCharCount(newValue.length)
  }
  
  return (
    <div>
      <label htmlFor={path}>{field.label}</label>
      <textarea
        id={path}
        value={value || ''}
        onChange={handleChange}
        maxLength={field.maxLength || 500}
      />
      <p>
        {charCount} / {field.maxLength || 500} characters
      </p>
    </div>
  )
}
```

### Example 5: Custom Collection List View

**payload.config.ts:**
```typescript
collections: [
  {
    slug: 'posts',
    admin: {
      components: {
        views: {
          List: {
            Component: '/src/components/custom/PostsListView',
          },
        },
      },
    },
  },
]
```

**src/components/custom/PostsListView.tsx:**
```typescript
import React from 'react'
import type { Payload } from 'payload'

export default async function PostsListView({
  payload,
}: {
  payload: Payload
}) {
  const { docs: posts } = await payload.find({
    collection: 'posts',
    limit: 100,
  })
  
  return (
    <div>
      <h1>Custom Posts List</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Example 6: Component with Custom Props

**payload.config.ts:**
```typescript
admin: {
  components: {
    logout: {
      Button: {
        path: '/src/components/custom/LogoutButton#CustomLogout',
        clientProps: {
          buttonText: 'Sign Out',
          showIcon: true,
        },
      },
    },
  },
}
```

**src/components/custom/LogoutButton.tsx:**
```typescript
'use client'

import React from 'react'
import { Link } from '@payloadcms/ui'

interface CustomLogoutProps {
  buttonText?: string
  showIcon?: boolean
}

export function CustomLogout({
  buttonText = 'Logout',
  showIcon = false,
}: CustomLogoutProps) {
  return (
    <Link href="/admin/logout">
      {showIcon && '🚪 '}
      {buttonText}
    </Link>
  )
}
```

### Example 7: Internationalized Component

**payload.config.ts:**
```typescript
i18n: {
  supportedLanguages: { en: 'English', es: 'Spanish' },
  translations: {
    en: {
      'welcome:title': 'Welcome',
      'welcome:subtitle': 'Manage your content',
    },
    es: {
      'welcome:title': 'Bienvenido',
      'welcome:subtitle': 'Gestiona tu contenido',
    },
  },
}
```

**src/components/Internationalized/Welcome.tsx:**
```typescript
'use client'

import React from 'react'
import { useTranslation } from '@payloadcms/ui'

export function Welcome() {
  const { t, i18n } = useTranslation()
  
  return (
    <div>
      <h1>{t('welcome:title')}</h1>
      <p>{t('welcome:subtitle')}</p>
      <p>Current language: {i18n.language}</p>
    </div>
  )
}
```

### Example 8: Component with Localization

**src/components/Localized/PageEditor.tsx:**
```typescript
import React from 'react'
import type { Payload } from 'payload'

export default async function PageEditor({
  payload,
  locale,
}: {
  payload: Payload
  locale: string
}) {
  const pages = await payload.find({
    collection: 'pages',
    locale,
    limit: 10,
  })
  
  return (
    <div>
      <h1>Pages ({locale})</h1>
      {pages.docs.map((page) => (
        <div key={page.id}>
          <h2>{page.title}</h2>
        </div>
      ))}
    </div>
  )
}
```

---

## Quick Reference

### Component Path Formats

```typescript
// Default export
'@/components/MyComponent'

// Named export (using #)
'/src/components/MyComponent#MyExport'

// Named export (using exportName)
{
  path: '/src/components/MyComponent',
  exportName: 'MyExport',
}
```

### Common Component Locations

```typescript
admin: {
  components: {
    // Root Components
    beforeLogin: ['@/components/BeforeLogin'],
    beforeDashboard: ['@/components/BeforeDashboard'],
    afterLogin: ['@/components/AfterLogin'],
    
    // Logout
    logout: {
      Button: '/src/components/Logout',
    },
  },
}

// In Collection Config
{
  slug: 'posts',
  admin: {
    components: {
      views: {
        List: {
          Component: '/src/components/PostsList',
        },
        Edit: {
          Component: '/src/components/PostsEdit',
        },
      },
    },
  },
}

// In Field Config
{
  name: 'title',
  type: 'text',
  admin: {
    components: {
      Field: '/src/components/TitleField',
    },
  },
}
```

### Common Hooks

```typescript
// Client Components only
import {
  useConfig,
  useDocumentInfo,
  useTranslation,
  useLocale,
  useFormFields,
  useField,
} from '@payloadcms/ui'
```

### Server Component Default Props

```typescript
{
  payload: Payload
  i18n: I18n
  locale?: string
  // ... component-specific props
}
```

### Client Component Access

```typescript
'use client'

import { useConfig } from '@payloadcms/ui'

// Access serializable config
const { config } = useConfig()

// Access document info
const { id, slug } = useDocumentInfo()

// Access translations
const { t, i18n } = useTranslation()

// Access locale
const locale = useLocale()
```

---

## Troubleshooting

### Component Not Found

- Verify the path is correct relative to `baseDir`
- Check that the file exists
- Ensure the export name matches (if using named exports)
- Regenerate import map: `payload generate:importmap`

### Props Not Being Passed

- Verify `clientProps` are serializable (no functions, class instances)
- Check that you're using the correct prop name in your component
- For Server Components, use `serverProps`

### Styling Not Applied

- Ensure CSS/SCSS file is imported in the component
- Check that CSS variables are available (Payload's theme)
- Verify file path in import statement

### Performance Issues

- Use Server Components when possible
- Minimize data sent to Client Components
- Use `useFormFields` instead of `useFields` for specific subscriptions
- Implement React.memo for expensive Client Components

---

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Custom Components Documentation](https://payloadcms.com/docs/custom-components/overview)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Next.js Documentation](https://nextjs.org/docs)

---

*Last updated: 2024*

