import { Recipe, UserRecipe, User, UserPreferences } from '@prisma/client';
import { RecipeGenerationRequest, GeneratedRecipe } from '../services/openaiService';

// Re-export types from OpenAI service
export { RecipeGenerationRequest, GeneratedRecipe };

// API Request types
export interface GenerateRecipeRequest {
  inspiration: string;
  inspirationType: 'restaurant' | 'chef' | 'cuisine' | 'city';
  additionalRequests?: string;
}

export interface SaveRecipeRequest {
  recipeData: GeneratedRecipe;
  rating?: number;
  notes?: string;
}

export interface UpdateRecipeRatingRequest {
  recipeId: string;
  rating: number;
  notes?: string;
}

export interface RecipeVariationRequest {
  recipeId: string;
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

export interface SavedRecipeResponse {
  success: boolean;
  data: {
    recipe: Recipe;
    userRecipe: UserRecipe;
  };
  message?: string;
}

export interface UserRecipesResponse {
  success: boolean;
  data: {
    recipes: (Recipe & {
      userRecipe: UserRecipe;
    })[];
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
    recipe: Recipe;
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

// Database query types
export interface RecipeFilters {
  cuisineType?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  maxCookingTime?: number;
  minRating?: number;
  inspirationType?: 'restaurant' | 'chef' | 'cuisine' | 'city';
  tags?: string[];
  isFavorite?: boolean;
}

export interface RecipeQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'cookingTime' | 'title';
  sortOrder?: 'asc' | 'desc';
  filters?: RecipeFilters;
}

// Extended types for joined queries
export interface RecipeWithUserData extends Recipe {
  userRecipe?: UserRecipe;
  isFavorite: boolean;
  averageRating?: number;
  totalRatings?: number;
}

export interface UserWithPreferences extends User {
  preferences?: UserPreferences;
}

// Validation schemas (for Zod)
export interface RecipeValidationSchema {
  inspiration: string;
  inspirationType: 'restaurant' | 'chef' | 'cuisine' | 'city';
  additionalRequests?: string;
}

// Error types
export interface RecipeError {
  code: string;
  message: string;
  details?: any;
}

// Statistics types
export interface RecipeStats {
  totalRecipes: number;
  totalUserRecipes: number;
  favoriteRecipes: number;
  averageRating: number;
  mostPopularCuisine: string;
  recentlyGenerated: number;
}

// Search types
export interface RecipeSearchRequest {
  query: string;
  filters?: RecipeFilters;
  options?: RecipeQueryOptions;
}

export interface RecipeSearchResponse {
  success: boolean;
  data: {
    recipes: RecipeWithUserData[];
    total: number;
    query: string;
    filters: RecipeFilters;
  };
}

// Nutrition types (matching OpenAI service)
export interface NutritionInfo {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
}

// Recipe creation types for manual entry
export interface CreateRecipeRequest {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  cuisineType?: string;
  servings: number;
  tags?: string[];
  nutritionInfo?: NutritionInfo;
  isPublic?: boolean;
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {
  id: string;
} 