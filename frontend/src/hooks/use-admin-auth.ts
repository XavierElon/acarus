'use client'

import { useEffect, useState } from 'react'

export function useAdminAuth() {
  const [isDevMode, setIsDevMode] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Debug logging
    console.log('AdminAuth: Checking localStorage...')
    const devMode = localStorage.getItem('devMode') === 'true'
    console.log('AdminAuth: devMode from localStorage:', devMode)
    setIsDevMode(devMode)
    setIsInitialized(true)

    // Listen for changes to devMode in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'devMode') {
        const newDevMode = e.newValue === 'true'
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
    localStorage.setItem('devMode', 'false')
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
