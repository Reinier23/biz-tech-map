import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Target, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FlowFilterOptions, FlowType } from './utils/flowTypes';

interface FlowControlsProps {
  filters: FlowFilterOptions;
  onFilterChange: (filters: Partial<FlowFilterOptions>) => void;
  categories: string[];
  vendors: string[];
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  className?: string;
}

export const FlowControls: React.FC<FlowControlsProps> = ({
  filters,
  onFilterChange,
  categories,
  vendors,
  isFocusMode,
  onToggleFocusMode,
  className = ""
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleSearchChange = useCallback((value: string) => {
    onFilterChange({ search: value });
  }, [onFilterChange]);

  const handleClearSearch = useCallback(() => {
    onFilterChange({ search: '' });
  }, [onFilterChange]);

  const handleCategoryToggle = useCallback((category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFilterChange({ categories: newCategories });
  }, [filters.categories, onFilterChange]);

  const handleVendorToggle = useCallback((vendor: string) => {
    const newVendors = filters.vendors.includes(vendor)
      ? filters.vendors.filter(v => v !== vendor)
      : [...filters.vendors, vendor];
    
    onFilterChange({ vendors: newVendors });
  }, [filters.vendors, onFilterChange]);

  const handleFlowTypeToggle = useCallback((flowType: FlowType) => {
    const newFlowTypes = filters.flowTypes.includes(flowType)
      ? filters.flowTypes.filter(type => type !== flowType)
      : [...filters.flowTypes, flowType];
    
    onFilterChange({ flowTypes: newFlowTypes });
  }, [filters.flowTypes, onFilterChange]);

  const activeFiltersCount = filters.categories.length + filters.vendors.length + 
    (filters.flowTypes.length < 3 ? 1 : 0) + (filters.search ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg p-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tools, vendors..."
            className="pl-10 pr-8 h-9"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4 mr-2" />
              Categories
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filters.categories.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Vendor Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4 mr-2" />
              Vendors
              {filters.vendors.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filters.vendors.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {vendors.map((vendor) => (
              <DropdownMenuCheckboxItem
                key={vendor}
                checked={filters.vendors.includes(vendor)}
                onCheckedChange={() => handleVendorToggle(vendor)}
              >
                {vendor}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Focus Mode Toggle */}
        <Button
          variant={isFocusMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleFocusMode}
          className="h-9"
          title="Focus mode: highlight only connected nodes"
        >
          <Target className="w-4 h-4 mr-2" />
          Focus
        </Button>

        {/* Active Filters Badge */}
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount} active
          </Badge>
        )}
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-border/50"
          >
            <div className="flex flex-wrap gap-2">
              {filters.categories.map((category) => (
                <Badge
                  key={`cat-${category}`}
                  variant="outline"
                  className="text-xs"
                >
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCategoryToggle(category)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-muted"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
              {filters.vendors.map((vendor) => (
                <Badge
                  key={`ven-${vendor}`}
                  variant="outline"
                  className="text-xs"
                >
                  {vendor}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVendorToggle(vendor)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-muted"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
              {filters.search && (
                <Badge variant="outline" className="text-xs">
                  "{filters.search}"
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="h-4 w-4 p-0 ml-1 hover:bg-muted"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FlowControls;
