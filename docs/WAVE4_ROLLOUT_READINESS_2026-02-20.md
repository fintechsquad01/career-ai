# Wave 4 Rollout Readiness

Date: 2026-02-20  
Owner: Product + Growth + Engineering  
Scope: Full-app microcopy normalization (Wave 4)

## Rollout Stages

1. Internal QA complete (engineering + product copy review)
2. Flagged exposure at 50% cohort
3. 100% rollout after guardrails hold for the measurement window

## KPI Success Gates

- Paywall conversion: non-negative trend, target +5% to +10% directional lift
- Pricing CTA CTR: non-negative vs baseline
- Mission continuation rate from paywall: non-negative or improved
- Support/friction: no material spike in complaints, disputes, or confused billing tickets

## Guardrail Triggers (Rollback)

Rollback to prior copy set if either condition is observed across two consecutive windows:

- Trust/regression signal breach per `docs/GROWTH_ROLLOUT_KPI_GUARDRAILS.md`
- Severe copy regression in production (wrong token term, contradictory offer text, broken CTA routing)

## Rollback Plan

- Revert Wave 4 copy commits in reverse order
- Clear any staged copy experiments tied to Wave 4 labels
- Re-run smoke QA on landing/auth/pricing/paywall/dashboard/mission/history

## Validation Evidence

- `npm run typecheck` passed after Wave 4 edits
- `npm run lint` still reports existing repo-wide issues unrelated to changed files
- `ReadLints` reports no linter issues in Wave 4 touched files
- Browser snapshots verified updated copy on:
  - `/` (landing trust + CTA consistency)
  - `/auth` (signup trust + CTA consistency)
  - `/pricing` (mission-first monetization framing)
  - `/dashboard`, `/mission`, `/history` (continuity and navigation language)

## Notes

- This wave is copy-only; no backend contracts, token logic, or event names were changed.
- Remaining optional cleanup candidates (outside Wave 4 file scope) include legacy `tok` abbreviation in older quick-apply surfaces.
