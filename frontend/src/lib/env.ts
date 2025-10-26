export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

export const adminConfig = {
  enabled: isDevelopment, // Only enable in development
  bypassAuth: true
}
