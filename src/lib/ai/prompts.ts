/**
 * Shared prompt builder for AI tools.
 * NOTE: Currently the run-tool Edge Function has its own inline buildPrompt.
 * This module is ready to be imported by Edge Functions when refactoring.
 */
import type { CareerProfile, JobTarget } from "@/types";

interface PromptContext {
  careerProfile: CareerProfile | null;
  jobTarget: JobTarget | null;
}

function buildSharedContext(ctx: PromptContext): string {
  const cp = ctx.careerProfile;
  const jt = ctx.jobTarget;

  let context = `You are AISkillScore, an expert career intelligence engine. You analyze careers with the precision of a data scientist and the empathy of a career coach.\n\n`;

  if (cp) {
    context += `USER PROFILE:\n`;
    if (cp.name) context += `- Name: ${cp.name}\n`;
    if (cp.title) context += `- Current Title: ${cp.title}${cp.company ? ` at ${cp.company}` : ""}\n`;
    if (cp.industry) context += `- Industry: ${cp.industry}\n`;
    if (cp.years_experience) context += `- Years of Experience: ${cp.years_experience}\n`;
    if (cp.location) context += `- Location: ${cp.location}\n`;
    if (cp.skills) context += `- Skills: ${JSON.stringify(cp.skills)}\n`;
    if (cp.resume_score != null) context += `- Resume Score: ${cp.resume_score}/100\n`;
    context += "\n";
  }

  if (jt) {
    context += `TARGET JOB:\n`;
    context += `- Position: ${jt.title} at ${jt.company}\n`;
    if (jt.location) context += `- Location: ${jt.location}\n`;
    if (jt.salary_range) context += `- Salary Range: ${jt.salary_range}\n`;
    if (jt.requirements) context += `- Key Requirements: ${JSON.stringify(jt.requirements)}\n`;
    if (jt.fit_score != null) context += `- Current Fit Score: ${jt.fit_score}%\n`;
    context += "\n";
  }

  return context;
}

export function buildPrompt(
  toolId: string,
  ctx: PromptContext,
  inputs: Record<string, unknown>
): string {
  const shared = buildSharedContext(ctx);
  const cp = ctx.careerProfile;

  switch (toolId) {
    case "displacement":
      return `${shared}
Analyze the AI displacement risk for a ${cp?.title || "professional"} in ${cp?.industry || "technology"} with ${cp?.years_experience || "several"} years of experience.

Evaluate each of their daily tasks on a 0-100 automation risk scale based on current AI capabilities and 3-5 year projections.

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
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>"],
  "industry_benchmark": {"average_score": <industry average>, "percentile": <user percentile>}
}`;

    case "jd_match":
      return `${shared}
Compare this resume against the job description. Evaluate each requirement and produce a fit analysis.

JOB DESCRIPTION:
${inputs.jd_text || ""}

Respond in this exact JSON format:
{
  "fit_score": <0-100>,
  "requirements": [
    {"skill": "<requirement>", "priority": "req|pref", "match": true|false|"partial", "evidence": "<specific resume evidence or gap explanation>"}
  ],
  "advantages": ["<specific advantage over other applicants with evidence>"],
  "critical_gaps": [
    {"gap": "<missing skill>", "severity": "dealbreaker|significant|minor", "fix_time": "<estimated time to close>"}
  ],
  "salary_assessment": {"range": "<extracted salary range>", "fair_for_candidate": true|false, "reasoning": "<why>"},
  "applicant_pool_estimate": {"likely_applicants": <number>, "candidate_percentile": <estimated percentile>}
}`;

    case "resume":
      return `${shared}
Optimize this resume for ATS systems and human reviewers. ${inputs.target_jd ? `Specifically optimize for this job posting: ${inputs.target_jd}` : ""}

CURRENT RESUME:
${cp?.resume_text || "No resume text available."}

Perform these optimizations:
1. Add missing keywords from the job description
2. Rewrite bullet points using quantified achievements (STAR format)
3. Restructure sections for optimal ATS parsing
4. Improve professional summary
5. Remove weak/generic language

Respond in this exact JSON format:
{
  "score_before": ${cp?.resume_score || 40},
  "score_after": <new estimated score>,
  "keywords_added": ["<keyword1>", "<keyword2>"],
  "sections_rewritten": [
    {"section": "<section name>", "before": "<original text>", "after": "<rewritten text>", "changes": "<what changed and why>"}
  ],
  "formatting_fixes": ["<fix1>", "<fix2>"],
  "optimized_resume_text": "<full rewritten resume text>"
}`;

    case "cover_letter":
      return `${shared}
Write a ${inputs.tone || "professional"} cover letter (${inputs.length || "standard"} length) for the target position.

Reference specific achievements from the resume, keywords from the job description, and the company's mission and values. Do NOT be generic. Every sentence must reference either the job posting or the candidate's real experience.

Respond in this exact JSON format:
{
  "letter_text": "<full cover letter>",
  "word_count": <number>,
  "tone": "${inputs.tone || "professional"}",
  "jd_keywords_used": <count>,
  "resume_achievements_cited": <count>,
  "highlighted_sections": [
    {"text": "<highlighted phrase>", "type": "job_specific|keyword_match|achievement"}
  ]
}`;

    case "interview":
      return `${shared}
Generate ${inputs.interview_type || "behavioral_case"} interview questions for the target position.

For each question:
- Identify the type (Behavioral, Case Study, Analytical, Gap Probe, Technical)
- Provide a STAR-format suggested answer using the candidate's REAL experience
- Include a coaching tip specific to this company's interview style

Respond in this exact JSON format:
{
  "questions": [
    {"question": "<question text>", "type": "behavioral|case_study|analytical|gap_probe|technical", "suggested_answer": "<STAR format answer>", "coaching_tip": "<specific tip>", "difficulty": "easy|medium|hard"}
  ],
  "company_culture_notes": "<brief culture analysis>",
  "interview_format_prediction": "<likely interview structure>"
}`;

    case "linkedin":
      return `${shared}
Optimize this LinkedIn profile for recruiter search visibility, targeting ${inputs.target_role || "similar"} roles.

${inputs.current_about ? `CURRENT ABOUT SECTION:\n${inputs.current_about}\n` : ""}

Generate:
1. Three headline options (120 chars max each) optimized for recruiter search
2. A compelling About section (300 words max)
3. Top keywords to add throughout the profile

Respond in this exact JSON format:
{
  "headlines": [{"text": "<headline>", "search_keywords": ["<kw1>", "<kw2>"]}],
  "about_section": "<full about text>",
  "keywords": ["<keyword1>", "<keyword2>"],
  "experience_improvements": [{"current": "<current bullet>", "improved": "<improved bullet>"}],
  "profile_strength_score": <0-100>
}`;

    case "skills_gap":
      return `${shared}
Analyze the skills gap between the candidate's current profile and ${inputs.target_role || "target"} roles.

For each skill gap, assess current proficiency, rate priority, estimate time to close, and recommend specific courses.

Respond in this exact JSON format:
{
  "gaps": [
    {"skill": "<skill name>", "current_level": <0-100>, "required_level": <0-100>, "priority": "critical|high|medium|low|strength", "time_to_close": "<estimate>", "course": {"name": "<course name>", "provider": "<platform>", "price": "<price>", "url": "<link>"}}
  ],
  "learning_path": [{"month_range": "1-2", "focus": "<focus area>", "actions": "<specific actions>"}],
  "dataset_note": "<e.g., Based on 847 successful transitions>"
}`;

    case "roadmap":
      return `${shared}
Create a ${inputs.time_horizon || "12"}-month career roadmap for transitioning to ${inputs.target_role || "target"} roles.

Include monthly milestones, checkpoints, priority actions, skill development, networking goals, and application targets.

Respond in this exact JSON format:
{
  "milestones": [{"month": "<Month X>", "title": "<milestone title>", "actions": ["<action1>", "<action2>"], "priority": "critical|high|medium|low"}],
  "networking_goals": ["<goal1>", "<goal2>"],
  "application_targets": ["<target1>", "<target2>"],
  "skill_development": ["<skill1>", "<skill2>"]
}`;

    case "salary":
      return `${shared}
Research salary data for the target position. ${inputs.current_salary ? `The candidate's current salary is ${inputs.current_salary}.` : ""} Location: ${inputs.location || "unspecified"}.

Provide market data ranges, counter-offer scripts, and negotiation tactics.

Respond in this exact JSON format:
{
  "market_range": {"p25": <number>, "p50": <number>, "p75": <number>, "p90": <number>},
  "candidate_position": <estimated percentile>,
  "counter_offer_scripts": [{"scenario": "<scenario>", "script": "<what to say>"}],
  "negotiation_tactics": [{"tactic": "<tactic name>", "do_this": "<do>", "dont_do": "<don't>"}]
}`;

    case "entrepreneurship":
      return `${shared}
Assess founder-market fit for this candidate. ${inputs.business_idea ? `Business idea: ${inputs.business_idea}` : ""} Risk tolerance: ${inputs.risk_tolerance || "moderate"}.

Respond in this exact JSON format:
{
  "founder_market_fit": <0-100>,
  "business_models": [{"model": "<model name>", "description": "<description>", "match_score": <0-100>, "first_steps": ["<step1>", "<step2>"]}],
  "risk_assessment": {"tolerance": "<level>", "key_risks": ["<risk1>"], "mitigations": ["<mitigation1>"]},
  "competitive_landscape": "<brief analysis>",
  "recommended_first_steps": ["<step1>", "<step2>"]
}`;

    default:
      return `${shared}\nAnalyze and provide insights for tool: ${toolId}. Respond in JSON format.`;
  }
}
