import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
// import { useAuth } from '../contexts/AuthContext'; // Available if needed
import { 
  RecipeGenerationRequest, 
  GeneratedRecipe, 
  SavedRecipe, 
  VARIATION_TYPES
} from '../types/recipe';
import { UserPreferences } from '../types/preferences';

import RecipeCard from '../components/RecipeCard';

// Note: Recipe difficulty is now determined by AI based on user's cooking skill level 
// in preferences and contextual factors (occasion, time, etc.)

// Helper function to build enhanced context for recipe generation
const buildEnhancedContext = (
  additionalRequests: string, 
  contextualData: any
): string => {
  const contextParts: string[] = [];
  
  // Add user's additional requests first
  if (additionalRequests.trim()) {
    contextParts.push(additionalRequests);
  }
  
  // Add contextual information specific to this recipe (not duplicating preferences)
  if (contextualData.urgency) {
    contextParts.push(`Timing: ${contextualData.urgency}`);
  }
  
  if (contextualData.overrideDietary) {
    contextParts.push(`Ignore dietary restrictions for this recipe`);
  }
  
  return contextParts.join('. ');
};

const RecipeGenerator: React.FC = () => {
  const navigate = useNavigate();
  
  // Simplified form data - only contextual inputs
  const [formData, setFormData] = useState({
    inspiration: '',
    additionalRequests: ''
  });

  // Contextual inputs for this specific recipe
  const [contextualData, setContextualData] = useState({
    styleMood: '',
    timeAvailable: '',
    overrideDietary: false,
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

  const [state, setState] = useState({
    // Step 1: Prompt generation
    isGeneratingPrompt: false,
    generatedPrompt: null as string | null,
    
    // Step 2: Recipe generation (manual or auto)
    showManualInput: false,
    manualResponse: '',
    isParsingManualResponse: false,
    isGeneratingRecipe: false,
    
    // Recipe results
    generatedRecipe: null as GeneratedRecipe | null,
    savedRecipe: null as SavedRecipe | null,
    error: null as string | null,
    showSaveSuccess: false,
    showRecipeVariations: false,
    isGeneratingVariation: false,
    variationRecipe: null as GeneratedRecipe | null
  });

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoadingPreferences(true);
      try {
        const preferences = await apiService.getPreferences();
        setUserPreferences(preferences);
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    loadPreferences();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGeneratePrompt = async () => {
    if (!userPreferences) {
      setState(prev => ({ ...prev, error: 'Please set up your preferences first' }));
      return;
    }

    setState(prev => ({ ...prev, isGeneratingPrompt: true, error: null }));

    try {
      // Build recipe generation request using preferences
      const request: RecipeGenerationRequest = {
        additionalRequests: buildEnhancedContext(
          formData.additionalRequests,
          contextualData
        )
      };

      // Add optional properties only if they have values
      if (formData.inspiration.trim()) {
        request.inspiration = formData.inspiration;
      }
      
      if (contextualData.styleMood.trim()) {
        request.occasion = contextualData.styleMood;
      }
      
      if (contextualData.timeAvailable.trim()) {
        request.currentCravings = contextualData.timeAvailable;
      }

      // Generate prompt instead of recipe
      const response = await apiService.generateRecipe(request);
      
      // Extract the AI prompt from the response
      let aiPrompt = 'AI prompt not available';
      if (response.recipe.aiPromptUsed) {
        if (typeof response.recipe.aiPromptUsed === 'string') {
          aiPrompt = response.recipe.aiPromptUsed;
        } else {
          aiPrompt = response.recipe.aiPromptUsed.prompt || response.recipe.aiPromptUsed.technicalPrompt || 'AI prompt not available';
        }
      }
      setState(prev => ({ ...prev, generatedPrompt: aiPrompt }));
    } catch (error) {
      console.error('Error generating prompt:', error);
      setState(prev => ({ ...prev, error: 'Failed to generate AI prompt. Please try again.' }));
    } finally {
      setState(prev => ({ ...prev, isGeneratingPrompt: false }));
    }
  };

  const handleUseBuiltInAI = async () => {
    if (!userPreferences || !state.generatedPrompt) {
      setState(prev => ({ ...prev, error: 'Please generate a prompt first' }));
      return;
    }

    setState(prev => ({ ...prev, isGeneratingRecipe: true, error: null }));

    try {
      // Build recipe generation request using preferences
      const request: RecipeGenerationRequest = {
        additionalRequests: buildEnhancedContext(
          formData.additionalRequests,
          contextualData
        )
      };

      // Add optional properties only if they have values
      if (formData.inspiration.trim()) {
        request.inspiration = formData.inspiration;
      }
      
      if (contextualData.styleMood.trim()) {
        request.occasion = contextualData.styleMood;
      }
      
      if (contextualData.timeAvailable.trim()) {
        request.currentCravings = contextualData.timeAvailable;
      }

      const response = await apiService.generateRecipe(request);
      setState(prev => ({ ...prev, generatedRecipe: response.recipe, savedRecipe: null }));
    } catch (error) {
      console.error('Error generating recipe:', error);
      setState(prev => ({ ...prev, error: 'Failed to generate recipe. Please try again.' }));
    } finally {
      setState(prev => ({ ...prev, isGeneratingRecipe: false }));
    }
  };

  const handleUseExternalAI = () => {
    setState(prev => ({ ...prev, showManualInput: true }));
  };

  const handleParseManualResponse = async () => {
    if (!state.manualResponse.trim()) {
      setState(prev => ({ ...prev, error: 'Please paste your AI response first' }));
      return;
    }

    setState(prev => ({ ...prev, isParsingManualResponse: true, error: null }));

    try {
      // Try to parse the manual response as a recipe
      // This is a simple implementation - you might want to make this more robust
      const parsedRecipe = parseAIResponse(state.manualResponse);
      setState(prev => ({ 
        ...prev, 
        generatedRecipe: parsedRecipe, 
        savedRecipe: null,
        showManualInput: false,
        manualResponse: ''
      }));
    } catch (error) {
      console.error('Error parsing manual response:', error);
      setState(prev => ({ ...prev, error: 'Failed to parse AI response. Please check the format and try again.' }));
    } finally {
      setState(prev => ({ ...prev, isParsingManualResponse: false }));
    }
  };

  const handleSaveRecipe = async () => {
    if (!state.generatedRecipe) return;

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const response = await apiService.saveRecipe(state.generatedRecipe);
      setState(prev => ({ 
        ...prev, 
        savedRecipe: response.recipe, 
        showSaveSuccess: true,
        showRecipeVariations: true
      }));
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, showSaveSuccess: false }));
      }, 5000);
    } catch (error) {
      console.error('Error saving recipe:', error);
      setState(prev => ({ ...prev, error: 'Failed to save recipe. Please try again.' }));
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  };



  const handleGenerateVariation = async (variationType: string) => {
    if (!state.savedRecipe) return;

    setState(prev => ({ ...prev, isGeneratingVariation: true, error: null }));

    try {
      const response = await apiService.generateRecipeVariation(state.savedRecipe.id, { variationType: variationType as any });
      setState(prev => ({ ...prev, variationRecipe: response.recipe }));
    } catch (error) {
      console.error('Error generating variation:', error);
      setState(prev => ({ ...prev, error: 'Failed to generate variation. Please try again.' }));
    } finally {
      setState(prev => ({ ...prev, isGeneratingVariation: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      inspiration: '',
      additionalRequests: ''
    });
    setContextualData({
      styleMood: '',
      timeAvailable: '',
      overrideDietary: false,
    });
    setState({
      isGeneratingPrompt: false,
      generatedPrompt: null,
      showManualInput: false,
      manualResponse: '',
      isParsingManualResponse: false,
      isGeneratingRecipe: false,
      generatedRecipe: null,
      savedRecipe: null,
      error: null,
      showSaveSuccess: false,
      showRecipeVariations: false,
      isGeneratingVariation: false,
      variationRecipe: null
    });
  };

  // Helper function to parse clean prompt from AI response
  const parseAIPromptFromResponse = (response: string): string => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      if (parsed.aiPrompt) {
        return parsed.aiPrompt;
      }
      
      // If it's a recipe with aiPromptUsed field
      if (parsed.aiPromptUsed?.prompt) {
        return parsed.aiPromptUsed.prompt;
      }
      
      // If it's in instructions (fallback for AI prompt responses)
      if (parsed.instructions && Array.isArray(parsed.instructions) && parsed.instructions.length > 0) {
        return parsed.instructions[0];
      }
      
      // Fallback to the raw response
      return response;
    } catch (error) {
      // If JSON parsing fails, return the raw response
      return response;
    }
  };

  // Helper function to parse technical prompt from AI response
  const parseTechnicalPromptFromResponse = (response: string): string => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      if (parsed.technicalPrompt) {
        return parsed.technicalPrompt;
      }
      
      // If it's a recipe with aiPromptUsed field
      if (parsed.aiPromptUsed?.technicalPrompt) {
        return parsed.aiPromptUsed.technicalPrompt;
      }
      
      // If no technical prompt, return the clean prompt with JSON formatting instructions
      const cleanPrompt = parseAIPromptFromResponse(response);
      return `${cleanPrompt}

IMPORTANT INSTRUCTIONS FOR THE AI:
Please ensure the recipe is:
- Authentic and well-balanced with quality ingredients
- Uses proper cooking techniques and realistic timing
- Includes accurate cooking times and temperatures  
- Provides clear, step-by-step instructions that anyone can follow
- Considers all dietary restrictions and preferences mentioned
- Includes realistic nutritional estimates
- Suggests appropriate wine pairings or side dishes if relevant

Return the recipe in this exact JSON format:

{
  "title": "Recipe Name",
  "description": "Brief, appetizing description of the dish",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "quantity", 
      "unit": "unit of measurement",
      "category": "protein/vegetable/spice/etc"
    }
  ],
  "instructions": [
    "Step 1: Clear, detailed instruction",
    "Step 2: Next step with timing and technique",
    "Continue with all steps..."
  ],
  "cookingTime": minutes_as_number,
  "difficulty": "EASY/MEDIUM/HARD/EXPERT",
  "cuisineType": "cuisine type",
  "servings": number_of_servings,
  "nutritionInfo": {
    "calories": estimated_calories_per_serving,
    "protein": grams_of_protein,
    "carbs": grams_of_carbs,
    "fat": grams_of_fat
  },
  "tags": ["relevant", "tags", "for", "the", "recipe"]
}

Make sure the recipe is restaurant-quality but achievable at home, with ingredients that are reasonably accessible.`;
    } catch (error) {
      // If JSON parsing fails, return the raw response with JSON formatting instructions
      const cleanPrompt = parseAIPromptFromResponse(response);
      return `${cleanPrompt}

IMPORTANT INSTRUCTIONS FOR THE AI:
Please ensure the recipe is:
- Authentic and well-balanced with quality ingredients
- Uses proper cooking techniques and realistic timing
- Includes accurate cooking times and temperatures  
- Provides clear, step-by-step instructions that anyone can follow
- Considers all dietary restrictions and preferences mentioned
- Includes realistic nutritional estimates

Return the recipe in this exact JSON format:

{
  "title": "Recipe Name",
  "description": "Brief, appetizing description of the dish",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "quantity", 
      "unit": "unit of measurement",
      "category": "protein/vegetable/spice/etc"
    }
  ],
  "instructions": [
    "Step 1: Clear, detailed instruction",
    "Step 2: Next step with timing and technique",
    "Continue with all steps..."
  ],
  "cookingTime": minutes_as_number,
  "difficulty": "EASY/MEDIUM/HARD/EXPERT",
  "cuisineType": "cuisine type",
  "servings": number_of_servings,
  "nutritionInfo": {
    "calories": estimated_calories_per_serving,
    "protein": grams_of_protein,
    "carbs": grams_of_carbs,
    "fat": grams_of_fat
  },
  "tags": ["relevant", "tags", "for", "the", "recipe"]
}

Make sure the recipe is restaurant-quality but achievable at home, with ingredients that are reasonably accessible.`;
    }
  };



  // Smart truncation function that ensures single-line display
  const truncateToSingleLine = (items: string[], maxChars: number = 25): string => {
    if (items.length === 0) return '';
    
    let result = '';
    let includedItems = 0;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const separator = i === 0 ? '' : ', ';
      const testResult = result + separator + item;
      
      if (testResult.length <= maxChars) {
        result = testResult;
        includedItems++;
      } else {
        break;
      }
    }
    
    if (includedItems < items.length) {
      const remaining = items.length - includedItems;
      const suffix = ` and ${remaining} more`;
      
      // If adding "and X more" would make it too long, remove the last item
      if ((result + suffix).length > maxChars && includedItems > 1) {
        const lastCommaIndex = result.lastIndexOf(', ');
        result = result.substring(0, lastCommaIndex);
        const newRemaining = items.length - (includedItems - 1);
        result += ` and ${newRemaining} more`;
      } else {
        result += suffix;
      }
    }
    
    return result || (items[0] ?? ''); // Fallback to at least show the first item
  };

  // Helper function to format enum values to human-readable format
  const formatEnumValue = (value: string): string => {
    if (!value) return '';
    return value
      .split('_')
      .map(word => word.toLowerCase())
      .join(' ');
  };

  // Helper function to format arrays of enum values
  const formatEnumArray = (values: string[]): string[] => {
    return values.map(formatEnumValue);
  };

  // Helper function to format and truncate enum arrays to single line
  const formatAndTruncateEnumArray = (values: string[], maxChars: number = 25): string => {
    const formatted = formatEnumArray(values);
    return truncateToSingleLine(formatted, maxChars);
  };

  // Helper function to get full values for tooltips
  const getFullValue = (values: string[], isEnum: boolean = false): string => {
    if (values.length === 0) return '';
    if (isEnum) {
      return formatEnumArray(values).join(', ');
    }
    return values.join(', ');
  };

  // Helper function to parse AI responses from external sources
  const parseAIResponse = (response: string): GeneratedRecipe => {
    try {
      // First, try to parse as JSON if it's a structured response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.title && (parsed.ingredients || parsed.ingredient_list)) {
            return {
              title: parsed.title || 'Parsed Recipe',
              description: parsed.description || '',
              ingredients: parseIngredients(parsed.ingredients || parsed.ingredient_list || []),
              instructions: Array.isArray(parsed.instructions) ? parsed.instructions : 
                           Array.isArray(parsed.steps) ? parsed.steps :
                           typeof parsed.instructions === 'string' ? parsed.instructions.split('\n').filter((s: string) => s.trim()) : 
                           ['Instructions not found'],
              cookingTime: parseInt(parsed.cooking_time || parsed.cookingTime || parsed.prep_time || '30'),
              servings: parseInt(parsed.servings || parsed.serves || '4'),
              difficulty: (parsed.difficulty?.toUpperCase() || 'MEDIUM') as 'EASY' | 'MEDIUM' | 'HARD',
              tags: Array.isArray(parsed.tags) ? parsed.tags : [],
              cuisineType: parsed.cuisine || parsed.cuisineType || 'Unknown'
            };
          }
        } catch (jsonError) {
          console.log('JSON parsing failed, trying text parsing');
        }
      }

      // Parse as structured text
      const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // Extract title
      let title = 'AI Generated Recipe';
      const titleLine = lines.find(line => 
        line.toLowerCase().includes('recipe:') || 
        line.toLowerCase().includes('title:') ||
        line.match(/^[A-Z][^.!?]*(?:Recipe|Dish|Food)$/i) ||
        (line.length < 60 && !line.includes(':') && !line.startsWith('-') && !line.match(/^\d/))
      );
      if (titleLine) {
        title = titleLine.replace(/^(recipe:|title:)/i, '').trim();
      }

      // Extract ingredients
      const ingredients = extractIngredientsFromText(lines);
      
      // Extract instructions
      const instructions = extractInstructionsFromText(lines);
      
      // Extract cooking time
      let cookingTime = 30;
      const timeMatch = response.match(/(?:cook|cooking|prep|total)(?:\s+time)?:?\s*(\d+)\s*(?:min|minute|hour|hr)/i);
      if (timeMatch && timeMatch[1]) {
        cookingTime = parseInt(timeMatch[1]);
        if (response.toLowerCase().includes('hour') || response.toLowerCase().includes('hr')) {
          cookingTime *= 60;
        }
      }

      // Extract servings
      let servings = 4;
      const servingsMatch = response.match(/(?:serves?|servings?|portions?):?\s*(\d+)/i);
      if (servingsMatch && servingsMatch[1]) {
        servings = parseInt(servingsMatch[1]);
      }

      // Extract difficulty
      let difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM';
      if (response.toLowerCase().includes('easy') || response.toLowerCase().includes('simple')) {
        difficulty = 'EASY';
      } else if (response.toLowerCase().includes('hard') || response.toLowerCase().includes('difficult') || response.toLowerCase().includes('advanced')) {
        difficulty = 'HARD';
      }

      // Extract cuisine type
      let cuisineType = 'Unknown';
      const cuisineMatch = response.match(/(?:cuisine|style):?\s*([A-Za-z\s]+)/i);
      if (cuisineMatch && cuisineMatch[1]) {
        cuisineType = cuisineMatch[1].trim();
      }

      return {
        title,
        description: `Recipe parsed from AI response`,
        ingredients,
        instructions,
        cookingTime,
        servings,
        difficulty,
        tags: [],
        cuisineType
      };

    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return a basic structure with the raw response for manual editing
      return {
        title: 'Please Edit Recipe Title',
        description: 'AI response parsing failed - please edit manually',
        ingredients: [{ amount: '1', unit: 'item', name: 'Please edit ingredients manually' }],
        instructions: ['Please edit instructions manually', 'Raw AI response was: ' + response.substring(0, 200) + '...'],
        cookingTime: 30,
        servings: 4,
        difficulty: 'MEDIUM',
        tags: [],
        cuisineType: 'Unknown'
      };
    }
  };

  // Helper function to parse ingredients from various formats
  const parseIngredients = (ingredientList: any[]): Array<{amount: string, unit: string, name: string}> => {
    return ingredientList.map(item => {
      if (typeof item === 'string') {
        return parseIngredientString(item);
      } else if (typeof item === 'object' && item?.name) {
        return {
          amount: String(item.amount || item.quantity || '1'),
          unit: String(item.unit || ''),
          name: String(item.name || item.ingredient || 'Unknown ingredient')
        };
      }
      return { amount: '1', unit: '', name: String(item) };
    });
  };

  // Helper function to parse a single ingredient string
  const parseIngredientString = (ingredient: string): {amount: string, unit: string, name: string} => {
    // Remove leading bullets, numbers, or dashes
    let clean = ingredient.replace(/^[-•*\d+.)]\s*/, '').trim();
    
    // Common pattern: "2 cups flour" or "1 tablespoon olive oil"
    const match = clean.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s+([a-zA-Z]+)\s+(.+)$/);
    if (match && match[1] && match[2] && match[3]) {
      return {
        amount: match[1],
        unit: match[2],
        name: match[3]
      };
    }
    
    // Pattern: "2 cups of flour"
    const ofMatch = clean.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s+([a-zA-Z]+)\s+of\s+(.+)$/);
    if (ofMatch && ofMatch[1] && ofMatch[2] && ofMatch[3]) {
      return {
        amount: ofMatch[1],
        unit: ofMatch[2],
        name: ofMatch[3]
      };
    }
    
    // Pattern: just number and ingredient "2 eggs"
    const simpleMatch = clean.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s+(.+)$/);
    if (simpleMatch && simpleMatch[1] && simpleMatch[2]) {
      return {
        amount: simpleMatch[1],
        unit: '',
        name: simpleMatch[2]
      };
    }
    
    // Fallback: treat the whole thing as ingredient name
    return {
      amount: '1',
      unit: '',
      name: clean
    };
  };

  // Helper function to extract ingredients from text lines
  const extractIngredientsFromText = (lines: string[]): Array<{amount: string, unit: string, name: string}> => {
    const ingredients: Array<{amount: string, unit: string, name: string}> = [];
    
    // Find ingredients section
    const ingredientsStartIdx = lines.findIndex(line => 
      line.toLowerCase().includes('ingredient') ||
      line.toLowerCase().includes('you will need') ||
      line.toLowerCase().includes('materials')
    );
    
    if (ingredientsStartIdx === -1) {
      // No clear ingredients section, look for lines that look like ingredients
      for (const line of lines) {
        if (line.match(/^\d+/) || line.match(/^[-•*]/) || line.match(/\d+\s+(cup|tablespoon|teaspoon|pound|ounce|gram|kg|ml|liter)/)) {
          ingredients.push(parseIngredientString(line));
        }
      }
    } else {
      // Found ingredients section, extract until next section or end
      const instructionsIdx = lines.findIndex((line, idx) => 
        idx > ingredientsStartIdx && (
          line.toLowerCase().includes('instruction') ||
          line.toLowerCase().includes('direction') ||
          line.toLowerCase().includes('method') ||
          line.toLowerCase().includes('step')
        )
      );
      
      const endIdx = instructionsIdx === -1 ? lines.length : instructionsIdx;
      
      for (let i = ingredientsStartIdx + 1; i < endIdx; i++) {
        const line = lines[i];
        if (line && !line.toLowerCase().includes('instruction')) {
          ingredients.push(parseIngredientString(line));
        }
      }
    }
    
    return ingredients.length > 0 ? ingredients : [{ amount: '1', unit: 'item', name: 'No ingredients found - please edit manually' }];
  };

  // Helper function to extract instructions from text lines
  const extractInstructionsFromText = (lines: string[]): string[] => {
    const instructions: string[] = [];
    
    // Find instructions section
    const instructionsStartIdx = lines.findIndex(line => 
      line.toLowerCase().includes('instruction') ||
      line.toLowerCase().includes('direction') ||
      line.toLowerCase().includes('method') ||
      line.toLowerCase().includes('step')
    );
    
    if (instructionsStartIdx === -1) {
      // Look for numbered steps anywhere
      const stepLines = lines.filter(line => 
        line.match(/^\d+[\.)]\s/) || 
        line.toLowerCase().startsWith('step')
      );
      
      if (stepLines.length > 0) {
        stepLines.forEach(line => {
          instructions.push(line.replace(/^\d+[\.)]\s*/, '').replace(/^step\s*\d*:?\s*/i, '').trim());
        });
      } else {
        // No clear instructions, take lines that look like instructions
        const potentialInstructions = lines.filter(line => 
          line.length > 20 && 
          !line.match(/^\d+\s+(cup|tablespoon|teaspoon)/) &&
          !line.toLowerCase().includes('ingredient')
        );
        instructions.push(...potentialInstructions);
      }
    } else {
      // Found instructions section
      for (let i = instructionsStartIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line) {
          instructions.push(line.replace(/^\d+[\.)]\s*/, '').replace(/^step\s*\d*:?\s*/i, '').trim());
        }
      }
    }
    
    return instructions.length > 0 ? instructions : ['No instructions found - please edit manually'];
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--flambé-cream)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flambé-heading mb-2">AI recipe generator</h1>
          <p className="text-xl flambé-body">create personalized recipes with AI magic</p>
        </div>

        {/* Success Message */}
        {state.showSaveSuccess && (
          <div className="mb-6 rounded-lg p-4" style={{ backgroundColor: 'var(--flambé-sage)', borderColor: 'var(--flambé-forest)' }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" style={{ color: 'var(--flambé-forest)' }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium flambé-body" style={{ color: 'var(--flambé-forest)' }}>
                  recipe saved successfully! you can find it in your saved recipes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="mb-6 rounded-lg p-4" style={{ backgroundColor: 'var(--flambé-fog)', borderColor: 'var(--flambé-rust)' }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" style={{ color: 'var(--flambé-rust)' }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium flambé-body" style={{ color: 'var(--flambé-rust)' }}>{state.error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Recipe Creation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flambé-heading">
                <svg className="w-6 h-6 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                </svg>
                what are you in the mood for?
              </h2>
              {isLoadingPreferences && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading preferences...
                </div>
              )}
              {userPreferences && !isLoadingPreferences && (
                <div className="flex items-center text-sm text-green-600">
                  <span className="mr-2">✓</span>
                  preferences applied
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Streamlined Recipe Requirements */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    style/mood
                  </label>
                  <select
                    value={contextualData.styleMood}
                    onChange={(e) => setContextualData(prev => ({ ...prev, styleMood: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">any style</option>
                    <option value="comfort food">comfort food</option>
                    <option value="fresh and light">fresh & light</option>
                    <option value="rich and indulgent">rich & indulgent</option>
                    <option value="adventurous">adventurous</option>
                    <option value="date night">date night</option>
                    <option value="family gathering">family gathering</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    time available
                  </label>
                  <select
                    value={contextualData.timeAvailable}
                    onChange={(e) => setContextualData(prev => ({ ...prev, timeAvailable: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">no time preference</option>
                    <option value="quick">quick (15-30 min)</option>
                    <option value="normal">normal (30-60 min)</option>
                    <option value="slow cooking">slow cooking (60+ min)</option>
                  </select>
                </div>
              </div>

              {/* Inspiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  inspiration (optional)
                </label>
                <input
                  type="text"
                  value={formData.inspiration}
                  onChange={(e) => handleInputChange('inspiration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Italian, Thai, Gordon Ramsay, Mediterranean..."
                />
              </div>

              {userPreferences && userPreferences.dietaryRestrictions.length > 0 && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="overrideDietary"
                    checked={contextualData.overrideDietary}
                    onChange={(e) => setContextualData(prev => ({ ...prev, overrideDietary: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="overrideDietary" className="text-sm text-gray-700">
                    Allow recipes that don't follow my usual dietary restrictions for this special occasion
                  </label>
                </div>
              )}

              {/* Additional Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  additional requests
                </label>
                <textarea
                  value={formData.additionalRequests}
                  onChange={(e) => handleInputChange('additionalRequests', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="any specific requests for this recipe..."
                />
              </div>

              {/* Action Buttons */}
              {!state.generatedPrompt ? (
                <div className="flex space-x-3">
                  <button
                    onClick={handleGeneratePrompt}
                    disabled={state.isGeneratingPrompt || !userPreferences}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.isGeneratingPrompt ? 'generating...' : 'generate AI prompt'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* AI Prompt Display */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium flambé-heading">
                        <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        ai prompt generated
                      </h3>
                      <button
                        onClick={() => {
                          // Extract technical prompt from response
                          const technicalPrompt = parseTechnicalPromptFromResponse(state.generatedPrompt || '');
                          navigator.clipboard.writeText(technicalPrompt);
                        }}
                        className="text-sm btn-primary"
                      >
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        copy prompt
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Clean Prompt for Display */}
                      <div>
                        <h4 className="text-sm font-medium flambé-heading mb-2">
                          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          your personalized recipe request
                        </h4>
                        <div className="bg-white border rounded-md p-3 max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                            {parseAIPromptFromResponse(state.generatedPrompt || '')}
                          </pre>
                        </div>
                        <p className="text-xs flambé-body mt-1">
                          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          click "copy prompt" above to copy the full technical version with json formatting instructions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUseExternalAI}
                      className="flex-1 btn-secondary"
                    >
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      use external AI
                    </button>
                    <button
                      onClick={handleUseBuiltInAI}
                      disabled={state.isGeneratingRecipe}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state.isGeneratingRecipe ? 'generating...' : (
                        <>
                          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          use built-in AI
                        </>
                      )}
                    </button>
                  </div>

                  {/* Manual Input Section */}
                  {state.showManualInput && (
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <h4 className="font-medium flambé-heading">
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        paste your ai response
                      </h4>
                      <p className="text-sm text-blue-700">
                        Copy the prompt above, use it in ChatGPT/Claude, then paste the response below:
                      </p>
                      <textarea
                        value={state.manualResponse}
                        onChange={(e) => setState(prev => ({ ...prev, manualResponse: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={8}
                        placeholder="Paste your AI response here..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleParseManualResponse}
                          disabled={state.isParsingManualResponse || !state.manualResponse.trim()}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {state.isParsingManualResponse ? 'parsing...' : 'parse recipe'}
                        </button>
                        <button
                          onClick={() => setState(prev => ({ ...prev, showManualInput: false, manualResponse: '' }))}
                          className="btn-secondary"
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reset Button */}
                  <button
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      generatedPrompt: null, 
                      showManualInput: false, 
                      manualResponse: '',
                      generatedRecipe: null,
                      savedRecipe: null
                    }))}
                    className="w-full btn-secondary"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    start over
                  </button>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={resetForm}
                className="w-full btn-secondary"
              >
                reset form
              </button>
            </div>

            {/* Preferences Summary */}
            {userPreferences && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">your preferences applied</h3>
                  <button
                    onClick={() => navigate('/preferences')}
                    className="text-sm btn-secondary"
                  >
                    modify
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-sm text-gray-600">
                  {/* Favorites Group */}
                  {userPreferences.favoriteCuisines.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Cuisines: ${getFullValue(userPreferences.favoriteCuisines)}`}>
                          <span className="font-medium flambé-body">cuisines:</span>
                          <span className="ml-1 flambé-body">{truncateToSingleLine(userPreferences.favoriteCuisines, 20)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userPreferences.favoriteIngredients.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Ingredients: ${getFullValue(userPreferences.favoriteIngredients)}`}>
                          <span className="font-medium flambé-body">ingredients:</span>
                          <span className="ml-1 flambé-body">{truncateToSingleLine(userPreferences.favoriteIngredients, 18)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userPreferences.favoriteDishes.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Dishes: ${getFullValue(userPreferences.favoriteDishes)}`}>
                          <span className="font-medium flambé-body">dishes:</span>
                          <span className="ml-1 flambé-body">{truncateToSingleLine(userPreferences.favoriteDishes, 22)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userPreferences.favoriteChefs.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Chefs: ${getFullValue(userPreferences.favoriteChefs)}`}>
                          <span className="font-medium flambé-body">chefs:</span>
                          <span className="ml-1 flambé-body">{truncateToSingleLine(userPreferences.favoriteChefs, 22)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userPreferences.favoriteRestaurants.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Restaurants: ${getFullValue(userPreferences.favoriteRestaurants)}`}>
                          <span className="font-medium flambé-body">restaurants:</span>
                          <span className="ml-1 flambé-body">{truncateToSingleLine(userPreferences.favoriteRestaurants, 18)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Dietary Restrictions */}
                  {userPreferences.dietaryRestrictions.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Dietary: ${getFullValue(userPreferences.dietaryRestrictions)}`}>
                          <span className="font-medium flambé-body">dietary:</span>
                          <span className="ml-1 flambé-body">{truncateToSingleLine(userPreferences.dietaryRestrictions, 22)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userPreferences.allergies.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Allergies: ${getFullValue(userPreferences.allergies)}`}>
                          <span className="font-medium flambé-body">allergies:</span>
                          <span className="ml-1 flambé-body">{truncateToSingleLine(userPreferences.allergies, 20)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userPreferences.dislikedFoods.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Avoid: ${getFullValue(userPreferences.dislikedFoods)}`}>
                          <span className="font-medium flambé-body">avoid:</span>
                          <span className="ml-1 flambé-body">{truncateToSingleLine(userPreferences.dislikedFoods, 23)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Goals & Equipment */}
                  {userPreferences.nutritionalGoals.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Goals: ${getFullValue(userPreferences.nutritionalGoals, true)}`}>
                          <span className="font-medium flambé-body">goals:</span>
                          <span className="ml-1 flambé-body">{formatAndTruncateEnumArray(userPreferences.nutritionalGoals, 22)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userPreferences.preferredMealTypes.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Meals: ${getFullValue(userPreferences.preferredMealTypes, true)}`}>
                          <span className="font-medium flambé-body">meals:</span>
                          <span className="ml-1 flambé-body">{formatAndTruncateEnumArray(userPreferences.preferredMealTypes, 22)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userPreferences.availableEquipment.length > 0 && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Equipment: ${getFullValue(userPreferences.availableEquipment, true)}`}>
                          <span className="font-medium flambé-body">equipment:</span>
                          <span className="ml-1 flambé-body">{formatAndTruncateEnumArray(userPreferences.availableEquipment, 18)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Quick Stats */}
                  <div className="flex items-center overflow-hidden">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Time: ${userPreferences.preferredCookingTime ? `${userPreferences.preferredCookingTime} minutes` : 'Any cooking time'}`}>
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium flambé-body">time:</span>
                      <span className="ml-1 flambé-body">{userPreferences.preferredCookingTime ? `${userPreferences.preferredCookingTime}min` : 'any'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center overflow-hidden">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Serves: ${userPreferences.servingSize || 4} people`}>
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span className="font-medium flambé-body">serves:</span>
                      <span className="ml-1 flambé-body">{userPreferences.servingSize || 4}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center overflow-hidden">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Skill: ${formatEnumValue(userPreferences.cookingSkillLevel || 'Any')} cooking skill level`}>
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-medium flambé-body">skill:</span>
                      <span className="ml-1 flambé-body">{formatEnumValue(userPreferences.cookingSkillLevel || 'any')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center overflow-hidden">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Spice: ${formatEnumValue(userPreferences.spiceTolerance || 'Medium')} spice tolerance`}>
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                      </svg>
                      <span className="font-medium flambé-body">spice:</span>
                      <span className="ml-1 flambé-body">{formatEnumValue(userPreferences.spiceTolerance || 'medium')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center overflow-hidden">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Budget: ${formatEnumValue(userPreferences.budgetPreference || 'Moderate')} budget preference`}>
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium flambé-body">budget:</span>
                      <span className="ml-1 flambé-body">{formatEnumValue(userPreferences.budgetPreference || 'moderate')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center overflow-hidden">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis" title={`Complexity: ${formatEnumValue(userPreferences.mealComplexity || 'Simple')} meal complexity`}>
                      <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="font-medium flambé-body">complexity:</span>
                      <span className="ml-1 flambé-body">{formatEnumValue(userPreferences.mealComplexity || 'simple')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recipe Display */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">generated recipe</h2>
            
            {state.generatedRecipe ? (
              <div className="space-y-6">
                <RecipeCard 
                  recipe={state.generatedRecipe}
                  showActions={true}
                  onSave={(savedRecipe) => {
                    setState(prev => ({ ...prev, savedRecipe, showSaveSuccess: true }));
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">no recipe generated yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Fill out the form and click "generate AI prompt" to create your personalized recipe.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recipe Variations */}
        {state.showRecipeVariations && state.savedRecipe && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recipe Variations</h2>
            <p className="text-gray-600 mb-4">
              Generate variations of your saved recipe with different styles and requirements.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {VARIATION_TYPES.map((variation) => (
                <button
                  key={variation.value}
                  onClick={() => handleGenerateVariation(variation.value)}
                  disabled={state.isGeneratingVariation}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-2">{variation.label}</h3>
                  <p className="text-sm text-gray-600">{variation.description}</p>
                </button>
              ))}
            </div>

            {state.isGeneratingVariation && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-blue-600">Generating variation...</span>
                </div>
              </div>
            )}

            {/* Variation Recipe Display */}
            {state.variationRecipe && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Variation: {state.variationRecipe.title}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                    <ul className="space-y-1 text-sm">
                      {state.variationRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-gray-700">
                          {ingredient.amount} {ingredient.unit} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                    <ol className="space-y-1 text-sm">
                      {state.variationRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="text-gray-700">
                          {index + 1}. {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleSaveRecipe()}
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
                  >
                    Save Variation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGenerator; 