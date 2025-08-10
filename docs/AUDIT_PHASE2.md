# UX/UI & Accessibility Audit — MVP Phase 2

Scope covered: Landing → AddTools → Tech Map → Consolidation → Export/Share → Audit. Evaluated journeys, heuristics, and WCAG AA basics on desktop and mobile.

## UX Readiness Score
- Score: 82/100
- Rationale: Strong semantic structure, Radix primitives for a11y, sensible flows and empty states. Gaps remain in search input labelling, contrast edge cases, small touch targets on buttons/checkboxes, and mobile overflow of action groups.

## Issue List

| ID | Severity | Page | Heuristic/A11y Ref | Problem | Evidence | Suggested Fix | Est. Effort |
|---|---|---|---|---|---|---|---|
| UX-001 | High | AddTools | WCAG 2.5.3 Label in Name, 3.3.2 | Search input lacks explicit accessible name; relies on placeholder only. | src/components/ToolSearchBar.tsx:189–197 uses <Input placeholder=…> without label/aria-label. | Add aria-label="Search tools" and aria-expanded/aria-controls linking to results; or visible <Label for>. | S |
| UX-002 | Medium | AddTools (Suggestions) | WCAG 1.3.1 Info/Relationships, ARIA combobox pattern | Input not wired to listbox semantics (no role=combobox, aria-autocomplete, active descendant). | Suggestions rendered via shadcn <Command>, but input is separate; no ARIA relation. | Consider CommandDialog/CommandInput pattern or add combobox roles and aria-activedescendant to input tied to suggestions container id. | M |
| UX-003 | Medium | Tech Map header | Responsive design, Heuristic: Aesthetic & Minimalist | Action cluster (Export, Create Share Link, Settings) can overflow/squeeze at 360px. | src/pages/TechMap.tsx:117–138; multiple buttons in a row with gap-2. | Wrap into responsive “More” menu on <sm screens or stack with flex-wrap; ensure no horizontal scroll. | M |
| UX-004 | Medium | Global Buttons | WCAG Target Size 2.5.5 (AA) | Default button height is 40px (h-10) < 44px recommended for touch. | src/components/ui/button.tsx:24 default size "h-10". | Raise default to h-11 (44px) or keep h-10 desktop and bump to h-11 on sm: via responsive classes. | S |
| UX-005 | Medium | Consolidation table checkboxes | Target Size 2.5.5, Error Prevention | Small checkbox with no adjacent label reduces touch accuracy. | src/pages/Consolidation.tsx:345–352 uses <Checkbox> alone in cell. | Increase checkbox size or make whole row/cell a label; add aria-label="Stage change for {tool}". | S |
| UX-006 | High | Color contrast (Primary) | WCAG 1.4.3 Contrast (Text) | White text on primary (HSL 244 75% 59%) may fall below 4.5:1 for small text. | src/index.css: --primary: 244 75% 59%; buttons use text-primary-foreground (white). | Darken primary (e.g., L to ~48%) or use semi-bold dark text on lighter primary for small text; validate with a11y tooling. | S |
| UX-007 | Low | Landing email input | Label in Name 2.5.3 | Email input uses placeholder as label; no aria-label. | src/components/LandingPage.tsx:118–125 <Input type="email" placeholder=…>. | Add <Label htmlFor> or aria-label="Email address"; keep placeholder as hint. | S |
| UX-008 | Low | Tool logos in chips | WCAG 1.1.1 Non-text content | On error, chip logo is hidden without fallback, reducing affordance. | src/components/ToolChip.tsx:37–40 sets style.display='none'. | Swap to placeholder image (public/placeholder.svg) and keep alt text for SRs. | S |
| UX-009 | Medium | Search results dropdown | Visibility of system status | Loading state not clearly communicated in list (spinner/skeleton). | ToolSearchBar manages isLoading but doesn’t show it in UI. | Add CommandEmpty or header skeleton state when isLoading=true; announce via aria-live="polite". | S |
| UX-010 | Low | Keyboard hinting | Recognition > Recall | No visible keyboard hints for Arrow/Enter in suggestions. | ToolSearchBar Command has no hint row. | Add a footer row: “↑↓ to navigate • Enter to add • Esc to close”. | XS |
| UX-011 | Medium | Export actions a11y | Name, Role, Value | “Export Map” trigger is good, but dropdown items lack explicit aria-label context. | src/pages/TechMap.tsx:127–136. | Add aria-labels like “Download PNG of Tech Map”, or ensure menu has aria-label and items are descriptive. | XS |
| UX-012 | Medium | Export robustness | Reliability, Error Recovery | Export may fail if remote logos block HTML-to-image fetch (CORS/taint). | Uses html-to-image toPng on live DOM; logos may be cross-origin (Brandfetch). | Add crossOrigin="anonymous" on <img>, consider proxying logos, and display inline pre-export loader & error retry. | M |
| UX-013 | Low | Read-only Share affordance | Match with system | Read-only status is a small text line; not visually strong. | src/pages/Share.tsx:114–116 “Read-only view” small text. | Add a read-only Badge near title; disable/hide any action affordances entirely. | XS |
| UX-014 | Low | Focus return after dialogs | Heuristic: Visibility of System Status | After closing Suggest Tool dialog, focus likely returns to body; should return to launcher. | ToolSuggestionDialog uses Radix; open/close via state; no explicit focus restore target. | Programmatically focus previously focused element (the trigger button) via ref after close. | S |
| UX-015 | Low | Table responsiveness | Responsive reflow | Consolidation table may overflow on narrow screens. | Many columns (name, cat, cost, action, reason, alt, stage). | Add responsive columns: hide Reason/Alt on xs, or convert to stacked cards on <sm. | M |
| UX-016 | Low | Tooltip trigger a11y | Keyboard/Focus | TooltipTrigger is plain text span; keyboard focus not obvious. | src/pages/Consolidation.tsx:283–290. | Wrap trigger in button/link with aria-describedby; ensure visible focus style. | XS |
| UX-017 | Low | Skip link | WCAG 2.4.1 Bypass Blocks | No global “Skip to main content” link observed. | Pages use id="main-content" but no skip link. | Add visually hidden skip link to #main-content at top of DOM. | S |
| UX-018 | Low | Form validation messaging | Error Prevention, WCAG 3.3.1 | AddTools lacks visible error messages for duplicate tool add attempt. | handleAddTool returns early; no UI feedback. | Show toast “Tool already added” with focus status polite. | XS |
| UX-019 | Low | Command list overflow | Mobile ergonomics | Long descriptions truncate but still create tall items; scroll OK but could be dense. | CommandList className max-h-80; long content. | Limit to 2 lines, add tooltip on hover for truncated description. | XS |
| UX-020 | Medium | Checkbox label SR name | Name, Role, Value | Staging checkbox label is generic “Stage change”. | src/pages/Consolidation.tsx:351 aria-label="Stage change". | Make it contextual e.g. aria-label="Stage change for {item.name}". | XS |

Notes:
- Console/Network: No recent console or network logs were available during this run to attach as evidence (tools returned empty). Issues above cite code references and selectors.
- Colors from design system (for contrast verification): src/index.css → --primary: 244 75% 59%; --primary-foreground: #fff; --secondary: 220 15% 96%.

## Journey Review (Heuristics)
- Landing: Clear value prop and CTA, good visual hierarchy. Minor: email field label missing.
- AddTools: Strong progressive flow, instant feedback. Missing explicit a11y on combobox, no loading indicator inside suggestions.
- Tech Map: Clear counts and context; actions grouped logically. On small screens, actions can wrap inelegantly.
- Consolidation: Informative summaries and table; staging flow understandable. Checkbox target size/labels can improve.
- Export/Share: Export affordances discoverable; add more descriptive labels. Read-only state could be more prominent.
- Audit: Filters/logs straightforward; good empty state copy and CSV export.

## Mobile Ergonomics Checks
- Buttons: default h-10 (40px) under 44px AA recommendation; most CTAs use h-12 (ok). Suggest raising default on mobile.
- Command list: large enough row height; ensure no viewport-covering overlays; z-50 OK.
- Header/Action clusters: prefer an overflow menu on small screens.

## Quick Wins (Suggested Order)
1) Add aria-label/combobox semantics to AddTools search (UX-001/UX-002).
2) Increase button/checkbox touch areas (UX-004/UX-005/UX-020).
3) Strengthen color contrast for primary on small text (UX-006).
4) Add explicit loading and keyboard hints in suggestions (UX-009/UX-010).
5) Make read-only status more prominent on Share page (UX-013).
6) Improve Tech Map actions behavior on mobile (UX-003).

— End of report —
