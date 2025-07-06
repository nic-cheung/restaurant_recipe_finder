import { PrismaClient, Recipe, Difficulty, User, UserPreferences } from '@prisma/client';
import { geminiService } from './geminiService';

const prisma = new PrismaClient();

export interface RecipeGenerationRequest {
  inspiration?: string; // Restaurant, chef, cuisine, or city
  ingredients?: string[]; // Specific ingredients to include
  cookingTime?: number; // Maximum cooking time in minutes
  servings?: number; // Number of servings
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
}

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

export class RecipeService {
  /**
   * Generate a personalized recipe using AI based on user preferences and inspiration
   */
  async generateRecipe(
    userId: string, 
    request: RecipeGenerationRequest
  ): Promise<GeneratedRecipe> {
    try {
      // Get user preferences for personalization
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { preferences: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Build context for AI generation
      const context = this.buildRecipeContext(user, user.preferences);
      
      // Generate recipe using Gemini AI
      const aiPrompt = this.buildRecipePrompt(context, request);
      const aiResponse = await geminiService.generateRecipe(aiPrompt);
      
      // Parse and validate AI response
      const recipe = this.parseRecipeResponse(aiResponse, request);
      
      return recipe;
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw new Error('Failed to generate recipe');
    }
  }

  /**
   * Save a generated recipe to the database
   */
  async saveRecipe(userId: string, recipe: GeneratedRecipe): Promise<Recipe> {
    try {
      const savedRecipe = await prisma.recipe.create({
        data: {
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients as any, // JSON field
          instructions: recipe.instructions,
          cookingTime: recipe.cookingTime,
          difficulty: recipe.difficulty,
          cuisineType: recipe.cuisineType,
          inspirationSource: recipe.inspirationSource || null,
          servings: recipe.servings,
          nutritionInfo: recipe.nutritionInfo as any, // JSON field
          tags: recipe.tags,
          createdBy: userId,
        }
      });

      // Create user-recipe relationship
      await prisma.userRecipe.create({
        data: {
          userId,
          recipeId: savedRecipe.id,
        }
      });

      return savedRecipe;
    } catch (error) {
      console.error('Save recipe error:', error);
      throw new Error('Failed to save recipe');
    }
  }

  /**
   * Get user's saved recipes
   */
  async getUserRecipes(userId: string, limit = 20, offset = 0): Promise<Recipe[]> {
    try {
      const userRecipes = await prisma.userRecipe.findMany({
        where: { userId },
        include: { recipe: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return userRecipes.map(ur => ur.recipe);
    } catch (error) {
      console.error('Get user recipes error:', error);
      throw new Error('Failed to get user recipes');
    }
  }

  /**
   * Get a specific recipe by ID
   */
  async getRecipe(recipeId: string): Promise<Recipe | null> {
    try {
      return await prisma.recipe.findUnique({
        where: { id: recipeId }
      });
    } catch (error) {
      console.error('Get recipe error:', error);
      throw new Error('Failed to get recipe');
    }
  }

  /**
   * Rate a recipe
   */
  async rateRecipe(userId: string, recipeId: string, rating: number, notes?: string): Promise<void> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      await prisma.userRecipe.upsert({
        where: {
          userId_recipeId: { userId, recipeId }
        },
        update: {
          rating,
          notes: notes || null,
          updatedAt: new Date(),
        },
        create: {
          userId,
          recipeId,
          rating,
          notes: notes || null,
        }
      });
    } catch (error) {
      console.error('Rate recipe error:', error);
      throw new Error('Failed to rate recipe');
    }
  }

  /**
   * Add recipe to favorites
   */
  async addToFavorites(userId: string, recipeId: string): Promise<void> {
    try {
      await prisma.favoriteRecipe.create({
        data: { userId, recipeId }
      });

      // Also mark as favorite in UserRecipe
      await prisma.userRecipe.upsert({
        where: {
          userId_recipeId: { userId, recipeId }
        },
        update: {
          isFavorite: true,
        },
        create: {
          userId,
          recipeId,
          isFavorite: true,
        }
      });
    } catch (error) {
      console.error('Add to favorites error:', error);
      throw new Error('Failed to add recipe to favorites');
    }
  }

  /**
   * Remove recipe from favorites
   */
  async removeFromFavorites(userId: string, recipeId: string): Promise<void> {
    try {
      await prisma.favoriteRecipe.deleteMany({
        where: { userId, recipeId }
      });

      await prisma.userRecipe.updateMany({
        where: { userId, recipeId },
        data: { isFavorite: false }
      });
    } catch (error) {
      console.error('Remove from favorites error:', error);
      throw new Error('Failed to remove recipe from favorites');
    }
  }

  /**
   * Get user's favorite recipes
   */
  async getFavoriteRecipes(userId: string): Promise<Recipe[]> {
    try {
      const favorites = await prisma.favoriteRecipe.findMany({
        where: { userId },
        include: { recipe: true },
        orderBy: { createdAt: 'desc' },
      });

      return favorites.map(f => f.recipe);
    } catch (error) {
      console.error('Get favorite recipes error:', error);
      throw new Error('Failed to get favorite recipes');
    }
  }

  /**
   * Generate recipe variations based on an existing recipe
   */
  async generateRecipeVariation(
    userId: string, 
    baseRecipeId: string, 
    variationType: 'healthier' | 'faster' | 'budget' | 'different_cuisine'
  ): Promise<GeneratedRecipe> {
    try {
      const baseRecipe = await this.getRecipe(baseRecipeId);
      if (!baseRecipe) {
        throw new Error('Base recipe not found');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { preferences: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Build variation prompt
      const variationPrompt = this.buildVariationPrompt(baseRecipe, variationType, user.preferences);
      const aiResponse = await geminiService.generateRecipe(variationPrompt);
      
      // Parse response
      const variation = this.parseRecipeResponse(aiResponse, {
        servings: baseRecipe.servings,
        difficulty: baseRecipe.difficulty,
      });

      return variation;
    } catch (error) {
      console.error('Generate recipe variation error:', error);
      throw new Error('Failed to generate recipe variation');
    }
  }

  /**
   * Build context for AI recipe generation
   */
  private buildRecipeContext(
    user: User, 
    preferences: UserPreferences | null
  ): string {
    const context = [];

    if (preferences) {
      if (preferences.dietaryRestrictions.length > 0) {
        context.push(`Dietary restrictions: ${preferences.dietaryRestrictions.join(', ')}`);
      }
      if (preferences.allergies.length > 0) {
        context.push(`Allergies: ${preferences.allergies.join(', ')}`);
      }
      if (preferences.favoriteCuisines.length > 0) {
        context.push(`Favorite cuisines: ${preferences.favoriteCuisines.join(', ')}`);
      }
      if (preferences.favoriteIngredients.length > 0) {
        context.push(`Favorite ingredients: ${preferences.favoriteIngredients.join(', ')}`);
      }
      if (preferences.dislikedFoods.length > 0) {
        context.push(`Disliked foods: ${preferences.dislikedFoods.join(', ')}`);
      }
      
      context.push(`Cooking skill level: ${preferences.cookingSkillLevel}`);
      context.push(`Spice tolerance: ${user.spiceTolerance}`);
      
      if (preferences.nutritionalGoals.length > 0) {
        context.push(`Nutritional goals: ${preferences.nutritionalGoals.join(', ')}`);
      }
      if (preferences.availableEquipment.length > 0) {
        context.push(`Available equipment: ${preferences.availableEquipment.join(', ')}`);
      }
    }

    return context.join('\n');
  }

  /**
   * Build AI prompt for recipe generation
   */
  private buildRecipePrompt(context: string, request: RecipeGenerationRequest): string {
    let prompt = `Generate a detailed recipe with the following requirements:\n\n`;
    
    if (context) {
      prompt += `User Preferences:\n${context}\n\n`;
    }

    prompt += `Recipe Requirements:\n`;
    
    if (request.inspiration) {
      prompt += `- Inspiration: ${request.inspiration}\n`;
    }
    if (request.ingredients && request.ingredients.length > 0) {
      prompt += `- Must include ingredients: ${request.ingredients.join(', ')}\n`;
    }
    if (request.cookingTime) {
      prompt += `- Maximum cooking time: ${request.cookingTime} minutes\n`;
    }
    if (request.servings) {
      prompt += `- Servings: ${request.servings}\n`;
    }
    if (request.difficulty) {
      prompt += `- Difficulty level: ${request.difficulty}\n`;
    }
    if (request.mealType) {
      prompt += `- Meal type: ${request.mealType}\n`;
    }
    if (request.additionalRequests) {
      prompt += `- Additional requests: ${request.additionalRequests}\n`;
    }

    prompt += `\nPlease provide the recipe in the following JSON format:
{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "quantity",
      "unit": "unit of measurement",
      "category": "protein/vegetable/spice/etc"
    }
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "cookingTime": number_in_minutes,
  "difficulty": "EASY/MEDIUM/HARD/EXPERT",
  "cuisineType": "cuisine type",
  "servings": number_of_servings,
  "nutritionInfo": {
    "calories": estimated_calories_per_serving,
    "protein": grams_of_protein,
    "carbs": grams_of_carbs,
    "fat": grams_of_fat
  },
  "tags": ["tag1", "tag2", "tag3"]
}

Make sure the recipe is authentic, well-balanced, and matches the user's preferences and restrictions.`;

    return prompt;
  }

  /**
   * Build prompt for recipe variations
   */
  private buildVariationPrompt(
    baseRecipe: Recipe, 
    variationType: string, 
    preferences: UserPreferences | null
  ): string {
    let prompt = `Create a ${variationType} variation of the following recipe:\n\n`;
    
    prompt += `Original Recipe: ${baseRecipe.title}\n`;
    prompt += `Description: ${baseRecipe.description}\n`;
    prompt += `Ingredients: ${JSON.stringify(baseRecipe.ingredients)}\n`;
    prompt += `Instructions: ${baseRecipe.instructions.join(' ')}\n\n`;

    switch (variationType) {
      case 'healthier':
        prompt += `Make this recipe healthier by:
- Reducing calories, sodium, or unhealthy fats
- Adding more vegetables or lean proteins
- Using healthier cooking methods
- Substituting refined ingredients with whole grain alternatives`;
        break;
      case 'faster':
        prompt += `Make this recipe faster by:
- Reducing cooking time and prep time
- Using shortcuts or pre-prepared ingredients
- Simplifying cooking methods
- Reducing the number of steps`;
        break;
      case 'budget':
        prompt += `Make this recipe more budget-friendly by:
- Using cheaper ingredient alternatives
- Reducing expensive ingredients
- Using seasonal and local ingredients
- Maximizing ingredient usage`;
        break;
      case 'different_cuisine':
        prompt += `Transform this recipe into a different cuisine style while maintaining the core concept`;
        break;
    }

    if (preferences) {
      prompt += `\n\nUser preferences to consider:\n`;
      if (preferences.dietaryRestrictions.length > 0) {
        prompt += `- Dietary restrictions: ${preferences.dietaryRestrictions.join(', ')}\n`;
      }
      if (preferences.allergies.length > 0) {
        prompt += `- Allergies: ${preferences.allergies.join(', ')}\n`;
      }
    }

    prompt += `\n\nProvide the variation in the same JSON format as the original recipe generation.`;

    return prompt;
  }

  /**
   * Parse AI response into a structured recipe
   */
  private parseRecipeResponse(aiResponse: string, request: RecipeGenerationRequest): GeneratedRecipe {
    try {
      // Extract JSON from AI response (in case there's additional text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.title || !parsed.ingredients || !parsed.instructions) {
        throw new Error('Missing required recipe fields');
      }

      // Set defaults for missing fields
      const recipe: GeneratedRecipe = {
        title: parsed.title,
        description: parsed.description || '',
        ingredients: parsed.ingredients,
        instructions: parsed.instructions,
        cookingTime: parsed.cookingTime || request.cookingTime || 30,
        difficulty: parsed.difficulty || request.difficulty || 'MEDIUM',
        cuisineType: parsed.cuisineType || 'International',
        servings: parsed.servings || request.servings || 2,
        nutritionInfo: parsed.nutritionInfo,
        tags: parsed.tags || [],
      };

      // Add optional fields only if they exist
      if (request.inspiration) {
        recipe.inspirationSource = request.inspiration;
      }

      return recipe;
    } catch (error) {
      console.error('Parse recipe response error:', error);
      throw new Error('Failed to parse AI recipe response');
    }
  }
}

export const recipeService = new RecipeService(); 