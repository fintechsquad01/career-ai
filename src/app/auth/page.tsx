"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Brain, Loader2, Mail, ChevronDown } from "lucide-react";
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
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  const supabase = createClient();

  // Read error from OAuth callback
  useEffect(() => {
    const callbackError = searchParams.get("error");
    if (callbackError) {
      setError(decodeURIComponent(callbackError));
    }
  }, [searchParams]);

  // Read referral code from query params if present
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("aiskillscore_referral_code", ref);
    }
  }, [searchParams]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setMagicLinkLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: fullName ? { full_name: fullName } : undefined,
        },
      });
      if (error) throw error;
      if (refCode) {
        localStorage.setItem("aiskillscore_referral_code", refCode);
      }
      setMagicLinkSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setMagicLinkLoading(false);
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

        // If no session returned (user already exists — Supabase anti-enumeration),
        // fall back to sign-in with password
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

  // Magic link sent confirmation
  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-400/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Check your email</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-2">
              We sent a sign-in link to
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-6">{email}</p>
            <p className="text-xs text-gray-400 mb-6">
              Click the link in the email to sign in. It expires in 1 hour.
            </p>
            <button
              onClick={() => { setMagicLinkSent(false); setEmail(""); }}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-200/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-gray-900">AISkillScore</span>
        </div>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6 tracking-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>

          {/* Google OAuth */}
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

          {/* Email + Password Form — primary */}
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
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signup" ? "Create Account — 5 Free Tokens" : "Sign In"}
            </button>
          </form>

          {/* Magic link option — secondary */}
          <div className="mt-4">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-2"
            >
              <Mail className="w-3 h-3" />
              Sign in with magic link instead
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showPasswordForm ? "rotate-180" : ""}`} />
            </button>

            {showPasswordForm && (
              <form onSubmit={handleMagicLink} className="space-y-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-gray-400 text-center">
                  We&apos;ll email you a passwordless sign-in link.
                </p>
                <button
                  type="submit"
                  disabled={magicLinkLoading || !email.trim()}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {magicLinkLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Send Magic Link {email.trim() ? `to ${email}` : ""}
                </button>
              </form>
            )}
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            {mode === "signup" ? (
              <>
                Have an account?{" "}
                <button onClick={() => { setMode("signin"); setShowPasswordForm(false); setError(""); }} className="text-blue-600 font-medium hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                New?{" "}
                <button onClick={() => { setMode("signup"); setShowPasswordForm(false); setError(""); }} className="text-blue-600 font-medium hover:underline">
                  Sign up free
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Encrypted · Never sold · 30 second analysis
        </p>
      </div>
    </div>
  );
}
