import React, { useState, useRef, useEffect, useMemo } from 'react';

interface IngredientInputProps {
  label: string;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  tagColor?: 'green' | 'red';
}

const IngredientInput: React.FC<IngredientInputProps> = ({
  label,
  selectedItems,
  onSelectionChange,
  placeholder = "Add ingredient...",
  suggestions = [],
  tagColor = 'green',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate filtered suggestions directly in render to avoid dependency issues
  const filteredSuggestions = useMemo(() => {
    if (inputValue.trim() && suggestions.length > 0) {
      return suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedItems.includes(suggestion)
      ).slice(0, 5); // Limit to 5 suggestions
    }
    return [];
  }, [inputValue, suggestions, selectedItems.join(',')]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addItem = (item: string) => {
    if (item.trim() && !selectedItems.includes(item.trim())) {
      onSelectionChange([...selectedItems, item.trim()]);
      setInputValue('');
      setIsDropdownOpen(false);
    }
  };

  const removeItem = (item: string) => {
    onSelectionChange(selectedItems.filter(selected => selected !== item));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsDropdownOpen(value.trim().length > 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0 && filteredSuggestions[0]) {
        addItem(filteredSuggestions[0]);
      } else if (inputValue.trim()) {
        addItem(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addItem(suggestion);
  };



  // Get available suggestions to display as clickable pills (excluding selected ones)
  const availableSuggestions = suggestions.filter(suggestion => !selectedItems.includes(suggestion));

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Available suggestions as clickable pills - Only show unselected ones */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addItem(suggestion)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Selected Items Display - All selected items with blue styling */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <span
              key={item}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                tagColor === 'green' 
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-red-100 text-red-800 border-2 border-red-300'
              }`}
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

      {/* Autocomplete Input */}
      <div className="relative" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => inputValue && setIsDropdownOpen(filteredSuggestions.length > 0)}
          placeholder={placeholder}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {/* Dropdown */}
        {isDropdownOpen && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
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

export default IngredientInput; 