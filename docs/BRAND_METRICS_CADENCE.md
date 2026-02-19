# Brand Metrics Cadence

Operational review rhythm for KPI governance and brand drift response.

## Operating Principles

- Use the same KPI formulas and thresholds from `docs/BRAND_QA_SCORECARD.md`.
- Run each cadence on schedule, even when no incidents are present.
- End every meeting with a documented decision and assigned actions.
- No ad hoc decision-making: use the templates and release rubric exactly.

## Roles

| Role | Responsibility |
|---|---|
| Review owner | Prepares metrics packet and runs the meeting |
| Analytics owner | Validates event counts and cohort filters |
| Brand QA owner | Runs consistency checks and drift audit |
| Engineering owner | Commits mitigation tasks for product copy/UX drift |
| Approval owner | Issues pass/conditional pass/fail decision |

## Weekly Review (Tactical Health)

Cadence: every week, fixed day/time, 30 minutes.

### Weekly Prep Checklist

- Pull KPI values for last 7 days:
  - `landing_variant_view`
  - `landing_analyze`
  - `signup_complete`
  - `tool_run`
  - `tool_complete`
- Compute:
  - Brand CTA CTR
  - Visitor-to-signup conversion
  - Tool completion rate
  - Brand consistency score (sample audit)
- Compare each KPI against threshold bands in scorecard doc.
- List new drift incidents and unresolved actions.

### Weekly Agenda

1. KPI snapshot (5 min)
2. Drift incidents opened since last review (10 min)
3. Mitigation decisions and owner assignments (10 min)
4. Release decision and comms (5 min)

### Weekly Required Outputs

- One completed scorecard record for the week.
- Updated incident log with severity and owner.
- Action list with due dates within 7 days.
- Release status: pass / conditional pass / fail.

## Biweekly Review (Trend and Experiment Integrity)

Cadence: every 2 weeks, 45 minutes.

### Biweekly Prep Checklist

- Bring previous 2 weekly scorecards.
- Add trend deltas for each KPI.
- Add experiment readout for copy/message tests.
- Re-run consistency audit on expanded surfaces:
  - landing
  - auth
  - pricing
  - tool shell
  - dashboard/nav (as applicable)

### Biweekly Agenda

1. Two-week KPI trend review (10 min)
2. Experiment and message-variant readout (15 min)
3. Drift pattern analysis and repeated-failure checks (10 min)
4. Ownership/SLA adherence review (10 min)

### Biweekly Required Outputs

- Two-week trend summary (improving, flat, declining per KPI).
- Confirmed list of retired, active, and new corrective actions.
- Escalation recommendation if repeated yellow/red states persist.

## Monthly Review (Strategic Governance)

Cadence: monthly, 60 minutes.

### Monthly Prep Checklist

- Collect all weekly/biweekly records for the month.
- Build monthly KPI rollup:
  - average
  - worst period
  - end-of-month state
- Summarize drift by severity and time-to-resolution.
- Evaluate ownership performance against SLAs.
- Propose threshold updates only if justified by stable data and approved by leadership.

### Monthly Agenda

1. KPI performance versus monthly targets (15 min)
2. Brand consistency and drift severity distribution (15 min)
3. Escalation and SLA performance review (15 min)
4. Threshold recalibration decision (10 min)
5. Next-month focus commitments (5 min)

### Monthly Required Outputs

- Monthly governance memo with pass/fail trend summary.
- Signed-off ownership map and any role changes.
- Approved threshold changes (or explicit no-change decision).
- Prioritized backlog of brand stabilization work.

## Escalation and SLA Rules

Use severity and SLA commitments consistently across cadences.

| Severity | Trigger | Owner response SLA | Resolution target | Escalation path |
|---|---|---|---|---|
| Sev3 | Single-surface inconsistency, low KPI impact | 2 business days | 7 days | Review owner -> Engineering owner |
| Sev2 | Multi-surface drift or repeated yellow KPI | 1 business day | 5 days | Review owner -> Approval owner -> Engineering owner |
| Sev1 | Red consistency score, severe claim drift, or sustained red KPI | 4 hours | 24-72 hours | Review owner -> Approval owner -> Product lead + Eng lead |

## Review Record Template

Use `docs/BRAND_WEEKLY_REVIEW_RECORD_TEMPLATE.md` as the default copy-me file for weekly cycles.

```md
## {Cadence} Brand Review - {Date}

### Inputs
- Data window:
- Cohort/filter:
- Events query references:

### KPI Summary
| KPI | Actual | Threshold band | Status | Notes |
|---|---:|---|---|---|

### Incidents
| ID | Severity | Description | Owner | SLA due | Status |
|---|---|---|---|---|---|

### Decisions
- Release decision: Pass | Conditional Pass | Fail
- Escalation: None | Sev3 | Sev2 | Sev1
- Actions:
  - [ ] Action / owner / due date
```

## Cross-References

- KPI formulas and pass/fail rubric: `docs/BRAND_QA_SCORECARD.md`
- Rollout governance and ownership boundaries: `docs/BRANDING_ROLLOUT_COORDINATION.md`
- Monitoring and event wiring references: `docs/CODE_HEALTH_CHECKLIST.md`, `src/lib/analytics.ts`
