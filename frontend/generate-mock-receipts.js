#!/usr/bin/env node

// Mock User Receipt Data Generator
// This script generates comprehensive receipt data for all mock users

console.log('🧾 Acarus Mock Receipt Data Generator')
console.log('=====================================')
console.log('')

// Mock users with their spending patterns
const mockUsers = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    spendingPattern: 'business-focused',
    location: 'New York, NY'
  },
  {
    id: 'user-2',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    spendingPattern: 'typical',
    location: 'San Francisco, CA'
  },
  {
    id: 'user-3',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'user',
    spendingPattern: 'frequent',
    location: 'Chicago, IL'
  },
  {
    id: 'user-4',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user',
    spendingPattern: 'family',
    location: 'Austin, TX'
  },
  {
    id: 'user-5',
    email: 'jane@example.com',
    name: 'Jane Smith',
    role: 'user',
    spendingPattern: 'health-conscious',
    location: 'Seattle, WA'
  },
  {
    id: 'user-6',
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'manager',
    spendingPattern: 'business-travel',
    location: 'Los Angeles, CA'
  },
  {
    id: 'user-7',
    email: 'guest@example.com',
    name: 'Guest User',
    role: 'guest',
    spendingPattern: 'minimal',
    location: 'Miami, FL'
  }
]

// Display user spending patterns
console.log('👥 Mock Users & Their Spending Patterns:')
console.log('=========================================')
console.log('')

mockUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} (${user.email})`)
  console.log(`   Role: ${user.role}`)
  console.log(`   Location: ${user.location}`)
  console.log(`   Pattern: ${user.spendingPattern}`)
  console.log('')
})

console.log('📊 Receipt Generation Examples:')
console.log('==============================')
console.log('')

// Generate sample receipts for each user
mockUsers.slice(0, 3).forEach((user) => {
  console.log(`\n🔍 Sample receipts for ${user.name}:`)
  console.log('-----------------------------------')

  // Generate sample receipts based on pattern
  const sampleReceipts = generateSampleReceipts(user)

  sampleReceipts.forEach((receipt, index) => {
    console.log(`${index + 1}. ${receipt.merchant}`)
    console.log(`   Amount: $${receipt.amount.toFixed(2)}`)
    console.log(`   Date: ${receipt.date.toLocaleDateString()}`)
    console.log(`   Category: ${receipt.category}`)
    console.log(`   Items: ${receipt.items.length}`)
    console.log(`   Payment: ${receipt.paymentMethod}`)
    console.log('')
  })
})

console.log('📈 Usage Examples:')
console.log('==================')
console.log('')

console.log('// Get all receipts for a specific user')
console.log('const userReceipts = getUserReceipts("user-2")')
console.log('')

console.log('// Get receipts by category')
console.log('const foodReceipts = getUserReceiptsByCategory("user-2", "Food & Dining")')
console.log('')

console.log('// Get recent receipts (last 30 days)')
console.log('const recentReceipts = getRecentUserReceipts("user-2", 30)')
console.log('')

console.log('// Generate all user receipts')
console.log('const allReceipts = generateAllUserReceipts()')
console.log('')

console.log('🎯 Spending Pattern Summary:')
console.log('============================')
console.log('')

const patterns = {
  'business-focused': 'Business expenses, professional receipts, corporate spending',
  typical: 'Mix of personal expenses, everyday purchases',
  frequent: 'Lots of small transactions, quick purchases',
  family: 'Family-oriented spending, larger purchases, kid-friendly merchants',
  'health-conscious': 'Health, fitness, organic, premium wellness products',
  'business-travel': 'Travel, entertainment, business meals, corporate expenses',
  minimal: 'Very few receipts, simple purchases'
}

Object.entries(patterns).forEach(([pattern, description]) => {
  console.log(`• ${pattern}: ${description}`)
})

console.log('')
console.log('✨ All mock data is ready for testing!')
console.log('   Use the functions in mock-user-receipts.ts to access the data.')
console.log('')

// Helper function to generate sample receipts
function generateSampleReceipts(user) {
  const receipts = []
  const daysAgo = Math.floor(Math.random() * 30)

  for (let i = 0; i < 3; i++) {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo - i)

    let receipt
    switch (user.spendingPattern) {
      case 'business-focused':
        receipt = generateBusinessSample(user, date)
        break
      case 'typical':
        receipt = generateTypicalSample(user, date)
        break
      case 'frequent':
        receipt = generateFrequentSample(user, date)
        break
      case 'family':
        receipt = generateFamilySample(user, date)
        break
      case 'health-conscious':
        receipt = generateHealthSample(user, date)
        break
      case 'business-travel':
        receipt = generateTravelSample(user, date)
        break
      case 'minimal':
        receipt = generateMinimalSample(user, date)
        break
      default:
        receipt = generateTypicalSample(user, date)
    }

    receipts.push(receipt)
  }

  return receipts
}

function generateBusinessSample(user, date) {
  const merchants = ['WeWork', 'Hilton Hotel', 'Delta Airlines', 'Uber Business']
  const merchant = merchants[Math.floor(Math.random() * merchants.length)]
  const amount = parseFloat((Math.random() * 200 + 25).toFixed(2))

  return {
    merchant,
    amount,
    date,
    category: 'Business',
    items: [{ name: 'Business Item', quantity: 1, price: amount, total: amount }],
    paymentMethod: 'Corporate Credit Card'
  }
}

function generateTypicalSample(user, date) {
  const merchants = ['Starbucks Coffee', 'Target', 'Shell Gas Station', 'CVS Pharmacy']
  const merchant = merchants[Math.floor(Math.random() * merchants.length)]
  const amount = parseFloat((Math.random() * 50 + 5).toFixed(2))

  return {
    merchant,
    amount,
    date,
    category: 'Personal',
    items: [{ name: 'Personal Item', quantity: 1, price: amount, total: amount }],
    paymentMethod: 'Credit Card'
  }
}

function generateFrequentSample(user, date) {
  const merchants = ['Starbucks Coffee', 'CVS Pharmacy', '7-Eleven', 'Uber']
  const merchant = merchants[Math.floor(Math.random() * merchants.length)]
  const amount = parseFloat((Math.random() * 20 + 3).toFixed(2))

  return {
    merchant,
    amount,
    date,
    category: 'Food & Dining',
    items: [{ name: 'Quick Item', quantity: 1, price: amount, total: amount }],
    paymentMethod: 'Mobile Pay'
  }
}

function generateFamilySample(user, date) {
  const merchants = ['Walmart', 'Target', 'Costco', "McDonald's"]
  const merchant = merchants[Math.floor(Math.random() * merchants.length)]
  const amount = parseFloat((Math.random() * 80 + 15).toFixed(2))

  return {
    merchant,
    amount,
    date,
    category: 'Family',
    items: [{ name: 'Family Item', quantity: 1, price: amount, total: amount }],
    paymentMethod: 'Debit Card'
  }
}

function generateHealthSample(user, date) {
  const merchants = ['Whole Foods', 'Equinox Gym', 'CVS Pharmacy', "Trader Joe's"]
  const merchant = merchants[Math.floor(Math.random() * merchants.length)]
  const amount = parseFloat((Math.random() * 60 + 8).toFixed(2))

  return {
    merchant,
    amount,
    date,
    category: 'Health & Wellness',
    items: [{ name: 'Health Item', quantity: 1, price: amount, total: amount }],
    paymentMethod: 'Credit Card'
  }
}

function generateTravelSample(user, date) {
  const merchants = ['Hilton Hotel', 'Delta Airlines', 'Uber', 'Hertz']
  const merchant = merchants[Math.floor(Math.random() * merchants.length)]
  const amount = parseFloat((Math.random() * 300 + 25).toFixed(2))

  return {
    merchant,
    amount,
    date,
    category: 'Business Travel',
    items: [{ name: 'Travel Item', quantity: 1, price: amount, total: amount }],
    paymentMethod: 'Corporate Credit Card'
  }
}

function generateMinimalSample(user, date) {
  const merchants = ['Starbucks Coffee', "McDonald's", 'CVS Pharmacy']
  const merchant = merchants[Math.floor(Math.random() * merchants.length)]
  const amount = parseFloat((Math.random() * 15 + 3).toFixed(2))

  return {
    merchant,
    amount,
    date,
    category: 'Personal',
    items: [{ name: 'Single Item', quantity: 1, price: amount, total: amount }],
    paymentMethod: 'Cash'
  }
}
