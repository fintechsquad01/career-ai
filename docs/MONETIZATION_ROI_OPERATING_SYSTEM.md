# Monetization ROI Operating System

Version: 1.0  
Owner: Growth + Product + Content  
Last updated: 2026-02-20  
Review cadence: Monthly

Goal: Maximize revenue per active user while preserving trust and mission continuity.

## 1) Monetization Principles

- Monetize around mission completion, not arbitrary upsell pressure.
- Reduce interruption cost at the exact moment of intent.
- Pair every price anchor with capability/value explanation.
- Keep fairness and trust visible: tokens are safe on failures.
- Avoid subscription fatigue by defaulting to pay-per-use logic.

## 2) Offer Architecture

Core layers:

1. Free hook (`displacement`) for risk awareness and trust entry
2. Pay-per-use pack purchases for immediate progression
3. Top-ups for shortfall rescue in-session
4. Lifetime as high-intent, long-horizon value tier

## 3) Top-Up Strategy (Default: Enabled)

Top-ups should be enabled by default.

Why:

- Prevents mission abandonment due to small shortfalls
- Converts high intent users at the decision moment
- Works with subscription-fatigue preference for flexibility

Guardrails:

- Keep a minimum top-up size to avoid tiny payment friction
- Show "better value" larger pack side-by-side
- If top-up frequency crosses threshold, surface upgrade/lifetime

## 4) Paywall Decision Tree

### Inputs

- `balance`
- `required_tokens`
- `shortfall`
- recent purchases (30 days)
- mission stage (early, mid, near-complete)

### Output priority

1. Top-up and continue (default for low shortfall)
2. Best-value larger pack (default for mid/high shortfall)
3. Lifetime recommendation (high spend/high frequency users)

### Suggested logic bands

- Shortfall `<= 8`: top-up first, larger pack second
- Shortfall `9-25`: larger pack first, top-up second
- Shortfall `> 25`: larger pack + lifetime context
- Frequent payer (`>= 3 purchases / 30d`): include lifetime prominent card

## 5) Lifecycle Monetization Triggers

### New users (first 72h)

- Objective: first paid conversion
- Trigger: attempts paid tool with insufficient tokens
- Message: "continue this mission now" and "no subscription required"

### Active users

- Objective: increase mission depth and repeat spend
- Trigger: successful result and recommended next tool
- Message: bundle by workflow, not isolated tool purchase

### Reactivated users

- Objective: resume momentum quickly
- Trigger: first session after inactivity
- Message: "continue where you left off" + right-sized offer

### Power users

- Objective: shift to high-LTV plan
- Trigger: high token velocity + frequent purchases
- Message: lifetime break-even and refill predictability

## 6) ROI Opportunity Ladder

1. Improve paywall conversion with mission framing
2. Reduce drop-off with top-up option
3. Increase AOV with value-anchored larger pack
4. Increase LTV with lifetime migration
5. Improve retention via mission continuation prompts

## 7) Experimentation Framework

Run weekly experiments with one primary metric and one guardrail.

Priority tests:

1. Mission-framed paywall copy vs transactional copy
2. Top-up visible by default vs hidden behind "more options"
3. Price-first cards vs mission-outcome-first cards

Success requires:

- Primary metric lift
- No trust/retention regression beyond guardrail thresholds

## 8) KPI System

Primary:

- Free -> paid conversion rate
- Paywall conversion rate
- ARPPU and blended ARPU
- 30-day repeat purchase rate

Secondary:

- Token velocity per active user
- Mission completion rate
- D7/D30 retention for payers
- Lifetime conversion rate

Trust guardrails:

- Complaint/refund signals
- Failed-output token dispute rate
- Drop in result engagement quality

## 9) Rollback Rules

Rollback an experiment if any guardrail is breached for two consecutive measurement windows:

- D7 retention down > 8%
- Complaint/dispute rate up > 20%
- Mission completion down > 10%

## 10) Weekly Operating Rhythm

- Monday: pick 1-2 experiments and hypotheses
- Wednesday: midpoint quality + guardrail checks
- Friday: decision (ship, iterate, rollback)
- End of week: template and playbook update
