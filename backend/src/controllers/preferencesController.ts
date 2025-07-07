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
  COMMON_DISLIKED_FOODS,
  NUTRITIONAL_GOALS,
  BUDGET_PREFERENCES,
  MEAL_TYPES,
  POPULAR_MEAL_TYPES,
  COOKING_EQUIPMENT,
  MEAL_COMPLEXITY,
  SPICE_TOLERANCE,
} from '../utils/validation';

import {
  getUserPreferencesWithDefaults,
  upsertUserPreferences,
  updateUserPreferences,
  deleteUserPreferences,
  getPreferencesSummary as getPreferencesSummaryService,
  updateUserSpiceTolerance,
} from '../services/preferencesService';
import { apiUsageTracker } from '../services/apiUsageTracker';
import { wikidataIngredientsService } from '../services/wikidataIngredientsService';
import { wikidataDishesService } from '../services/wikidataDishesService';
import { googleAuthService } from '../services/googleAuthService';

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
        dislikedFoods: COMMON_DISLIKED_FOODS,
        
        // New comprehensive preference options
        nutritionalGoals: NUTRITIONAL_GOALS,
        budgetPreferences: BUDGET_PREFERENCES,
        mealTypes: MEAL_TYPES,
        popularMealTypes: POPULAR_MEAL_TYPES,
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
 * Get restaurant suggestions with optional Google Places integration using OAuth
 */
export const getRestaurantSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Allow unauthenticated access for registration flow
    const { query = '', location = '' } = req.query as { query?: string; location?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    // Try Google Places API with OAuth if configured
    if (googleAuthService.isConfigured() && location.trim()) {
      try {
        // Use the new Places API (New) format - search for any food establishment
        const searchText = `${query} in ${location}`;
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const googleResponse = await googleAuthService.makeAuthenticatedRequest(
          'https://places.googleapis.com/v1/places:searchText',
          {
            method: 'POST',
            headers: {
              'X-Goog-FieldMask': 'places.displayName,places.location,places.types'
            },
            body: JSON.stringify({
              textQuery: searchText,
              maxResultCount: 10
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
          source = 'google_places_oauth';
          
          console.log(`✅ Google Places API (OAuth) returned ${suggestions.length} results for "${searchText}"`);
        } else {
          const errorData = await googleResponse.json();
          console.log('Google Places API (OAuth) error response:', errorData);
        }
      } catch (googleError) {
        if (googleError instanceof Error && googleError.name === 'AbortError') {
          console.log('Google Places API (OAuth) timeout (5s), using static fallback');
        } else {
          console.log('Google Places API (OAuth) failed, using static fallback:', googleError);
        }
      }
    }
    // Fallback to API key method if OAuth not configured
    else if (process.env['GOOGLE_PLACES_API_KEY'] && location.trim()) {
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
          source = 'google_places_api_key';
          
          console.log(`✅ Google Places API (API Key) returned ${suggestions.length} results for "${searchText}"`);
        } else {
          const errorData = await googleResponse.json();
          console.log('Google Places API (API Key) error response:', errorData);
        }
      } catch (googleError) {
        if (googleError instanceof Error && googleError.name === 'AbortError') {
          console.log('Google Places API (API Key) timeout (5s), using static fallback');
        } else {
          console.log('Google Places API (API Key) failed, using static fallback:', googleError);
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
 * Normalize text for accent-insensitive matching
 */
function normalizeForMatching(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Get chef suggestions with static-first approach
 */
export const getChefSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Allow unauthenticated access for registration flow
    const { query = '', cuisine = '' } = req.query as { query?: string; cuisine?: string };
    let suggestions: string[] = [];
    let source = 'static';
    let hasMoreResults = false;
    
    if (query.trim()) {
      // Static search first - normalize for accent-insensitive matching
      const normalizedQuery = normalizeForMatching(query);
      
      // Try exact matches first
      const exactMatches = COMMON_CHEFS.filter(chef =>
        normalizeForMatching(chef).toLowerCase() === normalizedQuery.toLowerCase()
      );
      
      // Then partial matches
      const partialMatches = COMMON_CHEFS.filter(chef =>
        normalizeForMatching(chef).toLowerCase().includes(normalizedQuery.toLowerCase()) &&
        !exactMatches.includes(chef)
      );
      
      // If no direct matches, try fuzzy matching (word-based)
      let fuzzyMatches: string[] = [];
      if (exactMatches.length === 0 && partialMatches.length === 0) {
        fuzzyMatches = COMMON_CHEFS.filter(chef => {
          const chefWords = normalizeForMatching(chef).toLowerCase().split(' ');
          const queryWords = normalizedQuery.toLowerCase().split(' ');
          return queryWords.some(queryWord => 
            chefWords.some(chefWord => 
              chefWord.includes(queryWord) || queryWord.includes(chefWord)
            )
          );
        });
      }
      
      // Combine and sort by relevance
      suggestions = [...exactMatches, ...partialMatches, ...fuzzyMatches];
      suggestions = sortSuggestionsByRelevance(suggestions, query);
      
      if (suggestions.length > 0) {
        source = 'static_match';
        // Suggest enhanced search if we have few results or user might want more variety
        hasMoreResults = suggestions.length < 8;
      } else {
        // No matches found - don't show popular suggestions in dropdown
        // Instead, encourage enhanced search
        suggestions = [];
        source = 'no_match';
        hasMoreResults = true; // Definitely suggest enhanced search
      }
    } else if (cuisine.trim()) {
      // Filter chefs by cuisine specialty (this would require expanding our chef data)
      // For now, return popular chefs and suggest enhanced search for cuisine-specific results
      suggestions = COMMON_CHEFS.slice(0, 12);
      source = 'static_popular';
      hasMoreResults = true; // Enhanced search can find cuisine-specific chefs
    } else {
      // No query provided, return popular chefs
      suggestions = COMMON_CHEFS.slice(0, 12);
      source = 'static_popular';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10),
        query: query || 'popular',
        cuisine: cuisine || 'all',
        source,
        hasMoreResults,
        message: hasMoreResults && (query.trim() || cuisine.trim()) ? 
          'Try enhanced search for more chef options' : 
          undefined
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
 * Enhanced chef search using Wikidata API
 */
export const getEnhancedChefSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { query = '', cuisine = '' } = req.query as { query?: string; cuisine?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    if (!query.trim()) {
      res.status(400).json({
        success: false,
        error: 'Query is required for enhanced search',
      });
      return;
    }
    
    try {
      // Use Wikidata API for enhanced results
      const { wikidataService } = await import('../services/wikidataService');
      const wikidataResults = await wikidataService.searchChefs(query, 10);
      
      if (wikidataResults.length > 0) {
        // Merge with static suggestions using accent-insensitive matching
        const normalizedQuery = normalizeForMatching(query);
        const staticMatches = COMMON_CHEFS.filter(chef =>
          normalizeForMatching(chef).includes(normalizedQuery)
        );
        
        // Combine and deduplicate, prioritizing Wikidata results
        const allSuggestions = [...wikidataResults, ...staticMatches];
        suggestions = [...new Set(allSuggestions)];
        source = 'wikidata_enhanced';
      } else {
        // Fallback to more comprehensive static search
        const normalizedQuery = normalizeForMatching(query);
        suggestions = COMMON_CHEFS.filter(chef =>
          normalizeForMatching(chef).includes(normalizedQuery)
        );
        source = 'static_comprehensive';
      }
    } catch (wikidataError) {
      console.log('Enhanced Wikidata chef search failed:', wikidataError);
      // Comprehensive static fallback
      const normalizedQuery = normalizeForMatching(query);
      suggestions = COMMON_CHEFS.filter(chef =>
        normalizeForMatching(chef).includes(normalizedQuery)
      );
      source = 'static_comprehensive';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 15), // More results for enhanced search
        query,
        cuisine: cuisine || 'all',
        source,
        enhanced: true,
      },
    });
  } catch (error) {
    console.error('Enhanced chef search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform enhanced chef search',
    });
  }
};

/**
 * Get ingredient suggestions with static-first approach
 */
export const getIngredientSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Allow unauthenticated access for registration flow
    const { query = '' } = req.query as { query?: string };
    let suggestions: string[] = [];
    let source = 'static';
    let hasMoreResults = false;
    
    if (query.trim()) {
      // Static search first - normalize for accent-insensitive matching
      const normalizedQuery = normalizeForMatching(query);
      
      // Try exact matches first
      const exactMatches = COMMON_INGREDIENTS.filter(ingredient =>
        normalizeForMatching(ingredient).toLowerCase() === normalizedQuery.toLowerCase()
      );
      
      // Then partial matches
      const partialMatches = COMMON_INGREDIENTS.filter(ingredient =>
        normalizeForMatching(ingredient).toLowerCase().includes(normalizedQuery.toLowerCase()) &&
        !exactMatches.includes(ingredient)
      );
      
      // Combine and sort by relevance
      suggestions = [...exactMatches, ...partialMatches];
      suggestions = sortSuggestionsByRelevance(suggestions, query);
      
      if (suggestions.length > 0) {
        source = 'static_match';
        // Suggest enhanced search if we have few results or user might want more variety
        hasMoreResults = suggestions.length < 8;
      } else {
        // No matches found - don't show popular suggestions in dropdown
        // Instead, encourage enhanced search
        suggestions = [];
        source = 'no_match';
        hasMoreResults = true; // Definitely suggest enhanced search
      }
    } else {
      // No query provided, return popular ingredients
      suggestions = COMMON_INGREDIENTS.slice(0, 12);
      source = 'static_popular';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10),
        query: query || 'popular',
        source,
        hasMoreResults,
        message: hasMoreResults && query.trim() ? 
          'Try enhanced search for more ingredient options' : 
          undefined
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
 * Enhanced ingredient search using Wikidata API
 */
export const getEnhancedIngredientSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { query = '' } = req.query as { query?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    if (!query.trim()) {
      res.status(400).json({
        success: false,
        error: 'Query is required for enhanced search',
      });
      return;
    }
    
    try {
      // Use Wikidata API for enhanced results
      const wikidataResults = await wikidataIngredientsService.getIngredientSuggestions(query);
      
      if (wikidataResults.length > 0) {
        // Merge with static suggestions using accent-insensitive matching
        const normalizedQuery = normalizeForMatching(query);
        const staticMatches = COMMON_INGREDIENTS.filter(ingredient =>
          normalizeForMatching(ingredient).includes(normalizedQuery)
        );
        
        // Combine and deduplicate, prioritizing Wikidata results
        const allSuggestions = [...wikidataResults, ...staticMatches];
        suggestions = [...new Set(allSuggestions)];
        source = 'wikidata_enhanced';
      } else {
        // Fallback to more comprehensive static search
        const normalizedQuery = normalizeForMatching(query);
        suggestions = COMMON_INGREDIENTS.filter(ingredient =>
          normalizeForMatching(ingredient).includes(normalizedQuery)
        );
        source = 'static_comprehensive';
      }
    } catch (wikidataError) {
      console.log('Enhanced Wikidata ingredients search failed:', wikidataError);
      // Comprehensive static fallback
      const normalizedQuery = normalizeForMatching(query);
      suggestions = COMMON_INGREDIENTS.filter(ingredient =>
        normalizeForMatching(ingredient).includes(normalizedQuery)
      );
      source = 'static_comprehensive';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 15), // More results for enhanced search
        query,
        source,
        enhanced: true,
      },
    });
  } catch (error) {
    console.error('Enhanced ingredient search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform enhanced ingredient search',
    });
  }
};

/**
 * Get cuisine suggestions with static fallback only
 */
export const getCuisineSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Allow unauthenticated access for registration flow
    const { query = '' } = req.query as { query?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    // Go directly to static fallback (no external API for cuisines, no AI to preserve quota)

    // Skip AI to preserve quota - go directly to static fallback

    // Static fallback (no AI to preserve quota)
    if (suggestions.length === 0) {
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
 * Get dish suggestions with static-first approach
 */
export const getDishSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Allow unauthenticated access for registration flow
    const { query = '' } = req.query as { query?: string };
    let suggestions: string[] = [];
    let source = 'static';
    let hasMoreResults = false;
    
    if (query.trim()) {
      // Static search first - normalize for accent-insensitive matching
      const normalizedQuery = normalizeForMatching(query);
      
      // Try exact matches first
      const exactMatches = COMMON_DISHES.filter(dish =>
        normalizeForMatching(dish).toLowerCase() === normalizedQuery.toLowerCase()
      );
      
      // Then partial matches
      const partialMatches = COMMON_DISHES.filter(dish =>
        normalizeForMatching(dish).toLowerCase().includes(normalizedQuery.toLowerCase()) &&
        !exactMatches.includes(dish)
      );
      
      // Combine and sort by relevance
      suggestions = [...exactMatches, ...partialMatches];
      suggestions = sortSuggestionsByRelevance(suggestions, query);
      
      if (suggestions.length > 0) {
        source = 'static_match';
        // Suggest enhanced search if we have few results or user might want more variety
        hasMoreResults = suggestions.length < 8;
      } else {
        // No static matches found - try Wikidata API
        try {
          const wikidataResults = await wikidataDishesService.getDishSuggestions(query);
          
          if (wikidataResults.length > 0) {
            suggestions = wikidataResults;
            source = 'wikidata_api';
            hasMoreResults = false; // We got enhanced results
          } else {
            // No Wikidata results either - don't show popular dishes in dropdown
            // Instead, encourage enhanced search
            suggestions = [];
            source = 'no_match';
            hasMoreResults = true; // Definitely suggest enhanced search
          }
        } catch (wikidataError) {
          console.log('Wikidata dish search failed:', wikidataError);
          // No fallback to popular dishes in dropdown
          suggestions = [];
          source = 'no_match';
          hasMoreResults = true; // Suggest enhanced search
        }
      }
    } else {
      // No query provided, return popular dishes
      suggestions = COMMON_DISHES.slice(0, 12);
      source = 'static_popular';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10),
        query: query || 'popular',
        source,
        hasMoreResults,
        message: hasMoreResults && query.trim() ? 
          'Try enhanced search for more dish options' : 
          undefined
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
 * Enhanced dish search using Wikidata API
 */
export const getEnhancedDishSuggestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { query = '' } = req.query as { query?: string };
    let suggestions: string[] = [];
    let source = 'static_fallback';
    
    if (!query.trim()) {
      res.status(400).json({
        success: false,
        error: 'Query is required for enhanced search',
      });
      return;
    }
    
    try {
      // Use Wikidata API for enhanced results
      const wikidataResults = await wikidataDishesService.getDishSuggestions(query);
      
      if (wikidataResults.length > 0) {
        // Merge with static suggestions using accent-insensitive matching
        const normalizedQuery = normalizeForMatching(query);
        const staticMatches = COMMON_DISHES.filter(dish =>
          normalizeForMatching(dish).includes(normalizedQuery)
        );
        
        // Combine and deduplicate, prioritizing Wikidata results
        const allSuggestions = [...wikidataResults, ...staticMatches];
        suggestions = [...new Set(allSuggestions)];
        source = 'wikidata_enhanced';
      } else {
        // Fallback to more comprehensive static search
        const normalizedQuery = normalizeForMatching(query);
        suggestions = COMMON_DISHES.filter(dish =>
          normalizeForMatching(dish).includes(normalizedQuery)
        );
        source = 'static_comprehensive';
      }
    } catch (wikidataError) {
      console.log('Enhanced Wikidata search failed:', wikidataError);
      // Comprehensive static fallback
      const normalizedQuery = normalizeForMatching(query);
      suggestions = COMMON_DISHES.filter(dish =>
        normalizeForMatching(dish).includes(normalizedQuery)
      );
      source = 'static_comprehensive';
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 15), // More results for enhanced search
        query,
        source,
        enhanced: true,
      },
    });
  } catch (error) {
    console.error('Enhanced dish search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform enhanced dish search',
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

/**
 * Sort suggestions by relevance to the query
 */
function sortSuggestionsByRelevance(suggestions: string[], query: string): string[] {
  if (!query.trim()) return suggestions;

  const queryLower = query.toLowerCase();

  return suggestions.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    // Exact matches first
    const aExact = aLower === queryLower;
    const bExact = bLower === queryLower;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // Starts with query
    const aStarts = aLower.startsWith(queryLower);
    const bStarts = bLower.startsWith(queryLower);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // Contains query (closer to beginning wins)
    const aIndex = aLower.indexOf(queryLower);
    const bIndex = bLower.indexOf(queryLower);
    if (aIndex !== bIndex) return aIndex - bIndex;

    // Shorter names win (more specific)
    if (a.length !== b.length) return a.length - b.length;

    // Alphabetical as final tiebreaker
    return a.localeCompare(b);
  });
}

// Dynamic suggestion endpoints will be implemented after static fallback system is complete 