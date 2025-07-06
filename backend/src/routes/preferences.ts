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