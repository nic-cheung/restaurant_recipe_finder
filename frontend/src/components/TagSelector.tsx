import React, { useState, useRef, useEffect } from 'react';

interface TagSelectorProps {
  label: string;
  popularOptions: string[];
  allOptions: string[];
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  placeholder?: string;
  maxPopularTags?: number;
  allowCustom?: boolean;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  label,
  popularOptions,
  allOptions,
  selectedItems,
  onSelectionChange,
  placeholder = "Type to search or add...",
  maxPopularTags = 6,
  allowCustom = false,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allOptions.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedItems.includes(option)
      );
      setFilteredOptions(filtered);
      setIsDropdownOpen(true);
    } else {
      setFilteredOptions([]);
      setIsDropdownOpen(false);
    }
  }, [inputValue, allOptions, selectedItems]);

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

  const toggleTag = (tag: string) => {
    if (selectedItems.includes(tag)) {
      onSelectionChange(selectedItems.filter(item => item !== tag));
    } else {
      onSelectionChange([...selectedItems, tag]);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0 && filteredOptions[0]) {
        // Select first filtered option
        toggleTag(filteredOptions[0]);
        setInputValue('');
      } else if (allowCustom && inputValue.trim() && !selectedItems.includes(inputValue.trim())) {
        // Add custom tag
        const trimmedValue = inputValue.trim();
        onSelectionChange([...selectedItems, trimmedValue]);
        setInputValue('');
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setInputValue('');
    }
  };

  const handleOptionClick = (option: string) => {
    toggleTag(option);
    setInputValue('');
    setIsDropdownOpen(false);
  };

  const displayedPopularOptions = popularOptions.slice(0, maxPopularTags);

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">{label}</h3>
      
      {/* Popular Tags */}
      <div className="flex flex-wrap gap-2">
        {displayedPopularOptions.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedItems.includes(tag)
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Selected Items Display */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200"
            >
              {item}
              <button
                type="button"
                onClick={() => toggleTag(item)}
                className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
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
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => inputValue && setIsDropdownOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        
        {/* Dropdown */}
        {isDropdownOpen && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleOptionClick(option)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {option}
              </button>
            ))}
            {allowCustom && inputValue.trim() && !allOptions.includes(inputValue.trim()) && (
              <button
                type="button"
                onClick={() => handleOptionClick(inputValue.trim())}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-t border-gray-200 text-blue-600"
              >
                Add "{inputValue.trim()}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector; 