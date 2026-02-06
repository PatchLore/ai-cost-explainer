import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import { ConciergeDeliveryForm } from "./ConciergeDeliveryForm";

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
  if (!upload) redirect("/admin");

  const rawData = upload.raw_data as unknown[];
  const previewRows = Array.isArray(rawData) ? rawData.slice(0, 20) : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <h1 className="text-2xl font-bold text-slate-800">
        Deliver Concierge Service
      </h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-800">Upload data (preview)</h2>
          <div className="max-h-96 overflow-auto">
            {previewRows.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {Object.keys(previewRows[0] as object).map((k) => (
                      <th key={k} className="p-2 font-medium text-slate-600">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {Object.values(row as Record<string, unknown>).map((v, j) => (
                        <td key={j} className="p-2 text-slate-700">
                          {String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-500">No data to preview.</p>
            )}
          </div>
        </div>
        <div>
          <ConciergeDeliveryForm uploadId={id} adminEmail={adminEmail} />
        </div>
      </div>
    </div>
  );
}
