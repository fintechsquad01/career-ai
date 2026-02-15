"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Brain, Loader2, Lock, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasPreAuthAnalysis, setHasPreAuthAnalysis] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  const supabase = createClient();

  // Check for pre-auth analysis and errors
  useEffect(() => {
    const preAuthJd = localStorage.getItem("aiskillscore_pre_auth_jd");
    setHasPreAuthAnalysis(!!preAuthJd);

    const callbackError = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    if (callbackError) {
      if (errorDescription) {
        setError(`Google sign-in failed: ${decodeURIComponent(errorDescription)}. Please try email sign-in instead.`);
      } else {
        setError(decodeURIComponent(callbackError));
      }
    }
  }, [searchParams]);

  // Store referral code
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("aiskillscore_referral_code", ref);
    }
  }, [searchParams]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError("Google sign-in is temporarily unavailable. Please use email sign-in instead.");
      }
    } catch {
      setError("Google sign-in is temporarily unavailable. Please use email sign-in instead.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;

        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) throw signInError;
        }

        if (refCode) {
          localStorage.setItem("aiskillscore_referral_code", refCode);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      const preAuthJd = localStorage.getItem("aiskillscore_pre_auth_jd");
      router.push(preAuthJd ? "/mission" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-400/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-gray-900">AISkillScore</span>
        </Link>

        {/* Pre-auth analysis preview card */}
        {hasPreAuthAnalysis && mode === "signup" && (
          <div className="glass-card p-4 mb-4 flex items-center gap-3 border-blue-200 bg-blue-50/50">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Your analysis is ready</p>
              <p className="text-xs text-gray-500">Sign up to unlock your full results and action plan.</p>
            </div>
          </div>
        )}

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2 tracking-tight">
            {mode === "signup"
              ? hasPreAuthAnalysis
                ? "Unlock your results"
                : "Get started free"
              : "Welcome back"
            }
          </h1>
          {mode === "signup" && (
            <p className="text-sm text-gray-500 text-center mb-6">
              No credit card required. Set up in 30 seconds.
            </p>
          )}
          {mode === "signin" && <div className="mb-6" />}

          {/* Google OAuth — primary CTA */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-400">or continue with email</span>
            </div>
          </div>

          {/* Email + Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
                  placeholder="Sarah Chen"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
                placeholder="sarah@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signup"
                ? hasPreAuthAnalysis
                  ? "Unlock Results — Free"
                  : "Create Account — 15 Free Tokens + 2 Daily"
                : "Sign In"
              }
            </button>
          </form>

          {mode === "signup" && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Join 500+ professionals. No credit card required.
            </p>
          )}

          <p className="mt-5 text-center text-sm text-gray-500">
            {mode === "signup" ? (
              <>
                Have an account?{" "}
                <button onClick={() => { setMode("signin"); setError(""); }} className="text-blue-600 font-medium hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                New?{" "}
                <button onClick={() => { setMode("signup"); setError(""); }} className="text-blue-600 font-medium hover:underline">
                  Sign up free
                </button>
              </>
            )}
          </p>
        </div>

        {/* Trust signals */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Encrypted
          </span>
          <span>·</span>
          <span>Never sold</span>
          <span>·</span>
          <span>30 second setup</span>
        </div>
      </div>
    </div>
  );
}
