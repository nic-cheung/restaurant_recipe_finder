import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';

interface DynamicSuggestionInputProps {
  label: string;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  placeholder?: string;
  suggestionType: 'chefs' | 'restaurants' | 'ingredients' | 'cuisines' | 'dishes';
  staticSuggestions?: string[];
  tagColor?: 'green' | 'red' | 'blue' | 'purple' | 'orange';
  maxDisplayedSuggestions?: number;
}

const DynamicSuggestionInput: React.FC<DynamicSuggestionInputProps> = ({
  label,
  selectedItems,
  onSelectionChange,
  placeholder = "Type to search...",
  suggestionType,
  staticSuggestions = [],
  tagColor = 'green',
  maxDisplayedSuggestions = 8,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionSource, setSuggestionSource] = useState<'static' | 'dynamic'>('static');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = async (query: string, location?: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      let response: { suggestions: string[]; query: string; source: string } | undefined;
      
      switch (suggestionType) {
        case 'chefs':
          response = await apiService.getChefSuggestions(query);
          break;
        case 'restaurants':
          // Use location for restaurants to trigger Google Places API
          response = await apiService.getRestaurantSuggestions(query, location || '');
          break;
        case 'ingredients':
          response = await apiService.getIngredientSuggestions(query);
          break;
        case 'cuisines':
          response = await apiService.getCuisineSuggestions(query);
          break;
        case 'dishes':
          response = await apiService.getDishSuggestions(query);
          break;
        default:
          throw new Error(`Unknown suggestion type: ${suggestionType}`);
      }
      
      if (!response) {
        throw new Error('No response received from API');
      }
      
      // Filter out already selected items
      const filteredSuggestions = response.suggestions.filter(
        suggestion => !selectedItems.includes(suggestion)
      );
      
      setSuggestions(filteredSuggestions);
      setSuggestionSource(response.source === 'ai_powered' || response.source === 'google_places' ? 'dynamic' : 'static');
      setIsDropdownOpen(filteredSuggestions.length > 0);
    } catch (error) {
      console.error('API call failed, using static fallback:', error);
      
      // Static fallback
      const filteredStatic = (staticSuggestions || []).filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase()) &&
        !selectedItems.includes(suggestion)
      );
      
      setSuggestions(filteredStatic);
      setSuggestionSource('static');
      setIsDropdownOpen(filteredStatic.length > 0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Clear existing debounce
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    
    // Debounce the API call
    debounceRef.current = window.setTimeout(() => {
      fetchSuggestions(value, locationValue);
    }, 300);
  };

  // Handle location changes for restaurants
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationValue(value);
    
    // If we have a query, refetch with new location
    if (inputValue.trim() && suggestionType === 'restaurants') {
      // Clear existing debounce
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      
      // Debounce the API call
      debounceRef.current = window.setTimeout(() => {
        fetchSuggestions(inputValue, value);
      }, 300);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const addItem = (item: string) => {
    if (item.trim() && !selectedItems.includes(item.trim())) {
      onSelectionChange([...selectedItems, item.trim()]);
      setInputValue('');
      setIsDropdownOpen(false);
    }
  };

  const removeItem = (item: string) => {
    onSelectionChange(selectedItems.filter(i => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        if (suggestions.length > 0 && suggestions[0]) {
          addItem(suggestions[0]);
        } else {
          addItem(inputValue);
        }
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && event.target && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tagColorClasses = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  // All unselected suggestions will be grey regardless of tagColor
  const suggestionButtonColorClasses = 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';

  // Get available suggestions to display as clickable pills
  const availableSuggestions = (staticSuggestions || [])
    .filter(suggestion => !selectedItems.includes(suggestion))
    .slice(0, maxDisplayedSuggestions);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {suggestionSource === 'dynamic' && (
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {suggestionType === 'restaurants' ? 'Google Places' : 'AI-Powered'}
          </span>
        )}
      </label>
      
      {/* Available suggestions as clickable pills - all grey */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addItem(suggestion)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border-2 ${suggestionButtonColorClasses}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Selected items - colored based on tagColor */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${tagColorClasses[tagColor]}`}
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-200 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Location input for restaurants */}
      {suggestionType === 'restaurants' && (
        <div className="relative">
          <input
            type="text"
            value={locationValue}
            onChange={handleLocationChange}
            placeholder="Enter location (e.g., New York, London) - required for Google Places API"
            className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          />
          <div className="text-xs text-blue-600 mt-1">
            💡 Add a location to use Google Places API for real restaurant suggestions
          </div>
        </div>
      )}

      {/* Input field */}
      <div className="relative" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Suggestions dropdown */}
        {isDropdownOpen && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addItem(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicSuggestionInput; 