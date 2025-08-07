import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Sparkles } from 'lucide-react';
import { getToolSuggestions, ToolSuggestion } from '@/lib/toolSuggestions';
import { getCategoryConfig } from '@/lib/categories';

interface ToolSearchBarProps {
  onAddTool: (toolName: string, category?: string) => void;
  existingTools: Array<{name: string; category: string}>;
}

export const ToolSearchBar: React.FC<ToolSearchBarProps> = ({ onAddTool, existingTools }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ToolSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update suggestions when query changes
  useEffect(() => {
    const newSuggestions = getToolSuggestions(query, 8);
    // Filter out already added tools
    const filteredSuggestions = newSuggestions.filter(suggestion => 
      !existingTools.some(tool => 
        tool.name.toLowerCase() === suggestion.name.toLowerCase()
      )
    );
    setSuggestions(filteredSuggestions);
    setSelectedIndex(0);
  }, [query, existingTools]);

  // Show suggestions when input has content
  useEffect(() => {
    if (query.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleAddTool = useCallback((toolName: string, category?: string) => {
    if (!toolName.trim()) return;
    
    onAddTool(toolName.trim(), category);
    setQuery('');
    setShowSuggestions(false);
    
    // Focus back to input for next tool
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [onAddTool]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          handleAddTool(suggestions[selectedIndex].name, suggestions[selectedIndex].category);
        } else if (query.trim()) {
          handleAddTool(query);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, query, handleAddTool]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    // Escape special regex characters to prevent invalid regex patterns
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-primary/20 font-medium">{part}</span>
      ) : (
        part
      )
    );
  };

  // Group suggestions by category
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, ToolSuggestion[]>);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for tools like Salesforce, HubSpot, Slack..."
          className="pl-10 pr-20 h-12 text-base bg-background border-2 focus:border-primary"
        />
        <Button
          onClick={() => handleAddTool(query)}
          disabled={!query.trim()}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Tool
        </Button>
      </div>

      {showSuggestions && (suggestions.length > 0 || query.length === 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <Command className="rounded-lg border-2 shadow-lg bg-background">
            <CommandList className="max-h-80">
              {suggestions.length === 0 && query.length > 0 ? (
                <CommandEmpty className="py-6 text-center text-sm">
                  <div className="space-y-2">
                    <p>No matches found for "{query}"</p>
                    <p className="text-muted-foreground text-xs">
                      Try popular tools like Salesforce, HubSpot, or Slack
                    </p>
                  </div>
                </CommandEmpty>
              ) : (
                <>
                  {query.length === 0 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Popular business tools
                      </div>
                    </div>
                  )}
                  {Object.entries(groupedSuggestions).map(([category, tools]) => {
                    const categoryConfig = getCategoryConfig(category);
                    return (
                      <CommandGroup key={category} heading={category}>
                        {tools.map((suggestion, index) => {
                          const globalIndex = suggestions.findIndex(s => s.id === suggestion.id);
                          return (
                            <CommandItem
                              key={suggestion.id}
                              className={`cursor-pointer p-3 ${
                                globalIndex === selectedIndex ? 'bg-accent' : ''
                              }`}
                              onSelect={() => handleAddTool(suggestion.name, suggestion.category)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3">
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      {highlightMatch(suggestion.name, query)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {suggestion.description}
                                    </div>
                                  </div>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`${categoryConfig.color} ${categoryConfig.textColor} text-xs`}
                                >
                                  {category}
                                </Badge>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    );
                  })}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};