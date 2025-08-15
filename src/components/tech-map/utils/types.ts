import { Node, Edge } from '@xyflow/react';
import { Tool } from '@/contexts/ToolsContext';

// Enhanced Tool interface with additional metadata
export interface EnhancedTool extends Tool {
  vendor?: string;
  domain?: string;
  cost?: number;
  usage?: string;
  notes?: string;
  connections?: string[]; // Connected tool IDs
  tags?: string[];
  status?: 'active' | 'evaluating' | 'replacing' | 'deprecated';
}

// Node types for React Flow
export interface ToolNode extends Node {
  data: {
    tool: EnhancedTool;
    category: string;
    vendor?: string;
    connections: string[];
    metadata: {
      cost?: number;
      usage?: string;
      notes?: string;
      tags?: string[];
      status?: string;
    };
  };
}

export interface CategoryNode extends Node {
  data: {
    category: string;
    toolCount: number;
    color: string;
  };
}

// Edge types for connections
export interface ToolConnection extends Edge {
  data?: {
    label?: string;
    type?: 'integration' | 'data-flow' | 'dependency';
    strength?: number; // 0-1 connection strength
  };
}

// View modes
export type ViewMode = 'graph' | 'board' | 'list';

// Filter options
export interface FilterOptions {
  categories: string[];
  vendors: string[];
  status: string[];
  search: string;
  showConnections: boolean;
  selectedNodeId?: string;
}

// Layout options
export type LayoutType = 'hierarchical' | 'swimlanes' | 'force' | 'dagre';

// Category configuration
export interface CategoryConfig {
  name: string;
  color: string;
  icon: string;
  description: string;
  order: number;
}

// Tool drawer state
export interface ToolDrawerState {
  isOpen: boolean;
  toolId?: string;
  position: 'left' | 'right';
}

// Search and filter state
export interface SearchState {
  query: string;
  filters: FilterOptions;
  results: string[]; // Tool IDs
  isSearching: boolean;
}

// Performance metrics
export interface PerformanceMetrics {
  nodeCount: number;
  edgeCount: number;
  renderTime: number;
  searchTime: number;
  layoutTime: number;
}

// Export types
export interface ExportOptions {
  format: 'png' | 'pdf' | 'svg';
  includeMetadata: boolean;
  includeConnections: boolean;
  resolution: 'low' | 'medium' | 'high';
}

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Z-index layers
export const Z_INDEX = {
  background: 0,
  nodes: 10,
  edges: 5,
  controls: 20,
  drawer: 30,
  modal: 40,
  tooltip: 50,
} as const;
