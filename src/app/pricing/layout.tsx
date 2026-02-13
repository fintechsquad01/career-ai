import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Pricing — Pay Per Use AI Career Tools | AISkillScore",
  description:
    "No subscriptions. Pay per use with tokens starting at $5. Compare: Jobscan $49.95/mo, Teal $29/mo, FinalRound $149/mo — AISkillScore from free.",
  alternates: {
    canonical: `${APP_URL}/pricing`,
  },
  openGraph: {
    title: "AI Career Tools Pricing — Pay Per Use, No Subscriptions",
    description:
      "11 AI career tools from free to $0.065/use. Starter $5, Pro $15, Power $39. vs Jobscan $49.95/mo. Free daily tokens included.",
    url: `${APP_URL}/pricing`,
    images: [
      {
        url: `${APP_URL}/api/og?type=pricing`,
        width: 1200,
        height: 630,
        alt: "AISkillScore Pricing — Pay Per Use, No Subscriptions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Career Tools Pricing — No Subscriptions | AISkillScore",
    description:
      "11 AI career tools from free to $0.065/use. vs Jobscan $49.95/mo, Teal $29/mo, FinalRound $149/mo.",
    images: [`${APP_URL}/api/og?type=pricing`],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
