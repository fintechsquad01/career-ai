import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-QH29WYDDEV";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["600", "700", "800"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "AISkillScore — AI-Powered Career Intelligence",
    template: "%s | AISkillScore",
  },
  description:
    "Match your resume to the exact job before you apply. 11 AI-powered career tools with evidence-based analysis. Pay per use with tokens, no subscriptions.",
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
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
      highPrice: "279",
      priceCurrency: "USD",
      offerCount: "5",
      offers: [
        {
          "@type": "Offer",
          name: "Free Tier",
          price: "0",
          priceCurrency: "USD",
          description: "15 free tokens on signup + 2 daily tokens. AI Displacement Score is always free.",
        },
        {
          "@type": "Offer",
          name: "Starter Pack",
          price: "14",
          priceCurrency: "USD",
          description: "50 tokens — try 2-3 AI career tools.",
        },
        {
          "@type": "Offer",
          name: "Pro Pack",
          price: "39",
          priceCurrency: "USD",
          description: "200 tokens — full career overhaul. Most popular.",
        },
        {
          "@type": "Offer",
          name: "Power Pack",
          price: "79",
          priceCurrency: "USD",
          description: "500 tokens — power users and career changers.",
        },
        {
          "@type": "Offer",
          name: "Lifetime Deal",
          price: "119",
          priceCurrency: "USD",
          description: "120 tokens/month forever. One-time payment. Limited to 500 spots.",
        },
      ],
    },
    featureList: [
      "AI Displacement Score (free)",
      "Job Match Score",
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
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <ErrorBoundary>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
