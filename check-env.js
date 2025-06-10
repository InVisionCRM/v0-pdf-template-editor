#!/usr/bin/env node

console.log('🔍 Checking NextAuth Environment Configuration...\n')

// Check required environment variables
const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
]

const missingVars = []
const foundVars = []

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    foundVars.push(varName)
    console.log(`✅ ${varName}: ${varName === 'NEXTAUTH_URL' ? process.env[varName] : '[SET]'}`)
  } else {
    missingVars.push(varName)
    console.log(`❌ ${varName}: MISSING`)
  }
})

console.log('\n📊 Summary:')
console.log(`✅ Found: ${foundVars.length}/${requiredVars.length}`)
console.log(`❌ Missing: ${missingVars.length}/${requiredVars.length}`)

if (missingVars.length > 0) {
  console.log('\n🚨 Missing environment variables:')
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`)
  })
  console.log('\nPlease add these to your .env.local file')
}

// Check for URL configuration issues
if (process.env.NEXTAUTH_URL) {
  const url = process.env.NEXTAUTH_URL
  console.log('\n🌐 URL Configuration:')
  
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    console.log('✅ Using local development URL')
  } else {
    console.log('⚠️  Using production URL - make sure this is correct')
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.log('❌ URL must start with http:// or https://')
  }
}

console.log('\n🔧 If you\'re still experiencing login loops:')
console.log('1. Make sure you have only ONE NEXTAUTH_URL in .env.local')
console.log('2. Clear your browser cookies for localhost:3000')
console.log('3. Restart your development server')
console.log('4. Check the browser console for error messages') 