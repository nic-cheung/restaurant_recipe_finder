import { PrismaClient } from '@prisma/client';
import { UserPreferencesInput, UpdateUserPreferencesInput } from '../utils/validation';

const prisma = new PrismaClient();

export interface UserPreferencesResponse {
  id: string;
  userId: string;
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteIngredients: string[];
  dislikedFoods: string[];
  favoriteCuisines: string[];
  cookingSkillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  preferredCookingTime: number | null;
  servingSize: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get user preferences by user ID
 */
export const getUserPreferences = async (userId: string): Promise<UserPreferencesResponse | null> => {
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  return preferences;
};

/**
 * Create or update user preferences
 */
export const upsertUserPreferences = async (
  userId: string,
  preferencesData: UserPreferencesInput
): Promise<UserPreferencesResponse> => {
  const preferences = await prisma.userPreferences.upsert({
    where: { userId },
    update: {
      dietaryRestrictions: preferencesData.dietaryRestrictions || [],
      allergies: preferencesData.allergies || [],
      favoriteIngredients: preferencesData.favoriteIngredients || [],
      dislikedFoods: preferencesData.dislikedFoods || [],
      favoriteCuisines: preferencesData.favoriteCuisines || [],
      cookingSkillLevel: preferencesData.cookingSkillLevel || 'BEGINNER',
      preferredCookingTime: preferencesData.preferredCookingTime || null,
      servingSize: preferencesData.servingSize || 2,
    },
    create: {
      userId,
      dietaryRestrictions: preferencesData.dietaryRestrictions || [],
      allergies: preferencesData.allergies || [],
      favoriteIngredients: preferencesData.favoriteIngredients || [],
      dislikedFoods: preferencesData.dislikedFoods || [],
      favoriteCuisines: preferencesData.favoriteCuisines || [],
      cookingSkillLevel: preferencesData.cookingSkillLevel || 'BEGINNER',
      preferredCookingTime: preferencesData.preferredCookingTime || null,
      servingSize: preferencesData.servingSize || 2,
    },
  });

  return preferences;
};

/**
 * Update user preferences (partial update)
 */
export const updateUserPreferences = async (
  userId: string,
  updateData: UpdateUserPreferencesInput
): Promise<UserPreferencesResponse> => {
  // First check if preferences exist
  const existingPreferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  if (!existingPreferences) {
    throw new Error('User preferences not found');
  }

  // Build update data with only defined properties
  const updatePayload: any = {};
  
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
  if (updateData.cookingSkillLevel !== undefined) {
    updatePayload.cookingSkillLevel = updateData.cookingSkillLevel;
  }
  if (updateData.preferredCookingTime !== undefined) {
    updatePayload.preferredCookingTime = updateData.preferredCookingTime;
  }
  if (updateData.servingSize !== undefined) {
    updatePayload.servingSize = updateData.servingSize;
  }

  // Update only the provided fields
  const preferences = await prisma.userPreferences.update({
    where: { userId },
    data: updatePayload,
  });

  return preferences;
};

/**
 * Delete user preferences
 */
export const deleteUserPreferences = async (userId: string): Promise<void> => {
  await prisma.userPreferences.delete({
    where: { userId },
  });
};

/**
 * Get user preferences with defaults if not found
 */
export const getUserPreferencesWithDefaults = async (
  userId: string
): Promise<UserPreferencesResponse> => {
  const preferences = await getUserPreferences(userId);
  
  if (!preferences) {
    // Return default preferences if none exist
    return {
      id: '',
      userId,
      dietaryRestrictions: [],
      allergies: [],
      favoriteIngredients: [],
      dislikedFoods: [],
      favoriteCuisines: [],
      cookingSkillLevel: 'BEGINNER',
      preferredCookingTime: null,
      servingSize: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return preferences;
};

/**
 * Check if user has any dietary restrictions
 */
export const hasRestrictionsOrAllergies = async (userId: string): Promise<boolean> => {
  const preferences = await getUserPreferences(userId);
  
  if (!preferences) {
    return false;
  }

  return (
    preferences.dietaryRestrictions.length > 0 ||
    preferences.allergies.length > 0 ||
    preferences.dislikedFoods.length > 0
  );
};

/**
 * Get preferences summary for recipe generation
 */
export const getPreferencesSummary = async (userId: string): Promise<{
  restrictions: string[];
  favorites: string[];
  skillLevel: string;
  maxCookingTime: number | null;
  servingSize: number;
}> => {
  const preferences = await getUserPreferencesWithDefaults(userId);
  
  return {
    restrictions: [
      ...preferences.dietaryRestrictions,
      ...preferences.allergies.map(allergy => `No ${allergy}`),
      ...preferences.dislikedFoods.map(food => `No ${food}`),
    ],
    favorites: [
      ...preferences.favoriteIngredients,
      ...preferences.favoriteCuisines.map(cuisine => `${cuisine} cuisine`),
    ],
    skillLevel: preferences.cookingSkillLevel,
    maxCookingTime: preferences.preferredCookingTime,
    servingSize: preferences.servingSize || 2,
  };
}; 