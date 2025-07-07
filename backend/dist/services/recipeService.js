"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeService = exports.RecipeService = void 0;
const client_1 = require("@prisma/client");
const geminiService_1 = require("./geminiService");
const prisma = new client_1.PrismaClient();
class RecipeService {
    async generateRecipe(userId, request) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { preferences: true }
            });
            if (!user) {
                throw new Error('User not found');
            }
            const context = this.buildRecipeContext(user, user.preferences);
            const aiPrompt = this.buildRecipePrompt(context, request);
            const aiResponse = await geminiService_1.geminiService.generateRecipe(aiPrompt);
            const recipe = this.parseRecipeResponse(aiResponse, request);
            return recipe;
        }
        catch (error) {
            console.error('Recipe generation error:', error);
            throw new Error('Failed to generate recipe');
        }
    }
    async saveRecipe(userId, recipe) {
        try {
            const savedRecipe = await prisma.recipe.create({
                data: {
                    title: recipe.title,
                    description: recipe.description,
                    ingredients: recipe.ingredients,
                    instructions: recipe.instructions,
                    cookingTime: recipe.cookingTime,
                    difficulty: recipe.difficulty,
                    cuisineType: recipe.cuisineType,
                    inspirationSource: recipe.inspirationSource || null,
                    servings: recipe.servings,
                    nutritionInfo: recipe.nutritionInfo,
                    tags: recipe.tags,
                    createdBy: userId,
                }
            });
            await prisma.userRecipe.create({
                data: {
                    userId,
                    recipeId: savedRecipe.id,
                }
            });
            return savedRecipe;
        }
        catch (error) {
            console.error('Save recipe error:', error);
            throw new Error('Failed to save recipe');
        }
    }
    async getUserRecipes(userId, limit = 20, offset = 0) {
        try {
            const userRecipes = await prisma.userRecipe.findMany({
                where: { userId },
                include: { recipe: true },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            });
            return userRecipes.map(ur => ({
                ...ur.recipe,
                userRecipe: {
                    id: ur.id,
                    userId: ur.userId,
                    recipeId: ur.recipeId,
                    rating: ur.rating,
                    notes: ur.notes,
                    cookedDate: ur.cookedDate,
                    isFavorite: ur.isFavorite,
                    createdAt: ur.createdAt,
                    updatedAt: ur.updatedAt,
                },
            }));
        }
        catch (error) {
            console.error('Get user recipes error:', error);
            throw new Error('Failed to get user recipes');
        }
    }
    async getRecipe(recipeId) {
        try {
            return await prisma.recipe.findUnique({
                where: { id: recipeId }
            });
        }
        catch (error) {
            console.error('Get recipe error:', error);
            throw new Error('Failed to get recipe');
        }
    }
    async rateRecipe(userId, recipeId, rating, notes) {
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
        }
        catch (error) {
            console.error('Rate recipe error:', error);
            throw new Error('Failed to rate recipe');
        }
    }
    async addToFavorites(userId, recipeId) {
        try {
            const existingFavorite = await prisma.favoriteRecipe.findUnique({
                where: {
                    userId_recipeId: { userId, recipeId }
                }
            });
            if (existingFavorite) {
                return;
            }
            await prisma.favoriteRecipe.create({
                data: { userId, recipeId }
            });
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
        }
        catch (error) {
            console.error('Add to favorites error:', error);
            throw new Error('Failed to add recipe to favorites');
        }
    }
    async removeFromFavorites(userId, recipeId) {
        try {
            await prisma.favoriteRecipe.deleteMany({
                where: { userId, recipeId }
            });
            await prisma.userRecipe.updateMany({
                where: { userId, recipeId },
                data: { isFavorite: false }
            });
        }
        catch (error) {
            console.error('Remove from favorites error:', error);
            throw new Error('Failed to remove recipe from favorites');
        }
    }
    async getFavoriteRecipes(userId) {
        try {
            const favorites = await prisma.favoriteRecipe.findMany({
                where: { userId },
                include: {
                    recipe: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            const favoriteRecipes = await Promise.all(favorites.map(async (favorite) => {
                const userRecipe = await prisma.userRecipe.findUnique({
                    where: {
                        userId_recipeId: { userId, recipeId: favorite.recipeId }
                    }
                });
                return {
                    ...favorite.recipe,
                    userRecipe: {
                        id: userRecipe?.id || null,
                        userId: userRecipe?.userId || userId,
                        recipeId: userRecipe?.recipeId || favorite.recipeId,
                        rating: userRecipe?.rating || null,
                        notes: userRecipe?.notes || null,
                        cookedDate: userRecipe?.cookedDate || null,
                        isFavorite: true,
                        createdAt: userRecipe?.createdAt || favorite.createdAt,
                        updatedAt: userRecipe?.updatedAt || favorite.createdAt,
                    },
                };
            }));
            return favoriteRecipes;
        }
        catch (error) {
            console.error('Get favorite recipes error:', error);
            throw new Error('Failed to get favorite recipes');
        }
    }
    async generateRecipeVariation(userId, baseRecipeId, variationType) {
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
            const variationPrompt = this.buildVariationPrompt(baseRecipe, variationType, user.preferences);
            const aiResponse = await geminiService_1.geminiService.generateRecipe(variationPrompt);
            const variation = this.parseRecipeResponse(aiResponse, {
                difficulty: baseRecipe.difficulty,
            });
            return variation;
        }
        catch (error) {
            console.error('Generate recipe variation error:', error);
            throw new Error('Failed to generate recipe variation');
        }
    }
    buildRecipeContext(user, preferences) {
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
            if (preferences.favoriteDishes.length > 0) {
                context.push(`Favorite dishes: ${preferences.favoriteDishes.join(', ')}`);
            }
            if (preferences.favoriteChefs.length > 0) {
                context.push(`Favorite chefs: ${preferences.favoriteChefs.join(', ')}`);
            }
            if (preferences.favoriteRestaurants.length > 0) {
                context.push(`Favorite restaurants: ${preferences.favoriteRestaurants.join(', ')}`);
            }
            if (preferences.dislikedFoods.length > 0) {
                context.push(`Disliked foods: ${preferences.dislikedFoods.join(', ')}`);
            }
            context.push(`Cooking skill level: ${preferences.cookingSkillLevel}`);
            context.push(`Spice tolerance: ${user.spiceTolerance}`);
            context.push(`Meal complexity preference: ${preferences.mealComplexity}`);
            context.push(`Budget preference: ${preferences.budgetPreference}`);
            if (preferences.preferredCookingTime) {
                context.push(`Preferred cooking time: ${preferences.preferredCookingTime} minutes maximum`);
            }
            if (preferences.servingSize) {
                context.push(`Preferred serving size: ${preferences.servingSize} people`);
            }
            if (preferences.preferredMealTypes.length > 0) {
                context.push(`Preferred meal types: ${preferences.preferredMealTypes.join(', ')}`);
            }
            if (preferences.nutritionalGoals.length > 0) {
                context.push(`Nutritional goals: ${preferences.nutritionalGoals.join(', ')}`);
            }
            if (preferences.availableEquipment.length > 0) {
                context.push(`Available equipment: ${preferences.availableEquipment.join(', ')}`);
            }
        }
        return context.join('\n');
    }
    buildRecipePrompt(context, request) {
        let prompt = `Generate a detailed recipe with the following requirements:\n\n`;
        if (context) {
            prompt += `User Preferences:\n${context}\n\n`;
        }
        prompt += `Recipe Requirements:\n`;
        if (request.inspiration) {
            prompt += `- Inspiration: ${request.inspiration}\n`;
        }
        if (request.occasion) {
            prompt += `- Occasion: ${request.occasion}\n`;
        }
        if (request.currentCravings) {
            prompt += `- Current cravings: ${request.currentCravings}\n`;
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
    buildVariationPrompt(baseRecipe, variationType, preferences) {
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
    parseRecipeResponse(aiResponse, request) {
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in AI response');
            }
            let jsonString = jsonMatch[0];
            jsonString = jsonString.replace(/"amount":\s*([^",\}]+),/g, (match, amount) => {
                const cleanAmount = amount.trim();
                if (cleanAmount.includes('/') || cleanAmount.includes(' ')) {
                    return `"amount": "${cleanAmount}",`;
                }
                return match;
            });
            jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
            const parsed = JSON.parse(jsonString);
            if (parsed.aiPrompt && parsed.tags && parsed.tags.includes('ai-prompt')) {
                const recipe = {
                    title: "Your Personalized Recipe Prompt",
                    description: "Copy this prompt and paste it into ChatGPT, Claude, or any AI assistant:",
                    ingredients: [
                        {
                            name: "Copy the prompt below and paste it into your preferred AI assistant",
                            amount: "",
                            unit: "",
                            category: "prompt"
                        }
                    ],
                    instructions: [parsed.aiPrompt],
                    cookingTime: 0,
                    difficulty: 'EASY',
                    cuisineType: 'AI-Generated',
                    servings: 1,
                    nutritionInfo: {
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fat: 0
                    },
                    tags: ['ai-prompt', 'copy-paste', 'personalized'],
                    aiPromptUsed: {
                        prompt: parsed.aiPrompt,
                        technicalPrompt: parsed.technicalPrompt,
                        instructions: [
                            "Copy the clean prompt above for easy use with any AI assistant",
                            "Use the technical version below if you need JSON formatting",
                            "Both will generate the same personalized recipe based on your preferences"
                        ]
                    }
                };
                if (request.inspiration) {
                    recipe.inspirationSource = request.inspiration;
                }
                return recipe;
            }
            if (!parsed.title || !parsed.ingredients || !parsed.instructions) {
                throw new Error('Missing required recipe fields');
            }
            const recipe = {
                title: parsed.title,
                description: parsed.description || '',
                ingredients: parsed.ingredients,
                instructions: parsed.instructions,
                cookingTime: parsed.cookingTime || 30,
                difficulty: parsed.difficulty || request.difficulty || 'MEDIUM',
                cuisineType: parsed.cuisineType || 'International',
                servings: parsed.servings || 2,
                nutritionInfo: parsed.nutritionInfo,
                tags: parsed.tags || [],
            };
            if (parsed.aiPromptUsed) {
                recipe.aiPromptUsed = parsed.aiPromptUsed;
            }
            if (request.inspiration) {
                recipe.inspirationSource = request.inspiration;
            }
            return recipe;
        }
        catch (error) {
            console.error('Parse recipe response error:', error);
            throw new Error('Failed to parse AI recipe response');
        }
    }
}
exports.RecipeService = RecipeService;
exports.recipeService = new RecipeService();
//# sourceMappingURL=recipeService.js.map