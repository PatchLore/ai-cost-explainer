"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { CsvUpload } from "@/lib/types";
import { CSVUploader } from "../components/CSVUploader";

interface DashboardContentProps {
  user: any;
}

export function DashboardContent({ user }: DashboardContentProps) {
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

      if (!error) {
        // Deduplicate uploads by ID to prevent duplicate entries
        const uniqueUploads = data ? 
          Array.from(new Map(data.map(u => [u.id, u])).values()) : 
          [];
        setUploads(uniqueUploads);
      }
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
          analysis_data: null,
          created_at: new Date().toISOString(),
          tier: "self_serve",
          concierge_status: 'none',
          stripe_payment_intent_id: null,
          loom_video_url: null,
          consultant_notes: null,
          savings_estimate: null,
        };
      return [added, ...prev];
    });
  };

  const getUploadType = (upload: CsvUpload) => {
    if (upload.tier === 'concierge_pending') {
      return 'pending_concierge';
    } else if (upload.tier === 'concierge_delivered') {
      return 'delivered_concierge';
    } else {
      return 'csv_analysis';
    }
  };

  const getUploadAction = (upload: CsvUpload) => {
    const type = getUploadType(upload);
    const uploadType = getUploadType(upload);
    
    if (uploadType === 'pending_concierge') {
      return {
        label: 'Upload CSV',
        href: `/dashboard/upload/${upload.id}`,
        variant: 'primary'
      };
    } else if (uploadType === 'delivered_concierge') {
      return {
        label: 'View Audit Report',
        href: `/dashboard/upload/${upload.id}`,
        variant: 'secondary'
      };
    } else {
      return {
        label: 'View Analysis',
        href: `/dashboard/upload/${upload.id}`,
        variant: 'secondary'
      };
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Your Uploads & Audits</h1>

        {/* Upload dropzone for free users */}
        {(!uploads || uploads.length === 0 || uploads.every(u => u.concierge_status === 'none')) && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Upload Your OpenAI Usage CSV</h2>
                <p className="text-sm text-slate-600">Free analysis • £299 for expert audit</p>
              </div>
            </div>
            <CSVUploader userId={userId || ''} onComplete={onUploadComplete} />
          </div>
        )}

        <div className="flex justify-between items-start gap-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6 flex-1">
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">CSV Analysis (Free)</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Cost breakdown by model</li>
                <li>• Spending trends over time</li>
                <li>• 3 instant savings recommendations</li>
              </ul>
            </div>

            <div className="bg-violet-50 p-6 rounded-lg border border-violet-200">
              <h3 className="font-semibold text-lg mb-3 text-violet-900">Expert Audit (£299)</h3>
              <ul className="space-y-2 text-sm text-violet-800">
                <li>• Personal written audit report</li>
                <li>• Specific migration plan</li>
                <li>• 48-hour delivery guarantee</li>
              </ul>
            </div>

            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
              <h3 className="font-semibold text-lg mb-3 text-emerald-900">What You Get</h3>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li>• Clear cost optimization roadmap</li>
                <li>• Code fixes & implementation guide</li>
                <li>• Personal consultant support</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 min-w-[280px]">
            {(() => {
              const hasPendingAudit = uploads.some(u => u.concierge_status === 'pending');
              const hasDeliveredAudit = uploads.some(u => u.concierge_status === 'delivered');

              if (hasPendingAudit) {
                // Hide button or show status
                return (
                  <div className="text-center">
                    <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
                      <span className="text-amber-400 font-semibold">Expert Audit in Progress</span>
                      <p className="text-amber-300 text-sm mt-1">Your audit is being prepared. You'll be notified when ready.</p>
                    </div>
                  </div>
                );
              }

              if (hasDeliveredAudit || uploads.length === 0) {
                // Show button linking to pricing
                return (
                  <div className="text-center">
                    <Link href="/pricing">
                      <button className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-lg transition-all hover-scale w-full">
                        New Analysis
                      </button>
                    </Link>
                    <p className="text-sm text-gray-500 mt-2 leading-tight">
                      £299 per report • Email support@aispendaudit.com for bulk pricing (3+ audits)
                    </p>
                  </div>
                );
              }

              // Default case for regular CSV analysis users
              return (
                <div className="text-center">
                  <Link href="/upload">
                    <button className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-lg transition-all hover-scale w-full">
                      New Analysis
                    </button>
                  </Link>
                  <p className="text-sm text-gray-500 mt-2">
                    Start with free CSV analysis
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading uploads...</p>
      ) : uploads.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          No uploads yet. Click "New Analysis" to get started with your free analysis.
        </p>
      ) : (
        <div className="space-y-6">
          {uploads.map((upload) => {
            const type = getUploadType(upload);
            const action = getUploadAction(upload);
            const uploadDate = new Date(upload.created_at).toLocaleDateString();
            
            return (
              <div key={upload.id} className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50 hover:shadow-slate-900/20 transition-all hover:scale-[1.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'csv_analysis' ? 'bg-blue-500' : 
                      type === 'pending_concierge' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {type === 'csv_analysis' && 'CSV Analysis'}
                          {type === 'pending_concierge' && 'Expert Audit (Pending)'}
                          {type === 'delivered_concierge' && 'Expert Audit (Delivered)'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          type === 'csv_analysis' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          type === 'pending_concierge' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {type === 'csv_analysis' && 'Free'}
                          {type === 'pending_concierge' && 'Pending'}
                          {type === 'delivered_concierge' && 'Delivered'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        {upload.filename ? (
                          <span className="font-medium text-white">{upload.filename}</span>
                        ) : (
                          <span>Created: {uploadDate}</span>
                        )}
                        {upload.savings_estimate && (
                          <span className="ml-2 text-emerald-400 font-medium">
                            • Estimated savings: £{upload.savings_estimate.toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {type === 'pending_concierge' && (
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-sm text-amber-400">
                        Upload CSV to start analysis
                      </span>
                    )}
                    {type === 'delivered_concierge' && (
                      <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm text-emerald-400">
                        Audit ready to view
                      </span>
                    )}
                    <Link
                      href={action.href}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        action.variant === 'primary' 
                          ? 'bg-violet-500 hover:bg-violet-400 text-white' 
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {action.label}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
