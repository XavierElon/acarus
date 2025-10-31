// Environment Detection
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'

// Custom environment variable for development mode (optional)
// Allows you to override NODE_ENV if needed
// If NEXT_PUBLIC_DEV_MODE is explicitly set, use that value. Otherwise fall back to isDevelopment
export const devMode = process.env.NEXT_PUBLIC_DEV_MODE !== undefined ? process.env.NEXT_PUBLIC_DEV_MODE === 'true' : isDevelopment

// API Configuration
export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Admin Configuration
export const adminConfig = {
  enabled: devMode, // Only enable in development mode
  bypassAuth: true
}

// Debug mode (for verbose logging)
export const debugMode = process.env.NEXT_PUBLIC_DEBUG === 'true' || isDevelopment
