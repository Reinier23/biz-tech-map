
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, X, CheckCircle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getAllCategories } from '@/lib/categories';

interface Tool {
  id: string;
  name: string;
  category: string;
  confirmedCategory?: string; // User's confirmed category choice
  description: string;
  logoUrl?: string;
  confidence?: number;
}

interface SmartToolInputProps {
  tool: Tool;
  onUpdate: (id: string, field: keyof Tool, value: string | number) => void;
  onRemove: (id: string) => void;
}

interface EnrichedData {
  category: string;
  description: string;
  logoUrl: string;
  confidence: number;
}

export const SmartToolInput: React.FC<SmartToolInputProps> = ({
  tool,
  onUpdate,
  onRemove
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedData, setEnrichedData] = useState<EnrichedData | null>(null);

  const enrichToolData = useCallback(async (toolName: string) => {
    if (!toolName.trim() || toolName.length < 2) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enrichToolData', {
        body: { toolName: toolName.trim() }
      });

      if (error) throw error;

      if (data && !data.error) {
        setEnrichedData(data);
        // Only update category if we don't already have a confirmed category (backward compatibility)
        if (!tool.confirmedCategory) {
          onUpdate(tool.id, 'category', data.category);
          onUpdate(tool.id, 'confirmedCategory', data.category);
        }
        onUpdate(tool.id, 'description', data.description);
        onUpdate(tool.id, 'logoUrl', data.logoUrl);
        onUpdate(tool.id, 'confidence', data.confidence);
      } else if (data?.fallback) {
        setEnrichedData(data.fallback);
        // Only update category if we don't already have a confirmed category
        if (!tool.confirmedCategory) {
          onUpdate(tool.id, 'category', data.fallback.category);
          onUpdate(tool.id, 'confirmedCategory', data.fallback.category);
        }
        onUpdate(tool.id, 'description', data.fallback.description);
      }
    } catch (error) {
      console.error('Error enriching tool data:', error);
      // Fallback to safe defaults on error
      const fallbackData = {
        category: tool.category || "Other",
        description: tool.description || `${toolName} - Please add description manually`,
        logoUrl: "",
        confidence: 0
      };
      setEnrichedData(fallbackData);
      // Only set fallback if no category exists
      if (!tool.category && !tool.confirmedCategory) {
        onUpdate(tool.id, 'category', "Other");
        onUpdate(tool.id, 'confirmedCategory', "Other");
        onUpdate(tool.id, 'description', fallbackData.description);
        onUpdate(tool.id, 'confidence', 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tool.id, onUpdate, tool.category, tool.confirmedCategory, tool.description]);

  const handleNameChange = useCallback((value: string) => {
    onUpdate(tool.id, 'name', value);
    
    // Debounce the API call
    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        enrichToolData(value);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [enrichToolData, onUpdate, tool.id]);

  const handleCategoryConfirm = useCallback((selectedCategory: string) => {
    onUpdate(tool.id, 'confirmedCategory', selectedCategory);
  }, [onUpdate, tool.id]);

  return (
    <Card className="p-6 space-y-4 relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(tool.id)}
        className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="space-y-4">
        <Badge variant="outline" className="gap-1 w-fit">
          <Sparkles className="h-3 w-3" />
          AI-Powered
        </Badge>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Tool Name <span className="text-muted-foreground">(we'll handle the rest!)</span>
            </label>
            <Input
              value={tool.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Salesforce, HubSpot, Slack..."
              className="text-base"
            />
          </div>

          {isLoading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing tool...
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {!isLoading && (tool.category || tool.description) && (
            <div className="grid gap-3">
              {tool.logoUrl && (
                <div className="flex items-center gap-2">
                  <img 
                    src={tool.logoUrl} 
                    alt={`${tool.name} logo`}
                    className="h-8 w-8 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {tool.confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {tool.confidence}% confident
                    </Badge>
                  )}
                </div>
              )}

              {/* Categorization Feedback - Show for any tool with category */}
              {tool.category && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {tool.confidence >= 80 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-orange-500"></div>
                      )}
                      <span className="text-sm font-medium">
                        Categorized as: <span className="text-primary">{tool.category}</span>
                      </span>
                    </div>
                    <Badge variant={tool.confidence && tool.confidence >= 80 ? "default" : "secondary"} className="text-xs">
                      {tool.confidence ? `${tool.confidence}% confidence` : 'Manual assignment'}
                    </Badge>
                  </div>
                  
                  {(!tool.confidence || tool.confidence < 80) && (
                    <div className="mt-3">
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Override Category
                      </label>
                      <Select
                        value={tool.confirmedCategory || tool.category}
                        onValueChange={handleCategoryConfirm}
                      >
                        <SelectTrigger className="w-full bg-background border-2">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 shadow-lg z-50">
                          {getAllCategories().map((category) => (
                            <SelectItem 
                              key={category.id} 
                              value={category.id} 
                              className="hover:bg-secondary focus:bg-secondary"
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {tool.confirmedCategory && tool.confirmedCategory !== tool.category && (
                        <div className="flex items-center gap-1 mt-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Category overridden</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* High confidence - show final category selection */}
              {tool.category && tool.confidence && tool.confidence >= 80 && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Final Category
                  </label>
                  <Select
                    value={tool.confirmedCategory || tool.category}
                    onValueChange={handleCategoryConfirm}
                  >
                    <SelectTrigger className="w-full bg-background border-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 shadow-lg z-50">
                      {getAllCategories().map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id} 
                          className="hover:bg-secondary focus:bg-secondary"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {tool.confirmedCategory && tool.confirmedCategory !== tool.category && (
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Category updated</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Description
                </label>
                <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded border">
                  {tool.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
