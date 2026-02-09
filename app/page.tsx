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
              <span className="text-sm text-slate-600">Average customer saves £12,000/year</span>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2 text-emerald-600 font-medium">✓ £299 one-time</span>
              <span className="inline-flex items-center gap-2 text-emerald-600 font-medium">✓ 48-hour delivery</span>
              <span className="inline-flex items-center gap-2 text-emerald-600 font-medium">✓ Money-back guarantee</span>
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
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-800">3</div>
                <div>
                  <div className="font-medium">Get Expert Audit (£299)</div>
                  <div className="text-sm text-slate-600">Written report + custom code fixes to reduce bills</div>
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
      </section>
    </main>
  );
}
