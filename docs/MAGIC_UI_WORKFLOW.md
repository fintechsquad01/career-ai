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

### 2.7 Hero blocks

```txt
Build a hero section component (not a full page) for AISkillScore.
Use mobile-first hierarchy and include headline + supporting copy + primary and secondary actions.
Required classes/patterns:
- Headline emphasis uses bg-gradient-to-r from-blue-600 to-violet-600 + bg-clip-text text-transparent
- Primary action uses btn-primary, secondary action uses btn-secondary or btn-ghost
- Trust/status chips use ui-badge + approved variants
- Optional highlight container uses surface-hero or surface-soft
Include default/hover/focus-visible/disabled states for actions.
Do not add autoplay loops, decorative particle systems, or new gradient palettes.
```

### 2.8 Pricing cards

```txt
Build pricing cards as reusable card components, not pricing page scaffolding.
Required structure:
- Card shell maps to surface-base; interactive cards may add surface-hover
- Plan highlight uses surface-hero, not custom color systems
- Price and token quantity are data-driven typed props
- CTA uses btn-primary for featured plan, btn-secondary for non-featured plans
- Value tags use ui-badge + approved variant
Support responsive stacking on mobile and multi-column at larger breakpoints.
Do not use "credits" or "points"; use "tokens" only.
```

### 2.9 Navigation patterns

```txt
Build a navigation component fragment (top nav row, sidebar item group, or bottom nav item set).
Constraints:
- Preserve existing App Router architecture and nav semantics
- Interactive elements must keep min-h-[44px] touch targets
- Active/inactive states must be explicit and keyboard-focusable
- Use existing gradient branding (from-blue-600 to-violet-600) where brand accent is needed
- Keep copy concise and canonical (AISkillScore, Job Mission Control, tokens)
Do not generate an entire page layout or replace global navigation architecture.
```

### 2.10 Report blocks (expanded)

```txt
Build an analytical report block component.
Compose using report-shell/report-section/report-section-header/report-section-body/report-section-footer/report-divider.
Required states:
- loading (skeleton primitives only)
- empty (clear no-data message)
- error (non-destructive guidance + retry action)
- success (fully structured section content)
Buttons/actions must map to btn-* primitives.
Status metadata must map to ui-badge primitives.
```

### 2.11 FAQ / accordion sections

```txt
Build a reusable FAQ/accordion component section.
Constraints:
- Question rows are keyboard-operable buttons with aria-expanded and aria-controls
- Expanded content region is semantically linked and readable on small screens
- Container maps to surface-base (optionally surface-soft), not ad hoc card styles
- Motion remains subtle; no long or decorative expand animations
Include hover/focus-visible states for question rows and optional inline CTA.
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

### 3.5 Anti-drift checks (mandatory before final decision)

Run all checks below. If any fail condition triggers, route to the specified outcome before merge.

1. **Primitive/class drift**
   - Check: Buttons, surfaces, badges, report sections, and skeletons use approved primitives.
   - Fail condition: New ad hoc UI class patterns duplicate existing primitives.
   - Outcome: **Adapt** (or **Reject** if primitive replacement is not feasible).
2. **Spacing drift**
   - Check: Tailwind spacing scale is consistent across container, section, and inline rhythm.
   - Fail condition: Arbitrary spacing values cause visual inconsistency.
   - Outcome: **Adapt**.
3. **Color/brand drift**
   - Check: Brand accent and gradients align with approved palette and gradient direction.
   - Fail condition: Custom palette or gradient system diverges from brand standards.
   - Outcome: **Adapt**.
4. **Motion drift**
   - Check: Motion is subtle, purpose-driven, and non-looping.
   - Fail condition: Decorative loops, attention-hijacking animation, or excessive durations.
   - Outcome: **Reject** unless motion can be removed cleanly.
5. **Language drift**
   - Check: Canonical terms and value framing remain intact (`tokens`, fair-value framing).
   - Fail condition: Non-canonical terms (credits/points) or unsupported claims.
   - Outcome: **Adapt**.
6. **Architecture drift**
   - Check: Component-level generation only; no page generation or mixed data-layer concerns.
   - Fail condition: Generated output changes routing/page architecture or couples UI with mock API flows.
   - Outcome: **Reject**.

## 4) Acceptance rubric (score before merge)

Score each category 0-2 (0 = fail, 1 = needs adaptation, 2 = pass).
Minimum ship score: **9/10** with no zeroes.
Blocker rule: any anti-drift **Reject** condition overrides score and blocks merge.

### 4.1 Scoring sheet

| Category | 0 (Fail) | 1 (Needs adaptation) | 2 (Pass) |
|---|---|---|---|
| Brand fit | Off-brand visual tone or terminology | Mostly aligned with minor drift | Fully aligned with AISkillScore tone, language, and visual identity |
| Spacing hierarchy | Inconsistent or cramped rhythm | Mostly clean rhythm with small inconsistencies | Clear hierarchy from container to element to inline spacing |
| Accessibility | Keyboard/focus/touch target issues present | Mostly accessible with minor fixes needed | Keyboard-safe, clear focus-visible, and touch targets respected |
| Mobile-first quality | Breaks or overflows on small screens | Works on mobile with minor layout roughness | Clean mobile baseline with predictable responsive scaling |
| Motion restraint | Decorative/heavy/looping motion | Slightly over-animated but fixable | Subtle, purpose-driven transitions only |

### 4.2 Scoring procedure

1. Score each category from the sheet above.
2. Record evidence in one line per category (what passed/failed).
3. Apply blocker logic:
   - any `0` -> cannot ship
   - total `< 9` -> Adapt
   - anti-drift Reject trigger -> Reject regardless of numeric total
4. Re-score after adaptation and keep the final score with the PR notes.

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

## 7) Adaptation examples: Magic output -> project primitives

Use these examples as the default correction pattern before merge.

### 7.1 Button/action mapping

**Magic output (drift):**

```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
  Start now
</button>
```

**Adapted output (approved):**

```tsx
<button className="btn-primary">
  Start now
</button>
```

### 7.2 Surface/card mapping

**Magic output (drift):**

```tsx
<div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
  <h3 className="text-xl font-semibold">Pro Plan</h3>
</div>
```

**Adapted output (approved):**

```tsx
<div className="surface-base surface-hover p-6">
  <h3 className="text-xl font-semibold">Pro Plan</h3>
</div>
```

### 7.3 Badge/status mapping

**Magic output (drift):**

```tsx
<span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
  Best Value
</span>
```

**Adapted output (approved):**

```tsx
<span className="ui-badge ui-badge-green">
  Best Value
</span>
```

### 7.4 Report block mapping

**Magic output (drift):**

```tsx
<section className="rounded-xl border p-4">
  <h2 className="mb-3 text-lg font-bold">Readout</h2>
  <div className="border-t pt-3">...</div>
</section>
```

**Adapted output (approved):**

```tsx
<section className="report-section">
  <div className="report-section-header">
    <h2 className="text-lg font-bold">Readout</h2>
  </div>
  <div className="report-divider" />
  <div className="report-section-body">...</div>
</section>
```

### 7.5 Nav/FAQ behavior mapping

**Magic output (drift):**

```tsx
<div onClick={toggleFaq} className="cursor-pointer p-3">
  What do I get?
</div>
```

**Adapted output (approved):**

```tsx
<button
  type="button"
  className="surface-base w-full min-h-[44px] px-4 py-3 text-left"
  aria-expanded={isOpen}
  aria-controls={panelId}
  onClick={toggleFaq}
>
  What do I get?
</button>
```

## 8) One-pass execution sequence for new designer/dev

Follow this exact sequence to generate and integrate in one pass:

1. **Intake**: complete all five intake fields (Section 1).
2. **Prompt**: apply base header + one family recipe from Section 2.
3. **Gate**: run Adopt/Adapt/Reject and anti-drift checks (Section 3).
4. **Score**: complete rubric sheet and apply blocker logic (Section 4).
5. **Adapt**: remap drift to primitives using Section 7 patterns.
6. **Verify**: run required checks (Section 6) and record results.

### Handoff checklist (designer -> developer)

- Component family and intended states are explicitly listed.
- Target file and insertion point are provided.
- Primitive mapping intent is written (`btn-*`, `surface-*`, `ui-badge*`, `report-*`, `skeleton-*`).
- Language checks confirm canonical terminology (`tokens`, AISkillScore naming).
- Final decision status is attached (Adopt/Adapt/Reject + score evidence).
