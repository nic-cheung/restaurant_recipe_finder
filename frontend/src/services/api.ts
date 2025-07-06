import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { 
  UserPreferences, 
  UpdateUserPreferences, 
  PreferencesResponse, 
  PreferencesSummaryResponse, 
  PreferencesOptionsResponse 
} from '../types/preferences';
import {
  RecipeGenerationRequest,
  RecipeGenerationResponse,
  RecipeSaveResponse,
  UserRecipesResponse,
  RecipeDetailsResponse,
  RecipeRatingRequest,
  RecipeVariationRequest,
  RecipeVariationResponse,
  FavoriteRecipesResponse,
  GenerateAndSaveResponse,
  ApiErrorResponse
} from '../types/recipe';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const authHeaders = this.getAuthHeaders();
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout (slightly longer than backend)
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url,
          config
        });
        
        // Create error with more details
        const error = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).response = { status: response.status, data: errorData };
        throw error;
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Handle backend response format
    if (response.success && response.data) {
      return response.data;
    }
    
    return response;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Handle backend response format
    if (response.success && response.data) {
      return response.data;
    }
    
    return response;
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<any>('/auth/me');
    
    // Handle backend response format
    if (response.success && response.data && response.data.user) {
      return response.data.user;
    }
    
    return response;
  }

  async checkEmailAvailability(email: string): Promise<{ available: boolean; email: string }> {
    const response = await this.request<any>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    
    // Handle backend response format
    if (response.success && response.data) {
      return response.data;
    }
    
    return response;
  }

  // Preferences methods
  async getPreferences(): Promise<UserPreferences> {
    const response = await this.request<PreferencesResponse>('/preferences');
    return response.data.preferences;
  }

  async updatePreferences(preferences: UpdateUserPreferences): Promise<UserPreferences> {
    const response = await this.request<PreferencesResponse>('/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    return response.data.preferences;
  }

  async patchPreferences(preferences: Partial<UpdateUserPreferences>): Promise<UserPreferences> {
    const response = await this.request<PreferencesResponse>('/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    return response.data.preferences;
  }

  async deletePreferences(): Promise<void> {
    await this.request<void>('/preferences', {
      method: 'DELETE',
    });
  }

  async getPreferencesSummary(): Promise<any> {
    const response = await this.request<PreferencesSummaryResponse>('/preferences/summary');
    return response.data.summary;
  }

  async getPreferencesOptions(): Promise<any> {
    const response = await this.request<PreferencesOptionsResponse>('/preferences/options');
    return response.data;
  }

  async getChefSuggestions(query: string = ''): Promise<{ suggestions: string[]; query: string; source: string }> {
    const endpoint = query ? `/preferences/suggestions/chefs?query=${encodeURIComponent(query)}` : '/preferences/suggestions/chefs';
    const response = await this.request<{ success: boolean; data: { suggestions: string[]; query: string; source: string } }>(endpoint);
    return response.data;
  }

  async getRestaurantSuggestions(query: string = '', location: string = ''): Promise<{ suggestions: string[]; query: string; location: string; source: string }> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (location) params.append('location', location);
    
    const endpoint = `/preferences/suggestions/restaurants${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.request<{ success: boolean; data: { suggestions: string[]; query: string; location: string; source: string } }>(endpoint);
    return response.data;
  }

  async getIngredientSuggestions(query: string = ''): Promise<{ suggestions: string[]; query: string; source: string }> {
    const endpoint = query ? `/preferences/suggestions/ingredients?query=${encodeURIComponent(query)}` : '/preferences/suggestions/ingredients';
    const response = await this.request<{ success: boolean; data: { suggestions: string[]; query: string; source: string } }>(endpoint);
    return response.data;
  }

  async getCuisineSuggestions(query: string = ''): Promise<{ suggestions: string[]; query: string; source: string }> {
    const endpoint = query ? `/preferences/suggestions/cuisines?query=${encodeURIComponent(query)}` : '/preferences/suggestions/cuisines';
    const response = await this.request<{ success: boolean; data: { suggestions: string[]; query: string; source: string } }>(endpoint);
    return response.data;
  }

  async getDishSuggestions(query: string = ''): Promise<{ suggestions: string[]; query: string; source: string }> {
    const endpoint = query ? `/preferences/suggestions/dishes?query=${encodeURIComponent(query)}` : '/preferences/suggestions/dishes';
    const response = await this.request<{ success: boolean; data: { suggestions: string[]; query: string; source: string } }>(endpoint);
    return response.data;
  }

  // Recipe methods
  async generateRecipe(request: RecipeGenerationRequest): Promise<RecipeGenerationResponse> {
    return this.request<RecipeGenerationResponse>('/recipes/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async saveRecipe(recipeData: any): Promise<RecipeSaveResponse> {
    return this.request<RecipeSaveResponse>('/recipes/save', {
      method: 'POST',
      body: JSON.stringify({ recipe: recipeData }),
    });
  }

  async generateAndSaveRecipe(request: RecipeGenerationRequest): Promise<GenerateAndSaveResponse> {
    return this.request<GenerateAndSaveResponse>('/recipes/generate-and-save', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getUserRecipes(limit: number = 10, offset: number = 0): Promise<UserRecipesResponse> {
    return this.request<UserRecipesResponse>(`/recipes/my-recipes?limit=${limit}&offset=${offset}`);
  }

  async getRecipeDetails(recipeId: string): Promise<RecipeDetailsResponse> {
    return this.request<RecipeDetailsResponse>(`/recipes/${recipeId}`);
  }

  async rateRecipe(recipeId: string, request: RecipeRatingRequest): Promise<any> {
    return this.request<any>(`/recipes/${recipeId}/rate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateRecipeVariation(recipeId: string, request: RecipeVariationRequest): Promise<RecipeVariationResponse> {
    return this.request<RecipeVariationResponse>(`/recipes/${recipeId}/variation`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async addToFavorites(recipeId: string): Promise<any> {
    return this.request<any>(`/recipes/${recipeId}/favorite`, {
      method: 'POST',
    });
  }

  async removeFromFavorites(recipeId: string): Promise<any> {
    return this.request<any>(`/recipes/${recipeId}/favorite`, {
      method: 'DELETE',
    });
  }

  async getFavoriteRecipes(): Promise<FavoriteRecipesResponse> {
    return this.request<FavoriteRecipesResponse>('/recipes/favorites');
  }

  async searchRecipes(query: string = ''): Promise<UserRecipesResponse> {
    return this.request<UserRecipesResponse>(`/recipes/search?query=${encodeURIComponent(query)}`);
  }

  // Utility methods
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Generic methods for direct API calls
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const options: RequestInit = {
      method: 'POST',
    };
    
    if (data !== undefined) {
      options.body = JSON.stringify(data);
    }
    
    return this.request<T>(endpoint, options);
  }
}

export const apiService = new ApiService(); 