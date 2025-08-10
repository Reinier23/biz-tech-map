# QA Audit — Phase 1 (E2E, no code changes)

Readiness Score: 62/100

Scope covered: ToolSearchBar, AddTools, Tech Map, Consolidation, Export & Share, Audit Log, mobile/desktop sanity. Evidence gathered from live logs (none available this run), network requests (none captured), and code inspection of critical paths.

Seed Test Run (proposed)
- Tools (12 total):
  - Service: Intercom, Zendesk
  - Marketing: HubSpot, Marketo
  - Sales: Salesforce, Pipedrive
  - Analytics: Google Analytics, Mixpanel
  - Collaboration: Slack, Notion
  - DevOps: GitHub, Sentry
- Expected logo sources: Brandfetch (domain-based) with onError fallback to /placeholder.svg.

Issue List
| ID | Severity | Area | Steps to Reproduce | Expected | Actual | Evidence (console/network) | Suggested Fix |
|---|---|---|---|---|---|---|---|
| QA-001 | Critical | Share creation | On /tech-map click “Create Share Link” | Share row inserted, link copied, /share/:id loads read-only | Share fails for anonymous user; toast error | RLS: shares INSERT requires authenticated; src/lib/share.ts inserts directly; Supabase table policy confirms. | Add lightweight auth and gate share; or create secure edge function using service role to insert vetted public payloads; keep current RLS intact. |
| QA-002 | Critical | Export PNG (Map) | Add tools with Brandfetch logos → Export PNG | PNG downloads successfully | Likely DOMException: “Tainted canvases may not be exported” when external images present | src/lib/export.ts uses html-to-image without useCORS; Tool logos don’t set crossOrigin; ToolNode lacks crossOrigin; html-to-image default will taint | In export.toPng: set useCORS: true; ensure all <img> use crossOrigin="anonymous"; optionally prefetch/inline logos or proxy via edge fn with proper CORS headers. |
| QA-003 | High | Export PDF (Map/Consolidation) | Same as QA‑002 for PDF flows | PDF downloads | Same CORS/taint risk as PNG | exportMapPDF/exportConsolidationPDF also call toPng without useCORS | Same fix as QA‑002. |
| QA-004 | High | AddTools enrichment + gating | Add tools; wait enrichment; check Suggestions panel | Enrichment updates logo, description, confidence; Suggestions appear after ≥3 tools with confidence>70 | Confidence never updated, gating stays 0; Suggestions/Email capture may never appear | src/pages/AddTools.tsx: lines 120–131 update description/logo only, no confidence; enrichedToolsCount derives from confidence | Update tool.confidence from enrichedData.confidence (fallback if null) to enable gating features; keep category preserved. |
| QA-005 | High | Audit Log visibility | Add/remove tool, export, share; visit /audit | Authenticated users see last 100 entries | Anonymous users see nothing (by design), and most flows skip logAudit | audit_log RLS: inserts/selects require authenticated; src/lib/audit.ts early-returns if no user | Add auth and require sign-in for Audit; provide UX guidance; ensure logAudit fires on key events post-auth. |
| QA-006 | Medium | ToolSearchBar performance | Focus empty input; suggestions load | Lightweight “popular tools” (local) | RPC with q='' can match ‘%%’ and return first page of catalog on every focus | src/components/ToolSearchBar.tsx: passes q='' when <2 chars; SQL LIKE '%%' will match all, even if limited to 10 | Defer RPC until ≥2 chars; show curated local popular list for empty query to reduce DB load. |
| QA-007 | Low | Clipboard permission | Create Share Link on restricted environments | Clipboard writes succeed | Clipboard may be denied; user sees error toast | TechMap handleCreateShare uses navigator.clipboard.writeText without fallback | Add fallback UI to display/copy the link if clipboard fails; show "Copy" button. |
| QA-008 | Low | Mobile layout | 360px width sanity across AddTools/Tech Map/Consolidation | No overflow; controls usable | Potential horizontal overflow in map and tables | General risk; not reproduced in this run | Validate with mobile emulation; add responsive tweaks (wrapping badges, overflow-x auto on tables, smaller paddings). |

Evidence Details
- Runtime logs: None captured this run (No console logs; No network requests).
- Code references:
  - Share RLS: shares INSERT requires authenticated; src/lib/share.ts inserts directly.
  - Export CORS: src/lib/export.ts doesn’t set useCORS for html-to-image; src/components/nodes/ToolNode.tsx lacks crossOrigin on <img>.
  - AddTools confidence: src/pages/AddTools.tsx lines 120–131 update description/logo only; gating relies on confidence>70 (lines ~143–153).
  - Audit RLS: audit_log INSERT/SELECT authenticated-only; src/lib/audit.ts bails out when !user.
  - ToolSearchBar RPC: calls search_tools with q='' when <2 chars.

Pass/Verify Highlights
- Category preservation: PASS. AddTools preserves selected category and confirmedCategory; enrichment does not overwrite them.
- Local fallback search: PASS. ToolSearchBar catches RPC errors and falls back to getToolSuggestions.
- Tech Map lanes + logos: PASS onError fallback to /placeholder.svg in ToolNode.
- Consolidation: PASS. Costs resolve via RPC, null-safe totals; table handles null costs.

Top Blockers (prioritized)
1) Share creation requires auth (RLS) — cannot share without sign-in.
2) Export PNG/PDF likely fails with logos due to canvas taint (CORS).
3) Enrichment does not set confidence, breaking downstream gating.
4) Audit Log requires auth — no visibility for current flows.
5) ToolSearchBar RPC invoked with empty query — unnecessary DB load on focus.
6) Clipboard write may fail without fallback in some environments.
7) Mobile layout overflow risks in map/tables (needs verification).
8) No auth UX — impacts share and audit discoverability and testability.

Desktop & Mobile Sanity
- Desktop (FHD): Expected OK; verify export flows after CORS fix.
- Mobile (360px): Validate map controls/tables; likely need overflow handling and spacing tweaks.

Appendix: Test Checklist (to re-run after fixes)
- ToolSearchBar: RPC returns suggestions; kill network → local fallback appears; logos render with placeholder on error.
- AddTools: Category preserved; enrichment sets confidence; Suggestions appear after 3 tools.
- Tech Map: Lanes render; node logos fallback; no console errors.
- Consolidation: Costs render; totals sum; no crashes on null costs.
- Export: PNG/PDF both download and open; CORS resolved; header timestamp present.
- Share: Share link created; /share/:id loads read-only map.
- Audit: Insert logs on tool add/remove/export/share; /audit lists last 100 for signed-in user.
