import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { ToolNode, CategoryNode, LayoutType } from './types';
import { CATEGORY_CONFIGS } from './dataTransform';

// Layout configuration
const LAYOUT_CONFIG = {
  nodeWidth: 240,
  nodeHeight: 80,
  nodeSpacing: 40,
  categorySpacing: 120,
  horizontalPadding: 50,
  verticalPadding: 50
};

/**
 * Apply Dagre hierarchical layout
 */
export function applyDagreLayout(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',
    nodesep: LAYOUT_CONFIG.nodeSpacing,
    ranksep: LAYOUT_CONFIG.categorySpacing,
    marginx: LAYOUT_CONFIG.horizontalPadding,
    marginy: LAYOUT_CONFIG.verticalPadding
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: LAYOUT_CONFIG.nodeWidth,
      height: LAYOUT_CONFIG.nodeHeight
    });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply positions to nodes
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - LAYOUT_CONFIG.nodeWidth / 2,
        y: nodeWithPosition.y - LAYOUT_CONFIG.nodeHeight / 2
      }
    };
  });
}

/**
 * Apply swimlane layout (tools grouped by category)
 */
export function applySwimlaneLayout(nodes: Node[], edges: Edge[]) {
  const toolNodes = nodes.filter(node => node.type === 'toolNode') as ToolNode[];
  const categoryNodes = nodes.filter(node => node.type === 'categoryNode') as CategoryNode[];
  
  // Group tools by category
  const toolsByCategory = toolNodes.reduce((acc, node) => {
    const category = node.data.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(node);
    return acc;
  }, {} as Record<string, ToolNode[]>);

  // Sort categories by order
  const sortedCategories = Object.keys(toolsByCategory).sort((a, b) => {
    const configA = CATEGORY_CONFIGS[a] || CATEGORY_CONFIGS['Other'];
    const configB = CATEGORY_CONFIGS[b] || CATEGORY_CONFIGS['Other'];
    return configA.order - configB.order;
  });

  // Position category nodes
  const positionedCategoryNodes = categoryNodes.map((node, index) => ({
    ...node,
    position: {
      x: LAYOUT_CONFIG.horizontalPadding,
      y: index * LAYOUT_CONFIG.categorySpacing + LAYOUT_CONFIG.verticalPadding
    }
  }));

  // Position tool nodes within their categories
  const positionedToolNodes = sortedCategories.flatMap((category, categoryIndex) => {
    const tools = toolsByCategory[category];
    const categoryY = categoryIndex * LAYOUT_CONFIG.categorySpacing + LAYOUT_CONFIG.verticalPadding + 120; // Below category node
    
    return tools.map((node, toolIndex) => ({
      ...node,
      position: {
        x: LAYOUT_CONFIG.horizontalPadding + toolIndex * (LAYOUT_CONFIG.nodeWidth + LAYOUT_CONFIG.nodeSpacing),
        y: categoryY
      }
    }));
  });

  return [...positionedCategoryNodes, ...positionedToolNodes];
}

/**
 * Apply force-directed layout (simplified)
 */
export function applyForceLayout(nodes: Node[], edges: Edge[]) {
  // Simple force layout implementation
  const positions = new Map<string, { x: number; y: number }>();
  
  // Initialize random positions
  nodes.forEach((node) => {
    positions.set(node.id, {
      x: Math.random() * 800,
      y: Math.random() * 600
    });
  });

  // Simple force simulation (repulsion between nodes)
  const iterations = 50;
  const repulsionForce = 100;
  
  for (let i = 0; i < iterations; i++) {
    nodes.forEach((node1) => {
      const pos1 = positions.get(node1.id)!;
      let fx = 0;
      let fy = 0;

      nodes.forEach((node2) => {
        if (node1.id === node2.id) return;
        
        const pos2 = positions.get(node2.id)!;
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const force = repulsionForce / (distance * distance);
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        }
      });

      // Apply forces
      pos1.x += fx * 0.1;
      pos1.y += fy * 0.1;
      
      // Keep within bounds
      pos1.x = Math.max(LAYOUT_CONFIG.horizontalPadding, Math.min(800, pos1.x));
      pos1.y = Math.max(LAYOUT_CONFIG.verticalPadding, Math.min(600, pos1.y));
    });
  }

  // Apply positions to nodes
  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) || { x: 0, y: 0 }
  }));
}

/**
 * Apply layout based on type
 */
export function applyLayout(nodes: Node[], edges: Edge[], layoutType: LayoutType): Node[] {
  switch (layoutType) {
    case 'hierarchical':
      return applyDagreLayout(nodes, edges);
    case 'swimlanes':
      return applySwimlaneLayout(nodes, edges);
    case 'force':
      return applyForceLayout(nodes, edges);
    case 'dagre':
      return applyDagreLayout(nodes, edges);
    default:
      return applySwimlaneLayout(nodes, edges);
  }
}

/**
 * Calculate optimal viewport for nodes
 */
export function calculateViewport(nodes: Node[]) {
  if (nodes.length === 0) {
    return { x: 0, y: 0, zoom: 1 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const { x, y } = node.position;
    const width = (node.style?.width as number) || LAYOUT_CONFIG.nodeWidth;
    const height = (node.style?.height as number) || LAYOUT_CONFIG.nodeHeight;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  const padding = 100;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  return {
    x: centerX,
    y: centerY,
    zoom: Math.min(1, 800 / width, 600 / height)
  };
}

/**
 * Animate layout transition
 */
export function animateLayoutTransition(
  nodes: Node[],
  targetPositions: Map<string, { x: number; y: number }>,
  duration: number = 500
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const startPositions = new Map(
      nodes.map(node => [node.id, { x: node.position.x, y: node.position.y }])
    );

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      nodes.forEach((node) => {
        const startPos = startPositions.get(node.id)!;
        const targetPos = targetPositions.get(node.id)!;
        
        if (startPos && targetPos) {
          node.position.x = startPos.x + (targetPos.x - startPos.x) * easedProgress;
          node.position.y = startPos.y + (targetPos.y - startPos.y) * easedProgress;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    animate();
  });
}

/**
 * Get layout recommendations based on data characteristics
 */
export function getRecommendedLayout(nodes: Node[], edges: Edge[]): LayoutType {
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const categoryCount = new Set(nodes.map(n => n.data?.category)).size;

  if (nodeCount <= 10) {
    return 'swimlanes'; // Small datasets work well with swimlanes
  } else if (edgeCount > nodeCount * 0.5) {
    return 'hierarchical'; // High connectivity suggests hierarchical
  } else if (categoryCount <= 4) {
    return 'swimlanes'; // Few categories work well with swimlanes
  } else {
    return 'force'; // Default to force layout for complex cases
  }
}

/**
 * Optimize layout for performance
 */
export function optimizeLayout(nodes: Node[], edges: Edge[], layoutType: LayoutType) {
  // Filter out unnecessary nodes/edges for large datasets
  const maxNodes = 100;
  const maxEdges = 200;

  if (nodes.length > maxNodes) {
    // Keep most important nodes (e.g., by category, vendor, etc.)
    const importantNodes = nodes
      .sort((a, b) => {
        // Prioritize nodes with more connections
        const aConnections = edges.filter(e => e.source === a.id || e.target === a.id).length;
        const bConnections = edges.filter(e => e.source === b.id || e.target === b.id).length;
        return bConnections - aConnections;
      })
      .slice(0, maxNodes);

    const importantNodeIds = new Set(importantNodes.map(n => n.id));
    const filteredEdges = edges.filter(e => 
      importantNodeIds.has(e.source) && importantNodeIds.has(e.target)
    ).slice(0, maxEdges);

    return {
      nodes: importantNodes,
      edges: filteredEdges
    };
  }

  return { nodes, edges };
}
