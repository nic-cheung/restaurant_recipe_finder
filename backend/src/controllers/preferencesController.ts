import { Response } from 'express';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from '../utils/jwt';
import {
  userPreferencesSchema,
  updateUserPreferencesSchema,
  UserPreferencesInput,
  UpdateUserPreferencesInput,
  COMMON_DIETARY_RESTRICTIONS,
  COMMON_ALLERGIES,
  COMMON_CUISINES,
  COMMON_CHEFS,
  COMMON_RESTAURANTS,
  COMMON_INGREDIENTS,
  COMMON_DISHES,
  NUTRITIONAL_GOALS,
  BUDGET_PREFERENCES,
  MEAL_TYPES,
  COOKING_EQUIPMENT,
  MEAL_COMPLEXITY,
  SPICE_TOLERANCE,
} from '../utils/validation';
import { geminiService } from '../services/geminiService';
import {
  getUserPreferencesWithDefaults,
  upsertUserPreferences,
  updateUserPreferences,
  deleteUserPreferences,
  getPreferencesSummary as getPreferencesSummaryService,
  updateUserSpiceTolerance,
} from '../services/preferencesService';

/**
 * Get user preferences
 */
export const getPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const preferences = await getUserPreferencesWithDefaults(req.user.userId);

    res.status(200).json({
      success: true,
      data: {
        preferences,
      },
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Update user preferences (full update/create)
 */
export const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Extract spice tolerance from request body if present
    const { spiceTolerance, ...preferencesData } = req.body;

    // Validate preferences input
    const validatedData: UserPreferencesInput = userPreferencesSchema.parse(preferencesData);

    // Update spice tolerance if provided (it's in User model)
    if (spiceTolerance && ['MILD', 'MEDIUM', 'HOT', 'EXTREME'].includes(spiceTolerance)) {
      await updateUserSpiceTolerance(req.user.userId, spiceTolerance);
    }

    // Upsert preferences
    const preferences = await upsertUserPreferences(req.user.userId, validatedData);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Partially update user preferences
 */
export const patchPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Validate input
    const validatedData: UpdateUserPreferencesInput = updateUserPreferencesSchema.parse(req.body);

    // Update preferences
    const preferences = await updateUserPreferences(req.user.userId, validatedData);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    if (error instanceof Error) {
      if (error.message === 'User preferences not found') {
        res.status(404).json({
          success: false,
          error: 'User preferences not found. Please create preferences first.',
        });
        return;
      }
    }

    console.error('Patch preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Delete user preferences
 */
export const deletePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    await deleteUserPreferences(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Preferences deleted successfully',
    });
  } catch (error) {
    console.error('Delete preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get preferences summary for recipe generation
 */
export const getPreferencesSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const summary = await getPreferencesSummaryService(req.user.userId);

    res.status(200).json({
      success: true,
      data: {
        summary,
      },
    });
  } catch (error) {
    console.error('Get preferences summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get common options for preferences (dietary restrictions, allergies, cuisines)
 */
export const getPreferencesOptions = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        dietaryRestrictions: COMMON_DIETARY_RESTRICTIONS,
        allergies: COMMON_ALLERGIES,
        cuisines: COMMON_CUISINES,
        skillLevels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
        ingredients: COMMON_INGREDIENTS,
        dishes: COMMON_DISHES,
        chefs: COMMON_CHEFS,
        restaurants: COMMON_RESTAURANTS,
        
        // New comprehensive preference options
        nutritionalGoals: NUTRITIONAL_GOALS,
        budgetPreferences: BUDGET_PREFERENCES,
        mealTypes: MEAL_TYPES,
        cookingEquipment: COOKING_EQUIPMENT,
        mealComplexity: MEAL_COMPLEXITY,
        spiceTolerance: SPICE_TOLERANCE,
      },
    });
  } catch (error) {
    console.error('Get preferences options error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get chef suggestions with AI-powered suggestions and static fallback
 */
export const getChefSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { query = '' } = req.query as { query?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    try {
      // Get user preferences for AI context
      const userPreferences = await getUserPreferencesWithDefaults(req.user.userId);
      
      // Try AI-powered suggestions first
      suggestions = await geminiService.suggestChefs(query, {
        favoriteCuisines: userPreferences?.favoriteCuisines || []
      });
      
      source = 'ai_powered';
      
      // Validate AI response
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('Invalid AI response');
      }
      
    } catch (aiError) {
      console.log('AI suggestions failed, using static fallback:', aiError);
      
      // Static fallback: Filter chefs based on query
      if (query.trim()) {
        // Filter chefs that match the query (case-insensitive)
        suggestions = COMMON_CHEFS.filter(chef =>
          chef.toLowerCase().includes(query.toLowerCase())
        );
        
        // If no matches, provide popular chefs
        if (suggestions.length === 0) {
          suggestions = COMMON_CHEFS.slice(0, 10); // Top 10 popular chefs
        }
      } else {
        // No query provided, return popular chefs
        suggestions = COMMON_CHEFS.slice(0, 15); // Top 15 popular chefs
      }
      
      source = 'static_fallback';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10), // Limit to 10 suggestions
        query: query || 'popular',
        source,
      },
    });
  } catch (error) {
    console.error('Get chef suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chef suggestions',
    });
  }
};

/**
 * Get restaurant suggestions with AI-powered suggestions and static fallback
 */
export const getRestaurantSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { query = '' } = req.query as { query?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    try {
      // Get user preferences for AI context
      const userPreferences = await getUserPreferencesWithDefaults(req.user.userId);
      
      // Try AI-powered suggestions first
      suggestions = await geminiService.suggestRestaurants(query, {
        favoriteCuisines: userPreferences?.favoriteCuisines || []
      });
      
      source = 'ai_powered';
      
      // Validate AI response
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('Invalid AI response');
      }
      
    } catch (aiError) {
      console.log('AI suggestions failed, using static fallback:', aiError);
      
      // Static fallback: Filter restaurants based on query
      if (query.trim()) {
        // Filter restaurants that match the query (case-insensitive)
        suggestions = COMMON_RESTAURANTS.filter(restaurant =>
          restaurant.toLowerCase().includes(query.toLowerCase())
        );
        
        // If no matches, provide popular restaurants
        if (suggestions.length === 0) {
          suggestions = COMMON_RESTAURANTS.slice(0, 10); // Top 10 popular restaurants
        }
      } else {
        // No query provided, return popular restaurants
        suggestions = COMMON_RESTAURANTS.slice(0, 15); // Top 15 popular restaurants
      }
      
      source = 'static_fallback';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10), // Limit to 10 suggestions
        query: query || 'popular',
        source,
      },
    });
  } catch (error) {
    console.error('Get restaurant suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get restaurant suggestions',
    });
  }
};

/**
 * Get ingredient suggestions with AI-powered suggestions and static fallback
 */
export const getIngredientSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { query = '' } = req.query as { query?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    try {
      // Get user preferences for AI context
      const userPreferences = await getUserPreferencesWithDefaults(req.user.userId);
      
      // Try AI-powered suggestions first
      suggestions = await geminiService.suggestIngredients(query, {
        favoriteCuisines: userPreferences?.favoriteCuisines || [],
        dietaryRestrictions: userPreferences?.dietaryRestrictions || []
      });
      
      source = 'ai_powered';
      
      // Validate AI response
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('Invalid AI response');
      }
      
    } catch (aiError) {
      console.log('AI suggestions failed, using static fallback:', aiError);
      
      // Static fallback: Filter ingredients based on query
      if (query.trim()) {
        // Filter ingredients that match the query (case-insensitive)
        suggestions = COMMON_INGREDIENTS.filter(ingredient =>
          ingredient.toLowerCase().includes(query.toLowerCase())
        );
        
        // If no matches, provide popular ingredients
        if (suggestions.length === 0) {
          suggestions = COMMON_INGREDIENTS.slice(0, 15); // Top 15 popular ingredients
        }
      } else {
        // No query provided, return popular ingredients
        suggestions = COMMON_INGREDIENTS.slice(0, 20); // Top 20 popular ingredients
      }
      
      source = 'static_fallback';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10), // Limit to 10 suggestions
        query: query || 'popular',
        source,
      },
    });
  } catch (error) {
    console.error('Get ingredient suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ingredient suggestions',
    });
  }
};

/**
 * Get cuisine suggestions with AI-powered suggestions and static fallback
 */
export const getCuisineSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { query = '' } = req.query as { query?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    try {
      // Get user preferences for AI context
      const userPreferences = await getUserPreferencesWithDefaults(req.user.userId);
      
      // Try AI-powered suggestions first
      suggestions = await geminiService.suggestCuisines(query, {
        favoriteIngredients: userPreferences?.favoriteIngredients || []
      });
      
      source = 'ai_powered';
      
      // Validate AI response
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('Invalid AI response');
      }
      
    } catch (aiError) {
      console.log('AI suggestions failed, using static fallback:', aiError);
      
      // Static fallback: Filter cuisines based on query
      if (query.trim()) {
        // Filter cuisines that match the query (case-insensitive)
        suggestions = COMMON_CUISINES.filter(cuisine =>
          cuisine.toLowerCase().includes(query.toLowerCase())
        );
        
        // If no matches, provide popular cuisines
        if (suggestions.length === 0) {
          suggestions = COMMON_CUISINES.slice(0, 10); // Top 10 popular cuisines
        }
      } else {
        // No query provided, return popular cuisines
        suggestions = COMMON_CUISINES.slice(0, 15); // Top 15 popular cuisines
      }
      
      source = 'static_fallback';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10), // Limit to 10 suggestions
        query: query || 'popular',
        source,
      },
    });
  } catch (error) {
    console.error('Get cuisine suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cuisine suggestions',
    });
  }
};

/**
 * Get dish suggestions with AI-powered suggestions and static fallback
 */
export const getDishSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { query = '' } = req.query as { query?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    try {
      // Get user preferences for AI context
      const userPreferences = await getUserPreferencesWithDefaults(req.user.userId);
      
      // Try AI-powered suggestions first
      suggestions = await geminiService.suggestDishes(query, {
        favoriteCuisines: userPreferences?.favoriteCuisines || [],
        favoriteIngredients: userPreferences?.favoriteIngredients || [],
        dietaryRestrictions: userPreferences?.dietaryRestrictions || []
      });
      
      source = 'ai_powered';
      
      // Validate AI response
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('Invalid AI response');
      }
      
    } catch (aiError) {
      console.log('AI suggestions failed, using static fallback:', aiError);
      
      // Static fallback: Filter dishes based on query
      if (query.trim()) {
        // Filter dishes that match the query (case-insensitive)
        suggestions = COMMON_DISHES.filter(dish =>
          dish.toLowerCase().includes(query.toLowerCase())
        );
        
        // If no matches, provide popular dishes
        if (suggestions.length === 0) {
          suggestions = COMMON_DISHES.slice(0, 15); // Top 15 popular dishes
        }
      } else {
        // No query provided, return popular dishes
        suggestions = COMMON_DISHES.slice(0, 20); // Top 20 popular dishes
      }
      
      source = 'static_fallback';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10), // Limit to 10 suggestions
        query: query || 'popular',
        source,
      },
    });
  } catch (error) {
    console.error('Get dish suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dish suggestions',
    });
  }
};

// Dynamic suggestion endpoints will be implemented after static fallback system is complete 