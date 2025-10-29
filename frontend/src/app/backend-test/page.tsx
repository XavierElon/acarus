'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin, useLogout } from '@/hooks/use-auth'
import { useReceipts } from '@/hooks/use-receipts'
import { apiClient } from '@/lib/api-client'

export default function BackendTestPage() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const loginMutation = useLogin()
  const logoutMutation = useLogout()
  const { data: receipts, isLoading: receiptsLoading, refetch: refetchReceipts } = useReceipts()

  const testBackendConnection = async () => {
    setIsLoading(true)
    const results: any = {}

    try {
      // Test health endpoint
      const healthResponse = await fetch('http://localhost:8000/health')
      results.health = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        data: await healthResponse.text()
      }
    } catch (error) {
      results.health = { error: error.message }
    }

    try {
      // Test root endpoint
      const rootResponse = await fetch('http://localhost:8000/')
      results.root = {
        status: rootResponse.status,
        ok: rootResponse.ok,
        data: await rootResponse.text()
      }
    } catch (error) {
      results.root = { error: error.message }
    }

    setTestResults(results)
    setIsLoading(false)
  }

  const handleLogin = async () => {
    try {
      await loginMutation.mutateAsync({ email, password })
      setTestResults((prev) => ({ ...prev, login: { success: true, message: 'Login successful' } }))
    } catch (error: any) {
      setTestResults((prev) => ({ ...prev, login: { success: false, error: error.message } }))
    }
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      setTestResults((prev) => ({ ...prev, logout: { success: true, message: 'Logout successful' } }))
    } catch (error: any) {
      setTestResults((prev) => ({ ...prev, logout: { success: false, error: error.message } }))
    }
  }

  const testReceipts = async () => {
    try {
      await refetchReceipts()
      setTestResults((prev) => ({
        ...prev,
        receipts: {
          success: true,
          count: receipts?.receipts?.length || 0,
          message: `Found ${receipts?.receipts?.length || 0} receipts`
        }
      }))
    } catch (error: any) {
      setTestResults((prev) => ({ ...prev, receipts: { success: false, error: error.message } }))
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backend Connection Test</CardTitle>
          <CardDescription>Test the connection to the Rust backend API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testBackendConnection} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Test Backend Connection'}
            </Button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(testResults, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>Test login/logout with backend users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin123" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleLogin} disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
            <Button onClick={handleLogout} disabled={logoutMutation.isPending} variant="outline">
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Test accounts:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>admin@example.com / admin123</li>
              <li>test@example.com / password123</li>
              <li>demo@example.com / demo123</li>
              <li>john@example.com / john123</li>
              <li>jane@example.com / jane123</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receipts Test</CardTitle>
          <CardDescription>Test fetching receipts from backend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testReceipts} disabled={receiptsLoading}>
            {receiptsLoading ? 'Loading...' : 'Fetch Receipts'}
          </Button>

          {receipts && (
            <div className="space-y-2">
              <h3 className="font-semibold">Receipts Data:</h3>
              <div className="text-sm">
                <p>Total receipts: {receipts.total}</p>
                <p>Current page: {receipts.page}</p>
                <p>Receipts per page: {receipts.limit}</p>
                <p>Total pages: {receipts.totalPages}</p>
              </div>

              {receipts.receipts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Sample Receipts:</h4>
                  <div className="space-y-1 text-sm">
                    {receipts.receipts.slice(0, 3).map((receipt: any) => (
                      <div key={receipt.id} className="p-2 bg-gray-50 rounded">
                        <p>
                          <strong>{receipt.merchant}</strong> - ${receipt.total}
                        </p>
                        <p className="text-gray-600">{new Date(receipt.date).toLocaleDateString()}</p>
                        <p className="text-gray-500">Items: {receipt.items?.length || 0}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
