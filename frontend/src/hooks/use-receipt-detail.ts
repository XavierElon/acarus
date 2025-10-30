import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

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
    category?: string
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

export function useReceiptDetail(receiptId: string) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!receiptId) return

      try {
        setLoading(true)
        setError(null)

        const backendReceipt = await apiClient.getBackendReceipt(receiptId)
        
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
            category: 'General'
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

    fetchReceipt()
  }, [receiptId])

  return { receipt, loading, error }
}
