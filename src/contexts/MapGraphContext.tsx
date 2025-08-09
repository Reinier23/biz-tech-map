import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';
import { useTools } from '@/contexts/ToolsContext';
import { supabase } from '@/integrations/supabase/client';

// Category lanes in fixed order
export const CATEGORY_LANES: string[] = [
  'Marketing',
  'Sales',
  'Service',
  'Comms',
  'Dev/IT',
  'Project Management',
  'Knowledge',
  'Development',
  'Finance',
  'Analytics',
  'ERP',
  'Security',
  'Ecommerce',
  'Data',
  'Ops/NoCode',
  'Other',
];

interface MapGraphContextType {
  nodes: Node[];
  edges: Edge[];
  recompute: () => void;
}

const MapGraphContext = createContext<MapGraphContextType | undefined>(undefined);

export const useMapGraph = () => {
  const ctx = useContext(MapGraphContext);
  if (!ctx) throw new Error('useMapGraph must be used within a MapGraphProvider');
  return ctx;
};

interface Props { children: ReactNode }

type LaneSettings = { labels?: Record<string, string>; colors?: Record<string, string> };

const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;
const GRAPH_NODE_SEP = 40;
const GRAPH_RANK_SEP = 60;
const LANE_VERTICAL_PADDING = 32;
const LANE_HORIZONTAL_PADDING = 24;
const CANVAS_WIDTH = 1800; // wide enough background for most stacks

export const MapGraphProvider: React.FC<Props> = ({ children }) => {
  const { tools } = useTools();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [laneSettings, setLaneSettings] = useState<LaneSettings>({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('ui_settings')
          .select('value')
          .eq('key', 'lanes')
          .maybeSingle();
        if (data?.value) setLaneSettings(data.value as LaneSettings);
      } catch (e) {
        console.error('[ui_settings] fetch failed', e);
      }
    })();
  }, []);
  const categorized = useMemo(() => {
    const buckets: Record<string, typeof tools> = {};
    CATEGORY_LANES.forEach((c) => (buckets[c] = []));
    for (const t of tools) {
      const lane = (t.confirmedCategory || t.category || 'Other') as string;
      const key = CATEGORY_LANES.includes(lane) ? lane : 'Other';
      buckets[key] = buckets[key] || [];
      buckets[key].push(t);
    }
    return buckets;
  }, [tools]);

  const layout = useMemo(() => {
    return () => {
      const newNodes: Node[] = [];

      let currentY = 0;

      CATEGORY_LANES.forEach((category) => {
        const laneTools = categorized[category] || [];

        // Build a dagre graph for this lane to keep node ordering stable
        const g = new dagre.graphlib.Graph();
        g.setGraph({ rankdir: 'LR', nodesep: GRAPH_NODE_SEP, ranksep: GRAPH_RANK_SEP });
        g.setDefaultEdgeLabel(() => ({}));

        laneTools
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((t) => {
            g.setNode(`tool-${t.id}`, { width: NODE_WIDTH, height: NODE_HEIGHT });
          });

        dagre.layout(g);

        // Determine lane height from laid out nodes
        let laneHeight = LANE_VERTICAL_PADDING * 2;
        const toolNodes: Node[] = [];

        laneTools.forEach((t) => {
          const n = g.node(`tool-${t.id}`);
          if (n) {
            const x = Math.round(n.x);
            const y = Math.round(n.y);
            laneHeight = Math.max(laneHeight, y + NODE_HEIGHT / 2 + LANE_VERTICAL_PADDING);

            const logoUrl = t.logoUrl && typeof t.logoUrl === 'string' ? t.logoUrl : undefined;

            toolNodes.push({
              id: `tool-${t.id}`,
              type: 'toolNode',
              position: { x: LANE_HORIZONTAL_PADDING + x, y: currentY + y - NODE_HEIGHT / 2 },
              data: {
                label: t.name,
                category,
                logoUrl,
              },
            });
          }
        });

        // Add lane background node spanning the width
        newNodes.push({
          id: `lane-${category}`,
          type: 'laneNode',
          position: { x: 0, y: currentY },
          data: { 
            label: laneSettings.labels?.[category] ?? category,
            width: CANVAS_WIDTH, 
            height: laneHeight,
            color: laneSettings.colors?.[category]
          },
          draggable: false,
          selectable: false,
        });

        newNodes.push(...toolNodes);

        currentY += Math.max(laneHeight, NODE_HEIGHT + LANE_VERTICAL_PADDING * 2);
      });

      setNodes(newNodes);

      // Build integrations edges asynchronously
      const nameToId = new Map<string, string>();
      tools.forEach((t) => nameToId.set(t.name, t.id));

      (async () => {
        try {
          const calls = tools.map((t) => (supabase as any).rpc('get_integrations', { a: t.name }));
          const results = await Promise.all(calls);

          const edgeMap = new Map<string, Edge>();

          results.forEach((res: any) => {
            if (res?.error || !res?.data) return;
            (res.data as Array<{ source: string; target: string; relation_type: string }>).forEach((row) => {
              let srcName = row.source;
              let tgtName = row.target;
              const rel = row.relation_type as string;

              // For syncs, treat as undirected and canonicalize to avoid duplicates
              if (rel === 'syncs') {
                const [aName, bName] = [srcName, tgtName].sort((a, b) => a.localeCompare(b));
                srcName = aName;
                tgtName = bName;
              }

              const srcId = nameToId.get(srcName);
              const tgtId = nameToId.get(tgtName);
              if (!srcId || !tgtId) return; // only draw when both tools exist

              const edgeId = rel === 'syncs' ? `${srcName}<->${tgtName}` : `${srcName}->${tgtName}`;
              if (edgeMap.has(edgeId)) return;

              edgeMap.set(edgeId, {
                id: edgeId,
                source: `tool-${srcId}`,
                target: `tool-${tgtId}`,
                label: rel,
                type: 'smoothstep',
              });
            });
          });

          setEdges(Array.from(edgeMap.values()));
        } catch (err) {
          console.error('[integrations] error building edges', err);
        }
      })();
    };
  }, [categorized, tools, laneSettings]);

  useEffect(() => {
    layout();
  }, [layout, tools, laneSettings]);

  const value: MapGraphContextType = {
    nodes,
    edges,
    recompute: () => layout(),
  };

  return <MapGraphContext.Provider value={value}>{children}</MapGraphContext.Provider>;
};
