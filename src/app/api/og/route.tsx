import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const typeLabels: Record<string, string> = {
  displacement: "AI Displacement Score",
  jd_match: "Job Match Score",
  resume: "ATS Score",
};

function getColor(score: number) {
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
      .single();
    if (data) {
      type = data.score_type || type;
      score = data.score_value ?? score;
      title = data.title || title;
      industry = data.industry || industry;
    }
  }

  const color = getColor(score);

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", fontFamily: "Inter, sans-serif", padding: 60 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "white", borderRadius: 24, padding: 48, width: 500 }}>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>{typeLabels[type] || "Score"}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 140, height: 140, borderRadius: 70, border: `8px solid ${color}`, marginBottom: 16 }}>
            <span style={{ fontSize: 48, fontWeight: 700, color }}>{score}</span>
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{title}</p>
          {industry && <p style={{ fontSize: 14, color: "#6B7280" }}>{industry}</p>}
        </div>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginTop: 24 }}>What&apos;s YOUR score? → careerai.com</p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
