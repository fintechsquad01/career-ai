import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const PACK_TOKENS: Record<string, number> = {
  starter: 50,
  pro: 200,
  power: 600,
};

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const packId = session.metadata?.pack_id;

        if (!userId) {
          console.error("No user_id in session metadata");
          break;
        }

        if (packId === "lifetime_early" || packId === "lifetime_standard") {
          await supabaseAdmin
            .from("profiles")
            .update({
              lifetime_deal: true,
              lifetime_next_refill: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              stripe_customer_id: session.customer as string,
            } as Record<string, unknown>)
            .eq("id", userId);

          await supabaseAdmin.rpc("add_tokens", {
            p_user_id: userId,
            p_amount: 100,
            p_type: "lifetime_refill",
            p_description: "Lifetime deal activation — 100 tokens",
            p_stripe_session_id: session.id,
          });
        } else {
          const tokens = PACK_TOKENS[packId || ""] || 0;
          if (tokens > 0) {
            await supabaseAdmin.rpc("add_tokens", {
              p_user_id: userId,
              p_amount: tokens,
              p_type: "purchase",
              p_description: `${packId?.charAt(0).toUpperCase()}${packId?.slice(1)} Pack (${tokens} tokens)`,
              p_stripe_session_id: session.id,
            });

            if (session.customer) {
              await supabaseAdmin
                .from("profiles")
                .update({
                  stripe_customer_id: session.customer as string,
                } as Record<string, unknown>)
                .eq("id", userId);
            }
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
