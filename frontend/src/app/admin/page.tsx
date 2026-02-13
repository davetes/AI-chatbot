import AdminDashboard from "../../components/AdminDashboard";

export default function AdminPage() {
  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 h-[calc(100vh-120px)]">
      <aside className="bg-slate-950/80 border-r border-slate-800 px-5 py-6 lg:h-full lg:sticky lg:top-[72px]">
        <h3 className="text-lg font-semibold mb-6">Admin</h3>
        <nav className="flex flex-col gap-2">
          <a className="px-3 py-2 rounded-lg font-semibold hover:bg-slate-900/80" href="/admin">
            Overview
          </a>
          <a className="px-3 py-2 rounded-lg font-semibold hover:bg-slate-900/80" href="/admin#conversations">
            Conversations
          </a>
          <a className="px-3 py-2 rounded-lg font-semibold hover:bg-slate-900/80" href="/admin#leads">
            Leads
          </a>
          <a className="px-3 py-2 rounded-lg font-semibold hover:bg-slate-900/80" href="/admin#channels">
            Channels
          </a>
        </nav>
      </aside>
      <div className="w-full px-6 py-6 overflow-y-auto">
        <AdminDashboard />
      </div>
    </section>
  );
}
