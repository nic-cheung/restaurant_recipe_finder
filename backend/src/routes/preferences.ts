import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getPreferences,
  updatePreferences,
  patchPreferences,
  deletePreferences,
  getPreferencesSummary,
  getPreferencesOptions,
  getChefSuggestions,
  getRestaurantSuggestions,
  getIngredientSuggestions,
  getCuisineSuggestions,
  getDishSuggestions,
  getApiUsageStats,
  getEnhancedChefSuggestions,
  getEnhancedIngredientSuggestions,
  getEnhancedDishSuggestions,
} from '../controllers/preferencesController';

const router = Router();

// @route   GET /api/preferences
// @desc    Get user preferences
// @access  Private
router.get('/', authenticateToken, getPreferences);

// @route   PUT /api/preferences
// @desc    Update user preferences (full update/create)
// @access  Private
router.put('/', authenticateToken, updatePreferences);

// @route   PATCH /api/preferences
// @desc    Partially update user preferences
// @access  Private
router.patch('/', authenticateToken, patchPreferences);

// @route   DELETE /api/preferences
// @desc    Delete user preferences
// @access  Private
router.delete('/', authenticateToken, deletePreferences);

// @route   GET /api/preferences/summary
// @desc    Get preferences summary for recipe generation
// @access  Private
router.get('/summary', authenticateToken, getPreferencesSummary);

// @route   GET /api/preferences/options
// @desc    Get common options for preferences
// @access  Private
router.get('/options', authenticateToken, getPreferencesOptions);

// @route   GET /api/preferences/suggestions/chefs
// @desc    Get chef suggestions based on query
// @access  Private
router.get('/suggestions/chefs', authenticateToken, getChefSuggestions);

// @route   GET /api/preferences/suggestions/restaurants
// @desc    Get restaurant suggestions based on query
// @access  Private
router.get('/suggestions/restaurants', authenticateToken, getRestaurantSuggestions);

// @route   GET /api/preferences/suggestions/ingredients
// @desc    Get ingredient suggestions based on query
// @access  Private
router.get('/suggestions/ingredients', authenticateToken, getIngredientSuggestions);

// @route   GET /api/preferences/suggestions/cuisines
// @desc    Get cuisine suggestions based on query
// @access  Private
router.get('/suggestions/cuisines', authenticateToken, getCuisineSuggestions);

// @route   GET /api/preferences/suggestions/dishes
// @desc    Get dish suggestions based on query
// @access  Private
router.get('/suggestions/dishes', authenticateToken, getDishSuggestions);

// Public endpoints for registration (no auth required)
// @route   GET /api/preferences/public/options
// @desc    Get common options for preferences (public access for registration)
// @access  Public
router.get('/public/options', getPreferencesOptions);

// @route   GET /api/preferences/public/suggestions/chefs
// @desc    Get chef suggestions for registration (public access)
// @access  Public
router.get('/public/suggestions/chefs', getChefSuggestions);

// @route   GET /api/preferences/public/suggestions/restaurants
// @desc    Get restaurant suggestions for registration (public access)
// @access  Public
router.get('/public/suggestions/restaurants', getRestaurantSuggestions);

// @route   GET /api/preferences/public/suggestions/ingredients
// @desc    Get ingredient suggestions for registration (public access)
// @access  Public
router.get('/public/suggestions/ingredients', getIngredientSuggestions);

// @route   GET /api/preferences/public/suggestions/cuisines
// @desc    Get cuisine suggestions for registration (public access)
// @access  Public
router.get('/public/suggestions/cuisines', getCuisineSuggestions);

// @route   GET /api/preferences/public/suggestions/dishes
// @desc    Get dish suggestions for registration (public access)
// @access  Public
router.get('/public/suggestions/dishes', getDishSuggestions);

// Enhanced search endpoints (private)
// @route   GET /api/preferences/enhanced/chefs
// @desc    Enhanced chef search using Wikidata API
// @access  Private
router.get('/enhanced/chefs', authenticateToken, getEnhancedChefSuggestions);

// @route   GET /api/preferences/enhanced/ingredients
// @desc    Enhanced ingredient search using Wikidata API
// @access  Private
router.get('/enhanced/ingredients', authenticateToken, getEnhancedIngredientSuggestions);

// @route   GET /api/preferences/enhanced/dishes
// @desc    Enhanced dish search using Wikidata API
// @access  Private
router.get('/enhanced/dishes', authenticateToken, getEnhancedDishSuggestions);

// Enhanced search endpoints (public for registration)
// @route   GET /api/preferences/public/enhanced/chefs
// @desc    Enhanced chef search for registration (public access)
// @access  Public
router.get('/public/enhanced/chefs', getEnhancedChefSuggestions);

// @route   GET /api/preferences/public/enhanced/ingredients
// @desc    Enhanced ingredient search for registration (public access)
// @access  Public
router.get('/public/enhanced/ingredients', getEnhancedIngredientSuggestions);

// @route   GET /api/preferences/public/enhanced/dishes
// @desc    Enhanced dish search for registration (public access)
// @access  Public
router.get('/public/enhanced/dishes', getEnhancedDishSuggestions);

// @route   GET /api/preferences/api-usage
// @desc    Get API usage statistics for monitoring free tier limits
// @access  Private
router.get('/api-usage', authenticateToken, getApiUsageStats);

// @route   GET /api/preferences/suggestions/nutritional-goals
// @desc    Get nutritional goals suggestions (placeholder - returns static options)
// @access  Private
router.get('/suggestions/nutritional-goals', authenticateToken, (_req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Nutritional goals suggestions not implemented - use /api/preferences/options instead' 
  });
});

// @route   GET /api/preferences/suggestions/equipment
// @desc    Get equipment suggestions (placeholder - returns static options)
// @access  Private
router.get('/suggestions/equipment', authenticateToken, (_req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Equipment suggestions not implemented - use /api/preferences/options instead' 
  });
});

// @route   GET /api/preferences/suggestions/meal-types
// @desc    Get meal types suggestions (placeholder - returns static options)
// @access  Private
router.get('/suggestions/meal-types', authenticateToken, (_req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Meal types suggestions not implemented - use /api/preferences/options instead' 
  });
});

export default router; 