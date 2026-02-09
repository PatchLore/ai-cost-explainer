import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Missing Stripe key" }, { status: 400 });
    }
    const stripe = new Stripe(stripeKey);
    const { uploadId } = await req.json();
    if (!uploadId) {
      return NextResponse.json(
        { error: "Missing uploadId" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.URL ?? "http://localhost:3000";

    // TEMPORARY: Hardcoded $0.01 test price
    // Change back to env var after testing
    const priceId = 'price_1SyvEWGark2fn6AyTXKIR2Yl'; // $0.01 test price
    console.log('Using hardcoded Price ID:', priceId);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard/upload/${uploadId}?paid=true`,
      cancel_url: `${baseUrl}/dashboard/upload/${uploadId}?canceled=true`,
      metadata: { uploadId },
    });

    // Tier is set to concierge_pending in webhook after payment success
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('STRIPE ERROR:', err);
    return NextResponse.json(
      { error: err?.message || String(err) || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
