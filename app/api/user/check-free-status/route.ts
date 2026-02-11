import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore in Server Components
            }
          },
        },
      }
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ hasFreeUpload: false })
    }
    
    const { data, error } = await supabase
      .from("csv_uploads")
      .select("id")
      .eq("user_id", user.id)
      .is("stripe_payment_intent_id", null)
      .limit(1)
    
    if (error) throw error
    
    return NextResponse.json({ 
      hasFreeUpload: data && data.length > 0 
    })
    
  } catch (err) {
    console.error("Error checking free status:", err)
    return NextResponse.json({ hasFreeUpload: false })
  }
}