# AISkillScore — AI Prompts & Tool Execution Spec

## Overview
Each of the 11 tools calls Claude via Supabase Edge Functions. This document defines the prompt templates, expected inputs, and structured output schemas.

---

## Shared Context (injected into every tool prompt)

```
You are AISkillScore, an expert career intelligence engine. You analyze careers with the precision of a data scientist and the empathy of a career coach.

USER PROFILE:
- Name: {{name}}
- Current Title: {{title}} at {{company}}
- Industry: {{industry}}
- Years of Experience: {{years}}
- Location: {{location}}
- Skills: {{skills}}
- Resume Score: {{resume_score}}/100

{{#if job_target}}
TARGET JOB:
- Position: {{job_title}} at {{job_company}}
- Location: {{job_location}}
- Salary Range: {{job_salary}}
- Key Requirements: {{job_requirements}}
- Current Fit Score: {{fit_score}}%
{{/if}}
```

---

## Tool 1: AI Displacement Score (Free)

**Input:** Career profile only (no additional input needed)

**Prompt:**
```
Analyze the AI displacement risk for a {{title}} in {{industry}} with {{years}} years of experience.

Evaluate each of their daily tasks on a 0-100 automation risk scale based on current AI capabilities (2024-2025) and 3-5 year projections.

Respond in this exact JSON format:
{
  "score": <0-100 overall displacement score>,
  "risk_level": "low|medium|high|critical",
  "timeline": "1-2yr|3-5yr|5-10yr|10+yr",
  "tasks_at_risk": [
    {"task": "<task name>", "risk_pct": <0-100>, "ai_tool": "<tool that replaces this>"}
  ],
  "safe_tasks": [
    {"task": "<task name>", "risk_pct": <0-100>, "why_safe": "<reason>"}
  ],
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>"
  ],
  "industry_benchmark": {
    "average_score": <industry average>,
    "percentile": <user's percentile in industry>
  }
}
```

---

## Tool 2: JD Match Score (2 tokens)

**Input:** `jd_text` (job description text or extracted from URL)

**Prompt:**
```
Compare this resume against the job description. Evaluate each requirement and produce a fit analysis.

JOB DESCRIPTION:
{{jd_text}}

Respond in this exact JSON format:
{
  "fit_score": <0-100>,
  "requirements": [
    {
      "skill": "<requirement>",
      "priority": "req|pref",
      "match": true|false|"partial",
      "evidence": "<specific resume evidence or gap explanation>"
    }
  ],
  "advantages": [
    "<specific advantage over other applicants with evidence>"
  ],
  "critical_gaps": [
    {"gap": "<missing skill>", "severity": "dealbreaker|significant|minor", "fix_time": "<estimated time to close>"}
  ],
  "salary_assessment": {
    "range": "<extracted salary range>",
    "fair_for_candidate": true|false,
    "reasoning": "<why>"
  },
  "applicant_pool_estimate": {
    "likely_applicants": <number>,
    "candidate_percentile": <estimated percentile>
  }
}
```

---

## Tool 3: Resume Optimizer (10 tokens)

**Input:** `target_jd` (optional — job description to optimize against)

**Prompt:**
```
Optimize this resume for ATS systems and human reviewers. {{#if target_jd}}Specifically optimize for this job posting: {{target_jd}}{{/if}}

CURRENT RESUME:
{{resume_text}}

Perform these optimizations:
1. Add missing keywords from the job description
2. Rewrite bullet points using quantified achievements (STAR format)
3. Restructure sections for optimal ATS parsing
4. Improve professional summary
5. Remove weak/generic language

Respond in this exact JSON format:
{
  "score_before": {{resume_score}},
  "score_after": <new estimated score>,
  "keywords_added": ["<keyword1>", "<keyword2>"],
  "sections_rewritten": [
    {
      "section": "<section name>",
      "before": "<original text>",
      "after": "<rewritten text>",
      "changes": "<what changed and why>"
    }
  ],
  "formatting_fixes": ["<fix1>", "<fix2>"],
  "optimized_resume_text": "<full rewritten resume text>"
}
```

---

## Tool 4: Cover Letter Generator (3 tokens)

**Input:** `tone` ("professional"|"enthusiastic"|"conversational"), `length` ("short"|"standard"|"detailed"), `target_jd` (optional)

**Prompt:**
```
Write a {{tone}} cover letter ({{length}} length, ~{{word_count}} words) for the {{job_title}} position at {{job_company}}.

Reference:
- Specific achievements from the resume
- Keywords from the job description  
- The company's mission and values
- Why this candidate is uniquely qualified

Do NOT be generic. Every sentence must reference either the job posting or the candidate's real experience.

Respond in this exact JSON format:
{
  "letter_text": "<full cover letter>",
  "word_count": <number>,
  "tone": "{{tone}}",
  "jd_keywords_used": <count>,
  "resume_achievements_cited": <count>,
  "highlighted_sections": [
    {"text": "<highlighted phrase>", "type": "job_specific|keyword_match|achievement"}
  ]
}
```

---

## Tool 5: LinkedIn Optimizer (10 tokens)

**Input:** `current_about` (optional), `target_role` (optional)

**Prompt:**
```
Optimize this LinkedIn profile for recruiter search visibility, targeting {{target_role}} roles.

Generate:
1. Three headline options (120 chars max each) optimized for recruiter search
2. A compelling About section (300 words max) using the formula: Hook → Value prop → Key achievements → Call to action
3. Top keywords to add throughout the profile

Respond in this exact JSON format:
{
  "headlines": [
    {"text": "<headline>", "search_keywords": ["<kw1>", "<kw2>"]}
  ],
  "about_section": "<full about text>",
  "keywords": ["<keyword1>", "<keyword2>"],
  "experience_improvements": [
    {"current": "<current bullet>", "improved": "<improved bullet>"}
  ],
  "profile_strength_score": <0-100>
}
```

---

## Tool 6: Interview Prep (3 tokens)

**Input:** `interview_type` ("behavioral_case"|"technical"|"culture"|"panel"), `target_jd` (optional)

**Prompt:**
```
Generate {{interview_type}} interview questions for the {{job_title}} position at {{job_company}}.

For each question:
- Identify the type (Behavioral, Case Study, Analytical, Gap Probe, Technical)
- Provide a STAR-format suggested answer using the candidate's REAL experience
- Include a coaching tip specific to this company's interview style

Gap Probe questions should specifically target areas where the candidate's experience doesn't match requirements.

Respond in this exact JSON format:
{
  "questions": [
    {
      "question": "<question text>",
      "type": "behavioral|case_study|analytical|gap_probe|technical",
      "suggested_answer": "<STAR format answer using real resume data>",
      "coaching_tip": "<specific tip about company/interviewer expectations>",
      "difficulty": "easy|medium|hard"
    }
  ],
  "company_culture_notes": "<brief culture analysis>",
  "interview_format_prediction": "<likely interview structure>"
}
```

---

## Tool 7: Skills Gap Analysis (5 tokens)

**Input:** `target_role` (required)

**Prompt:**
```
Analyze the skills gap between the candidate's current profile and {{target_role}} roles.

For each skill gap:
- Assess current proficiency (0-100)
- Rate priority (Critical/High/Medium/Low/Strength)
- Estimate time to close
- Recommend a specific course with provider and price
- Suggest a learning path with monthly milestones

Respond in this exact JSON format:
{
  "gaps": [
    {
      "skill": "<skill name>",
      "current_level": <0-100>,
      "required_level": <0-100>,
      "priority": "critical|high|medium|low|strength",
      "time_to_close": "<estimate>",
      "course": {
        "name": "<course name>",
        "provider": "<platform>",
        "price": "<price>",
        "url": "<link>"
      }
    }
  ],
  "learning_path": [
    {
      "month_range": "1-2",
      "focus": "<focus area>",
      "actions": "<specific actions>"
    }
  ],
  "dataset_note": "<e.g., Based on 847 successful transitions>"
}
```

---

## Tool 8-11: Similar structured prompts for Roadmap, Salary, Entrepreneurship, Headshots

Each follows the same pattern:
1. Inject shared context
2. Tool-specific instructions
3. Strict JSON output schema
4. Real data references (no generic filler)

---

## Edge Function Implementation Pattern

```typescript
// supabase/functions/run-tool/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

Deno.serve(async (req: Request) => {
  // 1. Verify JWT
  const authHeader = req.headers.get("Authorization");
  // ... verify with Supabase

  // 2. Parse request
  const { tool_id, inputs, job_target_id } = await req.json();

  // 3. Load user data
  // ... fetch career_profile, job_target from DB

  // 4. Check & deduct tokens
  // ... call spend_tokens RPC

  // 5. Build prompt
  const prompt = buildPrompt(tool_id, userProfile, jobTarget, inputs);

  // 6. Call Claude
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  // 7. Parse result
  const result = JSON.parse(message.content[0].text);

  // 8. Store in tool_results
  // ... insert into DB

  // 9. Return
  return new Response(JSON.stringify({ result_id: id, result }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

## Model Selection

| Use Case | Model | Rationale |
|----------|-------|-----------|
| All 11 tools | `claude-sonnet-4-5-20250929` | Best balance of quality/speed/cost for structured output |
| Resume parsing | `claude-sonnet-4-5-20250929` | Reliable extraction from messy text |
| URL content extraction | `claude-haiku-4-5-20251001` | Fast, cheap, simple extraction task |

---

## Cost Estimation (per tool execution)

| Tool | Input Tokens (~) | Output Tokens (~) | Claude Cost (~) |
|------|-------------------|--------------------|--------------------|
| Displacement | 800 | 500 | $0.004 |
| JD Match | 1,500 | 800 | $0.007 |
| Resume | 2,000 | 2,000 | $0.012 |
| Cover Letter | 1,500 | 600 | $0.006 |
| LinkedIn | 1,200 | 1,200 | $0.007 |
| Interview | 1,500 | 1,500 | $0.009 |
| Skills Gap | 1,200 | 1,000 | $0.007 |
| Roadmap | 1,200 | 1,500 | $0.008 |
| Salary | 1,000 | 800 | $0.005 |
| Entrepreneur | 1,200 | 1,200 | $0.007 |

Average AI cost per tool: ~$0.007
Average token revenue per tool: ~$0.45 (at Pro pricing)
**Gross margin: ~98%**
