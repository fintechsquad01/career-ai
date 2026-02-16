# AISkillScore Unified Master Plan

> **Canonical reference for all product and engineering work.** Every feature, prompt, and UX change must align with this plan. Do not implement in contradiction to it.

**Last updated:** February 16, 2026  
**Status:** All 6 batches COMPLETE + V3 post-baseline sprint (Batches A-D) COMPLETE  
**Source docs:** `SPRINT_PLANNING_BRIEF.md` (persona audit, sprints 1-4), `SPRINT_NEXT.md` (research, prompts, microcopy, token economics, Sprints A-E)

---

## 1. Vision & Principles

### Target State: A Career Utility Platform

- Users return for **every job application, career shift, new skill, or new venture**.
- The platform **knows them better with every interaction**. Each tool run enriches their profile.
- **The more you give, the better it gets** -- resume, JD, profile, and prior tool results improve every future output.

### Seven Non-Negotiable Principles

1. **Never hallucinate** -- Only use user inputs. Never invent companies, metrics, or achievements.
2. **Progressive value** -- Every input the user provides improves future outputs. Make this visible (profile completeness, context panel).
3. **Utility, not a tool** -- Users should return with every application, skill gain, or venture. The product grows with them.
4. **Multi-version support** -- Different resume versions, cover letters, and interview prep per job target.
5. **Cross-tool intelligence** -- JD Match gaps inform Resume Optimizer; Resume output feeds Cover Letter; Interview Prep knows gaps.
6. **Input-first UX** -- Funnel starts with input (resume or JD). Ask for missing context before running. Never charge tokens for hallucinated output.
7. **2026 context** -- Outputs reflect AI agents in HR, ATS optimization, remote work, skills-based hiring.

---

## 2. Execution Batches (Implementation Order)

All batches are complete. Each was self-contained; later batches depended on earlier ones.

| Batch | Name | Status | Key deliverables |
|-------|------|--------|------------------|
| **1** | Backend prompt fixes | DONE | `buildContext()` uses `inputs.resume_text`/`jd_text`; `ANTI_HALLUCINATION_RULES` + `FACTUAL_GROUNDING_RULES`; `detected_profile` in all JSON; salary role extraction |
| **2** | Frontend bug fixes | DONE | Sidebar Zustand selectors; AbortController + 120s timeout + SSE stream timeout; dashboard empty-state redesign |
| **3** | Progressive profile | DONE | Auto-save `career_profiles` from `detected_profile`; profile completeness ring; pre-tool context verification panel; signup tokens 5 to 15 |
| **4** | Funnel optimization | DONE | Paywall redesign (deficit, tool context, smart pack); post-purchase return to tool; public `/tools` hub + sign-up CTAs; landing 6-tool showcase |
| **5** | Cross-tool intelligence | DONE | Previous tool results injected into prompts via `buildPriorResultsContext`; tool dependency hints on inputs; result-aware "Recommended Next" narratives |
| **6** | Competitive & Track B | DONE | Source verification panel (Cover Letter, LinkedIn, Interview); microcopy refresh per SPRINT_NEXT S3; Track B result sections (Income Opportunities, Monetizable Skills); "What you'll get" on all tool inputs |

**Reference for each batch:**  
- Batches 1-4 map to **SPRINT_PLANNING_BRIEF** Sprints 1-2 + funnel work.  
- Batches 5-6 map to **SPRINT_PLANNING_BRIEF** Sprints 3-4 and **SPRINT_NEXT** Sprints B-E.

---

## 3. Backend Rules (Prompts & Context)

- **Context injection:** `buildContext()` injects `inputs.resume_text` and `inputs.jd_text` (when present) **before** careerProfile/jobTarget. Resume cap ~12k chars; JD cap ~8k.
- **Cross-tool context:** `buildPriorResultsContext()` fetches 5 most recent `tool_results` and injects relevant summaries (JD Match gaps, resume scores, displacement risk) into downstream tool prompts.
- **Creative tools (cover_letter, linkedin, interview):** Include `FACTUAL_GROUNDING_RULES` -- company names, metrics, job titles only from resume; no invented employers or numbers.
- **All tools:** Include `ANTI_HALLUCINATION_RULES` and return `detected_profile` (name, role, industry, experience_years, source) in JSON.
- **Salary:** Extract role from `inputs.target_role`, jobTarget, or careerProfile -- never default to generic SWE.

**Files:** `supabase/functions/run-tool/prompts.ts`, `supabase/functions/run-tool/index.ts`

---

## 4. UX Requirements (Implemented)

- **Profile completeness:** Score 0-100% (account + resume + JD + title/industry + target role + skills + years). Ring on dashboard when < 100%.
- **Auto-profile:** `detected_profile` from tool results auto-saves to `career_profiles` when profile is sparse.
- **Pre-tool context panel:** Collapsible "Context the AI will use" (resume, target job, profile) before spending tokens.
- **Tool dependency hints:** Amber tip on input pages suggesting prerequisite tools (e.g., "Run JD Match first").
- **Result-aware recommendations:** "Recommended Next" narratives use actual result data (gap count, scores).
- **Paywall:** Shows deficit, current balance, tool name; recommends cheapest pack that covers deficit; stores `pendingToolId` for auto-return after purchase.
- **Public tools hub:** `/tools` is public with sign-up CTAs; `/tools/[toolId]` stays auth-protected.
- **Landing:** 6 hero tools with pain stats; 4-step "How it works" (Paste, Analyze, Act, Earn); research-backed testimonials.
- **Source verification:** Creative outputs (Cover Letter, LinkedIn, Interview) show verified/unverified claims panel.
- **Track B sections:** Displacement shows Income Opportunities; Resume shows Monetizable Skills; Cover Letter shows Interview Talking Points.
- **"What you'll get":** All 11 tool input pages show 3 benefits before the submit button.

---

## 5. Token & Signup

- **Signup bonus:** 15 tokens (migration `20260215000001_token_rebalance.sql` and all copy updated).
- **Daily credits:** 2/day, cap 14, 7-day expiry. Implemented: migration, `award_daily_credits` RPC, `spend_tokens` spends daily first, `/api/daily-credits` endpoint, `useTokens` hook.
- **Spend:** Use `spend_tokens` RPC only; never update balance directly.

**Token economics:**
- **Per-tool costs:** displacement=0, jd_match=5, resume=15, cover_letter=5/8/12 (short/standard/detailed), interview=8, linkedin=15, skills_gap=8, roadmap=15, salary=8, entrepreneurship=12, headshots=25
- **Packs:** Starter 50tk/$14 ($0.28/tk), Pro 200tk/$39 ($0.195/tk, 30% savings), Power 500tk/$79 ($0.158/tk, 44% savings)
- **Lifetime:** Early Bird $119/120tk/mo, Standard $179/120tk/mo, VIP $279/180tk/mo

---

## 6. Key Documents to Follow

| Document | Use |
|----------|-----|
| **SPRINT_PLANNING_BRIEF.md** | Persona audit, Sprints 1-4 task lists, prompt engineering specifics, principles |
| **SPRINT_NEXT.md** | Research, full prompt text per tool (S2), microcopy (S3), token economics (S4), Sprints A-E |
| **PRD.md** | Product requirements, user flows, tools, pricing |
| **TECHSTACK.md** | Architecture, project structure |
| **DATAMODEL.md** | Schema, RLS, JSONB |
| **.cursorrules** | Code style, Phase priorities, patterns |

---

## 7. Checklist for New Work

Before implementing any feature or prompt change:

- [ ] Does it respect **no hallucination** and **factual grounding** for creative tools?
- [ ] Does it use **inputs + careerProfile + jobTarget + priorResults** for context?
- [ ] Does it support **progressive profile** (completeness, context panel) where relevant?
- [ ] Is **token** language correct (15 signup, spend via RPC)?
- [ ] Does it align with the principles and patterns established across all 6 batches?

If any answer is no, align the work with this plan before proceeding.

---

## 8. Remaining Future Work

### Completed (previously listed as deferred)

These items were implemented during the V3 post-baseline sprint (Feb 16, 2026):

- **Daily credits system** — DONE: Migration `20260212000003_daily_credits.sql`, `award_daily_credits` RPC, updated `spend_tokens` (daily-first, 7-day expiry), `useTokens` hook, `/api/daily-credits` endpoint
- **Affiliate integration** — DONE: `src/lib/affiliates.ts` (15+ platform configs), `CourseCard` component with affiliate links, PostHog click tracking, integrated in Skills Gap/Roadmap/Entrepreneurship results
- **Mission Control multi-job** — DONE: `/mission` page, `MissionContent`/`MissionCard`/`MissionOverview` components, `useMission`/`useMissionResults` hooks, per-job-target workflow tracking
- **Score change notifications** — DONE: Backend delta calculation in `run-tool` Edge Function, `ScoreDelta` component, `useScoreHistory` hook, ToolShell banner showing score improvements

### Still Pending

- **Headshots prompt improvement**: Enhanced Replicate prompt per SPRINT_NEXT S2.11
