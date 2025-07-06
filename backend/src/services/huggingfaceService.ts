import axios from 'axios';

export class HuggingFaceService {
  private apiKey: string;
  private baseUrl = 'https://api-inference.huggingface.co/models';

  constructor() {
    this.apiKey = process.env['HUGGINGFACE_API_KEY'] || '';
  }

  private async generateText(prompt: string, model: string = 'microsoft/DialoGPT-medium'): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${model}`,
        {
          inputs: prompt,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data[0]?.generated_text || '';
    } catch (error) {
      console.error('Hugging Face API Error:', error);
      throw new Error('Failed to generate suggestions');
    }
  }

  async suggestChefs(query: string): Promise<string[]> {
    const prompt = `List 5 famous chefs whose names contain "${query}":`;
    
    try {
      const response = await this.generateText(prompt);
      // Parse response into array of chef names
      const chefs = response.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);
      
      return chefs.length > 0 ? chefs : this.getFallbackChefs(query);
    } catch (error) {
      return this.getFallbackChefs(query);
    }
  }

  async suggestRestaurants(query: string): Promise<string[]> {
    const prompt = `List 5 famous restaurants whose names contain "${query}":`;
    
    try {
      const response = await this.generateText(prompt);
      const restaurants = response.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);
      
      return restaurants.length > 0 ? restaurants : this.getFallbackRestaurants(query);
    } catch (error) {
      return this.getFallbackRestaurants(query);
    }
  }

  async suggestIngredients(query: string): Promise<string[]> {
    const prompt = `List 5 cooking ingredients that contain "${query}":`;
    
    try {
      const response = await this.generateText(prompt);
      const ingredients = response.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);
      
      return ingredients.length > 0 ? ingredients : this.getFallbackIngredients(query);
    } catch (error) {
      return this.getFallbackIngredients(query);
    }
  }

  async suggestCuisines(query: string): Promise<string[]> {
    const prompt = `List 5 cuisine types that contain "${query}":`;
    
    try {
      const response = await this.generateText(prompt);
      const cuisines = response.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);
      
      return cuisines.length > 0 ? cuisines : this.getFallbackCuisines(query);
    } catch (error) {
      return this.getFallbackCuisines(query);
    }
  }

  async suggestDishes(query: string): Promise<string[]> {
    const prompt = `List 5 dishes that contain "${query}":`;
    
    try {
      const response = await this.generateText(prompt);
      const dishes = response.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);
      
      return dishes.length > 0 ? dishes : this.getFallbackDishes(query);
    } catch (error) {
      return this.getFallbackDishes(query);
    }
  }

  // Fallback methods (same as OpenAI service)
  private getFallbackChefs(query: string): string[] {
    const allChefs = ['Gordon Ramsay', 'Julia Child', 'Anthony Bourdain', 'Emeril Lagasse', 'Wolfgang Puck'];
    return allChefs.filter(chef => 
      chef.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  private getFallbackRestaurants(query: string): string[] {
    const allRestaurants = ['The French Laundry', 'Eleven Madison Park', 'Noma', 'El Celler de Can Roca', 'Osteria Francescana'];
    return allRestaurants.filter(restaurant => 
      restaurant.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  private getFallbackIngredients(query: string): string[] {
    const allIngredients = ['tomatoes', 'onions', 'garlic', 'basil', 'olive oil', 'chicken', 'beef', 'salmon', 'pasta', 'rice'];
    return allIngredients.filter(ingredient => 
      ingredient.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  private getFallbackCuisines(query: string): string[] {
    const allCuisines = ['Italian', 'French', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai', 'Mediterranean'];
    return allCuisines.filter(cuisine => 
      cuisine.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  private getFallbackDishes(query: string): string[] {
    const allDishes = ['pasta carbonara', 'chicken tikka masala', 'beef bourguignon', 'sushi rolls', 'tacos', 'pizza margherita'];
    return allDishes.filter(dish => 
      dish.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }
}

export const huggingfaceService = new HuggingFaceService(); 