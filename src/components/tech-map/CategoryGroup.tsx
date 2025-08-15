import React from 'react';
import { motion } from 'framer-motion';
import { CategoryGroup as CategoryGroupType } from './utils/flowTypes';
import { CATEGORY_GROUPS } from './utils/flowStyles';

interface CategoryGroupProps {
  category: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  toolCount: number;
  isVisible?: boolean;
}

export const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  position,
  width,
  height,
  toolCount,
  isVisible = true
}) => {
  const config = CATEGORY_GROUPS[category] || CATEGORY_GROUPS['Other'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: isVisible ? 0.1 : 0,
        scale: 1
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        width,
        height,
        zIndex: 1
      }}
    >
      {/* Background */}
      <div 
        className="w-full h-full rounded-xl backdrop-blur-sm border border-border/20"
        style={{ 
          backgroundColor: config.background,
          backgroundImage: `linear-gradient(135deg, ${config.color}10 0%, ${config.color}05 100%)`
        }}
      />

      {/* Category label */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${config.color}20` }}
        >
          {config.icon || '📦'}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground/80">
            {category}
          </h3>
          <p className="text-xs text-muted-foreground">
            {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
          </p>
        </div>
      </div>

      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 rounded-xl opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, ${config.color} 0%, transparent 50%)`
        }}
      />
    </motion.div>
  );
};

export default CategoryGroup;
