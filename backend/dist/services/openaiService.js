"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiService = void 0;
const openai_1 = __importDefault(require("openai"));
let openai = null;
function getOpenAIClient() {
    if (!openai) {
        const apiKey = process.env['OPENAI_API_KEY'];
        if (!apiKey) {
            throw new Error('OpenAI API key not configured');
        }
        openai = new openai_1.default({ apiKey });
    }
    return openai;
}
class OpenAIService {
    buildPrompt(request) {
        const { inspiration, inspirationType, userPreferences, user, additionalRequests } = request;
        let prompt = `You are a world-class chef and recipe developer. Create a detailed, authentic recipe inspired by ${inspiration}`;
        switch (inspirationType) {
            case 'restaurant':
                prompt += ` (the famous restaurant). Capture the essence and signature flavors of this establishment.`;
                break;
            case 'chef':
                prompt += ` (the renowned chef). Incorporate their signature cooking style and techniques.`;
                break;
            case 'cuisine':
                prompt += ` cuisine. Make it authentic and true to traditional flavors and techniques.`;
                break;
            case 'city':
                prompt += ` (the city). Reflect the local food culture and regional specialties.`;
                break;
        }
        if (userPreferences || user) {
            prompt += `\n\nPersonalization requirements:`;
            if (userPreferences?.dietaryRestrictions?.length) {
                prompt += `\n- Dietary restrictions: ${userPreferences.dietaryRestrictions.join(', ')}`;
            }
            if (userPreferences?.allergies?.length) {
                prompt += `\n- Allergies to avoid: ${userPreferences.allergies.join(', ')}`;
            }
            if (user?.spiceTolerance) {
                prompt += `\n- Spice level: ${user.spiceTolerance.toLowerCase()}`;
            }
            if (userPreferences?.cookingSkillLevel) {
                prompt += `\n- Cooking skill level: ${userPreferences.cookingSkillLevel.toLowerCase()}`;
            }
            if (userPreferences?.preferredCookingTime) {
                prompt += `\n- Maximum cooking time: ${userPreferences.preferredCookingTime} minutes`;
            }
            if (userPreferences?.servingSize) {
                prompt += `\n- Serving size: ${userPreferences.servingSize} people`;
            }
            if (userPreferences?.favoriteIngredients?.length) {
                prompt += `\n- Try to include these favorite ingredients when possible: ${userPreferences.favoriteIngredients.join(', ')}`;
            }
            if (userPreferences?.dislikedFoods?.length) {
                prompt += `\n- Avoid these disliked foods: ${userPreferences.dislikedFoods.join(', ')}`;
            }
            if (userPreferences?.favoriteCuisines?.length) {
                prompt += `\n- User enjoys these cuisines: ${userPreferences.favoriteCuisines.join(', ')}`;
            }
        }
        if (additionalRequests) {
            prompt += `\n\nAdditional requests: ${additionalRequests}`;
        }
        prompt += `\n\nProvide the recipe in this exact JSON format:
{
  "title": "Recipe name",
  "description": "Brief description of the dish and its inspiration",
  "ingredients": ["ingredient 1 with measurements", "ingredient 2 with measurements", ...],
  "instructions": ["step 1", "step 2", ...],
  "cookingTime": number_in_minutes,
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "servings": number_of_servings,
  "cuisineType": "cuisine category",
  "inspirationSource": "${inspiration}",
  "nutritionalInfo": {
    "calories": estimated_calories_per_serving,
    "protein": "grams",
    "carbs": "grams", 
    "fat": "grams"
  },
  "tips": ["cooking tip 1", "cooking tip 2", ...],
  "substitutions": ["ingredient substitution 1", "ingredient substitution 2", ...]
}

Make sure the recipe is detailed, authentic, and perfectly tailored to the user's preferences. Include specific measurements, cooking techniques, and helpful tips.`;
        return prompt;
    }
    async generateRecipe(request) {
        try {
            const prompt = this.buildPrompt(request);
            const completion = await getOpenAIClient().chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [
                    {
                        role: "system",
                        content: "You are a world-class chef and recipe developer. You create authentic, detailed recipes that are perfectly tailored to user preferences. Always respond with valid JSON format."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: "json_object" }
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from OpenAI');
            }
            const recipe = JSON.parse(response);
            if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
                throw new Error('Invalid recipe format from OpenAI');
            }
            return recipe;
        }
        catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to generate recipe');
        }
    }
    async generateRecipeVariation(originalRecipe, variationRequest) {
        try {
            const prompt = `Based on this original recipe:
${JSON.stringify(originalRecipe, null, 2)}

Create a variation with this modification: ${variationRequest}

Provide the new recipe in the same JSON format, keeping the same structure but with the requested changes.`;
            const completion = await getOpenAIClient().chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [
                    {
                        role: "system",
                        content: "You are a world-class chef creating recipe variations. Always respond with valid JSON format."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: "json_object" }
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from OpenAI');
            }
            return JSON.parse(response);
        }
        catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to generate recipe variation');
        }
    }
    async suggestIngredientSubstitutions(ingredient, dietaryRestrictions = []) {
        try {
            let prompt = `Suggest 3-5 ingredient substitutions for "${ingredient}" in cooking.`;
            if (dietaryRestrictions.length > 0) {
                prompt += ` Consider these dietary restrictions: ${dietaryRestrictions.join(', ')}.`;
            }
            prompt += ` Provide practical alternatives that maintain similar flavor profiles or cooking properties. Return as a JSON array of strings.`;
            const completion = await getOpenAIClient().chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a culinary expert providing ingredient substitution advice. Always respond with valid JSON array format."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.5,
                max_tokens: 300,
                response_format: { type: "json_object" }
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from OpenAI');
            }
            const result = JSON.parse(response);
            return result.substitutions || [];
        }
        catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to generate substitutions');
        }
    }
    async suggestChefs(query = '', userPreferences) {
        try {
            let prompt = `Suggest 8-10 well-known chefs`;
            if (query.trim()) {
                prompt += ` whose names or styles match or relate to "${query}"`;
            }
            if (userPreferences?.favoriteCuisines?.length) {
                prompt += `. Consider the user enjoys these cuisines: ${userPreferences.favoriteCuisines.join(', ')}`;
            }
            prompt += `. Include a mix of:
- Celebrity chefs (Gordon Ramsay, Julia Child, etc.)
- Michelin-starred chefs
- Regional cuisine specialists
- Contemporary innovative chefs

Return only chef names as a JSON array of strings. No descriptions or extra text.`;
            const completion = await getOpenAIClient().chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a culinary expert with extensive knowledge of chefs worldwide. Always respond with valid JSON array format containing only chef names."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 400,
                response_format: { type: "json_object" }
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from OpenAI');
            }
            const result = JSON.parse(response);
            return result.chefs || result.suggestions || [];
        }
        catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to generate chef suggestions');
        }
    }
    async suggestRestaurants(query = '', userPreferences) {
        try {
            let prompt = `Suggest 8-10 well-known restaurants`;
            if (query.trim()) {
                prompt += ` whose names or styles match or relate to "${query}"`;
            }
            if (userPreferences?.favoriteCuisines?.length) {
                prompt += `. Consider the user enjoys these cuisines: ${userPreferences.favoriteCuisines.join(', ')}`;
            }
            if (userPreferences?.location) {
                prompt += `. Give preference to restaurants in or near ${userPreferences.location}`;
            }
            prompt += `. Include a mix of:
- Famous fine dining establishments
- Popular chain restaurants
- Iconic local restaurants
- Michelin-starred restaurants
- Trendy contemporary restaurants

Return only restaurant names as a JSON array of strings. No descriptions or extra text.`;
            const completion = await getOpenAIClient().chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a restaurant expert with knowledge of establishments worldwide. Always respond with valid JSON array format containing only restaurant names."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 400,
                response_format: { type: "json_object" }
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from OpenAI');
            }
            const result = JSON.parse(response);
            return result.restaurants || result.suggestions || [];
        }
        catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to generate restaurant suggestions');
        }
    }
    async suggestIngredients(query = '', userPreferences) {
        try {
            let prompt = `Suggest 8-10 cooking ingredients`;
            if (query.trim()) {
                prompt += ` that match or relate to "${query}"`;
            }
            if (userPreferences?.favoriteCuisines?.length) {
                prompt += `. Consider the user enjoys these cuisines: ${userPreferences.favoriteCuisines.join(', ')}`;
            }
            if (userPreferences?.dietaryRestrictions?.length) {
                prompt += `. Consider these dietary restrictions: ${userPreferences.dietaryRestrictions.join(', ')}`;
            }
            prompt += `. Include a mix of:
- Common cooking ingredients
- Specialty ingredients
- Herbs and spices
- Proteins and vegetables
- Pantry staples

Return only ingredient names as a JSON array of strings. No descriptions or extra text.`;
            const completion = await getOpenAIClient().chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a culinary expert with extensive knowledge of cooking ingredients. Always respond with valid JSON array format containing only ingredient names."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 400,
                response_format: { type: "json_object" }
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from OpenAI');
            }
            const result = JSON.parse(response);
            return result.ingredients || result.suggestions || [];
        }
        catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to generate ingredient suggestions');
        }
    }
    async suggestCuisines(query = '', userPreferences) {
        try {
            let prompt = `Suggest 8-10 world cuisines`;
            if (query.trim()) {
                prompt += ` that match or relate to "${query}"`;
            }
            if (userPreferences?.favoriteIngredients?.length) {
                prompt += `. Consider the user enjoys these ingredients: ${userPreferences.favoriteIngredients.join(', ')}`;
            }
            if (userPreferences?.location) {
                prompt += `. Give preference to cuisines available in ${userPreferences.location}`;
            }
            prompt += `. Include a mix of:
- Popular world cuisines
- Regional specialties
- Fusion cuisines
- Traditional cooking styles
- Contemporary cuisine trends

Return only cuisine names as a JSON array of strings. No descriptions or extra text.`;
            const completion = await getOpenAIClient().chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a culinary expert with knowledge of world cuisines. Always respond with valid JSON array format containing only cuisine names."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 400,
                response_format: { type: "json_object" }
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from OpenAI');
            }
            const result = JSON.parse(response);
            return result.cuisines || result.suggestions || [];
        }
        catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to generate cuisine suggestions');
        }
    }
    async suggestDishes(query = '', userPreferences) {
        try {
            let prompt = `Suggest 8-10 popular dishes`;
            if (query.trim()) {
                prompt += ` that match or relate to "${query}"`;
            }
            if (userPreferences?.favoriteCuisines?.length) {
                prompt += `. Consider the user enjoys these cuisines: ${userPreferences.favoriteCuisines.join(', ')}`;
            }
            if (userPreferences?.favoriteIngredients?.length) {
                prompt += `. Consider the user enjoys these ingredients: ${userPreferences.favoriteIngredients.join(', ')}`;
            }
            if (userPreferences?.dietaryRestrictions?.length) {
                prompt += `. Consider these dietary restrictions: ${userPreferences.dietaryRestrictions.join(', ')}`;
            }
            prompt += `. Include a mix of:
- Classic dishes from various cuisines
- Popular comfort foods
- Signature restaurant dishes
- Traditional specialties
- Modern interpretations

Return only dish names as a JSON array of strings. No descriptions or extra text.`;
            const completion = await getOpenAIClient().chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a culinary expert with knowledge of dishes from around the world. Always respond with valid JSON array format containing only dish names."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 400,
                response_format: { type: "json_object" }
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from OpenAI');
            }
            const result = JSON.parse(response);
            return result.dishes || result.suggestions || [];
        }
        catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to generate dish suggestions');
        }
    }
}
exports.openaiService = new OpenAIService();
//# sourceMappingURL=openaiService.js.map