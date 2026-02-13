import AdminDashboard from "../../components/AdminDashboard";

export default function AdminPage() {
  return (
    <section className="admin-layout">
      <aside className="admin-sidebar">
        <h3>Admin</h3>
        <nav className="admin-nav">
          <a href="/admin">Overview</a>
          <a href="/admin#conversations">Conversations</a>
          <a href="/admin#leads">Leads</a>
          <a href="/admin#channels">Channels</a>
        </nav>
      </aside>
      <div className="admin-content">
        <AdminDashboard />
      </div>
    </section>
  );
}
