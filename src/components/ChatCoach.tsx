import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTools } from '@/contexts/ToolsContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, CheckCircle2, MessageCircleQuestion, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GapRow {
  category: string;
  suggestions: string[];
}

interface PlaybookRow { category: string; must_have: boolean }

const ChatCoach: React.FC = () => {
  const { tools, addTool } = useTools();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toolNames = useMemo(() => tools.map(t => t.name), [tools]);
  const presentCategories = useMemo(() => {
    return new Set(tools.map(t => (t.confirmedCategory || t.category)));
  }, [tools]);

  const [gaps, setGaps] = useState<GapRow[]>([]);
  const [index, setIndex] = useState(0);
  const [playbooks, setPlaybooks] = useState<PlaybookRow[]>([]);
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  const currentGap = gaps[index];

  const completeness = useMemo(() => {
    if (!playbooks.length) return 0;
    const mustHave = playbooks.filter(p => p.must_have);
    const total = mustHave.length || 1;
    const covered = mustHave.filter(p => presentCategories.has(p.category)).length;
    return Math.round((covered / total) * 100);
  }, [playbooks, presentCategories]);

  // Fetch gaps and playbooks when tools change
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [{ data: gapsData, error: gapsErr }, { data: pbData, error: pbErr }] = await Promise.all([
          supabase.rpc('get_gap_questions', { tools_in: toolNames }),
          supabase.from('category_playbooks').select('category,must_have')
        ]);
        if (gapsErr) console.error('get_gap_questions error', gapsErr);
        if (pbErr) console.error('category_playbooks error', pbErr);
        if (!active) return;
        setGaps((gapsData as GapRow[]) || []);
        setPlaybooks((pbData as PlaybookRow[]) || []);
        setIndex(0);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false };
  }, [toolNames.join('|')]);

  const enrichTool = useCallback(async (toolName: string, suggestedCategory?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('enrichToolData', {
        body: { toolName: toolName.trim(), suggestedCategory }
      });
      if (error) throw error;
      return data as { logoUrl?: string; description?: string; confidence?: number } | null;
    } catch (e) {
      console.warn('enrichToolData failed (continuing without enrichment)', e);
      return null;
    }
  }, []);

  const addSuggestedTool = useCallback(async (name: string, category: string) => {
    if (!name.trim()) return;
    const id = `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Optimistic add
    addTool({
      id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      category,
      confirmedCategory: category,
      description: '',
      logoUrl: '',
      confidence: 0,
    });

    // Fire-and-forget enrichment (edges/relayout handled by MapGraphContext)
    const enriched = await enrichTool(name, category);
    if (enriched && (enriched.logoUrl || enriched.description)) {
      toast({ title: `Added ${name}`, description: 'Enriched with details', variant: 'default' });
    } else {
      toast({ title: `Added ${name}`, description: 'Enrichment unavailable', variant: 'default' });
    }

    // Advance to next question
    setIndex(prev => Math.min(prev + 1, Math.max(0, gaps.length - 1)));
    setCustomName('');
  }, [addTool, enrichTool, gaps.length, toast]);

  return (
    <aside className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5 text-primary" />
            Stack Coach
          </CardTitle>
          <CardDescription>
            Smart prompts to fill gaps and complete your stack.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Completeness: <span className="font-medium text-foreground">{completeness}%</span>
            </div>
            <Button
              size="sm"
              variant={completeness >= 70 ? 'default' : 'secondary'}
              disabled={completeness < 70}
              onClick={() => navigate('/consolidation')}
            >
              Analyze Stack
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading questions...
            </div>
          ) : currentGap ? (
            <div className="space-y-3">
              <div className="text-sm">
                Do you use any tool for <span className="font-medium text-foreground">{currentGap.category}</span>?
              </div>
              <div className="flex flex-wrap gap-2">
                {currentGap.suggestions?.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="cursor-pointer select-none"
                    onClick={() => addSuggestedTool(s, currentGap.category)}
                  >
                    <Sparkles className="h-3 w-3 mr-1" /> {s}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={`Add a ${currentGap.category} tool...`}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <Button onClick={() => addSuggestedTool(customName, currentGap.category)} disabled={!customName.trim()}>
                  Add
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Question {index + 1} of {gaps.length}</span>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setIndex((i) => Math.min(gaps.length - 1, i + 1))} disabled={index >= gaps.length - 1}>Next</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              All set! No gaps detected. You can analyze your stack or explore integrations.
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
};

export default ChatCoach;
