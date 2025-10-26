import { tesseractOCR, OCRResult } from './tesseract-ocr'
export interface ReceiptData {
  merchant: string
  amount: number
  date: Date
  category: string
  image: File | string
  description?: string
}

export interface ValidationResult {
  isValid: boolean
  confidence: number
  riskScore: number
  flags: ValidationFlag[]
  extractedData?: Partial<ReceiptData>
  recommendations: string[]
}

export interface ValidationFlag {
  type: 'WARNING' | 'ERROR' | 'INFO'
  code: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

export class ReceiptValidator {
  private duplicateHashes = new Set<string>()

  /**
   * Main validation method that runs all checks
   */
  async validateReceipt(receipt: ReceiptData): Promise<ValidationResult> {
    const flags: ValidationFlag[] = []
    let confidence = 1.0
    let riskScore = 0.0

    try {
      // 1. OCR Validation
      const ocrResult = await this.validateOCR(receipt.image)
      flags.push(...ocrResult.flags)
      confidence *= ocrResult.confidence
      riskScore += ocrResult.riskScore

      // 2. Duplicate Detection
      const duplicateResult = await this.checkForDuplicates(receipt.image)
      flags.push(...duplicateResult.flags)
      riskScore += duplicateResult.riskScore

      // 3. Data Consistency Check
      const consistencyResult = this.validateDataConsistency(receipt, ocrResult.extractedData)
      flags.push(...consistencyResult.flags)
      riskScore += consistencyResult.riskScore

      // 4. Basic Pattern Validation
      const patternResult = this.validatePatterns(receipt)
      flags.push(...patternResult.flags)
      riskScore += patternResult.riskScore

      // Calculate final confidence and risk
      const finalConfidence = Math.max(0, Math.min(1, confidence))
      const finalRiskScore = Math.max(0, Math.min(1, riskScore))

      return {
        isValid: finalRiskScore < 0.7 && finalConfidence > 0.3,
        confidence: finalConfidence,
        riskScore: finalRiskScore,
        flags,
        extractedData: ocrResult.extractedData,
        recommendations: this.generateRecommendations(flags, finalRiskScore)
      }
    } catch (error) {
      console.error('Validation error:', error)
      return {
        isValid: false,
        confidence: 0,
        riskScore: 1.0,
        flags: [
          {
            type: 'ERROR',
            code: 'VALIDATION_ERROR',
            message: 'Failed to validate receipt',
            severity: 'high'
          }
        ],
        recommendations: ['Please try uploading the receipt again']
      }
    }
  }

  /**
   * OCR Validation - Extract text and validate receipt patterns using Tesseract.js
   */
  private async validateOCR(image: File | string): Promise<{ confidence: number; riskScore: number; flags: ValidationFlag[]; extractedData: Partial<ReceiptData> }> {
    const flags: ValidationFlag[] = []
    let confidence = 1.0
    let riskScore = 0.0

    try {
      // Use real Tesseract.js OCR
      const ocrResult = await tesseractOCR.extractTextFromImage(image)

      if (!ocrResult.text || ocrResult.text.length < 10) {
        flags.push({
          type: 'ERROR',
          code: 'INSUFFICIENT_TEXT',
          message: 'Could not extract sufficient text from image',
          severity: 'high'
        })
        return { confidence: 0, riskScore: 1.0, flags, extractedData: {} }
      }

      // Use confidence from Tesseract
      confidence = ocrResult.confidence

      // Validate receipt patterns
      const patternValidation = this.validateReceiptPatterns(ocrResult.text)
      flags.push(...patternValidation.flags)
      confidence *= patternValidation.confidence
      riskScore += patternValidation.riskScore

      // Check for common receipt elements
      const elementValidation = this.validateReceiptElements(ocrResult.text)
      flags.push(...elementValidation.flags)
      confidence *= elementValidation.confidence
      riskScore += elementValidation.riskScore

      // Add processing time flag if it took too long
      if (ocrResult.processingTime > 10000) {
        // 10 seconds
        flags.push({
          type: 'WARNING',
          code: 'SLOW_PROCESSING',
          message: `OCR processing took ${Math.round(ocrResult.processingTime / 1000)}s`,
          severity: 'low'
        })
      }

      return {
        confidence: Math.max(0, confidence),
        riskScore: Math.min(1, riskScore),
        flags,
        extractedData: ocrResult.extractedData
      }
    } catch (error) {
      flags.push({
        type: 'ERROR',
        code: 'OCR_FAILED',
        message: `Failed to process image with OCR: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high'
      })
      return { confidence: 0, riskScore: 1.0, flags, extractedData: {} }
    }
  }

  /**
   * Duplicate Detection using image hashing
   */
  private async checkForDuplicates(image: File | string): Promise<{ riskScore: number; flags: ValidationFlag[] }> {
    const flags: ValidationFlag[] = []
    let riskScore = 0.0

    try {
      const imageHash = await this.calculateImageHash(image)

      if (this.duplicateHashes.has(imageHash)) {
        flags.push({
          type: 'ERROR',
          code: 'DUPLICATE_RECEIPT',
          message: 'This receipt has already been uploaded',
          severity: 'high'
        })
        riskScore = 1.0
      } else {
        this.duplicateHashes.add(imageHash)
        flags.push({
          type: 'INFO',
          code: 'UNIQUE_RECEIPT',
          message: 'Receipt appears to be unique',
          severity: 'low'
        })
      }

      return { riskScore, flags }
    } catch (error) {
      flags.push({
        type: 'WARNING',
        code: 'HASH_CALCULATION_FAILED',
        message: 'Could not verify receipt uniqueness',
        severity: 'medium'
      })
      riskScore = 0.3
      return { riskScore, flags }
    }
  }

  /**
   * Validate data consistency between user input and OCR extraction
   */
  private validateDataConsistency(userData: ReceiptData, ocrData: Partial<ReceiptData>): { riskScore: number; flags: ValidationFlag[] } {
    const flags: ValidationFlag[] = []
    let riskScore = 0.0

    // Check merchant consistency
    if (ocrData.merchant && userData.merchant) {
      const similarity = this.calculateStringSimilarity(userData.merchant.toLowerCase(), ocrData.merchant.toLowerCase())
      if (similarity < 0.7) {
        flags.push({
          type: 'WARNING',
          code: 'MERCHANT_MISMATCH',
          message: `Merchant name doesn't match OCR extraction: "${ocrData.merchant}"`,
          severity: 'medium'
        })
        riskScore += 0.2
      }
    }

    // Check amount consistency
    if (ocrData.amount && userData.amount) {
      const amountDiff = Math.abs(userData.amount - ocrData.amount)
      if (amountDiff > 0.01) {
        flags.push({
          type: 'WARNING',
          code: 'AMOUNT_MISMATCH',
          message: `Amount doesn't match OCR extraction: $${ocrData.amount}`,
          severity: 'medium'
        })
        riskScore += 0.3
      }
    }

    // Check date consistency
    if (ocrData.date && userData.date) {
      const dateDiff = Math.abs(userData.date.getTime() - ocrData.date.getTime())
      const daysDiff = dateDiff / (1000 * 60 * 60 * 24)
      if (daysDiff > 1) {
        flags.push({
          type: 'WARNING',
          code: 'DATE_MISMATCH',
          message: `Date doesn't match OCR extraction: ${ocrData.date.toLocaleDateString()}`,
          severity: 'medium'
        })
        riskScore += 0.2
      }
    }

    return { riskScore, flags }
  }

  /**
   * Validate basic patterns in receipt data
   */
  private validatePatterns(receipt: ReceiptData): { riskScore: number; flags: ValidationFlag[] } {
    const flags: ValidationFlag[] = []
    let riskScore = 0.0

    // Check for suspicious amounts
    if (receipt.amount <= 0) {
      flags.push({
        type: 'ERROR',
        code: 'INVALID_AMOUNT',
        message: 'Receipt amount must be greater than zero',
        severity: 'high'
      })
      riskScore += 0.5
    }

    // Check for very large amounts
    if (receipt.amount > 10000) {
      flags.push({
        type: 'WARNING',
        code: 'LARGE_AMOUNT',
        message: 'Receipt amount is unusually large',
        severity: 'medium'
      })
      riskScore += 0.2
    }

    // Check for round amounts (potential fake receipts)
    if (receipt.amount % 1 === 0 && receipt.amount > 10) {
      flags.push({
        type: 'WARNING',
        code: 'ROUND_AMOUNT',
        message: 'Receipt amount is a round number (may indicate fake receipt)',
        severity: 'low'
      })
      riskScore += 0.1
    }

    // Check for future dates
    if (receipt.date > new Date()) {
      flags.push({
        type: 'ERROR',
        code: 'FUTURE_DATE',
        message: 'Receipt date cannot be in the future',
        severity: 'high'
      })
      riskScore += 0.5
    }

    // Check for very old dates
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    if (receipt.date < oneYearAgo) {
      flags.push({
        type: 'WARNING',
        code: 'OLD_DATE',
        message: 'Receipt date is more than one year old',
        severity: 'medium'
      })
      riskScore += 0.2
    }

    return { riskScore, flags }
  }

  /**
   * Validate receipt patterns in OCR text
   */
  private validateReceiptPatterns(ocrText: string): { confidence: number; riskScore: number; flags: ValidationFlag[] } {
    const flags: ValidationFlag[] = []
    let confidence = 1.0
    let riskScore = 0.0

    // Check for common receipt keywords
    const receiptKeywords = ['receipt', 'total', 'subtotal', 'tax', 'thank you', 'date', 'time']
    const foundKeywords = receiptKeywords.filter((keyword) => ocrText.toLowerCase().includes(keyword))

    if (foundKeywords.length < 3) {
      flags.push({
        type: 'WARNING',
        code: 'INSUFFICIENT_RECEIPT_PATTERNS',
        message: 'Text does not contain typical receipt patterns',
        severity: 'medium'
      })
      confidence *= 0.7
      riskScore += 0.3
    }

    // Check for currency symbols
    if (!ocrText.includes('$') && !ocrText.includes('€') && !ocrText.includes('£')) {
      flags.push({
        type: 'WARNING',
        code: 'NO_CURRENCY_SYMBOL',
        message: 'No currency symbol found in receipt',
        severity: 'low'
      })
      confidence *= 0.9
      riskScore += 0.1
    }

    return { confidence, riskScore, flags }
  }

  /**
   * Validate receipt elements
   */
  private validateReceiptElements(ocrText: string): { confidence: number; riskScore: number; flags: ValidationFlag[] } {
    const flags: ValidationFlag[] = []
    let confidence = 1.0
    let riskScore = 0.0

    // Check for merchant name in OCR text
    const lines = ocrText.split('\n').filter((line) => line.trim())
    const hasMerchantName = lines.some((line) => line.length > 3 && !/receipt|invoice|total|subtotal|tax|date|time|thank/i.test(line) && /^[A-Za-z\s]+$/.test(line))

    if (!hasMerchantName) {
      flags.push({
        type: 'WARNING',
        code: 'NO_MERCHANT_NAME',
        message: 'Could not identify merchant name in receipt',
        severity: 'medium'
      })
      confidence *= 0.8
      riskScore += 0.2
    }

    // Check for amount patterns
    const hasAmount = /\$?\d+\.?\d*/.test(ocrText)
    if (!hasAmount) {
      flags.push({
        type: 'ERROR',
        code: 'NO_AMOUNT',
        message: 'Could not identify receipt amount',
        severity: 'high'
      })
      confidence *= 0.5
      riskScore += 0.5
    }

    return { confidence, riskScore, flags }
  }

  /**
   * Calculate image hash for duplicate detection
   */
  private async calculateImageHash(image: File | string): Promise<string> {
    // This is a simplified hash calculation
    // In real implementation, you would use a proper image hashing algorithm
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock hash based on image properties
        const mockHash = `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        resolve(mockHash)
      }, 500)
    })
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator)
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(flags: ValidationFlag[], riskScore: number): string[] {
    const recommendations: string[] = []

    if (riskScore > 0.7) {
      recommendations.push('This receipt has a high risk score. Please verify the information.')
    }

    if (flags.some((f) => f.code === 'DUPLICATE_RECEIPT')) {
      recommendations.push('This receipt appears to be a duplicate. Please check if you have already uploaded it.')
    }

    if (flags.some((f) => f.code === 'INSUFFICIENT_TEXT')) {
      recommendations.push('Please ensure the receipt image is clear and readable.')
    }

    if (flags.some((f) => f.code === 'MERCHANT_MISMATCH')) {
      recommendations.push('Please verify the merchant name matches the receipt.')
    }

    if (flags.some((f) => f.code === 'AMOUNT_MISMATCH')) {
      recommendations.push('Please verify the amount matches the receipt total.')
    }

    if (recommendations.length === 0) {
      recommendations.push('Receipt validation passed successfully!')
    }

    return recommendations
  }
}

// Export singleton instance
export const receiptValidator = new ReceiptValidator()
