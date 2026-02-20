# Wave 5.2 KPI + Guardrail Scorecard

Version: 1.0  
Owner: Growth + Product + Analytics  
Created: 2026-02-20

## Purpose

Define the minimum measurement pack for Wave 5.2 rollout-stage decisions.

References:

- `docs/WAVE5_2_UX_FLOW_EXECUTION_CHECKLIST_2026-02-20.md`
- `docs/GROWTH_ROLLOUT_KPI_GUARDRAILS.md`

## Primary KPIs (Wave 5.2)

1. Time to first action (target down)
2. Dashboard recommendation -> tool completion rate (target up)
3. Mission continuation clicks from tool results/history (target up)
4. Pricing conversion guardrail (no material regression)

## Guardrails

Pause/rollback if threshold breach persists across two consecutive windows:

- D7 retention drop > 8%
- Complaint/dispute rate increase > 20%
- Mission completion drop > 10%
- Bounce-rate increase > 15% on changed entry pages

## Event Inventory (current implementation)

### Availability confirmed

- `dashboard_next_action_viewed`
- `dashboard_next_action_clicked`
- `dashboard_resume_mission_clicked`
- `history_continue_mission_clicked`
- `tool_run`
- `tool_complete`
- `safari_storage_fallback`

### Defined but currently weak/partial usage

- `paywall_shown`
- `token_purchase`

Use checkout success and page-level conversions as backup signals until direct purchase instrumentation is fully normalized.

## Rollout Window Table

| Window | Stage | Start | End | Primary KPI trend | Guardrail status | Decision |
|---|---|---|---|---|---|---|
| W0 | Internal validation | 2026-02-20 | 2026-02-20 | Baseline capture complete | Stable | Promote to controlled-prep |
| W1 | Controlled exposure | TBD | TBD | TBD | TBD | TBD |
| W2 | Controlled exposure follow-up | TBD | TBD | TBD | TBD | TBD |
| W3 | Full exposure | TBD | TBD | TBD | TBD | TBD |

## Minimum Query Set

1. **Time to first action**
   - Cohort: first pageview in session on Wave 5.2 surfaces.
   - End event: first qualifying action (`dashboard_next_action_clicked`, `tool_run`, or `history_continue_mission_clicked`).
2. **Recommendation to completion**
   - Numerator: sessions with `tool_complete` after dashboard recommendation click.
   - Denominator: sessions with `dashboard_next_action_clicked`.
3. **Mission continuation**
   - Events: `dashboard_resume_mission_clicked`, `history_continue_mission_clicked`.
4. **Pricing guardrail**
   - Checkout start/success funnel and conversion rate by window.

## Decision Checklist (per stage promotion)

- [ ] Primary KPI(s) improved or stable in expected direction
- [ ] No guardrail breaches over two windows
- [ ] Data quality checks completed (event volume sanity + no instrumentation outage)
- [ ] Rollout decision and rationale logged in decision log

