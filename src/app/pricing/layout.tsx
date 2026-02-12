import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — CareerAI",
  description: "Pay per use. No subscriptions. Start free.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
