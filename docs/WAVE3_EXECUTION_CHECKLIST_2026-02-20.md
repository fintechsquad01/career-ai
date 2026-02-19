# Wave 3 Execution Checklist (Canonical)

Last updated: 2026-02-20  
Mode workflow: Plan -> Approval -> Execution  
Scope: Wave 3 only (no over-scope)

## Purpose

This is the canonical Wave 3 execution checklist to follow when chat context gets large.  
Use this file with strict sequential execution and todo-state discipline.

## Execution Rules (must follow)

1. Reuse existing Wave 3 todo IDs. Do not create replacement IDs.
2. Move one todo at a time to `in_progress` in listed order.
3. Complete phases sequentially; do not skip ahead.
4. Mark todo `completed` only after that phase validation gates pass.
5. Keep backward compatibility for existing `tool_results`.
6. Canonical language is always `tokens` (never credits/points).
7. Do not commit unless explicitly requested.

---

## Task Board (strict order)

- [ ] **W3-00** Baseline + feature-flag scaffolding
- [ ] **W3-10** Structured metadata normalization (prompts + run-tool output)
- [ ] **W3-20** Shared result pattern foundation in UI shell
- [ ] **W3-30** Scoring-heavy tool rollout to shared pattern
- [ ] **W3-40** Navigation consistency + mission context persistence
- [ ] **W3-50** History + dashboard trust-density cleanup
- [ ] **W3-60** Validation, rollout, and release gates

---

## W3-00 Baseline + Feature Flags

Depends on: none

### File targets

- `src/lib/ab-testing.ts`
- `src/lib/constants.ts`
- `src/lib/analytics.ts`
- `src/hooks/useWave2JourneyFlow.ts` (or a Wave 3 hook if preferred)

### Acceptance tests

- Wave 3 flag key exists and is typed.
- Analytics event constants include Wave 3 events.
- Hook resolves remote flag with safe env fallback.
- Existing Wave 2 behavior remains intact.

### Telemetry events

- `w3_flag_exposure`
- `w3_variant_assigned`

---

## W3-10 Metadata Normalization (Prompt + Edge Function)

Depends on: W3-00

### File targets

- `supabase/functions/run-tool/prompts.ts`
- `supabase/functions/run-tool/index.ts`
- `src/types/tools.ts`

### Acceptance tests

- Scoring-heavy prompts request `verdict_band`, `confidence_level`, `evidence_coverage`.
- Output remains concise above fold and detailed on expand.
- `run-tool` persists additive `result_meta` while preserving legacy behavior.
- Legacy records without `result_meta` remain fully renderable.

### Telemetry events

- `run_tool_result_meta_normalized`
- `run_tool_result_meta_missing_fallback`
- `run_tool_output_completeness_checked`

---

## W3-20 Shared Pattern Foundation (ReportStructure + ToolShell)

Depends on: W3-10

### File targets

- `src/components/shared/ReportStructure.tsx`
- `src/components/tools/ToolShell.tsx`
- `src/types/tools.ts` (if additional view-model typing is needed)

### Acceptance tests

- `ReportStructure` supports priority metadata (`primary|secondary|detail`).
- Detail sections collapse by default on mobile.
- Tool result order: `verdict -> next action -> evidence -> secondary actions`.
- Single-primary CTA is preserved.
- NPS/referral timing avoids CTA collisions.

### Telemetry events

- `report_section_viewed`
- `report_section_expanded`
- `report_section_collapsed`
- `tool_result_primary_action_viewed`
- `tool_result_primary_action_clicked`
- `tool_result_secondary_action_clicked`

---

## W3-30 Shared Pattern Rollout Across Scoring-Heavy Tools

Depends on: W3-20

### File targets

- `src/components/tools/jd-match/JdMatchResults.tsx`
- `src/components/tools/displacement/DisplacementResults.tsx`
- `src/components/tools/resume/ResumeResults.tsx`
- `src/components/tools/linkedin/LinkedInResults.tsx`
- `src/components/tools/salary/SalaryResults.tsx`
- `src/components/tools/entrepreneurship/EntrepreneurshipResults.tsx`

### Acceptance tests

- Decision-first top section exists for each tool.
- Trust framing present: band + confidence + evidence coverage (or graceful fallback).
- Long prose reduced into compact cards + expandable details.
- Recommendation copy is not duplicated across adjacent sections.
- Legacy outputs continue rendering safely.

### Telemetry events

- `result_verdict_viewed`
- `result_evidence_details_opened`
- `result_gap_expand_toggled`
- `result_next_step_clicked`

---

## W3-40 Navigation + Mission Context Persistence

Depends on: W3-30

### File targets

- `src/components/layout/Nav.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/lib/navigation.ts`
- `src/components/tools/ToolShell.tsx`
- `src/components/dashboard/DashboardContent.tsx`

### Acceptance tests

- Route labels are consistent and stable across nav surfaces.
- Journey badges (`New`, `In progress`, `Ready`) are consistent.
- Mission target context is visible globally.
- History is quickly reachable from tool result flows.

### Telemetry events

- `nav_item_clicked`
- `nav_target_switch_opened`
- `nav_history_quick_opened`
- `dashboard_next_action_viewed`
- `dashboard_resume_mission_clicked`

---

## W3-50 History + Dashboard Density/Trust Cleanup

Depends on: W3-40

### File targets

- `src/components/history/HistoryContent.tsx`
- `src/components/dashboard/DashboardContent.tsx`
- `src/types/tools.ts` (only if needed for additive display metadata typing)

### Acceptance tests

- History row identity is user-recognizable and easy to scan.
- Inline rename remains optimistic with rollback on failure.
- Dashboard keeps concise one-sentence subtitle cadence.
- Copy remains canonical: `tokens` only.

### Telemetry events

- `history_row_renamed`
- `history_row_expand_toggled`
- `history_filter_changed`
- `history_result_reopened`
- `dashboard_next_action_clicked`

---

## W3-60 Validation + Rollout Gates

Depends on: W3-50

### Validation references

- `docs/CODE_HEALTH_CHECKLIST.md`
- `PRE_DEPLOY_CHECKLIST.md`
- `E2E_TEST_CHECKLIST.md`

### Required checks

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Targeted browser walkthroughs on affected flows
- Legacy `tool_results` compatibility verification

### Rollout plan

1. Ship behind Wave 3 feature flag (off by default).
2. Internal QA cohort.
3. 50% rollout (monitor 48-72h).
4. 100% rollout only after KPI gates pass.

### KPI success gates

- Cross-tool UX consistency >= 8/10 (persona tests)
- `result_next_step_clicked / result_verdict_viewed` improves >= 15%
- Detail-expansion rate decreases >= 20% without completion regression
- Continuity events improve >= 10%
- Structured metadata completeness >= 98%

---

## Risk Register + Rollback

- **R1 Prompt/output fragility:** additive field strategy + fallback enrichment; rollback flag.
- **R2 Over-compression hides detail:** keep expandable detail sections; rollback to prior layout branch.
- **R3 Nav confusion:** centralize labels in `src/lib/navigation.ts`; rollback nav-only commit.
- **R4 Legacy render regressions:** null-safe fallback in all result renderers; rollback W3-30 only.
- **R5 Telemetry quality issues:** payload checks in QA; disable non-critical event emissions if noisy.

---

## Planned Atomic Commit Sequence (only if explicitly asked)

1. `chore(w3): add wave3 feature flag and telemetry scaffolding`
2. `feat(run-tool): normalize trust metadata with backward-compatible result_meta`
3. `feat(report): add priority-aware shared report structure and ToolShell ordering`
4. `feat(results): apply shared trust pattern to scoring-heavy tool results`
5. `feat(nav): align journey navigation and mission context persistence`
6. `feat(history-dashboard): reduce text density and improve continuity signals`
7. `chore(qa): complete wave3 validation gates and staged rollout controls`
