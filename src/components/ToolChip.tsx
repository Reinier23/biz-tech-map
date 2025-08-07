import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, CheckCircle } from 'lucide-react';
import { getCategoryConfig } from '@/lib/categories';

interface Tool {
  id: string;
  name: string;
  category: string;
  confirmedCategory?: string;
  description: string;
  logoUrl?: string;
  confidence?: number;
}

interface ToolChipProps {
  tool: Tool;
  onRemove: (id: string) => void;
}

export const ToolChip: React.FC<ToolChipProps> = ({ tool, onRemove }) => {
  const categoryConfig = getCategoryConfig(tool.confirmedCategory || tool.category);
  const isEnriched = tool.confidence && tool.confidence > 0;
  const hasManualCategory = tool.confirmedCategory && tool.confirmedCategory !== tool.category;

  return (
    <div className="inline-flex items-center gap-2 bg-background border-2 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Tool Logo */}
      {tool.logoUrl && (
        <img 
          src={tool.logoUrl} 
          alt={`${tool.name} logo`}
          className="h-6 w-6 object-contain rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      
      {/* Tool Name */}
      <span className="font-medium text-foreground">{tool.name}</span>
      
      {/* Category Badge */}
      <Badge 
        variant="outline" 
        className={`${categoryConfig.color} ${categoryConfig.textColor} text-xs border-current`}
      >
        {tool.confirmedCategory || tool.category}
      </Badge>
      
      {/* Confidence Indicator */}
      {isEnriched && (
        <div className="flex items-center gap-1">
          {tool.confidence && tool.confidence >= 80 && (
            <CheckCircle className="h-3 w-3 text-green-600" />
          )}
          {hasManualCategory && (
            <span className="text-xs text-muted-foreground" title="Category manually updated">
              ✓
            </span>
          )}
        </div>
      )}
      
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(tool.id)}
        className="h-5 w-5 p-0 ml-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};