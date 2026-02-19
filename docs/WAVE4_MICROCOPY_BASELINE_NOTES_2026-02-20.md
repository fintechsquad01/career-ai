# Wave 4 Microcopy Baseline Notes

Date: 2026-02-20  
Scope: Full-app user-facing microcopy normalization

## Baseline Inventory

## Governance + constraints references

- `docs/GROWTH_START_HERE.md`
- `docs/GROWTH_MEMORY_OPERATING_SYSTEM.md`
- `docs/AI_SEARCH_COPY_PLAYBOOK.md`
- `docs/MONETIZATION_ROI_OPERATING_SYSTEM.md`

## Key copy surfaces queued for change

- Top funnel: landing/auth/signup (`src/components/landing/*`, `src/app/auth/page.tsx`)
- In-app continuity: nav/sidebar/bottom nav/dashboard/mission/history/share/error states
- Monetization: pricing/paywall/toolshell/lifetime/token badge
- Canonical source: `src/lib/constants.ts` + matrix alignment in `docs/BRAND_MESSAGE_MATRIX.md`

## Drift and risk observations before edits

1. CTA drift exists between canonical signup text and context-specific variants (`Get Started — Free`, `Unlock Results — Free`, `Create Free Account — 15 Tokens`).
2. Trust messaging is mostly aligned but not uniformly phrased across auth and tool flows.
3. Paywall + pricing copy is strong but can be more explicit for mission continuation and shortfall math.
4. `Mission` label still appears in at least one quick-access surface while broader nav uses `Mission Control`.
5. Internal analytics naming includes `daily_credits_*` in event constants; this is not user-facing and remains unchanged in Wave 4 to avoid telemetry contract churn.

## Phase sequencing lock

- W4-00 baseline complete only after this inventory is captured.
- W4-10 onward will remain copy-only unless required for safe canonical reuse.
- No data contracts, token spending behavior, or backend prompt outputs will be modified.
