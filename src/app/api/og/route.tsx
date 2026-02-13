import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const typeLabels: Record<string, string> = {
  displacement: "AI Displacement Score",
  jd_match: "Job Match Score",
  resume: "ATS Score",
  cover_letter: "Cover Letter",
  linkedin: "LinkedIn Strength",
  skills_gap: "Skills Gap Analysis",
  roadmap: "Career Roadmap",
  salary: "Salary Range",
  entrepreneurship: "Founder-Market Fit",
};

const typeIcons: Record<string, string> = {
  displacement: "🛡️",
  jd_match: "🎯",
  resume: "📄",
  cover_letter: "✉️",
  linkedin: "💼",
  skills_gap: "📊",
  roadmap: "🗺️",
  salary: "💰",
  entrepreneurship: "🚀",
};

const typeGradients: Record<string, { from: string; to: string }> = {
  displacement: { from: "#DC2626", to: "#F97316" },
  jd_match: { from: "#2563EB", to: "#06B6D4" },
  resume: { from: "#2563EB", to: "#7C3AED" },
  cover_letter: { from: "#7C3AED", to: "#DB2777" },
  linkedin: { from: "#0077B5", to: "#00A0DC" },
  skills_gap: { from: "#059669", to: "#2563EB" },
  roadmap: { from: "#7C3AED", to: "#2563EB" },
  salary: { from: "#059669", to: "#10B981" },
  entrepreneurship: { from: "#7C3AED", to: "#A855F7" },
};

function getScoreColor(score: number) {
  return score < 40 ? "#EF4444" : score < 70 ? "#F59E0B" : "#22C55E";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const hash = searchParams.get("hash");

  let type = searchParams.get("type") || "displacement";
  let score = parseInt(searchParams.get("score") || "50");
  let title = searchParams.get("title") || "Career Professional";
  let industry = searchParams.get("industry") || "";

  if (hash && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data } = await supabase
      .from("shared_scores")
      .select("score_type, score_value, title, industry")
      .eq("hash", hash)
      .maybeSingle();
    if (data) {
      type = data.score_type || type;
      score = data.score_value ?? score;
      title = data.title || title;
      industry = data.industry || industry;
    }
  }

  const scoreColor = getScoreColor(score);
  const gradient = typeGradients[type] || { from: "#2563EB", to: "#7C3AED" };
  const icon = typeIcons[type] || "⚡";
  const label = typeLabels[type] || "Score";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
          fontFamily: "Inter, sans-serif",
          padding: 60,
        }}
      >
        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: 28,
            padding: "48px 64px",
            width: 560,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Icon + Label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 28 }}>{icon}</span>
            <p style={{ fontSize: 16, color: "#6B7280", fontWeight: 600 }}>
              {label}
            </p>
          </div>

          {/* Score Ring */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 160,
              height: 160,
              borderRadius: 80,
              border: `10px solid ${scoreColor}`,
              marginBottom: 20,
              background: `linear-gradient(180deg, ${scoreColor}10, ${scoreColor}05)`,
            }}
          >
            <span style={{ fontSize: 56, fontWeight: 800, color: scoreColor }}>
              {score}
            </span>
          </div>

          {/* Title */}
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111827",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {title}
          </p>
          {industry && (
            <p
              style={{
                fontSize: 15,
                color: "#6B7280",
                marginTop: 4,
              }}
            >
              {industry}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 28,
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            What&apos;s YOUR score? Free analysis, 30 seconds.
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 16,
            }}
          >
            → aiskillscore.com
          </p>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
