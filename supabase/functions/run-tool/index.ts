// Supabase Edge Function: run-tool
// Main AI tool executor for all 11 AISkillScore tools

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { toolPrompts, type RecentResult } from "./prompts.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const APP_URL = Deno.env.get("APP_URL") || "https://aiskillscore.com";

// --- OpenRouter Model Routing — All Premium (Gemini 2.5 Pro) ---
// Best-in-class model for all tools. $1.25/$10 per M tokens.
// Avg cost ~$0.04/call with ~$0.80 avg revenue = 95%+ gross margin.
// Fallback: GPT-4.1 Mini for reliability if primary model fails.
const MODEL_CONFIG: Record<string, { model: string; maxTokens: number; tier: string }> = {
  // All tools use Gemini 2.5 Pro for maximum output quality
  // Complex tools get higher maxTokens to avoid truncation
  resume: { model: "google/gemini-2.5-pro", maxTokens: 8192, tier: "premium" },       // Full resume rewrite
  cover_letter: { model: "google/gemini-2.5-pro", maxTokens: 4096, tier: "premium" },
  linkedin: { model: "google/gemini-2.5-pro", maxTokens: 8192, tier: "premium" },      // About section + content strategy
  jd_match: { model: "google/gemini-2.5-pro", maxTokens: 4096, tier: "premium" },
  interview: { model: "google/gemini-2.5-pro", maxTokens: 6144, tier: "premium" },     // 5-8 questions with follow-ups
  skills_gap: { model: "google/gemini-2.5-pro", maxTokens: 6144, tier: "premium" },    // Gaps + learning paths
  roadmap: { model: "google/gemini-2.5-pro", maxTokens: 8192, tier: "premium" },       // 12-month plan with scripts
  entrepreneurship: { model: "google/gemini-2.5-pro", maxTokens: 6144, tier: "premium" }, // 5 business models
  salary: { model: "google/gemini-2.5-pro", maxTokens: 4096, tier: "premium" },
  displacement: { model: "google/gemini-2.5-pro", maxTokens: 4096, tier: "premium" },
};
const FALLBACK_MODEL = "openai/gpt-4.1-mini";

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

// --- CORS: Dynamic origin check ---
const ALLOWED_ORIGINS = [
  Deno.env.get("APP_URL") || "https://aiskillscore.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// --- Rate Limiting ---
const rateLimitMap = new Map<string, number[]>();

function checkRate(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);
  if (valid.length >= limit) return false;
  valid.push(now);
  rateLimitMap.set(key, valid);
  return true;
}

// --- Prompt Sanitization ---
function sanitizeInput(text: string): string {
  // Remove potential prompt injection patterns
  return text
    .replace(/\b(ignore|disregard|forget)\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, "[filtered]")
    .replace(/\b(you\s+are|act\s+as|pretend\s+to\s+be|role\s*play)\b/gi, "[filtered]")
    .replace(/\bsystem\s*:\s*/gi, "[filtered]")
    .slice(0, 50000); // Max 50K chars
}

function sanitizeInputs(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// --- Validation ---
const VALID_TOOL_IDS = Object.keys(TOOL_COSTS);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const encoder = new TextEncoder();

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  const cors = getCorsHeaders(req);

  // --- Pre-stream auth, rate limiting, and validation ---

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let userId: string;
  try {
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: SUPABASE_SERVICE_ROLE_KEY! },
    });
    const userData = await userResponse.json();
    if (!userData.id) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    userId = userData.id;
  } catch {
    return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Rate limit by user: 5/min
  if (!checkRate(`run-tool:${userId}`, 5, 60000)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
      status: 429,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Parse and validate body
  let tool_id: string;
  let inputs: Record<string, unknown>;
  let job_target_id: string | undefined;
  try {
    const body = await req.json();
    tool_id = body.tool_id;
    inputs = body.inputs;
    job_target_id = body.job_target_id;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Validate tool_id
  if (!tool_id || !VALID_TOOL_IDS.includes(tool_id)) {
    return new Response(JSON.stringify({ error: `Invalid tool_id. Must be one of: ${VALID_TOOL_IDS.join(", ")}` }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Validate inputs: required object
  if (!inputs || typeof inputs !== "object" || Array.isArray(inputs)) {
    return new Response(JSON.stringify({ error: "inputs must be an object" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Validate job_target_id: optional UUID
  if (job_target_id !== undefined && job_target_id !== null) {
    if (typeof job_target_id !== "string" || !UUID_REGEX.test(job_target_id)) {
      return new Response(JSON.stringify({ error: "job_target_id must be a valid UUID" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }

  // Sanitize all user-provided text inputs before they go into prompts
  const sanitizedInputs = sanitizeInputs(inputs);

  // --- Streaming response ---
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: object) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send("progress", { step: 1, total: 5, message: "Validating request..." });

        const headers = {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY!,
          "Content-Type": "application/json",
        };

        // Step 2: Token check
        send("progress", { step: 2, total: 5, message: "Checking tokens..." });

        const [profileRes, careerProfileRes, jobTargetRes, recentResultsRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, { headers }),
          fetch(`${SUPABASE_URL}/rest/v1/career_profiles?user_id=eq.${userId}&select=*`, { headers }),
          job_target_id
            ? fetch(`${SUPABASE_URL}/rest/v1/job_targets?id=eq.${job_target_id}&select=*`, { headers })
            : Promise.resolve(null),
          // Fetch 5 most recent tool results for cross-tool context (Batch 5a)
          fetch(
            `${SUPABASE_URL}/rest/v1/tool_results?user_id=eq.${userId}&select=tool_id,result,summary,metric_value,created_at&order=created_at.desc&limit=5`,
            { headers },
          ),
        ]);

        const [profiles, careerProfiles] = await Promise.all([
          profileRes.json(),
          careerProfileRes.json(),
        ]);
        const jobTargets = jobTargetRes ? await jobTargetRes.json() : [];
        let recentResults: RecentResult[] = [];
        try {
          const parsed = await recentResultsRes.json();
          if (Array.isArray(parsed)) recentResults = parsed as RecentResult[];
        } catch {
          // Non-critical — proceed without prior results
          console.warn("Failed to parse recent tool results for cross-tool context");
        }

        const profile = profiles[0] || null;
        const careerProfile = careerProfiles[0] || null;
        const jobTarget = jobTargets[0] || null;

        const cost = TOOL_COSTS[tool_id];
        if (cost > 0) {
          // Check combined balance (purchased + daily credits)
          const purchasedBalance = profile?.token_balance ?? 0;
          const dailyBalance = profile?.daily_credits_balance ?? 0;
          const totalBalance = purchasedBalance + dailyBalance;
          if (!profile || totalBalance < cost) {
            send("error", { error: "INSUFFICIENT_TOKENS" });
            controller.close();
            return;
          }
        }

        // Step 3: Building prompt
        send("progress", { step: 3, total: 5, message: "Preparing AI analysis..." });

        // Resolve per-tool prompt config from the structured prompts module
        const promptConfig = toolPrompts[tool_id];
        const systemPrompt = promptConfig
          ? promptConfig.systemPrompt
          : "You are AISkillScore, an expert career intelligence engine. Always respond with valid JSON only.";
        const userPrompt = promptConfig
          ? promptConfig.buildUserPrompt(careerProfile, jobTarget, sanitizedInputs, recentResults)
          : buildPromptLegacy(tool_id, careerProfile, jobTarget, sanitizedInputs);
        const toolTemperature = promptConfig ? promptConfig.temperature : 0.7;

        // Step 4: AI processing
        send("progress", { step: 4, total: 5, message: "Running AI analysis..." });

        const startTime = Date.now();
        const modelConfig = MODEL_CONFIG[tool_id] || { model: FALLBACK_MODEL, maxTokens: 4096, tier: "fallback" };
        let usedModel = modelConfig.model;

        // Call OpenRouter with fallback
        let responseText: string;
        let aiUsage: { prompt_tokens: number; completion_tokens: number } | null = null;

        const callOpenRouter = async (model: string, maxTokens: number, timeoutMs = 90000): Promise<{ text: string; usage: typeof aiUsage; model: string }> => {
          const apiController = new AbortController();
          const apiTimeout = setTimeout(() => apiController.abort(), timeoutMs);
          try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": APP_URL,
                "X-Title": "AISkillScore",
              },
              signal: apiController.signal,
              body: JSON.stringify({
                model,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt },
                ],
                max_tokens: maxTokens,
                temperature: toolTemperature,
                response_format: { type: "json_object" },
              }),
            });
            if (!res.ok) {
              const errText = await res.text();
              throw new Error(`OpenRouter ${res.status}: ${errText}`);
            }
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content;
            if (!text) throw new Error("Empty response from OpenRouter");
            return {
              text,
              usage: data.usage ? { prompt_tokens: data.usage.prompt_tokens, completion_tokens: data.usage.completion_tokens } : null,
              model: data.model || model,
            };
          } finally {
            clearTimeout(apiTimeout);
          }
        };

        try {
          // Try primary model (90s timeout)
          const aiResult = await callOpenRouter(modelConfig.model, modelConfig.maxTokens, 90000);
          responseText = aiResult.text;
          aiUsage = aiResult.usage;
          usedModel = aiResult.model;
        } catch (primaryError) {
          console.error(`Primary model ${modelConfig.model} failed:`, primaryError);
          // Always try fallback — including on timeout (AbortError)
          try {
            const isTimeout = (primaryError as Error).name === "AbortError";
            send("progress", { step: 4, total: 5, message: isTimeout ? "Switching to faster model..." : "Retrying with backup model..." });
            const fallbackResult = await callOpenRouter(FALLBACK_MODEL, 4096, 60000);
            responseText = fallbackResult.text;
            aiUsage = fallbackResult.usage;
            usedModel = fallbackResult.model;
          } catch (fallbackError) {
            console.error("Fallback model also failed:", fallbackError);
            if ((fallbackError as Error).name === "AbortError") {
              send("error", { error: "AI analysis timed out. Please try again." });
            } else {
              send("error", { error: "AI_ERROR" });
            }
            controller.close();
            return;
          }
        }

        const latencyMs = Date.now() - startTime;

        // --- Robust JSON parsing ---
        // Handles: raw JSON, markdown code fences, trailing commas, extra whitespace
        let result: Record<string, unknown>;
        try {
          let cleaned = responseText.trim();
          // Strip markdown code fences (```json ... ``` or ``` ... ```)
          const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (fenceMatch) {
            cleaned = fenceMatch[1].trim();
          }
          // Try direct parse first
          try {
            result = JSON.parse(cleaned);
          } catch {
            // Fallback: extract the outermost JSON object
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON object found in response");
            let jsonStr = jsonMatch[0];
            // Fix trailing commas before } or ] (common LLM mistake)
            jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1");
            result = JSON.parse(jsonStr);
          }
        } catch (parseErr) {
          console.error("JSON parse failed:", parseErr, "Response:", responseText.slice(0, 500));
          send("error", { error: "PARSE_FAILED" });
          controller.close();
          return;
        }

        // --- Per-tool result validation ---
        // Check that critical fields exist before saving and charging tokens
        const validationResult = validateToolResult(tool_id, result);
        if (!validationResult.valid) {
          console.error(`Result validation failed for ${tool_id}:`, validationResult.reason);
          // Return the result anyway but log the issue — the output might still have value
          // We just won't charge tokens for clearly broken output
        }

        // Step 5: Storing results
        send("progress", { step: 5, total: 5, message: "Saving results..." });

        const toolResult = {
          user_id: userId,
          job_target_id: job_target_id || null,
          tool_id,
          tokens_spent: validationResult.valid ? cost : 0, // Don't charge for bad output
          result,
          summary: generateSummary(tool_id, result),
          metric_value: extractMetric(tool_id, result),
          model_used: usedModel,
          prompt_tokens: aiUsage?.prompt_tokens || null,
          completion_tokens: aiUsage?.completion_tokens || null,
          latency_ms: latencyMs,
        };

        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/tool_results`, {
          method: "POST",
          headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(toolResult),
        });

        if (!insertRes.ok) {
          const insertErr = await insertRes.text();
          console.error("tool_results insert failed:", insertRes.status, insertErr);
          send("error", { error: "Failed to save results. Please try again." });
          controller.close();
          return;
        }

        const insertedResults = await insertRes.json();
        const resultId = insertedResults[0]?.id || null;

        // NOW deduct tokens — only if result passed validation (quality gate)
        if (cost > 0 && validationResult.valid) {
          const spendRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/spend_tokens`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              p_user_id: userId,
              p_amount: cost,
              p_tool_id: tool_id,
              p_tool_result_id: resultId ?? "00000000-0000-0000-0000-000000000000",
            }),
          });

          if (!spendRes.ok) {
            const spendErr = await spendRes.text();
            console.error("spend_tokens RPC failed:", spendRes.status, spendErr);
            // Result is saved but tokens weren't deducted — log for reconciliation
            // Don't fail the user request since the AI result is valid
          }
        } else if (cost > 0 && !validationResult.valid) {
          console.warn(`Skipping token deduction for ${tool_id}: result validation failed — ${validationResult.reason}`);
        }

        // Check if this is user's first paid tool use and they have a referrer
        if (cost > 0) {
          const prevRunsRes = await fetch(
            `${SUPABASE_URL}/rest/v1/tool_results?user_id=eq.${userId}&tokens_spent=gt.0&select=id&limit=2`,
            { headers }
          );
          const prevRuns = await prevRunsRes.json();

          if (prevRuns && prevRuns.length <= 1) {
            const profileRefRes = await fetch(
              `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=referred_by`,
              { headers }
            );
            const profileRefData = await profileRefRes.json();
            const profileWithRef = profileRefData[0] || null;

            if (profileWithRef?.referred_by) {
              await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_referral`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  p_referrer_id: profileWithRef.referred_by,
                  p_new_user_id: userId,
                }),
              });
            }
          }
        }

        send("complete", { result_id: resultId, result });
      } catch (error) {
        console.error("run-tool error:", error);
        send("error", { error: (error as Error).message || "Tool execution failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...cors,
    },
  });
});

// --- Per-tool result validation ---
// Ensures critical fields are present before charging tokens.
// Returns { valid: true } if result is acceptable, or { valid: false, reason } if not.
function validateToolResult(toolId: string, result: Record<string, unknown>): { valid: boolean; reason?: string } {
  switch (toolId) {
    case "displacement": {
      if (typeof result.score !== "number") return { valid: false, reason: "missing score" };
      if (!result.risk_level) return { valid: false, reason: "missing risk_level" };
      if (!Array.isArray(result.tasks_at_risk) || result.tasks_at_risk.length === 0) return { valid: false, reason: "missing tasks_at_risk" };
      if (!Array.isArray(result.recommendations) || result.recommendations.length === 0) return { valid: false, reason: "missing recommendations" };
      return { valid: true };
    }
    case "jd_match": {
      if (typeof result.fit_score !== "number") return { valid: false, reason: "missing fit_score" };
      if (!result.headline) return { valid: false, reason: "missing headline" };
      if (!Array.isArray(result.requirements) || result.requirements.length === 0) return { valid: false, reason: "missing requirements" };
      return { valid: true };
    }
    case "resume": {
      if (typeof result.score_before !== "number") return { valid: false, reason: "missing score_before" };
      if (typeof result.score_after !== "number") return { valid: false, reason: "missing score_after" };
      if (!result.optimized_resume_text) return { valid: false, reason: "missing optimized_resume_text" };
      return { valid: true };
    }
    case "cover_letter": {
      if (!result.letter_text || String(result.letter_text).length < 100) return { valid: false, reason: "letter_text too short or missing" };
      return { valid: true };
    }
    case "interview": {
      if (!Array.isArray(result.questions) || result.questions.length === 0) return { valid: false, reason: "missing questions" };
      return { valid: true };
    }
    case "linkedin": {
      if (!Array.isArray(result.headlines) || result.headlines.length === 0) return { valid: false, reason: "missing headlines" };
      if (!result.about_section) return { valid: false, reason: "missing about_section" };
      return { valid: true };
    }
    case "skills_gap": {
      if (!Array.isArray(result.gaps)) return { valid: false, reason: "missing gaps array" };
      if (!result.headline) return { valid: false, reason: "missing headline" };
      return { valid: true };
    }
    case "roadmap": {
      if (!Array.isArray(result.milestones) || result.milestones.length === 0) return { valid: false, reason: "missing milestones" };
      if (!result.headline) return { valid: false, reason: "missing headline" };
      return { valid: true };
    }
    case "salary": {
      if (!result.market_range) return { valid: false, reason: "missing market_range" };
      if (!Array.isArray(result.counter_offer_scripts) || result.counter_offer_scripts.length === 0) return { valid: false, reason: "missing counter_offer_scripts" };
      return { valid: true };
    }
    case "entrepreneurship": {
      if (typeof result.founder_market_fit !== "number") return { valid: false, reason: "missing founder_market_fit" };
      if (!Array.isArray(result.business_models) || result.business_models.length === 0) return { valid: false, reason: "missing business_models" };
      return { valid: true };
    }
    default:
      return { valid: true }; // Unknown tools pass validation
  }
}

// Legacy buildPrompt — only used if tool is not in the prompts module (shouldn't happen)
function buildPromptLegacy(
  toolId: string,
  careerProfile: Record<string, unknown> | null,
  jobTarget: Record<string, unknown> | null,
  _inputs: Record<string, unknown>
): string {
  let context = "";
  if (careerProfile) {
    context += `USER PROFILE:\n`;
    if (careerProfile.name) context += `- Name: ${careerProfile.name}\n`;
    if (careerProfile.title) context += `- Title: ${careerProfile.title}${careerProfile.company ? ` at ${careerProfile.company}` : ""}\n`;
    if (careerProfile.industry) context += `- Industry: ${careerProfile.industry}\n`;
    if (careerProfile.years_experience) context += `- Years: ${careerProfile.years_experience}\n`;
    if (careerProfile.skills) context += `- Skills: ${JSON.stringify(careerProfile.skills)}\n`;
    context += "\n";
  }
  if (jobTarget) {
    context += `TARGET JOB:\n- ${jobTarget.title} at ${jobTarget.company}\n\n`;
  }
  return context + `Analyze for tool: ${toolId}. Respond in valid JSON.`;
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
