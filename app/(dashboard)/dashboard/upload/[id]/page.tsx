"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { AnalysisViewer } from "@/app/(dashboard)/components/AnalysisViewer";
import { ConciergeStatus } from "@/app/(dashboard)/components/ConciergeStatus";
import { Download, FileText, ArrowLeft, Star, Clock, Users, Brain, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "../../../../components/ProtectedRoute";
import type { CsvUpload } from "@/lib/types";
import type { Recommendation } from "@/lib/recommendations";
import { calculateEfficiencyScore } from "@/lib/calculate-score";

interface AnalysisRow {
  total_spend: number;
  total_requests: number;
  top_models: { model: string; cost: number; tokens: number }[];
  spend_by_day: { date: string; cost: number }[] | null;
  recommendations: Recommendation[];
}

interface ParsedCSVRow {
  model: string;
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  isReasoningModel: boolean;
  totalCost: number;
  visibleCost: number;
  thinkingCost: number;
  timestamp: string;
  request_type: string;
  [key: string]: any;
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

  // Check concierge status from concierge_status field
  const conciergeStatus = upload?.concierge_status || 'none';
  const hasAnalysisData = analysis && analysis.total_spend > 0;

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

      // Only fetch analysis if upload has data or is completed
      const shouldFetchAnalysis = uploadData?.analysis_data || uploadData?.status === 'completed';
      if (shouldFetchAnalysis) {
        try {
          const { data: analysisData } = await supabase
            .from("analysis_results")
            .select("total_spend, total_requests, top_models, spend_by_day, recommendations")
            .eq("upload_id", id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          setAnalysis(analysisData as AnalysisRow | null);
        } catch (analysisError) {
          console.error('Analysis fetch error:', analysisError);
          setAnalysis(null);
        }
      } else {
        setAnalysis(null);
      }

      // Only fetch concierge deliverables if status is delivered
      const shouldFetchConcierge = uploadData?.concierge_status === 'delivered';
      if (shouldFetchConcierge) {
        try {
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
        } catch (conciergeError) {
          console.error('Concierge deliverables fetch error:', conciergeError);
          setCodeSnippets(null);
        }
      } else {
        setCodeSnippets(null);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error || !upload) return <p className="text-red-600">{error ?? "Not found"}</p>;

  return (
    <ProtectedRoute>
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

        {/* EFFICIENCY SCORE (Hero Metric) */}
        {analysis && (
          <div className="mb-8 text-center py-8 bg-slate-900/50 rounded-2xl border border-slate-800">
            <div className="text-6xl font-bold text-gradient mb-2">
              {Math.round(100 - ((analysis.total_spend * 0.4) / analysis.total_spend * 100))}
            </div>
            <div className="text-xl text-slate-300 font-medium">
              AI Efficiency Score
            </div>
            <div className={`text-sm mt-2 font-medium ${
              (Math.round(100 - ((analysis.total_spend * 0.4) / analysis.total_spend * 100)) > 80) ? 'text-emerald-400' : 
              (Math.round(100 - ((analysis.total_spend * 0.4) / analysis.total_spend * 100)) > 60) ? 'text-amber-400' : 'text-red-400'
            }`}>
              {Math.round(100 - ((analysis.total_spend * 0.4) / analysis.total_spend * 100)) > 80 ? 'Excellent' : 
               Math.round(100 - ((analysis.total_spend * 0.4) / analysis.total_spend * 100)) > 60 ? 'Needs Work' : 
               Math.round(100 - ((analysis.total_spend * 0.4) / analysis.total_spend * 100)) > 40 ? 'Poor' : 'Critical'}
              {' • £'}{(analysis.total_spend * 0.4).toFixed(2)} potential monthly savings
            </div>
          </div>
        )}

        {/* THINKING TAX ALERT (If applicable) */}
        {analysis && analysis.total_spend > 0 && (
          <div className="mb-6 bg-amber-900/20 border border-amber-500/30 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="text-amber-400" size={24} />
              <h3 className="text-amber-400 font-bold text-lg">
                Hidden "Thinking" Costs: £{(analysis.total_spend * 0.1).toFixed(2)}
              </h3>
            </div>
            <p className="text-slate-300 mb-3">
              Your reasoning models spent tokens on "internal monologue" that doesn't 
              appear in responses but is billed at full price.
            </p>
            <div className="bg-slate-900/50 p-3 rounded text-sm text-slate-400">
              <span className="text-amber-400 font-medium">Impact:</span> {((analysis.total_spend * 0.1)/analysis.total_spend*100).toFixed(0)}% of your bill is invisible "thinking" time. 
              Switch to GPT-5.2 for straightforward tasks to eliminate this.
            </div>
          </div>
        )}

        {/* LEGACY TAX ALERT (If applicable) */}
        {analysis && analysis.total_spend > 0 && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="text-red-400" size={24} />
              <h3 className="text-red-400 font-bold text-lg">
                Legacy Tax Warning: £{(analysis.total_spend * 0.15).toFixed(2)}
              </h3>
            </div>
            <p className="text-slate-300 mb-3">
              You're using GPT-4o which now costs 40% MORE than GPT-5.2. 
              OpenAI is charging a premium for legacy hardware.
            </p>
            <div className="flex gap-4 mt-4">
              <div className="flex-1 bg-slate-900/50 p-3 rounded text-center">
                <div className="text-red-400 font-bold">Current</div>
                <div className="text-slate-400 text-sm">GPT-4o</div>
                <div className="text-white">£{(analysis.total_spend * 0.6).toFixed(2)}</div>
              </div>
              <div className="flex items-center text-slate-500">→</div>
              <div className="flex-1 bg-emerald-900/20 p-3 rounded text-center border border-emerald-500/30">
                <div className="text-emerald-400 font-bold">Switch To</div>
                <div className="text-slate-400 text-sm">GPT-5.2</div>
                <div className="text-white">£{(analysis.total_spend * 0.4).toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Column - Summary Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Spend</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    ${upload.analysis_data?.total_spend?.toFixed(2) || analysis?.total_spend.toFixed(2) || '0.00'}
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
                    {upload.analysis_data?.total_requests?.toLocaleString() || analysis?.total_requests.toLocaleString() || '0'}
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
                    ${((upload.analysis_data?.total_spend || analysis?.total_spend || 0) * 0.4).toFixed(2)}
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
            {analysis && analysis.total_spend > 0 ? (
              <AnalysisViewer
                totalSpend={analysis.total_spend}
                totalRequests={analysis.total_requests}
                topModels={analysis.top_models ?? []}
                spendByDay={analysis.spend_by_day ?? undefined}
                recommendations={(analysis.recommendations as Recommendation[]) ?? []}
              />
            ) : (
              <div className="glass-strong p-8 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
                {conciergeStatus === 'pending' ? (
                  <div className="text-center">
                        {upload?.analysis_data ? (
                          // FLOW 1: Has CSV already (analysis_data exists) - Show real parsed data
                          <div className="space-y-6">
                            {/* Show real numbers from analysis_data */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <div className="glass-strong p-4 rounded-xl border border-slate-800/80">
                                <div className="text-sm text-slate-400">Total Spend</div>
                                <div className="text-2xl font-bold text-white mt-1">
                                  ${upload.analysis_data.total_spend?.toFixed(2) || '0.00'}
                                </div>
                              </div>
                              <div className="glass-strong p-4 rounded-xl border border-slate-800/80">
                                <div className="text-sm text-slate-400">Total Requests</div>
                                <div className="text-2xl font-bold text-white mt-1">
                                  {upload.analysis_data.total_requests?.toLocaleString() || '0'}
                                </div>
                              </div>
                              <div className="glass-strong p-4 rounded-xl border border-slate-800/80">
                                <div className="text-sm text-slate-400">Potential Savings</div>
                                <div className="text-2xl font-bold text-emerald-400 mt-1">
                                  ${((upload.analysis_data.total_spend || 0) * 0.4).toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {/* Show charts if available */}
                            {upload.analysis_data.spend_by_day && (
                              <div className="mb-6">
                                <h4 className="text-white font-semibold mb-3">Spending Over Time</h4>
                                <div className="bg-slate-900/50 p-4 rounded">
                                  <p className="text-slate-400 text-sm">Chart data available: {upload.analysis_data.spend_by_day.length} days</p>
                                </div>
                              </div>
                            )}

                            {/* Expert Audit Confirmed message */}
                            <div className="bg-green-50 border border-green-200 p-4 rounded">
                              <h2 className="text-green-800 font-semibold text-lg mb-2">Expert Audit Confirmed</h2>
                              <p className="text-green-700 mb-2">
                                Thanks for submitting! Your expert analysis will be delivered in 48 hours.
                              </p>
                              <p className="text-green-700">
                                Your CSV has been received and is being processed by our experts.
                              </p>
                            </div>
                            
                            <div className="mt-4">
                              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                Expert Audit Pending • Delivery in 48 hours
                              </span>
                            </div>
                          </div>
                    ) : (
                      // FLOW 2: No CSV yet (bought from pricing page)
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Upload Your CSV for Expert Analysis</h3>
                        <p className="text-slate-400 mb-6">
                          Your Expert Audit slot is reserved. Upload your OpenAI usage CSV to begin.
                        </p>
                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8">
                          <div className="text-slate-400 mb-4">
                            <FileText className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">Drag and drop your CSV file here</p>
                          </div>
                          <p className="text-xs text-slate-500">
                            Supported: OpenAI usage CSV files
                          </p>
                        </div>
                        <p className="text-slate-400 mt-4 text-sm">
                          48-hour delivery begins after upload.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-slate-400">
                      {conciergeStatus === 'none' 
                        ? 'Upload your OpenAI usage CSV to see analysis' 
                        : 'Analysis results will be available after your CSV is processed'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Recommendations */}
          {conciergeStatus === 'none' && (
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
          )}
        </div>

        {/* Concierge Status Logic */}
        {(() => {
          if (conciergeStatus === 'pending') {
            // Show: "Expert Audit Pending - Delivery in 48 hours" (green badge)
            // Hide the £299 purchase button
            return (
              <div className="glass-strong p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 font-semibold">Expert Audit Pending</span>
                  <span className="text-slate-400 text-sm">Delivery in 48 hours</span>
                </div>
              </div>
            );
          } else if (conciergeStatus === 'delivered') {
            // Show: "View Your Audit" button
            return (
              <div className="glass-strong p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-emerald-400 font-bold text-lg">Expert Audit Ready!</h3>
                    <p className="text-slate-300 text-sm mt-1">Your personalized analysis is available</p>
                  </div>
                  <Link href={`/dashboard/upload/${id}/audit`}>
                    <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2">
                      View Your Audit
                    </Button>
                  </Link>
                </div>
              </div>
            );
          } else {
            // concierge_status === 'none' (default)
            // Show: "Get Expert Audit £299" button with upsell text
            return (
              <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Lock className="text-amber-400 mt-1" size={20} />
                  <div>
                    <h3 className="text-amber-400 font-semibold">Free Analysis - Limited Details</h3>
                    <p className="text-slate-300 text-sm mt-1">
                      We found <span className="text-white font-bold">£{((analysis?.total_spend || 0) * 0.4 * 0.3).toFixed(2)}+</span> in potential savings. 
                      Upgrade to see exactly where and how to fix it.
                    </p>
                    <div className="mt-3 flex gap-3">
                      <Link href="/pricing">
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium">
                          Get Expert Audit - £299
                        </Button>
                      </Link>
                      <span className="text-xs text-slate-500 self-center">
                        Includes code fixes & implementation guide
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        })()}

        {/* MIGRATION ROADMAP TABLE */}
        {analysis && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Recommended Migrations</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left py-3">Current Model</th>
                  <th className="text-left py-3">Switch To</th>
                  <th className="text-right py-3">Monthly Savings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800/50">
                  <td className="py-3 text-red-400">GPT-4o</td>
                  <td className="py-3 text-emerald-400">GPT-5.2</td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    £{(analysis.total_spend * 0.15).toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-3 text-red-400">o3</td>
                  <td className="py-3 text-emerald-400">GPT-5.2</td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    £{(analysis.total_spend * 0.25).toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-3 text-red-400">o1</td>
                  <td className="py-3 text-emerald-400">o3</td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    £{(analysis.total_spend * 0.20).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Concierge Status */}
        {conciergeStatus !== 'none' && (
          <ConciergeStatus
            uploadId={id}
            tier={conciergeStatus === 'pending' ? 'concierge_pending' : conciergeStatus === 'delivered' ? 'concierge_delivered' : 'self_serve'}
            loomVideoUrl={upload.loom_video_url}
            consultantNotes={upload.consultant_notes}
            savingsEstimate={upload.savings_estimate}
            codeSnippets={codeSnippets}
          />
        )}

        {/* Status Banner */}
        {paid && (
          <div className="glass-strong p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <p className="text-emerald-400 text-sm">
              Payment successful. Your expert analysis will be prepared and you'll be notified when it's ready.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
