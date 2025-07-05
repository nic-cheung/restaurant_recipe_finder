// Frontend recipe types matching backend API

export interface GenerateRecipeRequest {
  inspiration: string;
  inspirationType: 'restaurant' | 'chef' | 'cuisine' | 'city';
  additionalRequests?: string;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number; // in minutes
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  servings: number;
  cuisineType: string;
  inspirationSource: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  tips?: string[];
  substitutions?: string[];
}

export interface SaveRecipeRequest {
  recipeData: GeneratedRecipe;
  rating?: number;
  notes?: string;
}

export interface UpdateRecipeRatingRequest {
  rating: number;
  notes?: string;
}

export interface RecipeVariationRequest {
  variationRequest: string;
}

export interface IngredientSubstitutionRequest {
  ingredient: string;
  dietaryRestrictions?: string[];
}

// API Response types
export interface RecipeResponse {
  success: boolean;
  data: {
    recipe: GeneratedRecipe;
  };
  message?: string;
}

export interface SavedRecipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  cuisineType?: string;
  inspirationSource?: string;
  servings: number;
  nutritionInfo?: any;
  tags: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecipe {
  id: string;
  rating?: number;
  notes?: string;
  cookedDate?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedRecipeResponse {
  success: boolean;
  data: {
    recipe: SavedRecipe;
    userRecipe: UserRecipe;
  };
  message?: string;
}

export interface RecipeWithUserData extends SavedRecipe {
  userRecipe: UserRecipe;
}

export interface UserRecipesResponse {
  success: boolean;
  data: {
    recipes: RecipeWithUserData[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface RecipeDetailsResponse {
  success: boolean;
  data: {
    recipe: SavedRecipe;
    userRecipe?: UserRecipe;
    isFavorite: boolean;
  };
}

export interface SubstitutionsResponse {
  success: boolean;
  data: {
    substitutions: string[];
  };
}

export interface FavoriteResponse {
  success: boolean;
  data: {
    isFavorite: boolean;
  };
  message?: string;
}

// Query options for fetching recipes
export interface RecipeQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'cookingTime' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Form data types for UI components
export interface RecipeGeneratorFormData {
  inspiration: string;
  inspirationType: 'restaurant' | 'chef' | 'cuisine' | 'city';
  additionalRequests: string;
}

export interface RecipeRatingFormData {
  rating: number;
  notes: string;
}

export interface RecipeVariationFormData {
  variationRequest: string;
}

export interface IngredientSubstitutionFormData {
  ingredient: string;
  dietaryRestrictions: string[];
}

// UI state types
export interface RecipeGeneratorState {
  isGenerating: boolean;
  generatedRecipe: GeneratedRecipe | null;
  error: string | null;
  isLoading: boolean;
}

export interface RecipeListState {
  recipes: RecipeWithUserData[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RecipeDetailsState {
  recipe: SavedRecipe | null;
  userRecipe: UserRecipe | null;
  isFavorite: boolean;
  isLoading: boolean;
  error: string | null;
}

// Filter and search types
export interface RecipeFilters {
  cuisineType?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  maxCookingTime?: number;
  minRating?: number;
  inspirationType?: 'restaurant' | 'chef' | 'cuisine' | 'city';
  isFavorite?: boolean;
}

export interface RecipeSearchState {
  query: string;
  filters: RecipeFilters;
  results: RecipeWithUserData[];
  isSearching: boolean;
  error: string | null;
}

// Inspiration suggestions for the UI
export interface InspirationSuggestion {
  type: 'restaurant' | 'chef' | 'cuisine' | 'city';
  name: string;
  description: string;
  popular?: boolean;
}

export const INSPIRATION_SUGGESTIONS: InspirationSuggestion[] = [
  // Restaurants
  { type: 'restaurant', name: 'Noma', description: 'Nordic cuisine pioneer', popular: true },
  { type: 'restaurant', name: 'The French Laundry', description: 'Fine dining excellence', popular: true },
  { type: 'restaurant', name: 'Osteria Francescana', description: 'Italian culinary artistry' },
  { type: 'restaurant', name: 'Eleven Madison Park', description: 'Plant-based fine dining' },
  { type: 'restaurant', name: 'Disfrutar', description: 'Creative Mediterranean' },
  
  // Chefs
  { type: 'chef', name: 'Gordon Ramsay', description: 'British culinary icon', popular: true },
  { type: 'chef', name: 'Julia Child', description: 'French cooking legend', popular: true },
  { type: 'chef', name: 'Massimo Bottura', description: 'Italian innovation master' },
  { type: 'chef', name: 'René Redzepi', description: 'Nordic cuisine pioneer' },
  { type: 'chef', name: 'Yotam Ottolenghi', description: 'Middle Eastern flavors' },
  
  // Cuisines
  { type: 'cuisine', name: 'Italian', description: 'Pasta, pizza, and more', popular: true },
  { type: 'cuisine', name: 'Japanese', description: 'Sushi, ramen, and tradition', popular: true },
  { type: 'cuisine', name: 'French', description: 'Classic techniques and flavors', popular: true },
  { type: 'cuisine', name: 'Thai', description: 'Spicy and aromatic dishes' },
  { type: 'cuisine', name: 'Mexican', description: 'Bold flavors and spices' },
  { type: 'cuisine', name: 'Indian', description: 'Complex spices and curries' },
  { type: 'cuisine', name: 'Mediterranean', description: 'Fresh and healthy ingredients' },
  
  // Cities
  { type: 'city', name: 'Paris', description: 'City of culinary excellence', popular: true },
  { type: 'city', name: 'Tokyo', description: 'Culinary innovation hub', popular: true },
  { type: 'city', name: 'New York', description: 'Diverse food scene' },
  { type: 'city', name: 'Bangkok', description: 'Street food paradise' },
  { type: 'city', name: 'Istanbul', description: 'East meets West cuisine' },
  { type: 'city', name: 'Lima', description: 'South American fusion' },
];

// Utility types
export type RecipeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type InspirationTypes = 'restaurant' | 'chef' | 'cuisine' | 'city';
export type SortOptions = 'createdAt' | 'rating' | 'cookingTime' | 'title';
export type SortOrder = 'asc' | 'desc'; 