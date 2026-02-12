import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// CHANGED: Add Service Role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Missing Stripe key" }, { status: 400 });
    }
    const stripe = new Stripe(stripeKey);
    
    // Get user authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore in Server Components
            }
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const { uploadId } = await req.json();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.URL ?? "http://localhost:3000";

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    console.log('Using Stripe Price ID from env:', priceId);

    if (!priceId) {
      console.error('ERROR: NEXT_PUBLIC_STRIPE_PRICE_ID is not set');
      return NextResponse.json(
        { error: "Stripe Price ID not configured" },
        { status: 500 }
      );
    }

    // Handle both scenarios: with uploadId (from analysis page) or without (from pricing page)
    let verifiedUploadId = null;
    let successUrl = `${baseUrl}/dashboard?success=true&paid=true`;
    let cancelUrl = `${baseUrl}/pricing?canceled=true`;

    if (uploadId) {
      // Verify the upload exists and belongs to the user
      const { data: upload, error } = await supabase
        .from("csv_uploads")
        .select("id, user_id")
        .eq("id", uploadId)
        .eq("user_id", user.id)
        .single();

      if (error || !upload) {
        return NextResponse.json({ error: "Upload not found" }, { status: 404 });
      }

      // Update EXISTING upload's concierge_status to 'pending'
      const { error: updateError } = await supabaseAdmin
        .from("csv_uploads")
        .update({ 
          concierge_status: "pending",
          stripe_checkout_id: null // Will be set after session creation
        })
        .eq("id", uploadId);

      if (updateError) {
        console.error("Failed to update existing upload:", updateError);
        return NextResponse.json({ error: "Failed to update upload status" }, { status: 500 });
      }

      verifiedUploadId = uploadId;
      successUrl = `${baseUrl}/dashboard/upload/${uploadId}?paid=true`;
      cancelUrl = `${baseUrl}/dashboard/upload/${uploadId}?canceled=true`;
    } else {
      // DON'T create placeholder here - wait for webhook confirmation
      verifiedUploadId = 'PENDING'; // Mark as needing creation after payment
      successUrl = `${baseUrl}/dashboard?success=true&paid=true`;
      cancelUrl = `${baseUrl}/pricing?canceled=true`;
    }

    try {
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { 
          userId: user.id,
          uploadId: verifiedUploadId,
          source: uploadId ? "analysis_page" : "pricing_page"
        },
      });

      return NextResponse.json({ url: session.url });
    } catch (stripeErr: any) {
      console.error('STRIPE ERROR:', stripeErr);
      return NextResponse.json(
        { error: stripeErr?.message || String(stripeErr) || "Failed to create checkout session" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('STRIPE ERROR:', err);
    return NextResponse.json(
      { error: err?.message || String(err) || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
