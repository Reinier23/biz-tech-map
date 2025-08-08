import React, { useMemo } from 'react';
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

const FlowInner: React.FC = () => {
  const { nodes, edges } = useMapGraph();
  const nodeTypes = useMemo(() => ({ toolNode: ToolNode, laneNode: LaneNode }), []);

  return (
    <Card className="h-[80vh]">
      <CardContent className="p-0 h-full">
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
      </CardContent>
    </Card>
  );
};

const TechMapPage: React.FC = () => {
  const { tools } = useTools();
  const total = tools.length;
  const categoriesUsed = new Set(tools.map(t => (t.confirmedCategory || t.category))).size;

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
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <Map className="w-4 h-4" />
                <span className="text-xs">Lanes: {CATEGORY_LANES.length}</span>
              </div>
            </div>
          </header>

          <MapGraphProvider>
            <FlowInner />
          </MapGraphProvider>

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
