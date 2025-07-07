import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

import { PreferencesFormData, SKILL_LEVELS } from '../types/preferences';
import DynamicSuggestionInput from './DynamicSuggestionInput';

// Helper functions to convert between human-readable labels and enum values
const convertReadableToEnum = (readable: string): string => {
  return readable.toUpperCase().replace(/\s+/g, '_');
};

const convertEnumToReadable = (enumValue: string): string => {
  return enumValue
    .split('_')
    .map(word => word.toLowerCase())
    .join(' ');
};

const convertEnumArrayToReadable = (enumArray: string[]): string[] => {
  return enumArray.map(convertEnumToReadable);
};

// Popular options for each category - Updated based on 2024-2025 research data
const POPULAR_DIETARY_RESTRICTIONS = [
  'gluten-free', 'vegetarian', 'Keto', 'dairy-free', 'vegan'
];

const POPULAR_ALLERGIES = [
  'nuts', 'shellfish', 'dairy', 'eggs', 'soy'
];

const POPULAR_CUISINES = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian'
];

const COMMON_INGREDIENTS = [
  'garlic', 'onions', 'tomatoes', 'olive oil', 'ginger'
];

const COMMON_DISLIKED_FOODS = [
  'cilantro', 'mushrooms', 'anchovies', 'blue cheese', 'liver'
];

const POPULAR_DISHES = [
  'pizza', 'pasta', 'tacos', 'sushi', 'curry'
];

const POPULAR_CHEFS = [
  'Joël Robuchon', 'Alain Ducasse', 'Thomas Keller', 'René Redzepi', 'Massimo Bottura'
];

const POPULAR_RESTAURANTS = [
  'Noma', 'Central', 'Osteria Francescana', 'Eleven Madison Park', 'The French Laundry'
];

// Popular nutritional goals based on 2024-2025 health trends
const POPULAR_NUTRITIONAL_GOALS = [
  'weight loss', 'muscle gain', 'heart healthy', 'high protein', 'anti inflammatory'
];

// Popular cooking equipment for home kitchens
const POPULAR_COOKING_EQUIPMENT = [
  'oven', 'stovetop', 'air fryer', 'blender', 'instant pot'
];

interface AccountFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const MultiStepRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<any>(null);
  
  // Account form data
  const [accountData, setAccountData] = useState<AccountFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Preferences form data
  const [preferencesData, setPreferencesData] = useState<PreferencesFormData>({
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

  // Load options from backend on component mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Use the public endpoint since user isn't authenticated during registration
        const response = await fetch('http://localhost:8000/api/preferences/public/options', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setOptions(data.data);
          }
        }
      } catch (error) {
        console.error('Error loading options:', error);
        // Continue with hardcoded fallbacks if API fails
      }
    };

    loadOptions();
  }, []);

  const handleAccountInputChange = (field: keyof AccountFormData, value: string) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferencesInputChange = (field: keyof PreferencesFormData, value: string) => {
    setPreferencesData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagSelectionChange = (field: keyof PreferencesFormData, items: string[]) => {
    setPreferencesData(prev => ({
      ...prev,
      [field]: items,
    }));
  };

  const validateAccountStep = (): boolean => {
    if (!accountData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!accountData.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!accountData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (accountData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(accountData.password)) {
      toast.error('Password must contain at least one lowercase letter, one uppercase letter, and one number');
      return false;
    }
    if (accountData.password !== accountData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!validateAccountStep()) {
        return;
      }
      
      // Check email availability before proceeding
      setIsLoading(true);
      try {
        const result = await apiService.checkEmailAvailability(accountData.email);
        if (!result.available) {
          toast.error('An account with this email already exists. Please use a different email or try logging in.');
          setIsLoading(false);
          return;
        }
      } catch (error: any) {
        console.error('Email availability check error:', error);
        toast.error('Unable to verify email availability. Please try again.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleStepClick = async (stepId: number) => {
    // Don't allow navigation to a step beyond the current progress
    // unless the user has already completed step 1 (account creation)
    if (stepId > currentStep && currentStep === 1) {
      // If trying to skip ahead from step 1, validate account first
      if (!validateAccountStep()) {
        return;
      }
      
      // Check email availability before allowing navigation
      setIsLoading(true);
      try {
        const result = await apiService.checkEmailAvailability(accountData.email);
        if (!result.available) {
          toast.error('This email is already registered. Please use a different email or sign in.');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking email availability:', error);
        toast.error('Unable to verify email. Please try again.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }
    
    // Allow navigation to any step that's been reached or is the next step
    if (stepId <= Math.max(currentStep + 1, 1)) {
      setCurrentStep(stepId);
    }
  };

  const handleSkipPreferences = async () => {
    setIsLoading(true);
    try {
      // Register user using auth context (this handles everything)
      await register({
        name: accountData.name,
        email: accountData.email,
        password: accountData.password,
      });
      
      toast.success('Account created successfully! You can set preferences later.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different error formats
      let errorMessage = 'Registration failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    setIsLoading(true);
    try {
      console.log('Starting registration with data:', {
        name: accountData.name,
        email: accountData.email,
        password: '***'
      });

      // Register user using auth context (this handles everything)
      await register({
        name: accountData.name,
        email: accountData.email,
        password: accountData.password,
      });
      
      console.log('Registration successful, waiting for auth state to update...');
      
      // Wait longer for the auth state to be fully updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Setting preferences...');
      console.log('Current token before preferences:', apiService.getToken());
      console.log('Current user from context:', user);
      
      // Set preferences
      const preferences = {
        dietaryRestrictions: preferencesData.dietaryRestrictions,
        allergies: preferencesData.allergies,
        favoriteIngredients: preferencesData.favoriteIngredients,
        dislikedFoods: preferencesData.dislikedFoods,
        favoriteCuisines: preferencesData.favoriteCuisines,
        favoriteDishes: preferencesData.favoriteDishes,
        favoriteChefs: preferencesData.favoriteChefs,
        favoriteRestaurants: preferencesData.favoriteRestaurants,
        cookingSkillLevel: preferencesData.cookingSkillLevel,
        preferredCookingTime: preferencesData.preferredCookingTime ? parseInt(preferencesData.preferredCookingTime) : null,
        servingSize: preferencesData.servingSize ? parseInt(preferencesData.servingSize) : null,
        spiceTolerance: preferencesData.spiceTolerance,
        
        // New comprehensive preferences - convert human-readable to enum values
        nutritionalGoals: preferencesData.nutritionalGoals.map(convertReadableToEnum) as any,
        budgetPreference: preferencesData.budgetPreference,
        preferredMealTypes: preferencesData.preferredMealTypes.map(convertReadableToEnum) as any,
        availableEquipment: preferencesData.availableEquipment.map(convertReadableToEnum) as any,
        mealComplexity: preferencesData.mealComplexity,
      };
      
      console.log('Setting preferences:', preferences);
      
      // Double-check token is available
      const currentToken = apiService.getToken();
      if (!currentToken) {
        throw new Error('No authentication token found after registration');
      }
      
      try {
        await apiService.updatePreferences(preferences);
        console.log('Preferences set successfully!');
        toast.success('Welcome! Your account and preferences have been set up.');
        navigate('/welcome');
      } catch (preferencesError: any) {
        console.error('Preferences setting failed:', preferencesError);
        
        // If preferences setting fails, still consider registration successful
        // and redirect to dashboard where they can set preferences later
        toast.success('Account created successfully! You can set your preferences from your dashboard.');
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error('Registration error details:', {
        error,
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
      // Handle different error formats
      let errorMessage = 'Registration failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'account setup', description: 'create your account' },
    { id: 2, title: 'dietary & health', description: 'dietary restrictions & health goals' },
    { id: 3, title: 'taste & cuisine', description: 'flavor preferences & cuisines' },
    { id: 4, title: 'cooking style', description: 'kitchen setup & cooking preferences' },
    { id: 5, title: 'lifestyle & inspirations', description: 'budget, meal categories & inspirations' },
  ];

  const renderStepIndicator = () => (
    <div 
      className="px-8 py-6 rounded-t-2xl"
      style={{ 
        background: 'linear-gradient(135deg, var(--flambé-ember) 0%, var(--flambé-charcoal) 100%)' 
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.svg" 
            alt="flambé" 
            className="h-8 w-auto brightness-0 invert"
          />
          <h1 className="flambé-logo text-xl" style={{ color: 'var(--flambé-cream)' }}>
            join flambé
          </h1>
        </div>
        <span 
          className="text-sm font-medium flambé-body"
          style={{ color: 'rgba(250, 248, 245, 0.8)' }}
        >
          step {currentStep} of {steps.length}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div 
        className="w-full rounded-full h-2 mb-4"
        style={{ backgroundColor: 'rgba(44, 62, 45, 0.3)' }}
      >
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${(currentStep / steps.length) * 100}%`,
            backgroundColor: 'var(--flambé-cream)'
          }}
        />
      </div>
      
      {/* Step Indicators */}
      <div className="flex justify-between">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isAccessible = step.id <= Math.max(currentStep + 1, 1);
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <button
                onClick={() => handleStepClick(step.id)}
                disabled={!isAccessible || isLoading}
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  isAccessible && !isLoading 
                    ? 'cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2' 
                    : 'cursor-not-allowed'
                }`}
                                 style={{
                   backgroundColor: currentStep >= step.id 
                     ? 'var(--flambé-cream)' 
                     : 'rgba(44, 62, 45, 0.3)',
                   color: currentStep >= step.id 
                     ? 'var(--flambé-ember)' 
                     : 'rgba(250, 248, 245, 0.6)',
                   transform: isAccessible && !isLoading && !isCurrent ? 'scale(1)' : undefined,
                   boxShadow: isCurrent ? '0 0 0 2px rgba(250, 248, 245, 0.5)' : undefined
                 }}
                onMouseEnter={(e) => {
                  if (isAccessible && !isLoading && !isCurrent) {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isAccessible && !isLoading && !isCurrent) {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }
                }}
                title={isAccessible ? `Go to ${step.title}` : `Complete previous steps to access ${step.title}`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.icon
                )}
              </button>
              <span 
                className="text-xs text-center max-w-20 leading-tight flambé-body"
                style={{
                  color: currentStep >= step.id 
                    ? 'var(--flambé-cream)' 
                    : 'rgba(250, 248, 245, 0.6)'
                }}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAccountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flambé-heading mb-2">create your account</h2>
        <p className="flambé-body">let's start with your basic information</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="preference-label">
            full name
          </label>
          <input
            type="text"
            value={accountData.name}
            onChange={(e) => handleAccountInputChange('name', e.target.value)}
            className="input-field"
            placeholder="enter your full name"
            required
          />
        </div>
        
        <div>
          <label className="preference-label">
            email address
          </label>
          <input
            type="email"
            value={accountData.email}
            onChange={(e) => handleAccountInputChange('email', e.target.value)}
            className="input-field"
            placeholder="enter your email"
            required
          />
        </div>
        
        <div>
          <label className="preference-label">
            password
          </label>
          <input
            type="password"
            value={accountData.password}
            onChange={(e) => handleAccountInputChange('password', e.target.value)}
            className="input-field"
            placeholder="create a password (min 8 characters, uppercase, lowercase, and numbers)"
            required
          />
        </div>
        
        <div>
          <label className="preference-label">
            confirm password
          </label>
          <input
            type="password"
            value={accountData.confirmPassword}
            onChange={(e) => handleAccountInputChange('confirmPassword', e.target.value)}
            className="input-field"
            placeholder="confirm your password"
            required
          />
        </div>
      </div>
      
      {/* Development-only test data button */}
      {window.location.hostname === 'localhost' && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setAccountData({
                name: 'Test User',
                email: 'test@test.dev',
                password: 'Test123!',
                confirmPassword: 'Test123!'
              });
            }}
            className="w-full flex justify-center py-2 px-4 border border-dashed text-sm font-medium rounded-md transition-colors"
            style={{ 
              borderColor: 'var(--flambé-ember)', 
              color: 'var(--flambé-rust)', 
              backgroundColor: 'var(--flambé-fog)' 
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-fog)';
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
            fill test data (dev only)
          </button>
          <p className="mt-1 text-xs text-center flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            auto-fills form with test credentials for development
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flambé-body transition-colors duration-200"
          style={{ color: 'var(--flambé-ember)' }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-rust)'}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-ember)'}
        >
          already have an account? sign in
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'checking email...' : 'next step'}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flambé-heading mb-2">dietary & health</h2>
        <p className="flambé-body">let's understand your dietary needs and health goals</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="preference-label">
            dietary restrictions
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={preferencesData.dietaryRestrictions}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('dietaryRestrictions', items)}
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
            selectedItems={preferencesData.allergies}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('allergies', items)}
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
            selectedItems={preferencesData.nutritionalGoals}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('nutritionalGoals', items)}
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
            value={preferencesData.spiceTolerance}
            onChange={(e) => handlePreferencesInputChange('spiceTolerance', e.target.value)}
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
      
      {/* Development-only test data button for step 2 */}
      {window.location.hostname === 'localhost' && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setPreferencesData(prev => ({
                ...prev,
                dietaryRestrictions: ['vegetarian', 'gluten-free'],
                allergies: ['nuts', 'shellfish'],
                nutritionalGoals: ['weight loss', 'heart healthy', 'high protein'],
                spiceTolerance: 'MEDIUM'
              }));
            }}
            className="w-full flex justify-center py-2 px-4 border border-dashed text-sm font-medium rounded-md transition-colors"
            style={{ 
              borderColor: 'var(--flambé-ember)', 
              color: 'var(--flambé-rust)', 
              backgroundColor: 'var(--flambé-fog)' 
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-fog)';
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
            fill test dietary & health data (dev only)
          </button>
          <p className="mt-1 text-xs text-center flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            auto-fills dietary restrictions, allergies, nutritional goals, and spice tolerance
          </p>
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="btn-secondary"
        >
          previous
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="btn-primary"
        >
          next step
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flambé-heading mb-2">taste & cuisine</h2>
        <p className="flambé-body">tell us about your favorite flavors and cuisines</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="preference-label">
            favorite cuisines
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={preferencesData.favoriteCuisines}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('favoriteCuisines', items)}
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
            selectedItems={preferencesData.favoriteDishes}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('favoriteDishes', items)}
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
            selectedItems={preferencesData.favoriteIngredients}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('favoriteIngredients', items)}
            placeholder="search for ingredients you love..."
            suggestionType="ingredients"
            staticSuggestions={options?.ingredients || COMMON_INGREDIENTS}
            popularSuggestions={COMMON_INGREDIENTS}
            tagColor="green"
          />
        </div>
        
        <div>
          <label className="preference-label">
            foods you dislike
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={preferencesData.dislikedFoods}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('dislikedFoods', items)}
            placeholder="add foods you prefer to avoid..."
            suggestionType="static"
            staticSuggestions={options?.dislikedFoods || COMMON_DISLIKED_FOODS}
            popularSuggestions={COMMON_DISLIKED_FOODS}
            tagColor="red"
          />
        </div>
      </div>
      
      {/* Development-only test data button for step 3 */}
      {window.location.hostname === 'localhost' && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setPreferencesData(prev => ({
                ...prev,
                favoriteCuisines: ['Italian', 'Mexican', 'Japanese'],
                favoriteDishes: ['pizza', 'pasta', 'tacos', 'sushi'],
                favoriteIngredients: ['garlic', 'basil', 'tomatoes', 'olive oil'],
                dislikedFoods: ['cilantro', 'mushrooms', 'blue cheese']
              }));
            }}
            className="w-full flex justify-center py-2 px-4 border border-dashed text-sm font-medium rounded-md transition-colors"
            style={{ 
              borderColor: 'var(--flambé-ember)', 
              color: 'var(--flambé-rust)', 
              backgroundColor: 'var(--flambé-fog)' 
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-fog)';
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
            fill test taste & cuisine data (dev only)
          </button>
          <p className="mt-1 text-xs text-center flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            auto-fills cuisines, dishes, ingredients, and disliked foods
          </p>
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="btn-secondary"
        >
          previous
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="btn-primary"
        >
          next step
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flambé-heading mb-2">cooking style</h2>
        <p className="flambé-body">help us understand your cooking preferences and setup</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="preference-label">
              cooking skill level
            </label>
            <select
              value={preferencesData.cookingSkillLevel}
              onChange={(e) => handlePreferencesInputChange('cookingSkillLevel', e.target.value)}
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
              value={preferencesData.preferredCookingTime}
              onChange={(e) => handlePreferencesInputChange('preferredCookingTime', e.target.value)}
              className="input-field"
              placeholder="e.g., 30"
              min="1"
              max="300"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="preference-label">
              typical serving size
            </label>
            <input
              type="number"
              value={preferencesData.servingSize}
              onChange={(e) => handlePreferencesInputChange('servingSize', e.target.value)}
              className="input-field"
              placeholder="number of people"
              min="1"
              max="20"
            />
          </div>
          
          <div>
            <label className="preference-label">
              meal complexity preference
            </label>
            <select
              value={preferencesData.mealComplexity}
              onChange={(e) => handlePreferencesInputChange('mealComplexity', e.target.value)}
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
        </div>
        
        <div>
          <label className="preference-label">
            available kitchen equipment
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={preferencesData.availableEquipment}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('availableEquipment', items)}
            placeholder="select your kitchen equipment..."
            suggestionType="static"
            staticSuggestions={convertEnumArrayToReadable(options?.cookingEquipment || [])}
            popularSuggestions={POPULAR_COOKING_EQUIPMENT}
            tagColor="orange"
          />
        </div>
      </div>
      
      {/* Development-only test data button for step 4 */}
      {window.location.hostname === 'localhost' && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setPreferencesData(prev => ({
                ...prev,
                cookingSkillLevel: 'INTERMEDIATE',
                preferredCookingTime: '30',
                servingSize: '4',
                mealComplexity: 'MODERATE',
                availableEquipment: ['oven', 'stovetop', 'air fryer', 'blender', 'instant pot']
              }));
            }}
            className="w-full flex justify-center py-2 px-4 border border-dashed text-sm font-medium rounded-md transition-colors"
            style={{ 
              borderColor: 'var(--flambé-ember)', 
              color: 'var(--flambé-rust)', 
              backgroundColor: 'var(--flambé-fog)' 
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-fog)';
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
            fill test cooking style data (dev only)
          </button>
          <p className="mt-1 text-xs text-center flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            auto-fills skill level, cooking time, serving size, complexity, and equipment
          </p>
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="btn-secondary"
        >
          previous
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="btn-primary"
        >
          next step
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold flambé-heading mb-2">lifestyle & inspirations</h2>
        <p className="flambé-body">final touches: budget preferences and culinary inspirations</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="preference-label">
            budget preference
          </label>
          <select
            value={preferencesData.budgetPreference}
            onChange={(e) => handlePreferencesInputChange('budgetPreference', e.target.value)}
            className="input-field"
          >
            <option value="">select budget preference</option>
            {(options?.budgetPreferences || []).map((budget: string) => (
              <option key={budget} value={convertEnumToReadable(budget)}>
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
            selectedItems={preferencesData.preferredMealTypes}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('preferredMealTypes', items)}
            placeholder="select meal categories you enjoy..."
            suggestionType="static"
            staticSuggestions={convertEnumArrayToReadable(options?.mealTypes || [])}
            popularSuggestions={convertEnumArrayToReadable(options?.popularMealTypes || [])}
            tagColor="orange"
          />
        </div>
        
        <div>
          <label className="preference-label">
            favorite chefs
          </label>
          <DynamicSuggestionInput
            label=""
            selectedItems={preferencesData.favoriteChefs}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('favoriteChefs', items)}
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
            selectedItems={preferencesData.favoriteRestaurants}
            onSelectionChange={(items: string[]) => handleTagSelectionChange('favoriteRestaurants', items)}
            placeholder="search for restaurants you love..."
            suggestionType="restaurants"
            staticSuggestions={POPULAR_RESTAURANTS}
            popularSuggestions={POPULAR_RESTAURANTS}
            tagColor="orange"
          />
        </div>
      </div>
      
      {/* Development-only test data button for step 5 */}
      {window.location.hostname === 'localhost' && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setPreferencesData(prev => ({
                ...prev,
                budgetPreference: 'MODERATE',
                preferredMealTypes: ['breakfast', 'dinner', 'snacks'],
                favoriteChefs: ['Thomas Keller', 'René Redzepi', 'Massimo Bottura'],
                favoriteRestaurants: ['The French Laundry', 'Noma', 'Osteria Francescana']
              }));
            }}
            className="w-full flex justify-center py-2 px-4 border border-dashed text-sm font-medium rounded-md transition-colors"
            style={{ 
              borderColor: 'var(--flambé-ember)', 
              color: 'var(--flambé-rust)', 
              backgroundColor: 'var(--flambé-fog)' 
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-fog)';
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
            fill test lifestyle & inspirations data (dev only)
          </button>
          <p className="mt-1 text-xs text-center flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            auto-fills budget preference, meal types, favorite chefs, and restaurants
          </p>
        </div>
      )}
      
      {/* Development-only comprehensive test data button */}
      {window.location.hostname === 'localhost' && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              setPreferencesData({
                ...preferencesData,
                // Step 2: Dietary & Health
                dietaryRestrictions: ['vegetarian', 'gluten-free'],
                allergies: ['nuts', 'shellfish'],
                nutritionalGoals: ['weight loss', 'heart healthy', 'high protein'],
                spiceTolerance: 'MEDIUM',
                // Step 3: Taste & Cuisine
                favoriteCuisines: ['Italian', 'Mexican', 'Japanese'],
                favoriteDishes: ['pizza', 'pasta', 'tacos', 'sushi'],
                favoriteIngredients: ['garlic', 'basil', 'tomatoes', 'olive oil'],
                dislikedFoods: ['cilantro', 'mushrooms', 'blue cheese'],
                // Step 4: Cooking Style
                cookingSkillLevel: 'INTERMEDIATE',
                preferredCookingTime: '30',
                servingSize: '4',
                mealComplexity: 'MODERATE',
                availableEquipment: ['oven', 'stovetop', 'air fryer', 'blender', 'instant pot'],
                // Step 5: Lifestyle & Inspirations
                budgetPreference: 'MODERATE',
                preferredMealTypes: ['breakfast', 'dinner', 'snacks'],
                favoriteChefs: ['Thomas Keller', 'René Redzepi', 'Massimo Bottura'],
                favoriteRestaurants: ['The French Laundry', 'Noma', 'Osteria Francescana']
              });
            }}
            className="w-full flex justify-center py-2 px-4 border border-dashed text-sm font-medium rounded-md transition-colors"
            style={{ 
              borderColor: 'var(--flambé-sage)', 
              color: 'var(--flambé-charcoal)', 
              backgroundColor: 'var(--flambé-cream)' 
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-cream)';
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            fill ALL test data (dev only)
          </button>
          <p className="mt-1 text-xs text-center flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
            auto-fills all preferences across all steps for comprehensive testing
          </p>
        </div>
      )}
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="btn-secondary"
        >
          previous
        </button>
        <button
          type="button"
          onClick={handleCompleteRegistration}
          disabled={isLoading}
          className="btn-primary disabled:opacity-50"
        >
          {isLoading ? 'creating account...' : 'create account'}
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--flambé-cream)' }}
    >
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl">
        {renderStepIndicator()}
        
        {/* Form Content */}
        <div className="p-8 pb-20">
          {currentStep === 1 && renderAccountStep()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>
      </div>
    </div>
  );
};

export default MultiStepRegistration; 