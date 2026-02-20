# Growth PR Review Decision Sheet (W1-W2)

Purpose: one-pass reviewer checklist for growth draft PRs, with clear pass/fail gates.

## Global Release Gate (Applies to All PRs)

- [ ] PR remains Draft until all four pass.
- [ ] Scope is documentation-only (no runtime or routing changes).
- [ ] No merge/deploy action is taken.
- [ ] Rollout state changes require explicit written approval.

## PR #29 Decision Sheet (Content Engine)

PR: `https://github.com/fintechsquad01/career-ai/pull/29`

### Pass/Fail Criteria

- [ ] Content board includes persona + funnel + intent mapping.
- [ ] Throughput aligns to 1 major + 2 support assets per week.
- [ ] Draft assets use answer-first intros and query-style headings.
- [ ] FAQ and CTA coverage are present where required.
- [ ] Internal linking targets are defined.

Decision:
- [ ] Pass
- [ ] Needs revision

Revision notes:
- _Add notes here_

## PR #30 Decision Sheet (LLM/Search Authority)

PR: `https://github.com/fintechsquad01/career-ai/pull/30`

### Pass/Fail Criteria

- [ ] Off-site tracker includes owner, cadence, and status fields.
- [ ] Reddit + directory execution steps are concrete and actionable.
- [ ] Original research brief is publication/outreach ready.
- [ ] Authority workflow is aligned to AI citation goals.

Decision:
- [ ] Pass
- [ ] Needs revision

Revision notes:
- _Add notes here_

## PR #31 Decision Sheet (Experiments + KPI Guardrails)

PR: `https://github.com/fintechsquad01/career-ai/pull/31`

### Pass/Fail Criteria

- [ ] Two experiments include clear hypotheses and expected lifts.
- [ ] Primary KPI and guardrail KPIs are measurable.
- [ ] Rollback conditions are explicit.
- [ ] 7/14/30-day checkpoints are defined.
- [ ] Decision paths (ship/iterate/rollback) are usable by operators.

Decision:
- [ ] Pass
- [ ] Needs revision

Revision notes:
- _Add notes here_

## PR #32 Decision Sheet (Messaging Alignment + Safety)

PR: `https://github.com/fintechsquad01/career-ai/pull/32`

### Pass/Fail Criteria

- [ ] Canonical terms are enforced (`AISkillScore`, `tokens`).
- [ ] No-overclaim and trust posture checks are explicit.
- [ ] Pricing/paywall recommendations are non-invasive and transparent.
- [ ] Safety protocol clearly prevents accidental live impact.

Decision:
- [ ] Pass
- [ ] Needs revision

Revision notes:
- _Add notes here_

## Final Approval Block

- [ ] All PRs marked Pass
- [ ] All revision notes resolved
- [ ] Explicit approval received to move any PR from Draft

Approver:
- Name:
- Date:
