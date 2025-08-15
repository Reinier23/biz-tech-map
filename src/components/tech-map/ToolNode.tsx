import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { Building, ExternalLink, MoreHorizontal, Tag, DollarSign, Activity } from 'lucide-react';
import { ToolNode as ToolNodeType } from './utils/types';
import { CATEGORY_CONFIGS } from './utils/dataTransform';

interface ToolNodeProps extends NodeProps {
  data: ToolNodeType['data'];
  selected?: boolean;
  onClick?: (nodeId: string) => void;
}

export const ToolNode: React.FC<ToolNodeProps> = ({ 
  data, 
  selected = false, 
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { tool, category, vendor, metadata } = data;
  const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS['Other'];

  const handleClick = useCallback(() => {
    onClick?.(tool.id);
  }, [onClick, tool.id]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: selected 
          ? '0 0 0 3px hsl(var(--primary)), 0 8px 25px rgba(0, 0, 0, 0.15)' 
          : isHovered 
            ? '0 8px 25px rgba(0, 0, 0, 0.15)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      transition={{ 
        duration: 0.2, 
        ease: "easeOut" 
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`
        relative group cursor-pointer
        bg-gradient-to-br from-card to-card/80
        border border-border/50
        rounded-xl p-3
        backdrop-blur-sm
        transition-all duration-200
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isHovered ? 'border-primary/30' : ''}
      `}
      style={{
        width: 240,
        height: 80,
        '--category-color': config.color
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
        style={{ backgroundColor: config.color }}
      />

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
          
          {/* Status indicator */}
          {metadata.status && metadata.status !== 'active' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background">
              <div 
                className={`w-full h-full rounded-full ${
                  metadata.status === 'evaluating' ? 'bg-yellow-500' :
                  metadata.status === 'replacing' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
              />
            </div>
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
                <span className="text-xs text-muted-foreground truncate" title={vendor || category}>
                  {vendor || category}
                </span>
                {metadata.cost && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="w-3 h-3" />
                    <span>{metadata.cost}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action menu */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1"
                >
                  <button className="p-1 rounded hover:bg-muted/50 transition-colors">
                    <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tags and metadata */}
          <div className="flex items-center gap-2 mt-2">
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {metadata.tags[0]}
                  {metadata.tags.length > 1 && ` +${metadata.tags.length - 1}`}
                </span>
              </div>
            )}
            
            {tool.confidence && (
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {Math.round(tool.confidence * 100)}%
                </span>
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

export default ToolNode;
