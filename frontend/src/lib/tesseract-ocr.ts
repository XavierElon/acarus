import Tesseract from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
  extractedData: {
    merchant?: string
    amount?: number
    date?: Date
    items?: string[]
    total?: number
    tax?: number
    subtotal?: number
  }
  processingTime: number
}

export interface OCRProgress {
  status: string
  progress: number
  message?: string
}

export class TesseractOCRService {
  private worker: Tesseract.Worker | null = null

  /**
   * Initialize Tesseract worker
   */
  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          // Optional: Log progress for debugging
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      })
    }
  }

  /**
   * Extract text from image using Tesseract.js
   */
  async extractTextFromImage(imageFile: File | string, onProgress?: (progress: OCRProgress) => void): Promise<OCRResult> {
    const startTime = Date.now()

    try {
      await this.initialize()

      if (!this.worker) {
        throw new Error('Tesseract worker not initialized')
      }

      // Convert File to image data if needed
      const imageData = typeof imageFile === 'string' ? imageFile : await this.fileToDataURL(imageFile)

      // Perform OCR
      const { data } = await this.worker.recognize(imageData)

      const processingTime = Date.now() - startTime

      // Extract structured data from OCR text
      const extractedData = this.extractReceiptData(data.text)

      return {
        text: data.text,
        confidence: data.confidence / 100, // Convert to 0-1 scale
        extractedData,
        processingTime
      }
    } catch (error) {
      console.error('OCR extraction error:', error)
      throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Convert File to data URL for Tesseract
   */
  private async fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Extract structured receipt data from OCR text
   */
  private extractReceiptData(ocrText: string): OCRResult['extractedData'] {
    const data: OCRResult['extractedData'] = {}
    const lines = ocrText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    // Extract merchant name (usually first meaningful line)
    data.merchant = this.extractMerchantName(lines)

    // Extract amounts
    const amounts = this.extractAmounts(ocrText)
    data.total = amounts.total
    data.subtotal = amounts.subtotal
    data.tax = amounts.tax
    data.amount = amounts.total || amounts.subtotal

    // Extract date
    data.date = this.extractDate(ocrText)

    // Extract items
    data.items = this.extractItems(lines)

    return data
  }

  /**
   * Extract merchant name from OCR text
   */
  private extractMerchantName(lines: string[]): string | undefined {
    // Common patterns for merchant names
    const merchantPatterns = [
      /^[A-Z][A-Z\s&]+$/i, // All caps or title case
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/, // Title case words
      /^[A-Z\s]+COFFEE$/i,
      /^[A-Z\s]+STORE$/i,
      /^[A-Z\s]+MARKET$/i,
      /^[A-Z\s]+RESTAURANT$/i
    ]

    // Skip common receipt headers
    const skipPatterns = [/receipt/i, /invoice/i, /thank you/i, /date/i, /time/i, /total/i, /subtotal/i, /tax/i, /cash/i, /change/i]

    for (const line of lines.slice(0, 5)) {
      // Check first 5 lines
      if (skipPatterns.some((pattern) => pattern.test(line))) continue

      for (const pattern of merchantPatterns) {
        if (pattern.test(line) && line.length > 3) {
          return line.trim()
        }
      }
    }

    // Fallback: return first non-empty line that looks like a business name
    for (const line of lines.slice(0, 3)) {
      if (line.length > 3 && !/^\d/.test(line) && !skipPatterns.some((pattern) => pattern.test(line))) {
        return line.trim()
      }
    }

    return undefined
  }

  /**
   * Extract monetary amounts from OCR text
   */
  private extractAmounts(text: string): { total?: number; subtotal?: number; tax?: number } {
    const amounts: { total?: number; subtotal?: number; tax?: number } = {}

    // Currency patterns
    const currencyPatterns = [/\$(\d+\.?\d*)/g, /(\d+\.?\d*)\s*\$?/g, /total[:\s]*\$?(\d+\.?\d*)/gi, /subtotal[:\s]*\$?(\d+\.?\d*)/gi, /tax[:\s]*\$?(\d+\.?\d*)/gi]

    const foundAmounts: number[] = []

    for (const pattern of currencyPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const amount = parseFloat(match[1])
        if (amount > 0 && amount < 10000) {
          // Reasonable receipt amounts
          foundAmounts.push(amount)
        }
      }
    }

    // Sort amounts to identify total, subtotal, tax
    const sortedAmounts = [...new Set(foundAmounts)].sort((a, b) => b - a)

    if (sortedAmounts.length > 0) {
      amounts.total = sortedAmounts[0] // Largest amount is usually total

      if (sortedAmounts.length > 1) {
        amounts.subtotal = sortedAmounts[1]
      }

      if (sortedAmounts.length > 2) {
        amounts.tax = sortedAmounts[2]
      }
    }

    return amounts
  }

  /**
   * Extract date from OCR text
   */
  private extractDate(text: string): Date | undefined {
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g, // MM/DD/YYYY or DD/MM/YYYY
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g, // YYYY/MM/DD
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{2,4})/gi, // DD Month YYYY
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{2,4})/gi // Month DD, YYYY
    ]

    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

    for (const pattern of datePatterns) {
      const match = pattern.exec(text)
      if (match) {
        try {
          let year, month, day

          if (pattern.source.includes('jan|feb')) {
            // Month name pattern
            const monthIndex = monthNames.indexOf(match[1].toLowerCase())
            if (monthIndex !== -1) {
              month = monthIndex + 1
              day = parseInt(match[2])
              year = parseInt(match[3])
              if (year < 100) year += 2000 // Convert 2-digit years
            }
          } else {
            // Numeric pattern
            const parts = match.slice(1, 4).map((p) => parseInt(p))

            if (pattern.source.includes('\\d{4}')) {
              // YYYY/MM/DD format
              ;[year, month, day] = parts
            } else {
              // MM/DD/YYYY or DD/MM/YYYY format
              if (parts[0] > 12) {
                // DD/MM/YYYY
                ;[day, month, year] = parts
              } else {
                // MM/DD/YYYY
                ;[month, day, year] = parts
              }
            }
          }

          if (year && month && day) {
            const parsedDate: Date = new Date(year, month - 1, day)
            if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() === year) {
              return parsedDate
            }
          }
        } catch (error) {
          console.warn('Date parsing error:', error)
        }
      }
    }

    return undefined
  }

  /**
   * Extract individual items from receipt
   */
  private extractItems(lines: string[]): string[] {
    const items: string[] = []
    const itemPatterns = [
      /^[A-Za-z\s]+.*\$\d+\.?\d*$/i, // Item name followed by price
      /^\d+\s+[A-Za-z\s]+.*\$\d+\.?\d*$/i, // Quantity + item name + price
      /^[A-Za-z\s]+.*\d+\.?\d*$/i // Item name followed by number
    ]

    for (const line of lines) {
      // Skip totals, taxes, and other summary lines
      if (/total|subtotal|tax|cash|change|thank/i.test(line)) continue

      for (const pattern of itemPatterns) {
        if (pattern.test(line) && line.length > 3) {
          items.push(line.trim())
          break
        }
      }
    }

    return items.slice(0, 10) // Limit to first 10 items
  }

  /**
   * Clean up worker resources
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }

  /**
   * Get available languages
   */
  async getAvailableLanguages(): Promise<string[]> {
    await this.initialize()
    if (!this.worker) return ['eng']

    try {
      const { data } = await (this.worker as any).getLanguages()
      return data.languages.map((lang: any) => lang.code)
    } catch (error) {
      console.warn('Could not get languages:', error)
      return ['eng']
    }
  }
}

// Export singleton instance
export const tesseractOCR = new TesseractOCRService()
