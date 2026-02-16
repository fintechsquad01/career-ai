"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";

interface NpsWidgetProps {
  toolId: string;
  onDismiss: () => void;
}

export function NpsWidget({ toolId, onDismiss }: NpsWidgetProps) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (score === null) return;
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      await supabase.from("feedback").insert({
        user_id: session?.user?.id || null,
        tool_id: toolId,
        nps_score: score,
        comment: comment.trim() || null,
      });

      track("nps_submitted", { tool_id: toolId, score });
      setSubmitted(true);
    } catch {
      // Silently fail — don't block the user
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center animate-in fade-in duration-300">
        <p className="text-sm font-medium text-green-800">Thanks for your feedback!</p>
        {score !== null && score >= 9 && (
          <p className="text-xs text-green-600 mt-1">
            Love AISkillScore? <a href="/referral" className="underline font-medium">Give a friend 15 tokens, get 10 for yourself →</a>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">How useful was this analysis?</p>
        <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600">
          Skip
        </button>
      </div>

      {/* Score buttons 1-10 */}
      <div className="flex gap-1.5 justify-between">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setScore(n)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              score === n
                ? n <= 6
                  ? "bg-red-500 text-white scale-110"
                  : n <= 8
                    ? "bg-amber-500 text-white scale-110"
                    : "bg-green-500 text-white scale-110"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 px-1">
        <span>Not useful</span>
        <span>Extremely useful</span>
      </div>

      {/* Optional comment */}
      {score !== null && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={score >= 9 ? "What did you love? (optional)" : "How can we improve? (optional)"}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      )}
    </div>
  );
}
