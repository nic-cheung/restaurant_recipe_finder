const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Generate random test credentials
function generateTestCredentials() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  
  return {
    email: `test.${timestamp}.${randomNum}@test.local`,
    password: 'TestPass123!',
    name: `Test User ${timestamp.toString().slice(-4)}`
  };
}

// Check if email exists in database
async function emailExists(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return !!user;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

// Generate unique test credentials
async function generateUniqueCredentials(count = 5) {
  const credentials = [];
  
  for (let i = 0; i < count; i++) {
    let testCreds;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      testCreds = generateTestCredentials();
      attempts++;
      
      if (attempts > maxAttempts) {
        console.error(`Failed to generate unique email after ${maxAttempts} attempts`);
        break;
      }
    } while (await emailExists(testCreds.email));
    
    if (attempts <= maxAttempts) {
      credentials.push(testCreds);
      console.log(`✅ Generated unique credentials: ${testCreds.email}`);
    }
  }
  
  return credentials;
}

// Update TEST_CREDENTIALS.md file
async function updateTestCredentialsFile(credentials) {
  const credentialsPath = path.join(__dirname, '..', 'TEST_CREDENTIALS.md');
  
  try {
    // Read current file
    let content = await fs.readFile(credentialsPath, 'utf8');
    
    // Find the signup flow section and replace it
    const signupSectionStart = content.indexOf('### Quick Test Emails - Registration Flow');
    const signupSectionEnd = content.indexOf('### Even Simpler Test Emails');
    
    if (signupSectionStart === -1 || signupSectionEnd === -1) {
      console.error('Could not find signup section in TEST_CREDENTIALS.md');
      return false;
    }
    
    // Generate new signup section content
    let newSignupSection = '### Quick Test Emails - Registration Flow\n';
    credentials.forEach((cred, index) => {
      newSignupSection += `- **Email**: \`${cred.email}\`\n`;
      newSignupSection += `- **Password**: \`${cred.password}\`\n`;
      newSignupSection += `- **Name**: \`${cred.name}\`\n\n`;
    });
    
    // Replace the section
    const newContent = content.substring(0, signupSectionStart) + 
                      newSignupSection + 
                      content.substring(signupSectionEnd);
    
    // Write back to file
    await fs.writeFile(credentialsPath, newContent, 'utf8');
    console.log('✅ Updated TEST_CREDENTIALS.md with new credentials');
    
    return true;
  } catch (error) {
    console.error('Error updating TEST_CREDENTIALS.md:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('🔍 Checking existing test credentials...');
    
    // Generate 5 new unique test credentials
    const newCredentials = await generateUniqueCredentials(5);
    
    if (newCredentials.length === 0) {
      console.log('❌ No new credentials generated');
      return;
    }
    
    console.log(`\n📝 Generated ${newCredentials.length} new test credentials:`);
    newCredentials.forEach((cred, index) => {
      console.log(`${index + 1}. ${cred.email} | ${cred.name}`);
    });
    
    // Update the TEST_CREDENTIALS.md file
    const updateSuccess = await updateTestCredentialsFile(newCredentials);
    
    if (updateSuccess) {
      console.log('\n🎉 Successfully updated test credentials!');
      console.log('📄 Check TEST_CREDENTIALS.md for the new credentials');
    } else {
      console.log('\n❌ Failed to update TEST_CREDENTIALS.md');
      console.log('📋 Here are the new credentials to manually add:');
      newCredentials.forEach((cred, index) => {
        console.log(`\n${index + 1}. Email: ${cred.email}`);
        console.log(`   Password: ${cred.password}`);
        console.log(`   Name: ${cred.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in main function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateUniqueCredentials, updateTestCredentialsFile }; 