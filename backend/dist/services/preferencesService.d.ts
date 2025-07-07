import { UserPreferencesInput, UpdateUserPreferencesInput } from '../utils/validation';
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
    nutritionalGoals: ('WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'HEART_HEALTHY' | 'DIABETIC_FRIENDLY' | 'LOW_SODIUM' | 'HIGH_PROTEIN' | 'LOW_CARB' | 'HIGH_FIBER' | 'ANTI_INFLAMMATORY' | 'GUT_HEALTH' | 'HORMONE_BALANCE' | 'ENERGY_BOOST' | 'IMMUNE_SUPPORT' | 'BRAIN_HEALTH' | 'LONGEVITY' | 'METABOLISM_BOOST' | 'STRESS_REDUCTION' | 'SLEEP_IMPROVEMENT' | 'INTERMITTENT_FASTING' | 'PLANT_BASED' | 'MEDITERRANEAN' | 'KETO_FRIENDLY' | 'PALEO_FRIENDLY' | 'WHOLE30_COMPATIBLE' | 'ATHLETIC_PERFORMANCE' | 'POST_WORKOUT_RECOVERY' | 'PRENATAL_NUTRITION' | 'HEALTHY_AGING' | 'DETOX_SUPPORT' | 'BONE_HEALTH' | 'SKIN_HEALTH' | 'DIGESTIVE_HEALTH')[];
    budgetPreference: 'BUDGET' | 'MODERATE' | 'PREMIUM' | 'LUXURY';
    preferredMealTypes: ('BREAKFAST' | 'LUNCH' | 'DINNER' | 'BRUNCH' | 'SNACKS' | 'APPETIZERS' | 'LATE_NIGHT' | 'QUICK_BITES' | 'FINGER_FOODS' | 'DESSERTS' | 'BAKED_GOODS' | 'FROZEN_TREATS' | 'HOLIDAY_SWEETS' | 'SMOOTHIES' | 'COCKTAILS' | 'HOT_BEVERAGES' | 'FRESH_JUICES' | 'MEAL_PREP' | 'BATCH_COOKING' | 'FREEZER_MEALS' | 'LUNCHBOX_MEALS' | 'PARTY_FOOD' | 'HOLIDAY_MEALS' | 'CELEBRATION_CAKES' | 'PICNIC_FOOD' | 'BBQ_GRILLING' | 'POST_WORKOUT' | 'DETOX_MEALS' | 'COMFORT_FOOD' | 'ENERGY_BOOSTERS' | 'STREET_FOOD' | 'TAPAS_SMALL_PLATES' | 'FAMILY_STYLE' | 'BUFFET_STYLE' | 'KETO_MEALS' | 'VEGAN_MEALS' | 'GLUTEN_FREE' | 'LOW_CARB' | 'HIGH_PROTEIN' | 'ONE_POT_MEALS' | 'NO_COOK_MEALS' | 'SLOW_COOKER' | 'AIR_FRYER' | 'GRILLED_MEALS')[];
    availableEquipment: ('OVEN' | 'STOVETOP' | 'MICROWAVE' | 'GRILL' | 'OUTDOOR_SMOKER' | 'PIZZA_OVEN' | 'FIRE_PIT' | 'AIR_FRYER' | 'CONVECTION_OVEN' | 'TOASTER_OVEN' | 'COUNTERTOP_CONVECTION' | 'SLOW_COOKER' | 'PRESSURE_COOKER' | 'INSTANT_POT' | 'DUTCH_OVEN' | 'TAGINE' | 'BLENDER' | 'HIGH_SPEED_BLENDER' | 'IMMERSION_BLENDER' | 'FOOD_PROCESSOR' | 'STAND_MIXER' | 'HAND_MIXER' | 'MORTAR_PESTLE' | 'RICE_COOKER' | 'STEAMER' | 'BAMBOO_STEAMER' | 'ELECTRIC_STEAMER' | 'DEEP_FRYER' | 'SOUS_VIDE' | 'DEHYDRATOR' | 'FERMENTATION_CROCK' | 'MANDOLINE_SLICER' | 'SPIRALIZER' | 'JUICER' | 'ESPRESSO_MACHINE' | 'BREAD_MAKER' | 'PASTA_MACHINE' | 'ICE_CREAM_MAKER' | 'YOGURT_MAKER' | 'WAFFLE_MAKER' | 'PANCAKE_GRIDDLE' | 'CREPE_MAKER' | 'FONDUE_POT' | 'INDOOR_GRILL' | 'PANINI_PRESS' | 'SANDWICH_MAKER' | 'ELECTRIC_WOK' | 'INDUCTION_COOKTOP' | 'PORTABLE_BURNER' | 'KITCHEN_SCALE' | 'DOUGH_MIXER' | 'PROOFING_BASKET' | 'BAKING_STONE' | 'SHEET_PAN' | 'CAST_IRON_SKILLET' | 'CARBON_STEEL_PAN' | 'COPPER_COOKWARE' | 'SMART_THERMOMETER' | 'VACUUM_SEALER' | 'SMOKING_GUN' | 'CULINARY_TORCH' | 'NITROUS_OXIDE_WHIPPER' | 'CHEF_KNIFE' | 'CUTTING_BOARD' | 'MIXING_BOWLS' | 'MEASURING_CUPS' | 'KITCHEN_THERMOMETER')[];
    mealComplexity: 'ONE_POT' | 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'GOURMET';
    spiceTolerance: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME';
    createdAt: Date;
    updatedAt: Date;
}
export declare const getUserPreferences: (userId: string) => Promise<UserPreferencesResponse | null>;
export declare const upsertUserPreferences: (userId: string, preferencesData: UserPreferencesInput) => Promise<UserPreferencesResponse>;
export declare const updateUserPreferences: (userId: string, updateData: UpdateUserPreferencesInput) => Promise<UserPreferencesResponse>;
export declare const deleteUserPreferences: (userId: string) => Promise<void>;
export declare const getUserPreferencesWithDefaults: (userId: string) => Promise<UserPreferencesResponse>;
export declare const hasRestrictionsOrAllergies: (userId: string) => Promise<boolean>;
export declare const getPreferencesSummary: (userId: string) => Promise<{
    restrictions: string[];
    favorites: string[];
    skillLevel: string;
    maxCookingTime: number | null;
    servingSize: number;
}>;
export declare const updateUserSpiceTolerance: (userId: string, spiceTolerance: "MILD" | "MEDIUM" | "HOT" | "EXTREME") => Promise<void>;
//# sourceMappingURL=preferencesService.d.ts.map