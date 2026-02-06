export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <a href="/admin" className="font-semibold text-slate-800">
            Admin — AI Cost Audit
          </a>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
