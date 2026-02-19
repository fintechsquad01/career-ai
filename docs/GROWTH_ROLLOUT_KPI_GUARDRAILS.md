# Growth Rollout KPI Guardrails

Version: 1.0  
Owner: Growth + Product + Content  
Last updated: 2026-02-20  
Review cadence: Monthly

Purpose: Standardize rollout phases, KPI targets, and risk guardrails for content and monetization optimization.

## 1) Rollout Model

Use staged rollout for major copy, pricing, paywall, and template changes:

1. Internal validation
2. 10% audience exposure
3. 25% audience exposure
4. 50% audience exposure
5. 100% rollout for winning variants

Do not skip stages for high-impact monetization changes.

## 2) Operating Cadence

### Weekly

- Launch 1-2 experiments
- Ship 1 major content asset and 1-2 support assets
- Review KPI movement + guardrails
- Decide ship/iterate/rollback

### Biweekly

- Refresh pricing and paywall copy based on shortfall behavior
- Review cohort-level token economy performance

### Monthly

- Re-score top pages for intent fit and AI-search readiness
- Refresh decaying pages and stale stats
- Consolidate learnings into templates and rules

### Quarterly

- Re-map persona pain and keyword opportunities
- Rebalance monetization trigger logic and thresholds
- Audit rule compliance and copy drift

## 3) KPI Framework

### Content KPIs

- Organic sessions (non-brand)
- CTR from SERP/AI-overview surfaces
- Content-to-tool click-through
- Content-assisted signup conversion

### Monetization KPIs

- Free-to-paid conversion
- Paywall conversion
- ARPPU
- 30-day repeat purchase rate
- Mission completion rate after purchase
- Lifetime conversion rate (eligible segment)

### Retention and Trust KPIs

- D7 and D30 retention
- Token dispute/complaint rate
- Failed-run dissatisfaction signal
- Bounce rate changes on key acquisition pages

## 4) Initial Target Thresholds

Use these as initial operating targets and refine with baseline data:

- Paywall conversion uplift target: +10% to +20%
- In-session continuation after paywall: >= 65%
- Repeat purchase in 30 days: >= 25%
- Mission completion after first purchase: >= 40%
- Content-to-tool CTR: >= 6% on high-intent pages

## 5) Guardrail Thresholds

Pause or rollback if any of the following persists across two consecutive windows:

- D7 retention drops > 8%
- Complaint/dispute rate increases > 20%
- Mission completion falls > 10%
- Bounce rate increases > 15% on changed entry pages

## 6) Decision Rules

### Ship

- Primary KPI improved and guardrails remain stable

### Iterate

- Mixed signal or partial win without guardrail breach

### Rollback

- Guardrail breach or trust degradation signal

## 7) Experiment Hygiene Requirements

Every experiment must include:

- clear hypothesis
- audience definition
- primary KPI + guardrail KPI
- planned runtime
- minimum detectable effect assumption
- documented decision and learning

## 8) Governance and Ownership

- Growth Lead: experiment priority and final decision
- Content Lead: message quality and intent fit
- Product/Monetization Lead: token and pricing logic impact
- Analytics Owner: measurement integrity and dashboard confidence

## 9) Reference Set

- `docs/GROWTH_MEMORY_OPERATING_SYSTEM.md`
- `docs/AI_SEARCH_COPY_PLAYBOOK.md`
- `docs/MONETIZATION_ROI_OPERATING_SYSTEM.md`
- `docs/TOKEN_ECONOMY_OPTIMIZATION_BLUEPRINT.md`
- `docs/GROWTH_EXPERIMENT_RUN_LOG_TEMPLATE.md`
