#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🔍 Testing Production Authentication Configuration...\n');

// Configuration from your environment
const PRODUCTION_URL = 'https://contracts.purlin.pro';
const LATEST_VERCEL_URL = 'https://v0-pdf-template-editor-pg99iry3y-kyles-projects-77613069.vercel.app';

async function testUrl(url, description) {
  return new Promise((resolve) => {
    console.log(`🌐 Testing ${description}: ${url}`);
    
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      resolve({ status: res.statusCode, headers: res.headers });
    });
    
    request.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      resolve({ error: err.message });
    });
    
    request.setTimeout(10000, () => {
      console.log(`   ⏱️  Timeout`);
      request.destroy();
      resolve({ error: 'Timeout' });
    });
  });
}

async function testAuthEndpoints() {
  console.log('🔐 Testing Authentication Endpoints...\n');
  
  const urls = [
    { url: `${PRODUCTION_URL}/api/auth/session`, desc: 'Production Session Endpoint' },
    { url: `${LATEST_VERCEL_URL}/api/auth/session`, desc: 'Vercel Session Endpoint' },
    { url: `${PRODUCTION_URL}/api/auth/providers`, desc: 'Production Providers Endpoint' },
    { url: `${LATEST_VERCEL_URL}/api/auth/providers`, desc: 'Vercel Providers Endpoint' }
  ];
  
  for (const { url, desc } of urls) {
    await testUrl(url, desc);
    console.log('');
  }
}

function analyzeConfiguration() {
  console.log('📊 Configuration Analysis...\n');
  
  console.log('🔍 Issues Found:');
  console.log('1. ⚠️  NEXTAUTH_URL Mismatch:');
  console.log(`   Production env: ${PRODUCTION_URL}`);
  console.log(`   Actual Vercel URL: ${LATEST_VERCEL_URL}`);
  console.log('   → This will cause OAuth redirect failures\n');
  
  console.log('2. 🔧 Required Google OAuth Setup:');
  console.log('   Your Google OAuth app needs these redirect URIs:');
  console.log(`   - ${PRODUCTION_URL}/api/auth/callback/google`);
  console.log(`   - ${LATEST_VERCEL_URL}/api/auth/callback/google`);
  console.log('   (Add both to Google Cloud Console)\n');
  
  console.log('3. 🌐 Custom Domain vs Vercel URLs:');
  console.log('   If using custom domain (contracts.purlin.pro):');
  console.log('   - Ensure DNS is pointing to Vercel');
  console.log('   - Verify SSL certificate is valid');
  console.log('   - Custom domain should be primary in Vercel project\n');
}

function provideSolutions() {
  console.log('💡 Solutions to Fix Production Auth:\n');
  
  console.log('Option 1: Use Custom Domain (Recommended)');
  console.log('1. Configure contracts.purlin.pro in Vercel project settings');
  console.log('2. Update Google OAuth redirect URI to: https://contracts.purlin.pro/api/auth/callback/google');
  console.log('3. Keep NEXTAUTH_URL as: https://contracts.purlin.pro\n');
  
  console.log('Option 2: Use Vercel URLs');
  console.log('1. Update NEXTAUTH_URL to match current Vercel deployment URL');
  console.log('2. Update Google OAuth redirect URI accordingly');
  console.log('3. Note: URL changes with each deployment\n');
  
  console.log('🚨 Immediate Fix Commands:');
  console.log('# Update production NEXTAUTH_URL to match Vercel deployment:');
  console.log(`vercel env add NEXTAUTH_URL production`);
  console.log(`# Enter: ${LATEST_VERCEL_URL}`);
  console.log('');
  console.log('# Or set up custom domain properly in Vercel dashboard');
  console.log('# Then update Google OAuth redirect URI in Google Cloud Console');
}

async function main() {
  await testAuthEndpoints();
  analyzeConfiguration();
  provideSolutions();
  
  console.log('🔄 Next Steps:');
  console.log('1. Choose between custom domain or Vercel URL approach');
  console.log('2. Update NEXTAUTH_URL environment variable accordingly');
  console.log('3. Update Google OAuth redirect URIs in Google Cloud Console');
  console.log('4. Redeploy and test');
}

main().catch(console.error); 