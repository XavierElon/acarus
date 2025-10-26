import { NextRequest, NextResponse } from 'next/server'
import { receiptValidator, ReceiptData } from '@/lib/receipt-validator'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract receipt data from form
    const receiptData: ReceiptData = {
      merchant: formData.get('merchant') as string,
      amount: parseFloat(formData.get('amount') as string),
      date: new Date(formData.get('date') as string),
      category: formData.get('category') as string,
      image: formData.get('image') as File,
      description: formData.get('description') as string
    }

    // Validate the receipt
    const validationResult = await receiptValidator.validateReceipt(receiptData)

    return NextResponse.json({
      success: true,
      validation: validationResult
    })
  } catch (error) {
    console.error('Receipt validation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate receipt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for validation status
export async function GET() {
  return NextResponse.json({
    message: 'Receipt validation service is running',
    version: '1.0.0',
    features: ['OCR validation', 'Duplicate detection', 'Pattern matching']
  })
}
