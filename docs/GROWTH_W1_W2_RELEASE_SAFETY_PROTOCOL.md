# Growth W1-W2 Release Safety Protocol

Purpose: ensure all sprint work remains non-production-impact until explicit approval.

## Branch Isolation

- Active implementation branch: `feat/growth-content-engine-w1w2`
- Additional workstream branches created from `main`:
  - `feat/growth-llm-authority-w1w2`
  - `feat/growth-experiments-kpi-w1w2`
  - `feat/growth-messaging-alignment-w1w2`

## Non-Production Rules

1. No direct commits to `main`.
2. No merge to `main` without explicit written approval.
3. No production deploy from any growth sprint branch.
4. Keep rollout-impacting work in draft review state until KPI/guardrail review passes.
5. Apply staged rollout model only after explicit go-ahead.

## Required Pre-Merge Checks

- Issue scope is complete and acceptance criteria met.
- KPI and guardrail impact is documented.
- Trust/copy compliance checks are passed.
- Owner signs off on rollout stage and fallback plan.

## Deployment Control Statement

This sprint artifacts pack is documentation and planning output only.  
No runtime behavior, routing, pricing logic, or production flags are changed in this sprint.
