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
  
  // New comprehensive preference fields - Enhanced with 2024-2025 trends
  nutritionalGoals: (
    // Core Goals
    'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' |
    // Health Conditions
    'HEART_HEALTHY' | 'DIABETIC_FRIENDLY' | 'LOW_SODIUM' | 'HIGH_PROTEIN' | 'LOW_CARB' | 'HIGH_FIBER' |
    // Popular 2024-2025 Health Trends
    'ANTI_INFLAMMATORY' | 'GUT_HEALTH' | 'HORMONE_BALANCE' | 'ENERGY_BOOST' | 'IMMUNE_SUPPORT' | 'BRAIN_HEALTH' | 'LONGEVITY' | 'METABOLISM_BOOST' | 'STRESS_REDUCTION' | 'SLEEP_IMPROVEMENT' |
    // Specific Dietary Approaches
    'INTERMITTENT_FASTING' | 'PLANT_BASED' | 'MEDITERRANEAN' | 'KETO_FRIENDLY' | 'PALEO_FRIENDLY' | 'WHOLE30_COMPATIBLE' |
    // Performance & Lifestyle
    'ATHLETIC_PERFORMANCE' | 'POST_WORKOUT_RECOVERY' | 'PRENATAL_NUTRITION' | 'HEALTHY_AGING' | 'DETOX_SUPPORT' | 'BONE_HEALTH' | 'SKIN_HEALTH' | 'DIGESTIVE_HEALTH'
  )[];
  budgetPreference: 'BUDGET' | 'MODERATE' | 'PREMIUM' | 'LUXURY';
  preferredMealTypes: (
    // Traditional Meals
    'BREAKFAST' | 'LUNCH' | 'DINNER' | 'BRUNCH' |
    // Snacks & Light Meals
    'SNACKS' | 'APPETIZERS' | 'LATE_NIGHT' | 'QUICK_BITES' | 'FINGER_FOODS' |
    // Desserts & Sweets
    'DESSERTS' | 'BAKED_GOODS' | 'FROZEN_TREATS' | 'HOLIDAY_SWEETS' |
    // Beverages
    'SMOOTHIES' | 'COCKTAILS' | 'HOT_BEVERAGES' | 'FRESH_JUICES' |
    // Meal Prep & Planning
    'MEAL_PREP' | 'BATCH_COOKING' | 'FREEZER_MEALS' | 'LUNCHBOX_MEALS' |
    // Special Occasions
    'PARTY_FOOD' | 'HOLIDAY_MEALS' | 'CELEBRATION_CAKES' | 'PICNIC_FOOD' | 'BBQ_GRILLING' |
    // Health & Wellness
    'POST_WORKOUT' | 'DETOX_MEALS' | 'COMFORT_FOOD' | 'ENERGY_BOOSTERS' |
    // International & Fusion
    'STREET_FOOD' | 'TAPAS_SMALL_PLATES' | 'FAMILY_STYLE' | 'BUFFET_STYLE' |
    // Dietary Specific
    'KETO_MEALS' | 'VEGAN_MEALS' | 'GLUTEN_FREE' | 'LOW_CARB' | 'HIGH_PROTEIN' |
    // Cooking Methods
    'ONE_POT_MEALS' | 'NO_COOK_MEALS' | 'SLOW_COOKER' | 'AIR_FRYER' | 'GRILLED_MEALS'
  )[];
  availableEquipment: (
    // Basic Equipment
    'OVEN' | 'STOVETOP' | 'MICROWAVE' |
    // Grilling & Outdoor
    'GRILL' | 'OUTDOOR_SMOKER' | 'PIZZA_OVEN' | 'FIRE_PIT' |
    // Modern Appliances
    'AIR_FRYER' | 'CONVECTION_OVEN' | 'TOASTER_OVEN' | 'COUNTERTOP_CONVECTION' |
    // Slow & Pressure Cooking
    'SLOW_COOKER' | 'PRESSURE_COOKER' | 'INSTANT_POT' | 'DUTCH_OVEN' | 'TAGINE' |
    // Food Processing
    'BLENDER' | 'HIGH_SPEED_BLENDER' | 'IMMERSION_BLENDER' | 'FOOD_PROCESSOR' | 'STAND_MIXER' | 'HAND_MIXER' | 'MORTAR_PESTLE' |
    // Specialized Cooking
    'RICE_COOKER' | 'STEAMER' | 'BAMBOO_STEAMER' | 'ELECTRIC_STEAMER' | 'DEEP_FRYER' | 'SOUS_VIDE' | 'DEHYDRATOR' | 'FERMENTATION_CROCK' |
    // Professional & Specialty Tools
    'MANDOLINE_SLICER' | 'SPIRALIZER' | 'JUICER' | 'ESPRESSO_MACHINE' | 'BREAD_MAKER' | 'PASTA_MACHINE' | 'ICE_CREAM_MAKER' | 'YOGURT_MAKER' | 'WAFFLE_MAKER' | 'PANCAKE_GRIDDLE' | 'CREPE_MAKER' | 'FONDUE_POT' |
    // Grilling & Specialty
    'INDOOR_GRILL' | 'PANINI_PRESS' | 'SANDWICH_MAKER' | 'ELECTRIC_WOK' | 'INDUCTION_COOKTOP' | 'PORTABLE_BURNER' |
    // Baking & Pastry
    'KITCHEN_SCALE' | 'DOUGH_MIXER' | 'PROOFING_BASKET' | 'BAKING_STONE' | 'SHEET_PAN' | 'CAST_IRON_SKILLET' | 'CARBON_STEEL_PAN' | 'COPPER_COOKWARE' |
    // Modern Tech
    'SMART_THERMOMETER' | 'VACUUM_SEALER' | 'SMOKING_GUN' | 'CULINARY_TORCH' | 'NITROUS_OXIDE_WHIPPER' |
    // Essential Tools
    'CHEF_KNIFE' | 'CUTTING_BOARD' | 'MIXING_BOWLS' | 'MEASURING_CUPS' | 'KITCHEN_THERMOMETER'
  )[];
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
        nutritionalGoals: (preferencesData.nutritionalGoals || []) as any,
        budgetPreference: preferencesData.budgetPreference || 'MODERATE',
        preferredMealTypes: preferencesData.preferredMealTypes || [],
        availableEquipment: (preferencesData.availableEquipment || []) as any,
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
        nutritionalGoals: (preferencesData.nutritionalGoals || []) as any,
        budgetPreference: preferencesData.budgetPreference || 'MODERATE',
        preferredMealTypes: preferencesData.preferredMealTypes || [],
        availableEquipment: (preferencesData.availableEquipment || []) as any,
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