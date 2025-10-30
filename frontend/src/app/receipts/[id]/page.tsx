'use client'

import { useState, useEffect, use } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, FileText, Calendar, MapPin, CreditCard, DollarSign, Package, User, Mail, TrendingUp, Eye, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api-client'

interface ReceiptDetailPageProps {
  params: Promise<{
    id: string
  }>
}

interface ReceiptData {
  id: string
  merchant: string
  amount: number
  total: number
  date: string
  category: string
  description: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    total?: number
  }>
  tax?: number
  subtotal?: number
  location?: string
  paymentMethod?: string
  confidence?: number
  ocrText?: string
  userId?: string
  userEmail?: string
  userName?: string
  createdAt?: string
  updatedAt?: string
}

export default function ReceiptDetailPage({ params }: ReceiptDetailPageProps) {
  const { id } = use(params)
  const { isLoading: authLoading } = useAuth()
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ocrCopied, setOcrCopied] = useState(false)

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!id) return
      
      try {
        const backendReceipt = await apiClient.getBackendReceipt(id)
        
        // Convert backend receipt to frontend format
        const receiptData: ReceiptData = {
          id: backendReceipt.id,
          merchant: backendReceipt.vendor_name,
          amount: backendReceipt.total_amount,
          total: backendReceipt.total_amount,
          date: backendReceipt.purchase_date,
          category: 'General', // Default category since backend doesn't have this
          description: '',
          items: backendReceipt.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.unit_price,
            total: item.total_price
          })),
          createdAt: backendReceipt.created_at,
          updatedAt: backendReceipt.updated_at
        }
        
        setReceipt(receiptData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load receipt')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchReceipt()
    }
  }, [id])

  const copyOCRText = async () => {
    if (receipt?.ocrText) {
      await navigator.clipboard.writeText(receipt.ocrText)
      setOcrCopied(true)
      setTimeout(() => setOcrCopied(false), 2000)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (confidence >= 0.8) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </MainLayout>
    )
  }

  if (error || !receipt) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/receipts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Receipts
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Receipt Not Found</h1>
              <p className="text-muted-foreground">Receipt ID: {id}</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Receipt Not Found</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button asChild>
                  <Link href="/receipts">Back to Receipts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/receipts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Receipts
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{receipt.merchant}</h1>
              <p className="text-muted-foreground">{formatDate(receipt.date)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              ${receipt.total.toFixed(2)}
            </Badge>
            <Badge variant="outline">{receipt.category}</Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Receipt Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Receipt Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Receipt Summary
                </CardTitle>
                <CardDescription>Transaction details and breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      Date & Time
                    </div>
                    <p className="font-medium">{formatDate(receipt.date)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Total Amount
                    </div>
                    <p className="font-medium text-lg">${receipt.total.toFixed(2)}</p>
                  </div>
                </div>

                {receipt.location && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      Location
                    </div>
                    <p className="font-medium">{receipt.location}</p>
                  </div>
                )}

                {receipt.paymentMethod && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Method
                    </div>
                    <p className="font-medium">{receipt.paymentMethod}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    OCR Confidence
                  </div>
                  <div className="flex items-center space-x-2">
                    {receipt.confidence && (
                      <>
                        {getConfidenceIcon(receipt.confidence)}
                        <span className={`font-medium ${getConfidenceColor(receipt.confidence)}`}>{(receipt.confidence * 100).toFixed(1)}%</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Items Purchased
                </CardTitle>
                <CardDescription>
                  {receipt.items.length} item{receipt.items.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {receipt.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">${((item.total ?? item.price * item.quantity)).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  {receipt.subtotal !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>${receipt.subtotal.toFixed(2)}</span>
                    </div>
                  )}
                  {receipt.tax !== undefined && receipt.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>${receipt.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${receipt.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OCR Text */}
            {receipt.ocrText && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="mr-2 h-5 w-5" />
                      OCR Text
                    </div>
                    <Button variant="outline" size="sm" onClick={copyOCRText} className="flex items-center">
                      {ocrCopied ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Text
                        </>
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription>Raw text extracted from receipt image</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{receipt.ocrText}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            {receipt.userName && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="mr-2 h-4 w-4" />
                      Name
                    </div>
                    <p className="font-medium">{receipt.userName}</p>
                  </div>
                  {receipt.userEmail && (
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </div>
                      <p className="font-medium text-sm">{receipt.userEmail}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/receipts/new">
                    <FileText className="mr-2 h-4 w-4" />
                    Add New Receipt
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/receipts">View All Receipts</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Receipt Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Receipt ID</div>
                  <p className="font-mono text-sm">{receipt.id}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Category</div>
                  <Badge variant="outline">{receipt.category}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Description</div>
                  <p className="text-sm">{receipt.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
