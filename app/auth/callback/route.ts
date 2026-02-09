import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Get the origin from the request (handles both localhost and production)
  const origin = req.headers.get("origin") || req.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await createServerSupabaseClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Redirect to the next URL (or dashboard if not specified)
    // Ensure the redirect is safe (no open redirects)
    let redirectUrl = next;
    if (!redirectUrl.startsWith("/")) {
      redirectUrl = "/dashboard";
    }

    return NextResponse.redirect(`${origin}${redirectUrl}`);
  } catch (err) {
    console.error("Unexpected error in auth callback:", err);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }
}
