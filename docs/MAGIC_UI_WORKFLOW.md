# Magic Component Workflow

This workflow keeps Magic-generated UI aligned with AISkillScore conventions and avoids design drift.

## 1) Choose the right generation scope

- Generate **atomic components** only (card, button row, accordion, stats strip, nav item).
- Avoid generating full pages in one shot.
- Attach explicit target location and state requirements before generation.

## 2) Prompt template

Use this base prompt for every generation:

```txt
Create a production-ready Next.js + TypeScript + Tailwind component for AISkillScore.

Constraints:
- Mobile-first
- Touch targets at least 44px; primary CTA at least 48px
- Tailwind utilities only
- Brand gradient: bg-gradient-to-r from-blue-600 to-violet-600
- Neutral surfaces and restrained motion
- Include default, hover, focus-visible, disabled, loading states
- No hardcoded API data; accept typed props

Output:
1) TypeScript props interface
2) Component implementation
3) Short usage example
```

## 3) Adopt / Adapt / Reject gate

- **Adopt** when output already matches existing patterns (`btn-primary`, `surface-card`, `ui-badge`).
- **Adapt** when structure is useful but classes/spacing differ.
- **Reject** when output introduces custom design systems, incompatible patterns, or heavy animation.

## 4) Integration checklist

- Map to shared primitives:
  - `btn-primary`, `btn-secondary`, `btn-ghost`
  - `surface-card`, `surface-card-hover`, `surface-card-soft`, `surface-card-hero`
  - `ui-badge-*`
  - `report-section`, `report-shell`
- Ensure copy uses `tokens` terminology.
- Keep App Router and current data flow untouched.

## 5) QA checklist (required before merge)

- Keyboard navigation and focus-visible behavior verified.
- Mobile and desktop layout checked.
- Empty/error/loading states rendered and readable.
- No regression in required copy and conversion CTAs.
- Lint/typecheck pass for touched files.
