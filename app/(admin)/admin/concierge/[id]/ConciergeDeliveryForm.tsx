"use client";

import { useState } from "react";
import { CheckCircle, Video, FileText as FileTextIcon, Code, DollarSign, Edit3, Eye, EyeOff } from "lucide-react";

interface ConciergeDeliveryFormProps {
  uploadId: string;
  adminEmail: string;
  isDelivered?: boolean;
  currentDelivery?: {
    delivered_at: any;
    loom_video_url: any;
    report: any;
    savings_estimate: any;
    code_snippets?: { title: string; language: string; code: string }[];
  } | null;
}

export function ConciergeDeliveryForm({
  uploadId,
  adminEmail,
  isDelivered = false,
  currentDelivery,
}: ConciergeDeliveryFormProps) {
  const [loading, setLoading] = useState(false);
  const [markdownPreview, setMarkdownPreview] = useState(false);
  const [loomPreview, setLoomPreview] = useState(false);

  const [formData, setFormData] = useState({
    loomUrl: currentDelivery?.loom_video_url || '',
    report: currentDelivery?.report || '',
    savings: currentDelivery?.savings_estimate || '',
    codeSnippets: JSON.stringify(currentDelivery?.code_snippets || [], null, 2) || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const codeSnippetsRaw = formData.codeSnippets;
    let codeSnippets: { title: string; language: string; code: string }[] = [];
    if (codeSnippetsRaw.trim()) {
      try {
        codeSnippets = JSON.parse(codeSnippetsRaw) as {
          title: string;
          language: string;
          code: string;
        }[];
      } catch {
        alert("Invalid JSON in Code Snippets. Please fix the format.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/concierge/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          loomUrl: formData.loomUrl || null,
          report: formData.report || null,
          savings: formData.savings ? Number(formData.savings) : null,
          codeSnippets: codeSnippets.length > 0 ? codeSnippets : undefined,
          adminEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delivery failed");
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delivery failed");
    } finally {
      setLoading(false);
    }
  }

  if (isDelivered) {
    return (
      <div className="glass-strong p-6 rounded-xl border border-emerald-500/30 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Delivery Complete</h3>
        </div>
        <p className="text-slate-300 mb-4">
          This concierge service has been delivered to the customer. The video and report are now available to them.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="glass p-3 rounded-lg border border-slate-700/50">
            <span className="text-slate-400">Delivered:</span>
            <span className="text-white ml-2">{new Date(currentDelivery?.delivered_at).toLocaleString()}</span>
          </div>
          <div className="glass p-3 rounded-lg border border-slate-700/50">
            <span className="text-slate-400">Savings Estimate:</span>
            <span className="text-emerald-400 ml-2">${currentDelivery?.savings_estimate || '0'}/month</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Delivery Form</h3>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span>Status: Pending</span>
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="uploadId" value={uploadId} />
        
        {/* Loom URL Input */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-300">
            <Video className="w-4 h-4" />
            Loom Video URL
          </label>
          <div className="space-y-2">
            <input
              name="loomUrl"
              value={formData.loomUrl}
              onChange={(e) => handleInputChange('loomUrl', e.target.value)}
              required
              placeholder="https://www.loom.com/share/..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            {formData.loomUrl && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLoomPreview(!loomPreview)}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  {loomPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {loomPreview ? 'Hide' : 'Preview'} Video
                </button>
              </div>
            )}
            {loomPreview && formData.loomUrl && (
              <div className="glass p-4 rounded-lg border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2">Video Preview:</p>
                <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                  <span className="text-slate-500 text-sm">Video preview would appear here</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Markdown Report */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-300">
            <FileTextIcon className="w-4 h-4" />
            Written Report (Markdown)
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMarkdownPreview(!markdownPreview)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded border transition-colors ${
                  markdownPreview 
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300' 
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {markdownPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {markdownPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {markdownPreview ? (
              <div className="glass p-4 rounded-lg border border-slate-700/50 prose prose-invert prose-slate max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: formData.report 
                    ? formData.report.replace(/\n/g, '<br>') 
                    : '<p className="text-slate-500">No report content yet.</p>'
                }} />
              </div>
            ) : (
              <textarea
                name="report"
                value={formData.report}
                onChange={(e) => handleInputChange('report', e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white font-mono text-sm placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="## Top 5 Savings Opportunities...\n\n### 1. Model Optimization\n..."
              />
            )}
          </div>
        </div>

        {/* Code Snippets */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-300">
            <Code className="w-4 h-4" />
            Code Snippets (JSON array)
          </label>
          <textarea
            name="codeSnippets"
            value={formData.codeSnippets}
            onChange={(e) => handleInputChange('codeSnippets', e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white font-mono text-sm placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder='[{"title": "Batching fix", "language": "python", "code": "import openai\n\n# Before: individual requests\nfor item in items:\n    response = openai.ChatCompletion.create(...)\n\n# After: batch requests\nresponses = openai.ChatCompletion.create(\n    messages=[...],\n    batch_size=len(items)\n)"}]'
          />
        </div>

        {/* Savings Estimate */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-300">
            <DollarSign className="w-4 h-4" />
            Estimated Monthly Savings ($)
          </label>
          <input
            name="savings"
            type="number"
            step="0.01"
            min="0"
            value={formData.savings}
            onChange={(e) => handleInputChange('savings', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-700/50">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/25 hover-scale transition-all text-lg border-2 border-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Mark as Delivered
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
