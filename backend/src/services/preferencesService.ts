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
  favoriteDishes: string[];
  favoriteChefs: string[];
  favoriteRestaurants: string[];
  cookingSkillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  preferredCookingTime: number | null;
  servingSize: number | null;
  
  // New comprehensive preference fields
  nutritionalGoals: ('WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'HEART_HEALTHY' | 'DIABETIC_FRIENDLY' | 'LOW_SODIUM' | 'HIGH_PROTEIN' | 'LOW_CARB' | 'HIGH_FIBER')[];
  budgetPreference: 'BUDGET' | 'MODERATE' | 'PREMIUM' | 'LUXURY';
  preferredMealTypes: ('BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS' | 'DESSERTS' | 'APPETIZERS' | 'BRUNCH' | 'LATE_NIGHT')[];
  availableEquipment: ('OVEN' | 'STOVETOP' | 'MICROWAVE' | 'GRILL' | 'AIR_FRYER' | 'SLOW_COOKER' | 'PRESSURE_COOKER' | 'BLENDER' | 'FOOD_PROCESSOR' | 'STAND_MIXER' | 'TOASTER_OVEN' | 'RICE_COOKER' | 'STEAMER' | 'DEEP_FRYER' | 'SOUS_VIDE')[];
  mealComplexity: 'ONE_POT' | 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'GOURMET';
  
  // Spice tolerance from User model
  spiceTolerance: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME';
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get user preferences by user ID
 */
export const getUserPreferences = async (userId: string): Promise<UserPreferencesResponse | null> => {
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
    spiceTolerance: (user?.spiceTolerance || 'MEDIUM') as 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME',
  } as UserPreferencesResponse;
};

/**
 * Create or update user preferences
 */
export const upsertUserPreferences = async (
  userId: string,
  preferencesData: UserPreferencesInput
): Promise<UserPreferencesResponse> => {
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
        
        // New comprehensive preference fields
        nutritionalGoals: preferencesData.nutritionalGoals || [],
        budgetPreference: preferencesData.budgetPreference || 'MODERATE',
        preferredMealTypes: preferencesData.preferredMealTypes || [],
        availableEquipment: preferencesData.availableEquipment || [],
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
        
        // New comprehensive preference fields
        nutritionalGoals: preferencesData.nutritionalGoals || [],
        budgetPreference: preferencesData.budgetPreference || 'MODERATE',
        preferredMealTypes: preferencesData.preferredMealTypes || [],
        availableEquipment: preferencesData.availableEquipment || [],
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
    spiceTolerance: (user?.spiceTolerance || 'MEDIUM') as 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME',
  };
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
  
  // New comprehensive preference fields
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

  // Update only the provided fields
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
    spiceTolerance: (user?.spiceTolerance || 'MEDIUM') as 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME',
  };
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
 * Get user preferences with defaults if not found, including spice tolerance from User model
 */
export const getUserPreferencesWithDefaults = async (
  userId: string
): Promise<UserPreferencesResponse> => {
  // Get both preferences and user data
  const [preferences, user] = await Promise.all([
    getUserPreferences(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { spiceTolerance: true }
    })
  ]);
  
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
      favoriteDishes: [],
      favoriteChefs: [],
      favoriteRestaurants: [],
      cookingSkillLevel: 'BEGINNER',
      preferredCookingTime: null,
      servingSize: 2,
      
      // New comprehensive preference fields with defaults
      nutritionalGoals: [],
      budgetPreference: 'MODERATE',
      preferredMealTypes: [],
      availableEquipment: [],
      mealComplexity: 'SIMPLE',
      
      // Spice tolerance from User model
      spiceTolerance: (user?.spiceTolerance || 'MEDIUM') as 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME',
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    ...preferences,
    spiceTolerance: (user?.spiceTolerance || 'MEDIUM') as 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME',
  };
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
      ...preferences.favoriteDishes.map(dish => `${dish} dish`),
      ...preferences.favoriteChefs.map(chef => `Inspired by ${chef}`),
      ...preferences.favoriteRestaurants.map(restaurant => `${restaurant} style`),
    ],
    skillLevel: preferences.cookingSkillLevel,
    maxCookingTime: preferences.preferredCookingTime,
    servingSize: preferences.servingSize || 2,
  };
};

/**
 * Update user spice tolerance
 */
export const updateUserSpiceTolerance = async (
  userId: string,
  spiceTolerance: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME'
): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: { spiceTolerance },
  });
}; 