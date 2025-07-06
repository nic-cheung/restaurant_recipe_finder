// Frontend recipe types matching backend API exactly

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  category?: string; // protein, vegetable, spice, etc.
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
}

export interface RecipeGenerationRequest {
  inspiration?: string; // Restaurant, chef, cuisine, or city
  occasion?: string; // Special occasion or context
  currentCravings?: string; // Current taste preferences
  difficulty?: Difficulty; // Recipe difficulty level
  mealType?: string; // breakfast, lunch, dinner, etc.
  additionalRequests?: string; // Free-form additional requirements
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  cookingTime: number;
  difficulty: Difficulty;
  cuisineType: string;
  inspirationSource?: string;
  servings: number;
  nutritionInfo?: NutritionInfo;
  tags: string[];
  aiPromptUsed?: {
    prompt: string;
    technicalPrompt?: string;
    instructions: string[];
  };
}

export interface SavedRecipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: RecipeIngredient[]; // JSON field from backend
  instructions: string[];
  cookingTime: number;
  difficulty: Difficulty;
  cuisineType: string | null;
  inspirationSource: string | null;
  servings: number;
  nutritionInfo: NutritionInfo | null; // JSON field from backend
  tags: string[];
  isPublic: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecipe {
  id: string;
  userId: string;
  recipeId: string;
  rating: number | null;
  notes: string | null;
  cookedDate: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeWithUserData extends SavedRecipe {
  userRecipe?: UserRecipe;
}

// API Response types
export interface RecipeGenerationResponse {
  success: boolean;
  recipe: GeneratedRecipe;
  message: string;
}

export interface RecipeSaveResponse {
  success: boolean;
  recipe: SavedRecipe;
  message: string;
}

export interface UserRecipesResponse {
  success: boolean;
  recipes: RecipeWithUserData[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface RecipeDetailsResponse {
  success: boolean;
  recipe: SavedRecipe;
}

export interface FavoriteRecipesResponse {
  success: boolean;
  recipes: RecipeWithUserData[];
}

export interface RecipeRatingRequest {
  rating: number;
  notes?: string | undefined;
}

export interface RecipeVariationRequest {
  variationType: 'healthier' | 'faster' | 'budget' | 'different_cuisine';
}

export interface RecipeVariationResponse {
  success: boolean;
  recipe: GeneratedRecipe;
  message: string;
}

export interface GenerateAndSaveResponse {
  success: boolean;
  recipe: SavedRecipe;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: string[];
}

// Form data types for UI components
export interface RecipeGeneratorFormData {
  inspiration: string;
  ingredients: string[];
  cookingTime: number | null;
  servings: number;
  difficulty: Difficulty | null;
  mealType: string;
  additionalRequests: string;
}

export interface RecipeRatingFormData {
  rating: number;
  notes: string;
}

// UI state types
export interface RecipeGeneratorState {
  isGenerating: boolean;
  isSaving: boolean;
  generatedRecipe: GeneratedRecipe | null;
  savedRecipe: SavedRecipe | null;
  error: string | null;
  formData: RecipeGeneratorFormData;
}

export interface RecipeListState {
  recipes: SavedRecipe[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface RecipeDetailsState {
  recipe: SavedRecipe | null;
  userRecipe: UserRecipe | null;
  isFavorite: boolean;
  isLoading: boolean;
  isRating: boolean;
  isToggleFavorite: boolean;
  error: string | null;
}

// Filter and search types
export interface RecipeFilters {
  cuisineType?: string;
  difficulty?: Difficulty;
  maxCookingTime?: number;
  minRating?: number;
  tags?: string[];
}

export interface RecipeSearchState {
  query: string;
  filters: RecipeFilters;
  results: SavedRecipe[];
  isSearching: boolean;
  error: string | null;
}

// Constants for dropdowns and validation
export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
  { value: 'EXPERT', label: 'Expert' },
];

export const MEAL_TYPE_OPTIONS = [
  'Breakfast',
  'Lunch', 
  'Dinner',
  'Snack',
  'Dessert',
  'Appetizer',
  'Brunch',
];

export const VARIATION_TYPES: { value: string; label: string; description: string }[] = [
  { 
    value: 'healthier', 
    label: 'Healthier', 
    description: 'Reduce calories and add nutritious ingredients' 
  },
  { 
    value: 'faster', 
    label: 'Faster', 
    description: 'Reduce cooking time and simplify steps' 
  },
  { 
    value: 'budget', 
    label: 'Budget-Friendly', 
    description: 'Use cheaper ingredients and alternatives' 
  },
  { 
    value: 'different_cuisine', 
    label: 'Different Cuisine', 
    description: 'Transform into a different cuisine style' 
  },
];

// Utility types
export type RecipeSortBy = 'createdAt' | 'title' | 'cookingTime' | 'difficulty';
export type SortOrder = 'asc' | 'desc'; 