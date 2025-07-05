import OpenAI from 'openai';
import { UserPreferences, User } from '@prisma/client';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

export interface RecipeGenerationRequest {
  inspiration: string; // restaurant, chef, cuisine, or city
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

class OpenAIService {
  private buildPrompt(request: RecipeGenerationRequest): string {
    const { inspiration, inspirationType, userPreferences, user, additionalRequests } = request;
    
    let prompt = `You are a world-class chef and recipe developer. Create a detailed, authentic recipe inspired by ${inspiration}`;
    
    // Add inspiration context
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

    // Add user preferences
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

  async generateRecipe(request: RecipeGenerationRequest): Promise<GeneratedRecipe> {
    try {
      const prompt = this.buildPrompt(request);
      
      const completion = await openai.chat.completions.create({
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

      const recipe = JSON.parse(response) as GeneratedRecipe;
      
      // Validate required fields
      if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
        throw new Error('Invalid recipe format from OpenAI');
      }

      return recipe;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate recipe');
    }
  }

  async generateRecipeVariation(originalRecipe: GeneratedRecipe, variationRequest: string): Promise<GeneratedRecipe> {
    try {
      const prompt = `Based on this original recipe:
${JSON.stringify(originalRecipe, null, 2)}

Create a variation with this modification: ${variationRequest}

Provide the new recipe in the same JSON format, keeping the same structure but with the requested changes.`;

      const completion = await openai.chat.completions.create({
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

      return JSON.parse(response) as GeneratedRecipe;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate recipe variation');
    }
  }

  async suggestIngredientSubstitutions(ingredient: string, dietaryRestrictions: string[] = []): Promise<string[]> {
    try {
      let prompt = `Suggest 3-5 ingredient substitutions for "${ingredient}" in cooking.`;
      
      if (dietaryRestrictions.length > 0) {
        prompt += ` Consider these dietary restrictions: ${dietaryRestrictions.join(', ')}.`;
      }
      
      prompt += ` Provide practical alternatives that maintain similar flavor profiles or cooking properties. Return as a JSON array of strings.`;

      const completion = await openai.chat.completions.create({
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
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate substitutions');
    }
  }
}

export const openaiService = new OpenAIService(); 