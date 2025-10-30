import { NextRequest } from 'next/server'
import { mockUserReceiptData } from '@/lib/mock-user-receipts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const category = searchParams.get('category')
    const merchant = searchParams.get('merchant')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get all receipts (in a real app, this would be filtered by current user)
    let allReceipts = mockUserReceiptData.generateAllUserReceipts()

    // Apply filters
    if (category) {
      allReceipts = allReceipts.filter((receipt) => receipt.category === category)
    }

    if (merchant) {
      allReceipts = allReceipts.filter((receipt) => receipt.merchant.toLowerCase().includes(merchant.toLowerCase()))
    }

    if (startDate) {
      const start = new Date(startDate)
      allReceipts = allReceipts.filter((receipt) => receipt.date >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      allReceipts = allReceipts.filter((receipt) => receipt.date <= end)
    }

    // Sort receipts
    allReceipts.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'date':
          aValue = a.date.getTime()
          bValue = b.date.getTime()
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'merchant':
          aValue = a.merchant.toLowerCase()
          bValue = b.merchant.toLowerCase()
          break
        default:
          aValue = a.date.getTime()
          bValue = b.date.getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Paginate
    const total = allReceipts.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const receipts = allReceipts.slice(startIndex, endIndex)

    // Convert to API format
    const response = {
      receipts: receipts.map((receipt) => ({
        id: receipt.id,
        merchant: receipt.merchant,
        amount: receipt.amount,
        total: receipt.amount, // API expects 'total' field
        date: receipt.date.toISOString(),
        category: receipt.category,
        description: receipt.description,
        items: receipt.items,
        tax: receipt.tax,
        subtotal: receipt.subtotal,
        location: receipt.location,
        paymentMethod: receipt.paymentMethod,
        confidence: receipt.confidence
      })),
      total,
      page,
      limit,
      totalPages
    }

    return Response.json(response)
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return Response.json({ error: 'Failed to fetch receipts' }, { status: 500 })
  }
}
