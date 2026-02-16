# AISkillScore Testing Strategy

High-level testing philosophy, methodology, and quality standards for AISkillScore.

---

## Testing Philosophy

AISkillScore is an AI-powered career tool. Traditional test coverage metrics (line coverage, branch coverage) are necessary but insufficient. An endpoint that returns HTTP 200 with a structurally valid JSON response can still deliver a terrible user experience if it analyzes the wrong profession, fabricates employers, or gives generic advice.

Our testing strategy is **persona-driven quality assurance**:

- **Real user journeys, not synthetic inputs.** Every test uses a complete resume and job description from a realistic persona, not lorem ipsum or minimal fixtures.
- **Output quality, not just output shape.** We validate that a software engineer gets SWE-relevant analysis, not that the `score` field is a number between 0 and 100.
- **Anti-hallucination as a first-class metric.** Every tool output is checked for fabricated company names, job titles, and metrics that don't exist in the input resume.
- **Regression detection for prompt changes.** Prompt engineering is the primary lever for output quality. Every prompt change must be validated against the persona matrix before merging.

---

## The Persona Methodology

We test with 6 personas that represent distinct market segments. Each has a complete career profile, realistic resume, target job description, motivations, and pain points.

### Why 6 Personas

The personas cover the key axes of variation that affect AI output quality:

| Axis | Coverage |
|------|----------|
| **Career stage** | Early career (Priya, 1.5 yrs) to senior (James, 12 yrs; David, 10 yrs) |
| **Industry** | Tech, Finance, Healthcare, Creative/Advertising, Retail |
| **Career intent** | Job hunting, career pivoting, future-proofing, side income |
| **Technical depth** | Software engineer (Marcus) to non-technical (Rachel, James) |
| **Resume complexity** | Thin resume (Priya) to dense multi-role resume (David, James) |
| **Budget sensitivity** | Budget-conscious (Priya) to high income (David) |

### The 6 Personas

| # | Name | Archetype | Current Role | Target Role | Key Test Focus |
|---|------|-----------|-------------|-------------|----------------|
| 1 | **Sarah Chen** | Career pivoter | Sr. Marketing Manager (Cloudify) | AI Product Marketing Manager (Nexus AI) | Can the platform reposition existing skills for a new domain? |
| 2 | **Marcus Johnson** | AI-anxious SWE | Backend Software Engineer (FinServe) | Senior SWE (Stripe) | Does the free displacement tool hook an anxious engineer? Are interview questions Stripe-caliber? |
| 3 | **Priya Patel** | Recent graduate | Junior Data Analyst (RetailMetrics) | Data Analyst (Datadog) | Does the platform deliver value with a thin resume? Is the tone encouraging, not condescending? |
| 4 | **David Kim** | Industry transitioner | Sr. Financial Analyst (Goldman Sachs) | Product Manager (Ramp) | Can finance experience be intelligently reframed as product management skills? |
| 5 | **Rachel Torres** | Non-tech professional | Healthcare Operations Manager (MountainView) | Healthcare Program Manager (Teladoc) | Does the platform work for non-tech industries? Is healthcare jargon translated for tech companies? |
| 6 | **James O'Brien** | Senior creative | Creative Director (Forge & Spark) | VP of Creative (Allbirds) | Does the platform handle creative careers? Is AI displacement nuanced (CD vs. junior designer)? |

Full persona profiles, resumes, and JDs: [PERSONAS.md](PERSONAS.md)

---

## Quality Bar

Every tool output is evaluated across 5 dimensions, each scored 0-10:

| Dimension | What It Measures | Example of a 10 | Example of a 0 |
|-----------|-----------------|-----------------|----------------|
| **Relevance** | Is the output about the right topic and role? | Displacement analysis for a SWE discusses coding, architecture, debugging | Displacement analysis for a SWE discusses marketing copywriting |
| **Accuracy** | Are facts, names, and metrics correct? | Cover letter references "Cloudify" and "$4.2M pipeline" (from resume) | Cover letter invents "InnovateCloud" and "$500M pre-sales" |
| **Actionability** | Can the user take immediate action? | Skills Gap recommends specific courses with prices and links | Skills Gap says "learn more about AI" |
| **Depth** | Is the analysis thorough and structured? | Interview prep has 5+ questions with STAR answers and coaching tips | Interview prep has 2 generic questions |
| **Persona Fit** | Does it feel tailored to this specific person? | Resume optimizer repositions Goldman M&A as product stakeholder management | Resume optimizer adds generic PM buzzwords |

### Scoring Methodology

Scores are assigned by comparing tool output against the persona's actual resume, target JD, and expected needs. The scoring is documented in [PERSONA_TEST_AUDIT_V2.md](PERSONA_TEST_AUDIT_V2.md) with per-tool, per-persona breakdowns.

**Platform-wide averages (from V2 audit):**

| Dimension | Average |
|-----------|---------|
| Relevance | 5.9 |
| Accuracy | 5.2 |
| Actionability | 6.7 |
| Depth | 8.5 |
| Persona Fit | 5.1 |
| **Overall** | **6.3** |

The low Accuracy (5.2) and Persona Fit (5.1) scores are driven by the two P0 systemic issues documented below. The high Depth (8.5) score confirms the output structure is solid -- the content just needs grounding.

---

## Tool Quality Tiers

Based on audit results, each tool falls into a quality tier:

### Tier A -- Production Ready (8.0+)

| Tool | Avg Score | Key Strength |
|------|-----------|-------------|
| **Resume Optimizer** | 9.4 | Zero hallucination. Preserves authentic experience. Smart keyword additions. |
| **JD Match** | 9.2 | Verbatim evidence quotes. Nuanced gap analysis. Realistic fit scores. |

These tools consistently deliver correct persona identification, accurate content, and actionable recommendations across all 6 personas.

### Tier B -- Needs Polish (7.0-7.9)

| Tool | Avg Score | Key Issue |
|------|-----------|-----------|
| **LinkedIn Optimizer** | 7.0 | Strategy sections are excellent but About section fabricates employer names. |

### Tier C -- Needs Fix (<7.0)

| Tool | Avg Score | Root Cause |
|------|-----------|------------|
| **Skills Gap** | 6.4 | Wrong persona detection when career_profiles is empty |
| **Interview Prep** | 6.1 | Fabricates employer names in suggested answers |
| **Salary Negotiation** | ~5.0 | Defaults to SWE salary data when persona unclear |
| **Cover Letter** | 4.9 | 0/3 hallucination-free (invents companies and metrics) |
| **Displacement** | 4.3 | 1/4 correct persona (analyzes marketing for SWEs/creatives) |
| **Career Roadmap** | 3.0 | 0/2 correct persona (wrong profession in every output) |
| **Entrepreneurship** | 2.6 | 0/1 correct persona (wrong industry analysis) |

---

## P0 Systemic Issues

Two root causes account for the majority of quality failures. Both are **prompt engineering problems, not architecture problems** -- the Edge Functions, AI model routing, SSE streaming, and data pipeline all work correctly.

### Issue 1: Persona Context Injection

**Affected tools:** Displacement, Skills Gap, Roadmap, Salary, Entrepreneurship

**Problem:** JD Match and Resume Optimizer score 9.0+ because they receive `resume_text` and `jd_text` directly in the `inputs` object. Other tools relied on the `career_profiles` database table for context, but this table is empty for new users who haven't manually filled their profile.

**Impact:** 10 of 29 outputs analyzed the wrong profession entirely (e.g., a backend SWE got marketing task analysis).

**Fix:** All tools now receive `resume_text` from `inputs` as the primary context source. The `ANTI_HALLUCINATION_RULES` in `prompts.ts` enforce that the AI extracts the career profile from the resume before generating output.

### Issue 2: Creative Content Hallucination

**Affected tools:** Cover Letter (0/3 clean), LinkedIn (0/2 clean), Interview Prep (0/3 clean)

**Problem:** System prompts for creative-output tools did not sufficiently constrain the LLM to only reference information present in the resume. The model filled in "plausible" details (company names, metrics, achievements) that sounded impressive but were entirely fictional.

**Impact:** 7 of 29 outputs fabricated work history that could damage a candidate's credibility in an interview.

**Fix:** `FACTUAL_GROUNDING_RULES` added to all creative tool prompts in `prompts.ts`:

> You MUST only reference companies, job titles, metrics, and achievements that appear EXACTLY in the user's resume text. Do NOT invent, embellish, or paraphrase company names. If a metric is not in the resume, do not fabricate one.

### Validation

Both fixes are validated by the persona test matrix (`test:personas`). The test assertions in `helpers/assertions.ts` include:

- `assertPersonaAccuracy()` -- checks `detected_profile.current_title` and `detected_profile.industry` against expected hints
- Per-tool validators check for required fields, score ranges, non-empty arrays, and minimum content lengths

---

## CI Integration Plan

| Schedule | Command | What It Tests | Duration |
|----------|---------|---------------|----------|
| **On PR** | `npm run test:ui` | Browser-based UI tests (navigation, microcopy, onboarding, mobile) | ~3 min |
| **Nightly** | `npm run test:api` | All API tests (token economy, cross-tool context, persona tools) | ~15 min |
| **Weekly** | `npm run test:personas` | Full 29-tool persona matrix with quality validation | ~15 min |

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml (planned)
name: Tests
on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'      # Nightly at 6 AM UTC
    - cron: '0 8 * * 1'      # Weekly on Monday at 8 AM UTC

jobs:
  ui-tests:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build && npm run start &
      - run: npm run test:ui
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

  api-tests:
    if: github.event.schedule == '0 6 * * *' || github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:api
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

  persona-tests:
    if: github.event.schedule == '0 8 * * 1'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:personas
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

---

## Prompt Change Validation Workflow

Prompt changes are the highest-risk changes in the codebase. A small wording tweak can fix one persona's output while breaking another's. The validation workflow ensures no regressions:

```
1. Edit prompts.ts (system prompts, anti-hallucination rules, etc.)
       |
       v
2. Deploy to staging (or test against production Edge Functions)
       |
       v
3. Run: npm run test:personas
       |
       v
4. Compare scores to baseline (PERSONA_TEST_AUDIT_V2.md)
       |
       +-- Any persona score decreased? --> Investigate and fix
       |
       +-- All scores maintained or improved? --> Merge
       |
       v
5. Update PERSONA_TEST_AUDIT_V2.md with new scores
```

### What Counts as a Regression

- Any tool's average score drops by more than 1.0 point
- Any tool that was Tier A drops below 8.0
- Any previously passing `assertPersonaAccuracy` check now fails
- Any tool that was hallucination-free now fabricates content

### Baseline Scores (from V2 Audit)

| Tool | Baseline Avg | Tier |
|------|-------------|------|
| Resume Optimizer | 9.4 | A |
| JD Match | 9.2 | A |
| LinkedIn Optimizer | 7.0 | B |
| Skills Gap | 6.4 | C |
| Interview Prep | 6.1 | C |
| Salary Negotiation | ~5.0 | C |
| Cover Letter | 4.9 | C |
| Displacement | 4.3 | C |
| Career Roadmap | 3.0 | C |
| Entrepreneurship | 2.6 | C |

Target after P0 fixes: platform-wide average of 8.5+ (up from 6.3).

---

## Related Documents

| Document | Description |
|----------|-------------|
| [PERSONAS.md](PERSONAS.md) | Full profiles for all 6 test personas (demographics, resumes, JDs, motivations) |
| [TEST_SCENARIOS.md](TEST_SCENARIOS.md) | 12 manual test flows (2 per persona) with step-by-step actions |
| [PERSONA_TEST_AUDIT_V2.md](PERSONA_TEST_AUDIT_V2.md) | V2 audit results: 29 tool runs, 5-dimension scoring, root cause analysis |
| [tests/README.md](tests/README.md) | Developer guide: how to run, extend, and debug tests |
| [tests/EDGE_CASES.md](tests/EDGE_CASES.md) | Living checklist of 65 edge cases with implementation status |
| [playwright.config.ts](playwright.config.ts) | Test project configuration (api, ui-desktop, ui-mobile) |
