import { Router } from 'express';
import { recipeController } from '../controllers/recipeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All recipe routes require authentication
router.use(authenticateToken);

// @route   POST /api/recipes/generate
// @desc    Generate AI recipe based on user preferences and inspiration
// @access  Private
router.post('/generate', recipeController.generateRecipe);

// @route   POST /api/recipes/save
// @desc    Save a generated recipe to the database
// @access  Private
router.post('/save', recipeController.saveRecipe);

// @route   POST /api/recipes/generate-and-save
// @desc    Generate and save recipe in one step
// @access  Private
router.post('/generate-and-save', recipeController.generateAndSaveRecipe);

// @route   GET /api/recipes/my-recipes
// @desc    Get user's saved recipes with pagination
// @access  Private
router.get('/my-recipes', recipeController.getUserRecipes);

// @route   GET /api/recipes/favorites
// @desc    Get user's favorite recipes
// @access  Private
router.get('/favorites', recipeController.getFavoriteRecipes);

// @route   GET /api/recipes/search
// @desc    Search recipes (placeholder for future implementation)
// @access  Private
router.get('/search', recipeController.searchRecipes);

// @route   GET /api/recipes/:recipeId
// @desc    Get a specific recipe by ID
// @access  Private
router.get('/:recipeId', recipeController.getRecipe);

// @route   POST /api/recipes/:recipeId/rate
// @desc    Rate a recipe
// @access  Private
router.post('/:recipeId/rate', recipeController.rateRecipe);

// @route   POST /api/recipes/:recipeId/favorite
// @desc    Add recipe to favorites
// @access  Private
router.post('/:recipeId/favorite', recipeController.addToFavorites);

// @route   DELETE /api/recipes/:recipeId/favorite
// @desc    Remove recipe from favorites
// @access  Private
router.delete('/:recipeId/favorite', recipeController.removeFromFavorites);

// @route   POST /api/recipes/:recipeId/variation
// @desc    Generate recipe variation
// @access  Private
router.post('/:recipeId/variation', recipeController.generateVariation);

export default router; 