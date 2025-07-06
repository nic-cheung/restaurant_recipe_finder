import { UserPreferences, User } from '@prisma/client';
export interface RecipeGenerationRequest {
    inspiration: string;
    inspirationType: 'restaurant' | 'chef' | 'cuisine' | 'city';
    userPreferences?: UserPreferences;
    user?: Pick<User, 'spiceTolerance'>;
    additionalRequests?: string;
}
export interface GeneratedRecipe {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    cookingTime: number;
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
declare class OpenAIService {
    private buildPrompt;
    generateRecipe(request: RecipeGenerationRequest): Promise<GeneratedRecipe>;
    generateRecipeVariation(originalRecipe: GeneratedRecipe, variationRequest: string): Promise<GeneratedRecipe>;
    suggestIngredientSubstitutions(ingredient: string, dietaryRestrictions?: string[]): Promise<string[]>;
    suggestChefs(query?: string, userPreferences?: {
        favoriteCuisines?: string[];
    }): Promise<string[]>;
    suggestRestaurants(query?: string, userPreferences?: {
        favoriteCuisines?: string[];
        location?: string;
    }): Promise<string[]>;
    suggestIngredients(query?: string, userPreferences?: {
        favoriteCuisines?: string[];
        dietaryRestrictions?: string[];
    }): Promise<string[]>;
    suggestCuisines(query?: string, userPreferences?: {
        favoriteIngredients?: string[];
        location?: string;
    }): Promise<string[]>;
    suggestDishes(query?: string, userPreferences?: {
        favoriteCuisines?: string[];
        favoriteIngredients?: string[];
        dietaryRestrictions?: string[];
    }): Promise<string[]>;
}
export declare const openaiService: OpenAIService;
export {};
//# sourceMappingURL=openaiService.d.ts.map