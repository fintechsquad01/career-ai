import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "AISkillScore — AI-Powered Career Intelligence",
    template: "%s | AISkillScore",
  },
  description:
    "Stop guessing. Know exactly where you stand. 11 AI-powered career tools that analyze resumes and job postings, then guide you to become the top candidate. Pay per use, no subscriptions.",
  keywords: [
    "AI career tools",
    "resume optimizer",
    "ATS score checker",
    "job match score",
    "AI interview prep",
    "career intelligence",
    "AI displacement score",
    "skills gap analysis",
    "salary negotiation",
    "cover letter generator",
    "LinkedIn optimizer",
    "career roadmap",
  ],
  authors: [{ name: "AISkillScore" }],
  creator: "AISkillScore",
  publisher: "AISkillScore",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "AISkillScore",
    title: "AISkillScore — AI-Powered Career Intelligence",
    description:
      "11 AI tools to optimize your resume, prep for interviews, and land your dream job. Pay per use, no subscriptions. Start free.",
    images: [
      {
        url: `${APP_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "AISkillScore — 11 AI Career Tools, Pay Per Use",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AISkillScore — AI-Powered Career Intelligence",
    description:
      "11 AI tools to optimize your resume, prep for interviews, and land your dream job. Pay per use, no subscriptions.",
    images: [`${APP_URL}/api/og`],
    creator: "@aiskillscore",
  },
  alternates: {
    canonical: APP_URL,
  },
  other: {
    "msapplication-TileColor": "#2563eb",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization schema — core entity for AI citation and knowledge graph
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${APP_URL}/#organization`,
    name: "AISkillScore",
    url: APP_URL,
    logo: `${APP_URL}/icon.png`,
    description:
      "AI-powered career intelligence platform with 11 tools for resume optimization, interview prep, salary negotiation, and career growth.",
    foundingDate: "2025",
    sameAs: [
      "https://twitter.com/aiskillscore",
      "https://linkedin.com/company/aiskillscore",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@aiskillscore.com",
      contactType: "customer support",
    },
  };

  // WebSite schema — helps AI systems understand site search and structure
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${APP_URL}/#website`,
    name: "AISkillScore",
    url: APP_URL,
    description:
      "AI-powered career intelligence platform. 11 AI tools to analyze resumes, match job descriptions, prep for interviews, and grow your career.",
    publisher: { "@id": `${APP_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${APP_URL}/tools/{search_term}`,
      },
      "query-input": "required name=search_term",
    },
  };

  // SoftwareApplication schema — primary product listing
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${APP_URL}/#app`,
    name: "AISkillScore",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Career Tools",
    operatingSystem: "Web",
    url: APP_URL,
    description:
      "AI-powered career intelligence platform with 11 tools for resume optimization, interview prep, and career growth. Pay per use — no subscriptions.",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "49",
      priceCurrency: "USD",
      offerCount: "4",
      offers: [
        {
          "@type": "Offer",
          name: "Free Tier",
          price: "0",
          priceCurrency: "USD",
          description: "15 free tokens on signup + 2 daily credits. AI Displacement Score is always free.",
        },
        {
          "@type": "Offer",
          name: "Starter Pack",
          price: "5",
          priceCurrency: "USD",
          description: "50 tokens — try 2-3 AI career tools.",
        },
        {
          "@type": "Offer",
          name: "Pro Pack",
          price: "15",
          priceCurrency: "USD",
          description: "200 tokens — full career overhaul. Most popular.",
        },
        {
          "@type": "Offer",
          name: "Lifetime Deal",
          price: "49",
          priceCurrency: "USD",
          description: "100 tokens/month forever. One-time payment. Limited to 500 spots.",
        },
      ],
    },
    featureList: [
      "AI Displacement Score (free)",
      "JD Match Score",
      "Resume Optimizer",
      "Cover Letter Generator",
      "LinkedIn Optimizer",
      "AI Headshots",
      "Interview Prep",
      "Skills Gap Analysis",
      "Career Roadmap",
      "Salary Negotiation",
      "Entrepreneurship Assessment",
    ],
  };

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.png" />
        {/* Preconnect to external services for faster first-byte */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
