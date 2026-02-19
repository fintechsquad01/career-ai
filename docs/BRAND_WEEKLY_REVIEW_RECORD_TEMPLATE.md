# Weekly Brand Review - {YYYY-MM-DD}

Reusable weekly review template based on:

- `docs/BRAND_QA_SCORECARD.md`
- `docs/BRAND_METRICS_CADENCE.md`
- `docs/BRANDING_ROLLOUT_COORDINATION.md`

## Snapshot

- Period: {YYYY-MM-DD to YYYY-MM-DD} (UTC)
- Cadence: Weekly
- Date: {YYYY-MM-DD}
- Owner: {Review owner}
- Reviewer: {Approval owner}
- Cohort: {all users / signed-in users / segment}
- Data window: {last complete 7 days}
- Data sources:
  - PostHog events (`landing_variant_view`, `landing_analyze`, `signup_complete`, `tool_run`, `tool_complete`)
  - Brand QA checklist sample across landing/auth/pricing/tool shell

## Inputs

- PostHog query references:
  - `{weekly_brand_ctr_query_id}`
  - `{weekly_signup_conversion_query_id}`
  - `{weekly_tool_completion_query_id}`
- Brand QA audit sample:
  - `{total_checks}` checks executed
  - Surfaces audited: `{comma-separated list}`

## KPI Outcomes

| KPI | Formula | Target | Actual | Threshold band | Status | Trend vs previous |
|---|---|---:|---:|---|---|---|
| Brand CTA CTR | `landing_analyze / landing_variant_view` | 0.12 |  | Green (`>= 0.12`), Yellow (`0.08 - 0.119`), Red (`< 0.08`) |  |  |
| Visitor-to-signup conversion | `signup_complete / landing_variant_view` | 0.045 |  | Green (`>= 0.045`), Yellow (`0.03 - 0.044`), Red (`< 0.03`) |  |  |
| Tool completion rate | `tool_complete / tool_run` | 0.70 |  | Green (`>= 0.70`), Yellow (`0.55 - 0.699`), Red (`< 0.55`) |  |  |
| Brand consistency score | `passed_checks / total_checks` | 0.95 |  | Green (`>= 0.95`), Yellow (`0.90 - 0.949`), Red (`< 0.90`) |  |  |

## KPI Calculation Notes

- `landing_variant_view`: {count}
- `landing_analyze`: {count}
- `signup_complete`: {count}
- `tool_run`: {count}
- `tool_complete`: {count}
- Consistency check: {passed}/{total} ({decimal_score})

## Drift Incidents

| ID | Severity | Description | Impacted surfaces | Opened | Current owner | SLA due | Status |
|---|---|---|---|---|---|---|---|
| {BRD-YYYY-MM-DD-01} | {Sev3/Sev2/Sev1} |  |  |  |  |  |  |

## Corrective Actions

| Action | Owner | Due date | Dependency | Verification method | Status |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Decision

- Release decision: **{Pass | Conditional Pass | Fail}**
- Rationale:
  - {No red KPI?}
  - {Yellow KPI count}
  - {Any open Sev1?}
  - {Corrective action ownership and due-date check}
- Escalation needed: {Yes/No}
- Escalation path used: {None / path}

## Owner Sign-Off

- Review owner: {name} approved on {YYYY-MM-DD}
- Approval owner: {name} approved on {YYYY-MM-DD}
- Next checkpoint: Weekly review on {YYYY-MM-DD}

## Ready-to-Run Checklist (Next Cycle)

- [ ] Re-run all three PostHog queries for new 7-day window
- [ ] Recompute KPI table and trend deltas
- [ ] Re-score consistency checklist
- [ ] Update incident statuses and SLA outcomes
- [ ] Re-issue pass / conditional pass / fail decision
