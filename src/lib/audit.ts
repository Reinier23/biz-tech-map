import { supabase } from "@/integrations/supabase/client";

// Lightweight helper to record audit events
// - No-ops for anonymous users (RLS will block inserts)
// - Never throws (safe fire-and-forget for UI flows)
export async function logAudit(event_type: string, details: any = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Skip if not authenticated

    const actor = (user.id || user.email || "unknown").toString();
    await supabase.from('audit_log').insert({ actor, event_type, details });
  } catch (e) {
    // Swallow errors so audit never breaks UX
    console.warn('audit_log insert skipped:', e);
  }
}
