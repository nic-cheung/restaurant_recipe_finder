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
      case 'EASY': return 'tag tag-green';
      case 'MEDIUM': return 'tag tag-yellow';
      case 'HARD': return 'tag tag-orange';
      case 'EXPERT': return 'tag tag-red';
      default: return 'tag tag-gray';
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
    <div className="preference-card overflow-hidden">
      {/* Recipe Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold flambé-heading mb-2">
              {recipe.title}
            </h3>
            {recipe.description && (
              <p className="flambé-body mb-3">
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
                  ? 'hover:opacity-80' 
                  : 'hover:opacity-80'
              } disabled:opacity-50`}
              style={{ 
                color: isFavorite ? 'var(--flambé-rust)' : 'var(--flambé-smoke)'
              }}
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
            {recipe.difficulty.toLowerCase()}
          </span>
          <span className="tag tag-blue">
            {formatCookingTime(recipe.cookingTime)}
          </span>
          <span className="tag tag-purple">
            {recipe.servings} servings
          </span>
          {recipe.cuisineType && (
            <span className="tag tag-gray">
              {recipe.cuisineType}
            </span>
          )}
        </div>

        {/* User Rating Display */}
        {userRating && (
          <div className="flex items-center mb-4">
            <span className="text-sm flambé-body mr-2">your rating:</span>
            {renderStars(userRating)}
            {userNotes && (
              <span className="ml-2 text-sm flambé-body" style={{ color: 'var(--flambé-smoke)' }}>"{userNotes}"</span>
            )}
          </div>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {recipe.tags.map((tag, index) => (
              <span key={index} className="tag tag-indigo">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center font-medium transition-colors"
          style={{ color: 'var(--flambé-sage)' }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.color = 'var(--flambé-forest)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.color = 'var(--flambé-sage)';
          }}
        >
          {isExpanded ? 'hide details' : 'show details'}
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
        <div className="px-6 pb-6 border-t" style={{ borderColor: 'var(--flambé-ash)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Ingredients */}
            <div>
              <h4 className="text-lg font-semibold flambé-heading mb-3">ingredients</h4>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: 'var(--flambé-sage)' }}></span>
                    <span className="flambé-body">
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
              <h4 className="text-lg font-semibold flambé-heading mb-3">instructions</h4>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3" style={{ backgroundColor: 'var(--flambé-sage)', color: 'var(--flambé-cream)' }}>
                      {index + 1}
                    </span>
                    <span className="flambé-body">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Nutrition Info */}
          {recipe.nutritionInfo && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold flambé-heading mb-3">nutrition information</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--flambé-stone)' }}>
                <div>
                  <span className="text-sm flambé-body">calories</span>
                  <p className="font-medium flambé-body">{recipe.nutritionInfo.calories}</p>
                </div>
                <div>
                  <span className="text-sm flambé-body">protein</span>
                  <p className="font-medium flambé-body">{recipe.nutritionInfo.protein}g</p>
                </div>
                <div>
                  <span className="text-sm flambé-body">carbs</span>
                  <p className="font-medium flambé-body">{recipe.nutritionInfo.carbs}g</p>
                </div>
                <div>
                  <span className="text-sm flambé-body">fat</span>
                  <p className="font-medium flambé-body">{recipe.nutritionInfo.fat}g</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Prompt Used */}
          {(recipe as GeneratedRecipe).aiPromptUsed && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold flambé-heading mb-3">
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                ai prompt used
              </h4>
              <div className="p-4 rounded-lg space-y-4" style={{ backgroundColor: 'var(--flambé-stone)' }}>
                
                {/* Clean Version */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium flambé-heading">
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      clean version
                    </h5>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText((recipe as GeneratedRecipe).aiPromptUsed?.prompt || '');
                      }}
                      className="btn-primary text-sm"
                    >
                      copy clean
                    </button>
                  </div>
                  <p className="text-sm flambé-body mb-2">
                    perfect for chatgpt, claude, or any ai assistant:
                  </p>
                  <div className="p-3 rounded border max-h-96 overflow-y-auto" style={{ backgroundColor: 'var(--flambé-cream)', borderColor: 'var(--flambé-ash)' }}>
                    <pre className="text-sm flambé-body whitespace-pre-wrap font-mono">
                      {(recipe as GeneratedRecipe).aiPromptUsed?.prompt}
                    </pre>
                  </div>
                </div>

                {/* Technical Version */}
                {(recipe as GeneratedRecipe).aiPromptUsed?.technicalPrompt && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium flambé-heading">
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        technical version
                      </h5>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText((recipe as GeneratedRecipe).aiPromptUsed?.technicalPrompt || '');
                        }}
                        className="btn-secondary text-sm"
                      >
                        copy technical
                      </button>
                    </div>
                    <p className="text-sm flambé-body mb-2">
                      includes json formatting instructions:
                    </p>
                    <details className="rounded border" style={{ backgroundColor: 'var(--flambé-cream)', borderColor: 'var(--flambé-ash)' }}>
                      <summary className="p-3 cursor-pointer text-sm font-medium flambé-body hover:opacity-80">
                        click to expand technical version
                      </summary>
                      <div className="p-3 pt-0 max-h-96 overflow-y-auto">
                        <pre className="text-sm flambé-body whitespace-pre-wrap font-mono">
                          {(recipe as GeneratedRecipe).aiPromptUsed?.technicalPrompt}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}

                {/* Instructions */}
                <div className="border-t pt-3" style={{ borderColor: 'var(--flambé-ash)' }}>
                  <p className="text-sm flambé-body">
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <strong>tip:</strong> most ai assistants work great with the clean version. use the technical version if you need specific json formatting.
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
                  className="btn-primary"
                >
                  save recipe
                </button>
              )}

              {/* Rating Button (for saved recipes) */}
              {!isGeneratedRecipe && onRate && (
                <button
                  onClick={() => setShowRatingForm(!showRatingForm)}
                  className="btn-secondary"
                >
                  {userRating ? 'update rating' : 'rate recipe'}
                </button>
              )}
            </div>
          )}

          {/* Rating Form */}
          {showRatingForm && !isGeneratedRecipe && (
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--flambé-stone)' }}>
              <h5 className="font-medium flambé-heading mb-3">rate this recipe</h5>
              <div className="space-y-3">
                <div>
                  <label className="preference-label">
                    rating
                  </label>
                  {renderStars(rating, true)}
                </div>
                <div>
                  <label className="preference-label">
                    notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="share your thoughts about this recipe..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmitRating}
                    disabled={!rating || isSubmittingRating}
                    className="btn-primary"
                  >
                    {isSubmittingRating ? 'submitting...' : 'submit rating'}
                  </button>
                  <button
                    onClick={() => setShowRatingForm(false)}
                    className="btn-secondary"
                  >
                    cancel
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