import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';
import { 
  PreferencesFormData,
  SKILL_LEVELS
} from '../types/preferences';
import TagSelector from '../components/TagSelector';
import IngredientInput from '../components/IngredientInput';

// Define popular options for each category
const POPULAR_DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'
];

const POPULAR_ALLERGIES = [
  'Nuts', 'Peanuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy'
];

const POPULAR_CUISINES = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 'French', 'Mediterranean'
];

// Common ingredient suggestions
const COMMON_INGREDIENTS = [
  'Garlic', 'Onion', 'Tomato', 'Basil', 'Oregano', 'Thyme', 'Rosemary', 'Parsley',
  'Olive Oil', 'Butter', 'Lemon', 'Lime', 'Ginger', 'Cilantro', 'Paprika', 'Cumin',
  'Black Pepper', 'Salt', 'Cheese', 'Chicken', 'Beef', 'Fish', 'Pasta', 'Rice',
  'Potatoes', 'Carrots', 'Bell Peppers', 'Mushrooms', 'Spinach', 'Broccoli'
];

const COMMON_DISLIKED_FOODS = [
  'Mushrooms', 'Onions', 'Cilantro', 'Olives', 'Anchovies', 'Blue Cheese', 'Liver',
  'Oysters', 'Brussel Sprouts', 'Cauliflower', 'Eggplant', 'Beets', 'Asparagus',
  'Coconut', 'Avocado', 'Tofu', 'Quinoa', 'Kale', 'Spinach', 'Fish', 'Seafood'
];

const Preferences: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [options, setOptions] = useState<any>(null);
  const [formData, setFormData] = useState<PreferencesFormData>({
    dietaryRestrictions: [],
    allergies: [],
    favoriteIngredients: [],
    dislikedFoods: [],
    favoriteCuisines: [],
    cookingSkillLevel: 'BEGINNER',
    preferredCookingTime: '',
    servingSize: '',
  });

  // Load preferences and options on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [preferencesData, optionsData] = await Promise.all([
          apiService.getPreferences(),
          apiService.getPreferencesOptions(),
        ]);

        setOptions(optionsData);

        // Populate form with existing preferences
        setFormData({
          dietaryRestrictions: preferencesData.dietaryRestrictions || [],
          allergies: preferencesData.allergies || [],
          favoriteIngredients: preferencesData.favoriteIngredients || [],
          dislikedFoods: preferencesData.dislikedFoods || [],
          favoriteCuisines: preferencesData.favoriteCuisines || [],
          cookingSkillLevel: preferencesData.cookingSkillLevel || 'BEGINNER',
          preferredCookingTime: preferencesData.preferredCookingTime?.toString() || '',
          servingSize: preferencesData.servingSize?.toString() || '2',
        });
      } catch (error) {
        console.error('Error loading preferences:', error);
        toast.error('Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const preferencesData = {
        dietaryRestrictions: formData.dietaryRestrictions,
        allergies: formData.allergies,
        favoriteIngredients: formData.favoriteIngredients,
        dislikedFoods: formData.dislikedFoods,
        favoriteCuisines: formData.favoriteCuisines,
        cookingSkillLevel: formData.cookingSkillLevel,
        preferredCookingTime: formData.preferredCookingTime ? parseInt(formData.preferredCookingTime) : null,
        servingSize: formData.servingSize ? parseInt(formData.servingSize) : null,
      };

      console.log('Updating preferences with data:', preferencesData);
      console.log('Current token:', apiService.getToken());

      await apiService.updatePreferences(preferencesData);
      toast.success('Preferences updated successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
      // Show more specific error message
      let errorMessage = 'Failed to update preferences';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof PreferencesFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagSelectionChange = (field: keyof PreferencesFormData, items: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: items,
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Preferences
        </h1>
        <p className="text-lg text-gray-600">
          Customize your cooking experience by setting your dietary preferences, favorite ingredients, and cooking style.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dietary Restrictions */}
        <div className="card">
          <TagSelector
            label="Dietary Restrictions"
            popularOptions={POPULAR_DIETARY_RESTRICTIONS}
            allOptions={options?.dietaryRestrictions || []}
            selectedItems={formData.dietaryRestrictions}
            onSelectionChange={(items) => handleTagSelectionChange('dietaryRestrictions', items)}
            placeholder="Search for dietary restrictions..."
            maxPopularTags={6}
          />
        </div>

        {/* Allergies */}
        <div className="card">
          <TagSelector
            label="Allergies & Intolerances"
            popularOptions={POPULAR_ALLERGIES}
            allOptions={options?.allergies || []}
            selectedItems={formData.allergies}
            onSelectionChange={(items) => handleTagSelectionChange('allergies', items)}
            placeholder="Search for allergies..."
            maxPopularTags={6}
          />
        </div>

        {/* Favorite Cuisines */}
        <div className="card">
          <TagSelector
            label="Favorite Cuisines"
            popularOptions={POPULAR_CUISINES}
            allOptions={options?.cuisines || []}
            selectedItems={formData.favoriteCuisines}
            onSelectionChange={(items) => handleTagSelectionChange('favoriteCuisines', items)}
            placeholder="Search for cuisines..."
            maxPopularTags={8}
          />
        </div>

        {/* Cooking Preferences */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cooking Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cooking Skill Level
              </label>
              <select
                value={formData.cookingSkillLevel}
                onChange={(e) => handleInputChange('cookingSkillLevel', e.target.value)}
                className="input-field"
              >
                {SKILL_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Cooking Time (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={formData.preferredCookingTime}
                onChange={(e) => handleInputChange('preferredCookingTime', e.target.value)}
                className="input-field"
                placeholder="e.g., 30"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum time you'd like to spend cooking
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Serving Size
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.servingSize}
                onChange={(e) => handleInputChange('servingSize', e.target.value)}
                className="input-field"
                placeholder="e.g., 2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of people you usually cook for
              </p>
            </div>
          </div>
        </div>

        {/* Custom Ingredients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <IngredientInput
              label="Favorite Ingredients"
              selectedItems={formData.favoriteIngredients}
              onSelectionChange={(items) => handleTagSelectionChange('favoriteIngredients', items)}
              placeholder="Type to search or add ingredients..."
              suggestions={COMMON_INGREDIENTS}
              tagColor="green"
            />
          </div>

          <div className="card">
            <IngredientInput
              label="Disliked Foods"
              selectedItems={formData.dislikedFoods}
              onSelectionChange={(items) => handleTagSelectionChange('dislikedFoods', items)}
              placeholder="Type to search or add foods..."
              suggestions={COMMON_DISLIKED_FOODS}
              tagColor="red"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Preferences; 