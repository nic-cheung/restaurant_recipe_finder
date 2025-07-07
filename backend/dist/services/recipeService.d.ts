import { Recipe, Difficulty } from '@prisma/client';
export interface RecipeGenerationRequest {
    inspiration?: string;
    occasion?: string;
    currentCravings?: string;
    difficulty?: Difficulty;
    mealType?: string;
    additionalRequests?: string;
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
export interface RecipeIngredient {
    name: string;
    amount: string;
    unit: string;
    category?: string;
}
export interface NutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sodium?: number;
}
export declare class RecipeService {
    generateRecipe(userId: string, request: RecipeGenerationRequest): Promise<GeneratedRecipe>;
    saveRecipe(userId: string, recipe: GeneratedRecipe): Promise<Recipe>;
    getUserRecipes(userId: string, limit?: number, offset?: number): Promise<(Recipe & {
        userRecipe: any;
    })[]>;
    getRecipe(recipeId: string): Promise<Recipe | null>;
    rateRecipe(userId: string, recipeId: string, rating: number, notes?: string): Promise<void>;
    addToFavorites(userId: string, recipeId: string): Promise<void>;
    removeFromFavorites(userId: string, recipeId: string): Promise<void>;
    getFavoriteRecipes(userId: string): Promise<(Recipe & {
        userRecipe: any;
    })[]>;
    generateRecipeVariation(userId: string, baseRecipeId: string, variationType: 'healthier' | 'faster' | 'budget' | 'different_cuisine'): Promise<GeneratedRecipe>;
    private buildRecipeContext;
    private buildRecipePrompt;
    private buildVariationPrompt;
    private parseRecipeResponse;
}
export declare const recipeService: RecipeService;
//# sourceMappingURL=recipeService.d.ts.map