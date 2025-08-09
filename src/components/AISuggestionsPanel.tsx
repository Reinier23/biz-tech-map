import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logAudit } from '@/lib/audit';

interface Tool {
  id: string;
  name: string;
  category: string;
  confirmedCategory?: string;
  description: string;
  logoUrl?: string;
  confidence?: number;
}

interface ConsolidationResult {
  tool: Tool;
  category: string;
  recommendation: "Replace" | "Evaluate" | "No Match" | "Keep";
  reason: string;
}

interface AISuggestionsPanelProps {
  tools: Tool[];
  isVisible: boolean;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({ tools, isVisible }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ConsolidationResult[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (isVisible && tools.length >= 3 && !hasAnalyzed) {
      analyzeSuggestions();
    }
  }, [isVisible, tools, hasAnalyzed]);

  useEffect(() => {
    if (isVisible) {
      void logAudit('ai_suggestions_viewed', { toolsCount: tools.length }).catch(() => {});
    }
  }, [isVisible, tools.length]);

  const analyzeSuggestions = async () => {
    setIsLoading(true);
    try {
      const validTools = tools.filter(tool => tool.name.trim() && tool.confidence && tool.confidence > 70);
      
      if (validTools.length === 0) return;

      const { data, error } = await supabase.functions.invoke('suggestConsolidation', {
        body: { tools: validTools }
      });

      if (error) throw error;

      if (data?.results) {
        setSuggestions(data.results);
        setHasAnalyzed(true);
      }
    } catch (error) {
      console.error('Error analyzing suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'Replace':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Evaluate':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'Keep':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    const colors = {
      'Replace': 'bg-green-100 text-green-800 border-green-200',
      'Evaluate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Keep': 'bg-blue-100 text-blue-800 border-blue-200',
      'No Match': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return colors[recommendation as keyof typeof colors] || colors['No Match'];
  };

  if (!isVisible) return null;

  return (
    <div className="animate-fade-in">
      <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">AI Consolidation Insights</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Here are redundancy and consolidation ideas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="h-4 w-4 animate-pulse" />
                Analyzing your tech stack for consolidation opportunities...
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Based on your tools, here's what we found:
              </p>
              
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.tool.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {suggestion.tool.logoUrl && (
                            <img 
                              src={suggestion.tool.logoUrl} 
                              alt={`${suggestion.tool.name} logo`}
                              className="h-5 w-5 object-contain rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <span className="font-medium">{suggestion.tool.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.reason}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(suggestion.recommendation)}
                        <Badge 
                          variant="outline" 
                          className={getRecommendationBadge(suggestion.recommendation)}
                        >
                          {suggestion.recommendation}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Quick Summary</span>
                </div>
                <div className="text-xs text-muted-foreground grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Replace: {suggestions.filter(s => s.recommendation === 'Replace').length}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Evaluate: {suggestions.filter(s => s.recommendation === 'Evaluate').length}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Keep: {suggestions.filter(s => s.recommendation === 'Keep').length}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    No Match: {suggestions.filter(s => s.recommendation === 'No Match').length}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Add a few more tools to see consolidation insights
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};