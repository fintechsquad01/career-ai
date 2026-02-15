export const STRIPE_PRODUCTS = {
  starter: {
    name: "Starter Pack",
    tokens: 50,
    price_cents: 900,
    stripe_price_id: process.env.STRIPE_PRICE_STARTER || "",
  },
  pro: {
    name: "Pro Pack",
    tokens: 200,
    price_cents: 1900,
    stripe_price_id: process.env.STRIPE_PRICE_PRO || "",
  },
  power: {
    name: "Power Pack",
    tokens: 500,
    price_cents: 4900,
    stripe_price_id: process.env.STRIPE_PRICE_POWER || "",
  },
  lifetime_early: {
    name: "Lifetime Early Bird",
    tokens: null,
    price_cents: 7900,
    stripe_price_id: process.env.STRIPE_PRICE_LIFETIME_EARLY || "",
  },
  lifetime_standard: {
    name: "Lifetime Standard",
    tokens: null,
    price_cents: 12900,
    stripe_price_id: process.env.STRIPE_PRICE_LIFETIME || "",
  },
  lifetime_vip: {
    name: "Lifetime VIP",
    tokens: null,
    price_cents: 19900,
    stripe_price_id: process.env.STRIPE_PRICE_LIFETIME_VIP || "",
  },
} as const;

export type PackId = keyof typeof STRIPE_PRODUCTS;
