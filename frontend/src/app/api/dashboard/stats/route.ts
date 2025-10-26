export async function GET() {
  // Mock dashboard stats for now
  const stats = {
    totalReceipts: 0,
    totalSpent: 0,
    averageReceipt: 0,
    receiptsThisMonth: 0,
    topCategories: [],
    recentReceipts: []
  }

  return Response.json(stats)
}
