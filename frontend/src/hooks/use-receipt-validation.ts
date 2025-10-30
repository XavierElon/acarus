import { useState } from 'react'
import { ValidationResult, ReceiptData, receiptValidator } from '@/lib/receipt-validator'

export function useReceiptValidation() {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateReceipt = async (receiptData: ReceiptData): Promise<ValidationResult | null> => {
    setIsValidating(true)
    setError(null)
    setValidationResult(null)

    try {
      // Call validator directly (client-side validation)
      const result = await receiptValidator.validateReceipt(receiptData)
      setValidationResult(result)
      return result
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
