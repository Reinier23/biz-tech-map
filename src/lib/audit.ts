import { supabase } from "@/integrations/supabase/client";

// Define proper types for audit details
export interface AuditDetails {
  id?: string;
  name?: string;
  category?: string;
  shareId?: string;
  scope?: string;
  target?: string;
  toolsCount?: number;
  count?: number;
  filename?: string;
  companyName?: string;
  [key: string]: unknown;
}

// Lightweight helper to record audit events
// - No-ops for anonymous users (RLS will block inserts)
// - Never throws (safe fire-and-forget for UI flows)
export async function logAudit(event_type: string, details: AuditDetails = {}) {
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
