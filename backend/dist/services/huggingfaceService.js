"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.huggingfaceService = exports.HuggingFaceService = void 0;
const axios_1 = __importDefault(require("axios"));
class HuggingFaceService {
    constructor() {
        this.baseUrl = 'https://api-inference.huggingface.co/models';
        this.apiKey = process.env['HUGGINGFACE_API_KEY'] || '';
    }
    async generateText(prompt, model = 'microsoft/DialoGPT-medium') {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/${model}`, {
                inputs: prompt,
                parameters: {
                    max_length: 100,
                    temperature: 0.7,
                    return_full_text: false
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data[0]?.generated_text || '';
        }
        catch (error) {
            console.error('Hugging Face API Error:', error);
            throw new Error('Failed to generate suggestions');
        }
    }
    async suggestChefs(query) {
        const prompt = `List 5 famous chefs whose names contain "${query}":`;
        try {
            const response = await this.generateText(prompt);
            const chefs = response.split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .slice(0, 5);
            return chefs.length > 0 ? chefs : this.getFallbackChefs(query);
        }
        catch (error) {
            return this.getFallbackChefs(query);
        }
    }
    async suggestRestaurants(query) {
        const prompt = `List 5 famous restaurants whose names contain "${query}":`;
        try {
            const response = await this.generateText(prompt);
            const restaurants = response.split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .slice(0, 5);
            return restaurants.length > 0 ? restaurants : this.getFallbackRestaurants(query);
        }
        catch (error) {
            return this.getFallbackRestaurants(query);
        }
    }
    async suggestIngredients(query) {
        const prompt = `List 5 cooking ingredients that contain "${query}":`;
        try {
            const response = await this.generateText(prompt);
            const ingredients = response.split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .slice(0, 5);
            return ingredients.length > 0 ? ingredients : this.getFallbackIngredients(query);
        }
        catch (error) {
            return this.getFallbackIngredients(query);
        }
    }
    async suggestCuisines(query) {
        const prompt = `List 5 cuisine types that contain "${query}":`;
        try {
            const response = await this.generateText(prompt);
            const cuisines = response.split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .slice(0, 5);
            return cuisines.length > 0 ? cuisines : this.getFallbackCuisines(query);
        }
        catch (error) {
            return this.getFallbackCuisines(query);
        }
    }
    async suggestDishes(query) {
        const prompt = `List 5 dishes that contain "${query}":`;
        try {
            const response = await this.generateText(prompt);
            const dishes = response.split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .slice(0, 5);
            return dishes.length > 0 ? dishes : this.getFallbackDishes(query);
        }
        catch (error) {
            return this.getFallbackDishes(query);
        }
    }
    getFallbackChefs(query) {
        const allChefs = ['Gordon Ramsay', 'Julia Child', 'Anthony Bourdain', 'Emeril Lagasse', 'Wolfgang Puck'];
        return allChefs.filter(chef => chef.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    }
    getFallbackRestaurants(query) {
        const allRestaurants = ['The French Laundry', 'Eleven Madison Park', 'Noma', 'El Celler de Can Roca', 'Osteria Francescana'];
        return allRestaurants.filter(restaurant => restaurant.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    }
    getFallbackIngredients(query) {
        const allIngredients = ['tomatoes', 'onions', 'garlic', 'basil', 'olive oil', 'chicken', 'beef', 'salmon', 'pasta', 'rice'];
        return allIngredients.filter(ingredient => ingredient.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    }
    getFallbackCuisines(query) {
        const allCuisines = ['Italian', 'French', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai', 'Mediterranean'];
        return allCuisines.filter(cuisine => cuisine.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    }
    getFallbackDishes(query) {
        const allDishes = ['pasta carbonara', 'chicken tikka masala', 'beef bourguignon', 'sushi rolls', 'tacos', 'pizza margherita'];
        return allDishes.filter(dish => dish.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    }
}
exports.HuggingFaceService = HuggingFaceService;
exports.huggingfaceService = new HuggingFaceService();
//# sourceMappingURL=huggingfaceService.js.map