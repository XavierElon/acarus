// Demo component showing how to use mock receipt data
import { mockReceipts, mockReceiptUtils, MockReceipt } from '@/lib/mock-receipt-data'

// Example: Generate a random receipt
export function generateRandomReceipt(): MockReceipt {
  return mockReceiptUtils.generateReceipt()
}

// Example: Generate multiple receipts for a specific category
export function generateFoodReceipts(count: number): MockReceipt[] {
  return mockReceiptUtils.generateReceipts(count, 'Food & Dining')
}

// Example: Get all receipts from a specific merchant
export function getStarbucksReceipts(): MockReceipt[] {
  return mockReceiptUtils.getReceiptsByMerchant('Starbucks Coffee')
}

// Example: Get receipts by category
export function getShoppingReceipts(): MockReceipt[] {
  return mockReceiptUtils.getReceiptsByCategory('Shopping')
}

// Example: Use mock receipt data in validation testing
export async function testReceiptValidation() {
  const receipt = mockReceipts[0] // Get first pre-built receipt

  // Convert to validation format
  const validationData = {
    merchant: receipt.merchant,
    amount: receipt.amount,
    date: receipt.date,
    category: receipt.category,
    image: new File([receipt.ocrText], `${receipt.id}.txt`, { type: 'text/plain' })
  }

  // Use with validation service
  // const result = await receiptValidator.validateReceipt(validationData)
  // return result
}

// Example: Create a receipt with custom data
export function createCustomReceipt(): MockReceipt {
  const baseReceipt = mockReceiptUtils.generateReceipt('Food & Dining')

  // Customize the receipt
  return {
    ...baseReceipt,
    merchant: 'Custom Coffee Shop',
    amount: 12.5,
    items: [
      { name: 'Specialty Latte', quantity: 1, price: 5.5, total: 5.5 },
      { name: 'Avocado Toast', quantity: 1, price: 7.0, total: 7.0 }
    ],
    description: 'Custom breakfast order'
  }
}

// Example: Export receipt data for API testing
export function exportReceiptForAPI(receipt: MockReceipt) {
  return {
    id: receipt.id,
    merchant: receipt.merchant,
    amount: receipt.amount,
    date: receipt.date.toISOString(),
    category: receipt.category,
    description: receipt.description,
    items: receipt.items,
    tax: receipt.tax,
    subtotal: receipt.subtotal,
    confidence: receipt.confidence,
    location: receipt.location,
    paymentMethod: receipt.paymentMethod
  }
}

// Example: Batch generate receipts for testing
export function generateTestBatch() {
  const categories = ['Food & Dining', 'Shopping', 'Transportation', 'Entertainment']
  const receipts: MockReceipt[] = []

  categories.forEach((category) => {
    const categoryReceipts = mockReceiptUtils.generateReceipts(3, category)
    receipts.push(...categoryReceipts)
  })

  return receipts
}
