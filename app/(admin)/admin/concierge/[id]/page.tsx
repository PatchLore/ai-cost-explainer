import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase";
import { ConciergeDeliveryForm } from "./ConciergeDeliveryForm";
import { ArrowLeft, Mail, Calendar, FileText, BadgeCheck, Clock, User } from "lucide-react";

async function getUser() {
  const sb = createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function getUploadDetails(id: string) {
  const sb = createServerSupabase();
  const { data, error } = await sb
    .from("csv_uploads")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data;
}

async function getDeliveryStatus(id: string) {
  const sb = createServerSupabase();
  const { data } = await sb
    .from("concierge_deliverables")
    .select("delivered_at, loom_video_url, report, savings_estimate")
    .eq("upload_id", id)
    .single();
  return data;
}

export default async function ConciergeDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user?.email !== adminEmail) redirect("/");

  const upload = await getUploadDetails(id);
  const deliveryStatus = await getDeliveryStatus(id);
  
  if (!upload) redirect("/admin");

  const rawData = upload.raw_data as unknown[];
  const previewRows = Array.isArray(rawData) ? rawData.slice(0, 20) : [];

  const isDelivered = !!deliveryStatus?.delivered_at;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="glass-strong p-6 border border-slate-800/80 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Admin
            </Link>
            <div className="w-px h-8 bg-slate-700"></div>
            <h1 className="text-2xl font-bold text-white">Concierge Delivery Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDelivered 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {isDelivered ? 'Delivered' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Info Card */}
          <div className="lg:col-span-1">
            <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
              <h2 className="text-lg font-semibold text-white mb-4">Order Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Customer</p>
                    <p className="text-white font-medium">{upload.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Upload Date</p>
                    <p className="text-white font-medium">{new Date(upload.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">File</p>
                    <p className="text-white font-medium">{upload.filename || 'CSV Upload'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      upload.status === 'completed' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
                    }`}>
                      {upload.status || 'Processing'}
                    </span>
                  </div>
                </div>
                {deliveryStatus?.delivered_at && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm text-slate-400">Delivered</p>
                      <p className="text-white font-medium">{new Date(deliveryStatus.delivered_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Preview */}
          <div className="lg:col-span-2">
            <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
              <h2 className="text-lg font-semibold text-white mb-4">Upload Data Preview</h2>
              <div className="max-h-96 overflow-auto">
                {previewRows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          {Object.keys(previewRows[0] as object).map((k) => (
                            <th key={k} className="p-3 font-medium text-slate-300 text-left">
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i} className="border-b border-slate-800/50">
                            {Object.values(row as Record<string, unknown>).map((v, j) => (
                              <td key={j} className="p-3 text-slate-300 font-mono text-sm">
                                {String(v)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500">No data to preview.</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Form */}
          <div className="lg:col-span-3">
            <ConciergeDeliveryForm 
              uploadId={id} 
              adminEmail={adminEmail} 
              isDelivered={isDelivered}
              currentDelivery={deliveryStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
