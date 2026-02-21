import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { PricingContent } from "@/components/pricing/PricingContent";
import { FAQ_ITEMS, PACKS } from "@/lib/constants";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

const PRICING_FAQ_QUESTIONS = [
  "How does the token system work?",
  "What's the Lifetime Deal?",
  "How is the Lifetime Deal different from token packs?",
  "Can I get a refund?",
  "How many tokens do I need for 5 job applications?",
];
const PRICING_FAQS = FAQ_ITEMS.filter((item) =>
  PRICING_FAQ_QUESTIONS.includes(item.q)
);

export const metadata: Metadata = {
  title: "Pricing — Token Packs & Lifetime Deal | AISkillScore",
  description:
    "Pay per use with tokens. No subscriptions. 11 AI career tools from $14. Lifetime Deal from $119 for 120 tokens/month forever.",
  alternates: { canonical: `${APP_URL}/pricing` },
  openGraph: {
    title: "Pricing — AISkillScore",
    description: "Pay per use with tokens. 11 AI career tools from $14. No subscriptions.",
    url: `${APP_URL}/pricing`,
  },
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = user
    ? (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data
    : null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const productsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AISkillScore Token Packs",
    description: "AI career tool token packs — pay per use, no subscriptions.",
    numberOfItems: PACKS.length,
    itemListElement: PACKS.map((pack, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Product",
        name: `${pack.name} Pack — ${pack.tokens} AI Career Tokens`,
        description: `${pack.description}. ${pack.tokens} tokens at ${pack.rate}/token.${pack.save ? ` Save ${pack.save}.` : ""}`,
        offers: {
          "@type": "Offer",
          price: String(pack.price),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          priceValidUntil: "2027-12-31",
        },
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Pricing", item: `${APP_URL}/pricing` },
    ],
  };

  const schemas = (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
    </>
  );

  if (user) {
    return (
      <AppShell isLoggedIn={true} profile={profile}>
        {schemas}
        <PricingContent />
      </AppShell>
    );
  }

  return (
    <AppShell isLoggedIn={false}>
      {schemas}
      <PricingContent />
    </AppShell>
  );
}
