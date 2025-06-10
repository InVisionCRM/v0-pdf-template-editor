#!/usr/bin/env node

const https = require('https');
const { URL } = require('url');

console.log('🔍 Production Authentication Deep Debug...\n');

const PRODUCTION_URL = 'https://contracts.purlin.pro';

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    console.log(`🌐 Testing ${description}:`);
    console.log(`   URL: ${url}`);
    
    const request = https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        
        if (res.statusCode >= 400) {
          console.log(`   Error Body: ${body.substring(0, 200)}...`);
        } else if (res.headers['content-type']?.includes('json')) {
          try {
            const parsed = JSON.parse(body);
            console.log(`   JSON Response: ${JSON.stringify(parsed, null, 2)}`);
          } catch (e) {
            console.log(`   Body (first 200 chars): ${body.substring(0, 200)}...`);
          }
        }
        
        resolve({ status: res.statusCode, body, headers: res.headers });
      });
    });
    
    request.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      resolve({ error: err.message });
    });
    
    request.setTimeout(15000, () => {
      console.log(`   ⏱️  Timeout after 15s`);
      request.destroy();
      resolve({ error: 'Timeout' });
    });
  });
}

async function testAuthFlow() {
  console.log('🔐 Testing Complete Auth Flow...\n');
  
  // Test 1: Basic session endpoint
  await testEndpoint(`${PRODUCTION_URL}/api/auth/session`, 'Session Endpoint');
  console.log('');
  
  // Test 2: Providers endpoint
  await testEndpoint(`${PRODUCTION_URL}/api/auth/providers`, 'Providers Endpoint');
  console.log('');
  
  // Test 3: CSRF token endpoint
  await testEndpoint(`${PRODUCTION_URL}/api/auth/csrf`, 'CSRF Token Endpoint');
  console.log('');
  
  // Test 4: Google signin endpoint (this is where we saw the 400 error)
  await testEndpoint(`${PRODUCTION_URL}/api/auth/signin/google`, 'Google SignIn Endpoint');
  console.log('');
  
  // Test 5: Let's try to manually construct the Google OAuth URL
  const providersResponse = await testEndpoint(`${PRODUCTION_URL}/api/auth/providers`, 'Getting Google OAuth URL');
  console.log('');
}

async function testDatabaseConnection() {
  console.log('🗄️  Testing Database Connectivity...\n');
  
  // Test if we can hit any API endpoints that might use the database
  const endpoints = [
    '/api/leads',
    '/api/contracts',
    '/api/auth/session'
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(`${PRODUCTION_URL}${endpoint}`, `Database endpoint: ${endpoint}`);
    console.log('');
  }
}

function analyzePossibleIssues() {
  console.log('🔍 Possible Issues to Check:\n');
  
  console.log('1. 🔒 Middleware Configuration:');
  console.log('   - Check if middleware is blocking auth endpoints');
  console.log('   - Verify JWT token configuration in production\n');
  
  console.log('2. 🌐 Environment Variables:');
  console.log('   - Verify NEXTAUTH_SECRET is exactly the same');
  console.log('   - Check if Google client credentials are correct');
  console.log('   - Ensure DATABASE_URL is accessible from production\n');
  
  console.log('3. 🔗 HTTPS/SSL Issues:');
  console.log('   - Verify SSL certificate is valid');
  console.log('   - Check if there are any CORS issues\n');
  
  console.log('4. 📦 Build/Deployment Issues:');
  console.log('   - Check if NextAuth is properly bundled');
  console.log('   - Verify all dependencies are installed\n');
  
  console.log('5. 🕒 Session/Cookie Issues:');
  console.log('   - Check if cookies are being set correctly');
  console.log('   - Verify domain settings for cookies\n');
}

async function main() {
  await testAuthFlow();
  await testDatabaseConnection();
  analyzePossibleIssues();
  
  console.log('🔧 Next Debugging Steps:');
  console.log('1. Check Vercel Function logs: `vercel logs`');
  console.log('2. Test locally with production environment variables');
  console.log('3. Check if middleware is interfering with auth endpoints');
  console.log('4. Verify NextAuth version compatibility');
}

main().catch(console.error); 