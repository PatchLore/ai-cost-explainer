import Link from "next/link";
import { DashboardNav } from "./components/DashboardNav";
import { ToastProvider } from "./components/Toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/dashboard" className="font-semibold text-slate-800">
              AI Cost Explainer
            </Link>
            <DashboardNav />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
