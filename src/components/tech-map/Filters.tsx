import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp, Layers, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FilterOptions } from './utils/types';

interface FiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
  vendors: string[];
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  vendors,
  isOpen,
  onToggle,
  className = ""
}) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    vendors: true,
    status: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilter = (type: keyof FilterOptions, value: string, checked: boolean) => {
    const currentFilters = filters[type] as string[];
    let newFilters: string[];

    if (checked) {
      newFilters = [...currentFilters, value];
    } else {
      newFilters = currentFilters.filter(item => item !== value);
    }

    onFiltersChange({
      ...filters,
      [type]: newFilters
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      vendors: [],
      status: [],
      search: filters.search,
      showConnections: filters.showConnections,
      selectedNodeId: filters.selectedNodeId
    });
  };

  const activeFilterCount = 
    filters.categories.length + 
    filters.vendors.length + 
    filters.status.length;

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-500' },
    { value: 'evaluating', label: 'Evaluating', color: 'bg-yellow-500' },
    { value: 'replacing', label: 'Replacing', color: 'bg-orange-500' },
    { value: 'deprecated', label: 'Deprecated', color: 'bg-red-500' }
  ];

  return (
    <div className={className}>
      {/* Filter toggle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="relative"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <Badge 
            variant="secondary" 
            className="ml-2 h-5 w-5 p-0 text-xs bg-primary text-primary-foreground"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Filters panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg z-50"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Filters</h3>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Categories section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('categories')}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Categories</span>
                    {filters.categories.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.categories.length}
                      </Badge>
                    )}
                  </div>
                  {expandedSections.categories ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.categories && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 mt-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={filters.categories.includes(category)}
                              onCheckedChange={(checked) => 
                                updateFilter('categories', category, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`category-${category}`}
                              className="text-sm cursor-pointer"
                            >
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Separator className="my-4" />

              {/* Vendors section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('vendors')}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Vendors</span>
                    {filters.vendors.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.vendors.length}
                      </Badge>
                    )}
                  </div>
                  {expandedSections.vendors ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.vendors && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                        {vendors.map((vendor) => (
                          <div key={vendor} className="flex items-center space-x-2">
                            <Checkbox
                              id={`vendor-${vendor}`}
                              checked={filters.vendors.includes(vendor)}
                              onCheckedChange={(checked) => 
                                updateFilter('vendors', vendor, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`vendor-${vendor}`}
                              className="text-sm cursor-pointer"
                            >
                              {vendor}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Separator className="my-4" />

              {/* Status section */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('status')}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Status</span>
                    {filters.status.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.status.length}
                      </Badge>
                    )}
                  </div>
                  {expandedSections.status ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.status && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 mt-2">
                        {statusOptions.map((status) => (
                          <div key={status.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status.value}`}
                              checked={filters.status.includes(status.value)}
                              onCheckedChange={(checked) => 
                                updateFilter('status', status.value, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`status-${status.value}`}
                              className="text-sm cursor-pointer flex items-center gap-2"
                            >
                              <div className={`w-2 h-2 rounded-full ${status.color}`} />
                              {status.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Show connections toggle */}
              <Separator className="my-4" />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-connections"
                  checked={filters.showConnections}
                  onCheckedChange={(checked) => 
                    onFiltersChange({
                      ...filters,
                      showConnections: checked as boolean
                    })
                  }
                />
                <Label htmlFor="show-connections" className="text-sm cursor-pointer">
                  Show connections only for selected node
                </Label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Filters;
