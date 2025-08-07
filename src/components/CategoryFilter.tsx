import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { defaultCategories, getCategoryConfig } from '@/lib/categories';

interface CategoryFilterProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  toolCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  activeFilters, 
  onFilterChange, 
  toolCounts 
}) => {
  const toggleFilter = (categoryId: string) => {
    if (categoryId === 'All') {
      onFilterChange([]);
    } else {
      const newFilters = activeFilters.includes(categoryId)
        ? activeFilters.filter(id => id !== categoryId)
        : [...activeFilters, categoryId];
      onFilterChange(newFilters);
    }
  };

  const allActive = activeFilters.length === 0;
  const totalTools = Object.values(toolCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground mr-2">Filter by:</span>
      
      {/* All Filter */}
      <Button
        variant={allActive ? "default" : "outline"}
        size="sm"
        onClick={() => toggleFilter('All')}
        className="gap-2"
      >
        All
        {totalTools > 0 && (
          <Badge variant="secondary" className="bg-background text-foreground">
            {totalTools}
          </Badge>
        )}
      </Button>
      
      {/* Category Filters */}
      {defaultCategories.map((category) => {
        const isActive = activeFilters.includes(category.id);
        const count = toolCounts[category.id] || 0;
        const categoryConfig = getCategoryConfig(category.id);
        const Icon = category.icon;
        
        return (
          <Button
            key={category.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter(category.id)}
            className="gap-2"
            disabled={count === 0}
          >
            <Icon className="h-3 w-3" />
            {category.name}
            {count > 0 && (
              <Badge 
                variant="secondary" 
                className={`${isActive ? 'bg-primary-foreground text-primary' : 'bg-background text-foreground'}`}
              >
                {count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};