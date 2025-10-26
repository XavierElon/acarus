'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Auth query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  apiKeys: () => [...authKeys.all, 'apiKeys'] as const
}

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
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

  useEffect(() => {
    // Skip auth check if in dev mode
    if (isDevMode) {
      console.log('Dev mode enabled - skipping auth redirect')
      return
    }

    if (status === 'unauthenticated') {
      console.log('Not authenticated - redirecting to login')
      router.push('/auth/login')
    }
  }, [status, router, isDevMode])

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
      isAuthenticated: true
    }
  }

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated'
  }
}

// Auth hooks
// export function useLogin() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (data: LoginRequest) => apiClient.login(data),
//     onSuccess: (response) => {
//       // Store user data in query cache
//       queryClient.setQueryData(authKeys.user(), response.user)
//     }
//   })
// }

// export function useRegister() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (data: RegisterRequest) => apiClient.register(data),
//     onSuccess: (response) => {
//       // Store user data in query cache
//       queryClient.setQueryData(authKeys.user(), response.user)
//       apiClient.setToken(response.token)
//     }
//   })
// }

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
      queryClient.clear()
    }
  })
}

// Get current user from localStorage (simplified auth for demo)
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No token found')
      }
      // In a real app, you'd decode the JWT or make an API call
      // For now, we'll return a mock user
      return Promise.resolve({
        id: '1',
        email: 'user@example.com',
        created_at: new Date().toISOString()
      })
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
    staleTime: Infinity // Don't refetch user data
  })
}
