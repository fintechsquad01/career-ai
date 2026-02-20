# Growth W1-W2 Experiment Run Log

Owner: Growth + Product + Analytics  
Template source: `docs/GROWTH_EXPERIMENT_RUN_LOG_TEMPLATE.md`  
Branch: `feat/growth-content-engine-w1w2`

---

## Experiment ID

- ID: EXP-W1-CTR-QUERY-FIRST-001
- Date started: 2026-02-20
- Owner: Growth
- Surface: guide content
- Persona focus: Recent Graduate / Early Career

## Hypothesis

- If we change: intro structure from generic context-led to answer-first (40-60 words) + query-style H2 blocks
- We expect: higher SERP/AI-overview CTR and stronger content-to-tool click-through
- Because: users and answer engines prioritize immediate intent satisfaction and scannable structure

## Variant Design

- Control: legacy intro/heading format
- Variant A: answer-first intro + query-style H2/H3 + FAQ + explicit section CTAs
- Variant B (optional): N/A
- Primary metric: SERP/AI-overview CTR
- Guardrail metric(s): bounce rate on changed entry page, D7 retention for visitors who sign up via content
- Success threshold: +12% CTR lift with no guardrail breach

## Audience + Allocation

- Segment: non-brand organic traffic to target guide URLs
- Traffic source: Google + AI search referral surfaces
- Allocation split: 50/50 by URL bucket
- Estimated runtime: 14 days

## Instrumentation

- Events tracked: page_view, content_cta_click, tool_entry_click, signup_complete
- Dashboard/report link: growth dashboard (to attach)
- Data quality checks completed: Yes

## Interim Check (midpoint)

- Primary metric trend: pending
- Guardrail trend: pending
- Any anomalies: pending
- Action: continue until minimum sample threshold

## Final Results

- Control performance: pending
- Variant performance: pending
- Relative lift: pending
- Confidence level: pending
- Winner: pending

## Decision

- [ ] Ship winner
- [ ] Iterate and rerun
- [ ] Rollback

## Learnings

- What worked: pending
- What failed: pending
- Unexpected signal: pending
- Updated guidance for future runs: pending

## Follow-ups

- [ ] Update playbook
- [ ] Update prompt template
- [ ] Add to weekly review deck

## Review Checkpoints

- 7-day review: 2026-02-27
- 14-day review: 2026-03-06
- 30-day review: 2026-03-22

---

## Experiment ID

- ID: EXP-W1-CONTENT-ASSIST-SIGNUP-002
- Date started: 2026-02-20
- Owner: Growth
- Surface: comparison + pricing-intent support content
- Persona focus: Career Pivoter + Early Career

## Hypothesis

- If we change: CTA stack from single generic CTA to dual-path CTA (primary mission action + secondary low-friction account creation)
- We expect: higher content-assisted signup conversion and improved content-to-tool CTR
- Because: users at mixed intent stages need both immediate action and lower-commitment fallback

## Variant Design

- Control: single CTA at page end
- Variant A: section-level CTA + end-of-page dual CTA
- Variant B (optional): N/A
- Primary metric: content-assisted signup conversion
- Guardrail metric(s): complaint/dispute signal, bounce rate on entry pages
- Success threshold: +10% conversion lift with stable guardrails

## Audience + Allocation

- Segment: comparison/pricing-intent visitors
- Traffic source: organic and AI-answer referrals
- Allocation split: 50/50 by URL bucket
- Estimated runtime: 14 days

## Instrumentation

- Events tracked: page_view, cta_primary_click, cta_secondary_click, signup_complete, first_tool_run
- Dashboard/report link: growth dashboard (to attach)
- Data quality checks completed: Yes

## Interim Check (midpoint)

- Primary metric trend: pending
- Guardrail trend: pending
- Any anomalies: pending
- Action: continue to full runtime unless guardrails degrade

## Final Results

- Control performance: pending
- Variant performance: pending
- Relative lift: pending
- Confidence level: pending
- Winner: pending

## Decision

- [ ] Ship winner
- [ ] Iterate and rerun
- [ ] Rollback

## Learnings

- What worked: pending
- What failed: pending
- Unexpected signal: pending
- Updated guidance for future runs: pending

## Follow-ups

- [ ] Update playbook
- [ ] Update prompt template
- [ ] Add to weekly review deck

## Review Checkpoints

- 7-day review: 2026-02-27
- 14-day review: 2026-03-06
- 30-day review: 2026-03-22
