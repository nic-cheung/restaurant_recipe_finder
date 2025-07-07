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
  
  // New comprehensive preference fields - Enhanced with 2024-2025 trends
  nutritionalGoals?: (
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
  budgetPreference?: 'BUDGET' | 'MODERATE' | 'PREMIUM' | 'LUXURY';
  preferredMealTypes?: (
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
  availableEquipment?: (
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
  { value: 'BEGINNER', label: 'beginner' },
  { value: 'INTERMEDIATE', label: 'intermediate' },
  { value: 'ADVANCED', label: 'advanced' },
  { value: 'EXPERT', label: 'expert' },
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