const fs = require('fs');
const path = require('path');

console.log('🔍 Validating .env.local file...\n');

try {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('📋 Environment file analysis:');
  console.log(`Total lines: ${lines.length}\n`);
  
  const variables = new Map();
  const duplicates = [];
  const errors = [];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      return;
    }
    
    // Check for valid variable format
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match) {
      if (line.includes('=')) {
        errors.push(`Line ${lineNum}: Invalid variable format: ${line.substring(0, 50)}...`);
      }
      return;
    }
    
    const [, varName, varValue] = match;
    
    // Check for duplicates
    if (variables.has(varName)) {
      duplicates.push({
        name: varName,
        firstLine: variables.get(varName).line,
        secondLine: lineNum,
        firstValue: variables.get(varName).value,
        secondValue: varValue
      });
    }
    
    variables.set(varName, { line: lineNum, value: varValue });
  });
  
  // Report duplicates
  if (duplicates.length > 0) {
    console.log('🔥 DUPLICATE VARIABLES FOUND:');
    duplicates.forEach(dup => {
      console.log(`❌ ${dup.name}:`);
      console.log(`   Line ${dup.firstLine}: ${dup.firstValue}`);
      console.log(`   Line ${dup.secondLine}: ${dup.secondValue}`);
      console.log('');
    });
  }
  
  // Report errors
  if (errors.length > 0) {
    console.log('⚠️  FORMATTING ERRORS:');
    errors.forEach(error => console.log(`   ${error}`));
    console.log('');
  }
  
  // Check required NextAuth variables
  const requiredVars = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  
  console.log('🔐 NextAuth Variables:');
  requiredVars.forEach(varName => {
    if (variables.has(varName)) {
      const value = variables.get(varName).value;
      console.log(`✅ ${varName}: ${varName === 'NEXTAUTH_URL' ? value : '[SET]'}`);
    } else {
      console.log(`❌ ${varName}: MISSING`);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`Total variables: ${variables.size}`);
  console.log(`Duplicates: ${duplicates.length}`);
  console.log(`Errors: ${errors.length}`);
  
  if (duplicates.length > 0 || errors.length > 0) {
    console.log('\n🚨 ACTION REQUIRED:');
    console.log('Please fix the issues above in your .env.local file');
    console.log('This is likely causing your login loop issue!');
  } else {
    console.log('\n✅ Environment file looks good!');
  }
  
} catch (error) {
  console.error('❌ Error reading .env.local file:', error.message);
} 