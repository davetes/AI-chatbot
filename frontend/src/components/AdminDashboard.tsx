"use client";

import { useEffect, useState } from "react";
import { getAnalytics, getConversations, getLeads } from "../services/api";

type Analytics = {
  total_messages: number;
  channels: Record<string, number>;
  last_24h: number;
  total_conversations: number;
  total_leads: number;
};

type Conversation = {
  id: number;
  platform: string;
  status: string;
  user_external_id: string;
  created_at: string;
};

type Lead = {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  platform: string;
  intent: string | null;
  created_at: string;
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [a, c, l] = await Promise.all([getAnalytics(), getConversations(), getLeads()]);
        setAnalytics(a);
        setConversations(c);
        setLeads(l);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="admin-card">
      <h2>Admin Dashboard</h2>
      <div className="admin-grid">
        <div className="admin-panel">
          <h3>Total Messages</h3>
          <p>{loading ? "..." : analytics?.total_messages ?? "0"}</p>
        </div>
        <div className="admin-panel">
          <h3>Total Conversations</h3>
          <p>{loading ? "..." : analytics?.total_conversations ?? "0"}</p>
        </div>
        <div className="admin-panel">
          <h3>Total Leads</h3>
          <p>{loading ? "..." : analytics?.total_leads ?? "0"}</p>
        </div>
        <div className="admin-panel">
          <h3>Last 24h</h3>
          <p>{loading ? "..." : analytics?.last_24h ?? "0"}</p>
        </div>
        <div className="admin-panel">
          <h3>Channels</h3>
          <ul>
            {loading
              ? "..."
              : analytics
              ? Object.entries(analytics.channels).map(([name, count]) => (
                  <li key={name}>
                    {name}: {count}
                  </li>
                ))
              : "No data"}
          </ul>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <h3 style={{ marginTop: "24px" }}>Recent Conversations</h3>
      <div className="admin-table">
        {loading && <div className="admin-row">Loading conversations...</div>}
        {!loading && conversations.length === 0 && <div className="admin-row">No conversations yet.</div>}
        {!loading &&
          conversations.map((conv) => (
            <div key={conv.id} className="admin-row">
              <div>
                <strong>{conv.platform}</strong> • {new Date(conv.created_at).toLocaleString()}
              </div>
              <div>User: {conv.user_external_id}</div>
              <div>Status: {conv.status}</div>
            </div>
          ))}
      </div>

      <h3 style={{ marginTop: "24px" }}>Recent Leads</h3>
      <div className="admin-table">
        {loading && <div className="admin-row">Loading leads...</div>}
        {!loading && leads.length === 0 && <div className="admin-row">No leads yet.</div>}
        {!loading &&
          leads.map((lead) => (
            <div key={lead.id} className="admin-row">
              <div>
                <strong>{lead.platform}</strong> • {new Date(lead.created_at).toLocaleString()}
              </div>
              <div>Name: {lead.name ?? "-"}</div>
              <div>Phone: {lead.phone ?? "-"}</div>
              <div>Email: {lead.email ?? "-"}</div>
              <div>Intent: {lead.intent ?? "-"}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
