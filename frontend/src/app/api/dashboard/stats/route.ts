import { mockUserReceiptData } from '@/lib/mock-user-receipts'

export async function GET() {
  try {
    // Get all receipts (in a real app, this would be filtered by current user)
    const allReceipts = mockUserReceiptData.generateAllUserReceipts()

    // Calculate stats
    const totalReceipts = allReceipts.length
    const totalSpent = allReceipts.reduce((sum, receipt) => sum + receipt.amount, 0)
    const averageReceipt = totalReceipts > 0 ? totalSpent / totalReceipts : 0

    // Receipts this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const receiptsThisMonth = allReceipts.filter((receipt) => receipt.date >= startOfMonth).length

    // Top categories
    const categoryTotals = allReceipts.reduce((acc, receipt) => {
      acc[receipt.category] = (acc[receipt.category] || 0) + receipt.amount
      return acc
    }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Recent receipts (last 5)
    const recentReceipts = allReceipts
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map((receipt) => ({
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
        confidence: receipt.confidence
      }))

    const stats = {
      totalReceipts,
      totalSpent,
      averageReceipt,
      receiptsThisMonth,
      topCategories,
      recentReceipts
    }

    return Response.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return Response.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
