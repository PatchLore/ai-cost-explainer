import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-800">AI Cost Explainer</h1>
      <p className="text-slate-600">Analyze and optimize your AI API spend</p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Dashboard
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-100"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
