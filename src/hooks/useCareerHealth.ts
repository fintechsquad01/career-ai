import { useMemo } from "react";
import type { CareerProfile, ToolResultRow } from "@/types";

export interface CareerHealthData {
  /** Composite score 0-100, or null if no data */
  score: number | null;
  /** Individual component scores */
  components: {
    ats: number | null;
    aiRisk: number | null;
    skillsCurrency: number | null;
  };
  /** Trend direction based on recent results */
  trend: "up" | "down" | "stable" | "new";
  /** Human-readable insight about the score */
  insight: string;
  /** Suggested action based on weakest area */
  suggestedAction: {
    label: string;
    href: string;
    reason: string;
  } | null;
  /** Milestones achieved */
  milestones: {
    id: string;
    label: string;
    achieved: boolean;
  }[];
}

/** Compute a composite Career Health Score with trends and milestones */
export function useCareerHealth(
  careerProfile: CareerProfile | null,
  results: ToolResultRow[]
): CareerHealthData {
  return useMemo(() => {
    const ats = careerProfile?.resume_score ?? null;
    const displacement = careerProfile?.displacement_score ?? null;

    // Compute component scores
    const aiRiskHealth = displacement !== null ? 100 - displacement : null;
    const skillsSignal = results.length > 0 ? Math.min(100, results.length * 15 + 30) : null;

    const components = {
      ats,
      aiRisk: displacement,
      skillsCurrency: skillsSignal,
    };

    // Compute composite score
    const scores: number[] = [];
    if (ats !== null) scores.push(ats);
    if (aiRiskHealth !== null) scores.push(aiRiskHealth);
    if (skillsSignal !== null) scores.push(skillsSignal);

    const score = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    // Determine trend from recent results
    const recentResults = results
      .filter((r) => r.metric_value !== null && r.metric_value !== undefined)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    let trend: CareerHealthData["trend"] = "new";
    if (recentResults.length >= 2) {
      const recent = recentResults.slice(0, 3).reduce((sum, r) => sum + (r.metric_value ?? 0), 0) / Math.min(3, recentResults.length);
      const older = recentResults.slice(3, 6).reduce((sum, r) => sum + (r.metric_value ?? 0), 0) / Math.min(3, recentResults.slice(3, 6).length || 1);
      if (recentResults.length < 4) {
        trend = "stable";
      } else if (recent > older + 5) {
        trend = "up";
      } else if (recent < older - 5) {
        trend = "down";
      } else {
        trend = "stable";
      }
    } else if (score !== null) {
      trend = "new";
    }

    // Generate insight
    let insight: string;
    if (score === null) {
      insight = "Run your first analysis to establish your Career Health baseline.";
    } else if (score < 40) {
      insight = "Your career health needs attention. Focus on fixing ATS issues first — they're the biggest barrier to getting interviews.";
    } else if (score < 60) {
      insight = "You're building a solid foundation. A few targeted improvements will significantly increase your interview rate.";
    } else if (score < 80) {
      insight = "Good career health. Consistency and skill development will keep you competitive in a shifting market.";
    } else {
      insight = "Excellent career positioning. You're well-prepared for opportunities. Stay sharp with monthly check-ins.";
    }

    // Suggested action based on weakest area
    let suggestedAction: CareerHealthData["suggestedAction"] = null;
    if (ats !== null && ats < 50) {
      suggestedAction = {
        label: "Fix Resume ATS Issues",
        href: "/tools/resume",
        reason: `Your ATS score is ${ats}/100 — most applications need 70+ to pass automated screening.`,
      };
    } else if (displacement !== null && displacement > 70) {
      suggestedAction = {
        label: "Build AI-Resistant Skills",
        href: "/tools/skills_gap",
        reason: `Your AI displacement risk is ${displacement}% — identify skills that keep you relevant.`,
      };
    } else if (results.length === 0) {
      suggestedAction = {
        label: "Start Free Analysis",
        href: "/tools/displacement",
        reason: "Get your baseline Career Health Score with a free AI Displacement analysis.",
      };
    } else if (!results.some((r) => r.tool_id === "jd_match")) {
      suggestedAction = {
        label: "Match Against a Job",
        href: "/tools/jd_match",
        reason: "See how well you match a specific role to focus your preparation.",
      };
    }

    // Milestones
    const toolsRan = new Set(results.map((r) => r.tool_id));
    const milestones: CareerHealthData["milestones"] = [
      {
        id: "first_analysis",
        label: "First analysis completed",
        achieved: results.length > 0,
      },
      {
        id: "ats_above_70",
        label: "ATS score above 70",
        achieved: ats !== null && ats >= 70,
      },
      {
        id: "three_tools",
        label: "Used 3+ different tools",
        achieved: toolsRan.size >= 3,
      },
      {
        id: "full_journey",
        label: "Completed full job search journey",
        achieved: ["displacement", "jd_match", "resume", "cover_letter", "interview"].every((t) => toolsRan.has(t)),
      },
      {
        id: "career_health_80",
        label: "Career Health Score 80+",
        achieved: score !== null && score >= 80,
      },
    ];

    return {
      score,
      components,
      trend,
      insight,
      suggestedAction,
      milestones,
    };
  }, [careerProfile, results]);
}
