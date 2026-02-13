import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Track processed events to prevent double-processing (single-instance; for multi-instance, DB check is primary)
const processedEvents = new Set<string>();
const MAX_TRACKED = 1000;

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

  // Idempotency check (in-memory)
  if (processedEvents.has(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  processedEvents.add(event.id);

  // Keep set from growing unbounded
  if (processedEvents.size > MAX_TRACKED) {
    const iterator = processedEvents.values();
    for (let i = 0; i < 500; i++) {
      const val = iterator.next().value;
      if (val !== undefined) processedEvents.delete(val);
    }
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const packId = session.metadata?.pack_id;

        // DB-based idempotency: skip if we already processed this session
        const { data: existingTx } = await supabaseAdmin
          .from("token_transactions")
          .select("id")
          .eq("stripe_session_id", session.id)
          .limit(1);

        if (existingTx && existingTx.length > 0) {
          return NextResponse.json({
            received: true,
            already_processed: true,
          });
        }

        if (!userId) {
          console.error("No user_id in session metadata");
          return NextResponse.json(
            { error: "Missing user_id in session metadata" },
            { status: 400 }
          );
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
          if (!packId || tokens <= 0) {
            console.error(`Invalid or missing pack_id: ${packId}`);
            return NextResponse.json(
              { error: "Invalid pack_id in session metadata" },
              { status: 400 }
            );
          }
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
