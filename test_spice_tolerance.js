const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testSpiceTolerance() {
  try {
    console.log('🌶️ Testing Spice Tolerance Feature...\n');

    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: `spicetest${Date.now()}@example.com`,
      password: 'TestPassword123',
      name: 'Spice Test User',
      spiceTolerance: 'HOT'  // Test with HOT tolerance
    });

    if (!registerResponse.data.success) {
      throw new Error('Registration failed');
    }

    const token = registerResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ User registered successfully with HOT spice tolerance');

    // Step 2: Get preferences options to verify spice tolerance is included
    console.log('\n2. Getting preferences options...');
    const optionsResponse = await axios.get(`${BASE_URL}/api/preferences/options`, { headers });
    
    if (!optionsResponse.data.success) {
      throw new Error('Failed to get preferences options');
    }

    const spiceToleranceOptions = optionsResponse.data.data.spiceTolerance;
    console.log('✅ Spice tolerance options available:', spiceToleranceOptions);

    if (!spiceToleranceOptions || spiceToleranceOptions.length === 0) {
      throw new Error('Spice tolerance options not found in API response');
    }

    // Step 3: Get user preferences to verify spice tolerance is included
    console.log('\n3. Getting user preferences...');
    const preferencesResponse = await axios.get(`${BASE_URL}/api/preferences`, { headers });
    
    if (!preferencesResponse.data.success) {
      throw new Error('Failed to get user preferences');
    }

    const preferences = preferencesResponse.data.data.preferences;
    console.log('✅ User preferences retrieved');
    console.log('   Current spice tolerance:', preferences.spiceTolerance);

    if (preferences.spiceTolerance !== 'HOT') {
      throw new Error(`Expected spice tolerance to be 'HOT', but got '${preferences.spiceTolerance}'`);
    }

    // Step 4: Update preferences including spice tolerance
    console.log('\n4. Updating preferences with new spice tolerance...');
    const updateResponse = await axios.put(`${BASE_URL}/api/preferences`, {
      dietaryRestrictions: ['Vegetarian'],
      allergies: ['Nuts'],
      spiceTolerance: 'EXTREME'  // Change to EXTREME
    }, { headers });

    if (!updateResponse.data.success) {
      throw new Error('Failed to update preferences');
    }

    console.log('✅ Preferences updated successfully');

    // Step 5: Verify the spice tolerance was updated
    console.log('\n5. Verifying spice tolerance update...');
    const updatedPreferencesResponse = await axios.get(`${BASE_URL}/api/preferences`, { headers });
    
    if (!updatedPreferencesResponse.data.success) {
      throw new Error('Failed to get updated preferences');
    }

    const updatedPreferences = updatedPreferencesResponse.data.data.preferences;
    console.log('✅ Updated preferences retrieved');
    console.log('   New spice tolerance:', updatedPreferences.spiceTolerance);

    if (updatedPreferences.spiceTolerance !== 'EXTREME') {
      throw new Error(`Expected spice tolerance to be 'EXTREME', but got '${updatedPreferences.spiceTolerance}'`);
    }

    // Step 6: Test preferences summary
    console.log('\n6. Testing preferences summary...');
    const summaryResponse = await axios.get(`${BASE_URL}/api/preferences/summary`, { headers });
    
    if (!summaryResponse.data.success) {
      throw new Error('Failed to get preferences summary');
    }

    console.log('✅ Preferences summary retrieved successfully');

    console.log('\n🎉 All spice tolerance tests passed!');
    console.log('\n📊 Test Results:');
    console.log('   ✅ User registration with spice tolerance: PASSED');
    console.log('   ✅ Spice tolerance options in API: PASSED');
    console.log('   ✅ Spice tolerance in user preferences: PASSED');
    console.log('   ✅ Spice tolerance update functionality: PASSED');
    console.log('   ✅ Preferences summary integration: PASSED');
    
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    return false;
  }
}

// Run the test
testSpiceTolerance().then(success => {
  process.exit(success ? 0 : 1);
}); 