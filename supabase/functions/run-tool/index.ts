// Supabase Edge Function: run-tool
// Main AI tool executor for all 11 CareerAI tools

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const TOOL_COSTS: Record<string, number> = {
  displacement: 0,
  jd_match: 2,
  resume: 10,
  cover_letter: 3,
  linkedin: 10,
  headshots: 20,
  interview: 3,
  skills_gap: 5,
  roadmap: 8,
  salary: 3,
  entrepreneurship: 8,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify token with Supabase
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: SUPABASE_SERVICE_ROLE_KEY! },
    });
    const userData = await userResponse.json();
    if (!userData.id) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.id;

    // 2. Parse request
    const { tool_id, inputs, job_target_id } = await req.json();

    if (!TOOL_COSTS.hasOwnProperty(tool_id)) {
      return new Response(JSON.stringify({ error: "TOOL_NOT_FOUND" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Load user data from DB
    const headers = {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      "Content-Type": "application/json",
    };

    const [profileRes, careerProfileRes, jobTargetRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/career_profiles?user_id=eq.${userId}&select=*`, { headers }),
      job_target_id
        ? fetch(`${SUPABASE_URL}/rest/v1/job_targets?id=eq.${job_target_id}&select=*`, { headers })
        : Promise.resolve(null),
    ]);

    const [profiles, careerProfiles] = await Promise.all([
      profileRes.json(),
      careerProfileRes.json(),
    ]);
    const jobTargets = jobTargetRes ? await jobTargetRes.json() : [];

    const profile = profiles[0] || null;
    const careerProfile = careerProfiles[0] || null;
    const jobTarget = jobTargets[0] || null;

    // 4. Check and deduct tokens
    const cost = TOOL_COSTS[tool_id];
    if (cost > 0) {
      if (!profile || profile.token_balance < cost) {
        return new Response(JSON.stringify({ error: "INSUFFICIENT_TOKENS" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Deduct tokens via RPC
      const spendRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/spend_tokens`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          p_user_id: userId,
          p_amount: cost,
          p_tool_id: tool_id,
          p_tool_result_id: "00000000-0000-0000-0000-000000000000",
        }),
      });

      if (!spendRes.ok) {
        return new Response(JSON.stringify({ error: "INSUFFICIENT_TOKENS" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 5. Build prompt
    const prompt = buildPrompt(tool_id, careerProfile, jobTarget, inputs);

    // 6. Call Anthropic Claude API
    const startTime = Date.now();
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text();
      console.error("Claude API error:", err);
      return new Response(JSON.stringify({ error: "AI_ERROR" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const claudeData = await claudeResponse.json();
    const latencyMs = Date.now() - startTime;

    // 7. Parse result
    const responseText = claudeData.content[0].text;
    let result;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return new Response(JSON.stringify({ error: "PARSE_FAILED" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 8. Store in tool_results
    const toolResult = {
      user_id: userId,
      job_target_id: job_target_id || null,
      tool_id,
      tokens_spent: cost,
      result,
      summary: generateSummary(tool_id, result),
      metric_value: extractMetric(tool_id, result),
      model_used: "claude-sonnet-4-5-20250929",
      prompt_tokens: claudeData.usage?.input_tokens || null,
      completion_tokens: claudeData.usage?.output_tokens || null,
      latency_ms: latencyMs,
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/tool_results`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(toolResult),
    });

    const insertedResults = await insertRes.json();
    const resultId = insertedResults[0]?.id || null;

    // 9. Return result
    return new Response(
      JSON.stringify({ result_id: resultId, result }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("run-tool error:", error);
    return new Response(JSON.stringify({ error: "AI_ERROR", message: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildPrompt(
  toolId: string,
  careerProfile: Record<string, unknown> | null,
  jobTarget: Record<string, unknown> | null,
  inputs: Record<string, unknown>
): string {
  let context = `You are CareerAI, an expert career intelligence engine.\n\n`;

  if (careerProfile) {
    context += `USER PROFILE:\n`;
    if (careerProfile.name) context += `- Name: ${careerProfile.name}\n`;
    if (careerProfile.title) context += `- Title: ${careerProfile.title}${careerProfile.company ? ` at ${careerProfile.company}` : ""}\n`;
    if (careerProfile.industry) context += `- Industry: ${careerProfile.industry}\n`;
    if (careerProfile.years_experience) context += `- Years: ${careerProfile.years_experience}\n`;
    if (careerProfile.skills) context += `- Skills: ${JSON.stringify(careerProfile.skills)}\n`;
    if (careerProfile.resume_score != null) context += `- Resume Score: ${careerProfile.resume_score}/100\n`;
    context += "\n";
  }

  if (jobTarget) {
    context += `TARGET JOB:\n- ${jobTarget.title} at ${jobTarget.company}\n`;
    if (jobTarget.salary_range) context += `- Salary: ${jobTarget.salary_range}\n`;
    context += "\n";
  }

  // Tool-specific prompts (abbreviated for Edge Function size)
  const toolPrompts: Record<string, string> = {
    displacement: `Analyze AI displacement risk. Respond ONLY in valid JSON: {"score": <0-100>, "risk_level": "low|medium|high|critical", "timeline": "<timeframe>", "tasks_at_risk": [{"task": "<name>", "risk_pct": <0-100>, "ai_tool": "<tool>"}], "safe_tasks": [{"task": "<name>", "risk_pct": <0-100>, "why_safe": "<reason>"}], "recommendations": ["<rec1>", "<rec2>", "<rec3>"], "industry_benchmark": {"average_score": <num>, "percentile": <num>}}`,
    jd_match: `Compare resume against this job description:\n${inputs.jd_text || ""}\n\nRespond ONLY in valid JSON: {"fit_score": <0-100>, "requirements": [{"skill": "<req>", "priority": "req|pref", "match": true|false|"partial", "evidence": "<text>"}], "advantages": ["<adv>"], "critical_gaps": [{"gap": "<gap>", "severity": "dealbreaker|significant|minor", "fix_time": "<time>"}], "salary_assessment": {"range": "<range>", "fair_for_candidate": true|false, "reasoning": "<why>"}, "applicant_pool_estimate": {"likely_applicants": <num>, "candidate_percentile": <num>}}`,
    resume: `Optimize this resume for ATS. ${inputs.target_jd ? `Target JD: ${inputs.target_jd}` : ""}\nResume: ${careerProfile?.resume_text || "Not available"}\n\nRespond ONLY in valid JSON: {"score_before": ${careerProfile?.resume_score || 40}, "score_after": <new-score>, "keywords_added": ["<kw>"], "sections_rewritten": [{"section": "<name>", "before": "<old>", "after": "<new>", "changes": "<why>"}], "formatting_fixes": ["<fix>"], "optimized_resume_text": "<full text>"}`,
    cover_letter: `Write a ${inputs.tone || "professional"} cover letter (${inputs.length || "standard"} length). Respond ONLY in valid JSON: {"letter_text": "<full letter>", "word_count": <num>, "tone": "<tone>", "jd_keywords_used": <num>, "resume_achievements_cited": <num>, "highlighted_sections": [{"text": "<phrase>", "type": "job_specific|keyword_match|achievement"}]}`,
    interview: `Generate ${inputs.interview_type || "behavioral_case"} interview questions. Respond ONLY in valid JSON: {"questions": [{"question": "<q>", "type": "behavioral|case_study|analytical|gap_probe|technical", "suggested_answer": "<STAR answer>", "coaching_tip": "<tip>", "difficulty": "easy|medium|hard"}], "company_culture_notes": "<notes>", "interview_format_prediction": "<prediction>"}`,
    linkedin: `Optimize LinkedIn profile for ${inputs.target_role || "similar"} roles. Respond ONLY in valid JSON: {"headlines": [{"text": "<headline>", "search_keywords": ["<kw>"]}], "about_section": "<about>", "keywords": ["<kw>"], "experience_improvements": [{"current": "<old>", "improved": "<new>"}], "profile_strength_score": <0-100>}`,
    skills_gap: `Analyze skills gap for ${inputs.target_role || "target"} roles. Respond ONLY in valid JSON: {"gaps": [{"skill": "<name>", "current_level": <0-100>, "required_level": <0-100>, "priority": "critical|high|medium|low|strength", "time_to_close": "<time>", "course": {"name": "<name>", "provider": "<platform>", "price": "<price>", "url": "<url>"}}], "learning_path": [{"month_range": "<range>", "focus": "<focus>", "actions": "<actions>"}], "dataset_note": "<note>"}`,
    roadmap: `Create a ${inputs.time_horizon || "12"}-month career roadmap for ${inputs.target_role || "target"} roles. Respond ONLY in valid JSON: {"milestones": [{"month": "<Month>", "title": "<title>", "actions": ["<action>"], "priority": "critical|high|medium|low"}], "networking_goals": ["<goal>"], "application_targets": ["<target>"], "skill_development": ["<skill>"]}`,
    salary: `Research salary for target position. ${inputs.current_salary ? `Current: ${inputs.current_salary}` : ""} Location: ${inputs.location || "US"}. Respond ONLY in valid JSON: {"market_range": {"p25": <num>, "p50": <num>, "p75": <num>, "p90": <num>}, "candidate_position": <percentile>, "counter_offer_scripts": [{"scenario": "<scenario>", "script": "<script>"}], "negotiation_tactics": [{"tactic": "<name>", "do_this": "<do>", "dont_do": "<dont>"}]}`,
    entrepreneurship: `Assess founder-market fit. ${inputs.business_idea ? `Idea: ${inputs.business_idea}` : ""} Risk tolerance: ${inputs.risk_tolerance || "moderate"}. Respond ONLY in valid JSON: {"founder_market_fit": <0-100>, "business_models": [{"model": "<name>", "description": "<desc>", "match_score": <0-100>, "first_steps": ["<step>"]}], "risk_assessment": {"tolerance": "<level>", "key_risks": ["<risk>"], "mitigations": ["<mitigation>"]}, "competitive_landscape": "<analysis>", "recommended_first_steps": ["<step>"]}`,
  };

  return context + (toolPrompts[toolId] || `Analyze for tool: ${toolId}. Respond in JSON.`);
}

function generateSummary(toolId: string, result: Record<string, unknown>): string {
  switch (toolId) {
    case "displacement": return `${result.score}% AI displacement risk`;
    case "jd_match": return `${result.fit_score}% fit score`;
    case "resume": return `${result.score_before} → ${result.score_after} ATS Score`;
    case "cover_letter": return `${result.word_count} word cover letter`;
    case "interview": return `${(result.questions as unknown[])?.length || 0} interview questions`;
    case "linkedin": return `LinkedIn optimized (${result.profile_strength_score}%)`;
    case "skills_gap": return `${(result.gaps as unknown[])?.length || 0} skill gaps identified`;
    case "roadmap": return `${(result.milestones as unknown[])?.length || 0} month roadmap`;
    case "salary": return `Salary range analyzed`;
    case "entrepreneurship": return `${result.founder_market_fit}% founder-market fit`;
    default: return "Analysis complete";
  }
}

function extractMetric(toolId: string, result: Record<string, unknown>): number | null {
  switch (toolId) {
    case "displacement": return result.score as number;
    case "jd_match": return result.fit_score as number;
    case "resume": return result.score_after as number;
    case "entrepreneurship": return result.founder_market_fit as number;
    case "linkedin": return result.profile_strength_score as number;
    default: return null;
  }
}
