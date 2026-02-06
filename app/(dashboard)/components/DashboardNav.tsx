"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function DashboardNav() {
  const router = useRouter();

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex items-center gap-6">
      <Link
        href="/dashboard"
        className="text-slate-600 hover:text-slate-900"
      >
        Dashboard
      </Link>
      <Link href="/" className="text-slate-600 hover:text-slate-900">
        Home
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="text-slate-600 hover:text-slate-900"
      >
        Sign out
      </button>
    </nav>
  );
}
