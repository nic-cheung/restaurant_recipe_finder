"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeController = exports.RecipeController = void 0;
const recipeService_1 = require("../services/recipeService");
const validation_1 = require("../utils/validation");
class RecipeController {
    async generateRecipe(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const validationResult = (0, validation_1.validateRecipeGeneration)(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    error: 'Invalid request data',
                    details: validationResult.errors
                });
                return;
            }
            const request = req.body;
            const recipe = await recipeService_1.recipeService.generateRecipe(userId, request);
            res.status(200).json({
                success: true,
                recipe,
                message: 'Recipe generated successfully'
            });
        }
        catch (error) {
            console.error('Generate recipe error:', error);
            res.status(500).json({
                error: 'Failed to generate recipe',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async saveRecipe(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const { recipe } = req.body;
            if (!recipe) {
                res.status(400).json({ error: 'Recipe data is required' });
                return;
            }
            const savedRecipe = await recipeService_1.recipeService.saveRecipe(userId, recipe);
            res.status(201).json({
                success: true,
                recipe: savedRecipe,
                message: 'Recipe saved successfully'
            });
        }
        catch (error) {
            console.error('Save recipe error:', error);
            res.status(500).json({
                error: 'Failed to save recipe',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getUserRecipes(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const limit = parseInt(req.query['limit']) || 20;
            const offset = parseInt(req.query['offset']) || 0;
            const recipes = await recipeService_1.recipeService.getUserRecipes(userId, limit, offset);
            res.status(200).json({
                success: true,
                recipes,
                pagination: {
                    limit,
                    offset,
                    total: recipes.length
                }
            });
        }
        catch (error) {
            console.error('Get user recipes error:', error);
            res.status(500).json({
                error: 'Failed to get user recipes',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getRecipe(req, res) {
        try {
            const { recipeId } = req.params;
            if (!recipeId) {
                res.status(400).json({ error: 'Recipe ID is required' });
                return;
            }
            const recipe = await recipeService_1.recipeService.getRecipe(recipeId);
            if (!recipe) {
                res.status(404).json({ error: 'Recipe not found' });
                return;
            }
            res.status(200).json({
                success: true,
                recipe
            });
        }
        catch (error) {
            console.error('Get recipe error:', error);
            res.status(500).json({
                error: 'Failed to get recipe',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async rateRecipe(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const { recipeId } = req.params;
            if (!recipeId) {
                res.status(400).json({ error: 'Recipe ID is required' });
                return;
            }
            const { rating, notes } = req.body;
            const validationResult = (0, validation_1.validateRecipeRating)({ rating, notes });
            if (!validationResult.success) {
                res.status(400).json({
                    error: 'Invalid rating data',
                    details: validationResult.errors
                });
                return;
            }
            await recipeService_1.recipeService.rateRecipe(userId, recipeId, rating, notes);
            res.status(200).json({
                success: true,
                message: 'Recipe rated successfully'
            });
        }
        catch (error) {
            console.error('Rate recipe error:', error);
            res.status(500).json({
                error: 'Failed to rate recipe',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async addToFavorites(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const { recipeId } = req.params;
            if (!recipeId) {
                res.status(400).json({ error: 'Recipe ID is required' });
                return;
            }
            await recipeService_1.recipeService.addToFavorites(userId, recipeId);
            res.status(200).json({
                success: true,
                message: 'Recipe added to favorites'
            });
        }
        catch (error) {
            console.error('Add to favorites error:', error);
            res.status(500).json({
                error: 'Failed to add recipe to favorites',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async removeFromFavorites(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const { recipeId } = req.params;
            if (!recipeId) {
                res.status(400).json({ error: 'Recipe ID is required' });
                return;
            }
            await recipeService_1.recipeService.removeFromFavorites(userId, recipeId);
            res.status(200).json({
                success: true,
                message: 'Recipe removed from favorites'
            });
        }
        catch (error) {
            console.error('Remove from favorites error:', error);
            res.status(500).json({
                error: 'Failed to remove recipe from favorites',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getFavoriteRecipes(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const recipes = await recipeService_1.recipeService.getFavoriteRecipes(userId);
            res.status(200).json({
                success: true,
                recipes
            });
        }
        catch (error) {
            console.error('Get favorite recipes error:', error);
            res.status(500).json({
                error: 'Failed to get favorite recipes',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async generateVariation(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const { recipeId } = req.params;
            if (!recipeId) {
                res.status(400).json({ error: 'Recipe ID is required' });
                return;
            }
            const { variationType } = req.body;
            if (!variationType || !['healthier', 'faster', 'budget', 'different_cuisine'].includes(variationType)) {
                res.status(400).json({
                    error: 'Invalid variation type',
                    message: 'Must be one of: healthier, faster, budget, different_cuisine'
                });
                return;
            }
            const variation = await recipeService_1.recipeService.generateRecipeVariation(userId, recipeId, variationType);
            res.status(200).json({
                success: true,
                recipe: variation,
                message: 'Recipe variation generated successfully'
            });
        }
        catch (error) {
            console.error('Generate variation error:', error);
            res.status(500).json({
                error: 'Failed to generate recipe variation',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async generateAndSaveRecipe(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const validationResult = (0, validation_1.validateRecipeGeneration)(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    error: 'Invalid request data',
                    details: validationResult.errors
                });
                return;
            }
            const request = req.body;
            const generatedRecipe = await recipeService_1.recipeService.generateRecipe(userId, request);
            const savedRecipe = await recipeService_1.recipeService.saveRecipe(userId, generatedRecipe);
            res.status(201).json({
                success: true,
                recipe: savedRecipe,
                message: 'Recipe generated and saved successfully'
            });
        }
        catch (error) {
            console.error('Generate and save recipe error:', error);
            res.status(500).json({
                error: 'Failed to generate and save recipe',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async searchRecipes(_req, res) {
        try {
            res.status(200).json({
                success: true,
                recipes: [],
                message: 'Recipe search functionality coming soon'
            });
        }
        catch (error) {
            console.error('Search recipes error:', error);
            res.status(500).json({
                error: 'Failed to search recipes',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.RecipeController = RecipeController;
exports.recipeController = new RecipeController();
//# sourceMappingURL=recipeController.js.map