import { GoogleGenerativeAI } from '@google/generative-ai';
import { googleAuthService } from './googleAuthService';

export class GeminiService {
  private genAI!: GoogleGenerativeAI;
  private model!: any;
  private isUsingOAuth: boolean = false;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      // Try OAuth first if configured
      if (googleAuthService.isConfigured()) {
        console.log('🔐 Using OAuth authentication for Gemini API');
        const accessToken = await googleAuthService.getAccessToken();
        this.genAI = new GoogleGenerativeAI(accessToken);
        this.isUsingOAuth = true;
      } else {
        // Fallback to API key
        console.log('🔑 Using API key authentication for Gemini API');
        const apiKey = process.env['GEMINI_API_KEY'] || '';
        if (!apiKey) {
          console.warn('⚠️  Neither OAuth nor GEMINI_API_KEY configured, AI suggestions will use fallbacks');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.isUsingOAuth = false;
      }
      
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (error) {
      console.error('Failed to initialize Gemini client with OAuth, falling back to API key:', error);
      
      // Fallback to API key on OAuth failure
      const apiKey = process.env['GEMINI_API_KEY'] || '';
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.isUsingOAuth = false;
    }
  }

  private async ensureValidClient() {
    if (this.isUsingOAuth) {
      try {
        // Refresh token if needed
        const accessToken = await googleAuthService.getAccessToken();
        this.genAI = new GoogleGenerativeAI(accessToken);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      } catch (error) {
        console.error('OAuth token refresh failed:', error);
        throw error;
      }
    }
  }

  private async generateText(prompt: string): Promise<string> {
    try {
      if (this.isUsingOAuth) {
        // Use REST API with OAuth token
        return await this.generateTextWithOAuth(prompt);
      } else {
        // Use GoogleGenerativeAI package with API key
        await this.ensureValidClient();
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  private async generateTextWithOAuth(prompt: string): Promise<string> {
    try {
      const accessToken = await googleAuthService.getAccessToken();
      
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OAuth API call failed: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data: any = await response.json();
      
      // Extract text from Gemini response format
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('Unexpected response format from Gemini API');
    } catch (error) {
      console.error('OAuth API call failed:', error);
      throw error;
    }
  }

  async suggestChefs(query: string, context: any = {}): Promise<string[]> {
    try {
      const prompt = `Suggest 5 famous chefs whose names are similar to or match "${query}". 
      If the query looks like a chef name, include that chef and similar chefs.
      If the query is a cuisine type (like Italian, French, etc.), suggest chefs who specialize in that cuisine.
      Return only their names, one per line, no descriptions or extra text.
      
      Context: ${JSON.stringify(context)}`;

      const response = await this.generateText(prompt);
      return response
        .split('\n')
        .map(chef => chef.trim())
        .filter(chef => chef.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('AI suggestions failed, using static fallback:', error);
      // Static fallback suggestions
      const staticSuggestions = [
        'Gordon Ramsay',
        'Julia Child',
        'Anthony Bourdain',
        'Emeril Lagasse',
        'Wolfgang Puck'
      ];
      return staticSuggestions.filter(chef => 
        chef.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
  }

  async suggestRestaurants(query: string, context: any = {}): Promise<string[]> {
    try {
      const prompt = `Suggest 5 famous restaurants whose names contain "${query}" or are known for ${query} cuisine/style. 
      Return only restaurant names, one per line, no descriptions or extra text.
      
      Context: ${JSON.stringify(context)}`;

      const response = await this.generateText(prompt);
      return response
        .split('\n')
        .map(restaurant => restaurant.trim())
        .filter(restaurant => restaurant.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('AI suggestions failed, using static fallback:', error);
      // Static fallback suggestions
      const staticSuggestions = [
        'The French Laundry',
        'Eleven Madison Park',
        'Noma',
        'Le Bernardin',
        'Osteria Francescana'
      ];
      return staticSuggestions.filter(restaurant => 
        restaurant.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
  }

  async suggestIngredients(query: string, context: any = {}): Promise<string[]> {
    try {
      const prompt = `Suggest 5 cooking ingredients that contain "${query}" or are commonly used with ${query}. 
      Return only ingredient names, one per line, no descriptions or extra text.
      
      Context: ${JSON.stringify(context)}`;

      const response = await this.generateText(prompt);
      return response
        .split('\n')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('AI suggestions failed, using static fallback:', error);
      // Static fallback suggestions
      const staticSuggestions = [
        'Garlic',
        'Onion',
        'Tomato',
        'Basil',
        'Olive Oil'
      ];
      return staticSuggestions.filter(ingredient => 
        ingredient.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
  }

  async suggestCuisines(query: string, context: any = {}): Promise<string[]> {
    try {
      const prompt = `Suggest 5 cuisine types that contain "${query}" or are related to ${query}. 
      Return only cuisine names, one per line, no descriptions or extra text.
      
      Context: ${JSON.stringify(context)}`;

      const response = await this.generateText(prompt);
      return response
        .split('\n')
        .map(cuisine => cuisine.trim())
        .filter(cuisine => cuisine.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('AI suggestions failed, using static fallback:', error);
      // Static fallback suggestions
      const staticSuggestions = [
        'Italian',
        'French',
        'Chinese',
        'Japanese',
        'Mexican'
      ];
      return staticSuggestions.filter(cuisine => 
        cuisine.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
  }

  async suggestDishes(query: string, context: any = {}): Promise<string[]> {
    try {
      const prompt = `Suggest 5 dishes that contain "${query}" or are made with ${query}. 
      Return only dish names, one per line, no descriptions or extra text.
      
      Context: ${JSON.stringify(context)}`;

      const response = await this.generateText(prompt);
      return response
        .split('\n')
        .map(dish => dish.trim())
        .filter(dish => dish.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('AI suggestions failed, using static fallback:', error);
      // Static fallback suggestions
      const staticSuggestions = [
        'Pasta Carbonara',
        'Beef Bourguignon',
        'Chicken Tikka Masala',
        'Sushi Roll',
        'Tacos'
      ];
      return staticSuggestions.filter(dish => 
        dish.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
  }

  /**
   * Generate a complete recipe using AI
   */
  async generateRecipe(prompt: string): Promise<string> {
    try {
      const fullPrompt = `${prompt}

IMPORTANT: You are a professional chef creating recipes for sophisticated food enthusiasts. 
Please ensure the recipe is:
- Authentic and well-balanced
- Uses quality ingredients and proper techniques
- Includes accurate cooking times and temperatures
- Provides clear, step-by-step instructions
- Considers dietary restrictions and preferences mentioned
- Includes realistic nutritional estimates

Return ONLY the JSON response, no additional text or explanations.`;

      const response = await this.generateText(fullPrompt);
      return this.addPromptToResponse(response, prompt);
    } catch (error) {
      console.error('Recipe generation failed:', error);
      
      // Check if it's a quota exceeded error
      if (error instanceof Error && error.message.includes('429')) {
        console.log('🚨 Gemini API quota exceeded, generating AI prompt for user');
        return this.generateAIPromptForUser(prompt);
      }
      
      throw new Error('Failed to generate recipe with AI');
    }
  }

    /**
   * Generate an AI prompt that users can copy-paste into ChatGPT or other AI services
   */
  private generateAIPromptForUser(prompt: string): string {
    console.log('🔄 Generating AI prompt for user to use in ChatGPT/Claude');
    
    // Parse the original prompt to extract user preferences and requirements
    const cleanPrompt = this.formatCleanPrompt(prompt);
    const technicalPrompt = this.formatTechnicalPrompt(prompt);
    
    // Create a special response that includes both clean and technical versions
    const aiPromptForUser = {
      "title": "Your Personalized Recipe Prompt",
      "description": "Choose the version that works best for you:",
      "aiPrompt": cleanPrompt,
      "technicalPrompt": technicalPrompt,
      "instructions": [
        "📋 CLEAN VERSION: Copy the prompt above - perfect for ChatGPT, Claude, or any AI assistant",
        "🔧 TECHNICAL VERSION: Available in the AI Prompt section below - includes JSON formatting",
        "💡 TIP: Most AI assistants work great with the clean version",
        "🎯 Both will generate the same personalized recipe based on your preferences"
      ],
      "cookingTime": 0,
      "difficulty": "EASY",
      "cuisineType": "AI-Generated",
      "servings": 1,
      "nutritionInfo": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0
      },
      "tags": ["ai-prompt", "copy-paste", "personalized", "clean-format"]
    };
    
    return JSON.stringify(aiPromptForUser);
  }

  /**
   * Format a clean, readable version of the prompt
   */
  private formatCleanPrompt(originalPrompt: string): string {
    // Extract sections from the original prompt
    const userPrefsMatch = originalPrompt.match(/User Preferences:\n(.*?)\n\nRecipe Requirements:/s);
    const recipeReqsMatch = originalPrompt.match(/Recipe Requirements:\n(.*?)\n\nPlease provide/s);
    
    const userPrefs = (userPrefsMatch && userPrefsMatch[1]) ? userPrefsMatch[1] : 'No specific preferences provided';
    const recipeReqs = (recipeReqsMatch && recipeReqsMatch[1]) ? recipeReqsMatch[1] : 'No specific requirements provided';
    
    return `🍽️ CREATE A PERSONALIZED RECIPE

👤 MY PREFERENCES:
${this.formatPreferences(userPrefs || '')}

🎯 RECIPE REQUEST:
${this.formatRequirements(recipeReqs || '')}

👨‍🍳 INSTRUCTIONS:
Create a detailed, authentic recipe that perfectly matches my preferences above. 

Please include:
• Complete ingredient list with measurements
• Step-by-step cooking instructions
• Cooking times and temperatures
• Tips for best results
• Wine pairing suggestions (if appropriate)

Make it restaurant-quality but achievable at home with accessible ingredients.`;
  }

  /**
   * Format user preferences in a clean, readable way
   */
  private formatPreferences(prefs: string): string {
    const lines = prefs.split('\n').map(line => line.trim()).filter(line => line);
    return lines.map(line => `• ${line}`).join('\n');
  }

  /**
   * Format recipe requirements in a clean, readable way
   */
  private formatRequirements(reqs: string): string {
    const lines = reqs.split('\n').map(line => line.trim()).filter(line => line);
    return lines.map(line => {
      // Clean up the formatting
      const cleanLine = line.replace(/^- /, '');
      return `• ${cleanLine}`;
    }).join('\n');
  }

  /**
   * Format the technical version with JSON formatting instructions
   */
  private formatTechnicalPrompt(originalPrompt: string): string {
    return `${originalPrompt}

IMPORTANT INSTRUCTIONS FOR THE AI:
You are a world-class chef and recipe developer. Create an authentic, detailed recipe that is perfectly tailored to the preferences mentioned above.

Please ensure the recipe is:
- Authentic and well-balanced with quality ingredients
- Uses proper cooking techniques and realistic timing
- Includes accurate cooking times and temperatures  
- Provides clear, step-by-step instructions that anyone can follow
- Considers all dietary restrictions and preferences mentioned
- Includes realistic nutritional estimates
- Suggests appropriate wine pairings or side dishes if relevant

Return the recipe in this exact JSON format:

{
  "title": "Recipe Name",
  "description": "Brief, appetizing description of the dish",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "quantity", 
      "unit": "unit of measurement",
      "category": "protein/vegetable/spice/etc"
    }
  ],
  "instructions": [
    "Step 1: Clear, detailed instruction",
    "Step 2: Next step with timing and technique",
    "Continue with all steps..."
  ],
  "cookingTime": minutes_as_number,
  "difficulty": "EASY/MEDIUM/HARD/EXPERT",
  "cuisineType": "cuisine type",
  "servings": number_of_servings,
  "nutritionInfo": {
    "calories": estimated_calories_per_serving,
    "protein": grams_of_protein,
    "carbs": grams_of_carbs,
    "fat": grams_of_fat
  },
  "tags": ["relevant", "tags", "for", "the", "recipe"]
}

Make sure the recipe is restaurant-quality but achievable at home, with ingredients that are reasonably accessible.`;
  }

  /**
   * Add the underlying prompt to any recipe response for transparency
   */
  private addPromptToResponse(response: string, originalPrompt: string): string {
    try {
      // Clean the response to extract JSON
      let cleanedResponse = response.trim();
      
      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to find JSON within the response if it contains other text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      // Parse the cleaned response
      const recipeData = JSON.parse(cleanedResponse);
      
      // Add the prompt information to the recipe
      recipeData.aiPromptUsed = {
        prompt: originalPrompt,
        instructions: [
          "This is the exact prompt that was used to generate your recipe.",
          "You can copy this prompt and use it with ChatGPT, Claude, or any AI assistant.",
          "Modify the prompt to customize the recipe further to your preferences."
        ]
      };
      
      return JSON.stringify(recipeData);
    } catch (error) {
      console.error('Error adding prompt to response:', error);
      console.error('Original response:', response);
      // If JSON parsing fails, return original response
      return response;
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService(); 