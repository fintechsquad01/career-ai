import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const pageType = searchParams.get("type");

  // --- Brand / page-type OG images (no hash) ---
  if (!hash && pageType) {
    return renderPageOG(pageType);
  }

  // --- Default brand OG image (no hash, no type) ---
  if (!hash && !pageType) {
    return renderBrandOG();
  }

  // --- Score-specific OG images (with hash) ---
  let type = searchParams.get("type") || "displacement";
  let score = parseInt(searchParams.get("score") || "50");
  let title = searchParams.get("title") || "Career Professional";
  let industry = searchParams.get("industry") || "";

  if (hash && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createAdminClient();
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>{icon}</span>
            <p style={{ fontSize: 16, color: "#6B7280", fontWeight: 600 }}>{label}</p>
          </div>
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
            <span style={{ fontSize: 56, fontWeight: 800, color: scoreColor }}>{score}</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#111827", textAlign: "center", lineHeight: 1.3 }}>
            {title}
          </p>
          {industry && (
            <p style={{ fontSize: 15, color: "#6B7280", marginTop: 4 }}>{industry}</p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28 }}>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, fontWeight: 600 }}>
            What&apos;s YOUR score? Free analysis, 30 seconds.
          </p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>→ aiskillscore.com</p>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

/** Default brand OG image — used when no type or hash specified */
function renderBrandOG() {
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
          background: "linear-gradient(135deg, #2563EB, #7C3AED)",
          fontFamily: "Inter, sans-serif",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: 28,
            padding: "56px 72px",
            width: 700,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 30, color: "white" }}>🧠</span>
            </div>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#111827" }}>AISkillScore</span>
          </div>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#111827",
              textAlign: "center",
              lineHeight: 1.3,
              marginBottom: 12,
            }}
          >
            Stop guessing.
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#111827",
              textAlign: "center",
              lineHeight: 1.3,
              marginBottom: 20,
            }}
          >
            Know exactly where you stand.
          </p>
          <p
            style={{
              fontSize: 16,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            11 AI career tools · Pay per use · No subscriptions
          </p>
        </div>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, fontWeight: 500, marginTop: 28 }}>
          Free AI career analysis in 30 seconds → aiskillscore.com
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

/** Page-specific OG images for pricing, lifetime, and tool pages */
function renderPageOG(pageType: string) {
  const configs: Record<string, { title: string; subtitle: string; badge: string; gradient: { from: string; to: string } }> = {
    pricing: {
      title: "Pay Per Use. No Subscriptions.",
      subtitle: "11 AI career tools from free to $0.098/use\nvs Jobscan $599/yr · Teal $348/yr · FinalRound $1,788/yr",
      badge: "💰 Pricing",
      gradient: { from: "#059669", to: "#2563EB" },
    },
    lifetime: {
      title: "$79 One-Time. 100 Tokens/Month. Forever.",
      subtitle: "Early bird lifetime deal — limited to 500 spots\n30-day money-back guarantee",
      badge: "💎 Lifetime Deal",
      gradient: { from: "#7C3AED", to: "#DB2777" },
    },
  };

  // For tool-type pages, use existing tool data
  if (typeLabels[pageType]) {
    const gradient = typeGradients[pageType] || { from: "#2563EB", to: "#7C3AED" };
    const icon = typeIcons[pageType] || "⚡";
    const label = typeLabels[pageType] || "AI Career Tool";

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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "white",
              borderRadius: 28,
              padding: "56px 72px",
              width: 700,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <span style={{ fontSize: 48, marginBottom: 16 }}>{icon}</span>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#111827", textAlign: "center", marginBottom: 12 }}>
              {label}
            </p>
            <p style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}>
              AI-powered analysis · Pay per use · AISkillScore
            </p>
          </div>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, fontWeight: 500, marginTop: 28 }}>
            Try it free → aiskillscore.com
          </p>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Pricing or Lifetime
  const config = configs[pageType] || configs.pricing;

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
          background: `linear-gradient(135deg, ${config.gradient.from}, ${config.gradient.to})`,
          fontFamily: "Inter, sans-serif",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: 28,
            padding: "56px 72px",
            width: 700,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <p
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#6B7280",
              marginBottom: 16,
            }}
          >
            {config.badge}
          </p>
          <p
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#111827",
              textAlign: "center",
              lineHeight: 1.3,
              marginBottom: 20,
            }}
          >
            {config.title}
          </p>
          <p
            style={{
              fontSize: 15,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 1.6,
              whiteSpace: "pre-line",
            }}
          >
            {config.subtitle}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 20, color: "white" }}>🧠</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 20, fontWeight: 700 }}>AISkillScore</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginLeft: 8 }}>→ aiskillscore.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
