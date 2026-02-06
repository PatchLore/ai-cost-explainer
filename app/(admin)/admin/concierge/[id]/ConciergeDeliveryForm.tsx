"use client";

import { useState } from "react";

interface ConciergeDeliveryFormProps {
  uploadId: string;
  adminEmail: string;
}

export function ConciergeDeliveryForm({
  uploadId,
  adminEmail,
}: ConciergeDeliveryFormProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const loomUrl = (form.elements.namedItem("loomUrl") as HTMLInputElement)
      .value;
    const report = (form.elements.namedItem("report") as HTMLTextAreaElement)
      .value;
    const savings = (form.elements.namedItem("savings") as HTMLInputElement)
      .value;
    const codeSnippetsRaw = (
      form.elements.namedItem("codeSnippets") as HTMLTextAreaElement
    ).value;
    let codeSnippets: { title: string; language: string; code: string }[] = [];
    if (codeSnippetsRaw.trim()) {
      try {
        codeSnippets = JSON.parse(codeSnippetsRaw) as {
          title: string;
          language: string;
          code: string;
        }[];
      } catch {
        // ignore invalid JSON
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/concierge/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          loomUrl,
          report: report || null,
          savings: savings ? Number(savings) : null,
          codeSnippets: codeSnippets.length > 0 ? codeSnippets : undefined,
          adminEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delivery failed");
      setDone(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delivery failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-800">
        Delivered. The customer can now see their video and report.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="uploadId" value={uploadId} />
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Loom Video URL
        </label>
        <input
          name="loomUrl"
          required
          placeholder="https://www.loom.com/share/..."
          className="w-full rounded border border-slate-300 p-2 text-slate-800"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Written Report (Markdown)
        </label>
        <textarea
          name="report"
          rows={10}
          className="w-full rounded border border-slate-300 p-2 font-mono text-sm text-slate-800"
          placeholder="## Top 5 Savings Opportunities..."
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Code Snippets (JSON array)
        </label>
        <textarea
          name="codeSnippets"
          rows={6}
          className="w-full rounded border border-slate-300 p-2 font-mono text-sm text-slate-800"
          placeholder='[{"title": "Batching fix", "language": "python", "code": "..."}]'
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Estimated Monthly Savings ($)
        </label>
        <input
          name="savings"
          type="number"
          step="0.01"
          min="0"
          className="w-full rounded border border-slate-300 p-2 text-slate-800"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Deliver to Customer"}
      </button>
    </form>
  );
}
