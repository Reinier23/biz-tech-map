import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building, MoreHorizontal, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useTools } from '@/contexts/ToolsContext';
import { SearchBar } from './SearchBar';
import { Filters } from './Filters';
import { 
  getUniqueCategories, 
  getUniqueVendors,
  detectVendor,
  CATEGORY_CONFIGS 
} from './utils/dataTransform';
import { FilterOptions, ViewMode } from './utils/types';
import { Tool } from '@/contexts/ToolsContext';

interface BoardViewProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export const BoardView: React.FC<BoardViewProps> = ({
  viewMode,
  onViewModeChange,
  onNodeClick,
  className = ""
}) => {
  const { tools, updateTool } = useTools();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    vendors: [],
    status: [],
    search: '',
    showConnections: false,
    selectedNodeId: undefined
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  // Get unique categories and vendors
  const categories = useMemo(() => getUniqueCategories(tools), [tools]);
  const vendors = useMemo(() => getUniqueVendors(tools), [tools]);

  // Filter tools based on search and filters
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const category = tool.confirmedCategory || tool.category;
      const vendor = detectVendor(tool.name);
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          tool.name.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query) ||
          (vendor && vendor.toLowerCase().includes(query)) ||
          (tool.description && tool.description.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(category)) {
        return false;
      }
      
      // Vendor filter
      if (filters.vendors.length > 0 && vendor && !filters.vendors.includes(vendor)) {
        return false;
      }
      
      return true;
    });
  }, [tools, searchQuery, filters]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const grouped = categories.reduce((acc, category) => {
      acc[category] = filteredTools.filter(tool => 
        (tool.confirmedCategory || tool.category) === category
      );
      return acc;
    }, {} as Record<string, typeof tools>);

    return grouped;
  }, [filteredTools, categories]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag and drop
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // If dropping on a category, move the tool to that category
    if (categories.includes(overId)) {
      updateTool(activeId, { confirmedCategory: overId });
    }
  }, [updateTool, categories]);

  // Handle tool click
  const handleToolClick = useCallback((toolId: string) => {
    setSelectedToolId(toolId);
    onNodeClick?.(toolId);
  }, [onNodeClick]);

  // Handle search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setFilters(prev => ({ ...prev, search: value }));
  }, []);

  // Handle filters
  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className={`h-full ${className}`}>
      {/* Header with search and filters */}
      <div className="flex items-center gap-4 p-4 bg-card/50 backdrop-blur-sm border-b border-border/50">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange('')}
            showFilters={true}
            onToggleFilters={() => setFiltersOpen(!filtersOpen)}
            activeFilters={
              filters.categories.length + 
              filters.vendors.length + 
              filters.status.length
            }
          />
        </div>
        
        <div className="relative">
          <Filters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
            vendors={vendors}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewModeChange('graph')}
        >
          Switch to Graph View
        </Button>
      </div>

      {/* Board content */}
      <div className="flex-1 overflow-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryTools = toolsByCategory[category] || [];
              const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS['Other'];
              
              return (
                <div key={category} className="h-full">
                  <Card className="h-full bg-card/80 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <CardTitle className="text-sm font-semibold">
                            {category}
                          </CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {categoryTools.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <SortableContext items={categoryTools.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          <AnimatePresence>
                            {categoryTools.map((tool) => {
                              const vendor = detectVendor(tool.name);
                              
                              return (
                                <SortableToolItem
                                  key={tool.id}
                                  tool={tool}
                                  vendor={vendor}
                                  category={category}
                                  isSelected={selectedToolId === tool.id}
                                  onClick={() => handleToolClick(tool.id)}
                                />
                              );
                            })}
                          </AnimatePresence>

                          {/* Empty state for category */}
                          {categoryTools.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <div className="text-2xl mb-2">{config.icon}</div>
                              <p className="text-xs">No tools in this category</p>
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>

      {/* Empty state */}
      {tools.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">No tools to display</h3>
            <p className="text-muted-foreground">Add some tools to see your tech stack board</p>
          </div>
        </div>
      )}

      {/* No results state */}
      {tools.length > 0 && filteredTools.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Sortable tool item component
interface SortableToolItemProps {
  tool: Tool;
  vendor?: string;
  category: string;
  isSelected: boolean;
  onClick: () => void;
}

const SortableToolItem: React.FC<SortableToolItemProps> = ({
  tool,
  vendor,
  category,
  isSelected,
  onClick
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tool.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`
        p-3 rounded-lg border border-border/50 bg-card/50
        cursor-pointer transition-all duration-200
        ${isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'}
        ${isSelected ? 'ring-2 ring-primary' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          {tool.logoUrl ? (
            <img
              src={tool.logoUrl}
              alt={`${tool.name} logo`}
              className="w-8 h-8 rounded object-cover border border-border/50"
              loading="lazy"
              crossOrigin="anonymous"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).onerror = null;
                (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded border border-border/50 flex items-center justify-center bg-muted/50">
              <Building className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Tool info */}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-foreground truncate">
            {tool.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground truncate">
              {vendor || category}
            </span>
            {tool.confidence && (
              <Badge variant="outline" className="text-xs">
                {Math.round(tool.confidence * 100)}%
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>More options</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
};

export default BoardView;
