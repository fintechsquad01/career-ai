import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CareerAI — AI-Powered Career Intelligence",
  description:
    "Stop guessing. Know exactly where you stand. AI-powered career tools that analyze resumes and job postings, then guide you to become the top candidate.",
  openGraph: {
    title: "CareerAI — AI-Powered Career Intelligence",
    description:
      "11 AI tools to optimize your resume, prep for interviews, and land your dream job. Pay per use, no subscriptions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
