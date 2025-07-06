"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiService = exports.GeminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiService {
    constructor() {
        const apiKey = process.env['GEMINI_API_KEY'] || '';
        if (!apiKey) {
            console.warn('⚠️  GEMINI_API_KEY not found, AI suggestions will use fallbacks');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
    async generateText(prompt) {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }
    async suggestChefs(query, context = {}) {
        try {
            const prompt = `Suggest 5 famous chefs whose names contain "${query}" or who are known for ${query} cuisine. 
      Return only their names, one per line, no descriptions or extra text.
      
      Context: ${JSON.stringify(context)}`;
            const response = await this.generateText(prompt);
            return response
                .split('\n')
                .map(chef => chef.trim())
                .filter(chef => chef.length > 0)
                .slice(0, 5);
        }
        catch (error) {
            console.error('AI suggestions failed, using static fallback:', error);
            const staticSuggestions = [
                'Gordon Ramsay',
                'Julia Child',
                'Anthony Bourdain',
                'Emeril Lagasse',
                'Wolfgang Puck'
            ];
            return staticSuggestions.filter(chef => chef.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        }
    }
    async suggestRestaurants(query, context = {}) {
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
        }
        catch (error) {
            console.error('AI suggestions failed, using static fallback:', error);
            const staticSuggestions = [
                'The French Laundry',
                'Eleven Madison Park',
                'Noma',
                'Le Bernardin',
                'Osteria Francescana'
            ];
            return staticSuggestions.filter(restaurant => restaurant.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        }
    }
    async suggestIngredients(query, context = {}) {
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
        }
        catch (error) {
            console.error('AI suggestions failed, using static fallback:', error);
            const staticSuggestions = [
                'Garlic',
                'Onion',
                'Tomato',
                'Basil',
                'Olive Oil'
            ];
            return staticSuggestions.filter(ingredient => ingredient.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        }
    }
    async suggestCuisines(query, context = {}) {
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
        }
        catch (error) {
            console.error('AI suggestions failed, using static fallback:', error);
            const staticSuggestions = [
                'Italian',
                'French',
                'Chinese',
                'Japanese',
                'Mexican'
            ];
            return staticSuggestions.filter(cuisine => cuisine.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        }
    }
    async suggestDishes(query, context = {}) {
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
        }
        catch (error) {
            console.error('AI suggestions failed, using static fallback:', error);
            const staticSuggestions = [
                'Pasta Carbonara',
                'Beef Bourguignon',
                'Chicken Tikka Masala',
                'Sushi Roll',
                'Tacos'
            ];
            return staticSuggestions.filter(dish => dish.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        }
    }
    async generateRecipe(prompt) {
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
            return response;
        }
        catch (error) {
            console.error('Recipe generation failed:', error);
            throw new Error('Failed to generate recipe with AI');
        }
    }
}
exports.GeminiService = GeminiService;
exports.geminiService = new GeminiService();
//# sourceMappingURL=geminiService.js.map