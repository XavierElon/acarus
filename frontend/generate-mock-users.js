#!/usr/bin/env node

// Mock User Generator
// This script generates mock users for testing

const mockUsers = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: 'user-2',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    role: 'user'
  },
  {
    id: 'user-3',
    email: 'demo@example.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'user'
  },
  {
    id: 'user-4',
    email: 'john@example.com',
    password: 'john123',
    name: 'John Doe',
    role: 'user'
  },
  {
    id: 'user-5',
    email: 'jane@example.com',
    password: 'jane123',
    name: 'Jane Smith',
    role: 'user'
  },
  {
    id: 'user-6',
    email: 'manager@example.com',
    password: 'manager123',
    name: 'Manager User',
    role: 'manager'
  },
  {
    id: 'user-7',
    email: 'guest@example.com',
    password: 'guest123',
    name: 'Guest User',
    role: 'guest'
  }
]

console.log('Available Mock Users:')
console.log('===================')
console.log('')

mockUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Password: ${user.password}`)
  console.log(`   Role: ${user.role}`)
  console.log('')
})

console.log('Copy any of these credentials to test login functionality!')
console.log('')
console.log('Quick Login Commands:')
console.log('====================')
console.log('')

// Generate quick login suggestions
const quickUsers = mockUsers.slice(0, 3)
quickUsers.forEach((user) => {
  console.log(`Email: ${user.email}`)
  console.log(`Password: ${user.password}`)
  console.log('---')
})
