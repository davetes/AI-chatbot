export default function AdminDashboard() {
  return (
    <div className="admin-card">
      <h2>Admin Dashboard</h2>
      <div className="admin-grid">
        <div className="admin-panel">
          <h3>Conversations</h3>
          <p>View and export chats.</p>
        </div>
        <div className="admin-panel">
          <h3>Leads</h3>
          <p>Capture and route leads to CRM.</p>
        </div>
        <div className="admin-panel">
          <h3>Analytics</h3>
          <p>Track engagement and response times.</p>
        </div>
      </div>
    </div>
  );
}
