# Magic MCP UI Workflow (Batch A Foundation)

This document is the operating model for using Magic-generated UI in AISkillScore.
All generated output must map to existing project primitives, canonical language, and current architecture.

## 0) Non-negotiable rules

- Generate component-level UI only. Do not generate full pages.
- Stay in Next.js App Router + TypeScript + Tailwind utility classes.
- Do not introduce a separate design system package or custom token system.
- Keep required product language intact:
  - Use `tokens` terminology.
  - Keep core landing message and no-hallucination framing from project docs.
- Respect motion restraint: short, subtle transitions only; no decorative animation loops.

## 1) Intake before any Magic prompt

Every generation request must define:

1. **Component type** (button group, card, badge row, report section, skeleton block, nav item, etc.)
2. **Target file + insertion point**
3. **States** (default, hover, focus-visible, disabled, loading, empty, error when relevant)
4. **Data contract** (typed props only, no hardcoded API payloads)
5. **Primitive mapping plan** (which shared classes will be reused)

If any item is missing, stop and complete intake first.

## 2) Prompt template library by component type

Use the base header plus one component-specific template.

### 2.1 Base header (prepend to every prompt)

```txt
Create a production-ready Next.js App Router component in TypeScript + Tailwind for AISkillScore.

Hard constraints:
- Mobile-first layout
- Touch targets min 44px, primary CTA min 48px
- Tailwind utility approach only
- Brand gradient: bg-gradient-to-r from-blue-600 to-violet-600
- Reuse existing shared primitives when possible
- Include default/hover/focus-visible/disabled/loading states where applicable
- No new design framework, no inline mock API data
- Return typed props + component + short usage example
```

### 2.2 Buttons / action rows

```txt
Build a button/action row component.
Use these primitives: btn-primary, btn-secondary, btn-ghost.
Do not create new button visual patterns.
Include icon + label alignment and disabled/loading behavior.
```

### 2.3 Card / surface blocks

```txt
Build a card-like component.
Use surface-base as default, with optional surface-hover/surface-soft/surface-hero variants.
Keep spacing hierarchy clean: section padding > element gap > inline gap.
```

### 2.4 Badge / status chips

```txt
Build a badge/status component.
Use ui-badge plus one of: ui-badge-blue, ui-badge-green, ui-badge-amber, ui-badge-gray.
Keep labels concise and readable at small sizes.
```

### 2.5 Report sections

```txt
Build a report section component.
Compose with report-shell, report-section, report-section-header, report-section-body, report-section-footer, report-divider.
Support loading and empty states.
```

### 2.6 Skeleton loading blocks

```txt
Build loading skeletons for a report-like layout.
Use skeleton-base with skeleton-title/skeleton-line/skeleton-block/skeleton-circle/skeleton-button.
Use realistic widths/heights that mirror final content hierarchy.
```

## 3) Adopt / Adapt / Reject decision gate (required)

Run this gate on every Magic output.

### Adopt

Choose **Adopt** only if all are true:

- Uses existing primitives directly (no net-new style pattern).
- Spacing and typography align with existing components.
- Accessibility and mobile requirements are met.
- Copy preserves canonical language (`tokens`, pricing/value framing).

### Adapt

Choose **Adapt** when structure is good but implementation needs changes:

- Class names drift from primitives.
- Spacing scale is inconsistent.
- States or a11y attributes are incomplete.
- Copy needs terminology correction.

Adapt by refactoring into shared primitives before merge.

### Reject

Choose **Reject** immediately if output:

- Introduces a parallel design system or custom styling framework.
- Adds heavy/continuous motion or non-essential visual effects.
- Breaks architecture boundaries (page-level generation, mixed data concerns).
- Uses non-canonical product language or unsupported claims.

## 4) Acceptance rubric (score before merge)

Score each category 0-2 (0 = fail, 1 = needs adaptation, 2 = pass). Minimum ship score: **9/10** with no zeroes.

1. **Brand fit**: visual tone matches refined professional style.
2. **Spacing hierarchy**: consistent rhythm and information density.
3. **Accessibility**: keyboard access, focus-visible clarity, contrast and touch target minimums.
4. **Mobile-first quality**: layout works cleanly from small screens upward.
5. **Motion restraint**: transitions are subtle and purposeful only.

If score is below threshold, adapt or reject.

## 5) Integration checklist mapped to shared primitives

Before committing generated UI, verify:

- **Buttons**
  - Primary CTA uses `btn-primary`.
  - Secondary and tertiary actions use `btn-secondary` / `btn-ghost`.
- **Surfaces**
  - Base and variants use `surface-base`, `surface-hover`, `surface-soft`, `surface-hero`.
- **Badges**
  - Status labels use `ui-badge` + approved color variant only.
- **Report layout**
  - Analytical output sections use report primitives (`report-shell`, `report-section`, etc.).
- **Skeletons**
  - Loading states use skeleton primitives, not ad hoc gray blocks.
- **Language**
  - User-facing copy uses `tokens` and keeps premium-output + fair-price framing.
- **Architecture**
  - App Router patterns and existing state/data flow remain unchanged.

## 6) Verification steps (required)

For every merged Magic-derived component:

1. Run lint diagnostics on touched files.
2. Run lightweight type/lint checks relevant to changed files when available.
3. Confirm no regressions in required marketing/product copy.
4. Document whether failures are pre-existing or introduced by the change.
