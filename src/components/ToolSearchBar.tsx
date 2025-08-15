import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Search, X, Loader2, Plus, Sparkles, Building, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getToolSuggestions, type ToolSuggestion } from '@/lib/toolSuggestions';
import { brandfetchLogo } from '@/lib/utils';
import { DEBUG } from '@/lib/config';
import { useTools } from '@/contexts/ToolsContext';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { getCategoryConfig } from '@/lib/categories';
import { ToolSuggestionDialog } from '@/components/ToolSuggestionDialog';

// SaaS category allowlist (must match server-side filter)
const ALLOWED_CATEGORIES = new Set([
  'Marketing','Sales','Service','Comms','Project Management','Development','Dev/IT',
  'Analytics','Finance','ERP','Security','Ecommerce','Data','Ops/NoCode','Knowledge','HR'
]);

// Types for Supabase RPC response
interface SearchToolsRow {
  name: string;
  category: string;
  description: string;
  domain?: string;
  logo_url?: string;
}

// Brandfetch logo helper imported from utils
type UISuggestion = ToolSuggestion & { domain?: string };
interface ToolSearchBarProps {
  onAddTool: (toolName: string, category?: string) => void;
  existingTools: Array<{name: string; category: string}>;
}

export const ToolSearchBar: React.FC<ToolSearchBarProps> = ({ onAddTool, existingTools }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<UISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);


// Debounce query updates
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(query);
    if (DEBUG) console.debug('[ToolSearchBar] Debounced query:', query);
  }, 250);
  return () => clearTimeout(timer);
}, [query]);

// Listen for prefill events from elsewhere (e.g., GhostNode)
useEffect(() => {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<string>;
    const q = customEvent.detail || '';
    setQuery(q);
    setShowSuggestions(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  window.addEventListener('toolsearch:prefill', handler);
  return () => window.removeEventListener('toolsearch:prefill', handler);
}, []);


  // Memoized fetch function to prevent recreation on every render
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (DEBUG) console.debug('[ToolSearchBar] Fetching suggestions for:', searchQuery);
    try {
      setIsLoading(true);

      const trimmed = (searchQuery || '').trim();
      if (DEBUG) console.log('[TSB] query=', searchQuery);
      let qArg = trimmed;
      if (trimmed.length === 0) {
        qArg = '';
      } else if (trimmed.length < 2) {
        // Show curated local list for single-character queries; avoid hitting RPC
        const local = getToolSuggestions('', 8) as UISuggestion[];
        const filtered = local
          .filter(s => ALLOWED_CATEGORIES.has(s.category))
          .filter(suggestion =>
            !existingTools.some(tool => tool.name.toLowerCase() === suggestion.name.toLowerCase())
          );
        setSuggestions(filtered);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('search_tools', { q: qArg, lim: 10 });

      if (error) throw error;

      const rows = (data || []) as SearchToolsRow[];
      const apiSuggestions: ToolSuggestion[] = Array.isArray(rows)
        ? rows.map((row) => ({
            id: row.domain ?? row.name?.toLowerCase().replace(/\s+/g, '-'),
            name: row.name,
            category: (row.category || 'Other'),
            description: row.description ?? '',
            logoUrl: (row.logo_url ?? (row.domain ? brandfetchLogo(row.domain) : undefined)) || undefined,
          }))
        : [];
      if (DEBUG) {
        console.debug('[ToolSearchBar] RPC rows:', rows);
        console.debug('[ToolSearchBar] Mapped suggestions:', apiSuggestions);
      }
      const filteredSuggestions = apiSuggestions
        .filter((s: ToolSuggestion) => ALLOWED_CATEGORIES.has(s.category))
        .filter((suggestion: ToolSuggestion) =>
          !existingTools.some(tool => tool.name.toLowerCase() === suggestion.name.toLowerCase())
        );
      setSuggestions(filteredSuggestions);
    } catch (error) {
      console.warn('RPC search failed, using local fallback:', error);
      const newSuggestions = getToolSuggestions(searchQuery, 8) as ToolSuggestion[];
      const filteredSuggestions = newSuggestions
        .filter(s => ALLOWED_CATEGORIES.has(s.category))
        .filter(suggestion =>
          !existingTools.some(tool => tool.name.toLowerCase() === suggestion.name.toLowerCase())
        );
      setSuggestions(filteredSuggestions);
    } finally {
      setIsLoading(false);
    }
  }, [existingTools]);

  // Update suggestions when debounced query changes
  useEffect(() => {
    fetchSuggestions(debouncedQuery);
    setSelectedIndex(0);
  }, [debouncedQuery, fetchSuggestions]);

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

  // Memoize grouped suggestions to prevent unnecessary recalculations
  const groupedSuggestions = useMemo(() => {
    return suggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.category]) {
        acc[suggestion.category] = [];
      }
      acc[suggestion.category].push(suggestion);
      return acc;
    }, {} as Record<string, ToolSuggestion[]>);
  }, [suggestions]);

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
          placeholder="Search for tools like Microsoft 365, Azure, Salesforce..."
          className="pl-10 pr-20 h-12 text-base bg-background border-2 focus:border-primary"
          aria-label="Search tools"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="tool-suggestions"
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
            <CommandList id="tool-suggestions" className="max-h-80" aria-live="polite">
              {suggestions.length === 0 && query.length > 0 ? (
                <CommandEmpty className="py-6 text-center text-sm">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p>No matches found for "{query}"</p>
                      <p className="text-muted-foreground text-xs">
                        Try popular tools like Salesforce, HubSpot, or Slack
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowSuggestionDialog(true)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      Suggest this tool
                    </Button>
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
                              value={suggestion.name}
                              className={`cursor-pointer p-3 ${
                                globalIndex === selectedIndex ? 'bg-accent' : ''
                              }`}
                              onSelect={() => handleAddTool(suggestion.name, suggestion.category)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3">
                                  {(suggestion.logoUrl) ? (
                                    <img
                                      src={suggestion.logoUrl}
                                      alt={suggestion.name}
                                      className="w-6 h-6 rounded-full"
                                      loading="lazy"
                                      crossOrigin="anonymous"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = '/placeholder.svg';
                                      }}
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded border flex items-center justify-center text-muted-foreground">
                                      <Building className="h-4 w-4" />
                                    </div>
                                  )}
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      {highlightMatch(suggestion.name, query)}
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                      {suggestion.description}
                                    </div>
                                  </div>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`${categoryConfig.color} ${categoryConfig.textColor} text-xs shrink-0`}
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

      <ToolSuggestionDialog
        isOpen={showSuggestionDialog}
        onClose={() => setShowSuggestionDialog(false)}
        initialToolName={query}
      />
    </div>
  );
};