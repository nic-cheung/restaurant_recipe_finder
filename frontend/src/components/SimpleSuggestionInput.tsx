import React, { useState, useEffect, useRef } from 'react';

interface SimpleSuggestionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  getSuggestions?: (query: string) => Promise<string[]>;
  className?: string;
}

const SimpleSuggestionInput: React.FC<SimpleSuggestionInputProps> = ({
  value,
  onChange,
  placeholder = "type to search...",
  suggestions = [],
  getSuggestions,
  className = ""
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  // Fetch dynamic suggestions
  const fetchSuggestions = async (query: string) => {
    if (!getSuggestions || !query.trim()) {
      setDynamicSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await getSuggestions(query);
      setDynamicSuggestions(results);
      setIsDropdownOpen(results.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setDynamicSuggestions([]);
      setIsDropdownOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear existing debounce
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    
    // Show static suggestions immediately if no dynamic fetch function
    if (!getSuggestions) {
      const filtered = suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(newValue.toLowerCase())
      );
      setDynamicSuggestions(filtered);
      setIsDropdownOpen(filtered.length > 0 && newValue.length > 0);
      return;
    }
    
    // Debounce the API call for dynamic suggestions
    debounceRef.current = window.setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (dynamicSuggestions.length > 0 && dynamicSuggestions[0]) {
        selectSuggestion(dynamicSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleFocus = () => {
    if (value && value.length > 0) {
      if (getSuggestions) {
        fetchSuggestions(value);
      } else {
        const filtered = suggestions.filter(suggestion => 
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setDynamicSuggestions(filtered);
        setIsDropdownOpen(filtered.length > 0);
      }
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

  // Combine static and dynamic suggestions, prioritizing dynamic
  const displaySuggestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : suggestions;
  const filteredSuggestions = displaySuggestions.filter(suggestion => 
    suggestion.toLowerCase().includes((value || '').toLowerCase())
  ).slice(0, 8); // Limit to 8 suggestions

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`input-field ${className}`}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--flambé-sage)' }}></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {isDropdownOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-y-auto" style={{ backgroundColor: 'var(--flambé-cream)', borderColor: 'var(--flambé-ash)' }}>
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className="w-full text-left px-3 py-2 focus:outline-none first:rounded-t-md last:rounded-b-md transition-colors flambé-body"
              style={{ color: 'var(--flambé-charcoal)' }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }}
              onFocus={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
              }}
              onBlur={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleSuggestionInput; 