# Branding Rollout Coordination (A/B/C/D)

This document is the operational gate for branding rollout work.

## Dependency Order

- Merge `A` first.
- Rebase `B` and `C` onto merged `A`.
- Merge `B` and `C` (parallel allowed after rebase).
- Start and merge `D` only after both `B` and `C` are merged.

### Canonical Dependency Map

This map must match `.github/branding-rollout/ownership.json` `requiresMerged`.

- `A`: no prerequisites
- `B`: requires `A`
- `C`: requires `A`
- `D`: requires both `B` and `C`

## Ownership Boundaries

Canonical ownership lives in `.github/branding-rollout/ownership.json`.

- **Batch A**: `src/app/globals.css`, `src/lib/constants.ts`, `docs/MAGIC_UI_WORKFLOW.md`
- **Batch B**: `src/components/landing/HeroSection.tsx`, `src/components/landing/LandingContent.tsx`, `src/components/landing/SmartInput.tsx`
- **Batch C**: `src/app/auth/page.tsx`, `src/app/pricing/page.tsx`
- **Batch D**: post-B/C harmonization only in approved surfaces (`landing`, `auth`, `pricing`, `layout/nav`, `dashboard`), no net-new primitive model

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

## Brand Measurement and Governance

Use these docs as the operating system for KPI governance:

- `docs/BRAND_QA_SCORECARD.md` (KPI formulas, thresholds, release decision rubric)
- `docs/BRAND_METRICS_CADENCE.md` (weekly/biweekly/monthly review rituals)

Required KPI set for governance gate:

- Brand CTA CTR
- Visitor-to-signup conversion
- Tool completion rate
- Brand consistency score

Batch or release pass/fail decisions must use the scorecard thresholds and decision rules. Ad hoc criteria are not allowed.

## Coordinator Runbook (Merge-State Truthfulness)

- Keep `.github/branding-rollout/merge-state.json` as the source of truth for merged batches.
- Only the currently targeted batch key may change in a batch PR.
- Valid change pattern is exactly one key flip: `false` -> `true` for that batch.
- Never pre-mark future batches as merged.
- If a PR is not the batch completion PR, `merge-state.json` should not be modified.

### Terminal State Behavior (All Batches Merged)

Current terminal state:

- `A=true`, `B=true`, `C=true`, `D=true`

CI gate behavior in this state (from `scripts/branding/validate-rollout.mjs` and `.github/workflows/branding-rollout-gate.yml`):

- The gate still runs for PRs labeled `branding-rollout`.
- A branded batch completion PR must change exactly one merge-state key for its batch from `false` -> `true`.
- Because all keys are already `true`, no additional batch-completion PR can satisfy that rule without first reopening state intentionally.
- Any future branded PR that is not reopening/redoing the rollout should avoid the `branding-rollout` label so this completion gate is not invoked unnecessarily.

## Ownership Model (RACI)

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| KPI data pull and validation | Analytics owner | Approval owner | Review owner | Engineering owner |
| Weekly scorecard maintenance | Review owner | Approval owner | Analytics owner, Brand QA owner | Engineering owner |
| Consistency audit and drift detection | Brand QA owner | Review owner | Approval owner | Engineering owner |
| Mitigation implementation | Engineering owner | Review owner | Brand QA owner | Approval owner |
| Pass/fail release decision | Review owner | Approval owner | Analytics owner, Brand QA owner, Engineering owner | Wider team |
| Escalation command | Review owner | Approval owner | Product lead, Engineering lead | Wider team |

Default role mapping when no explicit assignee is named in a PR:

- Review owner: batch coordinator
- Approval owner: product lead
- Analytics owner: analytics/on-call engineer
- Brand QA owner: designated copy/brand reviewer
- Engineering owner: feature owner of impacted surface

## Drift Severity and SLA Matrix

| Severity | Trigger | First response SLA | Resolution SLA | Escalation |
|---|---|---|---|---|
| Sev3 | Single-surface copy inconsistency, low KPI impact | 2 business days | 7 days | Review owner -> Engineering owner |
| Sev2 | Multi-surface drift or repeated yellow KPI in one cadence | 1 business day | 5 days | Review owner -> Approval owner |
| Sev1 | Red consistency score, severe claim violation, or sustained red KPI | 4 hours | 24-72 hours | Review owner -> Approval owner -> Product lead + Eng lead |

## Escalation Workflow (No Ad Hoc Decisions)

1. Detect drift via scorecard or QA audit.
2. Classify severity using matrix above.
3. Assign owner and SLA in the review record.
4. Ship mitigation and document changed surfaces.
5. Re-measure impacted KPIs against thresholds.
6. Close incident only if threshold status is pass/watch as allowed by scorecard rules.
7. Escalate one level if SLA is missed or KPI remains red.

## Final Regression Checklist (Before D Merge)

- landing
- pricing
- dashboard/nav
- tool run input/loading/result
- mobile nav and spacing

Attach evidence (notes/screenshots) in the batch PR before merge.

Measurement governance evidence must also be attached:

- Latest completed scorecard (`docs/BRAND_QA_SCORECARD.md` template output)
- Latest cadence review output (`docs/BRAND_METRICS_CADENCE.md` template output)
- Any open incidents with owners, severities, and due dates
