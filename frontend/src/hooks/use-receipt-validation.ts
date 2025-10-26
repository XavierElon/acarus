import { useState } from 'react'
import { ValidationResult, ReceiptData } from '@/lib/receipt-validator'

export function useReceiptValidation() {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateReceipt = async (receiptData: ReceiptData): Promise<ValidationResult | null> => {
    setIsValidating(true)
    setError(null)
    setValidationResult(null)

    try {
      const formData = new FormData()
      formData.append('merchant', receiptData.merchant)
      formData.append('amount', receiptData.amount.toString())
      formData.append('date', receiptData.date.toISOString().split('T')[0])
      formData.append('category', receiptData.category)
      formData.append('description', receiptData.description || '')
      formData.append('image', receiptData.image as File)

      const response = await fetch('/api/receipts/validate', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setValidationResult(result.validation)
        return result.validation
      } else {
        throw new Error(result.error || 'Validation failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Receipt validation error:', err)
      return null
    } finally {
      setIsValidating(false)
    }
  }

  const clearValidation = () => {
    setValidationResult(null)
    setError(null)
  }

  return {
    isValidating,
    validationResult,
    error,
    validateReceipt,
    clearValidation
  }
}
