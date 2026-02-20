import { createAdminClient } from "@/lib/supabase/admin";
import { Ring } from "@/components/shared/Ring";
import { TOOLS_MAP, CANONICAL_COPY } from "@/lib/constants";
import Link from "next/link";
import { Brain, ArrowRight, Users, Star, TrendingUp, Twitter, Linkedin, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

interface SharePageProps {
  params: Promise<{ hash: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  displacement: TOOLS_MAP.displacement.title,
  jd_match: TOOLS_MAP.jd_match.title,
  resume: TOOLS_MAP.resume.title,
  cover_letter: TOOLS_MAP.cover_letter.title,
  linkedin: TOOLS_MAP.linkedin.title,
  skills_gap: TOOLS_MAP.skills_gap.title,
  roadmap: TOOLS_MAP.roadmap.title,
  salary: TOOLS_MAP.salary.title,
  entrepreneurship: TOOLS_MAP.entrepreneurship.title,
  headshots: TOOLS_MAP.headshots.title,
};

function getScoreLabel(scoreType?: string): string {
  if (!scoreType) return "Career Score";
  return TYPE_LABELS[scoreType] || "Career Score";
}

export async function generateMetadata({ params }: SharePageProps) {
  const { hash } = await params;

  // Try to fetch score data for rich metadata
  let title = "Career Score — AISkillScore";
  let description = "See this AI-powered career analysis. Get your own score free in 30 seconds.";

  try {
    const supabase = createAdminClient();
    const { data: score } = await supabase
      .from("shared_scores")
      .select("score_type, score_value, title, industry")
      .eq("hash", hash)
      .maybeSingle();

    if (score) {
      const typeLabel = getScoreLabel(score.score_type);
      title = `${typeLabel}: ${score.score_value}/100 — AISkillScore`;
      description = `${typeLabel} scored ${score.score_value}/100 on AISkillScore, an AI-powered career intelligence platform.${score.industry ? ` Industry: ${score.industry}.` : ""} ${score.title ? `${score.title}. ` : ""}Get your own evidence-first analysis in 30 seconds.`;
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

  const shareUrl = `${APP_URL}/share/${hash}`;
  const scoreLabel = getScoreLabel(score.score_type);
  const sharePageDescription = `${scoreLabel} result from AISkillScore, an AI-powered career intelligence platform. Match your resume to the exact job before you apply.`;
  const scoreText = `${scoreLabel} score: ${score.score_value}/100${score.industry ? ` in ${score.industry}` : ""}.`;

  const shareWebPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${shareUrl}#webpage`,
    url: shareUrl,
    name: `${scoreLabel}: ${score.score_value}/100 — AISkillScore`,
    description: sharePageDescription,
    isPartOf: { "@id": `${APP_URL}/#website` },
    about: {
      "@type": "DefinedTerm",
      name: scoreLabel,
      inDefinedTermSet: `${APP_URL}/tools`,
      description: "AISkillScore score taxonomy for AI-powered career analysis.",
    },
    mainEntity: {
      "@type": "CreativeWork",
      "@id": `${shareUrl}#result`,
      name: `${scoreLabel} result`,
      description: score.title || `${scoreLabel} score shared from AISkillScore.`,
      creator: { "@id": `${APP_URL}/#organization` },
      text: scoreText,
      genre: "AI-powered career intelligence platform",
    },
  };

  const shareServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: scoreLabel,
    category: "AI-powered career intelligence platform",
    serviceType: "AI career analysis",
    provider: { "@id": `${APP_URL}/#organization` },
    areaServed: "Global",
    url: `${APP_URL}/tools/${score.score_type}`,
    description: `AISkillScore ${scoreLabel} provides evidence-first career analysis from user inputs in about 30 seconds.`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Shared Score", item: shareUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shareWebPageJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shareServiceJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
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
              {scoreLabel}
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
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My ${scoreLabel}: ${score.score_value}/100 on AISkillScore`)}&url=${encodeURIComponent(`${APP_URL}/share/${hash}`)}`}
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
            AISkillScore is an AI-powered career intelligence platform that gives evidence-first analysis in about 30 seconds.{" "}
            {score.score_type === "displacement"
              ? "1 in 4 workers have roles exposed to generative AI. Run your own risk analysis free."
              : "Run your own score free to start and see exactly where you stand."}
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
            {CANONICAL_COPY.signup.cta}
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
