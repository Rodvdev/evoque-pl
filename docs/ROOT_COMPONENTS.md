# Root Components in Payload CMS

Complete guide to customizing high-level Admin Panel components in Payload CMS.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Components Reference](#components-reference)
4. [Component Details](#component-details)
5. [Examples](#examples)
6. [White-Labeling](#white-labeling)
7. [Best Practices](#best-practices)
8. [Quick Reference](#quick-reference)

---

## Overview

Root Components are those that affect the Admin Panel at a high-level, such as the logo, navigation, or header actions. You can swap out these components with your own Custom Components to create a completely custom look and feel.

### Key Concepts

- **High-Level Customization**: Root Components affect the entire Admin Panel experience
- **White-Labeling**: Combine with Custom CSS to create a unique branded experience
- **Flexible Injection Points**: Many components support before/after injection points
- **Complete Replacement**: Replace entire sections like navigation or login views
- **Brand Identity**: Customize logos and graphics to match your brand

### Benefits

- **Brand Consistency**: Match your Admin Panel to your brand identity
- **Enhanced UX**: Add custom functionality and workflows
- **Flexibility**: Inject components at strategic points without replacing everything
- **User Experience**: Customize the interface for your specific use case

---

## Configuration

To override Root Components, use the `admin.components` property at the root of your Payload Config:

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  admin: {
    components: {
      // Root Component configurations here
    },
  },
})
```

### Multiple Components

Many Root Component properties accept arrays, allowing you to add multiple components:

```typescript
admin: {
  components: {
    beforeDashboard: [
      '/src/components/WelcomeBanner',
      '/src/components/QuickActions',
    ],
    actions: [
      '/src/components/CustomAction',
      '/src/components/ExportButton',
    ],
  },
}
```

---

## Components Reference

### Available Root Components

| Property | Type | Description |
|----------|------|-------------|
| `actions` | Array | Custom Components rendered in the header for additional functionality |
| `afterDashboard` | Array | Components injected after the default dashboard contents |
| `afterLogin` | Array | Components injected after the login form |
| `afterNavLinks` | Array | Components injected after navigation links in the sidebar |
| `beforeDashboard` | Array | Components injected before the default dashboard contents |
| `beforeLogin` | Array | Components injected before the login form |
| `beforeNavLinks` | Array | Components injected before navigation links in the sidebar |
| `graphics.Icon` | Component | Simplified logo/icon used in contexts like Nav |
| `graphics.Logo` | Component | Full logo used in contexts like Login view |
| `header` | Array | Components injected above the Payload header |
| `logout.Button` | Component | Button displayed in sidebar for logging out |
| `Nav` | Component | Complete replacement for the sidebar/mobile menu |
| `settingsMenu` | Array | Components in the settings popup menu (gear icon) |
| `providers` | Array | React Context providers wrapping the Admin Panel |
| `views` | Object | Override or create new views (see [Customizing Views](CUSTOMIZING_VIEWS.md)) |

**Note**: `providers` and `views` are covered in separate guides.

---

## Component Details

### actions

Actions are rendered within the header of the Admin Panel. Actions are typically used to display buttons that add additional interactivity and functionality, although they can be anything you'd like.

**Configuration:**
```typescript
admin: {
  components: {
    actions: ['/src/components/CustomAction'],
  },
}
```

**Example Component:**
```typescript
'use client'

import React from 'react'
import { Button } from '@payloadcms/ui'

export default function CustomAction() {
  const handleClick = () => {
    // Custom action logic
    console.log('Custom action triggered!')
  }

  return (
    <Button onClick={handleClick}>
      Custom Action
    </Button>
  )
}
```

**Use Cases:**
- Quick export functionality
- System health status indicator
- Help/documentation links
- Custom workflows or shortcuts
- Integration with external services

**Note**: You can also add Actions to Edit View and List View in their respective collection configs.

---

### beforeDashboard

The `beforeDashboard` property allows you to inject Custom Components into the built-in Dashboard, before the default dashboard contents.

**Configuration:**
```typescript
admin: {
  components: {
    beforeDashboard: ['/src/components/WelcomeBanner'],
  },
}
```

**Example Component:**
```typescript
import React from 'react'
import { Banner } from '@payloadcms/ui/elements/Banner'

export default function WelcomeBanner() {
  return (
    <Banner type="success">
      <h4>Welcome to your dashboard!</h4>
      <p>Here's what you can do next...</p>
    </Banner>
  )
}
```

**Use Cases:**
- Welcome messages for new users
- Important announcements
- Getting started guides
- Quick action cards
- System status notifications

**Existing Example:**
This is used in the current codebase at `src/components/BeforeDashboard/index.tsx`.

---

### afterDashboard

Similar to `beforeDashboard`, the `afterDashboard` property allows you to inject Custom Components into the built-in Dashboard, after the default dashboard contents.

**Configuration:**
```typescript
admin: {
  components: {
    afterDashboard: ['/src/components/DashboardFooter'],
  },
}
```

**Example Component:**
```typescript
import React from 'react'

export default function DashboardFooter() {
  return (
    <div>
      <p>Need help? Check out our <a href="/docs">documentation</a>.</p>
    </div>
  )
}
```

**Use Cases:**
- Help links and resources
- Recent activity feeds
- Additional dashboard widgets
- Footer information
- Support links

---

### beforeLogin

The `beforeLogin` property allows you to inject Custom Components into the built-in Login view, before the default login form.

**Configuration:**
```typescript
admin: {
  components: {
    beforeLogin: ['/src/components/LoginWelcome'],
  },
}
```

**Example Component:**
```typescript
import React from 'react'

export default function LoginWelcome() {
  return (
    <div>
      <h2>Welcome Back</h2>
      <p>Please log in to access the admin panel.</p>
    </div>
  )
}
```

**Use Cases:**
- Welcome messages
- Brand introduction
- Login instructions
- Terms of service notices
- Security information

**Existing Example:**
This is used in the current codebase at `src/components/BeforeLogin/index.tsx`.

---

### afterLogin

Similar to `beforeLogin`, the `afterLogin` property allows you to inject Custom Components into the built-in Login view, after the default login form.

**Configuration:**
```typescript
admin: {
  components: {
    afterLogin: ['/src/components/LoginFooter'],
  },
}
```

**Example Component:**
```typescript
import React from 'react'
import { Link } from '@payloadcms/ui'

export default function LoginFooter() {
  return (
    <div>
      <p>
        <Link href="/forgot-password">Forgot your password?</Link>
      </p>
      <p>
        Need an account? <Link href="/contact">Contact support</Link>
      </p>
    </div>
  )
}
```

**Use Cases:**
- Password reset links
- Registration links
- Support contact information
- Additional login options
- Security tips

---

### beforeNavLinks

The `beforeNavLinks` property allows you to inject Custom Components into the built-in Nav Component, before the nav links themselves.

**Configuration:**
```typescript
admin: {
  components: {
    beforeNavLinks: ['/src/components/NavHeader'],
  },
}
```

**Example Component:**
```typescript
'use client'

import React from 'react'
import { useConfig } from '@payloadcms/ui'

export default function NavHeader() {
  const { config } = useConfig()
  
  return (
    <div style={{ padding: '1rem', borderBottom: '1px solid var(--theme-elevation-200)' }}>
      <h3>My Organization</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-500)' }}>
        {config.routes.admin}
      </p>
    </div>
  )
}
```

**Use Cases:**
- Organization branding
- User information display
- Search functionality
- Quick actions
- Status indicators

---

### afterNavLinks

Similar to `beforeNavLinks`, the `afterNavLinks` property allows you to inject Custom Components into the built-in Nav, after the nav links.

**Configuration:**
```typescript
admin: {
  components: {
    afterNavLinks: ['/src/components/NavFooter'],
  },
}
```

**Example Component:**
```typescript
'use client'

import React from 'react'
import { Link } from '@payloadcms/ui'

export default function NavFooter() {
  return (
    <div style={{ padding: '1rem', borderTop: '1px solid var(--theme-elevation-200)' }}>
      <Link href="/help">Help Center</Link>
      <br />
      <Link href="/docs">Documentation</Link>
    </div>
  )
}
```

**Use Cases:**
- Additional navigation items
- Help and documentation links
- Footer information
- Version information
- Support links

---

### settingsMenu

The `settingsMenu` property allows you to inject Custom Components into a popup menu accessible via a gear icon in the navigation controls, positioned above the logout button.

**Configuration:**
```typescript
admin: {
  components: {
    settingsMenu: ['/src/components/SystemSettings'],
  },
}
```

**Multiple Components:**
```typescript
admin: {
  components: {
    settingsMenu: [
      '/src/components/SystemActions#SystemActions',
      '/src/components/DataManagement#DataManagement',
    ],
  },
}
```

**Example Component:**
```typescript
'use client'

import React from 'react'
import { PopupList } from '@payloadcms/ui'

export function SystemSettings() {
  const handleExport = () => {
    console.log('Export triggered')
    // Export logic
  }

  const handleImport = () => {
    console.log('Import triggered')
    // Import logic
  }

  return (
    <PopupList.ButtonGroup>
      <PopupList.Button onClick={handleExport}>
        Export Data
      </PopupList.Button>
      <PopupList.Button onClick={handleImport}>
        Import Data
      </PopupList.Button>
      <PopupList.Button onClick={() => window.open('/admin/backup', '_blank')}>
        Backup Settings
      </PopupList.Button>
    </PopupList.ButtonGroup>
  )
}
```

**Use Cases:**
- System actions (export, import, backup)
- Data management tools
- Custom utilities
- Integration settings
- System configuration

**Note**: Must be a Client Component (`'use client'` directive).

---

### Nav

The `Nav` property contains the sidebar/mobile menu in its entirety. Use this property to completely replace the built-in Nav with your own custom navigation.

**Configuration:**
```typescript
admin: {
  components: {
    Nav: '/src/components/CustomNav',
  },
}
```

**Example Component:**
```typescript
'use client'

import React from 'react'
import { Link, useConfig } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'

export default function CustomNav() {
  const pathname = usePathname()
  const { config } = useConfig()

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/collections/posts', label: 'Posts' },
    { href: '/admin/collections/pages', label: 'Pages' },
    { href: '/admin/globals/header', label: 'Header' },
  ]

  return (
    <nav>
      <div className="nav-header">
        <h2>Navigation</h2>
      </div>
      <ul>
        {navItems.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href}
              className={pathname === item.href ? 'active' : ''}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

**Use Cases:**
- Complete navigation redesign
- Custom navigation structure
- Branded navigation experience
- Advanced navigation features
- Integration with external systems

**Considerations:**
- Replacing Nav removes all built-in navigation features
- You must handle collection/global links manually
- Mobile responsiveness is your responsibility
- Consider accessibility requirements

---

### graphics.Icon

The `Icon` property is the simplified logo used in contexts like the Nav component. This is typically a small, square icon that represents your brand.

**Configuration:**
```typescript
admin: {
  components: {
    graphics: {
      Icon: '/src/components/BrandIcon',
    },
  },
}
```

**Example Component:**
```typescript
import React from 'react'

export default function BrandIcon() {
  return (
    <img 
      src="/path/to/your/icon.svg" 
      alt="Brand Icon" 
      width={32}
      height={32}
      style={{ objectFit: 'contain' }}
    />
  )
}
```

**SVG Example:**
```typescript
import React from 'react'

export default function BrandIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#0070f3" />
      <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="white" />
    </svg>
  )
}
```

**Use Cases:**
- Brand identity in navigation
- Small icon for mobile views
- Favicon-style representation
- App icon in sidebar

**Best Practices:**
- Use SVG for scalability
- Keep it simple and recognizable
- Ensure good contrast
- Recommended size: 32x32 to 48x48 pixels

---

### graphics.Logo

The `Logo` property is the full logo used in contexts like the Login view. This is typically a larger, more detailed representation of your brand.

**Configuration:**
```typescript
admin: {
  components: {
    graphics: {
      Logo: '/src/components/BrandLogo',
    },
  },
}
```

**Example Component:**
```typescript
import React from 'react'

export default function BrandLogo() {
  return (
    <img 
      src="/path/to/your/logo.svg" 
      alt="Brand Logo" 
      width={200}
      height={60}
      style={{ objectFit: 'contain', maxWidth: '100%' }}
    />
  )
}
```

**With Link Example:**
```typescript
import React from 'react'
import { Link } from '@payloadcms/ui'

export default function BrandLogo() {
  return (
    <Link href="/admin">
      <img 
        src="/path/to/your/logo.svg" 
        alt="Brand Logo" 
        width={200}
        height={60}
        style={{ objectFit: 'contain', maxWidth: '100%' }}
      />
    </Link>
  )
}
```

**Use Cases:**
- Brand identity on login page
- Full branding in header
- Marketing presence in admin panel
- Professional appearance

**Best Practices:**
- Use high-quality SVG or PNG
- Ensure responsive sizing
- Maintain aspect ratio
- Consider dark/light mode variants

---

### header

The `header` property allows you to inject Custom Components above the Payload header.

**Configuration:**
```typescript
admin: {
  components: {
    header: ['/src/components/AnnouncementBanner'],
  },
}
```

**Example Component:**
```typescript
'use client'

import React, { useState } from 'react'
import { Banner } from '@payloadcms/ui/elements/Banner'

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <Banner type="info" align="center">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>System maintenance scheduled for this weekend.</span>
        <button onClick={() => setDismissed(true)}>×</button>
      </div>
    </Banner>
  )
}
```

**Use Cases:**
- Announcement banners
- System notifications
- Maintenance notices
- Important alerts
- Promotional messages

---

### logout.Button

The `logout.Button` property is the button displayed in the sidebar that should log the user out when clicked.

**Configuration:**
```typescript
admin: {
  components: {
    logout: {
      Button: '/src/components/CustomLogoutButton',
    },
  },
}
```

**Example Component:**
```typescript
'use client'

import React from 'react'
import { Button } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export default function CustomLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/admin/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Button onClick={handleLogout}>
      Sign Out
    </Button>
  )
}
```

**Simple Example:**
```typescript
'use client'

import React from 'react'
import { Button, Link } from '@payloadcms/ui'

export default function CustomLogoutButton() {
  return (
    <Link href="/api/logout">
      <Button>Log Out</Button>
    </Link>
  )
}
```

**Use Cases:**
- Custom logout styling
- Additional logout logic
- Confirmation dialogs
- Analytics tracking
- Session cleanup

**Important**: Ensure your logout button properly handles authentication and redirects to the login page.

---

## Examples

### Example 1: Complete Branding Setup

**payload.config.ts:**
```typescript
admin: {
  components: {
    graphics: {
      Icon: '/src/components/BrandIcon',
      Logo: '/src/components/BrandLogo',
    },
    beforeLogin: ['/src/components/LoginWelcome'],
    afterLogin: ['/src/components/LoginFooter'],
  },
}
```

**src/components/BrandIcon.tsx:**
```typescript
import React from 'react'

export default function BrandIcon() {
  return (
    <img 
      src="/brand-icon.svg" 
      alt="Brand Icon" 
      width={40}
      height={40}
    />
  )
}
```

**src/components/BrandLogo.tsx:**
```typescript
import React from 'react'
import { Link } from '@payloadcms/ui'

export default function BrandLogo() {
  return (
    <Link href="/admin">
      <img 
        src="/brand-logo.svg" 
        alt="Brand Logo" 
        width={200}
        height={60}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </Link>
  )
}
```

**src/components/LoginWelcome.tsx:**
```typescript
import React from 'react'

export default function LoginWelcome() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <h1>Welcome to Our CMS</h1>
      <p>Please sign in to continue</p>
    </div>
  )
}
```

### Example 2: Enhanced Dashboard

**payload.config.ts:**
```typescript
admin: {
  components: {
    beforeDashboard: [
      '/src/components/WelcomeBanner',
      '/src/components/QuickStats',
    ],
    afterDashboard: [
      '/src/components/RecentActivity',
      '/src/components/HelpResources',
    ],
  },
}
```

**src/components/WelcomeBanner.tsx:**
```typescript
import React from 'react'
import { Banner } from '@payloadcms/ui/elements/Banner'

export default function WelcomeBanner() {
  return (
    <Banner type="success">
      <h4>Welcome back!</h4>
      <p>You have 3 new items awaiting review.</p>
    </Banner>
  )
}
```

**src/components/QuickStats.tsx:**
```typescript
'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@payloadcms/ui'

export default function QuickStats() {
  const [stats, setStats] = useState({
    posts: 0,
    pages: 0,
    users: 0,
  })

  useEffect(() => {
    // Fetch stats
    Promise.all([
      fetch('/api/posts/count').then(r => r.json()),
      fetch('/api/pages/count').then(r => r.json()),
      fetch('/api/users/count').then(r => r.json()),
    ]).then(([posts, pages, users]) => {
      setStats({
        posts: posts.totalDocs || 0,
        pages: pages.totalDocs || 0,
        users: users.totalDocs || 0,
      })
    })
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
      <Card>
        <h3>Posts</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.posts}</p>
      </Card>
      <Card>
        <h3>Pages</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.pages}</p>
      </Card>
      <Card>
        <h3>Users</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.users}</p>
      </Card>
    </div>
  )
}
```

### Example 3: Custom Navigation with User Info

**payload.config.ts:**
```typescript
admin: {
  components: {
    beforeNavLinks: ['/src/components/UserProfile'],
    afterNavLinks: ['/src/components/NavFooter'],
    settingsMenu: [
      '/src/components/SystemActions',
      '/src/components/UserSettings',
    ],
  },
}
```

**src/components/UserProfile.tsx:**
```typescript
'use client'

import React from 'react'
import { useAuth } from '@payloadcms/ui'

export default function UserProfile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div style={{ 
      padding: '1rem', 
      borderBottom: '1px solid var(--theme-elevation-200)',
      marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--theme-elevation-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{user.email}</p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--theme-elevation-500)' }}>
            {user.roles?.join(', ') || 'User'}
          </p>
        </div>
      </div>
    </div>
  )
}
```

**src/components/SystemActions.tsx:**
```typescript
'use client'

import React from 'react'
import { PopupList } from '@payloadcms/ui'

export function SystemActions() {
  return (
    <PopupList.ButtonGroup>
      <PopupList.Button onClick={() => window.open('/admin/export', '_blank')}>
        Export All Data
      </PopupList.Button>
      <PopupList.Button onClick={() => window.open('/admin/backup', '_blank')}>
        Create Backup
      </PopupList.Button>
    </PopupList.ButtonGroup>
  )
}
```

### Example 4: Header Actions

**payload.config.ts:**
```typescript
admin: {
  components: {
    actions: [
      '/src/components/HelpButton',
      '/src/components/NotificationBell',
    ],
    header: ['/src/components/AnnouncementBar'],
  },
}
```

**src/components/HelpButton.tsx:**
```typescript
'use client'

import React from 'react'
import { Button } from '@payloadcms/ui'

export default function HelpButton() {
  return (
    <Button
      onClick={() => window.open('/docs', '_blank')}
      buttonStyle="secondary"
    >
      Help
    </Button>
  )
}
```

**src/components/AnnouncementBar.tsx:**
```typescript
'use client'

import React, { useState } from 'react'
import { Banner } from '@payloadcms/ui/elements/Banner'

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(
    typeof window !== 'undefined' 
      ? localStorage.getItem('announcement-dismissed') === 'true'
      : false
  )

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('announcement-dismissed', 'true')
    }
  }

  return (
    <Banner type="warning" align="center">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%',
      }}>
        <span>New features available! Check out our latest updates.</span>
        <button 
          onClick={handleDismiss}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0 0.5rem',
          }}
        >
          ×
        </button>
      </div>
    </Banner>
  )
}
```

---

## White-Labeling

White-labeling involves completely customizing the Admin Panel to match your brand. Combine Root Components with Custom CSS for a fully branded experience.

### Strategy

1. **Replace Graphics**: Use `graphics.Icon` and `graphics.Logo` for brand identity
2. **Customize Login**: Use `beforeLogin` and `afterLogin` for branded login experience
3. **Custom Navigation**: Replace or enhance navigation with `Nav`, `beforeNavLinks`, `afterNavLinks`
4. **Custom Styling**: Add custom CSS to match brand colors, fonts, and styles
5. **Dashboard Branding**: Use `beforeDashboard` and `afterDashboard` for branded welcome experience

### Example: Complete White-Label Setup

**payload.config.ts:**
```typescript
admin: {
  components: {
    graphics: {
      Icon: '/src/branding/BrandIcon',
      Logo: '/src/branding/BrandLogo',
    },
    beforeLogin: ['/src/branding/LoginHeader'],
    afterLogin: ['/src/branding/LoginFooter'],
    beforeDashboard: ['/src/branding/WelcomeMessage'],
    Nav: '/src/branding/CustomNav',
    logout: {
      Button: '/src/branding/BrandedLogout',
    },
  },
  css: '/src/styles/admin-custom.css',
}
```

**src/styles/admin-custom.css:**
```css
/* Override Payload CSS variables for brand colors */
:root {
  --theme-elevation-0: #ffffff;
  --theme-elevation-50: #f9fafb;
  --theme-elevation-100: #f3f4f6;
  --theme-elevation-200: #e5e7eb;
  --theme-elevation-500: #6b7280;
  --theme-elevation-900: #111827;
  --theme-success-500: #10b981;
  --theme-warning-500: #f59e0b;
  --theme-error-500: #ef4444;
}

/* Brand-specific styling */
.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Custom navigation styling */
.brand-nav {
  background-color: var(--theme-elevation-900);
}
```

---

## Best Practices

### 1. Use Appropriate Component Types

```typescript
// ✅ Good: Use arrays for multiple components
beforeDashboard: [
  '/src/components/WelcomeBanner',
  '/src/components/QuickActions',
]

// ✅ Good: Single component when needed
graphics: {
  Logo: '/src/components/BrandLogo',
}

// ❌ Avoid: Using array for single component unnecessarily
graphics: {
  Logo: ['/src/components/BrandLogo'], // Unnecessary array
}
```

### 2. Component Organization

```typescript
// ✅ Good: Organize by feature
admin: {
  components: {
    // Branding
    graphics: {
      Icon: '/src/branding/Icon',
      Logo: '/src/branding/Logo',
    },
    // Navigation
    Nav: '/src/navigation/CustomNav',
    beforeNavLinks: ['/src/navigation/UserInfo'],
    // Dashboard
    beforeDashboard: ['/src/dashboard/Welcome'],
    afterDashboard: ['/src/dashboard/Stats'],
  },
}
```

### 3. Client vs Server Components

```typescript
// ✅ Good: Use 'use client' for interactive components
'use client'

import React, { useState } from 'react'

export default function InteractiveComponent() {
  const [state, setState] = useState(false)
  return <button onClick={() => setState(!state)}>Toggle</button>
}

// ✅ Good: Server Component for static content
import React from 'react'

export default function StaticComponent() {
  return <div>Static content</div>
}
```

### 4. Accessibility

```typescript
// ✅ Good: Accessible components
export default function AccessibleButton() {
  return (
    <button
      onClick={handleClick}
      aria-label="Custom action"
      type="button"
    >
      <span aria-hidden="true">⚙️</span>
      Settings
    </button>
  )
}
```

### 5. Performance

```typescript
// ✅ Good: Lazy load heavy components
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

export default function Wrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### 6. Error Handling

```typescript
// ✅ Good: Error boundaries
'use client'

import React, { ErrorBoundary } from 'react'

export default function SafeComponent() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

---

## Quick Reference

### Configuration Template

```typescript
admin: {
  components: {
    // Graphics
    graphics: {
      Icon: '/src/components/Icon',
      Logo: '/src/components/Logo',
    },
    // Navigation
    Nav: '/src/components/Nav',
    beforeNavLinks: ['/src/components/NavHeader'],
    afterNavLinks: ['/src/components/NavFooter'],
    // Login
    beforeLogin: ['/src/components/LoginWelcome'],
    afterLogin: ['/src/components/LoginFooter'],
    // Dashboard
    beforeDashboard: ['/src/components/WelcomeBanner'],
    afterDashboard: ['/src/components/DashboardFooter'],
    // Header
    header: ['/src/components/AnnouncementBar'],
    actions: ['/src/components/CustomAction'],
    // Settings & Logout
    settingsMenu: ['/src/components/SettingsActions'],
    logout: {
      Button: '/src/components/LogoutButton',
    },
    // Providers & Views
    providers: ['/src/providers/CustomProvider'],
    views: {
      dashboard: { Component: '/src/views/CustomDashboard' },
    },
  },
}
```

### Common Patterns

**Multiple Components (Array):**
- `actions`
- `beforeDashboard`
- `afterDashboard`
- `beforeLogin`
- `afterLogin`
- `beforeNavLinks`
- `afterNavLinks`
- `header`
- `settingsMenu`
- `providers`

**Single Component (String/Object):**
- `Nav`
- `graphics.Icon`
- `graphics.Logo`
- `logout.Button`

**Object (Nested):**
- `graphics` (contains `Icon` and `Logo`)
- `logout` (contains `Button`)
- `views` (contains view configurations)

---

## Troubleshooting

### Components Not Rendering

**Problem**: Custom components don't appear in the Admin Panel.

**Solutions:**
- Verify the path is correct relative to `baseDir`
- Check that the component is exported correctly (default or named)
- Regenerate import map: `payload generate:importmap`
- Ensure the component file exists and is valid
- Check browser console for errors

### Styling Issues

**Problem**: Custom components don't match the Admin Panel styling.

**Solutions:**
- Use Payload's CSS variables for consistency
- Import Payload's SCSS library: `@import '~@payloadcms/ui/scss'`
- Check component structure matches Payload's patterns
- Use Payload's UI components when possible

### Navigation Not Working

**Problem**: Custom Nav component breaks navigation.

**Solutions:**
- Ensure you're using Payload's `Link` component or Next.js `Link`
- Verify routes match Payload's route structure
- Check that collection/global slugs are correct
- Test both desktop and mobile views

### Performance Issues

**Problem**: Admin Panel loads slowly with custom components.

**Solutions:**
- Use Server Components when possible
- Lazy load heavy components
- Minimize bundle size
- Optimize images and assets
- Use React.memo for expensive components

---

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Custom Components Guide](REACT_COMPONENT_PERSONALIZATION.md)
- [Customizing Views Guide](CUSTOMIZING_VIEWS.md)
- [Custom Context Providers Guide](CUSTOM_CONTEXT_PROVIDERS.md)
- [Next.js Link Component](https://nextjs.org/docs/app/api-reference/components/link)

---

*Last updated: 2024*

