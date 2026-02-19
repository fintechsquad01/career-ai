"use client";

/**
 * A/B Testing utilities using PostHog feature flags.
 *
 * Feature flags are defined in PostHog Dashboard and evaluated client-side.
 * This module provides typed helpers for the initial 3 experiments.
 *
 * Setup in PostHog Dashboard:
 * 1. Create Feature Flag: "hero-headline" with variants: "control" (Stop guessing), "displacement" (Is AI coming for your job?)
 * 2. Create Feature Flag: "signup-cta" with variants: "control" (Create Account — 15 Free Tokens), "risk-score" (Get Your Free AI Risk Score)
 * 3. Create Feature Flag: "paywall-layout" with variants: "control" (all packs), "recommended" (recommended only + see more)
 *
 * Each flag should be set to 50/50 rollout targeting all users.
 */

type FeatureFlagValue = string | boolean | undefined;

let posthogModule: {
  default: {
    getFeatureFlag: (key: string) => FeatureFlagValue;
    isFeatureEnabled: (key: string) => boolean | undefined;
  };
} | null = null;

async function getPostHog() {
  if (typeof window === "undefined") return null;
  if (posthogModule) return posthogModule.default;
  try {
    posthogModule = await import("posthog-js");
    return posthogModule.default;
  } catch {
    return null;
  }
}

/**
 * Get the variant for a feature flag.
 * Returns the variant string, or the fallback if PostHog isn't available.
 */
export async function getVariant(
  flagKey: string,
  fallback: string = "control"
): Promise<string> {
  const posthog = await getPostHog();
  if (!posthog) return fallback;
  const value = posthog.getFeatureFlag(flagKey);
  if (typeof value === "string") return value;
  return fallback;
}

/**
 * Check if a feature flag is enabled (for simple on/off flags).
 */
export async function isEnabled(flagKey: string): Promise<boolean> {
  const posthog = await getPostHog();
  if (!posthog) return false;
  return posthog.isFeatureEnabled(flagKey) ?? false;
}

// ─── Pre-defined experiment keys ───

export const EXPERIMENTS = {
  /** Hero headline: "control" = Stop guessing, "displacement" = Is AI coming for your job? */
  HERO_HEADLINE: "hero-headline",
  /** Signup CTA: "control" = Create Account — 15 Free Tokens, "risk-score" = Get Your Free AI Risk Score */
  SIGNUP_CTA: "signup-cta",
  /** Paywall layout: "control" = all packs, "recommended" = recommended only + see more */
  PAYWALL_LAYOUT: "paywall-layout",
  /** Wave 2 journey flow rollout flag */
  WAVE2_JOURNEY_FLOW: "wave2_journey_flow",
  /** Wave 3 command center rollout flag */
  WAVE3_COMMAND_CENTER: "wave3_command_center",
} as const;

// ─── Typed variant helpers ───

export type HeroVariant = "control" | "displacement";
export type SignupCtaVariant = "control" | "risk-score";
export type PaywallLayoutVariant = "control" | "recommended";

export async function getHeroVariant(): Promise<HeroVariant> {
  return (await getVariant(
    EXPERIMENTS.HERO_HEADLINE,
    "control"
  )) as HeroVariant;
}

export async function getSignupCtaVariant(): Promise<SignupCtaVariant> {
  return (await getVariant(
    EXPERIMENTS.SIGNUP_CTA,
    "control"
  )) as SignupCtaVariant;
}

export async function getPaywallLayoutVariant(): Promise<PaywallLayoutVariant> {
  return (await getVariant(
    EXPERIMENTS.PAYWALL_LAYOUT,
    "control"
  )) as PaywallLayoutVariant;
}
