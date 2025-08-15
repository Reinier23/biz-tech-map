import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlowType, FlowFilterOptions } from './utils/flowTypes';
import { LEGEND_ITEMS } from './utils/flowStyles';

interface FlowLegendProps {
  filters: FlowFilterOptions;
  onFilterChange: (filters: Partial<FlowFilterOptions>) => void;
  className?: string;
}

export const FlowLegend: React.FC<FlowLegendProps> = ({
  filters,
  onFilterChange,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleFlowType = (flowType: FlowType) => {
    const newFlowTypes = filters.flowTypes.includes(flowType)
      ? filters.flowTypes.filter(type => type !== flowType)
      : [...filters.flowTypes, flowType];
    
    onFilterChange({ flowTypes: newFlowTypes });
  };

  const isFlowTypeVisible = (flowType: FlowType) => {
    return filters.flowTypes.includes(flowType);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Flow Types</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Legend Items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3">
              {LEGEND_ITEMS.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Toggle button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFlowType(item.type)}
                      className="h-6 w-6 p-0 hover:bg-muted/50"
                      aria-label={`${isFlowTypeVisible(item.type) ? 'Hide' : 'Show'} ${item.label}`}
                    >
                      {isFlowTypeVisible(item.type) ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>

                    {/* Flow type indicator */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-1 rounded-full"
                        style={{
                          backgroundColor: item.style.color,
                          borderStyle: item.style.pattern,
                          borderWidth: item.style.pattern === 'solid' ? 0 : 1,
                          borderColor: item.style.color
                        }}
                      />
                      
                      {/* Arrow indicator */}
                      <div className="flex items-center gap-1">
                        {item.style.arrowStyle === 'filled' ? (
                          <div 
                            className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4"
                            style={{ borderTopColor: item.style.color }}
                          />
                        ) : item.style.arrowStyle === 'hollow' ? (
                          <div 
                            className="w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-3 border-t-current"
                            style={{ color: item.style.color }}
                          />
                        ) : null}
                      </div>
                    </div>

                    {/* Label */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Visibility badge */}
                  <Badge 
                    variant={isFlowTypeVisible(item.type) ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {isFlowTypeVisible(item.type) ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Additional info */}
            <div className="px-3 pb-3 border-t border-border/50 pt-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• <strong>Bidirectional arrows</strong> show data flowing both ways</p>
                <p>• <strong>Edge thickness</strong> indicates data volume</p>
                <p>• <strong>Reliability dots</strong> show connection quality</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FlowLegend;
