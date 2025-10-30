'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBackendUsers } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: backendUsers, isLoading: usersLoading, error: usersError } = useBackendUsers()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, get the token from the backend
      console.log('Login: Fetching token from backend...')
      const authResponse = await apiClient.login({ email, password })
      console.log('Login: Backend returned token:', !!authResponse.token)

      // Store the token in the API client
      apiClient.setToken(authResponse.token)
      console.log('Login: Token stored in API client')

      // Then sign in with NextAuth (for session management)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        console.error('Sign in error:', result.error)
      } else {
        console.log('Login: Successfully signed in with NextAuth')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Default test users (fallback if backend is not available)
  const defaultTestUsers = [
    { name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin', color: 'bg-red-100 dark:bg-red-900/20' },
    { name: 'Test', email: 'test@example.com', password: 'password123', role: 'user', color: 'bg-blue-100 dark:bg-blue-900/20' },
    { name: 'Demo', email: 'demo@example.com', password: 'demo123', role: 'user', color: 'bg-green-100 dark:bg-green-900/20' },
    { name: 'John', email: 'john@example.com', password: 'john123', role: 'user', color: 'bg-purple-100 dark:bg-purple-900/20' },
    { name: 'Jane', email: 'jane@example.com', password: 'jane123', role: 'user', color: 'bg-pink-100 dark:bg-pink-900/20' }
  ]

  // Use backend users if available, otherwise fall back to default
  const testUsers = backendUsers?.users?.length
    ? backendUsers.users.map((user, index) => ({
        name: user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1),
        email: user.email,
        password: getPasswordForUser(user.email),
        role: user.email.includes('admin') ? 'admin' : 'user',
        color: ['bg-red-100 dark:bg-red-900/20', 'bg-blue-100 dark:bg-blue-900/20', 'bg-green-100 dark:bg-green-900/20', 'bg-purple-100 dark:bg-purple-900/20', 'bg-pink-100 dark:bg-pink-900/20'][index % 5]
      }))
    : defaultTestUsers

  // Helper function to get password for known users
  function getPasswordForUser(email: string): string {
    const passwordMap: Record<string, string> = {
      'admin@example.com': 'admin123',
      'test@example.com': 'password123',
      'demo@example.com': 'demo123',
      'john@example.com': 'john123',
      'jane@example.com': 'jane123'
    }
    return passwordMap[email] || 'password123'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Quick Admin Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmail('admin@example.com')
                setPassword('admin123')
              }}>
              🚀 Quick Admin Login
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                Create one
              </Link>
            </div>

            {/* Test Users Info */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">🔐 Test Users (Click to Auto-Fill)</h4>
                {usersLoading && <span className="text-xs text-muted-foreground">Loading...</span>}
                {usersError && <span className="text-xs text-red-500">Using fallback</span>}
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {testUsers.map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => {
                      setEmail(user.email)
                      setPassword(user.password)
                    }}
                    className={`p-2 rounded text-left hover:opacity-80 transition-opacity ${user.color}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{user.name}</span>
                        <span className="text-muted-foreground ml-1">({user.role})</span>
                      </div>
                      <div className="text-muted-foreground">{user.email}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                💡 Click any user above to auto-fill the form
                {backendUsers?.users?.length && <span className="block mt-1 text-green-600">✅ Loaded {backendUsers.users.length} users from database</span>}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
