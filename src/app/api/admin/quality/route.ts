import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Admin emails that can access the quality dashboard
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL || "",
].filter(Boolean);

export async function GET() {
  // 1. Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Service role client for cross-user queries
  const admin = createAdminClient();

  // 3. Fetch last 7 days of tool results
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: results, error } = await admin
    .from("tool_results")
    .select("id, tool_id, metric_value, latency_ms, model_used, prompt_tokens, completion_tokens, tokens_spent, result, summary, created_at")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 4. Aggregate stats per tool
  const toolStats: Record<
    string,
    {
      tool_id: string;
      count: number;
      avg_latency: number;
      avg_metric: number;
      avg_prompt_tokens: number;
      avg_completion_tokens: number;
      zero_token_runs: number;
      null_metric_count: number;
      potential_hallucinations: number;
      hallucination_details: { id: string; issue: string; created_at: string }[];
    }
  > = {};

  // Creative tools where we check for hallucination
  const CREATIVE_TOOLS = ["cover_letter", "linkedin", "interview"];

  for (const r of results || []) {
    if (!toolStats[r.tool_id]) {
      toolStats[r.tool_id] = {
        tool_id: r.tool_id,
        count: 0,
        avg_latency: 0,
        avg_metric: 0,
        avg_prompt_tokens: 0,
        avg_completion_tokens: 0,
        zero_token_runs: 0,
        null_metric_count: 0,
        potential_hallucinations: 0,
        hallucination_details: [],
      };
    }

    const stats = toolStats[r.tool_id];
    stats.count++;
    stats.avg_latency += r.latency_ms || 0;
    stats.avg_metric += r.metric_value || 0;
    stats.avg_prompt_tokens += r.prompt_tokens || 0;
    stats.avg_completion_tokens += r.completion_tokens || 0;

    if (r.tokens_spent === 0 && r.tool_id !== "displacement") {
      stats.zero_token_runs++;
    }

    if (r.metric_value === null || r.metric_value === undefined) {
      stats.null_metric_count++;
    }

    // Hallucination detection for creative tools
    if (CREATIVE_TOOLS.includes(r.tool_id) && r.result) {
      const issues = detectHallucinations(r.tool_id, r.result as Record<string, unknown>);
      if (issues.length > 0) {
        stats.potential_hallucinations++;
        stats.hallucination_details.push({
          id: r.id,
          issue: issues.join("; "),
          created_at: r.created_at,
        });
      }
    }
  }

  // Calculate averages
  for (const stats of Object.values(toolStats)) {
    if (stats.count > 0) {
      stats.avg_latency = Math.round(stats.avg_latency / stats.count);
      stats.avg_metric = Math.round((stats.avg_metric / stats.count) * 10) / 10;
      stats.avg_prompt_tokens = Math.round(stats.avg_prompt_tokens / stats.count);
      stats.avg_completion_tokens = Math.round(stats.avg_completion_tokens / stats.count);
    }
  }

  // 5. Overall summary
  const totalRuns = results?.length || 0;
  const totalHallucinations = Object.values(toolStats).reduce(
    (sum, s) => sum + s.potential_hallucinations,
    0
  );
  const creativeRuns = Object.values(toolStats)
    .filter((s) => CREATIVE_TOOLS.includes(s.tool_id))
    .reduce((sum, s) => sum + s.count, 0);

  return NextResponse.json({
    period: "last_7_days",
    generated_at: new Date().toISOString(),
    summary: {
      total_runs: totalRuns,
      creative_tool_runs: creativeRuns,
      potential_hallucinations: totalHallucinations,
      hallucination_rate: creativeRuns > 0
        ? `${((totalHallucinations / creativeRuns) * 100).toFixed(1)}%`
        : "N/A",
      unique_tools_used: Object.keys(toolStats).length,
    },
    tool_stats: Object.values(toolStats).sort((a, b) => b.count - a.count),
  });
}

/**
 * Basic hallucination detection for creative tool outputs.
 * Checks for common indicators that the LLM invented content:
 * - detected_profile is null/missing
 * - Company names that look fabricated (common AI hallucination patterns)
 */
function detectHallucinations(
  toolId: string,
  result: Record<string, unknown>
): string[] {
  const issues: string[] = [];

  // Check if detected_profile exists and has a real title
  const profile = result.detected_profile as Record<string, unknown> | undefined;
  if (!profile || !profile.current_title || profile.current_title === "Unknown") {
    issues.push("missing or unknown detected_profile");
  }

  // For cover letter: check if highlighted_sections reference companies
  if (toolId === "cover_letter") {
    const content = JSON.stringify(result).toLowerCase();
    // Known AI hallucination company name patterns
    const HALLUCINATION_PATTERNS = [
      "innovatecloud",
      "techsolutions",
      "datasynth",
      "nextgen health",
      "e-commerce solutions",
      "digital dynamics",
      "techforward",
      "cloudpeak",
      "quantumleap",
      "syntheticai",
    ];
    for (const pattern of HALLUCINATION_PATTERNS) {
      if (content.includes(pattern)) {
        issues.push(`potential hallucinated company: "${pattern}"`);
      }
    }
  }

  // For interview: check if suggested answers contain fabricated experience
  if (toolId === "interview") {
    const content = JSON.stringify(result).toLowerCase();
    const HALLUCINATION_PATTERNS = [
      "at my previous company",
      "in my last role at",
      "when i worked at a",
    ];
    for (const pattern of HALLUCINATION_PATTERNS) {
      if (content.includes(pattern)) {
        issues.push(`vague company reference: "${pattern}"`);
      }
    }
  }

  // For linkedin: check about section for fabricated companies
  if (toolId === "linkedin") {
    const content = JSON.stringify(result).toLowerCase();
    const HALLUCINATION_PATTERNS = [
      "innovatecloud",
      "techsolutions",
      "electronic arts",
      "globaltech",
      "futurescape",
    ];
    for (const pattern of HALLUCINATION_PATTERNS) {
      if (content.includes(pattern)) {
        issues.push(`potential hallucinated company: "${pattern}"`);
      }
    }
  }

  return issues;
}
