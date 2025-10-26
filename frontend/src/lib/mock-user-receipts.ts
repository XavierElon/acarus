// Mock receipt data associated with specific users
import { MockReceipt, ReceiptItem, generateReceiptOCRText } from './mock-receipt-data'

// Cache for generated receipts to ensure consistent IDs
let receiptCache: UserReceipt[] | null = null

export interface UserReceipt extends MockReceipt {
  userId: string
  userEmail: string
  userName: string
}

// Mock users with their spending patterns
export const mockUsers = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    spendingPattern: 'business-focused', // Business expenses, professional receipts
    location: 'New York, NY'
  },
  {
    id: 'user-2',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    spendingPattern: 'typical', // Mix of personal expenses
    location: 'San Francisco, CA'
  },
  {
    id: 'user-3',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'user',
    spendingPattern: 'frequent', // Lots of small transactions
    location: 'Chicago, IL'
  },
  {
    id: 'user-4',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user',
    spendingPattern: 'family', // Family-oriented spending
    location: 'Austin, TX'
  },
  {
    id: 'user-5',
    email: 'jane@example.com',
    name: 'Jane Smith',
    role: 'user',
    spendingPattern: 'health-conscious', // Health, fitness, organic
    location: 'Seattle, WA'
  },
  {
    id: 'user-6',
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'manager',
    spendingPattern: 'business-travel', // Travel, entertainment, business meals
    location: 'Los Angeles, CA'
  },
  {
    id: 'user-7',
    email: 'guest@example.com',
    name: 'Guest User',
    role: 'guest',
    spendingPattern: 'minimal', // Very few receipts
    location: 'Miami, FL'
  }
]

// Generate receipts based on user spending patterns
export function generateUserReceipts(userId: string, count: number = 10): UserReceipt[] {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user) return []

  const receipts: UserReceipt[] = []
  const baseDate = new Date()

  for (let i = 0; i < count; i++) {
    const receipt = generateReceiptForUser(user, i)
    receipts.push(receipt)
  }

  return receipts.sort((a, b) => b.date.getTime() - a.date.getTime()) // Most recent first
}

// Simple seeded random number generator for consistent IDs
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateReceiptForUser(user: any, index: number): UserReceipt {
  const seed = user.id.charCodeAt(0) + index * 1000
  const daysAgo = Math.floor(seededRandom(seed) * 90) + index // Spread over 90 days
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)

  let receipt: UserReceipt

  switch (user.spendingPattern) {
    case 'business-focused':
      receipt = generateBusinessReceipt(user, date, seed)
      break
    case 'typical':
      receipt = generateTypicalReceipt(user, date)
      break
    case 'frequent':
      receipt = generateFrequentReceipt(user, date)
      break
    case 'family':
      receipt = generateFamilyReceipt(user, date)
      break
    case 'health-conscious':
      receipt = generateHealthConsciousReceipt(user, date)
      break
    case 'business-travel':
      receipt = generateBusinessTravelReceipt(user, date)
      break
    case 'minimal':
      receipt = generateMinimalReceipt(user, date)
      break
    default:
      receipt = generateTypicalReceipt(user, date)
  }

  // Generate OCR text
  receipt.ocrText = generateReceiptOCRText(receipt)

  return receipt
}

// Business-focused receipts (Admin User)
function generateBusinessReceipt(user: any, date: Date, seed: number): UserReceipt {
  const businessMerchants = ['WeWork', 'Regus', 'Office Depot', 'Staples', 'FedEx', 'UPS Store', 'Hilton Hotel', 'Marriott', 'Delta Airlines', 'United Airlines', 'Uber Business', 'Lyft Business', 'Expensify', 'QuickBooks']

  const businessItems = ['Office Supplies', 'Business Lunch', 'Conference Room', 'Printing Services', 'Shipping', 'Software License', 'Professional Development', 'Client Meeting', 'Travel Expense', 'Business Dinner', 'Parking', 'Internet Service']

  const merchant = businessMerchants[Math.floor(seededRandom(seed + 1) * businessMerchants.length)]
  const itemCount = Math.floor(seededRandom(seed + 2) * 3) + 1
  const items: ReceiptItem[] = []
  let subtotal = 0

  for (let i = 0; i < itemCount; i++) {
    const itemName = businessItems[Math.floor(seededRandom(seed + 3 + i) * businessItems.length)]
    const quantity = Math.floor(seededRandom(seed + 4 + i) * 2) + 1
    const price = parseFloat((seededRandom(seed + 5 + i) * 200 + 25).toFixed(2)) // $25-$225
    const total = quantity * price

    items.push({ name: itemName, quantity, price, total })
    subtotal += total
  }

  const tax = parseFloat((subtotal * 0.08).toFixed(2))
  const amount = parseFloat((subtotal + tax).toFixed(2))

  // Generate deterministic ID based on user and seed
  const idSuffix = Math.floor(seededRandom(seed + 100) * 100000).toString(36)
  const timestamp = Math.floor(seededRandom(seed + 200) * 1000000000) + 1600000000000 // Base timestamp

  return {
    id: `receipt_${user.id}_${timestamp}_${idSuffix}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    merchant,
    amount,
    date,
    category: 'Business',
    description: `Business expense at ${merchant}`,
    items,
    tax,
    subtotal,
    ocrText: '',
    confidence: seededRandom(seed + 300) * 0.15 + 0.85, // 85-100%
    location: `${Math.floor(seededRandom(seed + 400) * 9999) + 1} Business Ave, ${user.location}`,
    paymentMethod: ['Corporate Credit Card', 'Business Account'][Math.floor(seededRandom(seed + 500) * 2)]
  }
}

// Typical receipts (Test User)
function generateTypicalReceipt(user: any, date: Date): UserReceipt {
  const merchants = ['Starbucks Coffee', "McDonald's", 'Subway', 'Target', 'Walmart', 'Shell Gas Station', 'CVS Pharmacy', 'Netflix', 'Amazon', 'Uber']

  const categories = ['Food & Dining', 'Shopping', 'Transportation', 'Entertainment', 'Healthcare']
  const category = categories[Math.floor(Math.random() * categories.length)]

  const merchant = merchants[Math.floor(Math.random() * merchants.length)]
  const itemCount = Math.floor(Math.random() * 4) + 1
  const items: ReceiptItem[] = []
  let subtotal = 0

  for (let i = 0; i < itemCount; i++) {
    const itemName = `Item ${i + 1}`
    const quantity = Math.floor(Math.random() * 3) + 1
    const price = parseFloat((Math.random() * 50 + 5).toFixed(2)) // $5-$55
    const total = quantity * price

    items.push({ name: itemName, quantity, price, total })
    subtotal += total
  }

  const tax = parseFloat((subtotal * 0.08).toFixed(2))
  const amount = parseFloat((subtotal + tax).toFixed(2))

  return {
    id: `receipt_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    merchant,
    amount,
    date,
    category,
    description: `${itemCount} items from ${merchant}`,
    items,
    tax,
    subtotal,
    ocrText: '',
    confidence: Math.random() * 0.15 + 0.85,
    location: `${Math.floor(Math.random() * 9999) + 1} Main St, ${user.location}`,
    paymentMethod: ['Credit Card', 'Debit Card', 'Cash', 'Mobile Pay'][Math.floor(Math.random() * 4)]
  }
}

// Frequent receipts (Demo User)
function generateFrequentReceipt(user: any, date: Date): UserReceipt {
  const frequentMerchants = ['Starbucks Coffee', "Dunkin' Donuts", "McDonald's", 'Subway', 'CVS Pharmacy', '7-Eleven', 'Shell Gas Station', 'Uber', 'Lyft']

  const merchant = frequentMerchants[Math.floor(Math.random() * frequentMerchants.length)]
  const itemCount = Math.floor(Math.random() * 2) + 1 // 1-2 items (smaller transactions)
  const items: ReceiptItem[] = []
  let subtotal = 0

  for (let i = 0; i < itemCount; i++) {
    const itemName = `Quick Item ${i + 1}`
    const quantity = 1
    const price = parseFloat((Math.random() * 20 + 3).toFixed(2)) // $3-$23 (smaller amounts)
    const total = quantity * price

    items.push({ name: itemName, quantity, price, total })
    subtotal += total
  }

  const tax = parseFloat((subtotal * 0.08).toFixed(2))
  const amount = parseFloat((subtotal + tax).toFixed(2))

  return {
    id: `receipt_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    merchant,
    amount,
    date,
    category: 'Food & Dining',
    description: `Quick purchase at ${merchant}`,
    items,
    tax,
    subtotal,
    ocrText: '',
    confidence: Math.random() * 0.15 + 0.85,
    location: `${Math.floor(Math.random() * 9999) + 1} Quick St, ${user.location}`,
    paymentMethod: ['Mobile Pay', 'Credit Card', 'Cash'][Math.floor(Math.random() * 3)]
  }
}

// Family receipts (John Doe)
function generateFamilyReceipt(user: any, date: Date): UserReceipt {
  const familyMerchants = ['Walmart', 'Target', 'Costco', 'Kroger', 'Safeway', 'Whole Foods', "McDonald's", 'Pizza Hut', "Domino's", 'Chuck E. Cheese', 'AMC Theaters', 'Disney Store', 'Toys R Us', 'PetSmart', 'Home Depot']

  const familyItems = ['Groceries', 'Kids Meal', 'Family Pack', 'Household Items', 'Pet Food', 'School Supplies', 'Family Movie', 'Pizza', 'Ice Cream', 'Snacks', 'Cleaning Supplies', 'Toilet Paper', 'Diapers', 'Baby Food']

  const merchant = familyMerchants[Math.floor(Math.random() * familyMerchants.length)]
  const itemCount = Math.floor(Math.random() * 6) + 2 // 2-7 items (larger family purchases)
  const items: ReceiptItem[] = []
  let subtotal = 0

  for (let i = 0; i < itemCount; i++) {
    const itemName = familyItems[Math.floor(Math.random() * familyItems.length)]
    const quantity = Math.floor(Math.random() * 4) + 1
    const price = parseFloat((Math.random() * 40 + 5).toFixed(2)) // $5-$45
    const total = quantity * price

    items.push({ name: itemName, quantity, price, total })
    subtotal += total
  }

  const tax = parseFloat((subtotal * 0.08).toFixed(2))
  const amount = parseFloat((subtotal + tax).toFixed(2))

  return {
    id: `receipt_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    merchant,
    amount,
    date,
    category: 'Family',
    description: `Family purchase at ${merchant}`,
    items,
    tax,
    subtotal,
    ocrText: '',
    confidence: Math.random() * 0.15 + 0.85,
    location: `${Math.floor(Math.random() * 9999) + 1} Family Ave, ${user.location}`,
    paymentMethod: ['Debit Card', 'Credit Card', 'Cash'][Math.floor(Math.random() * 3)]
  }
}

// Health-conscious receipts (Jane Smith)
function generateHealthConsciousReceipt(user: any, date: Date): UserReceipt {
  const healthMerchants = ['Whole Foods', "Trader Joe's", 'Sprouts', 'Natural Grocers', 'Equinox Gym', 'Orange Theory', 'SoulCycle', 'Pure Barre', 'CVS Pharmacy', 'Walgreens', 'GNC', 'Vitamin Shoppe', 'Local Organic Cafe', 'Juice Bar', 'Smoothie King']

  const healthItems = ['Organic Produce', 'Protein Powder', 'Vitamins', 'Supplements', 'Gym Membership', 'Personal Training', 'Yoga Class', 'Spin Class', 'Green Smoothie', 'Acai Bowl', 'Kombucha', 'Coconut Water', 'Organic Snacks', 'Plant-based Protein', 'Essential Oils']

  const merchant = healthMerchants[Math.floor(Math.random() * healthMerchants.length)]
  const itemCount = Math.floor(Math.random() * 4) + 1
  const items: ReceiptItem[] = []
  let subtotal = 0

  for (let i = 0; i < itemCount; i++) {
    const itemName = healthItems[Math.floor(Math.random() * healthItems.length)]
    const quantity = Math.floor(Math.random() * 3) + 1
    const price = parseFloat((Math.random() * 60 + 8).toFixed(2)) // $8-$68 (premium pricing)
    const total = quantity * price

    items.push({ name: itemName, quantity, price, total })
    subtotal += total
  }

  const tax = parseFloat((subtotal * 0.08).toFixed(2))
  const amount = parseFloat((subtotal + tax).toFixed(2))

  return {
    id: `receipt_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    merchant,
    amount,
    date,
    category: 'Health & Wellness',
    description: `Health & wellness purchase at ${merchant}`,
    items,
    tax,
    subtotal,
    ocrText: '',
    confidence: Math.random() * 0.15 + 0.85,
    location: `${Math.floor(Math.random() * 9999) + 1} Wellness Blvd, ${user.location}`,
    paymentMethod: ['Credit Card', 'Mobile Pay', 'Cash'][Math.floor(Math.random() * 3)]
  }
}

// Business travel receipts (Manager User)
function generateBusinessTravelReceipt(user: any, date: Date): UserReceipt {
  const travelMerchants = ['Hilton Hotel', 'Marriott', 'Hyatt', 'Delta Airlines', 'United Airlines', 'American Airlines', 'Uber', 'Lyft', 'Hertz', 'Enterprise', 'Avis', 'Expedia', 'Booking.com', 'Airbnb Business', 'WeWork', 'Regus']

  const travelItems = ['Hotel Room', 'Flight Ticket', 'Rental Car', 'Business Meal', 'Airport Parking', 'Baggage Fee', 'Room Service', 'WiFi Access', 'Conference Room', 'Business Center', 'Gym Access', 'Laundry Service', 'Taxi Ride', 'Ride Share', 'Meal Allowance', 'Entertainment']

  const merchant = travelMerchants[Math.floor(Math.random() * travelMerchants.length)]
  const itemCount = Math.floor(Math.random() * 3) + 1
  const items: ReceiptItem[] = []
  let subtotal = 0

  for (let i = 0; i < itemCount; i++) {
    const itemName = travelItems[Math.floor(Math.random() * travelItems.length)]
    const quantity = Math.floor(Math.random() * 2) + 1
    const price = parseFloat((Math.random() * 300 + 25).toFixed(2)) // $25-$325 (higher travel costs)
    const total = quantity * price

    items.push({ name: itemName, quantity, price, total })
    subtotal += total
  }

  const tax = parseFloat((subtotal * 0.08).toFixed(2))
  const amount = parseFloat((subtotal + tax).toFixed(2))

  return {
    id: `receipt_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    merchant,
    amount,
    date,
    category: 'Business Travel',
    description: `Business travel expense at ${merchant}`,
    items,
    tax,
    subtotal,
    ocrText: '',
    confidence: Math.random() * 0.15 + 0.85,
    location: `${Math.floor(Math.random() * 9999) + 1} Travel Plaza, ${user.location}`,
    paymentMethod: ['Corporate Credit Card', 'Business Account'][Math.floor(Math.random() * 2)]
  }
}

// Minimal receipts (Guest User)
function generateMinimalReceipt(user: any, date: Date): UserReceipt {
  const minimalMerchants = ['Starbucks Coffee', "McDonald's", 'CVS Pharmacy']

  const merchant = minimalMerchants[Math.floor(Math.random() * minimalMerchants.length)]
  const items: ReceiptItem[] = []

  // Single item purchase
  const itemName = 'Single Item'
  const quantity = 1
  const price = parseFloat((Math.random() * 15 + 3).toFixed(2)) // $3-$18
  const total = quantity * price

  items.push({ name: itemName, quantity, price, total })
  const subtotal = total
  const tax = parseFloat((subtotal * 0.08).toFixed(2))
  const amount = parseFloat((subtotal + tax).toFixed(2))

  return {
    id: `receipt_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    merchant,
    amount,
    date,
    category: 'Personal',
    description: `Minimal purchase at ${merchant}`,
    items,
    tax,
    subtotal,
    ocrText: '',
    confidence: Math.random() * 0.15 + 0.85,
    location: `${Math.floor(Math.random() * 9999) + 1} Simple St, ${user.location}`,
    paymentMethod: ['Cash', 'Credit Card'][Math.floor(Math.random() * 2)]
  }
}

// Generate receipts for all users (cached for consistency)
export function generateAllUserReceipts(): UserReceipt[] {
  if (receiptCache) {
    return receiptCache
  }

  const allReceipts: UserReceipt[] = []

  mockUsers.forEach((user) => {
    const receiptCount = user.spendingPattern === 'minimal' ? 3 : user.spendingPattern === 'frequent' ? 25 : 15
    const userReceipts = generateUserReceipts(user.id, receiptCount)
    allReceipts.push(...userReceipts)
  })

  // Cache the results
  receiptCache = allReceipts
  return allReceipts.sort((a, b) => b.date.getTime() - a.date.getTime())
}

// Get receipts for a specific user
export function getUserReceipts(userId: string): UserReceipt[] {
  return generateUserReceipts(userId, 15)
}

// Get receipts by category for a user
export function getUserReceiptsByCategory(userId: string, category: string): UserReceipt[] {
  return getUserReceipts(userId).filter((receipt) => receipt.category === category)
}

// Get recent receipts for a user
export function getRecentUserReceipts(userId: string, days: number = 30): UserReceipt[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return getUserReceipts(userId).filter((receipt) => receipt.date >= cutoffDate)
}

// Export all mock data
export const mockUserReceiptData = {
  users: mockUsers,
  generateUserReceipts,
  generateAllUserReceipts,
  getUserReceipts,
  getUserReceiptsByCategory,
  getRecentUserReceipts
}
