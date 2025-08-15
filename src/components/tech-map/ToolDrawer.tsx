import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Building, Tag, DollarSign, Activity, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tool } from '@/contexts/ToolsContext';
import { ToolDrawerState } from './utils/types';

interface ToolDrawerProps {
  state: ToolDrawerState;
  tool?: Tool;
  onClose: () => void;
  onUpdate?: (toolId: string, updates: Partial<Tool>) => void;
}

export const ToolDrawer: React.FC<ToolDrawerProps> = ({
  state,
  tool,
  onClose,
  onUpdate
}) => {
  if (!tool) return null;

  const handleUpdate = (updates: Partial<Tool>) => {
    onUpdate?.(tool.id, updates);
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ 
              x: state.position === 'left' ? -400 : 400,
              opacity: 0 
            }}
            animate={{ 
              x: 0,
              opacity: 1 
            }}
            exit={{ 
              x: state.position === 'left' ? -400 : 400,
              opacity: 0 
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`
              fixed top-0 bottom-0 w-96 bg-card/95 backdrop-blur-md border-l border-border/50
              shadow-xl z-50 overflow-hidden
              ${state.position === 'left' ? 'left-0 border-l-0 border-r' : 'right-0'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">Tool Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Tool Header */}
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {tool.logoUrl ? (
                    <img
                      src={tool.logoUrl}
                      alt={`${tool.name} logo`}
                      className="w-16 h-16 rounded-xl object-cover border border-border/50"
                      loading="lazy"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).onerror = null;
                        (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-border/50 flex items-center justify-center bg-muted/50">
                      <Building className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Tool Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {tool.confirmedCategory || tool.category}
                    </Badge>
                    {tool.confidence && (
                      <Badge variant="secondary">
                        {Math.round(tool.confidence * 100)}% confidence
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Details</h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Tag className="w-4 h-4" />
                      <span>Category</span>
                    </div>
                    <p className="font-medium">{tool.confirmedCategory || tool.category}</p>
                  </div>

                  {tool.confidence && (
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Activity className="w-4 h-4" />
                        <span>Confidence</span>
                      </div>
                      <p className="font-medium">{Math.round(tool.confidence * 100)}%</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Actions</h4>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Could open tool website or documentation
                      if (tool.logoUrl) {
                        const domain = new URL(tool.logoUrl).hostname;
                        window.open(`https://${domain}`, '_blank');
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Could open documentation or help
                      console.log('Open documentation for:', tool.name);
                    }}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    View Documentation
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Quick Actions</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUpdate({ 
                      manualRecommendation: 'Keep' 
                    })}
                    className={tool.manualRecommendation === 'Keep' ? 'bg-green-50 border-green-200' : ''}
                  >
                    Keep
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUpdate({ 
                      manualRecommendation: 'Evaluate' 
                    })}
                    className={tool.manualRecommendation === 'Evaluate' ? 'bg-yellow-50 border-yellow-200' : ''}
                  >
                    Evaluate
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUpdate({ 
                      manualRecommendation: 'Replace' 
                    })}
                    className={tool.manualRecommendation === 'Replace' ? 'bg-red-50 border-red-200' : ''}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last updated</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ToolDrawer;
