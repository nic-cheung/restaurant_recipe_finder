import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { RecipeWithUserData } from '../types/recipe';
import RecipeCard from '../components/RecipeCard';

const MyRecipes: React.FC = () => {
  const { /* user */ } = useAuth(); // User info available if needed
  const [recipes, setRecipes] = useState<RecipeWithUserData[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeWithUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0
  });

  // Load recipes
  useEffect(() => {
    loadRecipes();
  }, [pagination.limit, pagination.offset]);

  // Load favorites when switching to favorites tab
  useEffect(() => {
    if (activeTab === 'favorites') {
      loadFavorites();
    }
  }, [activeTab]);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getUserRecipes(pagination.limit, pagination.offset);
      setRecipes(response.recipes);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total
      }));
    } catch (error: any) {
      setError(error.message || 'Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getFavoriteRecipes();
      setFavoriteRecipes(response.recipes);
    } catch (error: any) {
      setError(error.message || 'Failed to load favorite recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateRecipe = async (recipeId: string, rating: number, notes?: string) => {
    try {
      await apiService.rateRecipe(recipeId, { rating, notes: notes || undefined });
      // Refresh recipes to show updated rating
      loadRecipes();
    } catch (error: any) {
      console.error('Error rating recipe:', error);
    }
  };

  const handleToggleFavorite = async (recipeId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await apiService.addToFavorites(recipeId);
      } else {
        await apiService.removeFromFavorites(recipeId);
      }
      
      // Refresh both lists to keep stats accurate
      loadRecipes();
      loadFavorites();
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRecipes();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.searchRecipes(searchQuery);
      setRecipes(response.recipes);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total
      }));
    } catch (error: any) {
      setError(error.message || 'Failed to search recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newOffset: number) => {
    setPagination(prev => ({
      ...prev,
      offset: newOffset
    }));
  };

  const currentRecipes = activeTab === 'all' ? recipes : favoriteRecipes;
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--flambé-cream)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="flambé-heading text-4xl mb-2">my recipes</h1>
          <p className="flambé-body text-xl" style={{ color: 'var(--flambé-ash)' }}>
            manage your saved recipes and favorites
          </p>
        </div>

        {/* Search and Filters */}
        <div className="preference-card mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="search your recipes..."
                  className="input-field pl-10"
                />
                <svg 
                  className="absolute left-3 top-3.5 h-5 w-5" 
                  style={{ color: 'var(--flambé-smoke)' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="btn-primary"
            >
              search
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
                loadRecipes();
              }}
              className="btn-secondary"
            >
              clear
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="tab-navigation">
            <button
              onClick={() => setActiveTab('all')}
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            >
              all recipes ({pagination.total})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
            >
              favorites ({favoriteRecipes.length})
            </button>
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-sm border" style={{ 
            backgroundColor: 'rgba(166, 124, 82, 0.1)', 
            borderColor: 'var(--flambé-rust)' 
          }}>
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" style={{ color: 'var(--flambé-rust)' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="flambé-body text-sm font-medium" style={{ color: 'var(--flambé-rust)' }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8" style={{ color: 'var(--flambé-sage)' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="flambé-body text-lg" style={{ color: 'var(--flambé-ash)' }}>
                loading recipes...
              </span>
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {!isLoading && currentRecipes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {currentRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showActions={true}
                onRate={handleRateRecipe}
                onFavorite={handleToggleFavorite}
                {...(recipe.userRecipe?.rating && { userRating: recipe.userRecipe.rating })}
                {...(recipe.userRecipe?.notes && { userNotes: recipe.userRecipe.notes })}
                isFavorite={recipe.userRecipe?.isFavorite || false}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && currentRecipes.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--flambé-smoke)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="flambé-heading text-lg mb-2">
              {activeTab === 'all' ? 'no recipes found' : 'no favorite recipes yet'}
            </h3>
            <p className="flambé-body mb-4" style={{ color: 'var(--flambé-ash)' }}>
              {activeTab === 'all' 
                ? searchQuery 
                  ? 'try adjusting your search terms or create some new recipes.'
                  : 'start by generating some recipes to build your collection.'
                : 'mark recipes as favorites to see them here.'
              }
            </p>
            {activeTab === 'all' && !searchQuery && (
              <a
                href="/generate"
                className="btn-primary inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                generate recipe
              </a>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && currentRecipes.length > 0 && activeTab === 'all' && totalPages > 1 && (
          <div className="preference-card flex items-center justify-between">
            <div className="flex items-center">
              <span className="flambé-body text-sm" style={{ color: 'var(--flambé-ash)' }}>
                showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} recipes
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.offset - pagination.limit)}
                disabled={pagination.offset === 0}
                className="btn-secondary text-sm px-3 py-1"
              >
                previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange((pageNum - 1) * pagination.limit)}
                      className={`px-3 py-1 rounded-sm text-sm transition-all duration-200 ${
                        pageNum === currentPage
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="btn-secondary text-sm px-3 py-1"
              >
                next
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {!isLoading && recipes.length > 0 && (
          <div className="mt-8 preference-card">
            <h3 className="flambé-heading text-lg mb-4">recipe collection stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold flambé-heading" style={{ color: 'var(--flambé-sage)' }}>
                  {recipes.length}
                </div>
                <div className="flambé-body text-sm" style={{ color: 'var(--flambé-ash)' }}>
                  total recipes
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flambé-heading" style={{ color: 'var(--flambé-rust)' }}>
                  {favoriteRecipes.length}
                </div>
                <div className="flambé-body text-sm" style={{ color: 'var(--flambé-ash)' }}>
                  favorites
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flambé-heading" style={{ color: 'var(--flambé-forest)' }}>
                  {recipes.filter(r => r.userRecipe?.rating).length}
                </div>
                <div className="flambé-body text-sm" style={{ color: 'var(--flambé-ash)' }}>
                  rated
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flambé-heading" style={{ color: 'var(--flambé-ember)' }}>
                  {Math.round(recipes.filter(r => r.userRecipe?.rating).reduce((sum, r) => sum + (r.userRecipe?.rating || 0), 0) / recipes.filter(r => r.userRecipe?.rating).length) || 0}
                </div>
                <div className="flambé-body text-sm" style={{ color: 'var(--flambé-ash)' }}>
                  avg rating
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecipes; 