import React, { useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { useTools } from '@/contexts/ToolsContext';
import { useAuth } from '@/contexts/AuthContext';
import { MapGraphProvider, useMapGraph, CATEGORY_LANES, LANE_COLORS } from '@/contexts/MapGraphContext';
import { ReactFlow, Background, Controls, MiniMap, Panel, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ToolNode from '@/components/nodes/ToolNode';
import LaneNode from '@/components/nodes/LaneNode';
import GhostNode from '@/components/nodes/GhostNode';
import LabeledEdge from '@/components/edges/LabeledEdge';
import AssistantPanel from '@/components/AssistantPanel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { exportMapPNG, exportMapPDF } from '@/lib/export';
import { createShare } from '@/lib/share';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DEBUG } from '@/lib/config';
const FlowInner: React.FC<{ containerRef: React.RefObject<HTMLDivElement>; headerText: string }> = ({ containerRef, headerText }) => {
  const { nodes, edges } = useMapGraph();
  const savedViewport = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('techmap_viewport') || 'null'); } catch { return null; }
  }, []);
  // Memoize node & edge types
  const nodeTypes = useMemo(() => {
    if (DEBUG) console.debug('[TechMap] Creating nodeTypes');
    return { toolNode: ToolNode, laneNode: LaneNode, ghostNode: GhostNode } as any;
  }, []);
  const edgeTypes = useMemo(() => ({ labeledEdge: LabeledEdge as any }), []);

  return (
    <Card className="h-[80vh]">
      <CardContent className="p-0 h-full">
        <div ref={containerRef} className="relative h-full">
          <div className="absolute top-2 left-2 z-10 text-xs text-muted-foreground bg-card/70 rounded px-2 py-1">
            {headerText}
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView={!savedViewport}
            defaultViewport={savedViewport || undefined}
            proOptions={{ hideAttribution: true }}
            style={{ backgroundColor: 'hsl(var(--background))' }}
            onMoveEnd={(_, viewport) => {
              try { localStorage.setItem('techmap_viewport', JSON.stringify(viewport)); } catch {}
            }}
          >
            <MiniMap zoomable pannable style={{ backgroundColor: 'hsl(var(--card))' }} />
            <Controls />
            <Panel position="top-right">
              <div className="text-xs text-muted-foreground bg-card/80 backdrop-blur rounded-md border px-3 py-2 space-y-1">
                <div className="font-semibold">Legend</div>
                <ul className="list-disc pl-4">
                  <li>Marketing → Sales: Leads</li>
                  <li>Service ↔ Comms: Tickets/Notifications</li>
                  <li>Data → Analytics: Models/Reports</li>
                  <li>ERP ↔ Finance: Orders/Invoices</li>
                  <li>Labels visible at zoom ≥ 0.5</li>
                </ul>
              </div>
            </Panel>
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};

const TechMapPage: React.FC = () => {
  const { tools } = useTools();
  const total = tools.length;
  const categoriesUsed = new Set(tools.map(t => (t.confirmedCategory || t.category))).size;
  const mapRef = useRef<HTMLDivElement>(null);
  const companyName = 'Your Company';
  const headerText = `Tech Map — ${companyName} — ${new Date().toLocaleString()}`;

  const handleExportPNG = useCallback(async () => {
    if (!mapRef.current) return;
    if (DEBUG) console.debug('[TechMap] Exporting PNG');
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      await exportMapPNG(mapRef.current, `BizTechMap_TechMap_${dateStr}.png`);
      if (DEBUG) console.debug('[TechMap] PNG export successful');
    } catch (e) {
      console.error('[TechMap] PNG export failed:', e);
      toast.error('Failed to export PNG. See console for details.');
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (!mapRef.current) return;
    if (DEBUG) console.debug('[TechMap] Exporting PDF');
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      await exportMapPDF(mapRef.current, `BizTechMap_TechMap_${dateStr}.pdf`, companyName);
      if (DEBUG) console.debug('[TechMap] PDF export successful');
    } catch (e) {
      console.error('[TechMap] PDF export failed:', e);
      toast.error('Failed to export PDF. See console for details.');
    }
  }, []);

  const { user, requireSignIn } = useAuth();

  const createShareAndCopy = useCallback(async () => {
    if (DEBUG) console.debug('[TechMap] Creating share link');
    const payload = {
      tools: tools.map(t => ({ name: t.name, category: t.confirmedCategory || t.category, logoUrl: t.logoUrl })),
      techMapMeta: { timestamp: Date.now() },
    };
    const { id } = await createShare(payload);
    const url = `${window.location.origin}/share/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
    }
    if (DEBUG) console.debug('[TechMap] Share link created:', id);
    toast.success('Share link copied to clipboard');
  }, [tools]);

  const handleCreateShare = useCallback(async () => {
    if (!user) {
      requireSignIn(() => { void createShareAndCopy(); });
      return;
    }
    try {
      await createShareAndCopy();
    } catch (e) {
      console.error('[TechMap] Share creation failed:', e);
      toast.error('Failed to create share link. Please try again.');
    }
  }, [user, requireSignIn, createShareAndCopy]);

  return (
    <>
      <SEO
        title="Tech Map | Tech Stack Mapper"
        description="Visualize your tools across categories in a swimlane tech map."
        path="/tech-map"
      />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary" id="main-content">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-6" aria-labelledby="page-title">
            <Link to="/add-tools" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Add Tools
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 id="page-title" className="text-3xl font-bold text-foreground">Tech Map</h1>
                <p className="text-sm text-muted-foreground">{total} tools across {categoriesUsed} lanes</p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                <div className="hidden sm:flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  <span className="text-xs">Lanes: {CATEGORY_LANES.length}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" aria-label="Export options">Export Map</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" aria-label="Export menu">
                    <DropdownMenuItem onClick={handleExportPNG} aria-label="Download PNG of Tech Map">Download PNG</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF} aria-label="Download PDF of Tech Map">Download PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={handleCreateShare} aria-label="Create share link">Create Share Link</Button>
                <Link to="/settings"><Button variant="ghost" size="sm">Settings</Button></Link>
              </div>
            </div>
          </header>

          <ErrorBoundary onError={(error) => console.error('[TechMap] Map error:', error)}>
            <MapGraphProvider>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <FlowInner containerRef={mapRef} headerText={headerText} />
                </div>
                <ErrorBoundary onError={(error) => console.error('[TechMap] Assistant error:', error)}>
                  <AssistantPanel />
                </ErrorBoundary>
              </div>
            </MapGraphProvider>
          </ErrorBoundary>

          <div className="mt-4 flex justify-center">
            <Link to="/consolidation">
              <Button variant="secondary">Next: Consolidation Ideas</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default TechMapPage;
