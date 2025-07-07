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

// Popular suggestions for form fields (commented out as they're not currently used)
// const POPULAR_NUTRITIONAL_GOALS = [
//   'Weight Loss', 'Muscle Gain', 'Heart Healthy', 'High Protein', 'Low Carb', 'High Fiber'
// ];

// const POPULAR_MEAL_TYPES = [
//   'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Brunch'
// ];

// const POPULAR_EQUIPMENT = [
//   'Oven', 'Stovetop', 'Microwave', 'Air Fryer', 'Blender', 'Food Processor'
// ];

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
  const [activeTab, setActiveTab] = useState('dietary');
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

  const tabs = [
    { 
      id: 'dietary', 
      label: 'Dietary & Health',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    { 
      id: 'taste', 
      label: 'Taste & Cuisine',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      id: 'cooking', 
      label: 'Cooking Style',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
        </svg>
      )
    },
    { 
      id: 'preferences', 
      label: 'Lifestyle',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'social', 
      label: 'Inspirations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ];

  const renderDietaryTab = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="flambé-heading text-2xl mb-2">dietary & health</h2>
        <p className="flambé-body" style={{ color: 'var(--flambé-ash)' }}>essential dietary restrictions and health considerations</p>
      </div>
      <div className="preference-section">
        <div className="section-header">
          <h3 className="section-title">Dietary Requirements</h3>
          <p className="section-description">Essential dietary restrictions and health considerations</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="preference-card">
            <label className="preference-label">Dietary Restrictions</label>
            <DynamicSuggestionInput
              label=""
              selectedItems={formData.dietaryRestrictions}
              onSelectionChange={(items: string[]) => handleInputChange('dietaryRestrictions', items)}
              placeholder="Add dietary restrictions..."
              suggestionType="static"
              staticSuggestions={options?.dietaryRestrictions || POPULAR_DIETARY_RESTRICTIONS}
              popularSuggestions={POPULAR_DIETARY_RESTRICTIONS}
              tagColor="blue"
            />
          </div>
          <div className="preference-card">
            <label className="preference-label">Allergies</label>
            <DynamicSuggestionInput
              label=""
              selectedItems={formData.allergies}
              onSelectionChange={(items: string[]) => handleInputChange('allergies', items)}
              placeholder="Add allergies..."
              suggestionType="static"
              staticSuggestions={options?.allergies || POPULAR_ALLERGIES}
              popularSuggestions={POPULAR_ALLERGIES}
              tagColor="blue"
            />
          </div>
        </div>
      </div>

      <div className="preference-section">
        <div className="section-header">
          <h3 className="section-title">Nutritional Goals</h3>
          <p className="section-description">Your health and wellness objectives</p>
        </div>
        <div className="preference-card">
                      <DynamicSuggestionInput
              label=""
              selectedItems={formData.nutritionalGoals}
              onSelectionChange={(items: string[]) => handleInputChange('nutritionalGoals', items)}
              placeholder="Select nutritional goals..."
              suggestionType="static"
              staticSuggestions={convertEnumArrayToReadable(options?.nutritionalGoals || [])}
              tagColor="blue"
            />
        </div>
      </div>
    </div>
  );

  const renderTasteTab = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="flambé-heading text-2xl mb-2">taste & cuisine</h2>
        <p className="flambé-body" style={{ color: 'var(--flambé-ash)' }}>your taste preferences and culinary inspirations</p>
      </div>
      <div className="preference-section">
        <div className="section-header">
          <h3 className="section-title">Flavor Profile</h3>
          <p className="section-description">Your taste preferences and ingredient choices</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="preference-card">
            <label className="preference-label">Favorite Ingredients</label>
            <DynamicSuggestionInput
              label=""
              selectedItems={formData.favoriteIngredients}
              onSelectionChange={(items: string[]) => handleInputChange('favoriteIngredients', items)}
              placeholder="Add favorite ingredients..."
              suggestionType="ingredients"
              staticSuggestions={options?.ingredients || POPULAR_INGREDIENTS}
              popularSuggestions={POPULAR_INGREDIENTS}
              tagColor="blue"
            />
          </div>
          <div className="preference-card">
            <label className="preference-label">Disliked Foods</label>
            <DynamicSuggestionInput
              label=""
              selectedItems={formData.dislikedFoods}
              onSelectionChange={(items: string[]) => handleInputChange('dislikedFoods', items)}
              placeholder="Add foods you dislike..."
              suggestionType="ingredients"
              staticSuggestions={options?.dislikedFoods || COMMON_DISLIKED_FOODS}
              popularSuggestions={COMMON_DISLIKED_FOODS}
              tagColor="blue"
            />
          </div>
        </div>
      </div>

      <div className="preference-section">
        <div className="section-header">
          <h3 className="section-title">Cuisine Preferences</h3>
          <p className="section-description">Your favorite cuisines and signature dishes</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="preference-card">
            <label className="preference-label">Favorite Cuisines</label>
            <DynamicSuggestionInput
              label=""
              selectedItems={formData.favoriteCuisines}
              onSelectionChange={(items: string[]) => handleInputChange('favoriteCuisines', items)}
              placeholder="Search for cuisines..."
              suggestionType="static"
              staticSuggestions={options?.cuisines || POPULAR_CUISINES}
              popularSuggestions={POPULAR_CUISINES}
              tagColor="blue"
            />
          </div>
          <div className="preference-card">
            <label className="preference-label">Favorite Dishes</label>
            <DynamicSuggestionInput
              label=""
              selectedItems={formData.favoriteDishes}
              onSelectionChange={(items: string[]) => handleInputChange('favoriteDishes', items)}
              placeholder="Search for dishes..."
              suggestionType="dishes"
              staticSuggestions={options?.dishes || POPULAR_DISHES}
              popularSuggestions={POPULAR_DISHES}
              tagColor="blue"
            />
          </div>
        </div>
      </div>

      <div className="preference-section">
        <div className="section-header">
          <h3 className="section-title">Spice Preference</h3>
          <p className="section-description">How much heat do you enjoy in your food?</p>
        </div>
        <div className="preference-card">
          <div className="spice-selector">
            {['Mild', 'Medium', 'Hot', 'Extreme'].map((tolerance: string) => (
              <button
                key={tolerance}
                type="button"
                onClick={() => handleInputChange('spiceTolerance', tolerance.toUpperCase().replace(' ', '_'))}
                className={`spice-option ${formData.spiceTolerance === tolerance.toUpperCase().replace(' ', '_') ? 'selected' : ''}`}
              >
                <div className="spice-indicator">
                  {tolerance === 'Mild' && <div className="spice-dot mild"></div>}
                  {tolerance === 'Medium' && <div className="spice-dot medium"></div>}
                  {tolerance === 'Hot' && <div className="spice-dot hot"></div>}
                  {tolerance === 'Extreme' && <div className="spice-dot extreme"></div>}
                </div>
                <span className="spice-label">{tolerance}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCookingTab = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cooking & Kitchen</h2>
        <p className="text-gray-600">Your cooking experience and kitchen setup</p>
      </div>
      <div className="preference-section">
        <div className="section-header">
          <h3 className="section-title">Cooking Experience</h3>
          <p className="section-description">Your skill level and time preferences</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="preference-card">
            <label className="preference-label">Skill Level</label>
            <select
              value={formData.cookingSkillLevel}
              onChange={(e) => handleInputChange('cookingSkillLevel', e.target.value)}
              className="select-field"
            >
              {SKILL_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div className="preference-card">
            <label className="preference-label">Preferred Cooking Time (minutes)</label>
            <input
              type="number"
              value={formData.preferredCookingTime}
              onChange={(e) => handleInputChange('preferredCookingTime', e.target.value)}
              placeholder="e.g., 30"
              className="input-field"
              min="5"
              max="300"
            />
          </div>
          <div className="preference-card">
            <label className="preference-label">Typical Serving Size</label>
            <input
              type="number"
              value={formData.servingSize}
              onChange={(e) => handleInputChange('servingSize', e.target.value)}
              placeholder="e.g., 4"
              className="input-field"
              min="1"
              max="20"
            />
          </div>
        </div>
      </div>

      <div className="preference-section">
        <div className="section-header">
          <h3 className="section-title">Kitchen Setup</h3>
          <p className="section-description">Available equipment and preferred complexity</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="preference-card">
            <label className="preference-label">Available Equipment</label>
            <DynamicSuggestionInput
              label=""
              selectedItems={formData.availableEquipment}
              onSelectionChange={(items: string[]) => handleInputChange('availableEquipment', items)}
              placeholder="Select available equipment..."
              suggestionType="static"
              staticSuggestions={convertEnumArrayToReadable(options?.cookingEquipment || [])}
              tagColor="blue"
            />
          </div>
          <div className="preference-card">
            <label className="preference-label">Meal Complexity</label>
            <select
              value={formData.mealComplexity}
              onChange={(e) => handleInputChange('mealComplexity', e.target.value)}
              className="select-field"
            >
              <option value="">Select complexity</option>
              {(options?.mealComplexity || []).map((complexity: string) => (
                <option key={complexity} value={convertEnumToReadable(complexity)}>
                  {convertEnumToReadable(complexity)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="flambé-heading text-2xl mb-2">lifestyle & budget</h2>
        <p className="flambé-body" style={{ color: 'var(--flambé-ash)' }}>budget preferences and meal planning style</p>
      </div>
      <div className="preference-section">
        <div className="section-header">
          <h3 className="section-title">Lifestyle Preferences</h3>
          <p className="section-description">Budget and meal planning preferences</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="preference-card">
            <label className="preference-label">Budget Preference</label>
            <select
              value={formData.budgetPreference}
              onChange={(e) => handleInputChange('budgetPreference', e.target.value)}
              className="select-field"
            >
              <option value="">Select budget preference</option>
              {(options?.budgetPreferences || []).map((budget: string) => (
                <option key={budget} value={convertEnumToReadable(budget)}>
                  {convertEnumToReadable(budget)}
                </option>
              ))}
            </select>
          </div>
          <div className="preference-card">
            <label className="preference-label">Preferred Meal Categories</label>
            <DynamicSuggestionInput
              label=""
              selectedItems={formData.preferredMealTypes}
              onSelectionChange={(items: string[]) => handleInputChange('preferredMealTypes', items)}
              placeholder="Select meal categories..."
              suggestionType="static"
              staticSuggestions={convertEnumArrayToReadable(options?.mealTypes || [])}
              popularSuggestions={convertEnumArrayToReadable(options?.popularMealTypes || [])}
              tagColor="blue"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="flambé-heading text-2xl mb-2">culinary inspirations</h2>
        <p className="flambé-body" style={{ color: 'var(--flambé-ash)' }}>chefs and restaurants that inspire your cooking</p>
      </div>
      <div className="preference-section">
        <div className="section-header">
          <h3 className="section-title">Culinary Inspirations</h3>
          <p className="section-description">Chefs and restaurants that inspire your cooking</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="preference-card">
            <label className="preference-label">Favorite Chefs</label>
            <DynamicSuggestionInput
              label=""
              selectedItems={formData.favoriteChefs}
              onSelectionChange={(items: string[]) => handleInputChange('favoriteChefs', items)}
              placeholder="Search for chefs..."
              suggestionType="chefs"
              staticSuggestions={options?.chefs || POPULAR_CHEFS}
              popularSuggestions={POPULAR_CHEFS}
              tagColor="blue"
            />
          </div>
          <div className="preference-card">
            <label className="preference-label">Favorite Restaurants</label>
            <DynamicSuggestionInput
              label=""
              selectedItems={formData.favoriteRestaurants}
              onSelectionChange={(items: string[]) => handleInputChange('favoriteRestaurants', items)}
              placeholder="Search for restaurants..."
              suggestionType="restaurants"
              staticSuggestions={POPULAR_RESTAURANTS}
              popularSuggestions={POPULAR_RESTAURANTS}
              tagColor="blue"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dietary':
        return renderDietaryTab();
      case 'taste':
        return renderTasteTab();
      case 'cooking':
        return renderCookingTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'social':
        return renderSocialTab();
      default:
        return renderDietaryTab();
    }
  };

  return (
    <div className="preferences-container">
      <div className="preferences-header">
        <div className="header-content">
          <h1 className="page-title">preferences</h1>
          <p className="page-subtitle">
            tailor your culinary journey to your unique taste
          </p>
        </div>
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
  );
};

export default Preferences; 