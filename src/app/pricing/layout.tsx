import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Pricing — Pay Per Use AI Career Tools | AISkillScore",
  description:
    "No subscriptions. Pay per use with tokens starting at $9. Compare: Jobscan $599/yr, Teal $348/yr, FinalRound $1,788/yr — AISkillScore from free.",
  alternates: {
    canonical: `${APP_URL}/pricing`,
  },
  openGraph: {
    title: "AI Career Tools Pricing — Pay Per Use, No Subscriptions",
    description:
      "11 AI career tools from free to $0.098/use. Starter $9, Pro $19, Power $49. vs Jobscan $599/yr. Free daily tokens included.",
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
      "11 AI career tools from free to $0.098/use. vs Jobscan $599/yr, Teal $348/yr, FinalRound $1,788/yr.",
    images: [`${APP_URL}/api/og?type=pricing`],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
