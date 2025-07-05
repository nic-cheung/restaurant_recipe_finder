import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TagSelector from './TagSelector';
import IngredientInput from './IngredientInput';
import { PreferencesFormData, SKILL_LEVELS } from '../types/preferences';

// Popular options for each category
const POPULAR_DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'
];

const POPULAR_ALLERGIES = [
  'Nuts', 'Peanuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy'
];

const POPULAR_CUISINES = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 'French', 'Mediterranean'
];

const COMMON_INGREDIENTS = [
  'Garlic', 'Onion', 'Tomato', 'Basil', 'Oregano', 'Thyme', 'Rosemary', 'Parsley',
  'Olive Oil', 'Butter', 'Lemon', 'Lime', 'Ginger', 'Cilantro', 'Paprika', 'Cumin',
  'Black Pepper', 'Salt', 'Cheese', 'Chicken', 'Beef', 'Fish', 'Pasta', 'Rice'
];

const COMMON_DISLIKED_FOODS = [
  'Mushrooms', 'Onions', 'Cilantro', 'Olives', 'Anchovies', 'Blue Cheese', 'Liver',
  'Oysters', 'Brussel Sprouts', 'Cauliflower', 'Eggplant', 'Beets', 'Asparagus'
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
    cookingSkillLevel: 'BEGINNER',
    preferredCookingTime: '30',
    servingSize: '2',
  });

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
    setCurrentStep(prev => prev - 1);
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
        cookingSkillLevel: preferencesData.cookingSkillLevel,
        preferredCookingTime: preferencesData.preferredCookingTime ? parseInt(preferencesData.preferredCookingTime) : null,
        servingSize: preferencesData.servingSize ? parseInt(preferencesData.servingSize) : null,
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* Step 1 */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className={`h-1 w-12 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        
        {/* Step 2 */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
        <div className={`h-1 w-12 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        
        {/* Step 3 */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          3
        </div>
      </div>
    </div>
  );

  const renderAccountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
        <p className="text-gray-600">Let's start with your basic information</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={accountData.name}
            onChange={(e) => handleAccountInputChange('name', e.target.value)}
            className="input-field"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={accountData.email}
            onChange={(e) => handleAccountInputChange('email', e.target.value)}
            className="input-field"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={accountData.password}
            onChange={(e) => handleAccountInputChange('password', e.target.value)}
            className="input-field"
            placeholder="Create a password (min 8 characters, uppercase, lowercase, and numbers)"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={accountData.confirmPassword}
            onChange={(e) => handleAccountInputChange('confirmPassword', e.target.value)}
            className="input-field"
            placeholder="Confirm your password"
            required
          />
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-blue-600 hover:text-blue-800"
        >
          Already have an account? Sign in
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Checking email...' : 'Next Step'}
        </button>
      </div>
    </div>
  );

  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Us About Your Preferences</h2>
        <p className="text-gray-600">This helps us recommend recipes you'll love</p>
      </div>
      
      <div className="space-y-6">
        {/* Dietary Restrictions */}
        <div className="card">
          <TagSelector
            label="Dietary Restrictions"
            popularOptions={POPULAR_DIETARY_RESTRICTIONS}
            allOptions={POPULAR_DIETARY_RESTRICTIONS}
            selectedItems={preferencesData.dietaryRestrictions}
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
            allOptions={POPULAR_ALLERGIES}
            selectedItems={preferencesData.allergies}
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
            allOptions={POPULAR_CUISINES}
            selectedItems={preferencesData.favoriteCuisines}
            onSelectionChange={(items) => handleTagSelectionChange('favoriteCuisines', items)}
            placeholder="Search for cuisines..."
            maxPopularTags={8}
          />
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="btn-secondary"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="btn-primary"
        >
          Next Step
        </button>
      </div>
    </div>
  );

  const renderFinalStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost Done!</h2>
        <p className="text-gray-600">Add some ingredients and cooking preferences</p>
      </div>
      
      <div className="space-y-6">
        {/* Ingredients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <IngredientInput
              label="Favorite Ingredients"
              selectedItems={preferencesData.favoriteIngredients}
              onSelectionChange={(items) => handleTagSelectionChange('favoriteIngredients', items)}
              placeholder="Type ingredients you love..."
              suggestions={COMMON_INGREDIENTS}
              tagColor="green"
            />
          </div>

          <div className="card">
            <IngredientInput
              label="Disliked Foods"
              selectedItems={preferencesData.dislikedFoods}
              onSelectionChange={(items) => handleTagSelectionChange('dislikedFoods', items)}
              placeholder="Type foods you avoid..."
              suggestions={COMMON_DISLIKED_FOODS}
              tagColor="red"
            />
          </div>
        </div>

        {/* Cooking Preferences */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cooking Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cooking Skill Level
              </label>
              <select
                value={preferencesData.cookingSkillLevel}
                onChange={(e) => handlePreferencesInputChange('cookingSkillLevel', e.target.value)}
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
                value={preferencesData.preferredCookingTime}
                onChange={(e) => handlePreferencesInputChange('preferredCookingTime', e.target.value)}
                className="input-field"
                placeholder="e.g., 30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Serving Size
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={preferencesData.servingSize}
                onChange={(e) => handlePreferencesInputChange('servingSize', e.target.value)}
                className="input-field"
                placeholder="e.g., 2"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="btn-secondary"
        >
          Previous
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleSkipPreferences}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-800 px-4 py-2"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleCompleteRegistration}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderStepIndicator()}
          
          {currentStep === 1 && renderAccountStep()}
          {currentStep === 2 && renderPreferencesStep()}
          {currentStep === 3 && renderFinalStep()}
        </div>
      </div>
    </div>
  );
};

export default MultiStepRegistration; 