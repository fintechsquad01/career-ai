# AISkillScore Design Token Map And Component Usage Matrix

Version: 1.0  
Owner: Product + Design + Frontend Engineering  
Last updated: 2026-02-20  
Review cadence: Bi-weekly during active UI waves, monthly otherwise

## 1) Purpose

This document is the canonical visual system contract for AISkillScore.  
It defines strict design tokens and component usage rules for:

- Hero
- Card
- Badge
- CTA
- Navigation
- Score states

The goal is to prevent UI drift and keep the experience aligned with:

- trust-first UX
- mission-first progression
- premium quality with fair-value positioning

## 2) Source Precedence

Resolve any conflict in this order:

1. `UNIFIED_MASTER_PLAN.md`
2. `docs/UX_COMMAND_CENTER_IMPLEMENTATION_SPEC_2026-02-19.md`
3. `BRAND_SYSTEM.md`
4. `PERSONA_AUDIT_REPORT.md`
5. `PERSONAS.md`
6. `PAGES.md`
7. `CONVENTIONS.md`
8. This document

## 3) Non-Negotiables

- Mobile-first defaults; add larger breakpoints with `sm:`, `md:`, `lg:`.
- Interactive targets must be at least `min-h-[44px]`; primary CTAs must be `min-h-[48px]`.
- Authenticated mobile pages must keep bottom-nav safe area (`pb-24 sm:pb-8`).
- Gradient usage is constrained to high-intent surfaces only (hero, primary CTA, mission highlight).
- User-facing score colors use one threshold model:
  - `< 40`: red
  - `40-69`: amber
  - `>= 70`: green
- User-facing currency language remains `tokens` (never credits/points).

## 4) Global Token Taxonomy

## 4.1 Color Tokens

| Token Group | Canonical Token | Value | Primary Usage | Do Not Use For |
|---|---|---|---|---|
| Background | `bg.canvas` | `bg-gray-50` | App/page canvas | CTA/background emphasis |
| Surface | `bg.surface` | `#ffffff` | Cards, panels, modals | High-emphasis hero blocks |
| Border | `border.subtle` | `#e5e7eb` | Standard card/input borders | Active/semantic emphasis |
| Brand Primary | `brand.blue` | `#2563eb` (`blue-600`) | Links, active nav, core accent | Warnings/errors/success |
| Brand Secondary | `brand.violet` | `#7c3aed` (`violet-600`) | Gradient pair, mission highlight | Standalone body text color |
| Brand Gradient | `brand.gradient.primary` | `from-blue-600 to-violet-600` | Hero + primary CTA only | Default card backgrounds |
| Text Primary | `text.primary` | `#111827` (`gray-900`) | Headings and key labels | Low-emphasis metadata |
| Text Secondary | `text.secondary` | `#4b5563` (`gray-600`) | Supporting copy | Headline text |
| Text Tertiary | `text.tertiary` | `#9ca3af` (`gray-400`) | Metadata/chips | Important actions |
| Semantic Success | `semantic.green` | `#22C55E` + tints | Strong/free/positive states | Neutral labels |
| Semantic Warning | `semantic.amber` | `#F59E0B` + tints | Moderate/caution states | Primary actions |
| Semantic Danger | `semantic.red` | `#EF4444` + tints | High risk/error states | Generic accents |
| Semantic Info | `semantic.blue` | `#1d4ed8` + tints | Informational badges | Error/success contexts |

## 4.2 Score State Tokens

| Score Band | Threshold | Stroke/Text Color | Meaning |
|---|---|---|---|
| `low` | `< 40` | `#EF4444` (`red-500`) | High risk / weak fit |
| `moderate` | `40-69` | `#F59E0B` (`amber-500`) | Needs improvement |
| `strong` | `>= 70` | `#22C55E` (`green-500`) | Healthy/strong signal |

Implementation note: all score renderers (UI ring, OG share, lifecycle visuals) must follow the same threshold mapping.

## 4.3 Typography Tokens

| Token | Value | Usage |
|---|---|---|
| `font.family.base` | `Inter, system-ui, sans-serif` | All UI copy |
| `font.weight.regular` | `400` | Body copy |
| `font.weight.medium` | `500` | Labels, metadata |
| `font.weight.semibold` | `600` | Subheads, CTA labels |
| `font.weight.bold` | `700` | Headlines, emphasis |
| `text.h1` | Existing `text-h1` scale | Hero/page primary heading |
| `text.h2` | Existing `text-h2` scale | Section heading |
| `text.body` | Existing `text-body` scale | Main supporting copy |
| `text.caption` | Existing `text-caption` scale | Secondary metadata |
| `text.overline` | Existing `text-overline` scale | Section rails/group labels |

## 4.4 Spacing, Radius, Shadow, Motion

| Token Group | Canonical |
|---|---|
| Page container | `px-4 py-5 sm:py-8` |
| Authenticated page bottom safe area | `pb-24 sm:pb-8` |
| Standard card radius | `rounded-2xl` (or `1rem` primitive) |
| Small card radius | `rounded-xl` |
| Primary CTA min height | `min-h-[48px]` |
| Secondary action min height | `min-h-[44px]` |
| Base surface shadow | Subtle (`0 1px 2px` equivalent) |
| Hover elevation | Soft blue-tinted lift (`surface-hover`/`surface-card-hover`) |
| Entry sequencing | `stagger-children` utilities |
| Token spend feedback | `token-spend-animate` utility |

## 4.5 Layout Tokens

| Context | Canonical Max Width |
|---|---|
| Landing hero | `max-w-4xl` |
| Input-heavy forms | `max-w-xl` |
| App shell pages | `max-w-5xl` |
| Tool pages | `max-w-3xl` |
| Narrow pages | `max-w-2xl` |
| Share pages | `max-w-lg` |

## 5) Primitive Class Contract (Canonical Class Mapping)

`src/app/globals.css` is the style primitive source.

| Component Family | Canonical Classes | Allowed Alias | Notes |
|---|---|---|---|
| Surface | `surface-base`, `surface-hover`, `surface-soft`, `surface-hero` | `surface-card`, `surface-card-hover`, `surface-card-soft`, `surface-card-hero` | Prefer canonical names for new work; aliases allowed for migration |
| CTA | `btn-primary`, `btn-secondary`, `btn-ghost` | N/A | Do not recreate inline button style systems |
| Badge | `ui-badge` + variant (`ui-badge-blue/green/amber/gray`) | N/A | Avoid ad-hoc badge color classes when a variant exists |
| Nav item | `nav-item`, `nav-item-active` | N/A | Keep active state consistent across top/side/bottom navigation |

## 6) Component Usage Matrix

| Component | Required Structure | Approved Token/Classes | Allowed Variants | Prohibited Drift |
|---|---|---|---|---|
| Hero | Badge -> H1 -> one-sentence subtitle -> one primary CTA | `brand.gradient.primary`, `text-h1`, `btn-primary` | Optional trust chips below subtitle | Multi-gradient sections or multiple primary CTAs |
| Card (standard) | Title -> supporting sentence -> action zone | `surface-base` + `surface-hover` or alias pair | Soft/hero surfaces for high-intent blocks only | Mixed random border/radius/shadow patterns |
| Badge | Short label, no paragraph text | `ui-badge` + one variant | Semantic badge by meaning (`green`, `amber`, `blue`, `gray`) | Hand-rolled badge colors for same meaning |
| CTA | One dominant action per viewport state | `btn-primary` (primary), `btn-secondary`/`btn-ghost` (secondary) | Inline text links for tertiary actions | Competing multiple primary buttons |
| Navigation | Stable labels, strong active state, clear route context | `nav-item`, `nav-item-active` + consistent icon sizing | Journey badges (`New`, `In progress`, `Ready`) | Route-specific custom active styling |
| Score State | Score + band + confidence/evidence context where available | Threshold map in section 4.2; Ring + supporting trust chips | Ring sizes: inline/card/hero | Divergent thresholds or inverted color semantics |

## 7) Edge-Case Behavior Rules

- Loading states should preserve final layout skeleton to reduce shift.
- Mobile card action rows must not collide with bottom nav; retain safe-area spacing.
- Long titles truncate in rows; full detail appears in expanded view.
- Secondary actions in result contexts must appear below primary next step.

## 8) Drift-Control Rules

## 8.1 Design Review Gates (Must Pass)

1. Every updated hero/card/badge/CTA/nav/score element maps to a token/class in this document.
2. Score thresholds are unchanged (`<40`, `40-69`, `>=70`) in all user-facing renderers.
3. No new ad-hoc button/badge class family is introduced when canonical primitive exists.
4. Mobile tap target and safe-area rules are met.
5. Each major page state has one unambiguous primary action.

## 8.2 Drift Audit Checklist

- Are gradients only used in high-intent surfaces?
- Are badge colors semantically consistent (same meaning, same variant)?
- Are nav active states visually identical across nav components?
- Are score colors and labels consistent across UI and share/email surfaces?
- Are legacy aliases being reduced in new code?

## 8.3 Exceptions Protocol

If a screen requires deviation:

1. Document reason in PR description.
2. Add temporary exception note in this file under a dated appendix entry.
3. Include rollback path to canonical style.

## 9) Rollout Plan (Uniform Adoption Without Drift)

1. **Governance publish**: adopt this document as required review reference for UI changes.
2. **High-traffic audit**: `/tools`, `/dashboard`, `/mission`, `/history`, `/pricing`.
3. **Family migration sequence**:
   - Navigation
   - CTA
   - Badge
   - Card
   - Score-state
4. **Enforcement**: enable a Cursor rule that points contributors back to this spec and source docs.
5. **Verification cadence**: weekly during migration, bi-weekly after baseline stability.

## 10) Known Drift Hotspots To Prioritize

- Parallel surface naming (`surface-*` vs `surface-card-*`) is still mixed.
- Score threshold logic is not fully unified across all renderers.
- Some components still use direct Tailwind state colors where semantic badge primitives exist.
- Legacy copy/style fragments can reintroduce token naming drift if not reviewed.

## 11) Definition Of Done

This design system is considered stable when:

- New UI changes consistently use approved primitives without new style families.
- Core pages share a visually coherent hierarchy and mission progression cues.
- Persona trust metrics improve (less confusion, faster first action, clearer next steps).
- UI drift findings trend down across consecutive audits.
