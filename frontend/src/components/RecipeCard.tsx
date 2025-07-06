import React, { useState } from 'react';
import { SavedRecipe, GeneratedRecipe, Difficulty } from '../types/recipe';
import { apiService } from '../services/api';

interface RecipeCardProps {
  recipe: SavedRecipe | GeneratedRecipe;
  showActions?: boolean;
  onSave?: (recipe: SavedRecipe) => void;
  onRate?: (recipeId: string, rating: number, notes?: string) => void;
  onFavorite?: (recipeId: string, isFavorite: boolean) => void;
  userRating?: number;
  userNotes?: string;
  isFavorite?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  showActions = false,
  onSave,
  onRate,
  onFavorite,
  userRating,
  userNotes,
  isFavorite = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(userRating || 0);
  const [notes, setNotes] = useState(userNotes || '');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const isGeneratedRecipe = !('id' in recipe);
  const savedRecipe = recipe as SavedRecipe;

  const formatCookingTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-orange-100 text-orange-800';
      case 'EXPERT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveRecipe = async () => {
    if (onSave && isGeneratedRecipe) {
      try {
        const response = await apiService.saveRecipe(recipe);
        onSave(response.recipe);
      } catch (error) {
        console.error('Error saving recipe:', error);
      }
    }
  };

  const handleSubmitRating = async () => {
    if (!onRate || isGeneratedRecipe || !rating) return;

    setIsSubmittingRating(true);
    try {
      await onRate(savedRecipe.id, rating, notes);
      setShowRatingForm(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!onFavorite || isGeneratedRecipe) return;

    setIsTogglingFavorite(true);
    try {
      await onFavorite(savedRecipe.id, !isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={`${
              star <= currentRating 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Recipe Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {recipe.title}
            </h3>
            {recipe.description && (
              <p className="text-gray-600 mb-3">
                {recipe.description}
              </p>
            )}
          </div>
          
          {/* Favorite Button */}
          {showActions && !isGeneratedRecipe && (
            <button
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className={`ml-4 p-2 rounded-full ${
                isFavorite 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-400 hover:text-red-500'
              } disabled:opacity-50`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Recipe Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {formatCookingTime(recipe.cookingTime)}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            {recipe.servings} servings
          </span>
          {recipe.cuisineType && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
              {recipe.cuisineType}
            </span>
          )}
        </div>

        {/* User Rating Display */}
        {userRating && (
          <div className="flex items-center mb-4">
            <span className="text-sm text-gray-600 mr-2">Your rating:</span>
            {renderStars(userRating)}
            {userNotes && (
              <span className="ml-2 text-sm text-gray-500">"{userNotes}"</span>
            )}
          </div>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {recipe.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
          <svg 
            className={`ml-1 w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Ingredients */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h4>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">
                      {typeof ingredient === 'string' 
                        ? ingredient 
                        : `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
                      }
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h4>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Nutrition Info */}
          {recipe.nutritionInfo && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Nutrition Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Calories</span>
                  <p className="font-medium">{recipe.nutritionInfo.calories}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Protein</span>
                  <p className="font-medium">{recipe.nutritionInfo.protein}g</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Carbs</span>
                  <p className="font-medium">{recipe.nutritionInfo.carbs}g</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Fat</span>
                  <p className="font-medium">{recipe.nutritionInfo.fat}g</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Prompt Used */}
          {(recipe as GeneratedRecipe).aiPromptUsed && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">🤖 AI Prompt Used</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                
                {/* Clean Version */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">📋 Clean Version</h5>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText((recipe as GeneratedRecipe).aiPromptUsed?.prompt || '');
                        // Could add a toast notification here
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Copy Clean
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Perfect for ChatGPT, Claude, or any AI assistant:
                  </p>
                  <div className="bg-white p-3 rounded border border-gray-200 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {(recipe as GeneratedRecipe).aiPromptUsed?.prompt}
                    </pre>
                  </div>
                </div>

                {/* Technical Version */}
                {(recipe as GeneratedRecipe).aiPromptUsed?.technicalPrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">🔧 Technical Version</h5>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText((recipe as GeneratedRecipe).aiPromptUsed?.technicalPrompt || '');
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Copy Technical
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Includes JSON formatting instructions:
                    </p>
                    <details className="bg-white rounded border border-gray-200">
                      <summary className="p-3 cursor-pointer hover:bg-gray-50 text-sm font-medium">
                        Click to expand technical version
                      </summary>
                      <div className="p-3 pt-0 max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {(recipe as GeneratedRecipe).aiPromptUsed?.technicalPrompt}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}

                {/* Instructions */}
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Tip:</strong> Most AI assistants work great with the clean version. Use the technical version if you need specific JSON formatting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="mt-6 flex flex-wrap gap-3">
              {/* Save Button (for generated recipes) */}
              {isGeneratedRecipe && onSave && (
                <button
                  onClick={handleSaveRecipe}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                >
                  Save Recipe
                </button>
              )}

              {/* Rating Button (for saved recipes) */}
              {!isGeneratedRecipe && onRate && (
                <button
                  onClick={() => setShowRatingForm(!showRatingForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  {userRating ? 'Update Rating' : 'Rate Recipe'}
                </button>
              )}
            </div>
          )}

          {/* Rating Form */}
          {showRatingForm && !isGeneratedRecipe && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-3">Rate this recipe</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  {renderStars(rating, true)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Share your thoughts about this recipe..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmitRating}
                    disabled={!rating || isSubmittingRating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                  </button>
                  <button
                    onClick={() => setShowRatingForm(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeCard; 