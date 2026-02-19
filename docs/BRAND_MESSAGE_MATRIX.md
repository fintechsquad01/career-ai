# Brand Message Matrix

Cross-surface canonical copy map for critical user-facing messaging across landing, pricing, and tool shell.

## Canonical Source

All critical phrases below are sourced from `src/lib/constants.ts` via `CANONICAL_COPY` and shared helpers (`formatTokenAmountLabel`).

## Matrix

| Critical Message | Approved Canonical Copy | Canonical Source | Where Used | Current Variants Found | Decision | Status |
|---|---|---|---|---|---|---|
| Signup CTA label | `Create Account — 15 Free Tokens` | `CANONICAL_COPY.signup.cta` | `src/components/landing/InlineSignup.tsx`, `src/components/landing/JobResults.tsx`, `src/components/landing/XrayResults.tsx`, `src/components/landing/LandingContent.tsx` | `Create Account — 15 Free Tokens`, `15 free tokens` in surrounding prose | Keep one canonical CTA string and consume shared constant in all CTA buttons | normalized |
| Token unit label | `tokens` | `CANONICAL_COPY.tokens.unit` | `src/app/pricing/page.tsx`, `src/components/tools/ToolShell.tsx` (via `formatTokenAmountLabel`) | `tok`, `tokens` | Remove `tok` abbreviation in requested surfaces and enforce full term | normalized |
| Token amount badge format | `Free` or `{n} tokens` | `formatTokenAmountLabel()` | `src/app/pricing/page.tsx`, `src/components/tools/ToolShell.tsx` | Ad-hoc inline label logic in multiple components | Standardize with helper to avoid drift and keep one output format | normalized |
| Daily free-token message | `Log in daily for 2 free tokens. Save up and run tools for free.` | `CANONICAL_COPY.tokens.dailyFreeMessage` | `src/app/pricing/page.tsx` | Same concept phrased differently in other app surfaces (outside this scoped change) | Use one approved sentence in scoped file; track broader harmonization separately | normalized |
| Token rate suffix | `/token` | `CANONICAL_COPY.tokens.rateSuffix` | `src/app/pricing/page.tsx` | `/tok`, `/token` | Canonicalize rate suffix to `/token` | normalized |
| Privacy trust line | `Encrypted · Never sold · 30 second analysis` | `CANONICAL_COPY.privacy.trustLine` | `src/components/landing/SmartInput.tsx`, `src/components/landing/HeroSection.tsx` | Split-badge form and single-line form | Keep one canonical phrase and render it consistently | normalized |
| Free analysis primary CTA | `Get Your Free AI Risk Score` | `CANONICAL_COPY.cta.freeAnalysisPrimary` | `src/components/landing/HeroSection.tsx`, `src/components/landing/LandingContent.tsx` | `Analyze Free`, `Analyze My AI Risk — Free`, `Try It Free`, `Get Your Free AI Risk Score` | Select one approved primary CTA and replace competing variants in scoped landing surfaces | normalized |

## Notes on Conflicts and Scope

- This matrix enforces canonical copy in the requested files:
  - `src/lib/constants.ts`
  - `src/components/landing/*`
  - `src/app/pricing/page.tsx`
  - `src/components/tools/ToolShell.tsx`
- Adjacent non-scoped surfaces still contain message drift (for example `daily credits` phrasing in metadata/legal text). Those are follow-up items and not part of this scoped normalization.

## Acceptance Check

- No critical message listed above has more than one approved canonical variant.
- Requested surfaces now consume canonical copy from one source (`src/lib/constants.ts`) instead of competing inline strings.
