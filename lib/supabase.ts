import { createClient } from "@supabase/supabase-js";

// Lazily create clients so missing env vars do not throw during build-time
export function getPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required to create a public Supabase client");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server-side client with service role for admin operations (use only in API routes)
export function createServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required to create a Supabase client");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server operations");
  return createClient(supabaseUrl, serviceKey);
}
