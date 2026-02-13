import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Sign Up Free — 5 Tokens + Daily Credits | AISkillScore",
  description:
    "Create a free AISkillScore account. Get 5 tokens on signup plus 2 free daily credits. No credit card required. AI career tools for job seekers.",
  alternates: {
    canonical: `${APP_URL}/auth`,
  },
  openGraph: {
    title: "Sign Up Free — 5 AI Career Tokens | AISkillScore",
    description:
      "Create a free account. 5 tokens on signup + 2 daily credits. No credit card. AI-powered resume optimization, interview prep, and more.",
    url: `${APP_URL}/auth`,
  },
  twitter: {
    card: "summary",
    title: "Sign Up Free — AISkillScore",
    description: "5 free tokens + 2 daily credits. No credit card required.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
