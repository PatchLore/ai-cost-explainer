import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!sig || !webhookSecret || !stripeKey) {
    return NextResponse.json(
      { error: "Missing signature, webhook secret, or Stripe key" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uploadId = session.metadata?.uploadId;
    if (uploadId) {
      const sb = createServerSupabase();
      await sb
        .from("csv_uploads")
        .update({
          tier: "concierge_pending",
          stripe_payment_intent_id: session.payment_intent
            ? String(session.payment_intent)
            : null,
        })
        .eq("id", uploadId);

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? process.env.URL ?? "http://localhost:3000";
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
          to: adminEmail,
          subject: "New Concierge Order - Action Needed",
          html: `<p>New $299 Concierge order.</p><a href="${baseUrl}/admin/concierge/${uploadId}">View order and deliver</a>`,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
