'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, LoginRequest, RegisterRequest, AuthResponse } from '@/lib/api-client'

// Auth query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  apiKeys: () => [...authKeys.all, 'apiKeys'] as const
}

export function useAuth() {
  const { data: session, status } = useSession()
  const [isDevMode, setIsDevMode] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check dev mode from localStorage
    const devMode = localStorage.getItem('devMode') === 'true'
    setIsDevMode(devMode)
    setIsInitialized(true)

    // Listen for changes to devMode in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'devMode') {
        const newDevMode = e.newValue === 'true'
        console.log('Auth: Dev mode changed to:', newDevMode)
        setIsDevMode(newDevMode)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Note: We removed the automatic redirect from here
  // Individual pages can handle redirects based on their requirements

  return {
    user: session?.user,
    isLoading: status === 'loading' || !isInitialized,
    isAuthenticated: status === 'authenticated',
    isDevMode
  }
}

/**
 * Hook for protected routes that redirects to login if not authenticated
 * Use this in pages that require authentication
 */
export function useProtectedAuth() {
  const { user, isLoading, isAuthenticated, isDevMode } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Skip auth check if in dev mode
    if (isDevMode) {
      console.log('Dev mode enabled - skipping auth redirect')
      return
    }

    if (!isLoading && !isAuthenticated) {
      console.log('Not authenticated - redirecting to login')
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, isDevMode, router])

  // Return mock user in dev mode
  if (isDevMode) {
    console.log('Returning mock user for dev mode')
    return {
      user: {
        id: 'dev-user',
        email: 'dev@admin.com',
        name: 'Developer User',
        image: null
      },
      isLoading: false,
      isAuthenticated: true,
      isDevMode
    }
  }

  return {
    user: session?.user,
    isLoading: isLoading,
    isAuthenticated: isAuthenticated,
    isDevMode
  }
}

// Backend authentication hooks
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onSuccess: (response: AuthResponse) => {
      // Store user data and token
      apiClient.setToken(response.token)
      queryClient.setQueryData(authKeys.user(), response.user)
      console.log('Login successful:', response.user.email)
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterRequest) => apiClient.register(data),
    onSuccess: (response: AuthResponse) => {
      // Store user data and token
      apiClient.setToken(response.token)
      queryClient.setQueryData(authKeys.user(), response.user)
      console.log('Registration successful:', response.user.email)
    },
    onError: (error) => {
      console.error('Registration failed:', error)
    }
  })
}

// export function useCreateApiKey() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (data: CreateApiKeyRequest) => apiClient.createApiKey(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: authKeys.apiKeys() })
//     }
//   })
// }

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Clear token from API client
      apiClient.clearToken()
      // Clear query cache
      queryClient.clear()
      // Sign out from NextAuth
      await signOut({ redirect: false })
    }
  })
}

// Get current user from backend
export function useBackendUsers() {
  return useQuery({
    queryKey: ['backend-users'],
    queryFn: () => apiClient.getBackendUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1 // Only retry once if it fails
  })
}
