import { useState, useEffect } from 'react'

interface ReceiptData {
  id: string
  merchant: string
  amount: number
  total: number
  date: string
  category: string
  description: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  tax: number
  subtotal: number
  location?: string
  paymentMethod?: string
  confidence: number
  ocrText?: string
  userId?: string
  userEmail?: string
  userName?: string
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

        const response = await fetch(`/api/receipts/${receiptId}`)
        if (!response.ok) {
          throw new Error('Receipt not found')
        }

        const data = await response.json()
        setReceipt(data)
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
