'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { PageTransition } from '@/components/animations/page-transition'
import { FadeIn } from '@/components/animations/fade-in'
import { Upload, Camera, FileText, AlertCircle, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { BackendReceipt } from '@/lib/api-client'

export default function NewReceiptPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Food & Dining',
    description: ''
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedReceipt, setUploadedReceipt] = useState<BackendReceipt | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Add drag and drop state
  const [isDragging, setIsDragging] = useState(false)

  const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Travel', 'Other']

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setUploadedReceipt(null)
    setError(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      handleFileSelect(file)
    }
  }

  const validateReceipt = async () => {
    if (!selectedFile) {
      alert('Please select a receipt image first')
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadedReceipt(null)

    try {
      // Upload to backend - this will call OCR and create receipt
      const receipt = await apiClient.uploadReceiptImage(selectedFile)

      // Set the uploaded receipt with OCR data
      setUploadedReceipt(receipt)

      // Auto-fill form with OCR-extracted data
      setFormData({
        merchant: receipt.vendor_name || '',
        amount: receipt.total_amount.toString() || '',
        date: receipt.purchase_date ? new Date(receipt.purchase_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: formData.category, // Keep user's category choice
        description: formData.description // Keep user's description
      })
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload and process receipt')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!uploadedReceipt) {
      alert('Please upload and process the receipt first')
      return
    }

    // Receipt is already saved in the database from the upload
    // Just redirect to receipts page
    router.push('/receipts')
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="space-y-6">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Add New Receipt</h1>
                <p className="text-muted-foreground">Upload and validate your receipt</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/receipts')}>
                Cancel
              </Button>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Upload Section */}
            <FadeIn delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="mr-2 h-5 w-5" />
                    Receipt Upload
                  </CardTitle>
                  <CardDescription>Upload a clear image of your receipt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!selectedFile ? (
                    <div className="space-y-4">
                      {/* Drag and Drop Zone */}
                      <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                          ${isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/5'}
                        `}
                        onClick={() => fileInputRef.current?.click()}>
                        <FileText className={`mx-auto h-12 w-12 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="mt-2 text-sm font-medium">{isDragging ? 'Drop your receipt here' : 'Drag and drop your receipt here, or click to browse'}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Supports: JPG, PNG, GIF (Max 10MB)</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload File
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => cameraInputRef.current?.click()}>
                          <Camera className="mr-2 h-4 w-4" />
                          Take Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <Badge variant="secondary">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null)
                          setUploadedReceipt(null)
                          setError(null)
                        }}>
                        Remove File
                      </Button>
                    </div>
                  )}

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="hidden" />
                </CardContent>
              </Card>
            </FadeIn>

            {/* Form Section */}
            <FadeIn delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle>Receipt Details</CardTitle>
                  <CardDescription>Review and edit the extracted information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="merchant">Merchant</Label>
                    <Input id="merchant" value={formData.merchant} onChange={(e) => setFormData({ ...formData, merchant: e.target.value })} placeholder="e.g., Starbucks Coffee" />
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Additional notes..." />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* OCR Results Section */}
          {uploadedReceipt && (
            <FadeIn delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-primary" />
                    OCR Extraction Results
                  </CardTitle>
                  <CardDescription>Data extracted from your receipt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Receipt Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{uploadedReceipt.vendor_name}</div>
                        <p className="text-sm text-muted-foreground">Vendor</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {uploadedReceipt.currency} {uploadedReceipt.total_amount.toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{new Date(uploadedReceipt.purchase_date).toLocaleDateString()}</div>
                        <p className="text-sm text-muted-foreground">Purchase Date</p>
                      </div>
                    </div>

                    {/* Items List */}
                    {uploadedReceipt.items && uploadedReceipt.items.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Items:</h4>
                        <div className="space-y-1">
                          {uploadedReceipt.items.map((item, index) => (
                            <div key={item.id || index} className="flex items-center justify-between p-2 rounded border">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} × {item.unit_price.toFixed(2)} = {item.total_price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p className="text-sm text-green-800">Receipt successfully processed and saved!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Error Display */}
          {error && (
            <FadeIn delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-500">
                    <XCircle className="mr-2 h-5 w-5" />
                    Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Action Buttons */}
          <FadeIn delay={0.4}>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => router.push('/receipts')}>
                Cancel
              </Button>
              <Button onClick={validateReceipt} disabled={!selectedFile || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Process with OCR
                  </>
                )}
              </Button>
              {uploadedReceipt && <Button onClick={handleSubmit}>View Receipt</Button>}
            </div>
          </FadeIn>
        </div>
      </PageTransition>
    </MainLayout>
  )
}
