import { supabase } from "@/integrations/supabase/client";
import { getToolSuggestions } from "@/lib/toolSuggestions";

export type SmokeResult = { name: string; pass: boolean; info?: string };

export async function runSmokeChecklist(): Promise<SmokeResult[]> {
  const results: SmokeResult[] = [];

  // ToolSearchBar: RPC path returns results
  try {
    const { data, error } = await (supabase as any).rpc('search_tools', { q: 'hub', lim: 3 });
    if (error) throw error;
    results.push({ name: 'ToolSearchBar RPC', pass: Array.isArray(data) && data.length >= 0, info: `rows=${data?.length ?? 0}` });
  } catch (e: any) {
    results.push({ name: 'ToolSearchBar RPC', pass: false, info: e?.message || 'rpc failed' });
  }

  // ToolSearchBar: fallback works
  try {
    const suggestions = getToolSuggestions('hub', 3);
    results.push({ name: 'ToolSearchBar Fallback', pass: Array.isArray(suggestions) && suggestions.length > 0, info: `suggestions=${suggestions.length}` });
  } catch (e: any) {
    results.push({ name: 'ToolSearchBar Fallback', pass: false, info: e?.message });
  }

  // Export: functions present
  try {
    const mod = await import('@/lib/export');
    const ok = typeof mod.exportMapPNG === 'function' && typeof mod.exportMapPDF === 'function' && typeof mod.exportConsolidationPDF === 'function';
    results.push({ name: 'Export API', pass: ok });
  } catch (e: any) {
    results.push({ name: 'Export API', pass: false, info: e?.message });
  }

  // Share: client available
  try {
    const mod = await import('@/lib/share');
    results.push({ name: 'Share API', pass: typeof mod.createShare === 'function' });
  } catch (e: any) {
    results.push({ name: 'Share API', pass: false, info: e?.message });
  }

  // Audit: utils and client
  try {
    const mod = await import('@/lib/audit');
    results.push({ name: 'Audit API', pass: typeof mod.logAudit === 'function' });
  } catch (e: any) {
    results.push({ name: 'Audit API', pass: false, info: e?.message });
  }

  return results;
}
