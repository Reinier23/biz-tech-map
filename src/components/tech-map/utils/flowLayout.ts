import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { DataFlowNode, DataFlowEdge, LayoutConfig } from './flowTypes';
import { LAYOUT_CONFIG, PERFORMANCE_THRESHOLDS } from './flowStyles';

/**
 * Apply Dagre layout to nodes and edges
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): Node[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Configure graph layout
  dagreGraph.setGraph({
    rankdir: config.direction || LAYOUT_CONFIG.dagre.rankdir,
    nodesep: config.nodeSpacing || LAYOUT_CONFIG.dagre.nodesep,
    ranksep: config.rankSpacing || LAYOUT_CONFIG.dagre.ranksep,
    marginx: LAYOUT_CONFIG.dagre.marginx,
    marginy: LAYOUT_CONFIG.dagre.marginy
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    const width = (node.style?.width as number) || 240;
    const height = (node.style?.height as number) || 80;
    
    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = (node.style?.width as number) || 240;
    const height = (node.style?.height as number) || 80;
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2
      }
    };
  });
}

/**
 * Apply swimlane layout (tools grouped by category)
 */
export function applySwimlaneLayout(
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): Node[] {
  const toolNodes = nodes.filter(node => node.type === 'dataFlowNode') as DataFlowNode[];
  
  // Group tools by category
  const toolsByCategory = toolNodes.reduce((acc, node) => {
    const category = node.data.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(node);
    return acc;
  }, {} as Record<string, DataFlowNode[]>);

  // Sort categories by order (you can customize this)
  const sortedCategories = Object.keys(toolsByCategory).sort();

  // Position nodes within their categories
  const positionedNodes = sortedCategories.flatMap((category, categoryIndex) => {
    const tools = toolsByCategory[category];
    const categoryY = categoryIndex * LAYOUT_CONFIG.swimlanes.categorySpacing + LAYOUT_CONFIG.swimlanes.verticalPadding;
    
    return tools.map((node, toolIndex) => {
      const width = (node.style?.width as number) || 240;
      const height = (node.style?.height as number) || 80;
      
      return {
        ...node,
        position: {
          x: LAYOUT_CONFIG.swimlanes.horizontalPadding + toolIndex * (width + LAYOUT_CONFIG.swimlanes.nodeSpacing),
          y: categoryY + 120 // Below category header
        }
      };
    });
  });

  return positionedNodes;
}

/**
 * Apply force-directed layout (simplified)
 */
export function applyForceLayout(
  nodes: Node[],
  edges: Edge[],
  config: Partial<LayoutConfig> = {}
): Node[] {
  const positions = new Map<string, { x: number; y: number }>();
  
  // Initialize random positions
  nodes.forEach((node) => {
    positions.set(node.id, {
      x: Math.random() * 800,
      y: Math.random() * 600
    });
  });

  // Simple force simulation
  const iterations = 50;
  const repulsionForce = 100;
  const attractionForce = 0.1;
  
  for (let i = 0; i < iterations; i++) {
    // Repulsion between all nodes
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
    });

    // Attraction along edges
    edges.forEach((edge) => {
      const sourcePos = positions.get(edge.source)!;
      const targetPos = positions.get(edge.target)!;
      
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const force = attractionForce * distance;
        sourcePos.x += (dx / distance) * force;
        sourcePos.y += (dy / distance) * force;
        targetPos.x -= (dx / distance) * force;
        targetPos.y -= (dy / distance) * force;
      }
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
export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  layoutType: LayoutConfig['type'] = 'dagre',
  config: Partial<LayoutConfig> = {}
): Node[] {
  switch (layoutType) {
    case 'dagre':
      return applyDagreLayout(nodes, edges, config);
    case 'swimlanes':
      return applySwimlaneLayout(nodes, edges, config);
    case 'force':
      return applyForceLayout(nodes, edges, config);
    default:
      return applyDagreLayout(nodes, edges, config);
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
    const width = (node.style?.width as number) || 240;
    const height = (node.style?.height as number) || 80;

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
 * Optimize layout for performance
 */
export function optimizeLayout(nodes: Node[], edges: Edge[]) {
  // Filter out unnecessary nodes/edges for large datasets
  if (nodes.length > PERFORMANCE_THRESHOLDS.maxNodes) {
    // Keep most important nodes (e.g., by category, vendor, etc.)
    const importantNodes = nodes
      .sort((a, b) => {
        // Prioritize nodes with more connections
        const aConnections = edges.filter(e => e.source === a.id || e.target === a.id).length;
        const bConnections = edges.filter(e => e.source === b.id || e.target === b.id).length;
        return bConnections - aConnections;
      })
      .slice(0, PERFORMANCE_THRESHOLDS.maxNodes);

    const importantNodeIds = new Set(importantNodes.map(n => n.id));
    const filteredEdges = edges.filter(e => 
      importantNodeIds.has(e.source) && importantNodeIds.has(e.target)
    ).slice(0, PERFORMANCE_THRESHOLDS.maxEdges);

    return {
      nodes: importantNodes,
      edges: filteredEdges
    };
  }

  return { nodes, edges };
}

/**
 * Get layout recommendations based on data characteristics
 */
export function getRecommendedLayout(nodes: Node[], edges: Edge[]): LayoutConfig['type'] {
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const categoryCount = new Set(nodes.map(n => n.data?.category)).size;

  if (nodeCount <= 10) {
    return 'swimlanes'; // Small datasets work well with swimlanes
  } else if (edgeCount > nodeCount * 0.5) {
    return 'dagre'; // High connectivity suggests hierarchical
  } else if (categoryCount <= 4) {
    return 'swimlanes'; // Few categories work well with swimlanes
  } else {
    return 'force'; // Default to force layout for complex cases
  }
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
