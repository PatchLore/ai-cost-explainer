import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY
  });
}
