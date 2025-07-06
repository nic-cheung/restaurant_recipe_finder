import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { 
  UserPreferences, 
  UpdateUserPreferences, 
  PreferencesResponse, 
  PreferencesSummaryResponse, 
  PreferencesOptionsResponse 
} from '../types/preferences';
import {
  GenerateRecipeRequest,
  RecipeResponse,
  SaveRecipeRequest,
  SavedRecipeResponse,
  UserRecipesResponse,
  RecipeDetailsResponse,
  UpdateRecipeRatingRequest,
  RecipeVariationRequest,
  IngredientSubstitutionRequest,
  SubstitutionsResponse,
  FavoriteResponse,
  RecipeQueryOptions
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
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
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

  async getRestaurantSuggestions(query: string = ''): Promise<{ suggestions: string[]; query: string; source: string }> {
    const endpoint = query ? `/preferences/suggestions/restaurants?query=${encodeURIComponent(query)}` : '/preferences/suggestions/restaurants';
    const response = await this.request<{ success: boolean; data: { suggestions: string[]; query: string; source: string } }>(endpoint);
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
  async generateRecipe(request: GenerateRecipeRequest): Promise<RecipeResponse> {
    return this.request<RecipeResponse>('/recipes/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async saveRecipe(request: SaveRecipeRequest): Promise<SavedRecipeResponse> {
    return this.request<SavedRecipeResponse>('/recipes/save', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getUserRecipes(options: RecipeQueryOptions = {}): Promise<UserRecipesResponse> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `/recipes/user?${queryString}` : '/recipes/user';
    
    return this.request<UserRecipesResponse>(endpoint);
  }

  async getRecipeDetails(recipeId: string): Promise<RecipeDetailsResponse> {
    return this.request<RecipeDetailsResponse>(`/recipes/${recipeId}`);
  }

  async updateRecipeRating(recipeId: string, request: UpdateRecipeRatingRequest): Promise<any> {
    return this.request<any>(`/recipes/${recipeId}/rating`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async generateRecipeVariation(recipeId: string, request: RecipeVariationRequest): Promise<RecipeResponse> {
    return this.request<RecipeResponse>(`/recipes/${recipeId}/variation`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getIngredientSubstitutions(request: IngredientSubstitutionRequest): Promise<SubstitutionsResponse> {
    return this.request<SubstitutionsResponse>('/recipes/substitutions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async toggleFavoriteRecipe(recipeId: string): Promise<FavoriteResponse> {
    return this.request<FavoriteResponse>(`/recipes/${recipeId}/favorite`, {
      method: 'POST',
    });
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
}

export const apiService = new ApiService(); 