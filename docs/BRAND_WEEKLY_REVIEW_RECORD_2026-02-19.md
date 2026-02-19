# Weekly Brand Review - 2026-02-19

First fully filled example weekly review record based on:

- `docs/BRAND_QA_SCORECARD.md`
- `docs/BRAND_METRICS_CADENCE.md`
- `docs/BRANDING_ROLLOUT_COORDINATION.md`

## Snapshot

- Period: 2026-02-12 to 2026-02-18 (UTC)
- Cadence: Weekly
- Date: 2026-02-19
- Owner: Batch Coordinator (Review owner)
- Reviewer: Product Lead (Approval owner)
- Cohort: All signed-out and signed-in web visitors
- Data window: Last complete 7 days
- Data sources:
  - PostHog events (`landing_variant_view`, `landing_analyze`, `signup_complete`, `tool_run`, `tool_complete`)
  - Brand QA checklist sample across landing/auth/pricing/tool shell

## Inputs

- PostHog query references:
  - `weekly_brand_ctr_v1`
  - `weekly_signup_conversion_v1`
  - `weekly_tool_completion_v1`
- Brand QA audit sample:
  - 24 checks executed
  - Surfaces audited: landing, auth, pricing, tool shell, nav labels

## KPI Outcomes

| KPI | Formula | Target | Actual | Threshold band | Status | Trend vs previous |
|---|---|---:|---:|---|---|---|
| Brand CTA CTR | `landing_analyze / landing_variant_view` | 0.12 | 0.131 | Green (`>= 0.12`) | Green | +0.009 |
| Visitor-to-signup conversion | `signup_complete / landing_variant_view` | 0.045 | 0.041 | Yellow (`0.03 - 0.044`) | Yellow | -0.002 |
| Tool completion rate | `tool_complete / tool_run` | 0.70 | 0.742 | Green (`>= 0.70`) | Green | +0.018 |
| Brand consistency score | `passed_checks / total_checks` | 0.95 | 0.958 (23/24) | Green (`>= 0.95`) | Green | +0.021 |

## KPI Calculation Notes

- `landing_variant_view`: 18,460
- `landing_analyze`: 2,418
- `signup_complete`: 757
- `tool_run`: 1,022
- `tool_complete`: 758
- Consistency check: 23 pass / 24 total

## Drift Incidents

| ID | Severity | Description | Impacted surfaces | Opened | Current owner | SLA due | Status |
|---|---|---|---|---|---|---|---|
| BRD-2026-02-14-01 | Sev3 | One pricing support paragraph used non-canonical phrase ("credits") | pricing | 2026-02-14 | Engineering owner (pricing) | 2026-02-21 | In progress |
| BRD-2026-02-16-02 | Sev3 | CTA helper text variant drifted from approved trust-line punctuation | landing | 2026-02-16 | Brand QA owner | 2026-02-23 | Open |

## Corrective Actions

| Action | Owner | Due date | Dependency | Verification method | Status |
|---|---|---|---|---|---|
| Replace non-canonical token term in pricing copy with `tokens` | Engineering owner | 2026-02-20 | None | QA checklist + staging review | In progress |
| Normalize landing trust-line copy to canonical constant | Engineering owner | 2026-02-21 | Copy sign-off | QA checklist + visual regression note | Planned |
| Add pricing and landing lines to next biweekly drift spot-check list | Brand QA owner | 2026-02-21 | None | Biweekly review packet | Planned |

## Decision

- Release decision: **Conditional Pass**
- Rationale:
  - No red KPI.
  - One yellow KPI (visitor-to-signup conversion at 0.041).
  - No Sev1 incidents.
  - Corrective actions are assigned with due dates within 7 days.
- Escalation needed: No
- Escalation path used: None (weekly governance path sufficient)

## Owner Sign-Off

- Review owner: Approved for conditional pass on 2026-02-19
- Approval owner: Approved for conditional pass on 2026-02-19
- Next checkpoint: Weekly review on 2026-02-26

## Ready-to-Run Checklist (Cycle 2)

- [ ] Re-run all three PostHog queries for new 7-day window
- [ ] Recompute KPI table and trend deltas
- [ ] Re-score consistency checklist
- [ ] Update incident statuses and SLA outcomes
- [ ] Re-issue pass / conditional pass / fail decision
