#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:8000';
const TEST_USER = {
  email: `test${Date.now()}@example.com`,
  password: 'Password123',
  name: 'Test User'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// HTTP request helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, body: parsedBody, headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test helper functions
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    console.log(`✅ ${message}`);
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    console.log(`❌ ${message}`);
  }
}

function assertEquals(actual, expected, message) {
  const condition = JSON.stringify(actual) === JSON.stringify(expected);
  assert(condition, `${message} - Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
}

function assertContains(array, item, message) {
  const condition = Array.isArray(array) && array.includes(item);
  assert(condition, `${message} - Array should contain: ${item}`);
}

// Test data - comprehensive preference values
const COMPREHENSIVE_PREFERENCES = {
  // Basic preferences (already tested)
  dietaryRestrictions: ['Vegetarian', 'Gluten-Free'],
  allergies: ['Nuts', 'Dairy'],
  favoriteIngredients: ['Tomatoes', 'Basil', 'Garlic'],
  dislikedFoods: ['Liver', 'Anchovies'],
  favoriteCuisines: ['Italian', 'Thai', 'Mexican'],
  favoriteDishes: ['Pasta Carbonara', 'Pad Thai', 'Tacos'],
  
  // New comprehensive preferences
  favoriteChefs: ['Thomas Keller', 'Julia Child', 'Anthony Bourdain'],
  favoriteRestaurants: ['The French Laundry', 'Eleven Madison Park', 'Le Bernardin'],
  nutritionalGoals: ['WEIGHT_LOSS', 'MUSCLE_GAIN'],
  budgetPreference: 'MODERATE',
  preferredMealTypes: ['BREAKFAST', 'DINNER', 'SNACKS'],
  availableEquipment: ['OVEN', 'STOVETOP', 'AIR_FRYER'],
  mealComplexity: 'MODERATE',
  spiceTolerance: 'MEDIUM'
};

// Authentication
let authToken = null;

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // Test registration
    const registerResponse = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, TEST_USER);
    
    assert(
      registerResponse.statusCode === 201 || registerResponse.statusCode === 409,
      'Registration should succeed or user should already exist'
    );
    
    // Test login
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: TEST_USER.email, password: TEST_USER.password });
    
    assert(loginResponse.statusCode === 200, 'Login should succeed');
    assert(loginResponse.body.data && loginResponse.body.data.token, 'Login should return a token');
    
    authToken = loginResponse.body.data.token;
    
    // Test token validation
    const meResponse = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    assert(meResponse.statusCode === 200, 'Token validation should succeed');
    assert(meResponse.body.data && meResponse.body.data.user && meResponse.body.data.user.email === TEST_USER.email, 'Token should return correct user');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Authentication error: ${error.message}`);
    console.log(`❌ Authentication failed: ${error.message}`);
  }
}

async function testPreferencesOptions() {
  console.log('\n📋 Testing Preferences Options Endpoint...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/preferences/options',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    assert(response.statusCode === 200, 'Options endpoint should return 200');
    
    const options = response.body.data || response.body;
    
    // Test all expected option categories
    const expectedCategories = [
      'dietaryRestrictions', 'allergies', 'ingredients', 'dishes',
      'cuisines', 'chefs', 'restaurants', 'nutritionalGoals', 'budgetPreferences',
      'mealTypes', 'cookingEquipment', 'mealComplexity', 'spiceTolerance'
    ];
    
    expectedCategories.forEach(category => {
      assert(options[category], `Options should include ${category}`);
      assert(Array.isArray(options[category]), `${category} should be an array`);
      assert(options[category].length > 0, `${category} should have options`);
    });
    
    // Test specific enum values
    assertContains(options.nutritionalGoals, 'WEIGHT_LOSS', 'Nutritional goals should include WEIGHT_LOSS');
    assertContains(options.budgetPreferences, 'BUDGET', 'Budget preferences should include BUDGET');
    assertContains(options.mealTypes, 'BREAKFAST', 'Meal types should include BREAKFAST');
    assertContains(options.cookingEquipment, 'OVEN', 'Cooking equipment should include OVEN');
    assertContains(options.mealComplexity, 'SIMPLE', 'Meal complexity should include SIMPLE');
    assertContains(options.spiceTolerance, 'MILD', 'Spice tolerance should include MILD');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Options test error: ${error.message}`);
    console.log(`❌ Options test failed: ${error.message}`);
  }
}

async function testPreferencesCreation() {
  console.log('\n➕ Testing Preferences Creation...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/preferences',
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }, COMPREHENSIVE_PREFERENCES);
    
    assert(response.statusCode === 200, 'Preferences creation should succeed');
    
    // Handle nested response format
    const savedPrefs = response.body.data?.preferences || response.body;
    assert(savedPrefs.id !== undefined, 'Response should include preference ID');
    
    // Verify all fields are saved correctly
    
    // Test array fields
    assertEquals(savedPrefs.dietaryRestrictions, COMPREHENSIVE_PREFERENCES.dietaryRestrictions, 'Dietary restrictions should match');
    assertEquals(savedPrefs.allergies, COMPREHENSIVE_PREFERENCES.allergies, 'Allergies should match');
    assertEquals(savedPrefs.favoriteIngredients, COMPREHENSIVE_PREFERENCES.favoriteIngredients, 'Favorite ingredients should match');
    assertEquals(savedPrefs.dislikedFoods, COMPREHENSIVE_PREFERENCES.dislikedFoods, 'Disliked foods should match');
    assertEquals(savedPrefs.favoriteCuisines, COMPREHENSIVE_PREFERENCES.favoriteCuisines, 'Favorite cuisines should match');
    assertEquals(savedPrefs.favoriteDishes, COMPREHENSIVE_PREFERENCES.favoriteDishes, 'Favorite dishes should match');
    assertEquals(savedPrefs.favoriteChefs, COMPREHENSIVE_PREFERENCES.favoriteChefs, 'Favorite chefs should match');
    assertEquals(savedPrefs.favoriteRestaurants, COMPREHENSIVE_PREFERENCES.favoriteRestaurants, 'Favorite restaurants should match');
    assertEquals(savedPrefs.nutritionalGoals, COMPREHENSIVE_PREFERENCES.nutritionalGoals, 'Nutritional goals should match');
    assertEquals(savedPrefs.budgetPreference, COMPREHENSIVE_PREFERENCES.budgetPreference, 'Budget preference should match');
    assertEquals(savedPrefs.preferredMealTypes, COMPREHENSIVE_PREFERENCES.preferredMealTypes, 'Preferred meal types should match');
    assertEquals(savedPrefs.availableEquipment, COMPREHENSIVE_PREFERENCES.availableEquipment, 'Available equipment should match');
    assertEquals(savedPrefs.mealComplexity, COMPREHENSIVE_PREFERENCES.mealComplexity, 'Meal complexity should match');
    
    // Test enum field
    assertEquals(savedPrefs.spiceTolerance, COMPREHENSIVE_PREFERENCES.spiceTolerance, 'Spice tolerance should match');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Preferences creation error: ${error.message}`);
    console.log(`❌ Preferences creation failed: ${error.message}`);
  }
}

async function testPreferencesRetrieval() {
  console.log('\n📖 Testing Preferences Retrieval...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/preferences',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    assert(response.statusCode === 200, 'Preferences retrieval should succeed');
    
    // Handle nested response format
    const prefs = response.body.data?.preferences || response.body;
    
    // Verify all fields are retrieved correctly
    assertEquals(prefs.dietaryRestrictions, COMPREHENSIVE_PREFERENCES.dietaryRestrictions, 'Retrieved dietary restrictions should match');
    assertEquals(prefs.allergies, COMPREHENSIVE_PREFERENCES.allergies, 'Retrieved allergies should match');
    assertEquals(prefs.favoriteIngredients, COMPREHENSIVE_PREFERENCES.favoriteIngredients, 'Retrieved favorite ingredients should match');
    assertEquals(prefs.dislikedFoods, COMPREHENSIVE_PREFERENCES.dislikedFoods, 'Retrieved disliked foods should match');
    assertEquals(prefs.favoriteCuisines, COMPREHENSIVE_PREFERENCES.favoriteCuisines, 'Retrieved favorite cuisines should match');
    assertEquals(prefs.favoriteDishes, COMPREHENSIVE_PREFERENCES.favoriteDishes, 'Retrieved favorite dishes should match');
    assertEquals(prefs.favoriteChefs, COMPREHENSIVE_PREFERENCES.favoriteChefs, 'Retrieved favorite chefs should match');
    assertEquals(prefs.favoriteRestaurants, COMPREHENSIVE_PREFERENCES.favoriteRestaurants, 'Retrieved favorite restaurants should match');
    assertEquals(prefs.nutritionalGoals, COMPREHENSIVE_PREFERENCES.nutritionalGoals, 'Retrieved nutritional goals should match');
    assertEquals(prefs.budgetPreference, COMPREHENSIVE_PREFERENCES.budgetPreference, 'Retrieved budget preference should match');
    assertEquals(prefs.preferredMealTypes, COMPREHENSIVE_PREFERENCES.preferredMealTypes, 'Retrieved preferred meal types should match');
    assertEquals(prefs.availableEquipment, COMPREHENSIVE_PREFERENCES.availableEquipment, 'Retrieved available equipment should match');
    assertEquals(prefs.mealComplexity, COMPREHENSIVE_PREFERENCES.mealComplexity, 'Retrieved meal complexity should match');
    assertEquals(prefs.spiceTolerance, COMPREHENSIVE_PREFERENCES.spiceTolerance, 'Retrieved spice tolerance should match');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Preferences retrieval error: ${error.message}`);
    console.log(`❌ Preferences retrieval failed: ${error.message}`);
  }
}

async function testPreferencesUpdate() {
  console.log('\n🔄 Testing Preferences Update...');
  
  try {
    // Update preferences with new values
    const updatedPrefs = {
      ...COMPREHENSIVE_PREFERENCES,
      dietaryRestrictions: ['Vegan', 'Keto'],
      spiceTolerance: 'HOT',
      nutritionalGoals: ['MUSCLE_GAIN', 'HIGH_PROTEIN'],
      favoriteChefs: ['Gordon Ramsay', 'Jamie Oliver', 'Emeril Lagasse'],
      budgetPreference: 'BUDGET',
      mealComplexity: 'COMPLEX'
    };
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/preferences',
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }, updatedPrefs);
    
    assert(response.statusCode === 200, 'Preferences update should succeed');
    
    // Verify updates were applied
    const savedPrefs = response.body.data?.preferences || response.body;
    assertEquals(savedPrefs.dietaryRestrictions, updatedPrefs.dietaryRestrictions, 'Updated dietary restrictions should match');
    assertEquals(savedPrefs.spiceTolerance, updatedPrefs.spiceTolerance, 'Updated spice tolerance should match');
    assertEquals(savedPrefs.nutritionalGoals, updatedPrefs.nutritionalGoals, 'Updated nutritional goals should match');
    assertEquals(savedPrefs.favoriteChefs, updatedPrefs.favoriteChefs, 'Updated favorite chefs should match');
    
    // Verify other fields remained unchanged
    assertEquals(savedPrefs.allergies, COMPREHENSIVE_PREFERENCES.allergies, 'Unchanged allergies should remain the same');
    assertEquals(savedPrefs.favoriteIngredients, COMPREHENSIVE_PREFERENCES.favoriteIngredients, 'Unchanged favorite ingredients should remain the same');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Preferences update error: ${error.message}`);
    console.log(`❌ Preferences update failed: ${error.message}`);
  }
}

async function testSuggestionEndpoints() {
  console.log('\n🔍 Testing Suggestion Endpoints...');
  
  try {
    const suggestionTests = [
      { path: '/api/preferences/suggestions/chefs', query: 'gordon', name: 'Chef suggestions' },
      { path: '/api/preferences/suggestions/restaurants', query: 'french', name: 'Restaurant suggestions' },
      { path: '/api/preferences/suggestions/ingredients', query: 'tomato', name: 'Ingredient suggestions' },
      { path: '/api/preferences/suggestions/cuisines', query: 'italian', name: 'Cuisine suggestions' },
      { path: '/api/preferences/suggestions/dishes', query: 'pasta', name: 'Dish suggestions' }
    ];
    
    for (const test of suggestionTests) {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: `${test.path}?query=${test.query}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      assert(response.statusCode === 200, `${test.name} should return 200`);
      const suggestions = response.body.data?.suggestions || response.body;
      assert(Array.isArray(suggestions), `${test.name} should return an array`);
      assert(suggestions.length > 0, `${test.name} should return suggestions`);
    }
    
    // Test placeholder endpoints (should return 404)
    const placeholderTests = [
      '/api/preferences/suggestions/nutritional-goals',
      '/api/preferences/suggestions/equipment',
      '/api/preferences/suggestions/meal-types'
    ];
    
    for (const path of placeholderTests) {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 8000,
        path: `${path}?query=test`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      assert(response.statusCode === 404, `${path} should return 404 (placeholder endpoint)`);
    }
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Suggestion endpoints error: ${error.message}`);
    console.log(`❌ Suggestion endpoints test failed: ${error.message}`);
  }
}

async function testPreferencesSummary() {
  console.log('\n📊 Testing Preferences Summary...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/preferences/summary',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    assert(response.statusCode === 200, 'Preferences summary should return 200');
    
    const summary = response.body.data?.summary || response.body;
    assert(summary !== undefined, 'Summary should be present');
    assert(summary.restrictions !== undefined, 'Summary should include restrictions');
    assert(summary.favorites !== undefined, 'Summary should include favorites');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Preferences summary error: ${error.message}`);
    console.log(`❌ Preferences summary test failed: ${error.message}`);
  }
}

async function testValidationErrors() {
  console.log('\n🚫 Testing Validation Errors...');
  
  try {
    // Test invalid spice tolerance
    const invalidPrefs = {
      ...COMPREHENSIVE_PREFERENCES,
      spiceTolerance: 'INVALID_TOLERANCE'
    };
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/preferences',
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }, invalidPrefs);
    
    assert(response.statusCode === 400, 'Invalid spice tolerance should return 400');
    
    // Test invalid nutritional goals
    const invalidNutritionPrefs = {
      ...COMPREHENSIVE_PREFERENCES,
      nutritionalGoals: ['INVALID_GOAL']
    };
    
    const response2 = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/preferences',
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }, invalidNutritionPrefs);
    
    assert(response2.statusCode === 400, 'Invalid nutritional goals should return 400');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Validation test error: ${error.message}`);
    console.log(`❌ Validation test failed: ${error.message}`);
  }
}

async function testAuthenticationErrors() {
  console.log('\n🔒 Testing Authentication Errors...');
  
  try {
    // Test without token
    const response1 = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/preferences',
      method: 'GET'
    });
    
    assert(response1.statusCode === 401, 'Request without token should return 401');
    
    // Test with invalid token
    const response2 = await makeRequest({
      hostname: 'localhost',
      port: 8000,
      path: '/api/preferences',
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid_token' }
    });
    
    assert(response2.statusCode === 401, 'Request with invalid token should return 401');
    
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`Authentication error test error: ${error.message}`);
    console.log(`❌ Authentication error test failed: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Preferences Test Suite...');
  console.log('=' .repeat(60));
  
  await testAuthentication();
  
  if (authToken) {
    await testPreferencesOptions();
    await testPreferencesCreation();
    await testPreferencesRetrieval();
    await testPreferencesUpdate();
    await testSuggestionEndpoints();
    await testPreferencesSummary();
    await testValidationErrors();
    await testAuthenticationErrors();
  } else {
    console.log('❌ Skipping preference tests due to authentication failure');
  }
  
  // Print final results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 FAILED TESTS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  
  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run the tests
runAllTests().catch(console.error); 