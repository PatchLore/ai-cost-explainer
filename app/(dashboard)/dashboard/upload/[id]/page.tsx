"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { AnalysisViewer } from "@/app/(dashboard)/components/AnalysisViewer";
import { ConciergeStatus } from "@/app/(dashboard)/components/ConciergeStatus";
import { Download, FileText, ArrowLeft, Star, Clock, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

  const [upload, setUpload] = useState<CsvUpload | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null);
  const [codeSnippets, setCodeSnippets] = useState<
    { title: string; language: string; code: string }[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (!id) {
      toast({
        title: "Error",
        description: "No upload ID found",
        variant: "destructive"
      })
      return
    }
    
    setCheckoutLoading(true)
    try {
      const res = await fetch("/api/stripe/create-concierge-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: id }),
      })
      
      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Checkout failed")
      }
    } catch (err) {
      toast({
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive"
      })
    } finally {
      setCheckoutLoading(false)
    }
  }

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
      {/* Top Bar */}
      <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Analysis</span>
              <span className="text-sm text-slate-300">/</span>
              <span className="text-sm font-medium text-white">{upload.filename ?? "Upload"}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-300">
              Status: {upload.status || 'Processing'}
            </span>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 hover:bg-slate-800 transition-all rounded-lg text-slate-300 hover:text-white hover-scale">
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Column - Summary Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Spend</p>
                <p className="text-3xl font-bold text-white mt-1">
                  ${analysis?.total_spend.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Requests</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {analysis?.total_requests.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Potential Savings</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">
                  ${((analysis?.total_spend || 0) * 0.4).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Main Chart Area */}
        <div className="lg:col-span-2">
          {analysis ? (
            <AnalysisViewer
              totalSpend={analysis.total_spend}
              totalRequests={analysis.total_requests}
              topModels={analysis.top_models ?? []}
              spendByDay={analysis.spend_by_day ?? undefined}
              recommendations={(analysis.recommendations as Recommendation[]) ?? []}
            />
          ) : (
            <div className="glass-strong p-8 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50 text-center">
              <p className="text-slate-400">No analysis results yet.</p>
            </div>
          )}
        </div>

        {/* Right Column - Recommendations */}
        <div className="lg:col-span-1">
          <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
            <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
            <div className="space-y-4">
              {analysis?.recommendations.slice(0, 5).map((r) => (
                <div key={r.id} className="glass p-4 rounded-lg border border-slate-700/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        r.severity === 'high' ? 'bg-red-500' : 
                        r.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></div>
                      <span className="text-xs text-slate-400 capitalize">{r.severity}</span>
                    </div>
                    <span className="text-xs text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded">
                      Impact: £{(r.impact as string)?.replace('$', '') || '0'}/month
                    </span>
                  </div>
                  <h4 className="text-slate-100 font-semibold text-sm mb-1">{r.title}</h4>
                  <p className="text-slate-400 text-xs mb-3">{r.description}</p>
                  {r.codeSnippet && (
                    <button className="w-full text-xs text-slate-300 border border-slate-700 hover:bg-slate-800 px-3 py-1 rounded transition-colors">
                      Copy Code
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Concierge CTA */}
      <div className="glass-strong p-8 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Want us to implement these?</h3>
            <p className="text-slate-400">Get a personalized audit with expert recommendations and implementation guidance.</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm text-amber-400 font-medium">3 spots left this week</span>
              <span className="text-sm text-slate-500">•</span>
              <span className="text-sm text-slate-400">48-hour delivery</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-violet-500/25 hover-scale transition-all text-lg border-2 border-violet-400/50 animate-pulse disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? "Redirecting to Stripe..." : "£299 Audit"}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {paid && (
        <div className="glass-strong p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
          <p className="text-emerald-400 text-sm">
            Payment successful. Your expert analysis will be prepared and you'll be notified when it's ready.
          </p>
        </div>
      )}
    </div>
  );
}
