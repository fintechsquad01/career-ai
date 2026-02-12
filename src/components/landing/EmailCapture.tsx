"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CaptureContext = "resume_xray" | "jd_match" | "pricing" | "landing_footer" | "tool_result";

interface EmailCaptureProps {
  context: CaptureContext;
}

export function EmailCapture({ context }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [validationError, setValidationError] = useState("");

  const trimmedEmail = email.trim();
  const isValidEmail = trimmedEmail.length > 0 && EMAIL_REGEX.test(trimmedEmail);
  const isSubmitDisabled = !isValidEmail || status === "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!trimmedEmail) {
      setValidationError("Please enter your email.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      if (SUPABASE_URL) {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/capture-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, context }),
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationError) setValidationError("");
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm py-2" role="status" aria-live="polite">
        <Check className="w-5 h-5 flex-shrink-0" />
        <span>You&apos;re on the list! We&apos;ll send you career tips and product updates.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-gray-600 mb-2">
        Get career tips and early access — enter your email
      </p>
      <div className="flex gap-2">
        <input
          id="email-capture"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="you@example.com"
          disabled={status === "loading"}
          aria-label="Email address"
          aria-invalid={!!validationError || status === "error"}
          className="flex-1 min-h-[44px] px-4 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="min-h-[44px] px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === "loading" ? "Saving..." : "Save Results"}
        </button>
      </div>
      {(validationError || status === "error") && (
        <p className="text-xs text-red-500">
          {validationError || "Something went wrong. Try again."}
        </p>
      )}
    </form>
  );
}
