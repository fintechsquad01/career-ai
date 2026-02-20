# UX Command Center Walkthrough and Implementation Spec (2026-02-19)

## Objective
Turn the current "analysis dump" experience into a premium, guided "Career Command Center" journey where users always know:

1. Where they are
2. What to do next
3. Why this step matters now

This spec is based on a production walkthrough on `aiskillscore.com` and maps directly to implementation files.

## Walkthrough rubric used

- `start_clarity`: user identifies first useful action in <10 seconds
- `decision_clarity`: result page presents one obvious next-best action
- `cognitive_load`: content is scannable; no long repeated prose blocks
- `navigation_confidence`: user can recover and continue mission after each step
- `trust_signals`: score/labels explained with evidence and confidence
- `continuity`: resume, targets, and history are easy to reuse/manage

## Production walkthrough scope executed

- Landing + share page scan
- Auth signup to fresh test account
- Onboarding modal progression on dashboard
- Tool run: `JD Match` (`/tools/jd_match`) from input to result
- Resume continuity touchpoints: onboarding resume input + settings + resume tool input state
- Returning user flow touchpoints: dashboard + mission + history + settings

## Findings: prioritized friction map

### P0 (trust/activation risk)

1. Result page still feels dense and hard to triage
   - `JD Match` outputs stack long narrative blocks under multiple sections.
   - Users need triage-first cards before deep explanation.

2. History entries are hard to distinguish across similar jobs
   - Current list pattern favors generic summary and date; no inline title management in the flow.
   - Multiple runs on similar roles will look too similar.

3. Score trust is vulnerable to false precision
   - Numeric score shown prominently without confidence/evidence coverage framing.
   - Users can interpret uncertain assessments as exact.

### P1 (usability and progression)

1. Resume re-upload is available but discoverability is poor in tool context
   - In resume tool prefilled state, re-upload path is indirect (`Paste Text` -> `Upload file instead`).
   - Users interpret this as "upload disabled."

2. Onboarding and mission progression are strong but not unified
   - Good step framing exists, but tool results do not consistently reinforce mission progress + next milestone.

3. Mobile interaction collisions
   - Action targets near the bottom frequently collide with bottom nav in small viewport flows.

### P2 (polish consistency)

1. Mixed copy styles across sections and tools
   - Some sections are concise and premium, others verbose and explanatory-heavy.

2. Result actions are useful but not clearly grouped by intent
   - "Run again", "Share", "Mission Control", NPS all appear close in time without hierarchy.

## Keep / Change / Remove matrix

### Keep

- `ReportFlow` sectioned pattern (summary/evidence/next step)
- Onboarding step experience and mission framing
- Resume persistence in profile/settings
- Tool-to-tool recommendation links

### Change

- Move from section-first to decision-first result hierarchy
- Replace long paragraphs with compact cards:
  - `Gap`
  - `Why this matters`
  - `Fix now`
  - `Effort`
- Add scoring confidence model:
  - band (`Low`, `Moderate`, `Strong`, `Top Match`)
  - confidence (`Low/Medium/High`)
  - evidence coverage (`x/y required criteria`)
- History card identity model with explicit editable label

### Remove

- Repeated prose blocks that restate same meaning with little action value
- Overlapping recommendation copy in both section body and footer next-step blocks

---

## File-by-file implementation spec

## 1) `src/components/tools/jd-match/JdMatchResults.tsx`

### Contract changes

- Add derived view model layer before render:
  - `verdictBand`
  - `confidenceLevel`
  - `evidenceCoverage`
  - `top3Gaps`
  - `quickWins`
- Render strict section order:
  1. Verdict hero
  2. Action plan (3 steps)
  3. Top gaps
  4. Expandable evidence details

### Copy rules

- Max 1 sentence for any lead paragraph
- `recruiter_perspective` trimmed to <= 160 chars for primary card, full text under "See detail"
- Avoid repeating same noun phrase across adjacent cards (de-dup logic by normalized stem)

### State behavior

- Default collapsed for deep evidence sections
- Persist user expansion state per result id in session storage
- "Next step" block always visible above fold

### Telemetry

- `result_verdict_viewed` {tool_id, result_id, verdict_band, confidence}
- `result_gap_expand_toggled` {tool_id, result_id, gap_index, expanded}
- `result_next_step_clicked` {tool_id, result_id, next_tool_id}
- `result_evidence_details_opened` {tool_id, result_id}

## 2) `src/components/tools/ToolShell.tsx`

### Contract changes

- Add a unified `journey_state` object:
  - `stage`: `first_run | progressing | mission_mode`
  - `has_resume`
  - `has_target`
  - `last_tool_id`
- Add `primary_cta_context` resolver to avoid multi-CTA ambiguity in result state.

### Copy rules

- One primary directive line above tool inputs.
- Support context accordion uses bullets only, no paragraphs longer than 120 chars.

### State machine updates

- Input state:
  - show one primary action and one optional action
- Result state:
  - order: `verdict -> next action -> evidence -> secondary actions`
- NPS/referral prompts must be delayed until after at least one next-step interaction or 20 seconds idle.

### Telemetry

- `tool_input_primary_cta_viewed`
- `tool_input_support_opened`
- `tool_result_primary_action_viewed`
- `tool_result_primary_action_clicked`
- `tool_result_secondary_action_clicked`

## 3) `src/components/shared/ReportStructure.tsx`

### Contract changes

- Support optional `priority` ordering metadata:
  - `primary`, `secondary`, `detail`
- Add optional sticky `ActionRail` slot for mobile-safe CTA anchoring.

### Copy rules

- Section labels must be action-oriented where possible:
  - `Summary` -> `Verdict`
  - `Evidence` -> `Why this verdict`
  - `Next Step` remains

### State behavior

- Collapse `detail` sections by default on mobile.
- Auto-scroll preserve when toggling sections.

### Telemetry

- `report_section_viewed` {section_key, priority}
- `report_section_collapsed` / `report_section_expanded`

## 4) `src/components/shared/ResumeUploadOrPaste.tsx`

### Contract changes

- Add explicit re-upload CTA visible in prefilled mode:
  - `Replace file`
- Keep "Paste Text" as separate CTA; do not force two-step switch.
- Add `resume_source_badge` with clear status:
  - `Profile resume`
  - `Uploaded file`
  - `Pasted text`

### Copy rules

- If extraction quality is low, show concise warning plus direct fix action.
- Avoid implying upload is unavailable.

### State behavior

- Prefilled mode actions:
  - `Replace file`
  - `Paste text`
  - `Clear`
- Preserve previous text if parser fails during replace.

### Telemetry

- `resume_prefilled_action_clicked` {action: replace_file|paste_text|clear}
- `resume_file_replace_started`
- `resume_file_replace_failed` {reason}
- `resume_file_replace_succeeded` {quality}

## 5) `src/components/tools/resume/ResumeInput.tsx`

### Contract changes

- Add "Resume library" affordance above uploader:
  - `Use profile resume`
  - `Use saved variant`
  - `Upload new`
- Include target-role context chip with edit shortcut.

### Copy rules

- Keep benefits list to max 3 bullets, each <= 70 chars.

### State behavior

- If no target JD, show optional prompt but do not block run.
- If target exists, prefill and allow quick switch.

### Telemetry

- `resume_input_source_selected` {source}
- `resume_input_target_switched`
- `resume_optimize_submitted` {has_target_jd, resume_source}

## 6) `src/components/history/HistoryContent.tsx`

### Contract changes

- Add editable user label for each result row:
  - `display_title` (user-editable)
  - fallback to generated summary
- Add compact metadata line:
  - tool, target title/company, run date, score band

### Copy rules

- Result subtitle should prioritize user-recognizable identity over generic score text.

### State behavior

- Inline rename on row (pencil icon)
- Save optimistic, rollback on error
- Rename accessible without expanding entire result

### Telemetry

- `history_row_renamed` {tool_id, result_id, title_length}
- `history_row_expand_toggled`
- `history_filter_changed`
- `history_result_reopened`

## 7) `src/components/dashboard/DashboardContent.tsx`

### Contract changes

- Replace generic dashboard blocks with journey rail:
  - `Today`
  - `Next best action`
  - `Progress this week`
- Add "continue where you left off" card from latest result context.

### Copy rules

- One sentence per card subtitle.
- Avoid repeating tool descriptions already present elsewhere.

### State behavior

- For first-run users: emphasize `start path`
- For returning users: emphasize `resume mission`

### Telemetry

- `dashboard_next_action_viewed`
- `dashboard_next_action_clicked`
- `dashboard_resume_mission_clicked`

## 8) `src/components/layout/Nav.tsx`, `src/components/layout/Sidebar.tsx`, `src/lib/navigation.ts`

### Contract changes

- Add explicit journey-aware nav badges:
  - `New`
  - `In progress`
  - `Ready`
- Ensure consistent route labels and target context visibility.

### Copy rules

- Keep nav labels short and stable.
- Never use ambiguous tool route naming in user-facing labels.

### State behavior

- Preserve current mission target visibility globally.
- Make "History" quickly reachable from all tool result pages.

### Telemetry

- `nav_item_clicked` {from_route, to_route}
- `nav_target_switch_opened`
- `nav_history_quick_opened`

## 9) `supabase/functions/run-tool/index.ts`

### Contract changes

- Enrich persisted `summary` payload generation:
  - include compact identity fields:
    - target title/company
    - verdict band
    - confidence
- Add `result_meta` object persisted in `result` for consistent rendering:
  - `verdict_band`
  - `confidence`
  - `evidence_coverage`

### Copy rules

- Generated summary must be scannable and non-duplicate with row title.

### State behavior

- Preserve old behavior when `result_meta` is unavailable (backward compatibility).

### Telemetry/event persistence

- Add server-side event hooks/log entries for:
  - generation latency buckets
  - structured output completeness checks

## 10) `supabase/functions/run-tool/prompts.ts`

### Contract changes

- Add strict output fields to scoring tools:
  - `confidence_level`
  - `evidence_coverage` (required matched / total required)
  - `verdict_band`
- Add anti-redundancy instruction:
  - avoid repeating same recommendation in multiple sections.

### Copy rules

- Force concise primary text and separate verbose detail fields.
- Ensure recruiter-style tone remains direct and respectful.

### State behavior

- Prompt should produce both:
  - short `primary_recommendations` (render above fold)
  - detailed `supporting_notes` (render on expand)

---

## Shared copy and tone rules (global)

- Use direct, non-judgmental language.
- Always provide "what to do next" in imperative form.
- Never duplicate recommendation text across:
  - summary headline
  - critical gaps card
  - next-step card
- Keep user-facing claims bounded to available evidence.

## Shared state-machine contract (tool pages)

```text
input -> loading -> verdict_ready -> action_selected -> detail_exploration -> followup_tool
```

- `verdict_ready` must render:
  - verdict band
  - confidence
  - one primary CTA
- `detail_exploration` is optional and collapsible.

## Telemetry schema baseline

All UX events should include:
- `user_id`
- `tool_id` (if applicable)
- `job_target_id` (if applicable)
- `result_id` (if applicable)
- `route`
- `ts`

Add derived properties:
- `journey_stage`
- `is_first_run`
- `has_profile_resume`
- `has_active_target`

---

## Implementation waves

## Wave 1 (P0 trust and clarity)

1. `JD Match` decision-first redesign
2. Score band + confidence + evidence coverage model
3. History row identity and inline rename

Success gate:
- +20% click-through from result page to next recommended action
- -25% bounce after first result view

## Wave 2 (continuity and progression)

1. Resume re-upload discoverability improvements
2. Dashboard mission rail and continue-state card
3. ToolShell primary action hierarchy cleanup

Success gate:
- +20% completion of two-tool sequence (JD -> Resume)
- Fewer support reports about resume replacement

## Wave 3 (platform consistency)

1. Apply shared result pattern to all scoring-heavy tools
2. Navigation consistency and mission context persistence
3. Prompt/edge-function structured metadata normalization

Success gate:
- Cross-tool UX consistency score >= 8/10 in persona tests

---

## Persona backend test harness additions

- Add scenario suite covering:
  - early-career switcher
  - senior IC
  - manager targeting leadership role
  - non-traditional background candidate
- For each persona run:
  - capture verdict/action coherence
  - contradiction count
  - duplicate recommendation count
  - actionability score

Minimum quality bar before release:
- contradiction count = 0 in top sections
- duplicate recommendation count <= 1
- actionability >= 8/10 median

## Release checklist for this UX program

1. Ship Wave 1 behind feature flag
2. Validate with production cohort and telemetry
3. Roll out Wave 2 to 50%, then 100%
4. Ship Wave 3 after structured metadata backfill support lands

