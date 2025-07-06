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
    nutritionalGoals: ('WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'HEART_HEALTHY' | 'DIABETIC_FRIENDLY' | 'LOW_SODIUM' | 'HIGH_PROTEIN' | 'LOW_CARB' | 'HIGH_FIBER')[];
    budgetPreference: 'BUDGET' | 'MODERATE' | 'PREMIUM' | 'LUXURY';
    preferredMealTypes: ('BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS' | 'DESSERTS' | 'APPETIZERS' | 'BRUNCH' | 'LATE_NIGHT')[];
    availableEquipment: ('OVEN' | 'STOVETOP' | 'MICROWAVE' | 'GRILL' | 'AIR_FRYER' | 'SLOW_COOKER' | 'PRESSURE_COOKER' | 'BLENDER' | 'FOOD_PROCESSOR' | 'STAND_MIXER' | 'TOASTER_OVEN' | 'RICE_COOKER' | 'STEAMER' | 'DEEP_FRYER' | 'SOUS_VIDE')[];
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