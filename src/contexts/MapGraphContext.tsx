import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import dagre from 'dagre';
import ELK from 'elkjs/lib/elk.bundled.js';
import { useTools } from '@/contexts/ToolsContext';
import { supabase } from '@/integrations/supabase/client';
import { getLayoutEngine } from '@/lib/config';

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

export const LANE_COLORS: Record<string, string> = {
  'Marketing': '#6E56CF',
  'Sales': '#0EA5E9',
  'Service': '#22C55E',
  'Comms': '#6366F1',
  'Dev/IT': '#F59E0B',
  'Analytics': '#A855F7',
  'Finance': '#F97316',
  'ERP': '#10B981',
  'HR': '#EF4444',
  'Data': '#14B8A6',
  'Project Management': '#8B5CF6',
  'Knowledge': '#64748B',
  'Development': '#F59E0B',
  'Security': '#64748B',
  'Ecommerce': '#0EA5E9',
  'Ops/NoCode': '#94A3B8',
  'Other': '#94A3B8',
};

const VENDOR_GROUPS: Record<string, string[]> = {
  Microsoft: ['Microsoft 365','Azure','Power BI','Power Apps','Power Automate','Intune','Entra','SharePoint','OneDrive','Dynamics'],
  Google: ['Google Workspace','Google Analytics','Google Ads','BigQuery','Looker','GCP','Google Cloud'],
  Atlassian: ['Jira','Confluence','Trello','Bitbucket','Statuspage','Opsgenie'],
  AWS: ['AWS','Redshift','CloudWatch','ECS','EKS'],
  Salesforce: ['Salesforce','Pardot','Tableau','MuleSoft'],
  HubSpot: ['HubSpot','HubSpot CRM','CMS Hub','Service Hub','Marketing Hub','Sales Hub'],
  Zendesk: ['Zendesk','Zendesk Sell'],
  ServiceNow: ['ServiceNow'],
  Adobe: ['Adobe Analytics','Adobe Marketo','Adobe Creative Cloud'],
  Oracle: ['Oracle','Eloqua'],
  SAP: ['SAP'],
  Stripe: ['Stripe'],
  Twilio: ['Twilio','Segment'],
  Snowflake: ['Snowflake'],
  MongoDB: ['MongoDB'],
  Datadog: ['Datadog'],
  Cloudflare: ['Cloudflare'],
  Shopify: ['Shopify'],
};

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
const GRAPH_NODE_SEP = 60;
const GRAPH_RANK_SEP = 80;
const LANE_VERTICAL_PADDING = 32;
const LANE_HORIZONTAL_PADDING = 24;
const CANVAS_WIDTH = 1800; // wide enough background for most stacks

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
    const elk = new ELK();

    const sortByVendors = (list: typeof tools) => {
      const buckets: Record<string, typeof tools> = {};
      const vendorOrder = Object.keys(VENDOR_GROUPS);
      vendorOrder.forEach(v => (buckets[v] = []));
      const ungrouped: typeof tools = [];
      for (const t of list) {
        const name = t.name;
        const matchVendor = vendorOrder.find(v => VENDOR_GROUPS[v].some(n => name.toLowerCase().includes(n.toLowerCase())));
        if (matchVendor) buckets[matchVendor].push(t); else ungrouped.push(t);
      }
      const ordered: typeof tools = [];
      vendorOrder.forEach(v => ordered.push(...buckets[v].sort((a,b)=>a.name.localeCompare(b.name))));
      ordered.push(...ungrouped.sort((a,b)=>a.name.localeCompare(b.name)));
      return ordered;
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
        pos[id] = { x: Math.round(c.x || 0), y: Math.round(c.y || 0) };
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
      let currentY = 0;

      const ghostList = buildGhostSuggestions(categorized);

      const idToCategory = new Map<string, string>();
      tools.forEach((t) => idToCategory.set(t.id, (t.confirmedCategory || t.category || 'Other') as string));

      for (const category of CATEGORY_LANES) {
        const laneToolsRaw = categorized[category] || [];
        const laneTools = sortByVendors(laneToolsRaw);
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
                  data: { label: t.name, category, logoUrl, colorHex },
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
                  data: { label: t.name, category, logoUrl, colorHex },
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
                    const newId = typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
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
    void (async () => { await layout(); })();
  }, [layout, tools, laneSettings]);

  const value: MapGraphContextType = {
    nodes,
    edges,
    recompute: () => { void layout(); },
  };

  return <MapGraphContext.Provider value={value}>{children}</MapGraphContext.Provider>;
};
