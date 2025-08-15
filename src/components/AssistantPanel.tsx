import React, { useMemo, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useTools } from '@/contexts/ToolsContext';
import { useMapGraph, CATEGORY_LANES, LANE_COLORS } from '@/contexts/MapGraphContext';
import { getSuggestions, Suggestion } from '@/lib/mapRules';
import { toast } from 'sonner';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const srOnly = 'sr-only';

export const AssistantPanel: React.FC = () => {
  const { tools, addTool, removeTool } = useTools();
  const { recompute } = useMapGraph();
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [liveMsg, setLiveMsg] = useState<string>('');
  const lastAddedRef = useRef<{ id: string; name: string } | null>(null);

  const suggestions: Suggestion[] = useMemo(() => {
    const all = getSuggestions(tools);
    return all.filter((s) => !dismissed.has(s.id)).slice(0, 3);
  }, [tools, dismissed]);

  const onDismiss = (id: string) => setDismissed((prev) => new Set([...Array.from(prev), id]));

  const onAddTool = (name: string, category: string) => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    addTool({ id: newId, name, category, description: 'Added via Assistant' });
    lastAddedRef.current = { id: newId, name };
    setLiveMsg(`${name} added to ${category}`);
    recompute();
    toast.success(`Added ${name} to ${category}`, {
      action: {
        label: 'Undo',
        onClick: () => {
          if (lastAddedRef.current) {
            removeTool(lastAddedRef.current.id);
            setLiveMsg(`${lastAddedRef.current.name} removed`);
            lastAddedRef.current = null;
            recompute();
          }
        },
      },
    });
  };

  return (
    <aside className="relative h-full" aria-label="Assistant panel">
      <div className="absolute -left-3 top-4 z-10">
        <Button size="icon" variant="secondary" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Collapse assistant panel' : 'Expand assistant panel'}>
          {open ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <div className={`rounded-md border bg-card h-full overflow-hidden transition-[width] ${open ? 'w-full' : 'w-0'} `}>
        {open && (
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Assistant</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Collapse panel">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Tabs defaultValue="assistant" className="flex-1 flex flex-col">
              <div className="px-4 pt-3">
                <TabsList>
                  <TabsTrigger value="assistant">Assistant</TabsTrigger>
                  <TabsTrigger value="layers">Layers</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="assistant" className="flex-1 overflow-auto px-4 pb-4">
                {suggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-4">No suggestions right now. Keep adding tools!</p>
                ) : (
                  <ul className="space-y-4 mt-3">
                    {suggestions.map((s) => (
                      <li key={s.id} className="rounded-md border bg-background p-3">
                        <div className="text-sm text-foreground mb-2">{s.prompt}</div>
                        <div className="flex flex-wrap gap-2">
                          {s.actions.map((a) => (
                            <Button
                              key={a.label}
                              size="sm"
                              variant="secondary"
                              onClick={() => onAddTool(a.name, a.category)}
                              aria-label={`Add ${a.name} to ${a.category}`}
                            >
                              {a.label}
                            </Button>
                          ))}
                          <Button size="sm" variant="outline" onClick={() => onDismiss(s.id)} aria-label="Dismiss suggestion">
                            Skip
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="layers" className="flex-1 overflow-auto px-4 pb-4">
                <div className="text-sm text-muted-foreground mt-3">Lane overview</div>
                <ul className="mt-2 space-y-2">
                  {CATEGORY_LANES.map((lane) => (
                    <li key={lane} className="flex items-center gap-2 text-sm">
                      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LANE_COLORS[lane] || '#94A3B8' }} aria-hidden />
                      <span>{lane}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  {/* Handoff CTA */}
                  {tools.length >= 10 && new Set(tools.map(t => (t.confirmedCategory || t.category))).size >= 5 && (
                    <Button 
                      className="mt-2" 
                      aria-label="Run consolidation analysis"
                      onClick={() => window.location.href = '/consolidation'}
                    >
                      <span>Run Consolidation Analysis</span>
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <div aria-live="polite" role="status" className={srOnly}>
        {liveMsg}
      </div>
    </aside>
  );
};

export default AssistantPanel;
