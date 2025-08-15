import React from 'react';
import { motion } from 'framer-motion';
import { CategoryNode as CategoryNodeType } from './utils/types';
import { CATEGORY_CONFIGS } from './utils/dataTransform';

interface CategoryNodeProps {
  data: CategoryNodeType['data'];
}

export const CategoryNode: React.FC<CategoryNodeProps> = ({ data }) => {
  const { category, toolCount, color } = data;
  const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS['Other'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="
        relative
        bg-gradient-to-r from-card/80 to-card/60
        border border-border/50
        rounded-xl p-4
        backdrop-blur-sm
        shadow-sm
      "
      style={{
        width: 1200,
        height: 100,
        '--category-color': color
      } as React.CSSProperties}
    >
      {/* Category indicator bar */}
      <div 
        className="absolute top-0 left-0 w-full h-2 rounded-t-xl"
        style={{ backgroundColor: color }}
      />

      {/* Content */}
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {config.icon}
          </div>

          {/* Category info */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {category}
            </h2>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>

        {/* Tool count */}
        <div className="flex items-center gap-2">
          <div 
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: `${color}20`,
              color: color
            }}
          >
            {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
          </div>
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 rounded-xl opacity-5 pointer-events-none"
        style={{ 
          background: `linear-gradient(135deg, ${color}00 0%, ${color}40 100%)`
        }}
      />
    </motion.div>
  );
};

export default CategoryNode;
