# Messaging & Copy Audit — Phase 3

Scope reviewed: Landing → AddTools → Tech Map → Consolidation → Export/Share → Audit. Focused on clarity, consistency, trust, and investor‑grade polish.

## Messaging Readiness Score
- Score: 85/100
- Why: Clear value prop and flows; strong structure (Radix/shadcn). Gaps: product name consistency, a few vague labels, privacy cues not everywhere, export filenames lack brand/timestamp, and some placeholders could better guide.

## Copy Deck (Before → After)

| Location | Current Copy | Recommended Copy | Rationale |
|---|---|---|---|
| Global brand (SEO/titles) | "Biz Tech Map" on Landing; "Tech Stack Mapper" in SEO on internal pages | Standardize to "Biz Tech Map" across all titles, meta, and in‑app labels | Consistency builds trust; avoids brand confusion for users/investors |
| Landing – Hero headline | "See your entire tech stack, then cut costs with confidence" | "Map your SaaS stack. Cut costs with confidence." | Tighter, scannable, emphasizes action and ROI |
| Landing – Hero subhead | "Visualize every tool, find overlaps, and get AI suggestions to consolidate spend." | "Visualize every tool, spot overlaps, and get AI‑backed consolidation opportunities—in minutes." | More outcome‑oriented; credible time promise |
| Landing – CTA | "Get Early Access" | "Get Early Access — Free" | Adds friction‑reducing qualifier |
| Landing – Waitlist success | "Welcome to the waitlist!" | "You’re on the list — we’ll email you with early access." | Sets expectation on next step |
| Landing – Security note (footer/hero) | "Your tool data is never sold or shared." | "Your data stays private. We never sell or share it. Exports and shares are opt‑in." | Adds explicit opt‑in reassurance |
| Landing – Logos/credibility | Text list (HubSpot, Slack, …) | "Trusted by modern SaaS teams" (with logo list or placeholder badges) | Social proof framing |
| AddTools – Page title | "Add Your Tools" | "Add your tools" (sentence case) | Follow consistent case conventions |
| AddTools – Intro | "Just enter the tool names - AI will handle the rest automatically!" | "Enter tool names — our AI categorizes and enriches details automatically." | Cleaner and precise (enriches what?) |
| AddTools – Search placeholder | "Search for tools like Microsoft 365, Azure, Salesforce..." | "Search tools (e.g., Slack, HubSpot, Zendesk)" | Examples align with categories; shorter |
| AddTools – Search button | "Add Tool" | "Add tool" | Sentence case; consistent with other buttons |
| AddTools – Suggestions header | "Popular business tools" | "Popular tools" | Brevity |
| AddTools – Empty state (no matches) | "No matches found for "{query}"... Try popular tools like Salesforce, HubSpot, or Slack" | "No matches for “{query}”. Try a different name or suggest this tool." | Keeps focus on next action + Suggest flow |
| AddTools – Quick Tips bullets | Marketing, Sales, Service examples | Keep bullets, but end with: "Our AI finds logos and descriptions — just type the name." | Clarifies enrichment |
| AddTools – Duplicate add (silent) | None | "This tool is already in your list." | Feedback prevents confusion |
| Suggest Tool dialog – Title | "Suggest a Tool" | "Suggest a tool" | Sentence case |
| Suggest Tool dialog – Description | "Can't find the tool you're looking for?..." | "Can’t find a tool? Tell us the name and we’ll review it for our catalog." | Shorter, active voice |
| Tech Map – Title | "Tech Map" | "Tech map" | Consistent case |
| Tech Map – Subtext | "{total} tools across {categories} lanes" | "{total} tools across {lanes} lanes" | Use consistent placeholders (lanes) |
| Tech Map – Action group label | "Export Map" | "Export" | Cleaner, still accurate |
| Tech Map – Export menu | "Download PNG / Download PDF" | "Export PNG (map) / Export PDF (map)" | Adds context in SR menus and exports |
| Tech Map – Share button | "Create Share Link" | "Create share link" | Sentence case |
| Tech Map – Next CTA | "Next: Consolidation Ideas" | "Next: Consolidation" | Concise; mirrors page name |
| Tech Map – On‑map label | "Tech Map — Your Company — {timestamp}" | "Tech map — {company or “Your Company”} — {timestamp}" | Ensure company fallback and consistent casing |
| Share page – Title row | "Shared Tech Map" + small "Read-only view" | "Shared tech map" with a prominent "Read‑only" badge and short intro: "This map was shared for viewing only." | Strengthen affordance/trust |
| Consolidation – Page title | "Stack Consolidation" | "Consolidation" | Match nav and CTA |
| Consolidation – Subtitle | "MVP rule engine: Replace • Evaluate • Keep" | "Actions: Replace • Evaluate • Keep" | User‑facing wording; drop "MVP" |
| Consolidation – Summary cards | "Estimated Monthly Spend" | "Estimated monthly spend" | Sentence case |
| Consolidation – Table headers | "Est. Monthly Cost" | "Est. monthly cost" | Sentence case; consistent abbreviations |
| Consolidation – Table header | "Suggested Alternative" | "Suggested alternative" | Case |
| Consolidation – Table header | "Stage" | "Stage change" | Clearer label for checkbox column |
| Consolidation – Tooltip link | "Cost method" | "How estimates are calculated" | Clearer expectation |
| Consolidation – Tooltip content | "Uses tool-specific defaults..." | "We use known tool pricing defaults or a category fallback when pricing is unknown." | Plain language |
| Consolidation – Drawer title | "Staged Changes" | "Staged changes" | Case |
| Consolidation – Drawer empty | "No staged items." | "No changes staged yet." | More natural |
| Consolidation – Apply button | "Review Staged Changes" (button) / inside drawer: "Apply" sequence | "Review staged changes" / inside drawer add: "Apply changes" primary CTA | Clear next action |
| Consolidation – Savings summary | None | "Estimated monthly savings (staged): {amount}" | Make ROI visible |
| Export – Filenames | "Tech-Map.png" / "Tech-Map.pdf" / "Consolidation-Report.pdf" | "BizTechMap_TechMap_{YYYY-MM-DD}.png/pdf"; "BizTechMap_Consolidation_{YYYY-MM-DD}.pdf" | Branded, dated filenames aid organization |
| Export – PDF header | "Tech Map — {company} — {ts}" | "Biz Tech Map — Tech map for {company} — {ts}" | Branded, report‑like |
| Export – Consolidation header | "Consolidation Report — {company} — {ts}" | "Biz Tech Map — Consolidation report for {company} — {ts}" | Branded |
| Share payload intro | None | "Shared from Biz Tech Map. Read‑only; no editing or exporting." | Trust + scope |
| Audit – Title | "Audit Log" | "Audit log" | Case |
| Audit – Filters card title | "Filters" | "Filters" + helper text: "Narrow by event type, date, or keywords." | Small guidance |
| Audit – Empty results | "No events match your filters." | "No events match your filters. Try a wider date range or clear keywords." | Actionable next step |

Notes: Keep sentence case across UI. Prefer short, descriptive button labels; augment context for menus via aria‑labels (tracked in Phase 2).

## Terminology Guide (Single Glossary)
- Tools: Individual SaaS products (e.g., Slack, HubSpot).
- Lanes: Category swimlanes on the Tech map (Marketing, Sales, Service, ERP, HR, Project management, Analytics, Finance & accounting, Communication, Development, Other).
- Marketing: Marketing & marketing automation (use "Marketing" in UI; reserve "marketing automation" for internal descriptions if needed).
- Service: Customer support/service (do not use "Support" or "Comms" interchangeably). Use "Service" consistently.
- Communication: Internal communication (Slack, Teams, Zoom). Do not label as "Comms" in UI.
- Consolidation actions: Replace, Evaluate, Keep (proper nouns in logic; sentence case in UI: replace/evaluate/keep when standalone badges are acceptable).
- Costs: "Estimated monthly cost"; "Estimated monthly spend" for totals; "Estimated monthly savings" when staged.
- Share: "Create share link" (action), "Shared tech map" (page), "Read‑only" status.
- Export: "Export PNG (map)" / "Export PDF (map)"; Consolidation report is "Export PDF (consolidation)".
- Company name: Use the value from Settings; fallback to "Your Company" (UI) and "Acme Co." for demo screenshots if needed.

## Investor‑Ready Checklist
- Brand consistency: Replace all references of "Tech Stack Mapper" with "Biz Tech Map" in titles/meta.
- ROI framing: Add visible "Estimated monthly savings (staged)" on Consolidation; keep top‑level value props crisp.
- Social proof: Add a short "Trusted by modern SaaS teams" row with recognizable logos or placeholders.
- Privacy signal: Place a privacy/opt‑in note on AddTools, Tech Map (near share/export), and Share page intro.
- Report polish: Branded filenames and PDF headers; include timestamp and company name consistently.
- Demo readiness: Seed with 10–12 recognizable tools across 5+ lanes; ensure logos render (fallbacks ready).
- Accessibility labels: Ensure export/share menu items have descriptive names for SRs (Phase 2 alignment).
- Terminology: Use single glossary above; avoid mixing "Service/Support/Comms" labels.
- Empty/error states: Replace silent failures with crisp messages (e.g., duplicate tool add; RPC fallback messaging).
- CTA clarity: Keep sentence case; show primary next step on each page (e.g., "Next: Consolidation").

— End of Phase 3 Messaging Audit —
