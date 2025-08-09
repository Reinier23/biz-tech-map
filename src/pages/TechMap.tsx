import React, { useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { useTools } from '@/contexts/ToolsContext';
import { MapGraphProvider, useMapGraph, CATEGORY_LANES } from '@/contexts/MapGraphContext';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ToolNode from '@/components/nodes/ToolNode';
import LaneNode from '@/components/nodes/LaneNode';
import ChatCoach from '@/components/ChatCoach';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { exportMapPNG, exportMapPDF } from '@/lib/export';
import { createShare } from '@/lib/share';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DEBUG } from '@/lib/config';
const FlowInner: React.FC<{ containerRef: React.RefObject<HTMLDivElement>; headerText: string }> = ({ containerRef, headerText }) => {
  const { nodes, edges } = useMapGraph();
  // Memoize nodeTypes to prevent recreation on every render
  const nodeTypes = useMemo(() => {
    if (DEBUG) console.debug('[TechMap] Creating nodeTypes');
    return { toolNode: ToolNode, laneNode: LaneNode };
  }, []);

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
            fitView
            proOptions={{ hideAttribution: true }}
            style={{ backgroundColor: 'hsl(var(--background))' }}
          >
            <MiniMap zoomable pannable style={{ backgroundColor: 'hsl(var(--card))' }} />
            <Controls />
            <Background />
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
      await exportMapPNG(mapRef.current, 'Tech-Map.png');
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
      await exportMapPDF(mapRef.current, 'Tech-Map.pdf', companyName);
      if (DEBUG) console.debug('[TechMap] PDF export successful');
    } catch (e) {
      console.error('[TechMap] PDF export failed:', e);
      toast.error('Failed to export PDF. See console for details.');
    }
  }, []);

  const handleCreateShare = useCallback(async () => {
    if (DEBUG) console.debug('[TechMap] Creating share link');
    try {
      const payload = {
        tools: tools.map(t => ({ name: t.name, category: t.confirmedCategory || t.category, logoUrl: t.logoUrl })),
        techMapMeta: { timestamp: Date.now() },
      };
      const { id } = await createShare(payload);
      const url = `${window.location.origin}/share/${id}`;
      await navigator.clipboard.writeText(url);
      if (DEBUG) console.debug('[TechMap] Share link created:', id);
      toast.success('Share link copied');
    } catch (e) {
      console.error('[TechMap] Share creation failed:', e);
      toast.error('Failed to create share link');
    }
  }, [tools]);

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
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="hidden sm:flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  <span className="text-xs">Lanes: {CATEGORY_LANES.length}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">Export Map</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportPNG}>Download PNG</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}>Download PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={handleCreateShare}>Create Share Link</Button>
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
                <ErrorBoundary onError={(error) => console.error('[TechMap] ChatCoach error:', error)}>
                  <ChatCoach />
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
