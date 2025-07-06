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
import { apiUsageTracker } from '../services/apiUsageTracker';

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
 * Get restaurant suggestions with optional Google Places integration
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

    const { query = '', location = '' } = req.query as { query?: string; location?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    // Try Google Places API if configured
    if (process.env['GOOGLE_PLACES_API_KEY'] && location.trim()) {
      try {
        // Use the new Places API (New) format - search for any food establishment
        const searchText = `${query} in ${location}`;
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const googleResponse = await fetch(
          `https://places.googleapis.com/v1/places:searchText`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': process.env['GOOGLE_PLACES_API_KEY'],
              'X-Goog-FieldMask': 'places.displayName,places.location,places.types'
            },
            body: JSON.stringify({
              textQuery: searchText,
              maxResultCount: 10
              // Removed includedType to allow restaurants, cafes, coffee shops, etc.
            }),
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        // Track the API usage
        await apiUsageTracker.trackGooglePlacesUsage();
        
        if (googleResponse.ok) {
          const data = await googleResponse.json() as { places?: Array<{ displayName: { text: string } }> };
          suggestions = data.places?.map((place) => place.displayName?.text).filter(Boolean).slice(0, 10) || [];
          source = 'google_places';
          
          console.log(`✅ Google Places API returned ${suggestions.length} results for "${searchText}"`);
        } else {
          const errorData = await googleResponse.json();
          console.log('Google Places API error response:', errorData);
        }
      } catch (googleError) {
        if (googleError instanceof Error && googleError.name === 'AbortError') {
          console.log('Google Places API timeout (5s), using static fallback');
        } else {
          console.log('Google Places API failed, using static fallback:', googleError);
        }
      }
    }

    // Fallback to static suggestions if Google Places failed or not configured
    if (suggestions.length === 0) {
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
        location: location || 'global',
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
 * Get chef suggestions with Wikipedia API and static fallback
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

    const { query = '', cuisine = '' } = req.query as { query?: string; cuisine?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    // Try Wikipedia API first if we have a query
    if (query.trim()) {
      try {
        const { wikipediaService } = await import('../services/wikipediaService');
        suggestions = await wikipediaService.searchChefs(query, 8);
        
        if (suggestions.length > 0) {
          source = 'wikipedia_api';
          
          // Merge with some popular static suggestions for better quality
          const staticMatches = COMMON_CHEFS.filter(chef =>
            chef.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 3);
          
          // Combine Wikipedia results with static matches, removing duplicates
          const combined = [...new Set([...suggestions, ...staticMatches])];
          suggestions = combined.slice(0, 10);
        }
      } catch (wikipediaError) {
        console.log('Wikipedia API failed, using static fallback:', wikipediaError);
        suggestions = [];
      }
    }
    
    // Fallback to static suggestions if Wikipedia failed or no query
    if (suggestions.length === 0) {
      if (query.trim()) {
        // Filter chefs that match the query (case-insensitive)
        suggestions = COMMON_CHEFS.filter(chef =>
          chef.toLowerCase().includes(query.toLowerCase())
        );
        
        // If no direct matches, try fuzzy matching
        if (suggestions.length === 0) {
          suggestions = COMMON_CHEFS.filter(chef => {
            const chefWords = chef.toLowerCase().split(' ');
            const queryWords = query.toLowerCase().split(' ');
            return queryWords.some(queryWord => 
              chefWords.some(chefWord => 
                chefWord.includes(queryWord) || queryWord.includes(chefWord)
              )
            );
          });
        }
        
        // If still no matches, provide popular chefs
        if (suggestions.length === 0) {
          suggestions = COMMON_CHEFS.slice(0, 10); // Top 10 popular chefs
        }
      } else if (cuisine.trim()) {
        // Filter chefs by cuisine specialty (this would require expanding our chef data)
        // For now, return popular chefs
        suggestions = COMMON_CHEFS.slice(0, 15);
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
        cuisine: cuisine || 'all',
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

/**
 * Get API usage statistics
 */
export const getApiUsageStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const stats = apiUsageTracker.getUsageStats();
    const analysis = apiUsageTracker.getCurrentMonthAnalysis();

    res.status(200).json({
      success: true,
      data: {
        stats,
        analysis,
        warnings: {
          approachingLimit: analysis.percentageUsed > 80,
          exceededLimit: !analysis.withinFreeLimit,
        },
      },
    });
  } catch (error) {
    console.error('Get API usage stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get API usage statistics',
    });
  }
};

// Dynamic suggestion endpoints will be implemented after static fallback system is complete 