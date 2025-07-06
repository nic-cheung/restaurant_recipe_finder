export interface UserPreferences {
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
  
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPreferences {
  dietaryRestrictions?: string[];
  allergies?: string[];
  favoriteIngredients?: string[];
  dislikedFoods?: string[];
  favoriteCuisines?: string[];
  favoriteDishes?: string[];
  favoriteChefs?: string[];
  favoriteRestaurants?: string[];
  cookingSkillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  preferredCookingTime?: number | null;
  servingSize?: number | null;
  
  // New comprehensive preference fields
  nutritionalGoals?: ('WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'HEART_HEALTHY' | 'DIABETIC_FRIENDLY' | 'LOW_SODIUM' | 'HIGH_PROTEIN' | 'LOW_CARB' | 'HIGH_FIBER')[];
  budgetPreference?: 'BUDGET' | 'MODERATE' | 'PREMIUM' | 'LUXURY';
  preferredMealTypes?: ('BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS' | 'DESSERTS' | 'APPETIZERS' | 'BRUNCH' | 'LATE_NIGHT')[];
  availableEquipment?: ('OVEN' | 'STOVETOP' | 'MICROWAVE' | 'GRILL' | 'AIR_FRYER' | 'SLOW_COOKER' | 'PRESSURE_COOKER' | 'BLENDER' | 'FOOD_PROCESSOR' | 'STAND_MIXER' | 'TOASTER_OVEN' | 'RICE_COOKER' | 'STEAMER' | 'DEEP_FRYER' | 'SOUS_VIDE')[];
  mealComplexity?: 'ONE_POT' | 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'GOURMET';
  
  // Spice tolerance from User model
  spiceTolerance?: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME';
}

export interface PreferencesSummary {
  restrictions: string[];
  favorites: string[];
  skillLevel: string;
  maxCookingTime: number | null;
  servingSize: number;
}

export interface PreferencesOptions {
  dietaryRestrictions: readonly string[];
  allergies: readonly string[];
  cuisines: readonly string[];
  ingredients: readonly string[];
  dishes: readonly string[];
  skillLevels: readonly string[];
  
  // New comprehensive preference options
  nutritionalGoals: readonly string[];
  budgetPreferences: readonly string[];
  mealTypes: readonly string[];
  cookingEquipment: readonly string[];
  mealComplexity: readonly string[];
  spiceTolerance: readonly string[];
}

export interface PreferencesResponse {
  success: boolean;
  data: {
    preferences: UserPreferences;
  };
  message?: string;
}

export interface PreferencesSummaryResponse {
  success: boolean;
  data: {
    summary: PreferencesSummary;
  };
}

export interface PreferencesOptionsResponse {
  success: boolean;
  data: PreferencesOptions;
}

export interface PreferencesFormData {
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteIngredients: string[];
  dislikedFoods: string[];
  favoriteCuisines: string[];
  favoriteDishes: string[];
  favoriteChefs: string[];
  favoriteRestaurants: string[];
  cookingSkillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  preferredCookingTime: string; // Form field as string
  servingSize: string; // Form field as string
  
  // New comprehensive preference fields
  nutritionalGoals: string[];
  budgetPreference: 'BUDGET' | 'MODERATE' | 'PREMIUM' | 'LUXURY';
  preferredMealTypes: string[];
  availableEquipment: string[];
  mealComplexity: 'ONE_POT' | 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'GOURMET';
  
  // Spice tolerance from User model
  spiceTolerance: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME';
}

// Skill level options for dropdowns
export const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'EXPERT', label: 'Expert' },
] as const;

// Default preferences for new users
export const DEFAULT_PREFERENCES: Partial<UserPreferences> = {
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
  
  // Spice tolerance default
  spiceTolerance: 'MEDIUM',
}; 