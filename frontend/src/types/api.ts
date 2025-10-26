export interface Receipt {
  id: string
  merchant: string
  total: number
  date: string
  category: string
  items?: ReceiptItem[]
  createdAt: string
  updatedAt: string
}

export interface ReceiptItem {
  id: string
  name: string
  price: number
  quantity: number
  category?: string
}

export interface ReceiptsQuery {
  page?: number
  limit?: number
  sortBy?: 'date' | 'total' | 'merchant'
  sortOrder?: 'asc' | 'desc'
  category?: string
  merchant?: string
  startDate?: string
  endDate?: string
}

export interface ReceiptsResponse {
  receipts: Receipt[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DashboardStats {
  totalReceipts: number
  totalSpent: number
  averageReceipt: number
  receiptsThisMonth: number
  topCategories: Array<{
    category: string
    total: number
  }>
  recentReceipts: Receipt[]
}
