"use client";

import { useEffect, useState } from "react";
import { getAnalytics, getMessages } from "../services/api";

type Analytics = {
  total_messages: number;
  channels: Record<string, number>;
  last_24h: number;
};

type Message = {
  id: number;
  channel: string;
  user_id: string | null;
  user_message: string;
  bot_message: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [a, m] = await Promise.all([getAnalytics(), getMessages()]);
        setAnalytics(a);
        setMessages(m);
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
        {!loading && messages.length === 0 && <div className="admin-row">No conversations yet.</div>}
        {!loading &&
          messages.map((msg) => (
            <div key={msg.id} className="admin-row">
              <div>
                <strong>{msg.channel}</strong> • {new Date(msg.created_at).toLocaleString()}
              </div>
              <div>User: {msg.user_message}</div>
              <div>Bot: {msg.bot_message}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
