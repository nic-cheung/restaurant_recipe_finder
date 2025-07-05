export interface UserPreferences {
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
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPreferences {
  dietaryRestrictions?: string[];
  allergies?: string[];
  favoriteIngredients?: string[];
  dislikedFoods?: string[];
  favoriteCuisines?: string[];
  cookingSkillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  preferredCookingTime?: number | null;
  servingSize?: number | null;
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
  skillLevels: readonly string[];
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
  cookingSkillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  preferredCookingTime: string; // Form field as string
  servingSize: string; // Form field as string
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
  cookingSkillLevel: 'BEGINNER',
  preferredCookingTime: null,
  servingSize: 2,
}; 