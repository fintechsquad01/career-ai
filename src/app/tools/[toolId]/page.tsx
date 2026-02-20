import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { ToolPageContent } from "@/components/tools/ToolPageContent";
import { TOOLS_MAP, TOOLS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

interface ToolPageProps {
  params: Promise<{ toolId: string }>;
}

// Generate static params for all tool pages
export async function generateStaticParams() {
  return TOOLS.map((tool) => ({ toolId: tool.id }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { toolId } = await params;
  const tool = TOOLS_MAP[toolId];
  if (!tool) {
    return { title: "Tool Not Found — AISkillScore" };
  }

  const priceLabel = tool.tokens === 0 ? "Free" : `${tool.tokens} tokens`;

  return {
    title: `${tool.title} — AI ${tool.category} Tool | AISkillScore`,
    description: `${tool.description}. ${priceLabel}. ${tool.painPoint || ""} Powered by Gemini 2.5 Pro.`.trim(),
    alternates: {
      canonical: `${APP_URL}/tools/${toolId}`,
    },
    openGraph: {
      title: `${tool.title} — ${priceLabel} | AISkillScore`,
      description: `${tool.description}. ${tool.vsCompetitor || `${priceLabel} — pay per use, no subscriptions.`}`,
      url: `${APP_URL}/tools/${toolId}`,
      images: [
        {
          url: `${APP_URL}/api/og?type=${toolId}`,
          width: 1200,
          height: 630,
          alt: `${tool.title} — AISkillScore`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.title} — ${priceLabel} | AISkillScore`,
      description: tool.description,
      images: [`${APP_URL}/api/og?type=${toolId}`],
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: careerProfile } = await supabase
    .from("career_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: allJobTargets } = await supabase
    .from("job_targets")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const activeJobTarget = allJobTargets?.find((t) => t.is_active) ?? null;

  // Service schema for individual tool SEO
  const tool = TOOLS_MAP[toolId];
  const serviceJsonLd = tool ? {
    "@context": "https://schema.org",
    "@type": "Service",
    name: tool.title,
    description: tool.description,
    provider: {
      "@type": "Organization",
      name: "AISkillScore",
      url: APP_URL,
    },
    serviceType: `AI ${tool.category} Tool`,
    offers: {
      "@type": "Offer",
      price: tool.tokens === 0 ? "0" : String(tool.tokens * 0.195),
      priceCurrency: "USD",
      description: tool.tokens === 0 ? "Free — no tokens required" : `${tool.tokens} tokens (from $${(tool.tokens * 0.158).toFixed(2)} at Power rate)`,
    },
    ...(tool.painPoint ? { slogan: tool.painPoint } : {}),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".tool-description", "h1"],
    },
  } : null;

  const TOOL_STEPS: Record<string, string[]> = {
    displacement: ["Enter your job title and industry", "AI analyzes task-level automation risk", "Review your displacement score and safe skills", "Get actionable upskilling recommendations"],
    jd_match: ["Paste a job description or URL", "AI extracts requirements and matches against your resume", "Review fit score with evidence-backed gaps", "Get prioritized next steps to improve your match"],
    resume: ["Upload or paste your resume", "AI analyzes ATS compatibility and content quality", "Review optimized resume with change rationale", "Download your ATS-ready resume"],
    cover_letter: ["Select your target job context", "AI generates a role-specific narrative from your experience", "Review and customize the draft", "Download your cover letter"],
    interview: ["Provide your target role and company context", "AI generates likely questions with follow-ups", "Practice STAR-format answers", "Review preparation guide"],
    linkedin: ["Share your current LinkedIn profile content", "AI audits headline, summary, and keyword strategy", "Review optimization recommendations", "Apply changes to your profile"],
    skills_gap: ["Provide your current skills and target role", "AI maps gaps against market requirements", "Review prioritized learning plan", "Follow week-by-week skill building path"],
    roadmap: ["Share your career context and goals", "AI builds a dual-track plan with milestones", "Review weekly checkpoints and actions", "Track progress against your roadmap"],
    salary: ["Enter your target role and location", "AI benchmarks market compensation data", "Review negotiation scripts and leverage points", "Prepare for your compensation conversation"],
    entrepreneurship: ["Share your skills and experience", "AI evaluates founder-market fit and opportunities", "Review business model suggestions", "Follow 90-day launch action plan"],
    headshots: ["Upload your photos", "AI generates professional headshot variants", "Review and select your favorites", "Download LinkedIn-ready images"],
  };

  const howToJsonLd = tool ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.title}`,
    description: tool.description,
    totalTime: "PT1M",
    tool: { "@type": "HowToTool", name: "AISkillScore" },
    step: (TOOL_STEPS[toolId] || []).map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  } : null;

  return (
    <AppShell
      isLoggedIn={true}
      profile={profile}
      careerProfile={careerProfile}
      activeJobTarget={activeJobTarget}
      jobTargets={allJobTargets || []}
    >
      {serviceJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ToolPageContent toolId={toolId} />
    </AppShell>
  );
}
