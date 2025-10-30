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
import { Upload, Camera, FileText, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { ValidationResult, ValidationFlag, receiptValidator } from '@/lib/receipt-validator'

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
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Travel', 'Other']

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setValidationResult(null)
    setShowValidation(false)
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

  const validateReceipt = async () => {
    if (!selectedFile) {
      alert('Please select a receipt image first')
      return
    }

    setIsUploading(true)
    setShowValidation(true)

    try {
      // Prepare receipt data
      const receiptData = {
        merchant: formData.merchant,
        amount: parseFloat(formData.amount) || 0,
        date: new Date(formData.date),
        category: formData.category,
        description: formData.description,
        image: selectedFile
      }

      // Call validator directly (client-side validation)
      const result = await receiptValidator.validateReceipt(receiptData)
      setValidationResult(result)
    } catch (error) {
      console.error('Validation error:', error)
      setValidationResult({
        isValid: false,
        confidence: 0,
        riskScore: 1.0,
        flags: [
          {
            type: 'ERROR',
            code: 'VALIDATION_ERROR',
            message: error instanceof Error ? error.message : 'Failed to validate receipt',
            severity: 'high'
          }
        ],
        recommendations: ['Please try again']
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validationResult?.isValid) {
      alert('Please validate the receipt first and resolve any issues')
      return
    }

    // Here you would typically save the receipt to your database
    console.log('Saving receipt:', { ...formData, file: selectedFile })

    // For now, just redirect to receipts page
    router.push('/receipts')
  }

  const getFlagIcon = (flag: ValidationFlag) => {
    switch (flag.type) {
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

  const getFlagColor = (flag: ValidationFlag) => {
    switch (flag.severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
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
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Drag and drop your receipt here, or click to browse</p>
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
                          setValidationResult(null)
                          setShowValidation(false)
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
                  <CardDescription>Enter the receipt information</CardDescription>
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

          {/* Validation Section */}
          {showValidation && (
            <FadeIn delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : validationResult?.isValid ? <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> : <XCircle className="mr-2 h-5 w-5 text-red-500" />}
                    Receipt Validation
                  </CardTitle>
                  <CardDescription>{isUploading ? 'Validating receipt...' : validationResult?.isValid ? 'Receipt validation passed' : 'Receipt validation failed'}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isUploading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Processing receipt...</span>
                    </div>
                  ) : validationResult ? (
                    <div className="space-y-4">
                      {/* Validation Summary */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{Math.round(validationResult.confidence * 100)}%</div>
                          <p className="text-sm text-muted-foreground">Confidence</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{Math.round(validationResult.riskScore * 100)}%</div>
                          <p className="text-sm text-muted-foreground">Risk Score</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{validationResult.flags.length}</div>
                          <p className="text-sm text-muted-foreground">Issues</p>
                        </div>
                      </div>

                      {/* Validation Flags */}
                      {validationResult.flags.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Validation Results:</h4>
                          {validationResult.flags.map((flag, index) => (
                            <div key={index} className={`flex items-center space-x-2 p-3 rounded-lg border ${getFlagColor(flag)}`}>
                              {getFlagIcon(flag)}
                              <div className="flex-1">
                                <p className="text-sm font-medium">{flag.message}</p>
                                <p className="text-xs opacity-75">Code: {flag.code}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {flag.severity}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recommendations */}
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

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button onClick={validateReceipt} variant="outline" disabled={isUploading}>
                          Re-validate
                        </Button>
                        {validationResult.isValid && <Button onClick={handleSubmit}>Save Receipt</Button>}
                      </div>
                    </div>
                  ) : null}
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
                    Validating...
                  </>
                ) : (
                  'Validate Receipt'
                )}
              </Button>
            </div>
          </FadeIn>
        </div>
      </PageTransition>
    </MainLayout>
  )
}
