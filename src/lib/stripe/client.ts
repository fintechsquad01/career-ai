/**
 * Client-side Stripe.js loader.
 * Use getStripe() when implementing client-side checkout (e.g., Stripe Elements).
 * Currently checkout uses server-side redirect via /api/checkout.
 */
import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export async function getStripe() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.warn("[Stripe] Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
