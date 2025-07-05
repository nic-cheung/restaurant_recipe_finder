import React, { useState, useRef, useEffect } from 'react';

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
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedItems.includes(suggestion)
      ).slice(0, 5); // Limit to 5 suggestions
      setFilteredSuggestions(filtered);
      setIsDropdownOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [inputValue, suggestions, selectedItems]);

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

  const colorClasses = {
    green: {
      tag: 'bg-green-100 text-green-800 border-green-200',
      button: 'text-green-600 hover:text-green-800'
    },
    red: {
      tag: 'bg-red-100 text-red-800 border-red-200',
      button: 'text-red-600 hover:text-red-800'
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-gray-900">
        {label}
      </h2>
      
      {/* Selected Items Display */}
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${colorClasses[tagColor].tag}`}
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(item)}
              className={`ml-2 focus:outline-none ${colorClasses[tagColor].button}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Autocomplete Input */}
      <div className="relative" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => inputValue && setIsDropdownOpen(filteredSuggestions.length > 0)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        
        {/* Dropdown */}
        {isDropdownOpen && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
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