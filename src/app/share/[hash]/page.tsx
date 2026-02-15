import { createAdminClient } from "@/lib/supabase/admin";
import { Ring } from "@/components/shared/Ring";
import Link from "next/link";
import { Brain, ArrowRight, Users, Star, TrendingUp, Twitter, Linkedin, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

interface SharePageProps {
  params: Promise<{ hash: string }>;
}

const TYPE_LABELS: Record<string, string> = {
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

export async function generateMetadata({ params }: SharePageProps) {
  const { hash } = await params;

  // Try to fetch score data for rich metadata
  let title = "Career Score — AISkillScore";
  let description = "See this AI-powered career analysis. Get your own score free in 30 seconds.";
  let scoreValue: number | null = null;
  let scoreType = "";

  try {
    const supabase = createAdminClient();
    const { data: score } = await supabase
      .from("shared_scores")
      .select("score_type, score_value, title, industry")
      .eq("hash", hash)
      .maybeSingle();

    if (score) {
      const typeLabel = TYPE_LABELS[score.score_type] || "Career Score";
      scoreType = score.score_type;
      scoreValue = score.score_value;
      title = `${typeLabel}: ${score.score_value}/100 — AISkillScore`;
      description = `${score.title ? `${score.title} — ` : ""}${typeLabel} scored ${score.score_value}/100.${score.industry ? ` Industry: ${score.industry}.` : ""} Get your own AI career analysis free.`;
    }
  } catch {
    // Fallback to generic metadata
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/share/${hash}`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/share/${hash}`,
      images: [
        {
          url: `${APP_URL}/api/og?hash=${hash}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [`${APP_URL}/api/og?hash=${hash}`],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { hash } = await params;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("shared_scores")
    .select("*")
    .eq("hash", hash)
    .maybeSingle();
  const score = data;

  if (score) {
    await supabase.rpc("increment_view_count", { p_score_id: score.id });
  }

  if (!score) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Score not found</h1>
          <p className="text-gray-500 mb-6">This share link may have expired.</p>
          <Link href="/" className="text-blue-600 font-medium hover:underline">
            Get your own score →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="glass-card shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">AISkillScore</span>
          </div>

          {/* Score */}
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-gray-500 mb-4">
              {TYPE_LABELS[score.score_type] || "Career Score"}
            </p>
            <Ring score={score.score_value || 0} size="lg" />
            {score.title && (
              <p className="mt-4 font-semibold text-gray-900">{score.title}</p>
            )}
            {score.industry && (
              <p className="text-sm text-gray-500">{score.industry}</p>
            )}
          </div>

          {/* Share buttons */}
          <div className="px-6 pb-4">
            <div className="flex gap-3 justify-center">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My ${TYPE_LABELS[score.score_type] || "Career Score"}: ${score.score_value}/100 on AISkillScore`)}&url=${encodeURIComponent(`${APP_URL}/share/${hash}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                <Twitter className="w-4 h-4" /> Twitter/X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${APP_URL}/share/${hash}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            </div>
            {score.view_count > 0 && (
              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" /> Viewed {score.view_count.toLocaleString()} times
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="px-6 pb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-base font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px]"
            >
              Get YOUR score in 30 seconds — free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Conversion section for visitors */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 text-center">
            {score.score_type === "displacement" 
              ? "Is AI coming for YOUR job?" 
              : "How do YOU compare?"}
          </h3>
          <p className="text-sm text-gray-500 text-center">
            {score.score_type === "displacement"
              ? "1 in 4 workers have roles exposed to generative AI. Get your own AI risk analysis — free, 30 seconds, no signup."
              : "Get your own AI career analysis in 30 seconds. Free to start, no credit card needed."}
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-lg font-bold text-blue-700">11</p>
              <p className="text-[10px] text-blue-600">AI Tools</p>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl">
              <p className="text-lg font-bold text-violet-700">30s</p>
              <p className="text-[10px] text-violet-600">Analysis</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-lg font-bold text-green-700">Free</p>
              <p className="text-[10px] text-green-600">To Start</p>
            </div>
          </div>
          <Link
            href="/auth"
            className="block w-full py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-xl text-center hover:opacity-90 transition-opacity min-h-[48px]"
          >
            Create Free Account — 15 Tokens
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 11 AI career tools</span>
          <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Pay per use, no subscription</span>
          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 30-second analysis</span>
        </div>
      </div>
    </div>
  );
}
