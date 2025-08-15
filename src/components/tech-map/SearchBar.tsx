import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  activeFilters?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Search tools, categories, vendors...",
  className = "",
  showFilters = false,
  onToggleFilters,
  activeFilters = 0
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onClear();
    setShowSuggestions(false);
  }, [onClear]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (value.length > 0) {
      setShowSuggestions(true);
    }
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return [];
    
    // Mock suggestions - in real implementation, these would come from the data
    const mockSuggestions = [
      'Salesforce',
      'HubSpot',
      'Marketing',
      'Sales',
      'Service',
      'Microsoft',
      'Google',
      'Analytics'
    ];
    
    return mockSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 5);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={false}
        animate={{
          boxShadow: isFocused 
            ? '0 0 0 2px hsl(var(--primary)), 0 4px 12px rgba(0, 0, 0, 0.1)' 
            : '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <div className="relative flex items-center">
          {/* Search icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>

          {/* Input */}
          <Input
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="pl-10 pr-20 h-11 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm focus:border-primary/50 transition-all duration-200"
          />

          {/* Right side controls */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Active filters badge */}
            {activeFilters > 0 && (
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
              >
                {activeFilters}
              </Badge>
            )}

            {/* Filter toggle button */}
            {showFilters && onToggleFilters && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleFilters}
                    className="h-7 w-7 p-0 hover:bg-muted/50"
                  >
                    <Filter className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle filters</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Clear button */}
            {value && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-7 w-7 p-0 hover:bg-muted/50"
                >
                  <X className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* AI suggestion indicator */}
        {value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-0 flex items-center gap-1 text-xs text-muted-foreground"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI-powered search</span>
          </motion.div>
        )}
      </motion.div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    onChange(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-3 h-3 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
