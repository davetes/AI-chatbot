"use client";

import { useEffect, useState } from "react";
import {
  getAnalytics,
  getConversationMessages,
  getConversations,
  getLeads,
  getSettings,
  updateSettings,
  sendEmailReply,
} from "../services/api";

type Analytics = {
  total_messages: number;
  channels: Record<string, number>;
  users_by_platform: Record<string, number>;
  conversations_by_platform: Record<string, number>;
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

type AdminSection = "dashboard" | "conversations" | "leads" | "channels" | "settings" | "email";

export default function AdminDashboard({
  activeSection,
  onQuickAction,
}: {
  activeSection: AdminSection;
  onQuickAction?: (section: AdminSection) => void;
}) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [settingsData, setSettingsData] = useState<Awaited<ReturnType<typeof getSettings>> | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    ai_provider: "",
    ai_model: "",
    ai_base_url: "",
    ai_api_key: "",
    verify_token: "",
    meta_api_version: "",
    meta_access_token: "",
    meta_phone_number_id: "",
    meta_page_access_token: "",
    telegram_bot_token: "",
    crm_webhook_url: "",
    sheets_webhook_url: "",
    database_url: "",
    smtp_host: "",
    smtp_port: "",
    smtp_user: "",
    smtp_pass: "",
    smtp_from: "",
    smtp_tls: "true",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSection, setSettingsSection] = useState<
    "ai" | "messaging" | "crm" | "database" | "smtp" | null
  >(null);
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "custom">("7d");
  const [globalSearch, setGlobalSearch] = useState("");
  const [takeoverEnabled, setTakeoverEnabled] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [conversationTags, setConversationTags] = useState<Record<number, string[]>>({});
  const [tagDraft, setTagDraft] = useState("");
  const [emailForm, setEmailForm] = useState({ to: "", subject: "", message: "" });
  const [emailReply, setEmailReply] = useState("");
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
      const [a, c, l, s] = await Promise.all([
        getAnalytics(),
        getConversations(limit, offset, platform),
        getLeads(),
        getSettings(),
      ]);
      setAnalytics(a);
      setConversations(c);
      setLeads(l);
      setSettingsData(s);
      setSettingsForm({
        ai_provider: s.ai_provider,
        ai_model: s.ai_model,
        ai_base_url: s.ai_base_url ?? "",
        ai_api_key: "",
        verify_token: "",
        meta_api_version: s.meta_api_version,
        meta_access_token: "",
        meta_phone_number_id: s.meta_phone_number_id ?? "",
        meta_page_access_token: "",
        telegram_bot_token: "",
        crm_webhook_url: s.crm_webhook_url ?? "",
        sheets_webhook_url: s.sheets_webhook_url ?? "",
        database_url: s.database_url ?? "",
        smtp_host: s.smtp_host ?? "",
        smtp_port: s.smtp_port ? String(s.smtp_port) : "",
        smtp_user: s.smtp_user ?? "",
        smtp_pass: "",
        smtp_from: s.smtp_from ?? "",
        smtp_tls: s.smtp_tls ? "true" : "false",
      });
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

  const handleSettingsSave = async () => {
    try {
      setSettingsSaved(false);
      const updated = await updateSettings({
        ai_provider: settingsForm.ai_provider || undefined,
        ai_model: settingsForm.ai_model || undefined,
        ai_base_url: settingsForm.ai_base_url || undefined,
        ai_api_key: settingsForm.ai_api_key || undefined,
        verify_token: settingsForm.verify_token || undefined,
        meta_api_version: settingsForm.meta_api_version || undefined,
        meta_access_token: settingsForm.meta_access_token || undefined,
        meta_phone_number_id: settingsForm.meta_phone_number_id || undefined,
        meta_page_access_token: settingsForm.meta_page_access_token || undefined,
        telegram_bot_token: settingsForm.telegram_bot_token || undefined,
        crm_webhook_url: settingsForm.crm_webhook_url || undefined,
        sheets_webhook_url: settingsForm.sheets_webhook_url || undefined,
        database_url: settingsForm.database_url || undefined,
        smtp_host: settingsForm.smtp_host || undefined,
        smtp_port: settingsForm.smtp_port ? Number(settingsForm.smtp_port) : undefined,
        smtp_user: settingsForm.smtp_user || undefined,
        smtp_pass: settingsForm.smtp_pass || undefined,
        smtp_from: settingsForm.smtp_from || undefined,
        smtp_tls: settingsForm.smtp_tls ? settingsForm.smtp_tls === "true" : undefined,
      });
      setSettingsData(updated);
      setSettingsForm((prev) => ({
        ...prev,
        ai_api_key: "",
        verify_token: "",
        meta_access_token: "",
        meta_page_access_token: "",
        telegram_bot_token: "",
        smtp_pass: "",
      }));
      setSettingsSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update settings");
    }
  };

  const handleEmailReply = async () => {
    try {
      setError(null);
      const response = await sendEmailReply(emailForm.to, emailForm.subject, emailForm.message);
      setEmailReply(response.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email reply");
    }
  };

  const exportLeadsCsv = (rows: Lead[]) => {
    const headers = ["id", "name", "phone", "email", "platform", "intent", "created_at"];
    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.id,
          row.name ?? "",
          row.phone ?? "",
          row.email ?? "",
          row.platform,
          row.intent ?? "",
          row.created_at,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleLeadSelection = (id: number) => {
    setSelectedLeadIds((prev) => (prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]));
  };

  const scoreLead = (lead: Lead) => {
    let score = 0;
    if (lead.name) score += 25;
    if (lead.email) score += 25;
    if (lead.phone) score += 25;
    if (lead.intent) score += 25;
    return score;
  };

  const addConversationTag = (conversationId: number) => {
    const trimmed = tagDraft.trim();
    if (!trimmed) return;
    setConversationTags((prev) => {
      const existing = prev[conversationId] ?? [];
      if (existing.includes(trimmed)) return prev;
      return { ...prev, [conversationId]: [...existing, trimmed] };
    });
    setTagDraft("");
  };

  const channelEntries = analytics ? Object.entries(analytics.channels) : [];
  const userEntries = analytics ? Object.entries(analytics.users_by_platform) : [];
  const conversationEntries = analytics ? Object.entries(analytics.conversations_by_platform) : [];
  const globalQuery = globalSearch.trim().toLowerCase();
  const localQuery = searchTerm.trim().toLowerCase();
  const filteredConversations = conversations.filter((conv) => {
    const target = conv.user_external_id.toLowerCase();
    const matchesLocal = localQuery ? target.includes(localQuery) : true;
    const matchesGlobal = globalQuery ? target.includes(globalQuery) : true;
    return matchesLocal && matchesGlobal;
  });
  const filteredLeads = leads.filter((lead) => {
    const target = [lead.name, lead.email, lead.phone, lead.intent, lead.platform]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return globalQuery ? target.includes(globalQuery) : true;
  });
  const totalUsers = userEntries.reduce((sum, [, count]) => sum + count, 0);
  const totalConversations = conversationEntries.reduce((sum, [, count]) => sum + count, 0);
  const activityItems = [
    ...conversations.map((conv) => ({
      id: `conv-${conv.id}`,
      type: "conversation" as const,
      title: `Conversation with ${conv.user_external_id}`,
      subtitle: conv.platform,
      created_at: conv.created_at,
    })),
    ...leads.map((lead) => ({
      id: `lead-${lead.id}`,
      type: "lead" as const,
      title: lead.name ? `Lead captured: ${lead.name}` : "Lead captured",
      subtitle: lead.platform,
      created_at: lead.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <div className="w-full rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.65)]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            Admin Console
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-slate-400">Monitor conversations, leads, and channel performance in real time.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search across dashboard..."
              className="w-64 max-w-full px-4 py-2 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
            />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
            Alerts
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] text-slate-200">
              {error ? "1" : "0"}
            </span>
          </span>
          <button
            className="px-4 py-2 rounded-xl border border-slate-700/80 bg-slate-900/80 text-slate-100 font-semibold hover:border-slate-500 hover:text-white transition disabled:opacity-50"
            disabled={loading}
            onClick={load}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {activeSection === "dashboard" && (
        <div className="space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "today" as const, label: "Today" },
                { key: "7d" as const, label: "Last 7 days" },
                { key: "30d" as const, label: "Last 30 days" },
                { key: "custom" as const, label: "Custom" },
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => setTimeRange(range.key)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                    timeRange === range.key
                      ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                      : "border-slate-700/80 text-slate-300 bg-slate-900/70"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "View Conversations", section: "conversations" as const },
                { label: "Review Leads", section: "leads" as const },
                { label: "Update Settings", section: "settings" as const },
                { label: "Send Email", section: "email" as const },
              ].map((action) => (
                <button
                  key={action.section}
                  onClick={() => onQuickAction?.(action.section)}
                  className="px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/70 text-xs font-semibold text-slate-200 hover:border-slate-500 transition"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Total Messages", value: analytics?.total_messages ?? "0", accent: "from-emerald-500/15" },
              { label: "Total Conversations", value: analytics?.total_conversations ?? "0", accent: "from-sky-500/15" },
              { label: "Total Leads", value: analytics?.total_leads ?? "0", accent: "from-violet-500/15" },
              { label: "Last 24h", value: analytics?.last_24h ?? "0", accent: "from-amber-500/15" },
            ].map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border border-slate-800/80 bg-gradient-to-br ${card.accent} to-transparent p-4 shadow-lg`}
              >
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="text-3xl font-semibold mt-2">{loading ? "..." : card.value}</p>
                <p className="mt-2 text-xs text-slate-500">vs. previous period · —</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-lg">
              <h3 className="text-sm text-slate-300 mb-3">Conversion Funnel</h3>
              <div className="space-y-3">
                {[
                  { label: "Visitors", value: totalUsers, max: Math.max(totalUsers, analytics?.total_conversations ?? 0, analytics?.total_leads ?? 0) },
                  { label: "Conversations", value: analytics?.total_conversations ?? 0, max: Math.max(totalUsers, analytics?.total_conversations ?? 0, analytics?.total_leads ?? 0) },
                  { label: "Leads", value: analytics?.total_leads ?? 0, max: Math.max(totalUsers, analytics?.total_conversations ?? 0, analytics?.total_leads ?? 0) },
                ].map((step) => (
                  <div key={step.label}>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{step.label}</span>
                      <span>{loading ? "..." : step.value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-emerald-500/70"
                        style={{ width: `${step.max ? Math.min(100, (step.value / step.max) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-lg">
              <h3 className="text-sm text-slate-300 mb-3">System Health</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: "API Status",
                    value: error ? "Degraded" : loading ? "Checking" : "Healthy",
                  },
                  {
                    label: "Database",
                    value: settingsData?.database_url ? "Connected" : "Missing",
                  },
                  {
                    label: "Telegram Bot",
                    value: settingsData?.telegram_bot_token_set ? "Configured" : "Missing",
                  },
                  {
                    label: "Email SMTP",
                    value: settingsData?.smtp_configured ? "Configured" : "Missing",
                  },
                ].map((status) => (
                  <div key={status.label} className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{status.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">{status.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-lg">
            <h3 className="text-sm text-slate-300 mb-3">Recent Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {loading && <div className="text-sm text-slate-400">Loading…</div>}
              {!loading && activityItems.length === 0 && <div className="text-sm text-slate-400">No activity yet.</div>}
              {!loading &&
                activityItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="uppercase tracking-[0.12em]">{item.type}</span>
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.subtitle}</p>
                  </div>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-lg">
              <h3 className="text-sm text-slate-300 mb-3">Users by Platform</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {loading && <div className="text-sm text-slate-400">Loading…</div>}
                {!loading && userEntries.length === 0 && <div className="text-sm text-slate-400">No data</div>}
                {!loading &&
                  userEntries.map(([name, count]) => (
                    <div key={name} className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/70">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{name}</p>
                      <p className="text-2xl font-semibold">{count}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500/70"
                          style={{ width: `${totalUsers ? Math.min(100, (count / totalUsers) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-lg">
              <h3 className="text-sm text-slate-300 mb-3">Conversations by Platform</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {loading && <div className="text-sm text-slate-400">Loading…</div>}
                {!loading && conversationEntries.length === 0 && (
                  <div className="text-sm text-slate-400">No data</div>
                )}
                {!loading &&
                  conversationEntries.map(([name, count]) => (
                    <div key={name} className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/70">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{name}</p>
                      <p className="text-2xl font-semibold">{count}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                        <div
                          className="h-1.5 rounded-full bg-sky-500/70"
                          style={{
                            width: `${totalConversations ? Math.min(100, (count / totalConversations) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "channels" && (
        <div className="mt-6" id="channels">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Channels</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {loading && (
              <span className="px-3 py-1 rounded-full bg-slate-800/80 text-xs">Loading…</span>
            )}
            {!loading && channelEntries.length === 0 && (
              <span className="px-3 py-1 rounded-full bg-slate-800/80 text-xs">No data</span>
            )}
            {!loading &&
              channelEntries.map(([name, count]) => (
                <span
                  key={name}
                  className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200"
                >
                  {name} · {count}
                </span>
              ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-rose-200">
          {error}
        </div>
      )}

      {activeSection === "conversations" && (
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
                  className="px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                />
                <select
                  value={platformFilter}
                  onChange={(event) => {
                    setPage(1);
                    setPlatformFilter(event.target.value);
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                >
                  <option value="all">All Platforms</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="messenger">Messenger</option>
                  <option value="instagram">Instagram</option>
                  <option value="telegram">Telegram</option>
                  <option value="webchat">Web</option>
                </select>
              </div>

              {loading && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">Loading conversations...</div>
              )}
              {!loading && filteredConversations.length === 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">No conversations yet.</div>
              )}
              {!loading &&
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`text-left p-4 rounded-2xl border transition shadow-sm hover:shadow-lg ${
                      selectedConversation?.id === conv.id
                        ? "border-emerald-500/80 bg-emerald-500/10"
                        : "border-slate-800/80 bg-slate-950/70 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                        {conv.platform}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs font-semibold">
                        Neutral
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
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 min-h-[220px]">
                <h4 className="text-sm font-semibold mb-3">Conversation Detail</h4>
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <button
                    onClick={() => setTakeoverEnabled((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-full border font-semibold transition ${
                      takeoverEnabled
                        ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                        : "border-slate-700/80 text-slate-300 bg-slate-900/70"
                    }`}
                  >
                    {takeoverEnabled ? "Agent takeover: ON" : "Agent takeover: OFF"}
                  </button>
                  <span className="text-slate-500">Live preview enabled</span>
                </div>
                {!selectedConversation && <p className="text-sm text-slate-400">Select a conversation to view messages.</p>}
                {selectedConversation && (
                  <div className="space-y-3">
                    {conversationMessages.length === 0 && (
                      <p className="text-sm text-slate-400">No messages yet.</p>
                    )}
                    {conversationMessages.map((msg) => (
                      <div key={msg.id} className="flex flex-col gap-1 text-sm rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
                        <span className="text-slate-400">
                          {msg.sender} · {new Date(msg.created_at).toLocaleString()}
                        </span>
                        <span className="text-slate-100">{msg.content}</span>
                      </div>
                    ))}
                    <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Tags</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(selectedConversation && conversationTags[selectedConversation.id] ? conversationTags[selectedConversation.id] : []).map(
                          (tag) => (
                            <span key={tag} className="px-2 py-1 rounded-full bg-slate-800/80 text-slate-200 text-xs">
                              {tag}
                            </span>
                          )
                        )}
                        {(!selectedConversation || (conversationTags[selectedConversation.id] ?? []).length === 0) && (
                          <span className="text-xs text-slate-500">No tags yet.</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          value={tagDraft}
                          onChange={(event) => setTagDraft(event.target.value)}
                          className="flex-1 min-w-[160px] rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-100"
                          placeholder="Add a tag"
                        />
                        <button
                          onClick={() => selectedConversation && addConversationTag(selectedConversation.id)}
                          className="px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/70 text-xs font-semibold text-slate-200"
                        >
                          Add Tag
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Quick Replies</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          "Thanks for reaching out! How can we help today?",
                          "Could you share your email so we can follow up?",
                          "Here are the next steps to get started.",
                        ].map((template) => (
                          <button
                            key={template}
                            onClick={() => setReplyDraft(template)}
                            className="px-3 py-1.5 rounded-full border border-slate-700/80 bg-slate-950/70 text-xs text-slate-200"
                          >
                            {template.slice(0, 28)}...
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={replyDraft}
                        onChange={(event) => setReplyDraft(event.target.value)}
                        className="mt-3 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 min-h-[90px]"
                        placeholder="Draft a reply..."
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(replyDraft)}
                          className="px-3 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-xs font-semibold text-emerald-200"
                        >
                          Copy Reply
                        </button>
                        <span className="text-xs text-slate-500">Paste into your chat tool to send.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "leads" && (
        <div className="mt-8" id="leads">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Recent Leads</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => exportLeadsCsv(filteredLeads)}
                className="px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/70 text-xs font-semibold text-slate-200"
              >
                Export CSV
              </button>
              <button
                onClick={() => exportLeadsCsv(filteredLeads.filter((lead) => selectedLeadIds.includes(lead.id)))}
                className="px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/70 text-xs font-semibold text-slate-200 disabled:opacity-50"
                disabled={selectedLeadIds.length === 0}
              >
                Export Selected
              </button>
              <button
                className="px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/70 text-xs font-semibold text-slate-500"
                disabled
              >
                Bulk Assign
              </button>
              <button
                className="px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/70 text-xs font-semibold text-slate-500"
                disabled
              >
                Bulk Tag
              </button>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[
              { label: "New", count: filteredLeads.filter((lead) => scoreLead(lead) < 50).length },
              { label: "Contacted", count: filteredLeads.filter((lead) => scoreLead(lead) >= 50 && scoreLead(lead) < 75).length },
              { label: "Qualified", count: filteredLeads.filter((lead) => scoreLead(lead) >= 75).length },
            ].map((stage) => (
              <div key={stage.label} className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{stage.label}</p>
                <p className="mt-2 text-2xl font-semibold">{loading ? "..." : stage.count}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {loading && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">Loading leads...</div>
            )}
            {!loading && filteredLeads.length === 0 && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">No leads yet.</div>
            )}
            {!loading &&
              filteredLeads.map((lead) => (
                <div key={lead.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.includes(lead.id)}
                      onChange={() => toggleLeadSelection(lead.id)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                    />
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                      {lead.platform}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-slate-800/80 text-slate-200 text-xs font-semibold">
                      Score: {scoreLead(lead)}
                    </span>
                    <span>{new Date(lead.created_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500/70"
                      style={{ width: `${scoreLead(lead)}%` }}
                    />
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
      )}

      {activeSection === "settings" && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Settings</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-6">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${
                    settingsSection === "ai"
                      ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                      : "border-slate-700/80 text-slate-200 bg-slate-900/70"
                  }`}
                  onClick={() => setSettingsSection((prev) => (prev === "ai" ? null : "ai"))}
                >
                  AI Provider
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${
                    settingsSection === "messaging"
                      ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                      : "border-slate-700/80 text-slate-200 bg-slate-900/70"
                  }`}
                  onClick={() => setSettingsSection((prev) => (prev === "messaging" ? null : "messaging"))}
                >
                  Messaging Platforms
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${
                    settingsSection === "crm"
                      ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                      : "border-slate-700/80 text-slate-200 bg-slate-900/70"
                  }`}
                  onClick={() => setSettingsSection((prev) => (prev === "crm" ? null : "crm"))}
                >
                  CRM & Sheets
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${
                    settingsSection === "database"
                      ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                      : "border-slate-700/80 text-slate-200 bg-slate-900/70"
                  }`}
                  onClick={() => setSettingsSection((prev) => (prev === "database" ? null : "database"))}
                >
                  Database
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${
                    settingsSection === "smtp"
                      ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                      : "border-slate-700/80 text-slate-200 bg-slate-900/70"
                  }`}
                  onClick={() => setSettingsSection((prev) => (prev === "smtp" ? null : "smtp"))}
                >
                  SMTP Email
                </button>
              </div>

              {settingsSection === "ai" && (
                <div className="border border-slate-800/80 rounded-2xl p-4 space-y-4 bg-slate-900/40">
                  <h4 className="text-sm font-semibold text-slate-300">AI Provider</h4>
                  <div>
                    <label className="text-sm text-slate-400">AI Provider</label>
                    <input
                      value={settingsForm.ai_provider}
                      onChange={(event) => setSettingsForm({ ...settingsForm, ai_provider: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="openai | groq"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">AI Model</label>
                    <input
                      value={settingsForm.ai_model}
                      onChange={(event) => setSettingsForm({ ...settingsForm, ai_model: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="gpt-4o-mini | llama3-8b-8192"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">AI Base URL</label>
                    <input
                      value={settingsForm.ai_base_url}
                      onChange={(event) => setSettingsForm({ ...settingsForm, ai_base_url: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="https://api.groq.com/openai/v1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">AI API Key</label>
                    <input
                      value={settingsForm.ai_api_key}
                      onChange={(event) => setSettingsForm({ ...settingsForm, ai_api_key: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder={settingsData?.has_ai_api_key ? "Configured" : "Enter API key"}
                    />
                  </div>
                </div>
              )}

              {settingsSection === "messaging" && (
                <div className="border border-slate-800/80 rounded-2xl p-4 space-y-4 bg-slate-900/40">
                  <h4 className="text-sm font-semibold text-slate-300">Messaging Platforms</h4>
                  <div>
                    <label className="text-sm text-slate-400">Verify Token</label>
                    <input
                      value={settingsForm.verify_token}
                      onChange={(event) => setSettingsForm({ ...settingsForm, verify_token: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder={settingsData?.verify_token_set ? "Configured" : "Enter verify token"}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Meta API Version</label>
                    <input
                      value={settingsForm.meta_api_version}
                      onChange={(event) => setSettingsForm({ ...settingsForm, meta_api_version: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="v19.0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Meta Access Token</label>
                    <input
                      value={settingsForm.meta_access_token}
                      onChange={(event) => setSettingsForm({ ...settingsForm, meta_access_token: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder={settingsData?.meta_access_token_set ? "Configured" : "Enter Meta access token"}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Meta Page Access Token</label>
                    <input
                      value={settingsForm.meta_page_access_token}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, meta_page_access_token: event.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder={settingsData?.meta_page_access_token_set ? "Configured" : "Enter page access token"}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Meta Phone Number ID</label>
                    <input
                      value={settingsForm.meta_phone_number_id}
                      onChange={(event) => setSettingsForm({ ...settingsForm, meta_phone_number_id: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="Enter phone number ID"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Telegram Bot Token</label>
                    <input
                      value={settingsForm.telegram_bot_token}
                      onChange={(event) => setSettingsForm({ ...settingsForm, telegram_bot_token: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder={settingsData?.telegram_bot_token_set ? "Configured" : "Enter Telegram bot token"}
                    />
                  </div>
                </div>
              )}

              {settingsSection === "crm" && (
                <div className="border border-slate-800/80 rounded-2xl p-4 space-y-4 bg-slate-900/40">
                  <h4 className="text-sm font-semibold text-slate-300">CRM & Sheets</h4>
                  <div>
                    <label className="text-sm text-slate-400">CRM Webhook URL</label>
                    <input
                      value={settingsForm.crm_webhook_url}
                      onChange={(event) => setSettingsForm({ ...settingsForm, crm_webhook_url: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="https://your-crm-webhook"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Sheets Webhook URL</label>
                    <input
                      value={settingsForm.sheets_webhook_url}
                      onChange={(event) => setSettingsForm({ ...settingsForm, sheets_webhook_url: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="https://your-sheets-webhook"
                    />
                  </div>
                </div>
              )}

              {settingsSection === "database" && (
                <div className="border border-slate-800/80 rounded-2xl p-4 space-y-4 bg-slate-900/40">
                  <h4 className="text-sm font-semibold text-slate-300">Database</h4>
                  <div>
                    <label className="text-sm text-slate-400">Database URL</label>
                    <input
                      value={settingsForm.database_url}
                      onChange={(event) => setSettingsForm({ ...settingsForm, database_url: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="postgresql+asyncpg://user:pass@host:5432/db"
                    />
                  </div>
                </div>
              )}

              {settingsSection === "smtp" && (
                <div className="border border-slate-800/80 rounded-2xl p-4 space-y-4 bg-slate-900/40">
                  <h4 className="text-sm font-semibold text-slate-300">SMTP Email</h4>
                  <div>
                    <label className="text-sm text-slate-400">SMTP Host</label>
                    <input
                      value={settingsForm.smtp_host}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_host: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">SMTP Port</label>
                    <input
                      value={settingsForm.smtp_port}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_port: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">SMTP User</label>
                    <input
                      value={settingsForm.smtp_user}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_user: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">SMTP Password</label>
                    <input
                      value={settingsForm.smtp_pass}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_pass: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="App password"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">SMTP From</label>
                    <input
                      value={settingsForm.smtp_from}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_from: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                      placeholder="Support <support@example.com>"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">SMTP TLS</label>
                    <select
                      value={settingsForm.smtp_tls}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_tls: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </div>
                </div>
              )}

              {settingsSection && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSettingsSave}
                    className="px-4 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-200 font-semibold hover:bg-emerald-500/20 transition"
                  >
                    Save Settings
                  </button>
                  {settingsSaved && <p className="text-sm text-emerald-300">Settings updated.</p>}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 text-sm">
              <p className="text-slate-300 font-semibold">Current Status</p>
              <p>AI Key: {settingsData?.has_ai_api_key ? "Configured" : "Missing"}</p>
              <p>Verify Token: {settingsData?.verify_token_set ? "Configured" : "Missing"}</p>
              <p>Meta Access Token: {settingsData?.meta_access_token_set ? "Configured" : "Missing"}</p>
              <p>Page Access Token: {settingsData?.meta_page_access_token_set ? "Configured" : "Missing"}</p>
              <p>Telegram Token: {settingsData?.telegram_bot_token_set ? "Configured" : "Missing"}</p>
              <p>CRM Webhook: {settingsData?.crm_webhook_url ? "Configured" : "Missing"}</p>
              <p>Sheets Webhook: {settingsData?.sheets_webhook_url ? "Configured" : "Missing"}</p>
              <p>SMTP: {settingsData?.smtp_configured ? "Configured" : "Missing"}</p>
            </div>
          </div>
        </div>
      )}

      {activeSection === "email" && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Email Reply</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
              <div>
                <label className="text-sm text-slate-400">To</label>
                <input
                  value={emailForm.to}
                  onChange={(event) => setEmailForm({ ...emailForm, to: event.target.value })}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Subject</label>
                <input
                  value={emailForm.subject}
                  onChange={(event) => setEmailForm({ ...emailForm, subject: event.target.value })}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100"
                  placeholder="Re: Your request"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Incoming Email</label>
                <textarea
                  value={emailForm.message}
                  onChange={(event) => setEmailForm({ ...emailForm, message: event.target.value })}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100 min-h-[140px]"
                  placeholder="Paste the customer email here..."
                />
              </div>
              <button
                onClick={handleEmailReply}
                className="px-4 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-200 font-semibold hover:bg-emerald-500/20 transition"
              >
                Generate & Send Reply
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 text-sm">
              <p className="text-slate-300 font-semibold">AI Reply Preview</p>
              <p className="text-slate-100 whitespace-pre-wrap">{emailReply || "No reply generated yet."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
