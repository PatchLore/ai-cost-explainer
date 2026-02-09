"use client";

import { useState } from "react";
import type { CsvUploadTier } from "@/lib/types";
import { CopyButton } from "./CopyButton";

export interface CodeSnippetDisplay {
  title: string;
  language: string;
  code: string;
}

interface ConciergeStatusProps {
  uploadId: string;
  tier: CsvUploadTier;
  loomVideoUrl: string | null;
  consultantNotes: string | null;
  savingsEstimate: number | null;
  codeSnippets?: CodeSnippetDisplay[] | null;
}

function downloadSnippet(s: CodeSnippetDisplay) {
  const ext = s.language === "python" ? "py" : s.language === "javascript" ? "js" : "txt";
  const blob = new Blob([s.code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${s.title.replace(/\s+/g, "-")}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadAllSnippets(snippets: CodeSnippetDisplay[]) {
  const text = snippets
    .map(
      (s) =>
        `// ${s.title}\n// Language: ${s.language}\n\n${s.code}\n\n${"---".repeat(20)}\n`
    )
    .join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expert-code-snippets.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export function ConciergeStatus({
  uploadId,
  tier,
  loomVideoUrl,
  consultantNotes,
  savingsEstimate,
  codeSnippets = [],
}: ConciergeStatusProps) {
  const [loading, setLoading] = useState(false);
  const snippets = Array.isArray(codeSnippets) ? codeSnippets : [];

  const startCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-concierge-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error ?? "Checkout failed");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (tier === "concierge_delivered") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <h3 className="mb-2 font-semibold text-green-800">
          Expert Analysis Delivered
        </h3>
        {loomVideoUrl && (
          <a
            href={loomVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 inline-block text-blue-600 hover:underline"
          >
            Watch your personalized Loom video →
          </a>
        )}
        {consultantNotes && (
          <div className="prose prose-sm mt-2 max-w-none text-slate-700">
            {consultantNotes}
          </div>
        )}
        {savingsEstimate != null && (
          <p className="mt-2 font-medium text-green-800">
            Estimated monthly savings: ${savingsEstimate.toFixed(2)}
          </p>
        )}
        {snippets.length > 0 && (
          <div className="mt-4 rounded border border-green-300 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-medium text-slate-800">Code Snippets</h4>
              <button
                type="button"
                onClick={() => downloadAllSnippets(snippets)}
                className="rounded bg-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-300"
              >
                Download all
              </button>
            </div>
            <ul className="space-y-3">
              {snippets.map((s, i) => (
                <li
                  key={i}
                  className="rounded border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{s.title}</span>
                    <button
                      type="button"
                      onClick={() => downloadSnippet(s)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Download
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <CopyButton codeString={s.code} />
                    <pre className="max-h-40 overflow-auto rounded bg-slate-800 p-2 pr-10 text-xs text-slate-100">
                      {s.code}
                    </pre>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (tier === "concierge_pending") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-800">
          Expert Analysis In Progress
        </h3>
        <p className="mt-1 text-sm text-amber-700">
          Your video analysis and implementation guide are being prepared.
          You&apos;ll get an email when they&apos;re ready.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
      <h3 className="mb-2 font-semibold text-slate-800">
        Get Expert Audit — £299
      </h3>
      <p className="mb-4 text-sm text-slate-600">
        Personal written audit, custom code snippets, and a migration plan to
        reduce your OpenAI spend.
      </p>
      <button
        onClick={startCheckout}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Redirecting..." : "Get Expert Audit — Reduce your bill"}
      </button>
    </div>
  );
}
