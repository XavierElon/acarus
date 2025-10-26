#!/usr/bin/env node

// Simple script to create a test user account
// This script creates a test user with email: test@example.com and password: password123

const bcrypt = require('bcryptjs')

async function createTestUser() {
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash('password123', 10)

    console.log('Test user credentials:')
    console.log('Email: test@example.com')
    console.log('Password: password123')
    console.log('')
    console.log('Password hash (for database):')
    console.log(passwordHash)
    console.log('')
    console.log('You can use these credentials to log in to your application.')
    console.log('Make sure to add this user to your database with the hashed password.')
  } catch (error) {
    console.error('Error creating test user:', error)
  }
}

createTestUser()
