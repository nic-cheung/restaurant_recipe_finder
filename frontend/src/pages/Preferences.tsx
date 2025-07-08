import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';
import { 
  PreferencesFormData,
  SKILL_LEVELS
} from '../types/preferences';

import DynamicSuggestionInput from '../components/DynamicSuggestionInput';
import '../index.css';

// Define popular options for each category - Updated based on 2024-2025 research data
const POPULAR_DIETARY_RESTRICTIONS = [
  'gluten-free', 'vegetarian', 'Keto', 'dairy-free', 'vegan'
];

const POPULAR_ALLERGIES = [
  'nuts', 'shellfish', 'dairy', 'eggs', 'soy'
];

const COMMON_DISLIKED_FOODS = [
  'cilantro', 'mushrooms', 'anchovies', 'blue cheese', 'liver'
];

const POPULAR_INGREDIENTS = [
  'garlic', 'onions', 'tomatoes', 'olive oil', 'ginger'
];

const POPULAR_CUISINES = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian'
];

const POPULAR_DISHES = [
  'pizza', 'pasta', 'tacos', 'sushi', 'curry'
];

// Popular suggestions for form fields
const POPULAR_NUTRITIONAL_GOALS = [
  'weight loss', 'muscle gain', 'heart healthy', 'high protein', 'low carb', 'high fiber'
];

const POPULAR_MEAL_TYPES = [
  'breakfast', 'lunch', 'dinner', 'snacks', 'desserts', 'brunch'
];

const POPULAR_EQUIPMENT = [
  'oven', 'stovetop', 'microwave', 'air fryer', 'blender', 'food processor'
];

const POPULAR_CHEFS = [
  'Joël Robuchon', 'Alain Ducasse', 'Thomas Keller', 'René Redzepi', 'Massimo Bottura'
];

const POPULAR_RESTAURANTS = [
  'Noma', 'Central', 'Osteria Francescana', 'Eleven Madison Park', 'The French Laundry'
];

// Convert enum values to human-readable format
const convertEnumToReadable = (enumValue: string): string => {
  return enumValue
    .split('_')
    .map(word => word.toLowerCase())
    .join(' ');
};

// Convert array of enum values to human-readable format
const convertEnumArrayToReadable = (enumArray: string[]): string[] => {
  return enumArray.map(convertEnumToReadable);
};

// Convert human-readable format back to enum
const convertReadableToEnum = (readable: string): string => {
  return readable.toUpperCase().replace(/\s+/g, '_');
};

// Convert array of human-readable values back to enum format
const convertReadableArrayToEnum = (readableArray: string[]): string[] => {
  return readableArray.map(convertReadableToEnum);
};

const Preferences: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dietary-health');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<any>(null);
  const [formData, setFormData] = useState<PreferencesFormData>({
    dietaryRestrictions: [],
    allergies: [],
    favoriteIngredients: [],
    dislikedFoods: [],
    favoriteCuisines: [],
    favoriteDishes: [],
    favoriteChefs: [],
    favoriteRestaurants: [],
    cookingSkillLevel: 'BEGINNER',
    preferredCookingTime: '',
    servingSize: '',
    
    // New comprehensive preference fields
    nutritionalGoals: [],
    budgetPreference: 'MODERATE',
    preferredMealTypes: [],
    availableEquipment: [],
    mealComplexity: 'SIMPLE',
    
    // Spice tolerance
    spiceTolerance: 'MEDIUM',
  });

  // Load preferences and options on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [preferencesResponse, optionsResponse] = await Promise.all([
          apiService.getPreferences(),
          apiService.getPreferencesOptions()
        ]);

        if (preferencesResponse && typeof preferencesResponse === 'object' && 'success' in preferencesResponse) {
          const response = preferencesResponse as { success: boolean; data?: any };
          if (response.success && response.data) {
            const prefs = response.data;
            setFormData({
              dietaryRestrictions: prefs.dietaryRestrictions || [],
              allergies: prefs.allergies || [],
              favoriteIngredients: prefs.favoriteIngredients || [],
              dislikedFoods: prefs.dislikedFoods || [],
              favoriteCuisines: prefs.favoriteCuisines || [],
              favoriteDishes: prefs.favoriteDishes || [],
              favoriteChefs: prefs.favoriteChefs || [],
              favoriteRestaurants: prefs.favoriteRestaurants || [],
              cookingSkillLevel: prefs.cookingSkillLevel || 'BEGINNER',
              preferredCookingTime: prefs.preferredCookingTime?.toString() || '',
              servingSize: prefs.servingSize?.toString() || '',
              
              // New comprehensive preference fields - convert enum values to human-readable format
              nutritionalGoals: convertEnumArrayToReadable(prefs.nutritionalGoals || []),
              budgetPreference: convertEnumToReadable(prefs.budgetPreference || 'MODERATE') as any,
              preferredMealTypes: convertEnumArrayToReadable(prefs.preferredMealTypes || []),
              availableEquipment: convertEnumArrayToReadable(prefs.availableEquipment || []),
              mealComplexity: convertEnumToReadable(prefs.mealComplexity || 'SIMPLE') as any,
              
              // Spice tolerance
              spiceTolerance: prefs.spiceTolerance || 'MEDIUM',
            });
          }
        } else if (preferencesResponse && typeof preferencesResponse === 'object') {
          // Direct preferences object
          const prefs = preferencesResponse as any;
          setFormData({
            dietaryRestrictions: prefs.dietaryRestrictions || [],
            allergies: prefs.allergies || [],
            favoriteIngredients: prefs.favoriteIngredients || [],
            dislikedFoods: prefs.dislikedFoods || [],
            favoriteCuisines: prefs.favoriteCuisines || [],
            favoriteDishes: prefs.favoriteDishes || [],
            favoriteChefs: prefs.favoriteChefs || [],
            favoriteRestaurants: prefs.favoriteRestaurants || [],
            cookingSkillLevel: prefs.cookingSkillLevel || 'BEGINNER',
            preferredCookingTime: prefs.preferredCookingTime?.toString() || '',
            servingSize: prefs.servingSize?.toString() || '',
            
            // New comprehensive preference fields - convert enum values to human-readable format
            nutritionalGoals: convertEnumArrayToReadable(prefs.nutritionalGoals || []),
            budgetPreference: convertEnumToReadable(prefs.budgetPreference || 'MODERATE') as any,
            preferredMealTypes: convertEnumArrayToReadable(prefs.preferredMealTypes || []),
            availableEquipment: convertEnumArrayToReadable(prefs.availableEquipment || []),
            mealComplexity: convertEnumToReadable(prefs.mealComplexity || 'SIMPLE') as any,
            
            // Spice tolerance
            spiceTolerance: prefs.spiceTolerance || 'MEDIUM',
          });
        }

        if (optionsResponse && typeof optionsResponse === 'object' && 'success' in optionsResponse) {
          const response = optionsResponse as { success: boolean; data?: any };
          if (response.success) {
            setOptions(response.data);
          }
        } else if (optionsResponse && typeof optionsResponse === 'object') {
          setOptions(optionsResponse);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        toast.error('Failed to load preferences');
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedPreferences = {
        ...formData,
        preferredCookingTime: formData.preferredCookingTime ? parseInt(formData.preferredCookingTime) : null,
        servingSize: formData.servingSize ? parseInt(formData.servingSize) : null,
        // Convert human-readable values to database enum values
        nutritionalGoals: convertReadableArrayToEnum(formData.nutritionalGoals) as any,
        budgetPreference: convertReadableToEnum(formData.budgetPreference) as any,
        preferredMealTypes: convertReadableArrayToEnum(formData.preferredMealTypes) as any,
        availableEquipment: convertReadableArrayToEnum(formData.availableEquipment) as any,
        mealComplexity: convertReadableToEnum(formData.mealComplexity) as any,
        spiceTolerance: formData.spiceTolerance, // This one is already in the correct format
      };

      const response = await apiService.updatePreferences(updatedPreferences);
      
      if (response && typeof response === 'object' && 'success' in response) {
        const apiResponse = response as { success: boolean; error?: string };
        if (apiResponse.success) {
          toast.success('Preferences saved successfully!');
          navigate('/dashboard');
        } else {
          toast.error(apiResponse.error || 'Failed to save preferences');
        }
      } else {
        toast.success('Preferences saved successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const renderDietaryHealthTab = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flambé-heading mb-2">dietary & health</h2>
        <p className="flambé-body">manage your dietary needs and health goals</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="preference-label">
            dietary restrictions
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.dietaryRestrictions}
            onSelectionChange={(items: string[]) => handleInputChange('dietaryRestrictions', items)}
            placeholder="add your dietary restrictions..."
            suggestionType="static"
            staticSuggestions={options?.dietaryRestrictions || POPULAR_DIETARY_RESTRICTIONS}
            popularSuggestions={POPULAR_DIETARY_RESTRICTIONS}
            tagColor="blue"
          />
        </div>

        <div>
          <label className="preference-label">
            allergies
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.allergies}
            onSelectionChange={(items: string[]) => handleInputChange('allergies', items)}
            placeholder="add any food allergies..."
            suggestionType="static"
            staticSuggestions={options?.allergies || POPULAR_ALLERGIES}
            popularSuggestions={POPULAR_ALLERGIES}
            tagColor="red"
          />
        </div>

        <div>
          <label className="preference-label">
            nutritional goals
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.nutritionalGoals}
            onSelectionChange={(items: string[]) => handleInputChange('nutritionalGoals', items)}
            placeholder="what are your health goals..."
            suggestionType="static"
            staticSuggestions={convertEnumArrayToReadable(options?.nutritionalGoals || [])}
            popularSuggestions={POPULAR_NUTRITIONAL_GOALS}
            tagColor="green"
          />
        </div>
        
        <div>
          <label className="preference-label">
            spice tolerance
          </label>
          <select
            value={formData.spiceTolerance}
            onChange={(e) => handleInputChange('spiceTolerance', e.target.value)}
            className="input-field"
          >
            <option value="">select spice tolerance</option>
            {(options?.spiceTolerances || ['MILD', 'MEDIUM', 'HOT', 'VERY_HOT']).map((spice: string) => (
              <option key={spice} value={spice}>
                {convertEnumToReadable(spice)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderCookingPreferencesTab = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flambé-heading mb-2">cooking preferences</h2>
        <p className="flambé-body">tell us about your cooking style and kitchen setup</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="preference-label">
            cooking skill level
          </label>
          <select
            value={formData.cookingSkillLevel}
            onChange={(e) => handleInputChange('cookingSkillLevel', e.target.value)}
            className="input-field"
          >
            <option value="">select skill level</option>
            {SKILL_LEVELS.map((skill) => (
              <option key={skill.value} value={skill.value}>
                {skill.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="preference-label">
            preferred cooking time (minutes)
          </label>
          <input
            type="number"
            value={formData.preferredCookingTime}
            onChange={(e) => handleInputChange('preferredCookingTime', e.target.value)}
            className="input-field"
            placeholder="e.g., 30"
            min="5"
            max="240"
          />
        </div>
        
        <div>
          <label className="preference-label">
            typical serving size
          </label>
          <input
            type="number"
            value={formData.servingSize}
            onChange={(e) => handleInputChange('servingSize', e.target.value)}
            className="input-field"
            placeholder="e.g., 4"
            min="1"
            max="12"
          />
        </div>
        
        <div>
          <label className="preference-label">
            meal complexity preference
          </label>
          <select
            value={formData.mealComplexity}
            onChange={(e) => handleInputChange('mealComplexity', e.target.value)}
            className="input-field"
          >
            <option value="">select complexity</option>
            {(options?.mealComplexities || ['SIMPLE', 'MODERATE', 'COMPLEX']).map((complexity: string) => (
              <option key={complexity} value={complexity}>
                {convertEnumToReadable(complexity)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="preference-label">
            available equipment
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.availableEquipment}
            onSelectionChange={(items: string[]) => handleInputChange('availableEquipment', items)}
            placeholder="select your kitchen equipment..."
            suggestionType="static"
            staticSuggestions={convertEnumArrayToReadable(options?.equipment || [])}
            popularSuggestions={POPULAR_EQUIPMENT}
            tagColor="orange"
          />
        </div>
        
        <div>
          <label className="preference-label">
            budget preference
          </label>
          <select
            value={formData.budgetPreference}
            onChange={(e) => handleInputChange('budgetPreference', e.target.value)}
            className="input-field"
          >
            <option value="">select budget preference</option>
            {(options?.budgetPreferences || ['BUDGET', 'MODERATE', 'PREMIUM']).map((budget: string) => (
              <option key={budget} value={budget}>
                {convertEnumToReadable(budget)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="preference-label">
            preferred meal categories
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.preferredMealTypes}
            onSelectionChange={(items: string[]) => handleInputChange('preferredMealTypes', items)}
            placeholder="select meal categories you enjoy..."
            suggestionType="static"
            staticSuggestions={convertEnumArrayToReadable(options?.mealTypes || [])}
            popularSuggestions={POPULAR_MEAL_TYPES}
            tagColor="orange"
          />
        </div>
      </div>
    </div>
  );

  const renderCulinaryInspirationsTab = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flambé-heading mb-2">culinary inspirations</h2>
        <p className="flambé-body">share your favorite flavors, cuisines, and culinary inspirations</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="preference-label">
            favorite cuisines
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.favoriteCuisines}
            onSelectionChange={(items: string[]) => handleInputChange('favoriteCuisines', items)}
            placeholder="search for cuisines you love..."
            suggestionType="static"
            staticSuggestions={options?.cuisines || POPULAR_CUISINES}
            popularSuggestions={POPULAR_CUISINES}
            tagColor="blue"
          />
        </div>
        
        <div>
          <label className="preference-label">
            favorite dishes
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.favoriteDishes}
            onSelectionChange={(items: string[]) => handleInputChange('favoriteDishes', items)}
            placeholder="search for dishes you enjoy..."
            suggestionType="dishes"
            staticSuggestions={options?.dishes || POPULAR_DISHES}
            popularSuggestions={POPULAR_DISHES}
            tagColor="purple"
          />
        </div>
        
        <div>
          <label className="preference-label">
            favorite ingredients
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.favoriteIngredients}
            onSelectionChange={(items: string[]) => handleInputChange('favoriteIngredients', items)}
            placeholder="search for ingredients you love..."
            suggestionType="ingredients"
            staticSuggestions={options?.ingredients || POPULAR_INGREDIENTS}
            popularSuggestions={POPULAR_INGREDIENTS}
            tagColor="green"
          />
        </div>
        
        <div>
          <label className="preference-label">
            foods you dislike
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.dislikedFoods}
            onSelectionChange={(items: string[]) => handleInputChange('dislikedFoods', items)}
            placeholder="add foods you prefer to avoid..."
            suggestionType="static"
            staticSuggestions={options?.dislikedFoods || COMMON_DISLIKED_FOODS}
            popularSuggestions={COMMON_DISLIKED_FOODS}
            tagColor="red"
          />
        </div>
        
        <div>
          <label className="preference-label">
            favorite chefs
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.favoriteChefs}
            onSelectionChange={(items: string[]) => handleInputChange('favoriteChefs', items)}
            placeholder="search for chefs who inspire you..."
            suggestionType="chefs"
            staticSuggestions={options?.chefs || POPULAR_CHEFS}
            popularSuggestions={POPULAR_CHEFS}
            tagColor="orange"
          />
        </div>
        
        <div>
          <label className="preference-label">
            favorite restaurants
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={formData.favoriteRestaurants}
            onSelectionChange={(items: string[]) => handleInputChange('favoriteRestaurants', items)}
            placeholder="search for restaurants you love..."
            suggestionType="restaurants"
            staticSuggestions={POPULAR_RESTAURANTS}
            popularSuggestions={POPULAR_RESTAURANTS}
            tagColor="orange"
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dietary-health':
        return renderDietaryHealthTab();
      case 'cooking-preferences':
        return renderCookingPreferencesTab();
      case 'culinary-inspirations':
        return renderCulinaryInspirationsTab();
      default:
        return renderDietaryHealthTab();
    }
  };

  const tabs = [
    { 
      id: 'dietary-health', 
      label: 'dietary & health',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    { 
      id: 'cooking-preferences', 
      label: 'cooking preferences',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
        </svg>
      )
    },
    { 
      id: 'culinary-inspirations', 
      label: 'culinary inspirations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--flambé-cream)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flambé-heading mb-2">preferences</h1>
          <p className="text-xl flambé-body">tailor your culinary journey to your unique taste</p>
        </div>

      <div className="preferences-body">
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="preferences-form">
          <div className="tab-content">
            {renderTabContent()}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'saving...' : 'save preferences'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Preferences; 