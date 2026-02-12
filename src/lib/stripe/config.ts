export const STRIPE_PRODUCTS = {
  starter: {
    name: "Starter Pack",
    tokens: 50,
    price_cents: 500,
    stripe_price_id: process.env.STRIPE_PRICE_STARTER || "",
  },
  pro: {
    name: "Pro Pack",
    tokens: 200,
    price_cents: 1500,
    stripe_price_id: process.env.STRIPE_PRICE_PRO || "",
  },
  power: {
    name: "Power Pack",
    tokens: 600,
    price_cents: 3900,
    stripe_price_id: process.env.STRIPE_PRICE_POWER || "",
  },
  lifetime_early: {
    name: "Lifetime Early Bird",
    tokens: null,
    price_cents: 4900,
    stripe_price_id: process.env.STRIPE_PRICE_LIFETIME_EARLY || "",
  },
  lifetime_standard: {
    name: "Lifetime Standard",
    tokens: null,
    price_cents: 7900,
    stripe_price_id: process.env.STRIPE_PRICE_LIFETIME || "",
  },
} as const;

export type PackId = keyof typeof STRIPE_PRODUCTS;
