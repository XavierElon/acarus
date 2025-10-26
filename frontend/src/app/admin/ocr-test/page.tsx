'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { PageTransition } from '@/components/animations/page-transition'
import { FadeIn } from '@/components/animations/fade-in'
import { tesseractOCR, OCRResult } from '@/lib/tesseract-ocr'
import { Upload, FileText, Loader2, CheckCircle, Clock, Eye } from 'lucide-react'

export default function OCRTestPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ status: string; progress: number } | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setOcrResult(null)
      setError(null)
      setProgress(null)
    }
  }

  const processImage = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)
    setProgress({ status: 'Initializing...', progress: 0 })

    try {
      const result = await tesseractOCR.extractTextFromImage(selectedFile, (progress) => {
        setProgress({
          status: progress.status,
          progress: progress.progress * 100
        })
      })

      setOcrResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR processing failed')
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="space-y-6">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">OCR Test</h1>
                <p className="text-muted-foreground">Test Tesseract.js OCR with receipt images</p>
              </div>
              <Badge variant="outline" className="flex items-center">
                <Eye className="mr-1 h-3 w-3" />
                Tesseract.js
              </Badge>
            </div>
          </FadeIn>

          {/* File Upload */}
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Receipt Image
                </CardTitle>
                <CardDescription>Select a receipt image to test OCR extraction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Click to select a receipt image</p>
                    <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Select Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 border rounded">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <Badge variant="secondary">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={processImage} disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Process with OCR'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null)
                          setOcrResult(null)
                          setError(null)
                          setProgress(null)
                        }}>
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </CardContent>
            </Card>
          </FadeIn>

          {/* Progress */}
          {progress && (
            <FadeIn delay={0.2}>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{progress.status}</span>
                      <span>{Math.round(progress.progress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress.progress}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* OCR Results */}
          {ocrResult && (
            <FadeIn delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    OCR Results
                  </CardTitle>
                  <CardDescription>Extracted text and structured data from the receipt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(ocrResult.confidence * 100)}%</div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatProcessingTime(ocrResult.processingTime)}</div>
                      <p className="text-sm text-muted-foreground">Processing Time</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{ocrResult.text.length}</div>
                      <p className="text-sm text-muted-foreground">Characters</p>
                    </div>
                  </div>

                  {/* Extracted Data */}
                  {ocrResult.extractedData && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Extracted Data:</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {ocrResult.extractedData.merchant && (
                          <div className="p-3 bg-muted rounded">
                            <p className="text-sm font-medium">Merchant</p>
                            <p className="text-sm text-muted-foreground">{ocrResult.extractedData.merchant}</p>
                          </div>
                        )}
                        {ocrResult.extractedData.total && (
                          <div className="p-3 bg-muted rounded">
                            <p className="text-sm font-medium">Total</p>
                            <p className="text-sm text-muted-foreground">${ocrResult.extractedData.total.toFixed(2)}</p>
                          </div>
                        )}
                        {ocrResult.extractedData.date && (
                          <div className="p-3 bg-muted rounded">
                            <p className="text-sm font-medium">Date</p>
                            <p className="text-sm text-muted-foreground">{ocrResult.extractedData.date.toLocaleDateString()}</p>
                          </div>
                        )}
                        {ocrResult.extractedData.subtotal && (
                          <div className="p-3 bg-muted rounded">
                            <p className="text-sm font-medium">Subtotal</p>
                            <p className="text-sm text-muted-foreground">${ocrResult.extractedData.subtotal.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  {ocrResult.extractedData?.items && ocrResult.extractedData.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Items Found:</h4>
                      <div className="space-y-1">
                        {ocrResult.extractedData.items.slice(0, 5).map((item, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {item}
                          </div>
                        ))}
                        {ocrResult.extractedData.items.length > 5 && <div className="text-sm text-muted-foreground">... and {ocrResult.extractedData.items.length - 5} more items</div>}
                      </div>
                    </div>
                  )}

                  {/* Raw Text */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Raw OCR Text:</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-mono">{ocrResult.text}</pre>
                    </div>
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
                    <FileText className="h-4 w-4 text-red-500" />
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Instructions */}
          <FadeIn delay={0.5}>
            <Card>
              <CardHeader>
                <CardTitle>How to Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">1. Upload a clear receipt image (JPG, PNG, etc.)</p>
                <p className="text-sm text-muted-foreground">2. Click "Process with OCR" to extract text</p>
                <p className="text-sm text-muted-foreground">3. Review the extracted data and confidence score</p>
                <p className="text-sm text-muted-foreground">4. Check the raw OCR text for accuracy</p>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> For best results, use clear, well-lit receipt images with good contrast. Receipts with handwritten text or poor image quality may have lower accuracy.
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
