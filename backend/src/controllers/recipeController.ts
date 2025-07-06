import { Response } from 'express';
import { recipeService, RecipeGenerationRequest } from '../services/recipeService';
import { validateRecipeGeneration, validateRecipeRating } from '../utils/validation';
import { AuthenticatedRequest } from '../utils/jwt';

export class RecipeController {
  /**
   * Generate a new recipe based on user preferences and inspiration
   */
  async generateRecipe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Validate request
      const validationResult = validateRecipeGeneration(req.body);
      if (!validationResult.success) {
        res.status(400).json({ 
          error: 'Invalid request data', 
          details: validationResult.errors 
        });
        return;
      }

      const request: RecipeGenerationRequest = req.body;
      
      // Generate recipe
      const recipe = await recipeService.generateRecipe(userId, request);
      
      res.status(200).json({
        success: true,
        recipe,
        message: 'Recipe generated successfully'
      });
    } catch (error) {
      console.error('Generate recipe error:', error);
      res.status(500).json({ 
        error: 'Failed to generate recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Save a generated recipe to the database
   */
  async saveRecipe(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Save recipe
      const savedRecipe = await recipeService.saveRecipe(userId, recipe);
      
      res.status(201).json({
        success: true,
        recipe: savedRecipe,
        message: 'Recipe saved successfully'
      });
    } catch (error) {
      console.error('Save recipe error:', error);
      res.status(500).json({ 
        error: 'Failed to save recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user's saved recipes with pagination
   */
  async getUserRecipes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const limit = parseInt(req.query['limit'] as string) || 20;
      const offset = parseInt(req.query['offset'] as string) || 0;

      const recipes = await recipeService.getUserRecipes(userId, limit, offset);
      
      res.status(200).json({
        success: true,
        recipes,
        pagination: {
          limit,
          offset,
          total: recipes.length
        }
      });
    } catch (error) {
      console.error('Get user recipes error:', error);
      res.status(500).json({ 
        error: 'Failed to get user recipes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a specific recipe by ID
   */
  async getRecipe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { recipeId } = req.params;
      
      if (!recipeId) {
        res.status(400).json({ error: 'Recipe ID is required' });
        return;
      }

      const recipe = await recipeService.getRecipe(recipeId);
      
      if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }

      res.status(200).json({
        success: true,
        recipe
      });
    } catch (error) {
      console.error('Get recipe error:', error);
      res.status(500).json({ 
        error: 'Failed to get recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Rate a recipe
   */
  async rateRecipe(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Validate rating
      const validationResult = validateRecipeRating({ rating, notes });
      if (!validationResult.success) {
        res.status(400).json({ 
          error: 'Invalid rating data', 
          details: validationResult.errors 
        });
        return;
      }

      await recipeService.rateRecipe(userId, recipeId, rating, notes);
      
      res.status(200).json({
        success: true,
        message: 'Recipe rated successfully'
      });
    } catch (error) {
      console.error('Rate recipe error:', error);
      res.status(500).json({ 
        error: 'Failed to rate recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add recipe to favorites
   */
  async addToFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      
      await recipeService.addToFavorites(userId, recipeId);
      
      res.status(200).json({
        success: true,
        message: 'Recipe added to favorites'
      });
    } catch (error) {
      console.error('Add to favorites error:', error);
      res.status(500).json({ 
        error: 'Failed to add recipe to favorites',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Remove recipe from favorites
   */
  async removeFromFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      
      await recipeService.removeFromFavorites(userId, recipeId);
      
      res.status(200).json({
        success: true,
        message: 'Recipe removed from favorites'
      });
    } catch (error) {
      console.error('Remove from favorites error:', error);
      res.status(500).json({ 
        error: 'Failed to remove recipe from favorites',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user's favorite recipes
   */
  async getFavoriteRecipes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const recipes = await recipeService.getFavoriteRecipes(userId);
      
      res.status(200).json({
        success: true,
        recipes
      });
    } catch (error) {
      console.error('Get favorite recipes error:', error);
      res.status(500).json({ 
        error: 'Failed to get favorite recipes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate recipe variation
   */
  async generateVariation(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const variation = await recipeService.generateRecipeVariation(userId, recipeId, variationType);
      
      res.status(200).json({
        success: true,
        recipe: variation,
        message: 'Recipe variation generated successfully'
      });
    } catch (error) {
      console.error('Generate variation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate recipe variation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate and save recipe in one step
   */
  async generateAndSaveRecipe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Validate request
      const validationResult = validateRecipeGeneration(req.body);
      if (!validationResult.success) {
        res.status(400).json({ 
          error: 'Invalid request data', 
          details: validationResult.errors 
        });
        return;
      }

      const request: RecipeGenerationRequest = req.body;
      
      // Generate recipe
      const generatedRecipe = await recipeService.generateRecipe(userId, request);
      
      // Save recipe
      const savedRecipe = await recipeService.saveRecipe(userId, generatedRecipe);
      
      res.status(201).json({
        success: true,
        recipe: savedRecipe,
        message: 'Recipe generated and saved successfully'
      });
    } catch (error) {
      console.error('Generate and save recipe error:', error);
      res.status(500).json({ 
        error: 'Failed to generate and save recipe',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search recipes (placeholder for future implementation)
   */
  async searchRecipes(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Implement recipe search functionality
      res.status(200).json({
        success: true,
        recipes: [],
        message: 'Recipe search functionality coming soon'
      });
    } catch (error) {
      console.error('Search recipes error:', error);
      res.status(500).json({ 
        error: 'Failed to search recipes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const recipeController = new RecipeController(); 