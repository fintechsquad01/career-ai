import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Lifetime Deal — 100 Tokens/Month Forever from $79 | AISkillScore",
  description:
    "One-time payment from $79. Get 100 AI career tokens every month forever. Limited to 500 early bird spots. 30-day money-back guarantee.",
  alternates: {
    canonical: `${APP_URL}/lifetime`,
  },
  openGraph: {
    title: "AISkillScore Lifetime Deal — $79 for 100 Tokens/Month Forever",
    description:
      "One payment. 100 AI career tokens every month forever. Break even in 8 months. Limited to 500 spots. 30-day guarantee.",
    url: `${APP_URL}/lifetime`,
    images: [
      {
        url: `${APP_URL}/api/og?type=lifetime`,
        width: 1200,
        height: 630,
        alt: "AISkillScore Lifetime Deal — From $79 One-Time",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AISkillScore Lifetime Deal — $79 for 100 Tokens/Month Forever",
    description:
      "One payment. 100 tokens/month forever. 30-day guarantee. Limited spots.",
    images: [`${APP_URL}/api/og?type=lifetime`],
  },
};

export default function LifetimeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
