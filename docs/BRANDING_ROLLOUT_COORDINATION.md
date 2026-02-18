# Branding Rollout Coordination (A/B/C/D)

This document is the operational gate for branding rollout work.

## Dependency Order

- Merge `A` first.
- Rebase `B` and `C` onto merged `A`.
- Merge `B` and `C` (parallel allowed after rebase).
- Start and merge `D` only after both `B` and `C` are merged.

## Ownership Boundaries

Canonical ownership lives in `.github/branding-rollout/ownership.json`.

- **Batch A**: `src/app/globals.css`, `src/lib/constants.ts`, `docs/MAGIC_UI_WORKFLOW.md`
- **Batch B**: `src/components/landing/HeroSection.tsx`, `src/components/landing/LandingContent.tsx`, `src/components/landing/SmartInput.tsx`
- **Batch C**: `src/app/auth/page.tsx`, `src/app/pricing/page.tsx`
- **Batch D**: post-B/C harmonization only (no net-new primitive model)

PRs that touch files outside their batch scope are blocked unless explicitly approved by the coordinator.

## Required Batch Report (PR Description)

Every batch PR must include all four sections:

1. `Changed files` (exact list + why each file is in scope)
2. `What/why` (intent and rationale)
3. `Verification status` (pass/fail with notes)
4. `Risks` (known residual risks and mitigation/rollback notes)

## Merge and Release Gates

The gate workflow checks all of the following:

- Scope ownership matches declared batch.
- Merge order dependency is satisfied using `.github/branding-rollout/merge-state.json`.
- Primitive consistency is preserved in touched files.
- Canonical token language and core messaging constraints are preserved.
- PR report sections are present.
- Lint is clean for touched TS/TSX files, or failures are documented and fixed.

## Final Regression Checklist (Before D Merge)

- landing
- pricing
- dashboard/nav
- tool run input/loading/result
- mobile nav and spacing

Attach evidence (notes/screenshots) in the batch PR before merge.
