"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiUsageStats = exports.getEnhancedDishSuggestions = exports.getDishSuggestions = exports.getCuisineSuggestions = exports.getEnhancedIngredientSuggestions = exports.getIngredientSuggestions = exports.getEnhancedChefSuggestions = exports.getChefSuggestions = exports.getRestaurantSuggestions = exports.getPreferencesOptions = exports.getPreferencesSummary = exports.deletePreferences = exports.patchPreferences = exports.updatePreferences = exports.getPreferences = void 0;
const zod_1 = require("zod");
const validation_1 = require("../utils/validation");
const preferencesService_1 = require("../services/preferencesService");
const apiUsageTracker_1 = require("../services/apiUsageTracker");
const wikidataIngredientsService_1 = require("../services/wikidataIngredientsService");
const wikidataDishesService_1 = require("../services/wikidataDishesService");
const googleAuthService_1 = require("../services/googleAuthService");
const getPreferences = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const preferences = await (0, preferencesService_1.getUserPreferencesWithDefaults)(req.user.userId);
        res.status(200).json({
            success: true,
            data: {
                preferences,
            },
        });
    }
    catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.getPreferences = getPreferences;
const updatePreferences = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const { spiceTolerance, ...preferencesData } = req.body;
        const validatedData = validation_1.userPreferencesSchema.parse(preferencesData);
        if (spiceTolerance && ['MILD', 'MEDIUM', 'HOT', 'EXTREME'].includes(spiceTolerance)) {
            await (0, preferencesService_1.updateUserSpiceTolerance)(req.user.userId, spiceTolerance);
        }
        const preferences = await (0, preferencesService_1.upsertUserPreferences)(req.user.userId, validatedData);
        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: {
                preferences,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
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
exports.updatePreferences = updatePreferences;
const patchPreferences = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const validatedData = validation_1.updateUserPreferencesSchema.parse(req.body);
        const preferences = await (0, preferencesService_1.updateUserPreferences)(req.user.userId, validatedData);
        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: {
                preferences,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
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
exports.patchPreferences = patchPreferences;
const deletePreferences = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        await (0, preferencesService_1.deleteUserPreferences)(req.user.userId);
        res.status(200).json({
            success: true,
            message: 'Preferences deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.deletePreferences = deletePreferences;
const getPreferencesSummary = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const summary = await (0, preferencesService_1.getPreferencesSummary)(req.user.userId);
        res.status(200).json({
            success: true,
            data: {
                summary,
            },
        });
    }
    catch (error) {
        console.error('Get preferences summary error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.getPreferencesSummary = getPreferencesSummary;
const getPreferencesOptions = async (_req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                dietaryRestrictions: validation_1.COMMON_DIETARY_RESTRICTIONS,
                allergies: validation_1.COMMON_ALLERGIES,
                cuisines: validation_1.COMMON_CUISINES,
                skillLevels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
                ingredients: validation_1.COMMON_INGREDIENTS,
                dishes: validation_1.COMMON_DISHES,
                chefs: validation_1.COMMON_CHEFS,
                restaurants: validation_1.COMMON_RESTAURANTS,
                dislikedFoods: validation_1.COMMON_DISLIKED_FOODS,
                nutritionalGoals: validation_1.NUTRITIONAL_GOALS,
                budgetPreferences: validation_1.BUDGET_PREFERENCES,
                mealTypes: validation_1.MEAL_TYPES,
                popularMealTypes: validation_1.POPULAR_MEAL_TYPES,
                cookingEquipment: validation_1.COOKING_EQUIPMENT,
                mealComplexity: validation_1.MEAL_COMPLEXITY,
                spiceTolerance: validation_1.SPICE_TOLERANCE,
            },
        });
    }
    catch (error) {
        console.error('Get preferences options error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.getPreferencesOptions = getPreferencesOptions;
const getRestaurantSuggestions = async (req, res) => {
    try {
        const { query = '', location = '' } = req.query;
        let suggestions = [];
        let source = 'static_fallback';
        if (googleAuthService_1.googleAuthService.isConfigured() && location.trim()) {
            try {
                const searchText = `${query} in ${location}`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const googleResponse = await googleAuthService_1.googleAuthService.makeAuthenticatedRequest('https://places.googleapis.com/v1/places:searchText', {
                    method: 'POST',
                    headers: {
                        'X-Goog-FieldMask': 'places.displayName,places.location,places.types'
                    },
                    body: JSON.stringify({
                        textQuery: searchText,
                        maxResultCount: 10
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                await apiUsageTracker_1.apiUsageTracker.trackGooglePlacesUsage();
                if (googleResponse.ok) {
                    const data = await googleResponse.json();
                    suggestions = data.places?.map((place) => place.displayName?.text).filter(Boolean).slice(0, 10) || [];
                    source = 'google_places_oauth';
                    console.log(`✅ Google Places API (OAuth) returned ${suggestions.length} results for "${searchText}"`);
                }
                else {
                    const errorData = await googleResponse.json();
                    console.log('Google Places API (OAuth) error response:', errorData);
                }
            }
            catch (googleError) {
                if (googleError instanceof Error && googleError.name === 'AbortError') {
                    console.log('Google Places API (OAuth) timeout (5s), using static fallback');
                }
                else {
                    console.log('Google Places API (OAuth) failed, using static fallback:', googleError);
                }
            }
        }
        else if (process.env['GOOGLE_PLACES_API_KEY'] && location.trim()) {
            try {
                const searchText = `${query} in ${location}`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const googleResponse = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
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
                });
                clearTimeout(timeoutId);
                await apiUsageTracker_1.apiUsageTracker.trackGooglePlacesUsage();
                if (googleResponse.ok) {
                    const data = await googleResponse.json();
                    suggestions = data.places?.map((place) => place.displayName?.text).filter(Boolean).slice(0, 10) || [];
                    source = 'google_places_api_key';
                    console.log(`✅ Google Places API (API Key) returned ${suggestions.length} results for "${searchText}"`);
                }
                else {
                    const errorData = await googleResponse.json();
                    console.log('Google Places API (API Key) error response:', errorData);
                }
            }
            catch (googleError) {
                if (googleError instanceof Error && googleError.name === 'AbortError') {
                    console.log('Google Places API (API Key) timeout (5s), using static fallback');
                }
                else {
                    console.log('Google Places API (API Key) failed, using static fallback:', googleError);
                }
            }
        }
        if (suggestions.length === 0) {
            if (query.trim()) {
                suggestions = validation_1.COMMON_RESTAURANTS.filter(restaurant => restaurant.toLowerCase().includes(query.toLowerCase()));
                if (suggestions.length === 0) {
                    suggestions = validation_1.COMMON_RESTAURANTS.slice(0, 10);
                }
            }
            else {
                suggestions = validation_1.COMMON_RESTAURANTS.slice(0, 15);
            }
            source = 'static_fallback';
        }
        res.status(200).json({
            success: true,
            data: {
                suggestions: suggestions.slice(0, 10),
                query: query || 'popular',
                location: location || 'global',
                source,
            },
        });
    }
    catch (error) {
        console.error('Get restaurant suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get restaurant suggestions',
        });
    }
};
exports.getRestaurantSuggestions = getRestaurantSuggestions;
function normalizeForMatching(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
const getChefSuggestions = async (req, res) => {
    try {
        const { query = '', cuisine = '' } = req.query;
        let suggestions = [];
        let source = 'static';
        let hasMoreResults = false;
        if (query.trim()) {
            const normalizedQuery = normalizeForMatching(query);
            const exactMatches = validation_1.COMMON_CHEFS.filter(chef => normalizeForMatching(chef).toLowerCase() === normalizedQuery.toLowerCase());
            const partialMatches = validation_1.COMMON_CHEFS.filter(chef => normalizeForMatching(chef).toLowerCase().includes(normalizedQuery.toLowerCase()) &&
                !exactMatches.includes(chef));
            let fuzzyMatches = [];
            if (exactMatches.length === 0 && partialMatches.length === 0) {
                fuzzyMatches = validation_1.COMMON_CHEFS.filter(chef => {
                    const chefWords = normalizeForMatching(chef).toLowerCase().split(' ');
                    const queryWords = normalizedQuery.toLowerCase().split(' ');
                    return queryWords.some(queryWord => chefWords.some(chefWord => chefWord.includes(queryWord) || queryWord.includes(chefWord)));
                });
            }
            suggestions = [...exactMatches, ...partialMatches, ...fuzzyMatches];
            suggestions = sortSuggestionsByRelevance(suggestions, query);
            if (suggestions.length > 0) {
                source = 'static_match';
                hasMoreResults = suggestions.length < 8;
            }
            else {
                suggestions = [];
                source = 'no_match';
                hasMoreResults = true;
            }
        }
        else if (cuisine.trim()) {
            suggestions = validation_1.COMMON_CHEFS.slice(0, 12);
            source = 'static_popular';
            hasMoreResults = true;
        }
        else {
            suggestions = validation_1.COMMON_CHEFS.slice(0, 12);
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
    }
    catch (error) {
        console.error('Get chef suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get chef suggestions',
        });
    }
};
exports.getChefSuggestions = getChefSuggestions;
const getEnhancedChefSuggestions = async (req, res) => {
    try {
        const { query = '', cuisine = '' } = req.query;
        let suggestions = [];
        let source = 'static_fallback';
        if (!query.trim()) {
            res.status(400).json({
                success: false,
                error: 'Query is required for enhanced search',
            });
            return;
        }
        try {
            const { wikidataService } = await Promise.resolve().then(() => __importStar(require('../services/wikidataService')));
            const wikidataResults = await wikidataService.searchChefs(query, 10);
            if (wikidataResults.length > 0) {
                const normalizedQuery = normalizeForMatching(query);
                const staticMatches = validation_1.COMMON_CHEFS.filter(chef => normalizeForMatching(chef).includes(normalizedQuery));
                const allSuggestions = [...wikidataResults, ...staticMatches];
                suggestions = [...new Set(allSuggestions)];
                source = 'wikidata_enhanced';
            }
            else {
                const normalizedQuery = normalizeForMatching(query);
                suggestions = validation_1.COMMON_CHEFS.filter(chef => normalizeForMatching(chef).includes(normalizedQuery));
                source = 'static_comprehensive';
            }
        }
        catch (wikidataError) {
            console.log('Enhanced Wikidata chef search failed:', wikidataError);
            const normalizedQuery = normalizeForMatching(query);
            suggestions = validation_1.COMMON_CHEFS.filter(chef => normalizeForMatching(chef).includes(normalizedQuery));
            source = 'static_comprehensive';
        }
        res.status(200).json({
            success: true,
            data: {
                suggestions: suggestions.slice(0, 15),
                query,
                cuisine: cuisine || 'all',
                source,
                enhanced: true,
            },
        });
    }
    catch (error) {
        console.error('Enhanced chef search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform enhanced chef search',
        });
    }
};
exports.getEnhancedChefSuggestions = getEnhancedChefSuggestions;
const getIngredientSuggestions = async (req, res) => {
    try {
        const { query = '' } = req.query;
        let suggestions = [];
        let source = 'static';
        let hasMoreResults = false;
        if (query.trim()) {
            const normalizedQuery = normalizeForMatching(query);
            const exactMatches = validation_1.COMMON_INGREDIENTS.filter(ingredient => normalizeForMatching(ingredient).toLowerCase() === normalizedQuery.toLowerCase());
            const partialMatches = validation_1.COMMON_INGREDIENTS.filter(ingredient => normalizeForMatching(ingredient).toLowerCase().includes(normalizedQuery.toLowerCase()) &&
                !exactMatches.includes(ingredient));
            suggestions = [...exactMatches, ...partialMatches];
            suggestions = sortSuggestionsByRelevance(suggestions, query);
            if (suggestions.length > 0) {
                source = 'static_match';
                hasMoreResults = suggestions.length < 8;
            }
            else {
                suggestions = [];
                source = 'no_match';
                hasMoreResults = true;
            }
        }
        else {
            suggestions = validation_1.COMMON_INGREDIENTS.slice(0, 12);
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
    }
    catch (error) {
        console.error('Get ingredient suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get ingredient suggestions',
        });
    }
};
exports.getIngredientSuggestions = getIngredientSuggestions;
const getEnhancedIngredientSuggestions = async (req, res) => {
    try {
        const { query = '' } = req.query;
        let suggestions = [];
        let source = 'static_fallback';
        if (!query.trim()) {
            res.status(400).json({
                success: false,
                error: 'Query is required for enhanced search',
            });
            return;
        }
        try {
            const wikidataResults = await wikidataIngredientsService_1.wikidataIngredientsService.getIngredientSuggestions(query);
            if (wikidataResults.length > 0) {
                const normalizedQuery = normalizeForMatching(query);
                const staticMatches = validation_1.COMMON_INGREDIENTS.filter(ingredient => normalizeForMatching(ingredient).includes(normalizedQuery));
                const allSuggestions = [...wikidataResults, ...staticMatches];
                suggestions = [...new Set(allSuggestions)];
                source = 'wikidata_enhanced';
            }
            else {
                const normalizedQuery = normalizeForMatching(query);
                suggestions = validation_1.COMMON_INGREDIENTS.filter(ingredient => normalizeForMatching(ingredient).includes(normalizedQuery));
                source = 'static_comprehensive';
            }
        }
        catch (wikidataError) {
            console.log('Enhanced Wikidata ingredients search failed:', wikidataError);
            const normalizedQuery = normalizeForMatching(query);
            suggestions = validation_1.COMMON_INGREDIENTS.filter(ingredient => normalizeForMatching(ingredient).includes(normalizedQuery));
            source = 'static_comprehensive';
        }
        res.status(200).json({
            success: true,
            data: {
                suggestions: suggestions.slice(0, 15),
                query,
                source,
                enhanced: true,
            },
        });
    }
    catch (error) {
        console.error('Enhanced ingredient search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform enhanced ingredient search',
        });
    }
};
exports.getEnhancedIngredientSuggestions = getEnhancedIngredientSuggestions;
const getCuisineSuggestions = async (req, res) => {
    try {
        const { query = '' } = req.query;
        let suggestions = [];
        let source = 'static_fallback';
        if (suggestions.length === 0) {
            if (query.trim()) {
                suggestions = validation_1.COMMON_CUISINES.filter(cuisine => cuisine.toLowerCase().includes(query.toLowerCase()));
                if (suggestions.length === 0) {
                    suggestions = validation_1.COMMON_CUISINES.slice(0, 10);
                }
            }
            else {
                suggestions = validation_1.COMMON_CUISINES.slice(0, 15);
            }
            source = 'static_fallback';
        }
        res.status(200).json({
            success: true,
            data: {
                suggestions: suggestions.slice(0, 10),
                query: query || 'popular',
                source,
            },
        });
    }
    catch (error) {
        console.error('Get cuisine suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get cuisine suggestions',
        });
    }
};
exports.getCuisineSuggestions = getCuisineSuggestions;
const getDishSuggestions = async (req, res) => {
    try {
        const { query = '' } = req.query;
        let suggestions = [];
        let source = 'static';
        let hasMoreResults = false;
        if (query.trim()) {
            const normalizedQuery = normalizeForMatching(query);
            const exactMatches = validation_1.COMMON_DISHES.filter(dish => normalizeForMatching(dish).toLowerCase() === normalizedQuery.toLowerCase());
            const partialMatches = validation_1.COMMON_DISHES.filter(dish => normalizeForMatching(dish).toLowerCase().includes(normalizedQuery.toLowerCase()) &&
                !exactMatches.includes(dish));
            suggestions = [...exactMatches, ...partialMatches];
            suggestions = sortSuggestionsByRelevance(suggestions, query);
            if (suggestions.length > 0) {
                source = 'static_match';
                hasMoreResults = suggestions.length < 8;
            }
            else {
                try {
                    const wikidataResults = await wikidataDishesService_1.wikidataDishesService.getDishSuggestions(query);
                    if (wikidataResults.length > 0) {
                        suggestions = wikidataResults;
                        source = 'wikidata_api';
                        hasMoreResults = false;
                    }
                    else {
                        suggestions = [];
                        source = 'no_match';
                        hasMoreResults = true;
                    }
                }
                catch (wikidataError) {
                    console.log('Wikidata dish search failed:', wikidataError);
                    suggestions = [];
                    source = 'no_match';
                    hasMoreResults = true;
                }
            }
        }
        else {
            suggestions = validation_1.COMMON_DISHES.slice(0, 12);
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
    }
    catch (error) {
        console.error('Get dish suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get dish suggestions',
        });
    }
};
exports.getDishSuggestions = getDishSuggestions;
const getEnhancedDishSuggestions = async (req, res) => {
    try {
        const { query = '' } = req.query;
        let suggestions = [];
        let source = 'static_fallback';
        if (!query.trim()) {
            res.status(400).json({
                success: false,
                error: 'Query is required for enhanced search',
            });
            return;
        }
        try {
            const wikidataResults = await wikidataDishesService_1.wikidataDishesService.getDishSuggestions(query);
            if (wikidataResults.length > 0) {
                const normalizedQuery = normalizeForMatching(query);
                const staticMatches = validation_1.COMMON_DISHES.filter(dish => normalizeForMatching(dish).includes(normalizedQuery));
                const allSuggestions = [...wikidataResults, ...staticMatches];
                suggestions = [...new Set(allSuggestions)];
                source = 'wikidata_enhanced';
            }
            else {
                const normalizedQuery = normalizeForMatching(query);
                suggestions = validation_1.COMMON_DISHES.filter(dish => normalizeForMatching(dish).includes(normalizedQuery));
                source = 'static_comprehensive';
            }
        }
        catch (wikidataError) {
            console.log('Enhanced Wikidata search failed:', wikidataError);
            const normalizedQuery = normalizeForMatching(query);
            suggestions = validation_1.COMMON_DISHES.filter(dish => normalizeForMatching(dish).includes(normalizedQuery));
            source = 'static_comprehensive';
        }
        res.status(200).json({
            success: true,
            data: {
                suggestions: suggestions.slice(0, 15),
                query,
                source,
                enhanced: true,
            },
        });
    }
    catch (error) {
        console.error('Enhanced dish search error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform enhanced dish search',
        });
    }
};
exports.getEnhancedDishSuggestions = getEnhancedDishSuggestions;
const getApiUsageStats = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const stats = apiUsageTracker_1.apiUsageTracker.getUsageStats();
        const analysis = apiUsageTracker_1.apiUsageTracker.getCurrentMonthAnalysis();
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
    }
    catch (error) {
        console.error('Get API usage stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get API usage statistics',
        });
    }
};
exports.getApiUsageStats = getApiUsageStats;
function sortSuggestionsByRelevance(suggestions, query) {
    if (!query.trim())
        return suggestions;
    const queryLower = query.toLowerCase();
    return suggestions.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aExact = aLower === queryLower;
        const bExact = bLower === queryLower;
        if (aExact && !bExact)
            return -1;
        if (!aExact && bExact)
            return 1;
        const aStarts = aLower.startsWith(queryLower);
        const bStarts = bLower.startsWith(queryLower);
        if (aStarts && !bStarts)
            return -1;
        if (!aStarts && bStarts)
            return 1;
        const aIndex = aLower.indexOf(queryLower);
        const bIndex = bLower.indexOf(queryLower);
        if (aIndex !== bIndex)
            return aIndex - bIndex;
        if (a.length !== b.length)
            return a.length - b.length;
        return a.localeCompare(b);
    });
}
//# sourceMappingURL=preferencesController.js.map