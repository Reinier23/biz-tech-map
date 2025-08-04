import React, { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  confidence?: number;
}

interface SearchableToolInputProps {
  category: string;
  onToolSelect: (tool: Tool) => void;
  placeholder?: string;
}

interface ToolSuggestion {
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  confidence?: number;
}

export const SearchableToolInput: React.FC<SearchableToolInputProps> = ({
  category,
  onToolSelect,
  placeholder = "Search for a tool..."
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<ToolSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const enrichToolData = useCallback(async (toolName: string): Promise<ToolSuggestion | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('enrichToolData', {
        body: { toolName }
      });

      if (error) {
        console.error('Error enriching tool data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error calling enrichToolData function:', error);
      return null;
    }
  }, []);

  const handleSearchChange = useCallback(async (value: string) => {
    setSearchValue(value);
    
    if (value.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Simple suggestion: just the typed value
    const basicSuggestion: ToolSuggestion = {
      name: value,
      category,
      description: '',
    };

    // Try to get AI enrichment
    const enrichedData = await enrichToolData(value);
    
    if (enrichedData) {
      setSuggestions([{
        ...enrichedData,
        category: category // Override with the current category
      }]);
    } else {
      setSuggestions([basicSuggestion]);
    }
    
    setIsLoading(false);
  }, [category, enrichToolData]);

  const handleSelect = (suggestion: ToolSuggestion) => {
    const tool: Tool = {
      id: crypto.randomUUID(),
      name: suggestion.name,
      category,
      description: suggestion.description,
      logoUrl: suggestion.logoUrl,
      confidence: suggestion.confidence,
    };

    onToolSelect(tool);
    setSearchValue('');
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
        >
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{placeholder}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : suggestions.length === 0 && searchValue.length >= 2 ? (
              <CommandEmpty>No tools found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleSelect(suggestion)}
                    className="flex items-center gap-3 p-3"
                  >
                    {suggestion.logoUrl && (
                      <img
                        src={suggestion.logoUrl}
                        alt={`${suggestion.name} logo`}
                        className="w-6 h-6 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.name}</div>
                      {suggestion.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                    {suggestion.confidence && (
                      <div className="text-xs text-muted-foreground">
                        {Math.round(suggestion.confidence * 100)}%
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};