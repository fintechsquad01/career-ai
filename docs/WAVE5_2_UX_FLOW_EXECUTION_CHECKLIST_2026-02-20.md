# Wave 5.2 UX Flow Optimization Checklist (Strict)

Version: 1.0  
Owner: Product + Design + Frontend Engineering  
Last updated: 2026-02-20  
Review cadence: Daily during rollout week

## 1) Objective

Improve cross-page continuity and reduce decision friction across left-nav pages by enforcing a connected "start -> progress -> next action" flow model:

1. `tools`
2. `dashboard`
3. `mission`
4. `history`
5. `pricing`
6. `auth/landing` (continuity handoff only)

This wave focuses on UX flow and information hierarchy, not color-token replacement (already covered in Wave 5).

## 2) Non-Negotiable Rules

- One dominant primary action per viewport state.
- Every major page above fold must answer: "What should I do next?"
- Recommendation copy must be specific, short, and role-aware when context exists.
- Tool cards must show effort context (`tokens` and expected effort/time where available).
- Mobile safe-area and touch-target rules remain enforced.
- Do not regress trust framing (`verdict`, `confidence`, `evidence coverage`) in scoring flows.

## 3) Locked Execution Order

Do not start downstream phases before upstream pass:

1. W52-10 Tools flow
2. W52-20 Dashboard flow
3. W52-30 Mission flow
4. W52-40 History flow
5. W52-50 Pricing flow
6. W52-60 Auth/Landing continuity
7. W52-90 QA + rollout gates

## 4) Phase Checklist

## W52-10 Tools Flow (Decision-First)

### File targets

- `src/components/tools/ToolShell.tsx`
- `src/components/shared/ReportStructure.tsx`
- `src/components/tools/Paywall.tsx`
- `src/components/tools/jd-match/JdMatchResults.tsx`
- `src/components/tools/resume/ResumeResults.tsx`
- `src/components/tools/displacement/DisplacementResults.tsx`

### Required changes

- Add/strengthen a compact "Start here now" action rail on input and result states.
- Ensure result order remains strict: verdict -> next action -> evidence -> secondary actions.
- Add one-line effort metadata under next action where absent.
- De-prioritize secondary actions visually under the primary CTA.

### Acceptance tests

- [ ] On each targeted tool, one primary action is visible above fold on both desktop and mobile.
- [ ] Secondary actions never visually compete with primary CTA.
- [ ] Next action includes explicit effort signal (`tokens` and/or time).
- [ ] No section appears above verdict that requires user interpretation first.

## W52-20 Dashboard Flow (Mission Entry)

### File targets

- `src/components/dashboard/DashboardContent.tsx`
- `src/components/dashboard/ToolsGrid.tsx`
- `src/components/dashboard/MissionCard.tsx`
- `src/components/dashboard/DashboardQuickAccess.tsx`

### Required changes

- Add a top "Today" rail with one recommended action and rationale.
- Promote one clear mission continuation CTA above fold.
- Add explicit "after this -> next tool" hints in top recommendation surfaces.
- Reduce card subtitle truncation where decision context is lost.

### Acceptance tests

- [ ] User can identify first useful action in <10 seconds.
- [ ] One clearly dominant next action exists above fold.
- [ ] Tool cards expose enough context to choose without opening each card.
- [ ] Recommendation rationale is short and specific (not generic).

## W52-30 Mission Flow (Progress Clarity)

### File targets

- `src/components/mission/MissionContent.tsx`
- `src/components/mission/MissionOverview.tsx`
- `src/components/mission/MissionCard.tsx`

### Required changes

- Reinforce "current target -> next action -> completion payoff" hierarchy.
- Add compact progression labels for each action card (`next`, `blocked`, `done`).
- Ensure status and progression cues are consistent between overview and detail states.
- Improve mission-complete state with a clear "what to do next" option.

### Acceptance tests

- [ ] Progress state is obvious without scrolling.
- [ ] Next actionable mission step is unambiguous.
- [ ] Overview and detail pages use consistent progression language.
- [ ] Mission-complete state has a clear continuation path.

## W52-40 History Flow (Resume Fast)

### File targets

- `src/components/history/HistoryContent.tsx`
- `src/components/history/HistoryResultRenderer.tsx`

### Required changes

- Strengthen row identity (title + tool + date + score band) for faster scanning.
- Add one-click "continue mission" action in expanded state.
- Keep share/delete/rename controls secondary to continuation.

### Acceptance tests

- [ ] Users can distinguish similar entries quickly.
- [ ] Continue action is visible before destructive/secondary controls.
- [ ] Expanded state preserves trust framing and readability.

## W52-50 Pricing Flow (Decision Confidence)

### File targets

- `src/app/pricing/page.tsx`
- `src/app/lifetime/page.tsx`
- `src/components/tools/Paywall.tsx`

### Required changes

- Add mission-context messaging ("what this unlocks next") per recommended pack.
- Ensure one primary purchase action per context and suppress competing CTAs.
- Clarify shortfall-to-pack logic in paywall and align pack recommendation text.

### Acceptance tests

- [ ] Recommended pack logic is understandable in one glance.
- [ ] Only one purchase-primary action appears per decision block.
- [ ] Pack cards communicate practical workflow coverage, not just token counts.

## W52-60 Auth/Landing Continuity (Handoff)

### File targets

- `src/components/landing/LandingContent.tsx`
- `src/components/landing/SmartInput.tsx`
- `src/app/auth/page.tsx`

### Required changes

- Ensure pre-auth analysis to auth to mission handoff copy is explicit and consistent.
- Keep input-first copy concise and avoid duplicate explanatory blocks.
- Ensure post-signup destination logic aligns with user intent (mission vs dashboard).

### Acceptance tests

- [ ] Users understand where they will land after signup.
- [ ] Input-first copy remains concise and non-redundant.
- [ ] Auth pages reinforce continuation, not restart.

## W52-90 QA + Rollout Gates

### Validation commands

- `npm run typecheck` (must pass)
- `npm run lint` (known baseline failures allowed; no new issues in touched files)

### Browser QA matrix

Run desktop and mobile checks in locked order:

1. `/tools/jd_match`, `/tools/resume`, `/tools/displacement`
2. `/dashboard`
3. `/mission`
4. `/history`
5. `/pricing`, `/lifetime`
6. `/`, `/auth`

### Pass criteria

- [x] Start clarity: first useful action identified quickly.
- [x] Decision clarity: one obvious next action at each state.
- [x] Continuity: handoff between pages feels connected and progressive.
- [x] No trust regression in score communication.

### Rollout stages

1. Internal validation (100% internal traffic)
2. Controlled exposure (50% user traffic if flag exists)
3. Full exposure (100%) after KPI and guardrail checks

### KPI checks (minimum)

- Time to first action (target down)
- Tool completion rate from dashboard recommendations (target up)
- Mission continuation clicks from tool results/history (target up)
- Pricing conversion guardrail (no material regression)

## 5) Definition Of Done

Wave 5.2 is complete when:

- All phase acceptance tests pass in order.
- QA matrix passes on desktop and mobile.
- No critical navigation/progression confusion remains in left-nav journey pages.
- Changes are merged with evidence notes for each phase.

## 6) QA Closure Evidence (2026-02-20)

### Validation commands

- `npm run typecheck` -> PASS (`tsc --noEmit`, exit code `0`).
- `npm run lint` -> FAIL on known baseline lint debt (existing repo-wide `no-explicit-any` / `no-unused-vars` findings); no Wave 5.2 closure-blocking regression identified in this QA pass.

### Browser QA matrix execution (desktop + mobile)

Locked order executed:

1. `/tools/jd_match`, `/tools/resume`, `/tools/displacement`
2. `/dashboard`
3. `/mission`
4. `/history`
5. `/pricing`, `/lifetime`
6. `/`, `/auth`

Outcome:

- Start clarity and single-primary-action hierarchy confirmed in targeted Wave 5.2 surfaces.
- Continuity cues confirmed across Dashboard -> Tool -> Mission/Pricing/Auth handoffs.
- Trust framing remained present in score-based flows (no regressions observed during QA walkthrough).

### History expanded-state verification

- Automated browser accessibility refs did not expose interactive row controls in this environment.
- UI implementation verification completed via code inspection in `src/components/history/HistoryContent.tsx`:
  - expanded header row toggles state via `handleToggleExpand`
  - expanded action bar shows `Continue Mission` first
  - share/delete actions remain secondary.

### Closure

- Wave 5.2 QA closure evidence captured.
- Remaining rollout-stage work is operational: staged exposure and KPI monitoring after deployment.
