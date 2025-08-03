import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Sparkles, Edit3, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Tool {
  id: string;
  name: string;
  category: string;
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
  const [isManualMode, setIsManualMode] = useState(false);
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
        onUpdate(tool.id, 'category', data.category);
        onUpdate(tool.id, 'description', data.description);
        onUpdate(tool.id, 'logoUrl', data.logoUrl);
        onUpdate(tool.id, 'confidence', data.confidence);
      } else if (data?.fallback) {
        setEnrichedData(data.fallback);
        onUpdate(tool.id, 'category', data.fallback.category);
        onUpdate(tool.id, 'description', data.fallback.description);
      }
    } catch (error) {
      console.error('Error enriching tool data:', error);
      setIsManualMode(true);
    } finally {
      setIsLoading(false);
    }
  }, [tool.id, onUpdate]);

  const handleNameChange = useCallback((value: string) => {
    onUpdate(tool.id, 'name', value);
    
    // Debounce the API call
    if (value.trim() && !isManualMode) {
      const timeoutId = setTimeout(() => {
        enrichToolData(value);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [enrichToolData, isManualMode, onUpdate, tool.id]);

  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    if (isManualMode) {
      // Reset to smart mode
      setEnrichedData(null);
    }
  };

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
        <div className="flex items-center gap-2">
          {!isManualMode && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleManualMode}
            className="text-xs"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            {isManualMode ? 'Use AI' : 'Manual'}
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Tool Name {!isManualMode && <span className="text-muted-foreground">(we'll handle the rest!)</span>}
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

          {!isLoading && (tool.category || tool.description || isManualMode) && (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Category
                  </label>
                  {isManualMode ? (
                    <select
                      value={tool.category}
                      onChange={(e) => onUpdate(tool.id, 'category', e.target.value)}
                      className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="">Select category</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Service">Service</option>
                      <option value="Development">Development</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Communication">Communication</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <Badge variant="outline" className="w-fit">
                      {tool.category}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Description
                </label>
                {isManualMode ? (
                  <textarea
                    value={tool.description}
                    onChange={(e) => onUpdate(tool.id, 'description', e.target.value)}
                    placeholder="Describe what this tool does..."
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground min-h-[80px] resize-none"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded border">
                    {tool.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};