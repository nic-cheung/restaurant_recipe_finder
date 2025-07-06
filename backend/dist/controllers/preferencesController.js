"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDishSuggestions = exports.getCuisineSuggestions = exports.getIngredientSuggestions = exports.getRestaurantSuggestions = exports.getChefSuggestions = exports.getPreferencesOptions = exports.getPreferencesSummary = exports.deletePreferences = exports.patchPreferences = exports.updatePreferences = exports.getPreferences = void 0;
const zod_1 = require("zod");
const validation_1 = require("../utils/validation");
const geminiService_1 = require("../services/geminiService");
const preferencesService_1 = require("../services/preferencesService");
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
                nutritionalGoals: validation_1.NUTRITIONAL_GOALS,
                budgetPreferences: validation_1.BUDGET_PREFERENCES,
                mealTypes: validation_1.MEAL_TYPES,
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
const getChefSuggestions = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const { query = '' } = req.query;
        let suggestions = [];
        let source = 'static_fallback';
        try {
            const userPreferences = await (0, preferencesService_1.getUserPreferencesWithDefaults)(req.user.userId);
            suggestions = await geminiService_1.geminiService.suggestChefs(query, {
                favoriteCuisines: userPreferences?.favoriteCuisines || []
            });
            source = 'ai_powered';
            if (!Array.isArray(suggestions) || suggestions.length === 0) {
                throw new Error('Invalid AI response');
            }
        }
        catch (aiError) {
            console.log('AI suggestions failed, using static fallback:', aiError);
            if (query.trim()) {
                suggestions = validation_1.COMMON_CHEFS.filter(chef => chef.toLowerCase().includes(query.toLowerCase()));
                if (suggestions.length === 0) {
                    suggestions = validation_1.COMMON_CHEFS.slice(0, 10);
                }
            }
            else {
                suggestions = validation_1.COMMON_CHEFS.slice(0, 15);
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
        console.error('Get chef suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get chef suggestions',
        });
    }
};
exports.getChefSuggestions = getChefSuggestions;
const getRestaurantSuggestions = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const { query = '' } = req.query;
        let suggestions = [];
        let source = 'static_fallback';
        try {
            const userPreferences = await (0, preferencesService_1.getUserPreferencesWithDefaults)(req.user.userId);
            suggestions = await geminiService_1.geminiService.suggestRestaurants(query, {
                favoriteCuisines: userPreferences?.favoriteCuisines || []
            });
            source = 'ai_powered';
            if (!Array.isArray(suggestions) || suggestions.length === 0) {
                throw new Error('Invalid AI response');
            }
        }
        catch (aiError) {
            console.log('AI suggestions failed, using static fallback:', aiError);
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
const getIngredientSuggestions = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const { query = '' } = req.query;
        let suggestions = [];
        let source = 'static_fallback';
        try {
            const userPreferences = await (0, preferencesService_1.getUserPreferencesWithDefaults)(req.user.userId);
            suggestions = await geminiService_1.geminiService.suggestIngredients(query, {
                favoriteCuisines: userPreferences?.favoriteCuisines || [],
                dietaryRestrictions: userPreferences?.dietaryRestrictions || []
            });
            source = 'ai_powered';
            if (!Array.isArray(suggestions) || suggestions.length === 0) {
                throw new Error('Invalid AI response');
            }
        }
        catch (aiError) {
            console.log('AI suggestions failed, using static fallback:', aiError);
            if (query.trim()) {
                suggestions = validation_1.COMMON_INGREDIENTS.filter(ingredient => ingredient.toLowerCase().includes(query.toLowerCase()));
                if (suggestions.length === 0) {
                    suggestions = validation_1.COMMON_INGREDIENTS.slice(0, 15);
                }
            }
            else {
                suggestions = validation_1.COMMON_INGREDIENTS.slice(0, 20);
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
        console.error('Get ingredient suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get ingredient suggestions',
        });
    }
};
exports.getIngredientSuggestions = getIngredientSuggestions;
const getCuisineSuggestions = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const { query = '' } = req.query;
        let suggestions = [];
        let source = 'static_fallback';
        try {
            const userPreferences = await (0, preferencesService_1.getUserPreferencesWithDefaults)(req.user.userId);
            suggestions = await geminiService_1.geminiService.suggestCuisines(query, {
                favoriteIngredients: userPreferences?.favoriteIngredients || []
            });
            source = 'ai_powered';
            if (!Array.isArray(suggestions) || suggestions.length === 0) {
                throw new Error('Invalid AI response');
            }
        }
        catch (aiError) {
            console.log('AI suggestions failed, using static fallback:', aiError);
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
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const { query = '' } = req.query;
        let suggestions = [];
        let source = 'static_fallback';
        try {
            const userPreferences = await (0, preferencesService_1.getUserPreferencesWithDefaults)(req.user.userId);
            suggestions = await geminiService_1.geminiService.suggestDishes(query, {
                favoriteCuisines: userPreferences?.favoriteCuisines || [],
                favoriteIngredients: userPreferences?.favoriteIngredients || [],
                dietaryRestrictions: userPreferences?.dietaryRestrictions || []
            });
            source = 'ai_powered';
            if (!Array.isArray(suggestions) || suggestions.length === 0) {
                throw new Error('Invalid AI response');
            }
        }
        catch (aiError) {
            console.log('AI suggestions failed, using static fallback:', aiError);
            if (query.trim()) {
                suggestions = validation_1.COMMON_DISHES.filter(dish => dish.toLowerCase().includes(query.toLowerCase()));
                if (suggestions.length === 0) {
                    suggestions = validation_1.COMMON_DISHES.slice(0, 15);
                }
            }
            else {
                suggestions = validation_1.COMMON_DISHES.slice(0, 20);
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
        console.error('Get dish suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get dish suggestions',
        });
    }
};
exports.getDishSuggestions = getDishSuggestions;
//# sourceMappingURL=preferencesController.js.map