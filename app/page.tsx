import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
              Cut Your OpenAI Bill by 30-60%
            </h1>
            <p className="mt-4 text-lg text-slate-700">
              Upload your usage CSV. Get instant analysis + expert audit.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white shadow hover:bg-emerald-700"
              >
                Upload CSV - Free Analysis
              </Link>
              <span className="text-sm text-slate-600">Most audits uncover 40-60% in savings opportunities</span>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2 text-emerald-600 font-medium">✓ £299 one-time</span>
              <span className="inline-flex items-center gap-2 text-emerald-600 font-medium">✓ 48-hour delivery</span>
              <span className="inline-flex items-center gap-2 text-emerald-600 font-medium">✓ Money-back guarantee</span>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-slate-600">Instant analysis of your OpenAI spending patterns</div>
              <div className="text-sm text-slate-600">🔒 Your data never leaves our secure servers</div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">How It Works</h3>
            <ol className="mt-4 space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-800">1</div>
                <div>
                  <div className="font-medium">Export</div>
                  <div className="text-sm text-slate-600">Export your OpenAI usage CSV (2 clicks from platform.openai.com)</div>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-800">2</div>
                <div>
                  <div className="font-medium">Upload</div>
                  <div className="text-sm text-slate-600">See instant cost breakdown & 3 free recommendations</div>
                  <ul className="mt-2 text-sm text-slate-600 list-disc list-inside">
                    <li>Cost breakdown by model (GPT-4 vs GPT-3.5)</li>
                    <li>Spending trends over time</li>
                    <li>3 instant savings recommendations</li>
                    <li className="mt-2">Works with all OpenAI models: GPT-4o, GPT-4, o1, o3, GPT-3.5</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-800">3</div>
                <div>
                  <div className="font-medium">Get Expert Audit (£299)</div>
                  <div className="text-sm text-slate-600">Personal video walkthrough + written report</div>
                  <ul className="mt-2 text-sm text-slate-600 list-disc list-inside">
                    <li>Personal video walkthrough of your findings</li>
                    <li>Written audit report</li>
                    <li>Specific migration plan (GPT-4 → cheaper models)</li>
                    <li>48-hour delivery guarantee</li>
                  </ul>
                </div>
              </li>
            </ol>

            <div className="mt-6">
              <Link
                href="/dashboard?upgrade=concierge"
                className="inline-block rounded bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
              >
                Get Expert Audit — £299
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-10 max-w-5xl mx-auto px-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800">Sample Expert Report</h4>
              <p className="mt-2 text-sm text-slate-600">Preview of the written audit you receive with the £299 Expert Audit.</p>
            </div>
            <div className="w-full md:w-64 h-40 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
              <span>Report preview</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
