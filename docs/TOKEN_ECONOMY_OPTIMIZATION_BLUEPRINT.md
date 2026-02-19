# Token Economy Optimization Blueprint

Version: 1.0  
Owner: Growth + Product + Content  
Last updated: 2026-02-20  
Review cadence: Monthly

Purpose: Optimize token economy for conversion, trust, and long-term monetization efficiency.

## 1) Token Economy Objectives

- Keep entry friction low
- Keep mission continuity high
- Keep unit economics healthy
- Keep pricing perceived as fair and transparent

## 2) Economic Model Components

- Acquisition tokens: signup and daily free tokens
- Consumption tokens: tool-run costs
- Recovery mechanics: top-ups and pack purchases
- Expansion mechanics: larger packs and lifetime upgrade paths

## 3) Mission-Based Token Modeling

## Track A (job mission)

Representative flow:

- JD Match
- Resume
- Cover Letter
- Interview
- Salary

Use this flow as baseline mission cost model for pricing communication and recommendation logic.

## Track B (income resilience)

Representative flow:

- LinkedIn
- Entrepreneurship
- Roadmap

Model separately to avoid overfitting pricing to only job-application behavior.

## 4) Top-Up Policy

Default policy: top-ups enabled for all insufficient-balance moments.

Design constraints:

- Offer instant top-up for shortfall rescue
- Show larger pack alternative with explicit value comparison
- Prevent cannibalization by setting minimum top-up and better per-token large-pack rates

## 5) Anti-Friction Controls

- Keep users in the same context after purchase
- Preserve mission state during paywall and checkout
- Preselect best-fit option by shortfall and behavior
- Use clear token math (`you have X, need Y, short by Z`)

## 6) Fairness and Trust Controls

- No token charge for failed or incomplete runs
- Explicit safety messaging at payment points
- Transparent pricing math and token usage per tool
- No hidden recurring billing in pay-per-use flow

## 7) Margin Protection Controls

- Maintain clear token rate delta between packs
- Track low-margin behavior by cohort
- Monitor top-up overuse patterns
- Route high-frequency top-up users to value packs/lifetime

## 8) Abuse Prevention Heuristics

- Detect repeated rapid low-value top-up attempts
- Detect suspicious high-volume consumption anomalies
- Apply temporary friction only when risk thresholds are exceeded
- Preserve experience for normal users

## 9) Recommendation Engine Inputs (For Offer Selection)

- Balance and shortfall
- Last 30-day spend and purchase count
- Mission stage depth
- Tool category mix (Track A vs Track B)
- Lifetime eligibility signals

## 10) Optimization Metrics

Economic:

- ARPPU
- gross revenue per active user
- token-to-revenue efficiency

Behavior:

- paywall conversion
- in-session continuation rate after paywall
- missions completed per paying user

Quality/trust:

- dispute rate
- repeat purchase retention
- support tickets tied to token confusion

## 11) KPI Targets (Initial Operating Baselines)

Set and refine per traffic scale, but start with:

- Paywall conversion: +10-20% lift with top-up enabled
- In-session continuation after paywall: >= 65%
- Repeat purchase (30 days): >= 25%
- Mission completion after first purchase: >= 40%

Guardrails:

- No >8% D7 retention decline
- No >20% dispute-rate increase

## 12) Quarterly Optimization Cycle

1. Recalculate mission token baselines
2. Rebalance offer logic bands if needed
3. Refresh pricing copy and value anchors
4. Re-test top-up prominence and lifetime timing
5. Update playbooks and rules with winners
