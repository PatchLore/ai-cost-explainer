"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { AnalysisViewer } from "@/app/(dashboard)/components/AnalysisViewer";
import { ConciergeStatus } from "@/app/(dashboard)/components/ConciergeStatus";
import type { CsvUpload } from "@/lib/types";
import type { Recommendation } from "@/lib/recommendations";

interface AnalysisRow {
  total_spend: number;
  total_requests: number;
  top_models: { model: string; cost: number; tokens: number }[];
  spend_by_day: { date: string; cost: number }[] | null;
  recommendations: Recommendation[];
}

export default function UploadDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const paid = searchParams.get("paid") === "true";

  const [upload, setUpload] = useState<CsvUpload | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null);
  const [codeSnippets, setCodeSnippets] = useState<
    { title: string; language: string; code: string }[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: uploadData, error: uploadError } = await supabase
        .from("csv_uploads")
        .select("*")
        .eq("id", id)
        .single();

      if (uploadError || !uploadData) {
        setError("Upload not found");
        setLoading(false);
        return;
      }
      setUpload(uploadData as CsvUpload);

      const { data: analysisData } = await supabase
        .from("analysis_results")
        .select("total_spend, total_requests, top_models, spend_by_day, recommendations")
        .eq("upload_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setAnalysis(analysisData as AnalysisRow | null);

      const { data: deliverableData } = await supabase
        .from("concierge_deliverables")
        .select("code_snippets")
        .eq("upload_id", id)
        .order("delivered_at", { ascending: false })
        .limit(1)
        .single();
      if (deliverableData?.code_snippets) {
        setCodeSnippets(deliverableData.code_snippets as { title: string; language: string; code: string }[]);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error || !upload) return <p className="text-red-600">{error ?? "Not found"}</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-slate-600 hover:text-slate-900"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">
          {upload.filename ?? "Upload"} — Analysis
        </h1>
      </div>

      {paid && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          Payment successful. Your expert analysis will be prepared and you’ll be
          notified when it’s ready.
        </div>
      )}

      <ConciergeStatus
        uploadId={id}
        tier={upload.tier}
        loomVideoUrl={upload.loom_video_url}
        consultantNotes={upload.consultant_notes}
        savingsEstimate={upload.savings_estimate}
        codeSnippets={codeSnippets ?? undefined}
      />

      {analysis ? (
        <AnalysisViewer
          totalSpend={analysis.total_spend}
          totalRequests={analysis.total_requests}
          topModels={analysis.top_models ?? []}
          spendByDay={analysis.spend_by_day ?? undefined}
          recommendations={(analysis.recommendations as Recommendation[]) ?? []}
        />
      ) : (
        <p className="text-slate-500">No analysis results yet.</p>
      )}
    </div>
  );
}
