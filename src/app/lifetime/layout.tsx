import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lifetime Deal — CareerAI",
  description: "100 tokens/month forever for $49. Limited spots.",
};

export default function LifetimeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
