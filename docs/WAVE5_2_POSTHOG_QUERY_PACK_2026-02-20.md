# Wave 5.2 PostHog Query Pack

Version: 1.0  
Owner: Analytics + Growth  
Created: 2026-02-20

## Purpose

Ready-to-create query list for Wave 5.2 rollout monitoring:

- UX continuity funnel health
- Pricing/paywall guardrail health
- Safari storage fallback diagnostics

## Query 1 — Dashboard Recommendation Funnel

- Name: `W52 - Dashboard recommendation to tool completion`
- Type: Funnel
- Steps:
  1. `dashboard_next_action_viewed`
  2. `dashboard_next_action_clicked`
  3. `tool_run`
  4. `tool_complete`
- Breakdown:
  - `tool_id`
  - `route` (if available)
- Window: 7d rolling

## Query 2 — Mission Continuation Entrypoints

- Name: `W52 - Mission continuation clicks by source`
- Type: Trends
- Events:
  - `dashboard_resume_mission_clicked`
  - `history_continue_mission_clicked`
- Breakdown:
  - source route (`/dashboard` vs `/history` where present)
- Window: daily + 7d moving average

## Query 3 — Pricing Conversion Guardrail

- Name: `W52 - Pricing conversion guardrail`
- Type: Funnel / Trends combo
- Suggested funnel steps:
  1. Pricing page view (`$pageview` filtered to `/pricing`)
  2. Checkout initiation event (or API success proxy)
  3. Purchase success event (or payment success redirect proxy)
- Guardrail view:
  - Conversion rate by rollout window
  - Compare controlled vs baseline cohorts

## Query 4 — Paywall Exposure and Exit

- Name: `W52 - Paywall show to checkout intent`
- Type: Funnel
- Steps:
  1. `paywall_shown` (when present)
  2. checkout initiation
- Breakdown:
  - `tool_id`
  - `required_tokens` / shortfall bucket
- Note:
  - If `paywall_shown` volume is low/absent, use fallback proxy: tool run attempts with insufficient tokens.

## Query 5 — Safari Fallback Diagnostics

- Name: `W52 - Safari storage fallback trend`
- Type: Trends
- Event: `safari_storage_fallback`
- Breakdown:
  - `storage_kind`
  - `operation`
  - `reason`
  - `key`
- Filter:
  - `browser = safari`
- Purpose:
  - Ensure diagnostics are visible without user disruption.

## Query 6 — Trust Framing Regression Watch

- Name: `W52 - Score-flow trust regression watch`
- Type: Trends / Insight board
- Signals:
  - abrupt drops in result completion
  - increases in error events on score surfaces
  - decreases in continuation events after result pages
- Purpose:
  - Early warning for verdict/confidence/evidence framing regressions.

## Dashboard Layout Recommendation

1. Top row: Query 1, Query 2, Query 3
2. Mid row: Query 4, Query 5
3. Bottom row: Query 6 + notes card for current rollout decision

## Operating Notes

- Annotate rollout stage changes directly on dashboard timeline.
- Store weekly screenshots in team notes for auditability.
- Treat any two-window guardrail breach as automatic hold/rollback candidate.

