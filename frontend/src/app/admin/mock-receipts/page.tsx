'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { PageTransition } from '@/components/animations/page-transition'
import { FadeIn } from '@/components/animations/fade-in'
import { mockReceipts, mockReceiptUtils, mockReceiptCategories, MockReceipt } from '@/lib/mock-receipt-data'
import { Receipt, Plus, Download, Eye, RefreshCw, Filter, Calendar, DollarSign, Store, Tag } from 'lucide-react'

export default function MockReceiptGeneratorPage() {
  const [generatedReceipts, setGeneratedReceipts] = useState<MockReceipt[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateReceipt = async (category?: string) => {
    setIsGenerating(true)
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newReceipt = mockReceiptUtils.generateReceipt(category)
    setGeneratedReceipts((prev) => [newReceipt, ...prev])
    setIsGenerating(false)
  }

  const generateMultipleReceipts = async (count: number, category?: string) => {
    setIsGenerating(true)
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newReceipts = mockReceiptUtils.generateReceipts(count, category)
    setGeneratedReceipts((prev) => [...newReceipts, ...prev])
    setIsGenerating(false)
  }

  const clearGeneratedReceipts = () => {
    setGeneratedReceipts([])
  }

  const downloadReceiptData = (receipt: MockReceipt) => {
    const dataStr = JSON.stringify(receipt, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt_${receipt.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="space-y-6">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Mock Receipt Generator</h1>
                <p className="text-muted-foreground">Generate realistic receipt data for testing</p>
              </div>
              <Badge variant="outline" className="flex items-center">
                <Receipt className="mr-1 h-3 w-3" />
                Test Data
              </Badge>
            </div>
          </FadeIn>

          {/* Generator Controls */}
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Generate Receipts
                </CardTitle>
                <CardDescription>Create mock receipt data for testing OCR and validation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category Filter (Optional)</label>
                  <div className="flex flex-wrap gap-2">
                    <Button variant={selectedCategory === '' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('')}>
                      All Categories
                    </Button>
                    {mockReceiptCategories.map((category) => (
                      <Button key={category.name} variant={selectedCategory === category.name ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(category.name)}>
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Generation Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => generateReceipt(selectedCategory)} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Generate 1 Receipt
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={() => generateMultipleReceipts(5, selectedCategory)} disabled={isGenerating}>
                    Generate 5 Receipts
                  </Button>

                  <Button variant="outline" onClick={() => generateMultipleReceipts(10, selectedCategory)} disabled={isGenerating}>
                    Generate 10 Receipts
                  </Button>

                  <Button variant="destructive" onClick={clearGeneratedReceipts} disabled={generatedReceipts.length === 0}>
                    Clear All
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Generated: {generatedReceipts.length}</span>
                  <span>Pre-built: {mockReceipts.length}</span>
                  {selectedCategory && <span>Category: {selectedCategory}</span>}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Pre-built Receipts */}
          <FadeIn delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="mr-2 h-5 w-5" />
                  Pre-built Receipts
                </CardTitle>
                <CardDescription>Ready-to-use mock receipts for immediate testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockReceipts.map((receipt) => (
                    <div key={receipt.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{receipt.merchant}</h4>
                        <Badge variant="secondary">{receipt.category}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <DollarSign className="mr-1 h-3 w-3" />
                          {formatCurrency(receipt.amount)}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(receipt.date)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {receipt.items.length} items • {Math.round(receipt.confidence * 100)}% confidence
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => downloadReceiptData(receipt)}>
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newReceipt = { ...receipt, id: `receipt_${Date.now()}` }
                            setGeneratedReceipts((prev) => [newReceipt, ...prev])
                          }}>
                          <Plus className="mr-1 h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Generated Receipts */}
          {generatedReceipts.length > 0 && (
            <FadeIn delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Generated Receipts ({generatedReceipts.length})
                  </CardTitle>
                  <CardDescription>Dynamically generated mock receipts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedReceipts.map((receipt) => (
                      <div key={receipt.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium">{receipt.merchant}</h4>
                            <Badge variant="outline">{receipt.category}</Badge>
                            <Badge variant="secondary">{Math.round(receipt.confidence * 100)}% confidence</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => downloadReceiptData(receipt)}>
                              <Download className="mr-1 h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          {/* Receipt Details */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Receipt Details</h5>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-medium">{formatCurrency(receipt.amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <span>{formatDate(receipt.date)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Items:</span>
                                <span>{receipt.items.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment:</span>
                                <span>{receipt.paymentMethod}</span>
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Items</h5>
                            <div className="text-sm space-y-1">
                              {receipt.items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span>{formatCurrency(item.total)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* OCR Preview */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">OCR Text Preview</h5>
                            <div className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                              <pre className="whitespace-pre-wrap font-mono">
                                {receipt.ocrText.substring(0, 200)}
                                {receipt.ocrText.length > 200 && '...'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Usage Instructions */}
          <FadeIn delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle>How to Use Mock Receipts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">For OCR Testing:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use the OCR text as input for Tesseract.js</li>
                      <li>• Test validation with realistic receipt data</li>
                      <li>• Compare extracted data with expected results</li>
                      <li>• Verify confidence scores and accuracy</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">For Development:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Download JSON data for API testing</li>
                      <li>• Generate multiple receipts for bulk testing</li>
                      <li>• Filter by category for specific scenarios</li>
                      <li>• Use pre-built receipts for consistent testing</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Pro Tip:</strong> The mock receipts include realistic OCR text, confidence scores, and structured data that closely mimics real receipt processing results. Use them to test your validation logic and UI components!
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </PageTransition>
    </MainLayout>
  )
}
