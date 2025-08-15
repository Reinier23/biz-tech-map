import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { Building, ExternalLink, MoreHorizontal, Tag, DollarSign, Activity, Zap } from 'lucide-react';
import { DataFlowNode as DataFlowNodeType } from './utils/flowTypes';
import { CATEGORY_GROUPS, HUB_STYLES, PROMINENCE_STYLES, DATA_VOLUME_COLORS } from './utils/flowStyles';
import { Badge } from '@/components/ui/badge';

interface DataFlowNodeProps extends NodeProps {
  data: DataFlowNodeType['data'];
  selected?: boolean;
  onClick?: (nodeId: string) => void;
  onFocus?: (nodeId: string) => void;
  onBlur?: () => void;
  isFocused?: boolean;
}

export const DataFlowNode: React.FC<DataFlowNodeProps> = ({ 
  data, 
  selected = false, 
  onClick,
  onFocus,
  onBlur,
  isFocused = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { tool, category, vendor, isHub, prominence, dataVolume, integrationCount } = data;
  const categoryConfig = CATEGORY_GROUPS[category];

  const handleClick = useCallback(() => {
    onClick?.(tool.id);
  }, [onClick, tool.id]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onFocus?.(tool.id);
  }, [onFocus, tool.id]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onBlur?.();
  }, [onBlur]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Determine styling based on hub status and prominence
  const getNodeStyles = () => {
    if (isHub) {
      return {
        borderColor: HUB_STYLES.primary.borderColor,
        borderWidth: HUB_STYLES.primary.borderWidth,
        boxShadow: HUB_STYLES.primary.shadow,
        transform: `scale(${HUB_STYLES.primary.scale})`
      };
    }
    
    const prominenceStyle = PROMINENCE_STYLES[prominence || 'tertiary'];
    return {
      borderWidth: prominenceStyle.borderWidth,
      boxShadow: prominenceStyle.boxShadow,
      transform: `scale(${prominenceStyle.scale})`
    };
  };

  const nodeStyles = getNodeStyles();
  const volumeColor = dataVolume ? DATA_VOLUME_COLORS[dataVolume] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isFocused ? 0.3 : 1, 
        scale: selected ? 1.05 : 1,
        ...nodeStyles
      }}
      transition={{ 
        duration: 0.2, 
        ease: "easeOut" 
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${tool.name}, ${category} tool${isHub ? ', central hub' : ''}`}
      className={`
        relative group cursor-pointer
        bg-gradient-to-br from-card/90 to-card/70
        border rounded-xl p-3
        backdrop-blur-md
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isHovered ? 'border-primary/50' : ''}
        ${isHub ? 'z-20' : 'z-10'}
      `}
      style={{
        width: 240,
        height: 80,
        '--category-color': categoryConfig?.color || '#94A3B8'
      } as React.CSSProperties}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Category indicator */}
      <div 
        className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
        style={{ backgroundColor: categoryConfig?.color || '#94A3B8' }}
      />

      {/* Hub indicator */}
      {isHub && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg"
        >
          <Zap className="w-3 h-3 text-primary-foreground" />
        </motion.div>
      )}

      {/* Main content */}
      <div className="flex items-center gap-3 h-full">
        {/* Logo */}
        <div className="relative flex-shrink-0">
          {tool.logoUrl ? (
            <motion.img
              src={tool.logoUrl}
              alt={`${tool.name} logo`}
              className="w-10 h-10 rounded-lg object-cover border border-border/50"
              loading="lazy"
              crossOrigin="anonymous"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).onerror = null;
                (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg border border-border/50 flex items-center justify-center bg-muted/50">
              <Building className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          
          {/* Data volume indicator */}
          {volumeColor && (
            <div 
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background"
              style={{ backgroundColor: volumeColor }}
            />
          )}
        </div>

        {/* Tool info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate" title={tool.name}>
                {tool.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5"
                  style={{ 
                    backgroundColor: `${categoryConfig?.color}20`,
                    color: categoryConfig?.color,
                    borderColor: `${categoryConfig?.color}30`
                  }}
                >
                  {category}
                </Badge>
                {vendor && (
                  <span className="text-xs text-muted-foreground truncate" title={vendor}>
                    {vendor}
                  </span>
                )}
              </div>
            </div>

            {/* Integration count */}
            {integrationCount && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>{integrationCount}</span>
              </div>
            )}
          </div>

          {/* Data flow indicators */}
          <div className="flex items-center gap-2 mt-2">
            {data.dataIn.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">← {data.dataIn.length}</span>
              </div>
            )}
            {data.dataOut.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">→ {data.dataOut.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Selection indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-background rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default DataFlowNode;
