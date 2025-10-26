'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        console.error('Sign in error:', result.error)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
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
              <h4 className="text-sm font-medium mb-3">🔐 Test Users (Click to Auto-Fill)</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {[
                  { name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin', color: 'bg-red-100 dark:bg-red-900/20' },
                  { name: 'Test', email: 'test@example.com', password: 'password123', role: 'user', color: 'bg-blue-100 dark:bg-blue-900/20' },
                  { name: 'Demo', email: 'demo@example.com', password: 'demo123', role: 'user', color: 'bg-green-100 dark:bg-green-900/20' },
                  { name: 'John', email: 'john@example.com', password: 'john123', role: 'user', color: 'bg-purple-100 dark:bg-purple-900/20' },
                  { name: 'Jane', email: 'jane@example.com', password: 'jane123', role: 'user', color: 'bg-pink-100 dark:bg-pink-900/20' },
                  { name: 'Manager', email: 'manager@example.com', password: 'manager123', role: 'manager', color: 'bg-orange-100 dark:bg-orange-900/20' },
                  { name: 'Guest', email: 'guest@example.com', password: 'guest123', role: 'guest', color: 'bg-gray-100 dark:bg-gray-800/20' }
                ].map((user) => (
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
              <div className="mt-3 text-xs text-muted-foreground">💡 Click any user above to auto-fill the form</div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
