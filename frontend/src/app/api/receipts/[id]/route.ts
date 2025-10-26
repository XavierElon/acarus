import { NextRequest } from 'next/server'
import { mockUserReceiptData } from '@/lib/mock-user-receipts'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: receiptId } = await params

    // Get all receipts and find the specific one
    const allReceipts = mockUserReceiptData.generateAllUserReceipts()
    const receipt = allReceipts.find((r) => r.id === receiptId)

    if (!receipt) {
      return Response.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Convert to API format
    const response = {
      id: receipt.id,
      merchant: receipt.merchant,
      amount: receipt.amount,
      total: receipt.amount,
      date: receipt.date.toISOString(),
      category: receipt.category,
      description: receipt.description,
      items: receipt.items,
      tax: receipt.tax,
      subtotal: receipt.subtotal,
      location: receipt.location,
      paymentMethod: receipt.paymentMethod,
      confidence: receipt.confidence,
      ocrText: receipt.ocrText,
      userId: receipt.userId,
      userEmail: receipt.userEmail,
      userName: receipt.userName
    }

    return Response.json(response)
  } catch (error) {
    console.error('Error fetching receipt:', error)
    return Response.json({ error: 'Failed to fetch receipt' }, { status: 500 })
  }
}
