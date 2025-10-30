# Environment Variables Guide

## Development Mode Detection

The frontend provides multiple ways to determine if you're in development mode:

### 1. Using `NODE_ENV` (Automatic)

The most common and reliable way is to use `NODE_ENV` which is automatically set by Next.js:

```typescript
import { isDevelopment, isProduction } from '@/lib/env'

if (isDevelopment) {
  console.log('Running in development mode')
  // Enable debug features
}

if (isProduction) {
  console.log('Running in production')
  // Disable debug features, enable analytics, etc.
}
```

### 2. Using Custom Environment Variables

You can also define custom environment variables in `.env.local`:

```env
# Force development mode (even if NODE_ENV is production)
NEXT_PUBLIC_DEV_MODE=true

# Enable verbose debug logging
NEXT_PUBLIC_DEBUG=true
```

```typescript
import { devMode, debugMode } from '@/lib/env'

if (devMode) {
  // Development features enabled
}

if (debugMode) {
  // Verbose logging enabled
}
```

### 3. Usage in Components

```typescript
'use client'

import { isDevelopment } from '@/lib/env'

export default function MyComponent() {
  if (isDevelopment) {
    return (
      <div>
        <h1>Development Mode</h1>
        <p>Debug features are enabled</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Production Mode</h1>
    </div>
  )
}
```

### 4. Conditional API Calls

```typescript
import { isDevelopment, apiUrl } from '@/lib/env'
import { apiClient } from '@/lib/api-client'

// Use different endpoints in development
const endpoint = isDevelopment ? '/dev/api/test' : '/api/production'

// Or use the configured API URL
const response = await fetch(`${apiUrl}/endpoint`)
```

### 5. Conditional Logging

```typescript
import { debugMode } from '@/lib/env'

function log(message: string) {
  if (debugMode) {
    console.log('[DEBUG]', message)
  }
}

// Usage
log('This will only log in development or when NEXT_PUBLIC_DEBUG=true')
```

## Available Environment Variables

### From `@/lib/env`:

- **`isDevelopment`** - `true` when `NODE_ENV === 'development'`
- **`isProduction`** - `true` when `NODE_ENV === 'production'`
- **`isTest`** - `true` when `NODE_ENV === 'test'`
- **`devMode`** - `true` when `NEXT_PUBLIC_DEV_MODE === 'true'` OR in development
- **`debugMode`** - `true` when `NEXT_PUBLIC_DEBUG === 'true'` OR in development
- **`apiUrl`** - Backend API URL (defaults to `http://localhost:8000`)
- **`adminConfig`** - Admin panel configuration

### Environment Variables in `.env.local`:

- **`NODE_ENV`** - Automatically set by Next.js (`development`, `production`, `test`)
- **`NEXT_PUBLIC_API_URL`** - Backend API URL
- **`NEXT_PUBLIC_DEV_MODE`** - Force development mode (optional)
- **`NEXT_PUBLIC_DEBUG`** - Enable debug logging (optional)
- **`NEXTAUTH_URL`** - NextAuth.js base URL
- **`NEXTAUTH_SECRET`** - NextAuth.js secret key

## Important Notes

### Client vs Server Components

- Environment variables with `NEXT_PUBLIC_` prefix are available in client components
- Other variables are only available in server components
- `NODE_ENV` is available everywhere

### TypeScript Types

The environment variables are typed based on the `env.ts` module, so you get full type safety.

### Example: Conditional Features

```typescript
import { isDevelopment, adminConfig } from '@/lib/env'

export default function FeatureGate() {
  // Only show admin panel in development
  if (!adminConfig.enabled) {
    return <div>Admin access disabled</div>
  }

  return <AdminPanel />
}
```

## Best Practices

1. **Use `NODE_ENV` for most cases** - It's the standard and most reliable
2. **Use custom variables sparingly** - Only when you need to override behavior
3. **Prefix client variables** - Always use `NEXT_PUBLIC_` for variables needed in browser
4. **Type safety** - Import from `@/lib/env` instead of accessing `process.env` directly
5. **Document custom variables** - Add them to `env.template` for other developers

## Testing

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Test with custom env var
NEXT_PUBLIC_DEBUG=true npm run dev
```
