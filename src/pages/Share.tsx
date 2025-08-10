import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapGraphProvider, useMapGraph } from '@/contexts/MapGraphContext';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ToolNode from '@/components/nodes/ToolNode';
import LaneNode from '@/components/nodes/LaneNode';
import { fetchShare } from '@/lib/share';
import { ToolsProvider } from '@/contexts/ToolsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

const FlowInner: React.FC<{ containerRef: React.RefObject<HTMLDivElement>; headerText: string }> = ({ containerRef, headerText }) => {
  const { nodes, edges } = useMapGraph();
  const nodeTypes = useMemo(() => ({ toolNode: ToolNode, laneNode: LaneNode }), []);

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

const SharePage: React.FC = () => {
  const { id } = useParams();
  const [payload, setPayload] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchShare(id!);
        if (active) setPayload(data);
      } catch (e) {
        console.error(e);
        if (active) setPayload(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
        <SEO title="Shared Tech Map | Tech Stack Mapper" description="View a shared tech map." path={`/share/${id}`} />
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-10 w-56 mb-6" />
          <Skeleton className="h-[70vh] w-full" />
        </div>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
        <SEO title="Share not found | Tech Stack Mapper" description="Shared map not found." path={`/share/${id}`} />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">This shared link is not available.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  const companyName = 'Your Company';
  const headerText = `Shared Tech Map — ${companyName} — ${new Date(payload.techMapMeta?.timestamp || Date.now()).toLocaleString()}`;

  const tools = (payload.tools || []).map((t: any, idx: number) => ({
    id: `${idx}-${t.name}`,
    name: t.name,
    category: t.category,
    description: t.description || '',
    logoUrl: t.logoUrl,
  }));

  return (
    <>
      <SEO title="Shared Tech Map | Tech Stack Mapper" description="View a shared tech map." path={`/share/${id}`} />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary" id="main-content">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-6" aria-labelledby="page-title">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <div className="flex items-center gap-2">
              <h1 id="page-title" className="text-3xl font-bold text-foreground">Shared Tech Map</h1>
              <Badge variant="secondary">Read-only</Badge>
            </div>
            <p className="text-sm text-muted-foreground">This map was shared for viewing only.</p>
          </header>

          <ToolsProvider initialTools={tools} readOnly>
            <MapGraphProvider>
              <FlowInner containerRef={mapRef} headerText={headerText} />
            </MapGraphProvider>
          </ToolsProvider>

          {payload.latestAnalysis && Array.isArray(payload.latestAnalysis) && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Items</div>
                  <div className="text-2xl font-semibold">{payload.latestAnalysis.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Replace / Evaluate</div>
                  <div className="text-2xl font-semibold">{payload.latestAnalysis.filter((x: any) => x.action === 'Replace' || x.action === 'Evaluate').length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Keep</div>
                  <div className="text-2xl font-semibold">{payload.latestAnalysis.filter((x: any) => x.action === 'Keep').length}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default SharePage;
