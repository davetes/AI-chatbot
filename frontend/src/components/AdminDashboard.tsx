"use client";

import { useEffect, useState } from "react";
import { getAnalytics, getConversationMessages, getConversations, getLeads } from "../services/api";

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

type ConversationMessage = {
  id: number;
  sender: string;
  content: string;
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
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const load = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const platform = platformFilter === "all" ? undefined : platformFilter;
      const [a, c, l] = await Promise.all([
        getAnalytics(),
        getConversations(limit, offset, platform),
        getLeads(),
      ]);
      setAnalytics(a);
      setConversations(c);
      setLeads(l);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, platformFilter]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) {
        setConversationMessages([]);
        return;
      }
      try {
        const messages = await getConversationMessages(selectedConversation.id, 50);
        setConversationMessages(messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load conversation messages");
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  const channelEntries = analytics ? Object.entries(analytics.channels) : [];
  const filteredConversations = conversations.filter((conv) =>
    conv.user_external_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="uppercase text-xs tracking-[0.12em] text-slate-400 mb-1">Overview</p>
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <p className="text-slate-400">Monitor conversations, leads, and channel performance.</p>
        </div>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 font-semibold disabled:opacity-50"
            disabled={loading}
            onClick={load}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <h3 className="text-sm text-slate-400">Total Messages</h3>
          <p className="text-2xl font-semibold mt-2">{loading ? "..." : analytics?.total_messages ?? "0"}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <h3 className="text-sm text-slate-400">Total Conversations</h3>
          <p className="text-2xl font-semibold mt-2">{loading ? "..." : analytics?.total_conversations ?? "0"}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <h3 className="text-sm text-slate-400">Total Leads</h3>
          <p className="text-2xl font-semibold mt-2">{loading ? "..." : analytics?.total_leads ?? "0"}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <h3 className="text-sm text-slate-400">Last 24h</h3>
          <p className="text-2xl font-semibold mt-2">{loading ? "..." : analytics?.last_24h ?? "0"}</p>
        </div>
      </div>

      <div className="mt-6" id="channels">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Channels</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {loading && <span className="px-3 py-1 rounded-full bg-slate-800 text-xs">Loading…</span>}
          {!loading && channelEntries.length === 0 && <span className="px-3 py-1 rounded-full bg-slate-800 text-xs">No data</span>}
          {!loading &&
            channelEntries.map(([name, count]) => (
              <span key={name} className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
                {name} · {count}
              </span>
            ))}
        </div>
      </div>

      {error && <p className="mt-4 text-rose-300 font-semibold">{error}</p>}

      <div className="mt-8" id="conversations">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Recent Conversations</h3>
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-2/5 space-y-3">
            <div className="flex flex-col gap-3">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by user ID..."
                className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100"
              />
              <select
                value={platformFilter}
                onChange={(event) => {
                  setPage(1);
                  setPlatformFilter(event.target.value);
                }}
                className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100"
              >
                <option value="all">All Platforms</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="messenger">Messenger</option>
                <option value="instagram">Instagram</option>
                <option value="telegram">Telegram</option>
                <option value="webchat">Web</option>
              </select>
            </div>

            {loading && <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">Loading conversations...</div>}
            {!loading && filteredConversations.length === 0 && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">No conversations yet.</div>
            )}
            {!loading &&
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`text-left p-4 rounded-xl border transition ${
                    selectedConversation?.id === conv.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                      {conv.platform}
                    </span>
                    <span>{new Date(conv.created_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <div>User: {conv.user_external_id}</div>
                    <div>Status: {conv.status}</div>
                  </div>
                </button>
              ))}

            <div className="flex items-center justify-between text-sm text-slate-300">
              <button
                className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-50"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-50"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading || conversations.length < limit}
              >
                Next
              </button>
            </div>
          </div>

          <div className="lg:w-3/5">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 min-h-[220px]">
              <h4 className="text-sm font-semibold mb-3">Conversation Detail</h4>
              {!selectedConversation && <p className="text-sm text-slate-400">Select a conversation to view messages.</p>}
              {selectedConversation && (
                <div className="space-y-3">
                  {conversationMessages.length === 0 && (
                    <p className="text-sm text-slate-400">No messages yet.</p>
                  )}
                  {conversationMessages.map((msg) => (
                    <div key={msg.id} className="flex flex-col gap-1 text-sm">
                      <span className="text-slate-400">
                        {msg.sender} · {new Date(msg.created_at).toLocaleString()}
                      </span>
                      <span className="text-slate-100">{msg.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8" id="leads">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Recent Leads</h3>
        </div>
        <div className="flex flex-col gap-3">
          {loading && <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">Loading leads...</div>}
          {!loading && leads.length === 0 && <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">No leads yet.</div>}
          {!loading &&
            leads.map((lead) => (
              <div key={lead.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    {lead.platform}
                  </span>
                  <span>{new Date(lead.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 text-sm">
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
