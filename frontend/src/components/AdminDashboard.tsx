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

  useEffect(() => {
    const load = async () => {
      const [a, m] = await Promise.all([getAnalytics(), getMessages()]);
      setAnalytics(a);
      setMessages(m);
    };
    load();
  }, []);

  return (
    <div className="admin-card">
      <h2>Admin Dashboard</h2>
      <div className="admin-grid">
        <div className="admin-panel">
          <h3>Total Messages</h3>
          <p>{analytics?.total_messages ?? "..."}</p>
        </div>
        <div className="admin-panel">
          <h3>Last 24h</h3>
          <p>{analytics?.last_24h ?? "..."}</p>
        </div>
        <div className="admin-panel">
          <h3>Channels</h3>
          <ul>
            {analytics
              ? Object.entries(analytics.channels).map(([name, count]) => (
                  <li key={name}>
                    {name}: {count}
                  </li>
                ))
              : "..."}
          </ul>
        </div>
      </div>

      <h3 style={{ marginTop: "24px" }}>Recent Conversations</h3>
      <div className="admin-table">
        {messages.map((msg) => (
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
