"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

type CaptureContext = "resume_xray" | "jd_match";

interface EmailCaptureProps {
  context: CaptureContext;
}

export function EmailCapture({ context }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    try {
      if (SUPABASE_URL) {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/capture-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), context }),
        });

        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm py-2">
        <Check className="w-5 h-5 flex-shrink-0" />
        <span>Results saved! Check your email for the PDF.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-gray-600 mb-2">
        Save your results as PDF — enter your email
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={status === "loading"}
          className="flex-1 min-h-[44px] px-4 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="min-h-[44px] px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === "loading" ? "Saving..." : "Save Results"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-500">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
