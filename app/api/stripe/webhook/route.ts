import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// CHANGED: Add Service Role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    
    // CHANGED: Security - Validate metadata
    const uploadId = session.metadata?.uploadId;
    const userId = session.metadata?.userId;

    if (!uploadId || !userId) {
      console.error("Missing metadata");
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    // CHANGED: Idempotency Check - Prevent duplicate processing
    const { data: existing } = await supabaseAdmin
      .from("concierge_deliverables")
      .select("id")
      .eq("stripe_session_id", session.id)
      .single();

    if (existing) {
      console.log("Order already processed");
      return NextResponse.json({ received: true });
    }

    let finalUploadId = uploadId;
    
    // CHANGED: Only create placeholder if uploadId is 'PENDING' (from pricing page)
    if (uploadId === 'PENDING') {
      // Create a placeholder upload record for pricing page purchases using Service Role client
      console.log('Creating placeholder upload for pricing page purchase...');
      
      const { data: placeholder, error } = await supabaseAdmin
        .from("csv_uploads")
        .insert({
          user_id: userId,
          filename: "pending_audit",
          original_name: "Pending Expert Audit",
          storage_path: "pending",
          file_size: 0,
          content_type: "application/octet-stream",
          status: "processing",
          concierge_status: "pending",
          analysis_data: {}, // ✅ ADD THIS - empty JSON object
          stripe_checkout_id: session.id,
        })
        .select()
        .single();

      if (error || !placeholder) {
        // CHANGED: Log the exact Supabase error object with all details
        console.error("Failed to create placeholder upload:", error);
        console.error("Error details:", {
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          fullError: error
        });
        
        return NextResponse.json({ error: "Failed to create placeholder upload" }, { status: 500 });
      }

      finalUploadId = placeholder.id;
      console.log("Created placeholder upload with ID:", finalUploadId);
    } else {
      // CHANGED: Use Service Role client for admin operations
      // 1. Update existing csv_uploads (FIXED COLUMN NAME from 'tier' to 'concierge_status')
      const { error: updateError } = await supabaseAdmin
        .from("csv_uploads")
        .update({
          concierge_status: "pending",
          stripe_checkout_id: session.id,
        })
        .eq("id", uploadId);
      
      if (updateError) {
        // CHANGED: Add debug logging to catch the exact Supabase error message
        console.error("Failed to update csv_uploads:", updateError);
        console.error("Error details:", {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        });
      }
    }

    // CHANGED: Use Service Role client for admin operations
    // 2. INSERT into concierge_deliverables (THIS WAS MISSING!)
    const { error: insertError } = await supabaseAdmin
      .from("concierge_deliverables")
      .insert({
        upload_id: finalUploadId,
        user_id: userId, // CHANGED: Add user_id (FK requirement)
        stripe_session_id: session.id,
        status: "pending",
      });
    
    if (insertError) {
      // CHANGED: Add debug logging to catch the exact Supabase error message
      console.error("Failed to insert concierge_deliverables:", insertError);
      console.error("Error details:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log("Successfully created concierge order for upload:", finalUploadId);
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

  return NextResponse.json({ received: true });
}