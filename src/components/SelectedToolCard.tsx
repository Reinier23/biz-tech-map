import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  confidence?: number;
}

interface SelectedToolCardProps {
  tool: Tool;
  onRemove: (id: string) => void;
}

export const SelectedToolCard: React.FC<SelectedToolCardProps> = ({
  tool,
  onRemove
}) => {
  return (
    <div className="relative flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors group">
      {/* Logo */}
      {tool.logoUrl ? (
        <img
          src={tool.logoUrl}
          alt={`${tool.name} logo`}
          className="w-8 h-8 rounded flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-muted-foreground">
            {tool.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm truncate">{tool.name}</h3>
          {tool.confidence && tool.confidence > 0.7 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              AI
            </Badge>
          )}
        </div>
        {tool.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {tool.description}
          </p>
        )}
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(tool.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};