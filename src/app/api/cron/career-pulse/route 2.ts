import { NextResponse } from "next/server";
import { sendCareerPulse } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/career-pulse
 * 
 * Monthly cron that sends "Career Pulse" emails to users with career profiles.
 * Runs on the 1st of each month.
 * 
 * For each user with a career profile (title + industry), generates a lightweight
 * displacement score estimate and sends a monthly update email.
 */
export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: "Missing config" }, { status: 500 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey,
    );

    const results = { sent: 0, skipped: 0, errors: 0 };

    // Get users with career profiles who have title + industry
    const { data: profiles } = await supabaseAdmin
      .from("career_profiles")
      .select("user_id, title, industry, name")
      .not("title", "is", null)
      .not("industry", "is", null)
      .limit(500);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ ...results, message: "No eligible profiles" });
    }

    // Get the latest displacement score for each user (if they've run the tool before)
    const userIds = profiles.map(p => p.user_id);
    const { data: latestScores } = await supabaseAdmin
      .from("tool_results")
      .select("user_id, metric_value, created_at")
      .eq("tool_id", "displacement")
      .in("user_id", userIds)
      .order("created_at", { ascending: false });

    // Build a map of user -> latest displacement score
    const scoreMap = new Map<string, { score: number; date: string }>();
    for (const score of latestScores || []) {
      if (!scoreMap.has(score.user_id) && score.metric_value != null) {
        scoreMap.set(score.user_id, { score: score.metric_value, date: score.created_at });
      }
    }

    // Emerging skills by industry (lightweight — avoids API calls)
    const EMERGING_SKILLS: Record<string, string> = {
      "Technology": "AI/ML Engineering & Prompt Engineering",
      "Finance & Banking": "AI Risk Assessment & Quantitative Modeling",
      "Healthcare": "Clinical AI Integration & Health Informatics",
      "Education": "AI-Assisted Pedagogy & Learning Analytics",
      "Marketing & Advertising": "AI Content Strategy & Predictive Analytics",
      "Legal": "Legal AI Operations & Contract Intelligence",
      "Manufacturing": "Robotics Process Automation & Digital Twin Management",
      "Retail & E-commerce": "AI-Driven Personalization & Supply Chain Intelligence",
      "Media & Entertainment": "Generative AI Production & AI Content Ethics",
      "Consulting": "AI Strategy Advisory & Change Management",
      "Real Estate": "PropTech AI & Automated Valuation Models",
      "Government": "AI Policy & Digital Government Transformation",
      "Nonprofit": "Impact Analytics & AI-Assisted Grant Writing",
    };

    for (const profile of profiles) {
      try {
        // Get user email
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
        if (!authUser?.user?.email) {
          results.skipped++;
          continue;
        }

        // Check notification preferences
        const { data: profileData } = await supabaseAdmin
          .from("profiles")
          .select("notification_preferences")
          .eq("id", profile.user_id)
          .single();

        if (profileData?.notification_preferences && 
            typeof profileData.notification_preferences === "object" &&
            (profileData.notification_preferences as Record<string, unknown>).product_updates === false) {
          results.skipped++;
          continue;
        }

        // Use existing score or generate a simple estimate
        const existingScore = scoreMap.get(profile.user_id);
        const displacementScore = existingScore?.score ?? estimateDisplacementScore(profile.title, profile.industry);
        
        // Determine change direction (compare to previous if available)
        const changeDirection: "up" | "down" | "stable" = existingScore 
          ? "stable" // We'd need historical data to compute real change
          : "stable";

        const topSkill = EMERGING_SKILLS[profile.industry] || "AI Literacy & Adaptive Problem-Solving";

        await sendCareerPulse(
          authUser.user.email,
          profile.name || authUser.user.email.split("@")[0],
          profile.title,
          profile.industry,
          displacementScore,
          topSkill,
          changeDirection,
        );

        results.sent++;
      } catch {
        results.errors++;
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("[CareerPulse] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Simple displacement score estimate based on role and industry.
 * Used when the user hasn't run the displacement tool yet.
 * This is intentionally rough — the goal is to intrigue them into running the full analysis.
 */
function estimateDisplacementScore(title: string, industry: string): number {
  const titleLower = title.toLowerCase();
  const industryLower = industry.toLowerCase();

  // Higher risk roles
  if (titleLower.includes("data entry") || titleLower.includes("bookkeep") || titleLower.includes("transcription")) return 82;
  if (titleLower.includes("copywriter") || titleLower.includes("content writer")) return 71;
  if (titleLower.includes("analyst") && !titleLower.includes("senior")) return 58;
  if (titleLower.includes("customer service") || titleLower.includes("support")) return 65;
  
  // Lower risk roles
  if (titleLower.includes("manager") || titleLower.includes("director") || titleLower.includes("vp")) return 35;
  if (titleLower.includes("nurse") || titleLower.includes("doctor") || titleLower.includes("therapist")) return 22;
  if (titleLower.includes("teacher") || titleLower.includes("professor")) return 30;
  if (titleLower.includes("sales") && titleLower.includes("engineer")) return 28;
  
  // Industry adjustments
  if (industryLower.includes("tech")) return 48;
  if (industryLower.includes("healthcare")) return 32;
  if (industryLower.includes("finance")) return 52;
  if (industryLower.includes("legal")) return 45;
  
  return 45; // Default moderate risk
}
