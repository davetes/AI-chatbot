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

  const channelEntries = analytics ? Object.entries(analytics.channels) : [];

  return (
    <div className="admin-card">
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">Overview</p>
          <h2>Admin Dashboard</h2>
          <p className="admin-subtitle">Monitor conversations, leads, and channel performance.</p>
        </div>
        <div className="admin-actions">
          <button className="admin-button" disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-panel">
          <h3>Total Messages</h3>
          <p className="admin-metric">{loading ? "..." : analytics?.total_messages ?? "0"}</p>
        </div>
        <div className="admin-panel">
          <h3>Total Conversations</h3>
          <p className="admin-metric">{loading ? "..." : analytics?.total_conversations ?? "0"}</p>
        </div>
        <div className="admin-panel">
          <h3>Total Leads</h3>
          <p className="admin-metric">{loading ? "..." : analytics?.total_leads ?? "0"}</p>
        </div>
        <div className="admin-panel">
          <h3>Last 24h</h3>
          <p className="admin-metric">{loading ? "..." : analytics?.last_24h ?? "0"}</p>
        </div>
      </div>

      <div className="admin-section" id="channels">
        <div className="admin-section-header">
          <h3>Channels</h3>
        </div>
        <div className="admin-chips">
          {loading && <span className="admin-chip">Loading…</span>}
          {!loading && channelEntries.length === 0 && <span className="admin-chip">No data</span>}
          {!loading &&
            channelEntries.map(([name, count]) => (
              <span key={name} className="admin-chip">
                {name} · {count}
              </span>
            ))}
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-section" id="conversations">
        <div className="admin-section-header">
          <h3>Recent Conversations</h3>
        </div>
        <div className="admin-table">
          {loading && <div className="admin-row">Loading conversations...</div>}
          {!loading && conversations.length === 0 && <div className="admin-row">No conversations yet.</div>}
          {!loading &&
            conversations.map((conv) => (
              <div key={conv.id} className="admin-row">
                <div className="admin-row-title">
                  <span className="admin-badge">{conv.platform}</span>
                  <span>{new Date(conv.created_at).toLocaleString()}</span>
                </div>
                <div className="admin-row-content">
                  <span>User: {conv.user_external_id}</span>
                  <span>Status: {conv.status}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="admin-section" id="leads">
        <div className="admin-section-header">
          <h3>Recent Leads</h3>
        </div>
        <div className="admin-table">
          {loading && <div className="admin-row">Loading leads...</div>}
          {!loading && leads.length === 0 && <div className="admin-row">No leads yet.</div>}
          {!loading &&
            leads.map((lead) => (
              <div key={lead.id} className="admin-row">
                <div className="admin-row-title">
                  <span className="admin-badge">{lead.platform}</span>
                  <span>{new Date(lead.created_at).toLocaleString()}</span>
                </div>
                <div className="admin-row-content">
                  <span>Name: {lead.name ?? "-"}</span>
                  <span>Phone: {lead.phone ?? "-"}</span>
                  <span>Email: {lead.email ?? "-"}</span>
                  <span>Intent: {lead.intent ?? "-"}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
