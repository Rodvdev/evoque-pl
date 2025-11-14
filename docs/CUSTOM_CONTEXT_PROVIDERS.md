# Custom Context Providers in Payload CMS

Complete guide to creating and using custom React Context providers in the Payload Admin Panel.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Building Custom Providers](#building-custom-providers)
4. [Creating Context and Hooks](#creating-context-and-hooks)
5. [Using Custom Providers](#using-custom-providers)
6. [Advanced Patterns](#advanced-patterns)
7. [Integration with Payload](#integration-with-payload)
8. [Examples](#examples)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

As you add more Custom Components to your Admin Panel, you may find it helpful to add additional React Context providers to share state and functionality across components. Payload allows you to inject your own context providers into the Admin Panel.

### Key Concepts

- **Client Components Only**: React Context exists only within Client Components
- **Use 'use client' Directive**: Custom providers must be Client Components
- **Global State Management**: Share state, functions, and data across components
- **Custom Hooks**: Export custom hooks to access context easily
- **Multiple Providers**: You can add multiple custom providers

### Why Use Custom Context Providers?

- Share state across multiple Custom Components
- Provide utility functions to components
- Manage global UI state (modals, notifications, etc.)
- Integrate third-party libraries that require context
- Avoid prop drilling through component trees

---

## Configuration

To add a Custom Provider, use the `admin.components.providers` property in your Payload Config:

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  admin: {
    components: {
      providers: ['/path/to/MyProvider'],
    },
  },
})
```

### Multiple Providers

You can add multiple providers. They will be wrapped in the order you specify:

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // ...
  admin: {
    components: {
      providers: [
        '/src/providers/ThemeProvider',
        '/src/providers/AuthProvider',
        '/src/providers/NotificationProvider',
      ],
    },
  },
})
```

### Using Named Exports

If your provider uses a named export:

```typescript
admin: {
  components: {
    providers: [
      '/src/providers/MyProvider#MyProviderComponent',
    ],
  },
}
```

Or use the object format:

```typescript
admin: {
  components: {
    providers: [
      {
        path: '/src/providers/MyProvider',
        exportName: 'MyProviderComponent',
      },
    ],
  },
}
```

---

## Building Custom Providers

### Basic Structure

All Custom Providers must be Client Components and include the `'use client'` directive:

```typescript
'use client'

import React, { createContext, use } from 'react'

// Define the context value type
interface MyContextType {
  value: string
  setValue: (value: string) => void
}

// Create the context with initial value
const MyCustomContext = createContext<MyContextType | undefined>(undefined)

// Provider component
export function MyProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = React.useState('initial')

  const contextValue: MyContextType = {
    value,
    setValue,
  }

  return (
    <MyCustomContext.Provider value={contextValue}>
      {children}
    </MyCustomContext.Provider>
  )
}

// Custom hook to access the context
export const useMyCustom = () => {
  const context = use(MyCustomContext)
  if (!context) {
    throw new Error('useMyCustom must be used within MyProvider')
  }
  return context
}
```

### Using React's `use()` Hook

Payload uses modern React's `use()` hook for context consumption. This is available in React 19+ or can be used with React 18+:

```typescript
'use client'

import React, { createContext, use } from 'react'

const MyContext = createContext<MyContextType | undefined>(undefined)

export const useMyContext = () => {
  const context = use(MyContext)
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider')
  }
  return context
}
```

### Alternative: Using `useContext` (React 18)

If you're using React 18, you can use the traditional `useContext` hook:

```typescript
'use client'

import React, { createContext, useContext } from 'react'

const MyContext = createContext<MyContextType | undefined>(undefined)

export const useMyContext = () => {
  const context = useContext(MyContext)
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider')
  }
  return context
}
```

---

## Creating Context and Hooks

### Step-by-Step Guide

1. **Define the Context Type**

```typescript
interface AppSettingsContextType {
  settings: AppSettings
  updateSettings: (settings: Partial<AppSettings>) => void
  resetSettings: () => void
}

interface AppSettings {
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
}
```

2. **Create the Context**

```typescript
const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined)
```

3. **Create the Provider Component**

```typescript
export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'en',
    notifications: true,
  })

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings({
      theme: 'light',
      language: 'en',
      notifications: true,
    })
  }, [])

  const value: AppSettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
  }

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  )
}
```

4. **Create the Custom Hook**

```typescript
export const useAppSettings = () => {
  const context = use(AppSettingsContext)
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider')
  }
  return context
}
```

---

## Using Custom Providers

### In Custom Components

Once you've configured and created your provider, you can use it in any Client Component:

```typescript
'use client'

import React from 'react'
import { useAppSettings } from '@/providers/AppSettings'

export function MyCustomComponent() {
  const { settings, updateSettings } = useAppSettings()

  return (
    <div>
      <p>Current theme: {settings.theme}</p>
      <button onClick={() => updateSettings({ theme: 'dark' })}>
        Switch to Dark Mode
      </button>
    </div>
  )
}
```

### TypeScript Support

TypeScript will provide full type safety and autocomplete:

```typescript
'use client'

import { useAppSettings } from '@/providers/AppSettings'

export function TypedComponent() {
  const { settings } = useAppSettings()
  
  // TypeScript knows the type of settings.theme
  const theme: 'light' | 'dark' = settings.theme
  
  // TypeScript will error if you use an invalid key
  // settings.invalid // ❌ Type error
}
```

---

## Advanced Patterns

### 1. Combining Multiple Contexts

You can combine multiple contexts in a single provider:

```typescript
'use client'

import React, { createContext, use } from 'react'
import { ThemeProvider, useTheme } from './Theme'
import { AuthProvider, useAuth } from './Auth'

interface CombinedContextType {
  theme: ReturnType<typeof useTheme>
  auth: ReturnType<typeof useAuth>
}

const CombinedContext = createContext<CombinedContextType | undefined>(undefined)

export function CombinedProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CombinedContextProvider>{children}</CombinedContextProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

function CombinedContextProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const auth = useAuth()

  return (
    <CombinedContext.Provider value={{ theme, auth }}>
      {children}
    </CombinedContext.Provider>
  )
}

export const useCombined = () => {
  const context = use(CombinedContext)
  if (!context) {
    throw new Error('useCombined must be used within CombinedProvider')
  }
  return context
}
```

### 2. LocalStorage Persistence

Persist context state to localStorage:

```typescript
'use client'

import React, { createContext, use, useEffect, useState, useCallback } from 'react'

interface PersistedContextType {
  value: string
  setValue: (value: string) => void
}

const PersistedContext = createContext<PersistedContextType | undefined>(undefined)

const STORAGE_KEY = 'my-app-value'

export function PersistedProvider({ children }: { children: React.ReactNode }) {
  const [value, setValueState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'default'
    }
    return 'default'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value)
    }
  }, [value])

  const setValue = useCallback((newValue: string) => {
    setValueState(newValue)
  }, [])

  return (
    <PersistedContext.Provider value={{ value, setValue }}>
      {children}
    </PersistedContext.Provider>
  )
}

export const usePersisted = () => {
  const context = use(PersistedContext)
  if (!context) {
    throw new Error('usePersisted must be used within PersistedProvider')
  }
  return context
}
```

### 3. Context with Server-Side Data

Wrap server-side data in a provider:

```typescript
// Server Component
import { ServerDataProvider } from '@/providers/ServerData'

export async function ServerWrapper({ children }: { children: React.ReactNode }) {
  const serverData = await fetchServerData()

  return (
    <ServerDataProvider initialData={serverData}>
      {children}
    </ServerDataProvider>
  )
}

// Provider (Client Component)
'use client'

import React, { createContext, use, useState } from 'react'

interface ServerDataContextType {
  data: ServerData
  refreshData: () => Promise<void>
}

const ServerDataContext = createContext<ServerDataContextType | undefined>(undefined)

export function ServerDataProvider({
  children,
  initialData,
}: {
  children: React.ReactNode
  initialData: ServerData
}) {
  const [data, setData] = useState(initialData)

  const refreshData = async () => {
    const newData = await fetch('/api/data').then((res) => res.json())
    setData(newData)
  }

  return (
    <ServerDataContext.Provider value={{ data, refreshData }}>
      {children}
    </ServerDataContext.Provider>
  )
}

export const useServerData = () => {
  const context = use(ServerDataContext)
  if (!context) {
    throw new Error('useServerData must be used within ServerDataProvider')
  }
  return context
}
```

### 4. Context with Reducer Pattern

Use `useReducer` for complex state management:

```typescript
'use client'

import React, { createContext, use, useReducer, useCallback } from 'react'

type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET_VALUE'; payload: number }

interface CounterState {
  count: number
}

interface CounterContextType {
  state: CounterState
  increment: () => void
  decrement: () => void
  reset: () => void
  setValue: (value: number) => void
}

const CounterContext = createContext<CounterContextType | undefined>(undefined)

const initialState: CounterState = {
  count: 0,
}

function counterReducer(state: CounterState, action: Action): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 }
    case 'DECREMENT':
      return { count: state.count - 1 }
    case 'RESET':
      return initialState
    case 'SET_VALUE':
      return { count: action.payload }
    default:
      return state
  }
}

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(counterReducer, initialState)

  const increment = useCallback(() => {
    dispatch({ type: 'INCREMENT' })
  }, [])

  const decrement = useCallback(() => {
    dispatch({ type: 'DECREMENT' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const setValue = useCallback((value: number) => {
    dispatch({ type: 'SET_VALUE', payload: value })
  }, [])

  return (
    <CounterContext.Provider
      value={{ state, increment, decrement, reset, setValue }}
    >
      {children}
    </CounterContext.Provider>
  )
}

export const useCounter = () => {
  const context = use(CounterContext)
  if (!context) {
    throw new Error('useCounter must be used within CounterProvider')
  }
  return context
}
```

---

## Integration with Payload

### Using Payload's Built-in Contexts

Your custom providers can access Payload's built-in contexts:

```typescript
'use client'

import React, { createContext, use } from 'react'
import { useConfig, useDocumentInfo } from '@payloadcms/ui'

interface EnhancedContextType {
  payloadConfig: ReturnType<typeof useConfig>
  documentInfo: ReturnType<typeof useDocumentInfo>
}

const EnhancedContext = createContext<EnhancedContextType | undefined>(undefined)

export function EnhancedProvider({ children }: { children: React.ReactNode }) {
  const payloadConfig = useConfig()
  const documentInfo = useDocumentInfo()

  return (
    <EnhancedContext.Provider value={{ payloadConfig, documentInfo }}>
      {children}
    </EnhancedContext.Provider>
  )
}

export const useEnhanced = () => {
  const context = use(EnhancedContext)
  if (!context) {
    throw new Error('useEnhanced must be used within EnhancedProvider')
  }
  return context
}
```

### Accessing Payload Data in Providers

```typescript
'use client'

import React, { createContext, use, useEffect, useState } from 'react'
import { useConfig } from '@payloadcms/ui'

interface DataContextType {
  data: any[]
  loading: boolean
  refresh: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { config } = useConfig()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${config.routes.api}/posts`)
      const result = await response.json()
      setData(result.docs || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <DataContext.Provider value={{ data, loading, refresh: fetchData }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = use(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
```

---

## Examples

### Example 1: Notification Provider

A provider for managing notifications/toasts:

**payload.config.ts:**
```typescript
admin: {
  components: {
    providers: [
      '/src/providers/NotificationProvider',
    ],
  },
}
```

**src/providers/NotificationProvider/index.tsx:**
```typescript
'use client'

import React, { createContext, use, useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = { ...notification, id }

    setNotifications((prev) => [...prev, newNotification])

    // Auto-remove after duration
    const duration = notification.duration || 5000
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, duration)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = use(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
```

**Usage in a component:**
```typescript
'use client'

import React from 'react'
import { useNotification } from '@/providers/NotificationProvider'
import { Button } from '@payloadcms/ui'

export function MyComponent() {
  const { addNotification } = useNotification()

  const handleSave = async () => {
    try {
      await saveData()
      addNotification({
        type: 'success',
        message: 'Data saved successfully!',
      })
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to save data',
      })
    }
  }

  return <Button onClick={handleSave}>Save</Button>
}
```

### Example 2: Modal Provider

A provider for managing modals:

**src/providers/ModalProvider/index.tsx:**
```typescript
'use client'

import React, { createContext, use, useState, useCallback } from 'react'

export interface ModalContent {
  title?: string
  content: React.ReactNode
  onClose?: () => void
}

interface ModalContextType {
  isOpen: boolean
  modalContent: ModalContent | null
  openModal: (content: ModalContent) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalContent, setModalContent] = useState<ModalContent | null>(null)

  const openModal = useCallback((content: ModalContent) => {
    setModalContent(content)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    if (modalContent?.onClose) {
      modalContent.onClose()
    }
    setTimeout(() => {
      setModalContent(null)
    }, 300) // Wait for animation
  }, [modalContent])

  return (
    <ModalContext.Provider value={{ isOpen, modalContent, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = use(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}
```

### Example 3: Form State Provider

A provider for managing form state across components:

**src/providers/FormStateProvider/index.tsx:**
```typescript
'use client'

import React, { createContext, use, useState, useCallback } from 'react'

interface FormState {
  [key: string]: any
}

interface FormStateContextType {
  formState: FormState
  updateField: (field: string, value: any) => void
  updateFields: (fields: Partial<FormState>) => void
  resetForm: () => void
  getField: (field: string) => any
}

const FormStateContext = createContext<FormStateContextType | undefined>(undefined)

export function FormStateProvider({
  children,
  initialValues = {},
}: {
  children: React.ReactNode
  initialValues?: FormState
}) {
  const [formState, setFormState] = useState<FormState>(initialValues)

  const updateField = useCallback((field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateFields = useCallback((fields: Partial<FormState>) => {
    setFormState((prev) => ({ ...prev, ...fields }))
  }, [])

  const resetForm = useCallback(() => {
    setFormState(initialValues)
  }, [initialValues])

  const getField = useCallback(
    (field: string) => {
      return formState[field]
    },
    [formState],
  )

  return (
    <FormStateContext.Provider
      value={{ formState, updateField, updateFields, resetForm, getField }}
    >
      {children}
    </FormStateContext.Provider>
  )
}

export const useFormState = () => {
  const context = use(FormStateContext)
  if (!context) {
    throw new Error('useFormState must be used within FormStateProvider')
  }
  return context
}
```

### Example 4: Theme Provider (Based on Existing Code)

**src/providers/Theme/index.tsx:**
```typescript
'use client'

import React, { createContext, useCallback, use, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'auto'

export interface ThemeContextType {
  setTheme: (theme: Theme | null) => void
  theme: Theme | undefined
}

const ThemeContext = createContext<ThemeContextType>({
  setTheme: () => null,
  theme: undefined,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme | undefined>(
    typeof window !== 'undefined'
      ? (document.documentElement.getAttribute('data-theme') as Theme)
      : undefined,
  )

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      localStorage.removeItem('theme')
      const implicitPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      document.documentElement.setAttribute('data-theme', implicitPreference)
      setThemeState(implicitPreference as Theme)
    } else {
      setThemeState(themeToSet)
      localStorage.setItem('theme', themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
    }
  }, [])

  useEffect(() => {
    const preference = localStorage.getItem('theme') as Theme
    if (preference && ['light', 'dark'].includes(preference)) {
      document.documentElement.setAttribute('data-theme', preference)
      setThemeState(preference)
    } else {
      const implicitPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      document.documentElement.setAttribute('data-theme', implicitPreference)
      setThemeState(implicitPreference as Theme)
    }
  }, [])

  return <ThemeContext.Provider value={{ setTheme, theme }}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
```

---

## Best Practices

### 1. Always Use 'use client' Directive

```typescript
// ✅ Good: Client Component
'use client'

import React, { createContext, use } from 'react'

export function MyProvider({ children }: { children: React.ReactNode }) {
  // ...
}

// ❌ Bad: Missing directive
import React, { createContext } from 'react'

export function MyProvider({ children }: { children: React.ReactNode }) {
  // This will fail!
}
```

### 2. Provide Default Values

```typescript
// ✅ Good: Provide default context value
const MyContext = createContext<MyContextType>({
  value: 'default',
  setValue: () => {},
})

// ❌ Avoid: undefined context
const MyContext = createContext<MyContextType | undefined>(undefined)
```

### 3. Error Handling in Hooks

```typescript
// ✅ Good: Check for context in hook
export const useMyContext = () => {
  const context = use(MyContext)
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider')
  }
  return context
}
```

### 4. Memoize Context Values

```typescript
// ✅ Good: Memoize context value to prevent unnecessary re-renders
export function MyProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState('initial')

  const contextValue = useMemo(
    () => ({
      value,
      setValue,
    }),
    [value],
  )

  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  )
}
```

### 5. Use useCallback for Functions

```typescript
// ✅ Good: Memoize callbacks
export function MyProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState('initial')

  const updateValue = useCallback((newValue: string) => {
    setValue(newValue)
  }, [])

  return (
    <MyContext.Provider value={{ value, updateValue }}>
      {children}
    </MyContext.Provider>
  )
}
```

### 6. TypeScript Types

```typescript
// ✅ Good: Define types explicitly
interface MyContextType {
  value: string
  setValue: (value: string) => void
}

const MyContext = createContext<MyContextType>({
  value: '',
  setValue: () => {},
})
```

### 7. Separate Concerns

```typescript
// ✅ Good: Separate providers by concern
providers: [
  '/src/providers/ThemeProvider',
  '/src/providers/NotificationProvider',
  '/src/providers/ModalProvider',
]

// ❌ Avoid: One monolithic provider
providers: [
  '/src/providers/EverythingProvider', // Too much!
]
```

### 8. Handle SSR

```typescript
// ✅ Good: Check for window/localStorage before using
export function MyProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('key') || 'default'
    }
    return 'default'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('key', value)
    }
  }, [value])

  // ...
}
```

---

## Troubleshooting

### Provider Not Working

**Problem**: Context values are undefined or not updating.

**Solutions**:
- Ensure `'use client'` directive is at the top of the file
- Verify the provider is added to `admin.components.providers` in config
- Check that components using the context are Client Components
- Regenerate import map: `payload generate:importmap`

### TypeScript Errors

**Problem**: TypeScript errors when using context.

**Solutions**:
- Define explicit types for context value
- Ensure custom hooks return the correct type
- Check that context is defined before use

### Re-rendering Issues

**Problem**: Components re-render too often.

**Solutions**:
- Memoize context values with `useMemo`
- Memoize functions with `useCallback`
- Consider splitting contexts if values change independently

### SSR/Hydration Errors

**Problem**: Errors related to server-side rendering.

**Solutions**:
- Check for `typeof window !== 'undefined'` before using browser APIs
- Initialize state with safe defaults
- Use `useEffect` for browser-only code

---

## Quick Reference

### Basic Provider Template

```typescript
'use client'

import React, { createContext, use } from 'react'

// 1. Define context type
interface MyContextType {
  // ... properties
}

// 2. Create context
const MyContext = createContext<MyContextType | undefined>(undefined)

// 3. Create provider
export function MyProvider({ children }: { children: React.ReactNode }) {
  // ... state and logic

  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  )
}

// 4. Create hook
export const useMyContext = () => {
  const context = use(MyContext)
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider')
  }
  return context
}
```

### Config Format

```typescript
admin: {
  components: {
    providers: [
      // String format (default export)
      '/src/providers/MyProvider',
      
      // String format (named export)
      '/src/providers/MyProvider#MyProviderComponent',
      
      // Object format
      {
        path: '/src/providers/MyProvider',
        exportName: 'MyProviderComponent',
      },
    ],
  },
}
```

---

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Custom Components Guide](REACT_COMPONENT_PERSONALIZATION.md)
- [React Context Documentation](https://react.dev/reference/react/useContext)
- [React use() Hook](https://react.dev/reference/react/use)

---

*Last updated: 2024*

