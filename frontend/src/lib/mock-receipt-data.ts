// Mock receipt data for testing OCR and validation
export interface MockReceipt {
  id: string
  merchant: string
  amount: number
  date: Date
  category: string
  description: string
  items: ReceiptItem[]
  tax: number
  subtotal: number
  imageUrl?: string
  ocrText: string
  confidence: number
  location?: string
  paymentMethod?: string
}

export interface ReceiptItem {
  name: string
  quantity: number
  price: number
  total: number
}

export interface MockReceiptCategory {
  name: string
  merchants: string[]
  commonItems: string[]
  priceRange: { min: number; max: number }
  taxRate: number
}

// Mock receipt categories with realistic data
export const mockReceiptCategories: MockReceiptCategory[] = [
  {
    name: 'Food & Dining',
    merchants: ['Starbucks Coffee', "McDonald's", 'Subway', 'Pizza Hut', "Domino's", 'Chipotle', 'Panera Bread', "Dunkin' Donuts", 'KFC', 'Taco Bell', 'Burger King', "Wendy's", 'Five Guys', 'Shake Shack', 'In-N-Out', 'Olive Garden', 'Red Lobster', 'Outback Steakhouse', "Applebee's", 'Buffalo Wild Wings', 'Local Cafe', 'Corner Bistro', 'Food Truck'],
    commonItems: ['Coffee', 'Sandwich', 'Burger', 'Pizza', 'Salad', 'Soup', 'Fries', 'Drink', 'Dessert', 'Appetizer', 'Entree', 'Side', 'Combo Meal', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage', 'Pastry'],
    priceRange: { min: 5.0, max: 50.0 },
    taxRate: 0.08
  },
  {
    name: 'Transportation',
    merchants: ['Uber', 'Lyft', 'Taxi Service', 'Metro Transit', 'Bus Company', 'Gas Station', 'Shell', 'Exxon', 'BP', 'Chevron', 'Mobil', 'Parking Garage', 'Airport Parking', 'Toll Road', 'Car Wash', 'Auto Repair', 'Oil Change', 'Tire Service', 'Car Rental'],
    commonItems: ['Gas', 'Ride', 'Parking', 'Toll', 'Car Wash', 'Oil Change', 'Tire Rotation', 'Brake Service', 'Inspection', 'Registration', 'Insurance', 'Maintenance', 'Repair', 'Rental Fee'],
    priceRange: { min: 10.0, max: 200.0 },
    taxRate: 0.06
  },
  {
    name: 'Shopping',
    merchants: ['Amazon', 'Target', 'Walmart', 'Costco', 'Best Buy', 'Home Depot', "Lowe's", "Macy's", 'Nordstrom', 'Gap', 'Nike', 'Adidas', 'Apple Store', 'Microsoft Store', 'GameStop', 'Barnes & Noble', 'CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Dollar General'],
    commonItems: ['Electronics', 'Clothing', 'Books', 'Toys', 'Home Goods', 'Beauty Products', 'Medicine', 'Groceries', 'Office Supplies', 'Sports Equipment', 'Tools', 'Furniture', 'Appliances'],
    priceRange: { min: 15.0, max: 500.0 },
    taxRate: 0.07
  },
  {
    name: 'Entertainment',
    merchants: ['Netflix', 'Spotify', 'Apple Music', 'Amazon Prime', 'Disney+', 'Movie Theater', 'AMC', 'Regal', 'Cinemark', 'IMAX', 'Concert Venue', 'Sports Stadium', 'Museum', 'Zoo', 'Aquarium', 'Theme Park', 'Arcade', 'Bowling Alley', 'Pool Hall', 'Golf Course'],
    commonItems: ['Movie Ticket', 'Concert Ticket', 'Sports Ticket', 'Admission', 'Subscription', 'Rental', 'Game', 'Equipment', 'Food', 'Drink', 'Merchandise', 'Parking', 'Service Fee', 'Processing Fee'],
    priceRange: { min: 8.0, max: 150.0 },
    taxRate: 0.08
  },
  {
    name: 'Healthcare',
    merchants: ['CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Walmart Pharmacy', "Doctor's Office", 'Hospital', 'Urgent Care', 'Dental Office', 'Eye Doctor', 'Physical Therapy', 'Lab Work', 'Medical Center', 'Pharmacy', 'Health Clinic', 'Specialist', 'Emergency Room'],
    commonItems: ['Prescription', 'Medicine', 'Medical Supplies', 'Copay', 'Deductible', 'Lab Test', 'X-Ray', 'Procedure', 'Consultation', 'Examination', 'Treatment', 'Therapy', 'Equipment'],
    priceRange: { min: 20.0, max: 300.0 },
    taxRate: 0.0 // Healthcare often tax-exempt
  },
  {
    name: 'Utilities',
    merchants: ['Electric Company', 'Gas Company', 'Water Department', 'Internet Provider', 'Phone Company', 'Cable Company', 'Trash Service', 'Sewer Service', 'Comcast', 'Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Spectrum', 'Xfinity', 'DirectTV', 'Dish Network', 'Netflix', 'Hulu'],
    commonItems: ['Electric Bill', 'Gas Bill', 'Water Bill', 'Internet Service', 'Phone Service', 'Cable Service', 'Trash Collection', 'Sewer Service', 'Installation', 'Equipment Rental', 'Service Fee', 'Late Fee'],
    priceRange: { min: 25.0, max: 200.0 },
    taxRate: 0.05
  }
]

// Generate realistic OCR text for a receipt
export function generateReceiptOCRText(receipt: MockReceipt): string {
  const lines: string[] = []

  // Header
  lines.push(receipt.merchant.toUpperCase())
  if (receipt.location) {
    lines.push(receipt.location)
  }
  lines.push('')

  // Receipt number and date
  const receiptNumber = Math.floor(Math.random() * 90000) + 10000
  lines.push(`Receipt #${receiptNumber}`)
  lines.push(`Date: ${receipt.date.toLocaleDateString()}`)
  lines.push(`Time: ${receipt.date.toLocaleTimeString()}`)
  lines.push('')

  // Items
  lines.push('Items:')
  receipt.items.forEach((item) => {
    // Truncate long item names and ensure proper spacing
    const truncatedName = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name
    const spaces = Math.max(0, 20 - truncatedName.length)
    const line = `${item.quantity}x ${truncatedName}${' '.repeat(spaces)}$${item.price.toFixed(2)}`
    lines.push(line)
  })
  lines.push('')

  // Totals
  lines.push(`Subtotal:${' '.repeat(15)}$${receipt.subtotal.toFixed(2)}`)
  if (receipt.tax > 0) {
    lines.push(`Tax:${' '.repeat(18)}$${receipt.tax.toFixed(2)}`)
  }
  lines.push(`Total:${' '.repeat(17)}$${receipt.amount.toFixed(2)}`)
  lines.push('')

  // Payment method
  if (receipt.paymentMethod) {
    lines.push(`Payment: ${receipt.paymentMethod}`)
  }
  lines.push('')

  // Footer
  lines.push('Thank you for your business!')
  lines.push('Please keep this receipt for your records')

  return lines.join('\n')
}

// Generate a random mock receipt
export function generateMockReceipt(category?: string): MockReceipt {
  const categories = mockReceiptCategories
  const selectedCategory = category ? categories.find((c) => c.name === category) || categories[0] : categories[Math.floor(Math.random() * categories.length)]

  const merchant = selectedCategory.merchants[Math.floor(Math.random() * selectedCategory.merchants.length)]
  const itemCount = Math.floor(Math.random() * 5) + 1 // 1-5 items

  // Generate items
  const items: ReceiptItem[] = []
  let subtotal = 0

  for (let i = 0; i < itemCount; i++) {
    const itemName = selectedCategory.commonItems[Math.floor(Math.random() * selectedCategory.commonItems.length)]
    const quantity = Math.floor(Math.random() * 3) + 1 // 1-3 quantity
    const price = parseFloat((Math.random() * (selectedCategory.priceRange.max - selectedCategory.priceRange.min) + selectedCategory.priceRange.min).toFixed(2))
    const total = quantity * price

    items.push({
      name: itemName,
      quantity,
      price,
      total
    })

    subtotal += total
  }

  // Calculate tax and total
  const tax = parseFloat((subtotal * selectedCategory.taxRate).toFixed(2))
  const amount = parseFloat((subtotal + tax).toFixed(2))

  // Generate date (within last 30 days)
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))

  // Generate confidence score (80-98% for realistic OCR)
  const confidence = Math.random() * 0.18 + 0.8 // 80-98%

  const receipt: MockReceipt = {
    id: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    merchant,
    amount,
    date,
    category: selectedCategory.name,
    description: `${itemCount} items from ${merchant}`,
    items,
    tax,
    subtotal,
    ocrText: '', // Will be generated
    confidence,
    location: Math.random() > 0.5 ? `${Math.floor(Math.random() * 9999) + 1} Main St, City, ST 12345` : undefined,
    paymentMethod: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay'][Math.floor(Math.random() * 4)]
  }

  // Generate OCR text
  receipt.ocrText = generateReceiptOCRText(receipt)

  return receipt
}

// Generate multiple mock receipts
export function generateMockReceipts(count: number, category?: string): MockReceipt[] {
  const receipts: MockReceipt[] = []

  for (let i = 0; i < count; i++) {
    receipts.push(generateMockReceipt(category))
  }

  return receipts
}

// Pre-generated mock receipts for quick testing
export const mockReceipts: MockReceipt[] = [
  {
    id: 'receipt_001',
    merchant: 'Starbucks Coffee',
    amount: 8.05,
    date: new Date('2024-01-15'),
    category: 'Food & Dining',
    description: 'Morning coffee and pastry',
    items: [
      { name: 'Grande Latte', quantity: 1, price: 4.95, total: 4.95 },
      { name: 'Blueberry Muffin', quantity: 1, price: 2.5, total: 2.5 }
    ],
    tax: 0.6,
    subtotal: 7.45,
    ocrText: `STARBUCKS COFFEE
123 Main Street
New York, NY 10001

Receipt #12345
Date: 1/15/2024
Time: 8:30:15 AM

Items:
1x Grande Latte           $4.95
1x Blueberry Muffin       $2.50

Subtotal:                $7.45
Tax:                     $0.60
Total:                   $8.05

Payment: Credit Card

Thank you for your business!
Please keep this receipt for your records`,
    confidence: 0.92,
    location: '123 Main Street, New York, NY 10001',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'receipt_002',
    merchant: 'Target',
    amount: 45.67,
    date: new Date('2024-01-14'),
    category: 'Shopping',
    description: 'Household items and groceries',
    items: [
      { name: 'Paper Towels', quantity: 2, price: 8.99, total: 17.98 },
      { name: 'Laundry Detergent', quantity: 1, price: 12.99, total: 12.99 },
      { name: 'Bananas', quantity: 1, price: 3.99, total: 3.99 },
      { name: 'Milk', quantity: 1, price: 4.99, total: 4.99 }
    ],
    tax: 3.2,
    subtotal: 42.47,
    ocrText: `TARGET
456 Oak Avenue
Chicago, IL 60601

Receipt #67890
Date: 1/14/2024
Time: 2:15:30 PM

Items:
2x Paper Towels           $8.99
1x Laundry Detergent      $12.99
1x Bananas                $3.99
1x Milk                   $4.99

Subtotal:                $42.47
Tax:                     $3.20
Total:                   $45.67

Payment: Debit Card

Thank you for shopping at Target!`,
    confidence: 0.89,
    location: '456 Oak Avenue, Chicago, IL 60601',
    paymentMethod: 'Debit Card'
  },
  {
    id: 'receipt_003',
    merchant: 'Shell Gas Station',
    amount: 52.3,
    date: new Date('2024-01-13'),
    category: 'Transportation',
    description: 'Gas fill-up',
    items: [
      { name: 'Regular Gas', quantity: 1, price: 45.0, total: 45.0 },
      { name: 'Car Wash', quantity: 1, price: 7.3, total: 7.3 }
    ],
    tax: 0.0,
    subtotal: 52.3,
    ocrText: `SHELL
789 Highway 101
Los Angeles, CA 90210

Receipt #11111
Date: 1/13/2024
Time: 6:45:22 PM

Items:
1x Regular Gas            $45.00
1x Car Wash               $7.30

Subtotal:                $52.30
Tax:                     $0.00
Total:                   $52.30

Payment: Credit Card

Thank you for choosing Shell!`,
    confidence: 0.95,
    location: '789 Highway 101, Los Angeles, CA 90210',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'receipt_004',
    merchant: 'AMC Theaters',
    amount: 28.5,
    date: new Date('2024-01-12'),
    category: 'Entertainment',
    description: 'Movie tickets and snacks',
    items: [
      { name: 'Adult Ticket', quantity: 2, price: 12.0, total: 24.0 },
      { name: 'Popcorn', quantity: 1, price: 4.5, total: 4.5 }
    ],
    tax: 0.0,
    subtotal: 28.5,
    ocrText: `AMC THEATERS
321 Entertainment Blvd
Miami, FL 33101

Receipt #22222
Date: 1/12/2024
Time: 7:30:45 PM

Items:
2x Adult Ticket           $12.00
1x Popcorn                $4.50

Subtotal:                $28.50
Tax:                     $0.00
Total:                   $28.50

Payment: Mobile Pay

Enjoy your movie!`,
    confidence: 0.87,
    location: '321 Entertainment Blvd, Miami, FL 33101',
    paymentMethod: 'Mobile Pay'
  },
  {
    id: 'receipt_005',
    merchant: 'CVS Pharmacy',
    amount: 23.45,
    date: new Date('2024-01-11'),
    category: 'Healthcare',
    description: 'Prescription and over-the-counter medicine',
    items: [
      { name: 'Prescription', quantity: 1, price: 15.0, total: 15.0 },
      { name: 'Pain Reliever', quantity: 1, price: 8.45, total: 8.45 }
    ],
    tax: 0.0,
    subtotal: 23.45,
    ocrText: `CVS PHARMACY
654 Health Street
Boston, MA 02101

Receipt #33333
Date: 1/11/2024
Time: 10:20:15 AM

Items:
1x Prescription           $15.00
1x Pain Reliever          $8.45

Subtotal:                $23.45
Tax:                     $0.00
Total:                   $23.45

Payment: Insurance

Thank you for choosing CVS!`,
    confidence: 0.91,
    location: '654 Health Street, Boston, MA 02101',
    paymentMethod: 'Insurance'
  }
]

// Export utility functions
export const mockReceiptUtils = {
  generateReceipt: generateMockReceipt,
  generateReceipts: generateMockReceipts,
  generateOCRText: generateReceiptOCRText,
  getCategories: () => mockReceiptCategories,
  getReceipts: () => mockReceipts,
  getReceiptById: (id: string) => mockReceipts.find((r) => r.id === id),
  getReceiptsByCategory: (category: string) => mockReceipts.filter((r) => r.category === category),
  getReceiptsByMerchant: (merchant: string) => mockReceipts.filter((r) => r.merchant === merchant)
}
