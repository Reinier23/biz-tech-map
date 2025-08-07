import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToolChip } from './ToolChip';
import { CategoryFilter } from './CategoryFilter';
import { defaultCategories, getCategoryConfig } from '@/lib/categories';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Tool {
  id: string;
  name: string;
  category: string;
  confirmedCategory?: string;
  description: string;
  logoUrl?: string;
  confidence?: number;
}

interface ToolBucketProps {
  tools: Tool[];
  onRemoveTool: (id: string) => void;
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

export const ToolBucket: React.FC<ToolBucketProps> = ({ 
  tools, 
  onRemoveTool, 
  activeFilters, 
  onFilterChange 
}) => {
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set());

  // Group tools by their confirmed category or original category
  const toolsByCategory = tools.reduce((acc, tool) => {
    const category = tool.confirmedCategory || tool.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  // Calculate tool counts for filters
  const toolCounts = defaultCategories.reduce((acc, category) => {
    acc[category.id] = toolsByCategory[category.id]?.length || 0;
    return acc;
  }, {} as Record<string, number>);

  // Filter categories based on active filters
  const visibleCategories = activeFilters.length === 0 
    ? Object.keys(toolsByCategory)
    : Object.keys(toolsByCategory).filter(category => activeFilters.includes(category));

  const toggleCategory = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  if (tools.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No tools added yet</h3>
          <p className="text-sm text-muted-foreground">
            Start typing in the search bar above to add your first tool
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tool Counter and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-secondary/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1">
            <Package className="h-3 w-3" />
            {tools.length} tools added
          </Badge>
        </div>
        <CategoryFilter 
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
          toolCounts={toolCounts}
        />
      </div>

      {/* Tools by Category */}
      <div className="space-y-4">
        {visibleCategories.map((categoryId) => {
          const categoryTools = toolsByCategory[categoryId];
          const categoryConfig = getCategoryConfig(categoryId);
          const categoryDefinition = defaultCategories.find(cat => cat.id === categoryId);
          const Icon = categoryDefinition?.icon || Package;
          const isCollapsed = collapsedCategories.has(categoryId);

          return (
            <Card key={categoryId} className="overflow-hidden">
              <Collapsible>
                <CollapsibleTrigger 
                  className="w-full"
                  onClick={() => toggleCategory(categoryId)}
                >
                  <CardHeader className="pb-3 hover:bg-secondary/20 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${categoryConfig.textColor}`} />
                        <span>{categoryDefinition?.name || categoryId}</span>
                        <Badge variant="secondary">
                          {categoryTools.length} tools
                        </Badge>
                      </div>
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {categoryTools.map((tool) => (
                        <ToolChip
                          key={tool.id}
                          tool={tool}
                          onRemove={onRemoveTool}
                        />
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};