import React, { createContext, useContext, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Node, Edge, Connection, addEdge, useNodesState, useEdgesState, ReactFlowInstance } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import dagre from 'dagre';

import { useTools, type Tool } from '@/contexts/ToolsContext';
import { supabase } from '@/integrations/supabase/client';
import { getLayoutEngine } from '@/lib/config';

// Architecture layers (swimlanes) in fixed order
export const ARCH_LAYERS: string[] = [
  'Data Sources / Capture',
  'Integration / iPaaS',
  'Data / Warehouse',
  'BI / Analytics',
  'Engagement (Mktg/Sales/Service)',
  'Operations / Backoffice',
  'Identity / Security',
  'Dev / IT',
];

// Backward-compat export to avoid breaking imports
export const CATEGORY_LANES = ARCH_LAYERS;

export const LANE_COLORS: Record<string, string> = {
  'Data Sources / Capture': '#60A5FA',
  'Integration / iPaaS': '#34D399',
  'Data / Warehouse': '#A78BFA',
  'BI / Analytics': '#F59E0B',
  'Engagement (Mktg/Sales/Service)': '#F472B6',
  'Operations / Backoffice': '#F97316',
  'Identity / Security': '#94A3B8',
  'Dev / IT': '#10B981',
  'Other': '#94A3B8',
};

export const ALL_LANES: string[] = [...ARCH_LAYERS, 'Other'];

const VENDOR_GROUPS: Record<string, string[]> = {
  Microsoft: ['Microsoft 365','Azure','Power BI','Power Apps','Power Automate','Intune','Entra','SharePoint','OneDrive','Dynamics','Outlook'],
  Google: ['Google Workspace','Google Analytics','Google Ads','BigQuery','Looker','GCP','Google Cloud'],
  Atlassian: ['Jira','Confluence','Trello','Bitbucket','Statuspage','Opsgenie'],
  AWS: ['AWS','Redshift','CloudWatch','ECS','EKS','S3'],
  Salesforce: ['Salesforce','Pardot','Tableau','MuleSoft','Slack'],
  HubSpot: ['HubSpot','HubSpot CRM','CMS Hub','Service Hub','Marketing Hub','Sales Hub'],
  Zendesk: ['Zendesk','Zendesk Sell'],
  ServiceNow: ['ServiceNow'],
  Adobe: ['Adobe','Marketo','Adobe Analytics','Adobe Creative Cloud','Workfront'],
  Oracle: ['Oracle','Eloqua'],
  SAP: ['SAP','SuccessFactors','Ariba'],
  Stripe: ['Stripe'],
  Twilio: ['Twilio','Segment'],
  Snowflake: ['Snowflake'],
  MongoDB: ['MongoDB'],
  Datadog: ['Datadog'],
  Cloudflare: ['Cloudflare'],
  Shopify: ['Shopify'],
  Okta: ['Okta'],
};

const VENDOR_ORDER: string[] = [
  'Microsoft','Google','Atlassian','AWS','Salesforce','HubSpot','Zendesk','ServiceNow','Adobe','Oracle','SAP','Stripe','Twilio','Snowflake','MongoDB','Datadog','Cloudflare','Shopify','Okta'
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

interface Props { children: React.ReactNode }

type LaneSettings = { labels?: Record<string, string>; colors?: Record<string, string> };

const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;
const GRAPH_NODE_SEP = 60;
const GRAPH_RANK_SEP = 80;
const LANE_VERTICAL_PADDING = 32;
const LANE_HORIZONTAL_PADDING = 24;
const CANVAS_WIDTH = 1800; // wide enough background for most stacks

interface ToolWithMetadata extends Tool {
  vendor?: string;
  arch_layer?: string;
  domain?: string;
  confidence?: number;
}

export const MapGraphProvider: React.FC<Props> = ({ children }) => {
  const { tools, addTool } = useTools();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [laneSettings, setLaneSettings] = useState<LaneSettings>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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
    ALL_LANES.forEach((l) => (buckets[l] = []));
    for (const t of tools) {
      const lane = (t as ToolWithMetadata).arch_layer || 'Other';
      const key = ALL_LANES.includes(lane) ? lane : 'Other';
      buckets[key] = buckets[key] || [];
      buckets[key].push(t);
    }
    return buckets;
  }, [tools]);

  const toolsChangedKey = useMemo(() =>
    JSON.stringify(
      tools.map((t) => [t.id, t.name, (t as ToolWithMetadata).vendor || '', (t as ToolWithMetadata).arch_layer || '']).sort()
    )
  , [tools]);

  const toolsForAnalysis = useMemo(() => {
    return tools.map((t) => {
      const tool = t as ToolWithMetadata;
      const lane = tool.arch_layer || 'Other';
      return { ...tool, category: lane };
    });
  }, [tools]);

  const toolsForExport = useMemo(() => {
    return tools.map((t) => {
      const tool = t as ToolWithMetadata;
      return [t.id, t.name, tool.vendor || '', tool.arch_layer || ''];
    }).sort();
  }, [tools]);

  const sortedTools = useMemo(() => {
    return [...tools].sort((a, b) => {
      const toolA = a as ToolWithMetadata;
      const toolB = b as ToolWithMetadata;
      const va = toolA.vendor || inferVendorFromName(a.name) || '';
      const vb = toolB.vendor || inferVendorFromName(b.name) || '';
      return va.localeCompare(vb) || a.name.localeCompare(b.name);
    });
  }, [tools]);

  const layout = useMemo(() => {
    

    const sortByVendors = (list: typeof tools) => {
      const inferVendorFromName = (name: string): string | undefined => {
        const low = name.toLowerCase();
        return Object.keys(VENDOR_GROUPS).find((v) => VENDOR_GROUPS[v].some((n) => low.includes(n.toLowerCase())));
      };
      const vendorIdx = (v?: string | null) => {
        if (!v) return Number.POSITIVE_INFINITY;
        const i = VENDOR_ORDER.indexOf(v);
        return i === -1 ? Number.POSITIVE_INFINITY : i;
      };
      return [...list].sort((a, b) => {
        const va = (a as ToolWithMetadata).vendor || inferVendorFromName(a.name) || '';
        const vb = (b as ToolWithMetadata).vendor || inferVendorFromName(b.name) || '';
        const ia = vendorIdx(va);
        const ib = vendorIdx(vb);
        if (ia !== ib) return ia - ib;
        return a.name.localeCompare(b.name);
      });
    };

    const knownPairLabel = (aCat: string, bCat: string, rel?: string) => {
      if (rel) return rel;
      if (aCat === 'Marketing' && bCat === 'Sales') return 'Leads';
      if (aCat === 'Sales' && bCat === 'Marketing') return 'Leads';
      if ((aCat === 'Service' && bCat === 'Comms') || (aCat === 'Comms' && bCat === 'Service')) return 'Tickets/Notifications';
      if (aCat === 'Data' && bCat === 'Analytics') return 'Models/Reports';
      if (aCat === 'Analytics' && bCat === 'Data') return 'Models/Reports';
      if ((aCat === 'ERP' && bCat === 'Finance') || (aCat === 'Finance' && bCat === 'ERP')) return 'Orders/Invoices';
      return undefined;
    };

    const computeLaneWithDagre = (laneTools: typeof tools) => {
      const g = new dagre.graphlib.Graph();
      g.setGraph({ rankdir: 'LR', nodesep: GRAPH_NODE_SEP, ranksep: GRAPH_RANK_SEP });
      g.setDefaultEdgeLabel(() => ({}));
      laneTools.forEach((t) => g.setNode(`tool-${t.id}`, { width: NODE_WIDTH, height: NODE_HEIGHT }));
      dagre.layout(g);
      const pos: Record<string, { x: number; y: number }> = {};
      laneTools.forEach((t) => {
        const n = g.node(`tool-${t.id}`);
        if (n) pos[t.id] = { x: Math.round(n.x), y: Math.round(n.y) };
      });
      return pos;
    };

    const computeLaneWithElk = async (laneTools: typeof tools) => {
      const { default: ELK } = await import('elkjs/lib/elk.bundled.js');
      const elk = new ELK();
      const elkGraph: any = {
        id: 'root',
        layoutOptions: {
          algorithm: 'layered',
          inDirection: 'WEST',
          outDirection: 'EAST',
          'spacing.nodeNode': '80',
          'spacing.edgeNode': '40',
          'elk.layered.spacing.nodeNodeBetweenLayers': '80',
        },
        children: laneTools.map((t) => ({ id: `tool-${t.id}`, width: NODE_WIDTH, height: NODE_HEIGHT })),
        edges: [],
      };
      const res = await elk.layout(elkGraph);
      const pos: Record<string, { x: number; y: number }> = {};
      (res.children || []).forEach((c: any) => {
        const id = String(c.id).replace('tool-', '');
        pos[id] = { x: Math.round((c.x || 0)), y: Math.round((c.y || 0)) };
      });
      return pos;
    };

    const buildGhostSuggestions = (buckets: Record<string, typeof tools>) => {
      const suggestions: Array<{ lane: string; label: string; hint: string; name: string; category: string; query: string }> = [];
      const totalTools = Object.values(buckets).reduce((acc, arr) => acc + arr.length, 0);
      const lanesWithTools = Object.entries(buckets).filter(([_, arr]) => arr.length > 0).map(([k]) => k);
      const has = (lane: string) => (buckets[lane] || []).length > 0;
      const hasName = (names: string[]) => {
        const lower = names.map(n => n.toLowerCase());
        return Object.values(buckets).some(arr => arr.some(t => lower.some(n => t.name.toLowerCase().includes(n))));
      };

      // CDP
      if (has('Marketing') && !hasName(['Segment']) && !has('Data')) {
        suggestions.push({ lane: 'Data', label: 'Add your CDP', hint: 'Segment (CDP) helps unify customer events', name: 'Segment', category: 'Data', query: 'Segment' });
      }
      // SSO/IdP
      if (totalTools >= 3 && lanesWithTools.length >= 2 && !has('Security')) {
        suggestions.push({ lane: 'Security', label: 'Add SSO / IdP', hint: 'Protect access with Okta or Entra', name: 'Okta', category: 'Security', query: 'Okta' });
      }
      // Warehouse
      if (hasName(['Tableau','Power BI','Looker']) && !hasName(['Snowflake','BigQuery','Redshift'])) {
        suggestions.push({ lane: 'Data', label: 'Add a Data Warehouse', hint: 'Snowflake or BigQuery for central analytics', name: 'Snowflake', category: 'Data', query: 'Snowflake' });
      }
      // iPaaS
      if (totalTools >= 5 && lanesWithTools.length >= 3 && !hasName(['Zapier','Make','Workato'])) {
        suggestions.push({ lane: 'Ops/NoCode', label: 'Add iPaaS', hint: 'Automate workflows via Zapier/Make/Workato', name: 'Zapier', category: 'Ops/NoCode', query: 'Zapier' });
      }
      // Helpdesk
      if (has('Comms') && !has('Service')) {
        suggestions.push({ lane: 'Service', label: 'Add Helpdesk', hint: 'Zendesk or Freshdesk for support tickets', name: 'Zendesk', category: 'Service', query: 'Zendesk' });
      }
      // PM
      if (has('Dev/IT') && !has('Project Management')) {
        suggestions.push({ lane: 'Project Management', label: 'Add Project Management', hint: 'Try Jira or Asana to track work', name: 'Jira', category: 'Project Management', query: 'Jira' });
      }
      // Monitoring
      if (hasName(['AWS','Azure','GCP','Google Cloud']) && !hasName(['Datadog'])) {
        suggestions.push({ lane: 'Dev/IT', label: 'Add Monitoring', hint: 'Datadog for infra and app monitoring', name: 'Datadog', category: 'Dev/IT', query: 'Datadog' });
      }
      // MDM
      if (hasName(['Microsoft 365']) && !hasName(['Intune','Jamf'])) {
        suggestions.push({ lane: 'Security', label: 'Add Device Management', hint: 'Intune or Jamf for endpoint security', name: 'Intune', category: 'Security', query: 'Intune' });
      }

      return suggestions.slice(0, 3);
    };

    return async () => {
      const newNodes: Node[] = [];
      const laneFirstToolId: Record<string, string> = {};
      let currentY = 0;

      const engine = getLayoutEngine();
      console.info(`[TechMap] Active layout engine: ${engine}`);

      const ghostList = buildGhostSuggestions(categorized);

      const idToCategory = new Map<string, string>();
      tools.forEach((t) => idToCategory.set(t.id, (t.confirmedCategory || t.category || 'Other') as string));

      for (const category of ALL_LANES) {
        const laneToolsRaw = categorized[category] || [];
        const laneTools = sortByVendors(laneToolsRaw);
        if (laneTools.length > 0) { laneFirstToolId[category] = laneTools[0].id; }
        const colorHex = laneSettings.colors?.[category] ?? LANE_COLORS[category] ?? '#94A3B8';
        const isCollapsed = !!collapsed[category];

        let laneHeight = LANE_VERTICAL_PADDING * 2;
        const toolNodes: Node[] = [];

        const engine = getLayoutEngine();

        if (!isCollapsed) {
          if (laneTools.length > 0) {
            const positions = engine === 'elk' ? await computeLaneWithElk(laneTools) : computeLaneWithDagre(laneTools);
            laneTools.forEach((t) => {
              const p = positions[t.id];
              if (!p) return;
              if (engine === 'elk') {
                const x = p.x;
                const y = p.y;
                laneHeight = Math.max(laneHeight, y + NODE_HEIGHT + LANE_VERTICAL_PADDING);
                const logoUrl = t.logoUrl && typeof t.logoUrl === 'string' ? t.logoUrl : undefined;
                toolNodes.push({
                  id: `tool-${t.id}`,
                  type: 'toolNode',
                  position: { x: LANE_HORIZONTAL_PADDING + x, y: currentY + y },
                  data: { label: t.name, lane: category, vendor: (t as ToolWithMetadata).vendor, domain: (t as ToolWithMetadata).domain, archLayer: (t as ToolWithMetadata).arch_layer || category, confidence: (t as ToolWithMetadata).confidence, logoUrl, colorHex },
                });
              } else {
                const x = p.x;
                const y = p.y;
                laneHeight = Math.max(laneHeight, y + NODE_HEIGHT / 2 + LANE_VERTICAL_PADDING);
                const logoUrl = t.logoUrl && typeof t.logoUrl === 'string' ? t.logoUrl : undefined;
                toolNodes.push({
                  id: `tool-${t.id}`,
                  type: 'toolNode',
                  position: { x: LANE_HORIZONTAL_PADDING + x, y: currentY + y - NODE_HEIGHT / 2 },
                  data: { label: t.name, lane: category, vendor: (t as ToolWithMetadata).vendor, domain: (t as ToolWithMetadata).domain, archLayer: (t as ToolWithMetadata).arch_layer || category, confidence: (t as ToolWithMetadata).confidence, logoUrl, colorHex },
                });
              }
            });
          } else {
            // Lane empty: place a ghost if available for this lane
            const ghost = ghostList.find((g) => g.lane === category);
            if (ghost) {
              toolNodes.push({
                id: `ghost-${category}`,
                type: 'ghostNode',
                position: { x: LANE_HORIZONTAL_PADDING + 16, y: currentY + LANE_VERTICAL_PADDING },
                data: {
                  label: ghost.label,
                  hint: ghost.hint,
                  query: ghost.query,
                  suggestedName: ghost.name,
                  suggestedCategory: ghost.category,
                  onAdd: (name: string, cat?: string) => {
                    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
                    addTool({ id: newId, name, category: cat || category, description: 'Added via suggestion' });
                  },
                },
              });
              laneHeight = Math.max(laneHeight, NODE_HEIGHT + LANE_VERTICAL_PADDING * 2);
            }
          }
        }

        const headerOnlyHeight = 56;
        const computedLaneHeight = isCollapsed ? headerOnlyHeight : Math.max(laneHeight, NODE_HEIGHT + LANE_VERTICAL_PADDING * 2);

        newNodes.push({
          id: `lane-${category}`,
          type: 'laneNode',
          position: { x: 0, y: currentY },
          data: {
            label: laneSettings.labels?.[category] ?? category,
            width: CANVAS_WIDTH,
            height: computedLaneHeight,
            colorHex,
            count: laneToolsRaw.length,
            collapsed: isCollapsed,
            onToggle: () => setCollapsed((c) => ({ ...c, [category]: !c[category] })),
          },
          draggable: false,
          selectable: false,
        });

        newNodes.push(...toolNodes);

        currentY += computedLaneHeight;
      }

      setNodes(newNodes);

      // Precompute lane-level relationship edges between representative tools
      const laneEdges: Edge[] = [];
      const addLaneEdge = (srcLane: string, tgtLane: string) => {
        const srcToolId = laneFirstToolId[srcLane];
        const tgtToolId = laneFirstToolId[tgtLane];
        if (!srcToolId || !tgtToolId) return;
        const id = `lane-${srcLane}->${tgtLane}`;
        laneEdges.push({
          id,
          source: `tool-${srcToolId}`,
          target: `tool-${tgtToolId}`,
          label: knownPairLabel(srcLane, tgtLane),
          type: 'labeledEdge',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#CBD5E1', strokeWidth: 2 },
        });
      };
      // Known pairs
      addLaneEdge('Marketing','Sales');
      addLaneEdge('Service','Comms');
      addLaneEdge('Comms','Service');
      addLaneEdge('Data','Analytics');
      addLaneEdge('ERP','Finance');
      addLaneEdge('Finance','ERP');

      // Build integrations edges asynchronously
      const nameToId = new Map<string, string>();
      tools.forEach((t) => nameToId.set(t.name, t.id));

      (async () => {
        try {
          const calls = tools.map((t) => supabase.rpc('get_integrations', { a: t.name }));
          const results = await Promise.all(calls);

          const edgeMap = new Map<string, Edge>();
          laneEdges.forEach((e) => { if (!edgeMap.has(e.id)) edgeMap.set(e.id, e); });

          results.forEach((res: { data: unknown; error: unknown }) => {
            if (res?.error || !res?.data) return;
            (res.data as Array<{ source: string; target: string; relation_type: string }> ).forEach((row) => {
              let srcName = row.source;
              let tgtName = row.target;
              const rel = row.relation_type as string | undefined;

              if (rel === 'syncs') {
                const [aName, bName] = [srcName, tgtName].sort((a, b) => a.localeCompare(b));
                srcName = aName; tgtName = bName;
              }

              const srcId = nameToId.get(srcName);
              const tgtId = nameToId.get(tgtName);
              if (!srcId || !tgtId) return;

              const edgeId = rel === 'syncs' ? `${srcName}<->${tgtName}` : `${srcName}->${tgtName}`;
              if (edgeMap.has(edgeId)) return;

              const aCat = idToCategory.get(srcId) || 'Other';
              const bCat = idToCategory.get(tgtId) || 'Other';
              const label = knownPairLabel(aCat, bCat, rel);

              edgeMap.set(edgeId, {
                id: edgeId,
                source: `tool-${srcId}`,
                target: `tool-${tgtId}`,
                label,
                type: 'labeledEdge',
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: '#CBD5E1', strokeWidth: 2 },
              });
            });
          });

          setEdges(Array.from(edgeMap.values()));
        } catch (err) {
          console.error('[integrations] error building edges', err);
        }
      })();
    };
  }, [categorized, tools, laneSettings, collapsed]);

  useEffect(() => {
    let raf: number | null = null;
    const id = window.setTimeout(() => {
      raf = requestAnimationFrame(() => { void layout(); });
    }, 50);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(id);
    };
  }, [layout, toolsChangedKey, laneSettings, collapsed]);

  const value: MapGraphContextType = {
    nodes,
    edges,
    recompute: () => { void layout(); },
  };

  return <MapGraphContext.Provider value={value}>{children}</MapGraphContext.Provider>;
};

// Helper function to infer vendor from tool name
function inferVendorFromName(name: string): string | null {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('google')) return 'Google';
  if (lowerName.includes('microsoft') || lowerName.includes('office')) return 'Microsoft';
  if (lowerName.includes('salesforce')) return 'Salesforce';
  if (lowerName.includes('adobe')) return 'Adobe';
  if (lowerName.includes('oracle')) return 'Oracle';
  if (lowerName.includes('sap')) return 'SAP';
  if (lowerName.includes('ibm')) return 'IBM';
  if (lowerName.includes('amazon') || lowerName.includes('aws')) return 'Amazon';
  return null;
}
