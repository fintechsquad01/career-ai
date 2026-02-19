# Brand QA Scorecard

Operational scorecard for brand measurement governance. Use this in every weekly, biweekly, and monthly review cycle.

## Purpose

- Provide one pass/fail decision system for brand performance and drift.
- Standardize KPI formulas and thresholds so reviews are runnable without ad hoc rules.
- Record incidents, owners, and corrective actions in one place.

## Data Sources

- Product analytics events: `src/lib/analytics.ts` (`EVENTS`)
- Runtime monitoring checks: `docs/CODE_HEALTH_CHECKLIST.md`
- Canonical message standard: `docs/BRAND_MESSAGE_MATRIX.md`
- Brand governance standard: `BRAND_SYSTEM.md`

## KPI Definitions and Thresholds

Measure each KPI for the selected period and cohort.

| KPI | Formula | Green (Pass) | Yellow (Watch) | Red (Fail) | Source of Truth |
|---|---|---:|---:|---:|---|
| Brand CTA CTR | `landing_analyze / landing_variant_view` | `>= 0.12` | `0.08 - 0.119` | `< 0.08` | PostHog events |
| Visitor-to-signup conversion | `signup_complete / landing_variant_view` | `>= 0.045` | `0.03 - 0.044` | `< 0.03` | PostHog events |
| Tool completion rate | `tool_complete / tool_run` | `>= 0.70` | `0.55 - 0.699` | `< 0.55` | PostHog events |
| Brand consistency score | `passed_checks / total_checks` from QA checklist | `>= 0.95` | `0.90 - 0.949` | `< 0.90` | Brand QA review |

## Consistency Score Checklist

Score each item as pass/fail on a representative sample of current live surfaces.

| Check | Pass Criteria |
|---|---|
| Token language | Uses `tokens` in user-facing copy (never `credits` / `points`) |
| Canonical CTA text | Uses approved variants from `src/lib/constants.ts` and message matrix |
| Trust-line compliance | Uses canonical privacy/trust language where required |
| Claim quality | Every non-trivial claim follows `claim -> mechanism -> evidence` |
| Voice posture | Maintains direct, grounded, non-hype tone from `BRAND_SYSTEM.md` |
| Pricing positioning | Uses premium quality + fair value framing (not bargain framing) |
| Mission framing | Reinforces mission-driven workflow vs one-off output framing |
| Surface alignment | Landing, auth, pricing, and tool shell copy are mutually consistent |

Consistency score formula:

`consistency_score = passed_checks / total_checks`

## Release Decision Rules

- `Pass`
  - No red KPIs.
  - Maximum one yellow KPI.
  - No open Sev1 drift incident.
- `Conditional Pass`
  - No more than two yellow KPIs.
  - No Sev1 drift incident.
  - Corrective actions have owners and due dates within 7 days.
- `Fail`
  - Any red KPI, or
  - Any open Sev1 drift incident, or
  - Three or more yellow KPIs in same period.

## Scorecard Template (Fill Every Cycle)

Copy this section into each review record.

```md
### Snapshot
- Period:
- Cadence: Weekly | Biweekly | Monthly
- Date:
- Owner:
- Reviewer:
- Cohort (all users / segment):
- Data window:

### KPI Outcomes
| KPI | Target | Actual | Status (Green/Yellow/Red) | Trend vs previous |
|---|---:|---:|---|---|
| Brand CTA CTR | 0.12 |  |  |  |
| Visitor-to-signup conversion | 0.045 |  |  |  |
| Tool completion rate | 0.70 |  |  |  |
| Brand consistency score | 0.95 |  |  |  |

### Drift Incidents
| Incident | Severity (Sev3/Sev2/Sev1) | Impacted surfaces | Opened | Current owner | Status |
|---|---|---|---|---|---|

### Corrective Actions
| Action | Owner | Due date | Dependency | Verification method | Status |
|---|---|---|---|---|---|

### Release Decision
- Decision: Pass | Conditional Pass | Fail
- Rationale:
- Escalation needed: Yes/No
- Escalation path used (if yes):
```

## Escalation Trigger Summary

Escalate immediately when any of the following occur:

- Brand consistency score is red.
- Visitor-to-signup conversion is red for two consecutive weekly reviews.
- Tool completion rate is red for any period with statistically meaningful traffic.
- Any Sev1 drift incident is open for more than 24 hours.

See `docs/BRAND_METRICS_CADENCE.md` and `docs/BRANDING_ROLLOUT_COORDINATION.md` for full review and escalation workflow.
