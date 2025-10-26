'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { PageTransition } from '@/components/animations/page-transition'
import { FadeIn } from '@/components/animations/fade-in'
import { useReceiptValidation } from '@/hooks/use-receipt-validation'
import { ReceiptData } from '@/lib/receipt-validator'
import { TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function ValidationTestPage() {
  const { isValidating, validationResult, error, validateReceipt, clearValidation } = useReceiptValidation()
  const [testResults, setTestResults] = useState<any[]>([])

  const testCases: { name: string; receipt: ReceiptData }[] = [
    {
      name: 'Valid Receipt',
      receipt: {
        merchant: 'Starbucks Coffee',
        amount: 8.05,
        date: new Date(),
        category: 'Food & Dining',
        image: new File([''], 'receipt.jpg', { type: 'image/jpeg' })
      }
    },
    {
      name: 'Duplicate Receipt',
      receipt: {
        merchant: 'Starbucks Coffee',
        amount: 8.05,
        date: new Date(),
        category: 'Food & Dining',
        image: new File([''], 'receipt.jpg', { type: 'image/jpeg' })
      }
    },
    {
      name: 'Invalid Amount',
      receipt: {
        merchant: 'Test Store',
        amount: -5.00,
        date: new Date(),
        category: 'Shopping',
        image: new File([''], 'receipt.jpg', { type: 'image/jpeg' })
      }
    },
    {
      name: 'Future Date',
      receipt: {
        merchant: 'Future Store',
        amount: 25.50,
        date: new Date(Date.now() + 86400000), // Tomorrow
        category: 'Shopping',
        image: new File([''], 'receipt.jpg', { type: 'image/jpeg' })
      }
    }
  ]

  const runTest = async (testCase: { name: string; receipt: ReceiptData }) => {
    const result = await validateReceipt(testCase.receipt)
    
    setTestResults(prev => [...prev, {
      name: testCase.name,
      result: result,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const runAllTests = async () => {
    setTestResults([])
    for (const testCase of testCases) {
      await runTest(testCase)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const getFlagIcon = (type: string) => {
    switch (type) {
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'WARNING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'INFO':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="space-y-6">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Receipt Validation Test</h1>
                <p className="text-muted-foreground">Test the OCR validation and duplicate detection system</p>
              </div>
              <Badge variant="outline" className="flex items-center">
                <TestTube className="mr-1 h-3 w-3" />
                Development
              </Badge>
            </div>
          </FadeIn>

          {/* Test Controls */}
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Test Controls</CardTitle>
                <CardDescription>Run validation tests to verify the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={runAllTests} disabled={isValidating}>
                    Run All Tests
                  </Button>
                  <Button variant="outline" onClick={clearValidation}>
                    Clear Results
                  </Button>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {testCases.map((testCase, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => runTest(testCase)}
                      disabled={isValidating}
                      className="justify-start"
                    >
                      {testCase.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Current Validation Result */}
          {validationResult && (
            <FadeIn delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {validationResult.isValid ? (
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="mr-2 h-5 w-5 text-red-500" />
                    )}
                    Current Validation Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(validationResult.confidence * 100)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(validationResult.riskScore * 100)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Risk Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {validationResult.flags.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Issues</p>
                    </div>
                  </div>

                  {validationResult.flags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Validation Flags:</h4>
                      {validationResult.flags.map((flag, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-2 rounded border"
                        >
                          {getFlagIcon(flag.type)}
                          <span className="text-sm">{flag.message}</span>
                          <Badge variant="outline" className="text-xs">
                            {flag.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {validationResult.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Recommendations:</h4>
                      <ul className="space-y-1">
                        {validationResult.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Test Results History */}
          {testResults.length > 0 && (
            <FadeIn delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle>Test Results History</CardTitle>
                  <CardDescription>Results from previous test runs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          {test.result?.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{test.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {Math.round((test.result?.confidence || 0) * 100)}% | 
                              Risk: {Math.round((test.result?.riskScore || 0) * 100)}% | 
                              Flags: {test.result?.flags.length || 0}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {test.timestamp}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Error Display */}
          {error && (
            <FadeIn delay={0.4}>
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </div>
      </PageTransition>
    </MainLayout>
  )
}
