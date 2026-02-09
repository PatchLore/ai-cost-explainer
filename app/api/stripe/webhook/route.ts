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
      
      // 1. Update csv_uploads (FIXED COLUMN NAME from 'tier' to 'concierge_status')
      const { error: updateError } = await sb
        .from("csv_uploads")
        .update({
          concierge_status: "pending",
          stripe_checkout_id: session.id,
        })
        .eq("id", uploadId);
      
      if (updateError) {
        console.error("Failed to update csv_uploads:", updateError);
      }

      // 2. INSERT into concierge_deliverables (THIS WAS MISSING!)
      const { error: insertError } = await sb
        .from("concierge_deliverables")
        .insert({
          upload_id: uploadId,
          stripe_session_id: session.id,
          status: "pending",
        });
      
      if (insertError) {
        console.error("Failed to insert concierge_deliverables:", insertError);
      } else {
        console.log("Successfully created concierge order for upload:", uploadId);
      }

      // 3. Send admin email notification
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const adminEmail = process.env.ADMIN_EMAIL;
      
      if (adminEmail && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
            to: adminEmail,
            subject: "New AI Cost Audit Order - £299",
            html: `<p>New £299 order received.</p><p><a href="${baseUrl}/admin/concierge/${uploadId}">View order and deliver</a></p>`,
          });
          console.log("Admin email sent to:", adminEmail);
        } catch (emailError) {
          console.error("Failed to send admin email:", emailError);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}