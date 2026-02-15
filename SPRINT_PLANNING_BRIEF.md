# AISkillScore — Sprint Planning Brief (Post-Audit)

## Context for Receiving Agent

You are receiving this brief to inform your UI/UX uplift work. A comprehensive production audit was just completed across all 11 AI tools using 6 realistic personas (29 tool runs, 100% availability). The audit revealed critical quality issues that need both **backend prompt engineering fixes** AND **frontend UX changes** to resolve. This document gives you everything you need to plan the next sprints.

---

## Part 1: Audit Findings (What's Broken)

### The Good
- **100% availability** — all 29 tool runs completed, zero failures
- **JD Match (9.2/10 avg)** and **Resume Optimizer (9.4/10 avg)** are excellent. They use resume text directly and never hallucinate.
- **Average latency:** 42.6s (acceptable but improvable)
- **Structural depth is consistently high** (8.5/10) — output schemas and formatting are professional

### Critical Issue #1: Persona Context Not Reaching All Tools (10 of 29 outputs wrong)

**What happens:** Tools like Displacement, Skills Gap, Career Roadmap, Salary, and Entrepreneurship frequently analyze the **wrong profession**. A software engineer gets marketing analysis. A creative director gets recruiter analysis. A data analyst is told she has zero SQL skills when she uses it daily.

**Root cause (confirmed in code):** The Edge Function (`run-tool/index.ts` line 215) fetches context from the `career_profiles` database table. But for new users who haven't manually filled out a profile, this table is **empty**. The `buildContext()` function in `prompts.ts` then passes zero context to the LLM, which hallucinates a generic persona.

Meanwhile, `inputs.resume_text` and `inputs.jd_text` are passed by the frontend but are only used by JD Match and Resume Optimizer — other tools call `buildContext(careerProfile, ...)` which gets `null` and ignores the input resume entirely.

**Fix needed (backend):** When `careerProfile` is null but `inputs.resume_text` exists, extract a career profile from the resume and use it as context. Or better: always inject `inputs.resume_text` and `inputs.jd_text` directly into every tool's prompt regardless of DB state.

**Fix needed (frontend/UX):** Progressive profile building (see Part 3 below).

### Critical Issue #2: Creative Tools Hallucinate Work History (7 of 29 outputs)

**What happens:** Cover Letter invents employer names ("Data-Synth", "Optum", "expense automation API at a previous fintech"). LinkedIn About section fabricates companies ("InnovateCloud", "Electronic Arts"). Interview Prep suggests answers referencing fictional workplaces ("E-Commerce Solutions", "NextGen Health").

**Root cause:** The system prompts for Cover Letter, LinkedIn, and Interview tools don't sufficiently constrain the LLM to only reference information from the resume. The existing `ANTI_HALLUCINATION_RULES` block in `prompts.ts` says "NEVER hallucinate the candidate's experience" but it's not specific enough — the LLM interprets "don't hallucinate" as "make it sound plausible" and invents convincing-but-fictional details.

**Fix needed (backend):** Strengthen the grounding rules in every creative-output prompt:
```
ABSOLUTE RULE — FACTUAL GROUNDING:
You MUST ONLY reference companies, job titles, metrics, certifications, and achievements 
that appear VERBATIM in the candidate's resume text below. Specifically:
- Company names: Use the EXACT spelling from the resume. If resume says "Cloudify", 
  write "Cloudify" — NOT "InnovateCloud", "CloudTech", or any synonym/alias.
- Metrics: Use the EXACT numbers from the resume. If resume says "$4.2M pipeline", 
  write "$4.2M" — do NOT round, inflate, or invent new metrics.
- If a section of the output needs an achievement and none fits from the resume, 
  use a TRANSFERABLE FRAMING of an existing achievement. NEVER invent new ones.
VIOLATION OF THIS RULE MAKES THE OUTPUT DANGEROUS AND UNUSABLE.
```

**Fix needed (frontend/UX):** Show a "Sources Used" panel alongside creative outputs so users can verify claims against their resume.

### Issue #3: Default/Fallback Personas

**What happens:** Salary tool returned Senior Software Engineer data for a Healthcare Operations Manager. Skills Gap analyzed a marketer-to-analyst transition for someone who's already an analyst.

**Fix needed:** Add a "persona echo" field to every tool output — a `detected_profile` object that shows what the LLM thinks the user's role is. If it doesn't match, the frontend can flag it.

---

## Part 2: The Vision (What We Want to Become)

### Current State: "A Tool"
Users visit, run one tool, see results, leave. Each tool operates independently. No learning between tools. No reason to come back unless applying for a different job.

### Target State: "A Career Utility Platform"
Users visit with **every job application, career shift, new skill, or new venture**. The platform knows them better with every interaction. Each tool run enriches their profile. They come back because:

1. **Each new job application** — paste a new JD, get a tailored JD Match + Resume + Cover Letter for THAT specific job
2. **Career progression** — as they gain skills, their Displacement score changes, their Skills Gap narrows, their Salary leverage grows
3. **Multiple resume versions** — maintain different resume variants tailored to different roles/industries
4. **Ongoing career intelligence** — "Your displacement score changed from 53 to 48 since you completed that AI certification"

### Key Principle: The More You Give, The Better It Gets

Every user interaction is an input that improves every future output:
- **Resume text** → unlocks all tools with persona-specific context
- **Target JD** → unlocks JD Match, Resume tailoring, Interview Prep for that specific role
- **Skills/certifications added** → improves Displacement, Skills Gap, Career Roadmap accuracy
- **Salary expectations** → improves Salary Negotiation with real anchoring
- **Previous tool results** → Interview Prep can reference the gaps from JD Match; Cover Letter can use Resume Optimizer's improved framing

---

## Part 3: UX Architecture Changes Needed

### 3.1 Progressive Profile Building (The Funnel)

**Problem:** Users land, paste something, get a free analysis, create an account. But their `career_profiles` table stays empty. Then paid tools analyze the wrong person.

**Solution: Input Collection as First-Class UX**

The landing page Smart Input is the entry point. From there, build a progressive collection flow:

```
Landing Page (paste anything)
  → Free Analysis (instant value, no signup needed)
    → "Want deeper insights? Create account" (5 free tokens)
      → Profile Completeness Prompt
        → "Paste your resume for personalized results" (if not already given)
        → "What role are you targeting?" (if JD not given)
        → "How many years of experience?" (quick dropdown)
      → Dashboard with Profile Completeness Bar
        → Tools suggest what input they need before running
```

**Profile Completeness Score (0-100%):**
| Input Provided | Completeness Boost | Unlocks |
|----------------|-------------------|---------|
| Email + Account | +10% | Access to dashboard |
| Resume text pasted | +30% | All tools work with correct persona |
| Target JD pasted | +20% | JD Match, Resume tailoring, Interview Prep |
| Current title + industry | +15% | Displacement, Skills Gap, Salary accuracy |
| Target role specified | +10% | Career Roadmap, Entrepreneurship Assessment |
| Salary expectations | +5% | Salary Negotiation anchoring |
| Skills/certifications | +10% | Skills Gap, Displacement accuracy |

**Gamification:** Show this as a progress ring or bar on the dashboard: "Your profile is 40% complete. Complete your resume to unlock personalized AI analysis."

### 3.2 Tool Dependency Chain (Suggested Order)

Some tools produce better results when run after others. The UX should guide users through an optimal sequence:

```
Optimal Flow for Job Applicants:
  1. Paste Resume (profile context) → FREE displacement score
  2. Paste Target JD → JD Match (2 tokens) — shows gaps
  3. Resume Optimizer (10 tokens) — uses JD Match gaps to improve
  4. Cover Letter (3 tokens) — uses optimized resume + JD context  
  5. Interview Prep (3 tokens) — uses JD gaps for targeted questions
  6. Salary Negotiation (3 tokens) — uses role + location context

Optimal Flow for Career Changers:
  1. Paste Resume → FREE displacement score
  2. Skills Gap (5 tokens) — shows what to learn
  3. Career Roadmap (8 tokens) — uses skills gaps for timeline
  4. Paste Target JD → JD Match for new field
  5. Resume Optimizer — reframes for new career
```

**UX Implementation:** After each tool completes, show a "Recommended Next" card:
- "Your JD Match found 3 gaps. Run Resume Optimizer to fix them → [Optimize Resume - 10 tokens]"
- "Great resume score! Now generate a tailored cover letter → [Write Cover Letter - 3 tokens]"

### 3.3 Multi-Job Application Support

Users don't apply to one job. They apply to many. The platform should support:

- **Mission Control** — each "mission" is a job application with its own JD, tailored resume, cover letter, and interview prep
- **Resume Variants** — "Marketing Resume v1 (for Nexus AI)" vs "Marketing Resume v2 (for HubSpot)" 
- **Quick Re-run** — "New JD? Paste it here and we'll generate a tailored resume + cover letter instantly"
- **Application Tracker** — status per mission (applied, interviewing, offer, rejected)

### 3.4 Input Validation Before Tool Run

**Problem:** Tools fail silently when context is missing — they just hallucinate.

**Solution:** Before running any tool, show what context the tool will use:

```
┌─ Running: Cover Letter ─────────────────────────┐
│                                                  │
│ Context being used:                              │
│ ✅ Resume: Sarah Chen, Sr. Marketing Manager     │
│ ✅ Target JD: AI PMM at Nexus AI                 │
│ ⚠️ No target role specified — using JD title     │
│ ✅ Tone: Professional                            │
│                                                  │
│ Missing (optional):                              │
│ ○ Salary expectations                            │
│ ○ Key achievements to highlight                  │
│                                                  │
│ [Run Analysis - 3 tokens]                        │
└──────────────────────────────────────────────────┘
```

This prevents the "wrong persona" problem by making the user verify context before spending tokens.

### 3.5 Output Verification Panel

For creative outputs (Cover Letter, LinkedIn, Interview), show a side panel:

```
┌─ Generated Cover Letter ──────┐ ┌─ Source Verification ──────────┐
│                                │ │                                │
│ Dear Hiring Manager,           │ │ ✅ "Cloudify" — from resume    │
│                                │ │ ✅ "$4.2M pipeline" — resume   │
│ At Cloudify, I led product     │ │ ✅ "156% organic traffic"      │
│ launch campaigns that drove    │ │ ✅ "HubSpot automation"        │
│ $4.2M in qualified pipeline... │ │ ⚠️ No company name available   │
│                                │ │    for 2nd paragraph           │
│                                │ │                                │
└────────────────────────────────┘ └────────────────────────────────┘
```

---

## Part 4: Sprint Planning

### Sprint 1: Foundation Fixes (Week 1-2) — "Make Existing Tools Reliable"

| Task | Type | Priority | Est. |
|------|------|----------|------|
| Fix `buildContext()` to use `inputs.resume_text` when `careerProfile` is null | Backend | P0 | 2h |
| Always inject resume_text + jd_text from inputs into ALL tool prompts | Backend | P0 | 4h |
| Strengthen anti-hallucination rules in Cover Letter, LinkedIn, Interview prompts | Backend | P0 | 4h |
| Add `detected_profile` echo field to all tool outputs | Backend | P0 | 2h |
| Fix Salary tool to extract role from resume/JD instead of defaulting to SWE | Backend | P0 | 2h |
| Fix JSON corruption in Displacement output (3rd task_at_risk) | Backend | P1 | 1h |
| Increase maxTokens for tools with truncation issues | Backend | P1 | 1h |
| Re-run all 29 persona tests to verify fixes | QA | P0 | 2h |

### Sprint 2: Progressive Profile & Input Collection (Week 3-4) — "Know Your User"

| Task | Type | Priority | Est. |
|------|------|----------|------|
| Build resume parser that extracts structured profile from resume text | Backend | P0 | 8h |
| Auto-populate `career_profiles` from resume on first tool run | Backend | P0 | 4h |
| Profile completeness score component (progress ring/bar) | Frontend | P0 | 4h |
| "Complete your profile" prompt after first tool run | Frontend | P0 | 3h |
| Pre-tool context verification panel ("This is what we know about you") | Frontend | P1 | 6h |
| Input nudges — "Paste your resume for personalized results" | Frontend | P1 | 2h |
| Store and display multiple resume versions | Backend + UI | P1 | 8h |

### Sprint 3: Tool Chain & Cross-Tool Intelligence (Week 5-6) — "Connected Intelligence"

| Task | Type | Priority | Est. |
|------|------|----------|------|
| Pass previous tool results as context to subsequent tools | Backend | P0 | 6h |
| "Recommended Next" suggestions after each tool completes | Frontend | P0 | 4h |
| Tool dependency indicators ("Best after JD Match") | Frontend | P1 | 3h |
| Share JD Match gaps with Resume Optimizer and Interview Prep | Backend | P1 | 4h |
| Cross-tool consistency check (don't contradict prior results) | Backend | P1 | 6h |

### Sprint 4: Multi-Job & Utility Features (Week 7-8) — "Your Career Platform"

| Task | Type | Priority | Est. |
|------|------|----------|------|
| Mission Control — multi-job application management | Frontend + Backend | P0 | 16h |
| Resume variants per job target | Backend + UI | P1 | 8h |
| "New JD" quick-run flow (paste JD → auto-generate resume + cover letter) | Frontend | P1 | 6h |
| Application status tracker per mission | Frontend | P2 | 8h |
| Source verification panel for creative outputs | Frontend | P2 | 6h |
| "Your score changed" notifications (displacement, skills progress) | Backend + UI | P2 | 8h |

---

## Part 5: Prompt Engineering Specifics (For Backend Reference)

### Current Architecture (prompts.ts)
- `buildContext(careerProfile, jobTarget, options)` — builds context from DB data
- Each tool has a `buildUserPrompt(careerProfile, jobTarget, inputs)` function
- `ANTI_HALLUCINATION_RULES` — exists but too weak for creative tools

### What Must Change

**1. Context injection fix (all tools):**
```typescript
// In buildContext(), add this BEFORE the careerProfile check:
// If inputs contain resume_text, ALWAYS inject it — this is the most reliable source
if (inputs?.resume_text) {
  ctx += `CANDIDATE RESUME (from direct input):\n${String(inputs.resume_text).slice(0, 12000)}\n\n`;
}
if (inputs?.jd_text) {
  ctx += `TARGET JOB DESCRIPTION (from direct input):\n${String(inputs.jd_text).slice(0, 8000)}\n\n`;
}
```

**2. Stronger grounding for creative tools (cover_letter, linkedin, interview):**
```
FACTUAL GROUNDING — MANDATORY:
Every company name, job title, metric, and achievement in your output MUST appear 
in the CANDIDATE RESUME above. Cross-check before writing:
- Company names: exact match only (e.g., "Cloudify" not "CloudTech")
- Metrics: exact numbers only (e.g., "$4.2M" not "$5M")
- Job titles: exact as listed (e.g., "Senior Marketing Manager" not "VP of Marketing")
If you need to describe an achievement and nothing fits exactly, REFRAME an existing 
achievement from the resume. NEVER INVENT a new company, project, or number.
```

**3. Persona echo (all tools):**
Add to every tool's JSON schema:
```json
{
  "detected_profile": {
    "name": "extracted from resume",
    "current_title": "extracted from resume",
    "current_company": "extracted from resume", 
    "target_role": "extracted from JD or inputs"
  },
  ...rest of tool output
}
```

### Tools Most Affected by These Changes
| Tool | Current Issue | Expected Improvement |
|------|-------------|---------------------|
| Displacement | Wrong profession (25% accuracy) | Should reach 95%+ with resume injection |
| Cover Letter | Hallucinated employers (0% clean) | Should reach 90%+ with grounding rules |
| LinkedIn | Hallucinated employers (0% clean) | Should reach 90%+ with grounding rules |
| Interview | Hallucinated experiences (0% clean) | Should reach 85%+ with grounding rules |
| Skills Gap | Wrong persona (33% accuracy) | Should reach 95%+ with resume injection |
| Roadmap | Wrong persona (0% accuracy) | Should reach 90%+ with resume injection |
| Salary | Default SWE data (50% accuracy) | Should reach 90%+ with role extraction |
| Entrepreneurship | Wrong persona (0% accuracy) | Should reach 90%+ with resume injection |

---

## Part 6: Key Principles to Follow

1. **Never hallucinate** — only use user inputs. Leverage their profile + expert knowledge of 2026 job market trends, AI scanning HR agents, and ATS optimization. But never invent facts about the user.

2. **Progressive value** — every input the user provides makes every future output better. Make this visible and rewarding.

3. **Utility, not a tool** — users should return with every job application, career shift, new venture, new skill, or new experience. The platform grows with them.

4. **Multi-version support** — users apply to many jobs. They need different resume versions, different cover letters, different interview prep for different roles.

5. **Cross-tool intelligence** — JD Match gaps should inform Resume Optimizer. Resume Optimizer output should feed Cover Letter. Interview Prep should know what gaps exist. Tools should feel connected, not isolated.

6. **Input-first UX** — the funnel always starts with an input (resume or JD). If a tool needs context the user hasn't provided, ask for it before running. Never charge tokens for a hallucinated output.

7. **2026 context** — all outputs should reflect current market realities: AI agents in HR screening, ATS keyword optimization, remote work dynamics, skills-based hiring, the impact of AI tools on every profession.

---

## Reference Files

- `PERSONA_TEST_AUDIT_V2.md` — Full 29-run audit with per-tool scores and detailed findings
- `PERSONAS.md` — 6 test personas with resumes, JDs, and expected tool usage
- `TEST_SCENARIOS.md` — 12 test flows (new user + returning user per persona)
- `supabase/functions/run-tool/prompts.ts` — Current prompt system (the file to fix)
- `supabase/functions/run-tool/index.ts` — Edge Function that runs all tools
- `PRD.md` — Full product requirements
- `PAGES.md` — Page-by-page specs
- `.cursor/rules/supabase-project.mdc` — Correct Supabase project details
