# Wave 3 Operator Dashboard

Use this as the day-to-day control panel during execution.

Related docs:
- `docs/WAVE3_EXECUTION_CHECKLIST_2026-02-20.md` (canonical)
- `docs/WAVE3_EXECUTION_RUN_LOG_TEMPLATE_2026-02-20.md` (evidence log)

---

## 1) Live Phase Status

| Phase | Owner | Status | Start | End | Validation | Notes |
|---|---|---|---|---|---|---|
| W3-00 |  | pending |  |  | not run |  |
| W3-10 |  | pending |  |  | not run |  |
| W3-20 |  | pending |  |  | not run |  |
| W3-30 |  | pending |  |  | not run |  |
| W3-40 |  | pending |  |  | not run |  |
| W3-50 |  | pending |  |  | not run |  |
| W3-60 |  | pending |  |  | not run |  |

Status values:
- `pending`
- `in_progress`
- `blocked`
- `completed`

---

## 2) Active Todo Discipline

- [ ] Exactly one phase is `in_progress`
- [ ] No skipping phase order
- [ ] Only mark `completed` after validation passes
- [ ] No new todo IDs created (reuse `W3-00..W3-60`)

---

## 3) Quick Command Checklist

Run these at substantive checkpoints:

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`

Browser walkthrough targets:
- [ ] Scoring-heavy tool run -> result trust framing
- [ ] Dashboard continuity card -> next action
- [ ] Tool result -> History quick-open -> reopen result
- [ ] Mission context visible in nav/sidebar

---

## 4) File Target Snapshot (by phase)

### W3-00
- `src/lib/ab-testing.ts`
- `src/lib/constants.ts`
- `src/lib/analytics.ts`
- `src/hooks/useWave2JourneyFlow.ts`

### W3-10
- `supabase/functions/run-tool/prompts.ts`
- `supabase/functions/run-tool/index.ts`
- `src/types/tools.ts`

### W3-20
- `src/components/shared/ReportStructure.tsx`
- `src/components/tools/ToolShell.tsx`
- `src/types/tools.ts`

### W3-30
- `src/components/tools/jd-match/JdMatchResults.tsx`
- `src/components/tools/displacement/DisplacementResults.tsx`
- `src/components/tools/resume/ResumeResults.tsx`
- `src/components/tools/linkedin/LinkedInResults.tsx`
- `src/components/tools/salary/SalaryResults.tsx`
- `src/components/tools/entrepreneurship/EntrepreneurshipResults.tsx`

### W3-40
- `src/components/layout/Nav.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/lib/navigation.ts`
- `src/components/tools/ToolShell.tsx`
- `src/components/dashboard/DashboardContent.tsx`

### W3-50
- `src/components/history/HistoryContent.tsx`
- `src/components/dashboard/DashboardContent.tsx`
- `src/types/tools.ts`

### W3-60
- `docs/CODE_HEALTH_CHECKLIST.md`
- `PRE_DEPLOY_CHECKLIST.md`
- `E2E_TEST_CHECKLIST.md`

---

## 5) Telemetry Gate Tracker

| Event | Seen | Sample Timestamp | Payload OK | Notes |
|---|---|---|---|---|
| w3_flag_exposure | no |  | no |  |
| w3_variant_assigned | no |  | no |  |
| run_tool_result_meta_normalized | no |  | no |  |
| run_tool_result_meta_missing_fallback | no |  | no |  |
| report_section_viewed | no |  | no |  |
| tool_result_primary_action_clicked | no |  | no |  |
| result_next_step_clicked | no |  | no |  |
| nav_item_clicked | no |  | no |  |
| history_row_renamed | no |  | no |  |

Payload minimum fields:
- `route`
- `tool_id` (if applicable)
- `job_target_id` (if applicable)
- `result_id` (if applicable)
- `journey_stage`

---

## 6) Rollout Control Board

### Wave 3 Flag State

- Current default: `off`
- Current rollout: `0%`

### Promotion Checklist

#### Flag-only internal QA
- [ ] completed
- [ ] no Sev1/Sev2 regressions

#### 50% rollout
- [ ] enabled
- [ ] monitored 48-72h
- [ ] KPI trend acceptable

#### 100% rollout
- [ ] approved
- [ ] post-rollout smoke tests pass

---

## 7) KPI Gate Board

| KPI | Target | Current | Pass |
|---|---:|---:|---|
| Cross-tool UX consistency | >= 8/10 |  | no |
| Next-step CTR lift | >= 15% |  | no |
| Detail expansion reduction | >= 20% |  | no |
| Continuity event lift | >= 10% |  | no |
| Metadata completeness | >= 98% |  | no |

Overall Gate: `not_passed`

---

## 8) Canonical Copy/Compatibility Guardrails

- [ ] `tokens` term only in all new copy
- [ ] No breakage for legacy `tool_results`
- [ ] `result_meta` additions are additive and optional

---

## 9) Atomic Commit Queue (only when asked)

1. `chore(w3): add wave3 feature flag and telemetry scaffolding`
2. `feat(run-tool): normalize trust metadata with backward-compatible result_meta`
3. `feat(report): add priority-aware shared report structure and ToolShell ordering`
4. `feat(results): apply shared trust pattern to scoring-heavy tool results`
5. `feat(nav): align journey navigation and mission context persistence`
6. `feat(history-dashboard): reduce text density and improve continuity signals`
7. `chore(qa): complete wave3 validation gates and staged rollout controls`

---

## 10) Rollback Quick Actions

Trigger if:
- KPI gates fail after rollout window
- Sev1/Sev2 regression appears
- legacy result rendering breaks

Options:
- [ ] Flag off immediately
- [ ] Revert latest atomic phase commit only
- [ ] Revert all Wave 3 commits (last resort)

Rollback notes:
- Time:
- Scope:
- Outcome:
