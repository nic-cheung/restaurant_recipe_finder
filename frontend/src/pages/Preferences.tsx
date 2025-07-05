import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';
import { 
  UserPreferences, 
  PreferencesFormData, 
  SKILL_LEVELS, 
  DEFAULT_PREFERENCES 
} from '../types/preferences';

const Preferences: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [options, setOptions] = useState<any>(null);
  const [formData, setFormData] = useState<PreferencesFormData>({
    dietaryRestrictions: [],
    allergies: [],
    favoriteIngredients: [],
    dislikedFoods: [],
    favoriteCuisines: [],
    cookingSkillLevel: 'BEGINNER',
    preferredCookingTime: '',
    servingSize: '2',
  });

  // Load preferences and options on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [preferencesData, optionsData] = await Promise.all([
          apiService.getPreferences(),
          apiService.getPreferencesOptions(),
        ]);

        setPreferences(preferencesData);
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

      await apiService.updatePreferences(preferencesData);
      toast.success('Preferences updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArrayFieldChange = (field: keyof PreferencesFormData, value: string) => {
    if (typeof formData[field] === 'object' && Array.isArray(formData[field])) {
      const currentArray = formData[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      setFormData(prev => ({
        ...prev,
        [field]: newArray,
      }));
    }
  };

  const handleInputChange = (field: keyof PreferencesFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addCustomItem = (field: keyof PreferencesFormData, value: string) => {
    if (value.trim() && typeof formData[field] === 'object' && Array.isArray(formData[field])) {
      const currentArray = formData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        setFormData(prev => ({
          ...prev,
          [field]: [...currentArray, value.trim()],
        }));
      }
    }
  };

  const removeItem = (field: keyof PreferencesFormData, value: string) => {
    if (typeof formData[field] === 'object' && Array.isArray(formData[field])) {
      const currentArray = formData[field] as string[];
      setFormData(prev => ({
        ...prev,
        [field]: currentArray.filter(item => item !== value),
      }));
    }
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Dietary Restrictions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {options?.dietaryRestrictions?.map((restriction: string) => (
              <label key={restriction} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.dietaryRestrictions.includes(restriction)}
                  onChange={() => handleArrayFieldChange('dietaryRestrictions', restriction)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{restriction}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Allergies & Intolerances
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {options?.allergies?.map((allergy: string) => (
              <label key={allergy} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allergies.includes(allergy)}
                  onChange={() => handleArrayFieldChange('allergies', allergy)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{allergy}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Favorite Cuisines */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Favorite Cuisines
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {options?.cuisines?.map((cuisine: string) => (
              <label key={cuisine} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.favoriteCuisines.includes(cuisine)}
                  onChange={() => handleArrayFieldChange('favoriteCuisines', cuisine)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{cuisine}</span>
              </label>
            ))}
          </div>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Favorite Ingredients
            </h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.favoriteIngredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeItem('favoriteIngredients', ingredient)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add favorite ingredient..."
                  className="input-field flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomItem('favoriteIngredients', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Disliked Foods
            </h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.dislikedFoods.map((food) => (
                  <span
                    key={food}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                  >
                    {food}
                    <button
                      type="button"
                      onClick={() => removeItem('dislikedFoods', food)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add disliked food..."
                  className="input-field flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomItem('dislikedFoods', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
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