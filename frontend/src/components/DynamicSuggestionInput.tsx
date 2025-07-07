import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';

interface DynamicSuggestionInputProps {
  label: string;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  placeholder?: string;
  suggestionType: 'restaurants' | 'chefs' | 'dishes' | 'ingredients' | 'static';
  staticSuggestions?: string[];
  popularSuggestions?: string[];
  tagColor?: 'green' | 'red' | 'blue' | 'purple' | 'orange';
  maxDisplayedSuggestions?: number;
  maxPopularTags?: number;
}

interface SuggestionResponse {
  suggestions: string[];
  query: string;
  source: string;
  hasMoreResults?: boolean;
  message?: string;
}

const DynamicSuggestionInput: React.FC<DynamicSuggestionInputProps> = ({
  label,
  selectedItems,
  onSelectionChange,
  placeholder = "Type to search...",
  suggestionType,
  staticSuggestions = [],
  popularSuggestions = [],
  tagColor = 'blue',
  maxDisplayedSuggestions = 8,
  maxPopularTags = 5,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEnhancedSearchOption, setShowEnhancedSearchOption] = useState(false);
  const [isEnhancedSearchActive, setIsEnhancedSearchActive] = useState(false);
  const [suggestionSource, setSuggestionSource] = useState<'static' | 'enhanced'>('static');
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filter static suggestions based on input
  const getFilteredStaticSuggestions = (query: string): string[] => {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase();
    return (staticSuggestions || [])
      .filter(suggestion => 
        suggestion.toLowerCase().includes(normalizedQuery) &&
        !selectedItems.includes(suggestion)
      )
      .slice(0, maxDisplayedSuggestions);
  };

  // Handle enhanced search API call
  const performEnhancedSearch = async (query: string, location?: string) => {
    if (!query.trim()) return;

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setIsEnhancedSearchActive(true);
    
    try {
      let response: SuggestionResponse | undefined;
      
      // Use the enhanced API endpoints for better results
      if (suggestionType === 'restaurants') {
        response = await apiService.getRestaurantSuggestions(query, location || '', abortControllerRef.current.signal);
      } else if (suggestionType === 'chefs') {
        response = await apiService.getEnhancedChefSuggestions(query, abortControllerRef.current.signal);
      } else if (suggestionType === 'dishes') {
        response = await apiService.getEnhancedDishSuggestions(query, abortControllerRef.current.signal);
      } else if (suggestionType === 'ingredients') {
        response = await apiService.getEnhancedIngredientSuggestions(query, abortControllerRef.current.signal);
      }
      
      if (!response) {
        throw new Error(`Unknown suggestion type: ${suggestionType}`);
      }
      
      // Check if the request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      // Filter out already selected items
      const filteredSuggestions = response.suggestions.filter(
        suggestion => !selectedItems.includes(suggestion)
      );
      
      setSuggestions(filteredSuggestions);
      setSuggestionSource('enhanced');
      setShowEnhancedSearchOption(false);
      setIsDropdownOpen(filteredSuggestions.length > 0);
    } catch (error) {
      // Don't log error if it was just an abort
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      console.error('Enhanced search failed:', error);
      
      // Fall back to static suggestions
      const staticResults = getFilteredStaticSuggestions(query);
      setSuggestions(staticResults);
      setSuggestionSource('static');
      setShowEnhancedSearchOption(staticResults.length === 0);
      setIsDropdownOpen(staticResults.length > 0 || showEnhancedSearchOption);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsEnhancedSearchActive(false);
    setSuggestionSource('static');
    
    // Clear existing debounce
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    
    if (!value.trim()) {
      setSuggestions([]);
      setShowEnhancedSearchOption(false);
      setIsDropdownOpen(false);
      return;
    }
    
    // For static-only suggestion types, only use static suggestions
    if (suggestionType === 'static') {
      const staticResults = getFilteredStaticSuggestions(value);
      setSuggestions(staticResults);
      setShowEnhancedSearchOption(false);
      setIsDropdownOpen(staticResults.length > 0);
      return;
    }
    
    // For API-enabled suggestion types, use regular API endpoints first
    // These will show hasMoreResults flag if enhanced search is available
    debounceRef.current = window.setTimeout(async () => {
      try {
        // Cancel any existing request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        setIsLoading(true);
        
        let response: SuggestionResponse | undefined;
        
        if (suggestionType === 'chefs') {
          response = await apiService.getChefSuggestions(value, abortControllerRef.current.signal);
        } else if (suggestionType === 'dishes') {
          response = await apiService.getDishSuggestions(value, abortControllerRef.current.signal);
        } else if (suggestionType === 'ingredients') {
          response = await apiService.getIngredientSuggestions(value, abortControllerRef.current.signal);
        } else if (suggestionType === 'restaurants') {
          // For restaurants, fall back to static suggestions initially
          const staticResults = getFilteredStaticSuggestions(value);
          setSuggestions(staticResults);
          setShowEnhancedSearchOption(true); // Always show enhanced search for restaurants
          setIsDropdownOpen(staticResults.length > 0 || true);
          setIsLoading(false);
          return;
        }
        
        if (response) {
          // Filter out already selected items
          const filteredSuggestions = response.suggestions.filter(
            suggestion => !selectedItems.includes(suggestion)
          );
          
          setSuggestions(filteredSuggestions);
          setShowEnhancedSearchOption(response.hasMoreResults || false);
          setIsDropdownOpen(filteredSuggestions.length > 0 || (response.hasMoreResults || false));
        }
        
      } catch (error) {
        // Don't log error if it was just an abort
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        
        console.error('Initial suggestions failed:', error);
        
        // Fall back to static suggestions
        const staticResults = getFilteredStaticSuggestions(value);
        setSuggestions(staticResults);
        setShowEnhancedSearchOption(staticResults.length === 0);
        setIsDropdownOpen(staticResults.length > 0 || staticResults.length === 0);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // Handle enhanced search activation
  const handleEnhancedSearchActivation = () => {
    if (inputValue.trim()) {
      performEnhancedSearch(inputValue, locationValue);
    }
  };

  // Handle location changes for restaurants
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationValue(value);
    
    // If we have a query and enhanced search is active, refetch
    if (inputValue.trim() && isEnhancedSearchActive && suggestionType === 'restaurants') {
      // Clear existing debounce
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      
      // Debounce the API call
      debounceRef.current = window.setTimeout(() => {
        performEnhancedSearch(inputValue, value);
      }, 300);
    }
  };

  // Cleanup debounce and abort controller on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const addItem = (item: string) => {
    if (item.trim() && !selectedItems.includes(item.trim())) {
      onSelectionChange([...selectedItems, item.trim()]);
      setInputValue('');
      setSuggestions([]);
      setShowEnhancedSearchOption(false);
      setIsDropdownOpen(false);
      setIsEnhancedSearchActive(false);
    }
  };

  const removeItem = (item: string) => {
    onSelectionChange(selectedItems.filter(i => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && suggestions[0]) {
        addItem(suggestions[0]);
      } else if (inputValue.trim()) {
        addItem(inputValue);
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
    green: 'tag tag-green',
    red: 'tag tag-red',
    blue: 'tag tag-blue',
    purple: 'tag tag-purple',
    orange: 'tag tag-orange',
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {suggestionSource === 'enhanced' && (
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--flambé-stone)', color: 'var(--flambé-charcoal)' }}>
            {suggestionType === 'restaurants' ? 'Google Places' : 'Wikidata'}
          </span>
        )}
      </label>

      {/* Popular suggestions as clickable tags - Only show unselected ones */}
      {popularSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {popularSuggestions
            .filter(suggestion => !selectedItems.includes(suggestion))
            .slice(0, maxPopularTags)
            .map((suggestion) => (
              <button
                key={`popular-${suggestion}`}
                type="button"
                onClick={() => addItem(suggestion)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200"
              >
                {suggestion}
              </button>
            ))}
        </div>
      )}

      {/* Selected items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${tagColorClasses[tagColor]}`}
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="ml-2 text-current hover:text-opacity-80 focus:outline-none"
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
            className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
            style={{ 
              borderColor: 'var(--flambé-sage)', 
              backgroundColor: 'var(--flambé-fog)',
              color: 'var(--flambé-charcoal)'
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = 'var(--flambé-ember)';
              (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(var(--flambé-ember-rgb), 0.2)';
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = 'var(--flambé-sage)';
              (e.target as HTMLInputElement).style.boxShadow = 'none';
            }}
          />
          <div className="text-xs mt-1" style={{ color: 'var(--flambé-ember)' }}>
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Add a location to use Google Places API for real restaurant suggestions
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
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:outline-none"
          style={{ color: 'var(--flambé-charcoal)' }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = 'var(--flambé-ember)';
            (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(var(--flambé-ember-rgb), 0.2)';
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
            (e.target as HTMLInputElement).style.boxShadow = 'none';
          }}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--flambé-ember)' }}></div>
          </div>
        )}

        {/* Suggestions dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {/* Static suggestions */}
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
            
            {/* Enhanced search option */}
            {showEnhancedSearchOption && suggestionType !== 'static' && (
              <button
                type="button"
                onClick={handleEnhancedSearchActivation}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 hover:focus:outline-none border-t disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ 
                  backgroundColor: 'var(--flambé-fog)', 
                  color: 'var(--flambé-ember)',
                  borderColor: 'var(--flambé-stone)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-fog)';
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-fog)';
                }}
              >
                <div className="flex items-center space-x-2">
                  <div style={{ color: 'var(--flambé-ember)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">
                      {isLoading 
                        ? 'Searching...' 
                        : suggestions.length > 0 
                          ? 'Click for more results' 
                          : 'No search results found. Select to activate enhanced search.'
                      }
                    </div>
                    <div className="text-xs" style={{ color: 'var(--flambé-rust)' }}>
                      Search {suggestionType === 'restaurants' ? 'Google Places' : 'Wikidata'} for more options
                    </div>
                  </div>
                </div>
              </button>
            )}
            
            {/* No results message for static-only */}
            {suggestions.length === 0 && !showEnhancedSearchOption && suggestionType === 'static' && (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No matching suggestions found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicSuggestionInput; 