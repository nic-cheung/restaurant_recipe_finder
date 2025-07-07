"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSpiceTolerance = exports.getPreferencesSummary = exports.hasRestrictionsOrAllergies = exports.getUserPreferencesWithDefaults = exports.deleteUserPreferences = exports.updateUserPreferences = exports.upsertUserPreferences = exports.getUserPreferences = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUserPreferences = async (userId) => {
    const [preferences, user] = await Promise.all([
        prisma.userPreferences.findUnique({
            where: { userId },
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: { spiceTolerance: true }
        })
    ]);
    if (!preferences) {
        return null;
    }
    return {
        ...preferences,
        spiceTolerance: (user?.spiceTolerance || 'MEDIUM'),
    };
};
exports.getUserPreferences = getUserPreferences;
const upsertUserPreferences = async (userId, preferencesData) => {
    const [preferences, user] = await Promise.all([
        prisma.userPreferences.upsert({
            where: { userId },
            update: {
                dietaryRestrictions: preferencesData.dietaryRestrictions || [],
                allergies: preferencesData.allergies || [],
                favoriteIngredients: preferencesData.favoriteIngredients || [],
                dislikedFoods: preferencesData.dislikedFoods || [],
                favoriteCuisines: preferencesData.favoriteCuisines || [],
                favoriteDishes: preferencesData.favoriteDishes || [],
                favoriteChefs: preferencesData.favoriteChefs || [],
                favoriteRestaurants: preferencesData.favoriteRestaurants || [],
                cookingSkillLevel: preferencesData.cookingSkillLevel || 'BEGINNER',
                preferredCookingTime: preferencesData.preferredCookingTime ?? null,
                servingSize: preferencesData.servingSize ?? 2,
                nutritionalGoals: (preferencesData.nutritionalGoals || []),
                budgetPreference: preferencesData.budgetPreference || 'MODERATE',
                preferredMealTypes: preferencesData.preferredMealTypes || [],
                availableEquipment: (preferencesData.availableEquipment || []),
                mealComplexity: preferencesData.mealComplexity || 'SIMPLE',
            },
            create: {
                userId,
                dietaryRestrictions: preferencesData.dietaryRestrictions || [],
                allergies: preferencesData.allergies || [],
                favoriteIngredients: preferencesData.favoriteIngredients || [],
                dislikedFoods: preferencesData.dislikedFoods || [],
                favoriteCuisines: preferencesData.favoriteCuisines || [],
                favoriteDishes: preferencesData.favoriteDishes || [],
                favoriteChefs: preferencesData.favoriteChefs || [],
                favoriteRestaurants: preferencesData.favoriteRestaurants || [],
                cookingSkillLevel: preferencesData.cookingSkillLevel || 'BEGINNER',
                preferredCookingTime: preferencesData.preferredCookingTime ?? null,
                servingSize: preferencesData.servingSize ?? 2,
                nutritionalGoals: (preferencesData.nutritionalGoals || []),
                budgetPreference: preferencesData.budgetPreference || 'MODERATE',
                preferredMealTypes: preferencesData.preferredMealTypes || [],
                availableEquipment: (preferencesData.availableEquipment || []),
                mealComplexity: preferencesData.mealComplexity || 'SIMPLE',
            },
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: { spiceTolerance: true }
        })
    ]);
    return {
        ...preferences,
        spiceTolerance: (user?.spiceTolerance || 'MEDIUM'),
    };
};
exports.upsertUserPreferences = upsertUserPreferences;
const updateUserPreferences = async (userId, updateData) => {
    const existingPreferences = await prisma.userPreferences.findUnique({
        where: { userId },
    });
    if (!existingPreferences) {
        throw new Error('User preferences not found');
    }
    const updatePayload = {};
    if (updateData.dietaryRestrictions !== undefined) {
        updatePayload.dietaryRestrictions = updateData.dietaryRestrictions;
    }
    if (updateData.allergies !== undefined) {
        updatePayload.allergies = updateData.allergies;
    }
    if (updateData.favoriteIngredients !== undefined) {
        updatePayload.favoriteIngredients = updateData.favoriteIngredients;
    }
    if (updateData.dislikedFoods !== undefined) {
        updatePayload.dislikedFoods = updateData.dislikedFoods;
    }
    if (updateData.favoriteCuisines !== undefined) {
        updatePayload.favoriteCuisines = updateData.favoriteCuisines;
    }
    if (updateData.favoriteDishes !== undefined) {
        updatePayload.favoriteDishes = updateData.favoriteDishes;
    }
    if (updateData.favoriteChefs !== undefined) {
        updatePayload.favoriteChefs = updateData.favoriteChefs;
    }
    if (updateData.favoriteRestaurants !== undefined) {
        updatePayload.favoriteRestaurants = updateData.favoriteRestaurants;
    }
    if (updateData.cookingSkillLevel !== undefined) {
        updatePayload.cookingSkillLevel = updateData.cookingSkillLevel;
    }
    if (updateData.preferredCookingTime !== undefined) {
        updatePayload.preferredCookingTime = updateData.preferredCookingTime;
    }
    if (updateData.servingSize !== undefined) {
        updatePayload.servingSize = updateData.servingSize;
    }
    if (updateData.nutritionalGoals !== undefined) {
        updatePayload.nutritionalGoals = updateData.nutritionalGoals;
    }
    if (updateData.budgetPreference !== undefined) {
        updatePayload.budgetPreference = updateData.budgetPreference;
    }
    if (updateData.preferredMealTypes !== undefined) {
        updatePayload.preferredMealTypes = updateData.preferredMealTypes;
    }
    if (updateData.availableEquipment !== undefined) {
        updatePayload.availableEquipment = updateData.availableEquipment;
    }
    if (updateData.mealComplexity !== undefined) {
        updatePayload.mealComplexity = updateData.mealComplexity;
    }
    const [preferences, user] = await Promise.all([
        prisma.userPreferences.update({
            where: { userId },
            data: updatePayload,
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: { spiceTolerance: true }
        })
    ]);
    return {
        ...preferences,
        spiceTolerance: (user?.spiceTolerance || 'MEDIUM'),
    };
};
exports.updateUserPreferences = updateUserPreferences;
const deleteUserPreferences = async (userId) => {
    await prisma.userPreferences.delete({
        where: { userId },
    });
};
exports.deleteUserPreferences = deleteUserPreferences;
const getUserPreferencesWithDefaults = async (userId) => {
    const [preferences, user] = await Promise.all([
        (0, exports.getUserPreferences)(userId),
        prisma.user.findUnique({
            where: { id: userId },
            select: { spiceTolerance: true }
        })
    ]);
    if (!preferences) {
        return {
            id: '',
            userId,
            dietaryRestrictions: [],
            allergies: [],
            favoriteIngredients: [],
            dislikedFoods: [],
            favoriteCuisines: [],
            favoriteDishes: [],
            favoriteChefs: [],
            favoriteRestaurants: [],
            cookingSkillLevel: 'BEGINNER',
            preferredCookingTime: null,
            servingSize: 2,
            nutritionalGoals: [],
            budgetPreference: 'MODERATE',
            preferredMealTypes: [],
            availableEquipment: [],
            mealComplexity: 'SIMPLE',
            spiceTolerance: (user?.spiceTolerance || 'MEDIUM'),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    return {
        ...preferences,
        spiceTolerance: (user?.spiceTolerance || 'MEDIUM'),
    };
};
exports.getUserPreferencesWithDefaults = getUserPreferencesWithDefaults;
const hasRestrictionsOrAllergies = async (userId) => {
    const preferences = await (0, exports.getUserPreferences)(userId);
    if (!preferences) {
        return false;
    }
    return (preferences.dietaryRestrictions.length > 0 ||
        preferences.allergies.length > 0 ||
        preferences.dislikedFoods.length > 0);
};
exports.hasRestrictionsOrAllergies = hasRestrictionsOrAllergies;
const getPreferencesSummary = async (userId) => {
    const preferences = await (0, exports.getUserPreferencesWithDefaults)(userId);
    return {
        restrictions: [
            ...preferences.dietaryRestrictions,
            ...preferences.allergies.map(allergy => `No ${allergy}`),
            ...preferences.dislikedFoods.map(food => `No ${food}`),
        ],
        favorites: [
            ...preferences.favoriteIngredients,
            ...preferences.favoriteCuisines.map(cuisine => `${cuisine} cuisine`),
            ...preferences.favoriteDishes.map(dish => `${dish} dish`),
            ...preferences.favoriteChefs.map(chef => `Inspired by ${chef}`),
            ...preferences.favoriteRestaurants.map(restaurant => `${restaurant} style`),
        ],
        skillLevel: preferences.cookingSkillLevel,
        maxCookingTime: preferences.preferredCookingTime,
        servingSize: preferences.servingSize || 2,
    };
};
exports.getPreferencesSummary = getPreferencesSummary;
const updateUserSpiceTolerance = async (userId, spiceTolerance) => {
    await prisma.user.update({
        where: { id: userId },
        data: { spiceTolerance },
    });
};
exports.updateUserSpiceTolerance = updateUserSpiceTolerance;
//# sourceMappingURL=preferencesService.js.map