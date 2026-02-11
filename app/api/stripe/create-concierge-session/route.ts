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

      verifiedUploadId = uploadId;
      successUrl = `${baseUrl}/dashboard/upload/${uploadId}?paid=true`;
      cancelUrl = `${baseUrl}/dashboard/upload/${uploadId}?canceled=true`;
    } else {
      // CHANGED: Create a placeholder upload record for pricing page purchases using Service Role client
      console.log('Service Role client exists:', !!supabaseAdmin);
      console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      
      // DEBUG: Check allowed status values from database constraint
      console.log("Checking allowed status values...");
      try {
        const { data: constraint } = await supabaseAdmin
          .from("information_schema.check_constraints")
          .select("constraint_name, check_clause")
          .eq("constraint_name", "csv_uploads_status_check")
          .single();
        
        console.log("Status constraint:", constraint);
      } catch (constraintError) {
        console.error("Failed to get constraint info:", constraintError);
      }
      
      const { data: placeholder, error } = await supabaseAdmin
        .from("csv_uploads")
        .insert({
          user_id: user.id,
          filename: "pending_audit",
          original_name: "Pending Expert Audit",
          storage_path: "pending",
          file_size: 0,
          content_type: "application/octet-stream",
          status: "processing",
          concierge_status: "pending",
          analysis_data: {}, // ✅ ADD THIS - empty JSON object
          stripe_checkout_id: null, // Will be set after session creation
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
        
        // CHANGED: Check if it's a constraint issue by trying to insert with minimal data
        console.log("Attempting to check table constraints...");
        try {
          const { data: tableInfo } = await supabaseAdmin
            .from("information_schema.columns")
            .select("column_name, is_nullable, data_type")
            .eq("table_name", "csv_uploads")
            .eq("table_schema", "public");
          
          console.log("Table structure:", tableInfo);
        } catch (tableError) {
          console.error("Failed to get table info:", tableError);
        }
        
        return NextResponse.json({ error: "Failed to create placeholder upload" }, { status: 500 });
      }

      verifiedUploadId = placeholder.id;
      successUrl = `${baseUrl}/dashboard/upload/${placeholder.id}?success=true&paid=true`;
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

      // Update the placeholder record with the Stripe session ID
      if (!uploadId) {
        await supabaseAdmin
          .from("csv_uploads")
          .update({ stripe_checkout_id: session.id })
          .eq("id", verifiedUploadId);
      }

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
