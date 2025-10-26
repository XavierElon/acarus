export async function GET() {
  // Mock receipts data for now
  const receipts = {
    receipts: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  }

  return Response.json(receipts)
}
