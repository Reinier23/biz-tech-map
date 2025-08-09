import { supabase } from "@/integrations/supabase/client";
import { DEBUG } from "@/lib/config";

export type AuditRow = {
  id: string;
  timestamp: string;
  event_type: string;
  details: any;
};

export type AuditFilters = {
  eventType?: string | null;
  q?: string | null; // free text
  from?: string | null; // ISO date
  to?: string | null;   // ISO date
  page?: number;        // 1-based
  pageSize?: number;    // default 25
};

export async function fetchAudit(filters: AuditFilters): Promise<{ rows: AuditRow[]; total: number }> {
  if (DEBUG) console.debug('[useAuditLog] Fetching audit with filters:', filters);
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 25));
  const fromIdx = (page - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;

  // Ensure user session present (RLS will also guard)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (DEBUG) console.debug('[useAuditLog] No user session');
    return { rows: [], total: 0 };
  }

  let query = supabase
    .from('audit_log')
    .select('id,timestamp,event_type,details', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .range(fromIdx, toIdx);

  if (filters.eventType) {
    query = query.eq('event_type', filters.eventType);
  }
  if (filters.from) {
    query = query.gte('timestamp', filters.from);
  }
  if (filters.to) {
    query = query.lte('timestamp', filters.to);
  }
  if (filters.q && filters.q.trim().length > 0) {
    const q = filters.q.trim();
    // Attempt server-side search across event_type and details::text
    // PostgREST supports OR via .or(). Casting JSONB with ::text is often supported
    query = query.or(`event_type.ilike.%${q}%,details::text.ilike.%${q}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  if (DEBUG) console.debug('[useAuditLog] Query result:', { rows: data?.length, total: count });
  return { rows: (data as AuditRow[]) ?? [], total: count ?? 0 };
}

export async function fetchEventTypes(): Promise<string[]> {
  // Try to get distinct event types, fall back to a static list
  const { data, error } = await supabase
    .from('audit_log')
    .select('event_type');

  if (error) {
    // Fallback list
    return [
      'tool_added',
      'tool_removed',
      'suggestion_applied',
      'export_png',
      'export_pdf',
      'share_created',
      'view_ai_suggestions',
      'ai_suggestions_viewed',
    ];
  }
  const set = new Set<string>();
  (data || []).forEach((r: any) => set.add(r.event_type));
  const values = Array.from(set);
  return values.length > 0 ? values : [
    'tool_added',
    'tool_removed',
    'suggestion_applied',
    'export_png',
    'export_pdf',
    'share_created',
    'view_ai_suggestions',
    'ai_suggestions_viewed',
  ];
}
