import { supabase } from '@/integrations/supabase/client';
import type { Tool } from '@/contexts/ToolsContext';
import type { AnalyzedItem } from '@/lib/ruleEngine';

interface SharePayload {
  tools: Tool[];
  latestAnalysis: AnalyzedItem[];
  techMapMeta?: {
    timestamp: number;
  };
}

export async function createShare(payload: SharePayload): Promise<{ id: string }> {
  try {
    const { data, error } = await supabase.from('shares').insert({
      payload,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }).select('id').single();

    if (error) throw error;
    return { id: data.id };
  } catch (error) {
    console.error('createShare error', error);
    throw error;
  }
}

export async function fetchShare(id: string): Promise<SharePayload | null> {
  try {
    const { data, error } = await supabase
      .from('shares')
      .select('payload')
      .eq('id', id)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error) throw error;
    return data?.payload || null;
  } catch (error) {
    console.error('fetchShare error', error);
    return null;
  }
}
