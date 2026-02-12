import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — CareerAI",
  description: "Create a free account. 5 tokens + 2 daily credits. No credit card required.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
