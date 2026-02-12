import { createClient } from "@supabase/supabase-js";
import { Ring } from "@/components/shared/Ring";
import Link from "next/link";
import { Brain, ArrowRight, Users, Star, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

interface SharePageProps {
  params: Promise<{ hash: string }>;
}

export async function generateMetadata({ params }: SharePageProps) {
  const { hash } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://careerai.com";
  return {
    openGraph: {
      images: [`${appUrl}/api/og?hash=${hash}`],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { hash } = await params;

  let score = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data } = await supabase
      .from("shared_scores")
      .select("*")
      .eq("hash", hash)
      .single();
    score = data;

    if (score) {
      await supabase
        .from("shared_scores")
        .update({ view_count: (score.view_count || 0) + 1 } as Record<string, unknown>)
        .eq("id", score.id);
    }
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

  const typeLabels: Record<string, string> = {
    displacement: "AI Displacement Score",
    jd_match: "Job Match Score",
    resume: "ATS Score",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">CareerAI</span>
          </div>

          {/* Score */}
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-gray-500 mb-4">
              {typeLabels[score.score_type] || "Career Score"}
            </p>
            <Ring score={score.score_value || 0} size="lg" />
            {score.title && (
              <p className="mt-4 font-semibold text-gray-900">{score.title}</p>
            )}
            {score.industry && (
              <p className="text-sm text-gray-500">{score.industry}</p>
            )}
          </div>

          {/* CTA */}
          <div className="px-6 pb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-base font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px]"
            >
              What&apos;s YOUR score?
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 12,400+ scores</span>
          <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 4.8/5 rating</span>
          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 73% take action</span>
        </div>
      </div>
    </div>
  );
}
