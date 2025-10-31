'use client'

import { useEffect, useState } from 'react'
import { isDevelopment } from '@/lib/env'

export function useAdminAuth() {
  const [isDevMode, setIsDevMode] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Debug logging
    console.log('AdminAuth: Checking localStorage...')
    const devModeFromStorage = localStorage.getItem('devMode') === 'true'
    // In development mode, always show as dev mode regardless of localStorage
    const devMode = isDevelopment || devModeFromStorage
    console.log('AdminAuth: devMode from localStorage:', devModeFromStorage, 'isDevelopment:', isDevelopment, 'final devMode:', devMode)
    setIsDevMode(devMode)
    setIsInitialized(true)

    // Listen for changes to devMode in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'devMode') {
        const newDevModeFromStorage = e.newValue === 'true'
        // In development mode, always show as dev mode regardless of localStorage
        const newDevMode = isDevelopment || newDevModeFromStorage
        console.log('AdminAuth: Dev mode changed to:', newDevMode)
        setIsDevMode(newDevMode)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const enableDevMode = () => {
    console.log('AdminAuth: Enabling dev mode...')
    localStorage.setItem('devMode', 'true')
    setIsDevMode(true)
  }

  const disableDevMode = () => {
    console.log('AdminAuth: Disabling dev mode...')
    localStorage.removeItem('devMode') // Remove instead of setting to 'false'
    setIsDevMode(false)
  }

  console.log('AdminAuth: Current isDevMode:', isDevMode)

  return {
    isDevMode,
    isInitialized,
    enableDevMode,
    disableDevMode
  }
}
