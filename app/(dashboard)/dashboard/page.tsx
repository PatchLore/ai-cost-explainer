"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CSVUploader } from "@/app/(dashboard)/components/CSVUploader";
import type { CsvUpload } from "@/lib/types";

export default function DashboardPage() {
  const [uploads, setUploads] = useState<CsvUpload[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from("csv_uploads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setUploads(data ?? []);
      setLoading(false);
    }
    init();
  }, []);

  const onUploadComplete = (uploadId: string) => {
    if (!userId) return;
    setUploads((prev) => {
      const added: CsvUpload = {
        id: uploadId,
        user_id: userId,
        filename: null,
        storage_path: null,
        file_size: null,
        provider: "openai",
        status: "completed",
        raw_data: [],
        created_at: new Date().toISOString(),
        tier: "self_serve",
        stripe_payment_intent_id: null,
        loom_video_url: null,
        consultant_notes: null,
        savings_estimate: null,
      };
      return [added, ...prev];
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Upload History</h1>

      <CSVUploader userId={userId ?? ""} onComplete={onUploadComplete} />

      {loading ? (
        <p className="text-slate-500">Loading uploads...</p>
      ) : uploads.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          No uploads yet. Drop a CSV above to get started.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {uploads.map((u) => (
            <li key={u.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link
                  href={`/dashboard/upload/${u.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {u.filename ?? "Upload"} — {u.status}
                </Link>
                <span className="ml-2 text-sm text-slate-500">
                  {new Date(u.created_at).toLocaleDateString()} · {u.tier}
                </span>
              </div>
              <Link
                href={`/dashboard/upload/${u.id}`}
                className="rounded bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
