'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function BackendTestPage() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setStatus('Testing connection...')

    try {
      const response = await fetch('http://localhost:8000/health')
      const data = await response.text()

      if (response.ok) {
        setStatus(`✅ Success! Backend responded: "${data}"`)
      } else {
        setStatus(`❌ Error: ${response.status} - ${data}`)
      }
    } catch (error) {
      setStatus(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testRootEndpoint = async () => {
    setLoading(true)
    setStatus('Testing root endpoint...')

    try {
      const response = await fetch('http://localhost:8000/')
      const data = await response.text()

      if (response.ok) {
        setStatus(`✅ Root endpoint responded: "${data}"`)
      } else {
        setStatus(`❌ Error: ${response.status} - ${data}`)
      }
    } catch (error) {
      setStatus(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Backend Connection Test</h1>
          <p className="text-muted-foreground mt-2">Test the connection to the Rust backend running on port 8000</p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Connection Tests</h2>
            <p className="text-sm text-muted-foreground">Click the buttons below to test different endpoints</p>
          </div>

          <div className="flex gap-4">
            <Button onClick={testConnection} disabled={loading}>
              Test /health
            </Button>
            <Button onClick={testRootEndpoint} disabled={loading} variant="outline">
              Test Root (/)
            </Button>
          </div>

          {status && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono whitespace-pre-wrap">{status}</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Backend Endpoints</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>
              • <code className="font-mono bg-muted px-1 rounded">GET /health</code> - Health check
            </li>
            <li>
              • <code className="font-mono bg-muted px-1 rounded">GET /</code> - Welcome message
            </li>
            <li>
              • <code className="font-mono bg-muted px-1 rounded">POST /auth/register</code> - Register user
            </li>
            <li>
              • <code className="font-mono bg-muted px-1 rounded">POST /auth/login</code> - Login user
            </li>
            <li>
              • <code className="font-mono bg-muted px-1 rounded">GET /receipts</code> - List receipts (protected)
            </li>
            <li>
              • <code className="font-mono bg-muted px-1 rounded">POST /receipts</code> - Create receipt (protected)
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
