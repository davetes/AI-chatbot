"use client";

import { useEffect, useState } from "react";
import {
  analyzeIntelligence,
  broadcastCampaign,
  createFlow,
  deleteKnowledgeBase,
  deleteFlow,
  exportReport,
  getAdvancedAnalytics,
  getAnalytics,
  getBotConfig,
  getConversationMessages,
  getConversations,
  getFlows,
  getKnowledgeBase,
  getLeads,
  getSettings,
  getWorkflows,
  recoveryCampaign,
  runABTest,
  searchKnowledgeBase,
  sendAgentReply,
  sendEmailReply,
  setConversationHandoff,
  simulateConversation,
  updateBotConfig,
  updateSettings,
  updateWorkflows,
  uploadKnowledgeBase,
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
  handoff_enabled: boolean;
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

type AdminSection =
  | "dashboard"
  | "conversations"
  | "leads"
  | "channels"
  | "settings"
  | "email"
  | "knowledge"
  | "bot"
  | "workflows"
  | "intelligence"
  | "campaigns"
  | "reports"
  | "testing";

const SECTION_META: Record<AdminSection, { title: string; description: string }> = {
  dashboard: { title: "Dashboard", description: "Monitor conversations, leads, and channel performance in real time." },
  conversations: { title: "Conversations", description: "View, manage, and reply to customer conversations across all channels." },
  leads: { title: "Leads", description: "Track captured leads, score them, and export data for your CRM." },
  channels: { title: "Channels", description: "See which messaging platforms are connected and active." },
  settings: { title: "Settings", description: "Configure AI providers, messaging platforms, CRM webhooks, and email." },
  email: { title: "Email", description: "Generate AI-powered email replies to customer inquiries." },
  knowledge: { title: "Knowledge Base", description: "Upload documents and search your AI knowledge base." },
  bot: { title: "Bot Builder", description: "Configure bot personality, manage flows, and customize behavior." },
  workflows: { title: "Workflows", description: "Create keyword-triggered automation rules for your chatbot." },
  intelligence: { title: "Intelligence", description: "Analyze messages for intent, entities, and sentiment insights." },
  campaigns: { title: "Campaigns", description: "Broadcast messages and run abandoned-conversation recovery campaigns." },
  reports: { title: "Reports", description: "Export leads and message data as CSV reports." },
  testing: { title: "Testing", description: "Simulate conversations and A/B test prompt variations." },
};

const INPUT_CLASS = "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all";
const BTN_PRIMARY = "px-4 py-2.5 rounded-xl border border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 text-sm font-semibold hover:bg-emerald-500/20 active:scale-[0.98] transition-all";
const BTN_SECONDARY = "px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white active:scale-[0.98] transition-all";
const CARD_CLASS = "rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/70 p-5 shadow-sm dark:shadow-lg";

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
  const [replyDraft, setReplyDraft] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [conversationTags, setConversationTags] = useState<Record<number, string[]>>({});
  const [tagDraft, setTagDraft] = useState("");
  const [emailForm, setEmailForm] = useState({ to: "", subject: "", message: "" });
  const [emailReply, setEmailReply] = useState("");
  const [advancedAnalytics, setAdvancedAnalytics] = useState<Awaited<ReturnType<typeof getAdvancedAnalytics>> | null>(
    null
  );
  const [knowledgeBase, setKnowledgeBase] = useState<Array<{ id: string; filename: string; chunks: number }>>([]);
  const [kbResults, setKbResults] = useState<string[]>([]);
  const [kbQuery, setKbQuery] = useState("");
  const [botConfig, setBotConfig] = useState<{ persona: string; tone: string; system_prompt: string | null } | null>(
    null
  );
  const [botForm, setBotForm] = useState({ persona: "", tone: "", system_prompt: "" });
  const [workflowRules, setWorkflowRules] = useState<
    Array<{ id: string; name: string; keywords: string[]; action: string }>
  >([]);
  const [workflowDraft, setWorkflowDraft] = useState({ name: "", keywords: "", action: "auto_reply:" });
  const [campaignForm, setCampaignForm] = useState({ platform: "telegram", message: "" });
  const [recoveryForm, setRecoveryForm] = useState({
    platform: "",
    hours_inactive: 24,
    message: "We noticed you stopped chatting. Can we help?",
  });
  const [intelligenceInput, setIntelligenceInput] = useState("");
  const [intelligenceResult, setIntelligenceResult] = useState<
    | {
      intent: string;
      confidence: number;
      entities: Record<string, string[]>;
      summary: string;
      suggested_responses: string[];
    }
    | null
  >(null);
  const [flows, setFlows] = useState<
    Array<{ id: string; name: string; nodes: Array<{ id: string; type: string; label: string; next?: string }> }>
  >([]);
  const [flowDraft, setFlowDraft] = useState({ name: "", nodesJson: "[]" });
  const [simulatorPrompt, setSimulatorPrompt] = useState("");
  const [simulatorTurns, setSimulatorTurns] = useState(3);
  const [simulatorTranscript, setSimulatorTranscript] = useState<Array<{ role: string; content: string }>>([]);
  const [abPromptA, setAbPromptA] = useState("");
  const [abPromptB, setAbPromptB] = useState("");
  const [abMessage, setAbMessage] = useState("");
  const [abResult, setAbResult] = useState<{ response_a: string; response_b: string } | null>(null);
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
      const [a, c, l, s, adv, kb, bot, workflows, flowsData] = await Promise.all([
        getAnalytics(),
        getConversations(limit, offset, platform),
        getLeads(),
        getSettings(),
        getAdvancedAnalytics(),
        getKnowledgeBase(),
        getBotConfig(),
        getWorkflows(),
        getFlows(),
      ]);
      setAnalytics(a);
      setConversations(c);
      setLeads(l);
      setSettingsData(s);
      setAdvancedAnalytics(adv);
      setKnowledgeBase(kb);
      setBotConfig(bot);
      setBotForm({ persona: bot.persona, tone: bot.tone, system_prompt: bot.system_prompt ?? "" });
      setWorkflowRules(workflows);
      setFlows(flowsData);
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

  const handleUploadKb = async (file: File) => {
    const uploaded = await uploadKnowledgeBase(file);
    setKnowledgeBase((prev) => [...prev, uploaded]);
  };

  const handleSearchKb = async () => {
    if (!kbQuery.trim()) return;
    const result = await searchKnowledgeBase(kbQuery.trim());
    setKbResults(result.results);
  };

  const handleDeleteKb = async (docId: string) => {
    await deleteKnowledgeBase(docId);
    setKnowledgeBase((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const handleBotConfigSave = async () => {
    const updated = await updateBotConfig({
      persona: botForm.persona || undefined,
      tone: botForm.tone || undefined,
      system_prompt: botForm.system_prompt || undefined,
    });
    setBotConfig(updated);
  };

  const handleAddWorkflow = () => {
    const keywords = workflowDraft.keywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!workflowDraft.name || keywords.length === 0) return;
    setWorkflowRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: workflowDraft.name, keywords, action: workflowDraft.action },
    ]);
    setWorkflowDraft({ name: "", keywords: "", action: "auto_reply:" });
  };

  const handleSaveWorkflows = async () => {
    const updated = await updateWorkflows(workflowRules);
    setWorkflowRules(updated);
  };

  const handleExportReport = async (type: "leads" | "messages") => {
    const blob = await exportReport(type);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSimulate = async () => {
    const result = await simulateConversation(simulatorPrompt, simulatorTurns);
    setSimulatorTranscript(result.transcript);
  };

  const handleAbTest = async () => {
    const result = await runABTest(abPromptA, abPromptB, abMessage);
    setAbResult(result);
  };

  const handleAnalyzeIntelligence = async () => {
    if (!intelligenceInput.trim()) return;
    const result = await analyzeIntelligence(intelligenceInput.trim());
    setIntelligenceResult(result);
  };

  const handleBroadcast = async () => {
    if (!campaignForm.message.trim()) return;
    await broadcastCampaign(campaignForm.platform, campaignForm.message.trim());
    setCampaignForm((prev) => ({ ...prev, message: "" }));
  };

  const handleRecovery = async () => {
    if (!recoveryForm.message.trim()) return;
    await recoveryCampaign({
      platform: recoveryForm.platform || undefined,
      hours_inactive: recoveryForm.hours_inactive,
      message: recoveryForm.message.trim(),
    });
  };

  const handleCreateFlow = async () => {
    try {
      const nodes = JSON.parse(flowDraft.nodesJson) as Array<{ id: string; type: string; label: string; next?: string }>;
      const flow = await createFlow({ name: flowDraft.name || "Untitled flow", nodes });
      setFlows((prev) => [...prev, flow]);
      setFlowDraft({ name: "", nodesJson: "[]" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid flow JSON");
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    await deleteFlow(flowId);
    setFlows((prev) => prev.filter((flow) => flow.id !== flowId));
  };

  const handleToggleHandoff = async (conversation: Conversation) => {
    const updated = await setConversationHandoff(conversation.id, !conversation.handoff_enabled);
    setConversations((prev) =>
      prev.map((item) => (item.id === conversation.id ? { ...item, handoff_enabled: updated.handoff_enabled } : item))
    );
  };

  const handleAgentReply = async () => {
    if (!selectedConversation || !replyDraft.trim()) return;
    await sendAgentReply(selectedConversation.id, replyDraft.trim());
    setReplyDraft("");
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

  const meta = SECTION_META[activeSection];

  return (
    <div className="w-full space-y-8">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/50">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{meta.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search…"
              className="w-56 max-w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
            />
          </div>
          {error && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              Error
            </span>
          )}
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:opacity-50 transition-all"
            disabled={loading}
            onClick={load}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {activeSection === "dashboard" && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { 
                label: "Total Messages", 
                value: analytics?.total_messages ?? 0, 
                icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                color: "emerald",
                trend: "+12%"
              },
              {
                label: "Conversations",
                value: analytics?.total_conversations ?? 0,
                icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
                color: "blue",
                onClick: () => onQuickAction?.("conversations"),
                trend: "+8%"
              },
              { 
                label: "Total Leads", 
                value: analytics?.total_leads ?? 0, 
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                color: "violet",
                trend: "+24%"
              },
              { 
                label: "Last 24 Hours", 
                value: analytics?.last_24h ?? 0, 
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                color: "amber",
                trend: "+5%"
              },
            ].map((card) => {
              const colorMap: Record<string, { bg: string; icon: string; border: string; trend: string }> = {
                emerald: { bg: "bg-emerald-500/10", icon: "bg-emerald-500/20 text-emerald-400", border: "border-emerald-500/20", trend: "text-emerald-400" },
                blue: { bg: "bg-blue-500/10", icon: "bg-blue-500/20 text-blue-400", border: "border-blue-500/20", trend: "text-blue-400" },
                violet: { bg: "bg-violet-500/10", icon: "bg-violet-500/20 text-violet-400", border: "border-violet-500/20", trend: "text-violet-400" },
                amber: { bg: "bg-amber-500/10", icon: "bg-amber-500/20 text-amber-400", border: "border-amber-500/20", trend: "text-amber-400" },
              };
              const colorClasses = colorMap[card.color] || colorMap.emerald;
              
              return card.onClick ? (
                <button
                  key={card.label}
                  onClick={card.onClick}
                  className={`relative overflow-hidden rounded-2xl border ${colorClasses.border} ${colorClasses.bg} p-5 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer text-left`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">{card.label}</p>
                      <p className="mt-2 text-3xl font-bold text-white">{loading ? "..." : card.value.toLocaleString()}</p>
                      <p className={`mt-1 text-xs font-medium ${colorClasses.trend}`}>{card.trend} from last week</p>
                    </div>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${colorClasses.icon}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                      </svg>
                    </div>
                  </div>
                </button>
              ) : (
                <div
                  key={card.label}
                  className={`relative overflow-hidden rounded-2xl border ${colorClasses.border} ${colorClasses.bg} p-5 transition-all hover:scale-[1.02] hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">{card.label}</p>
                      <p className="mt-2 text-3xl font-bold text-white">{loading ? "..." : card.value.toLocaleString()}</p>
                      <p className={`mt-1 text-xs font-medium ${colorClasses.trend}`}>{card.trend} from last week</p>
                    </div>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${colorClasses.icon}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Quick Actions:</span>
            {[
              { label: "View Conversations", section: "conversations" as const, icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
              { label: "Review Leads", section: "leads" as const, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { label: "Settings", section: "settings" as const, icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
            ].map((action) => (
              <button
                key={action.section}
                onClick={() => onQuickAction?.(action.section)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-600 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                </svg>
                {action.label}
              </button>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="xl:col-span-2 rounded-2xl border border-slate-800/50 bg-slate-900/50 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <button className="text-sm text-emerald-400 hover:text-emerald-300 transition">View All</button>
              </div>
              <div className="space-y-4">
                {loading && <div className="text-sm text-slate-500">Loading…</div>}
                {!loading && activityItems.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-slate-500">No activity yet</p>
                    <p className="text-sm text-slate-600 mt-1">Start a conversation to see activity here</p>
                  </div>
                )}
                {!loading &&
                  activityItems.map((item, index) => (
                    <div key={item.id} className={`flex items-start gap-4 ${index !== activityItems.length - 1 ? 'pb-4 border-b border-slate-800/50' : ''}`}>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'conversation' ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.type === 'conversation' ? "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" : "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                      </div>
                      <span className="text-xs text-slate-600 whitespace-nowrap">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* System Status */}
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-5">System Status</h3>
              <div className="space-y-4">
                {[
                  { label: "API Status", value: error ? "Degraded" : loading ? "Checking" : "Healthy", status: error ? "error" : "success" },
                  { label: "Database", value: settingsData?.database_url ? "Connected" : "Not Configured", status: settingsData?.database_url ? "success" : "warning" },
                  { label: "Telegram Bot", value: settingsData?.telegram_bot_token_set ? "Active" : "Not Configured", status: settingsData?.telegram_bot_token_set ? "success" : "warning" },
                  { label: "Email SMTP", value: settingsData?.smtp_configured ? "Active" : "Not Configured", status: settingsData?.smtp_configured ? "success" : "warning" },
                ].map((item) => {
                  const statusColors = {
                    success: "bg-emerald-500",
                    warning: "bg-amber-500",
                    error: "bg-rose-500",
                  }[item.status];
                  return (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${statusColors}`} />
                        <span className="text-sm text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-400">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-5">Users by Platform</h3>
              {loading && <div className="text-sm text-slate-500">Loading…</div>}
              {!loading && userEntries.length === 0 && <div className="text-sm text-slate-500">No data available</div>}
              {!loading && userEntries.length > 0 && (
                <div className="space-y-4">
                  {userEntries.map(([name, count]) => (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300 capitalize">{name}</span>
                        <span className="text-sm font-bold text-white">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${totalUsers ? Math.min(100, (count / totalUsers) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs">Loading…</span>
            )}
            {!loading && channelEntries.length === 0 && (
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs">No data</span>
            )}
            {!loading &&
              channelEntries.map(([name, count]) => (
                <span
                  key={name}
                  className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200"
                >
                  {name} · {count}
                </span>
              ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <p className="flex-1 text-sm text-rose-200">{error}</p>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {activeSection === "conversations" && (
        <div id="conversations">
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
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                />
                <select
                  value={platformFilter}
                  onChange={(event) => {
                    setPage(1);
                    setPlatformFilter(event.target.value);
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
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
                    className={`text-left p-4 rounded-2xl border transition shadow-sm hover:shadow-lg ${selectedConversation?.id === conv.id
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
                    onClick={() => selectedConversation && handleToggleHandoff(selectedConversation)}
                    className={`px-3 py-1.5 rounded-full border font-semibold transition ${selectedConversation?.handoff_enabled
                      ? "border-emerald-400 text-emerald-700 dark:text-emerald-200 bg-emerald-500/10"
                      : "border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/70"
                      }`}
                  >
                    {selectedConversation?.handoff_enabled ? "Agent takeover: ON" : "Agent takeover: OFF"}
                  </button>
                  <span className="text-slate-500">Live preview enabled</span>
                </div>
                {!selectedConversation && <p className="text-sm text-slate-500 dark:text-slate-400">Select a conversation to view messages.</p>}
                {selectedConversation && (
                  <div className="space-y-3">
                    {conversationMessages.length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet.</p>
                    )}
                    {conversationMessages.map((msg) => (
                      <div key={msg.id} className="flex flex-col gap-1 text-sm rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
                        <span className="text-slate-500 dark:text-slate-400">
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
                            <span key={tag} className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs">
                              {tag}
                            </span>
                          )
                        )}
                        {(!selectedConversation || (conversationTags[selectedConversation.id] ?? []).length === 0) && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">No tags yet.</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          value={tagDraft}
                          onChange={(event) => setTagDraft(event.target.value)}
                          className="flex-1 min-w-[160px] rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-xs text-slate-100"
                          placeholder="Add a tag"
                        />
                        <button
                          onClick={() => selectedConversation && addConversationTag(selectedConversation.id)}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-xs font-semibold text-slate-200"
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
                        className="mt-3 w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-100 min-h-[90px]"
                        placeholder="Draft a reply..."
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={async () => {
                            if (!selectedConversation || !replyDraft.trim()) return;
                            await sendAgentReply(selectedConversation.id, replyDraft.trim());
                            setReplyDraft("");
                          }}
                          className="px-3 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-xs font-semibold text-emerald-200"
                        >
                          Send Reply
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(replyDraft)}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-xs font-semibold text-slate-200"
                        >
                          Copy Reply
                        </button>
                        <span className="text-xs text-slate-400 dark:text-slate-500">Paste into your chat tool to send.</span>
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
        <div id="leads">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Recent Leads</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => exportLeadsCsv(filteredLeads)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-xs font-semibold text-slate-200"
              >
                Export CSV
              </button>
              <button
                onClick={() => exportLeadsCsv(filteredLeads.filter((lead) => selectedLeadIds.includes(lead.id)))}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-xs font-semibold text-slate-200 disabled:opacity-50"
                disabled={selectedLeadIds.length === 0}
              >
                Export Selected
              </button>
              <button
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-xs font-semibold text-slate-500"
                disabled
              >
                Bulk Assign
              </button>
              <button
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-xs font-semibold text-slate-500"
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
                    <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                      Score: {scoreLead(lead)}
                    </span>
                    <span>{new Date(lead.created_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
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
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Settings</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-6">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${settingsSection === "ai"
                    ? "border-emerald-400 text-emerald-700 dark:text-emerald-200 bg-emerald-500/10"
                    : "border-slate-700/80 text-slate-200 bg-slate-900/70"
                    }`}
                  onClick={() => setSettingsSection((prev) => (prev === "ai" ? null : "ai"))}
                >
                  AI Provider
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${settingsSection === "messaging"
                    ? "border-emerald-400 text-emerald-700 dark:text-emerald-200 bg-emerald-500/10"
                    : "border-slate-700/80 text-slate-200 bg-slate-900/70"
                    }`}
                  onClick={() => setSettingsSection((prev) => (prev === "messaging" ? null : "messaging"))}
                >
                  Messaging Platforms
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${settingsSection === "crm"
                    ? "border-emerald-400 text-emerald-700 dark:text-emerald-200 bg-emerald-500/10"
                    : "border-slate-700/80 text-slate-200 bg-slate-900/70"
                    }`}
                  onClick={() => setSettingsSection((prev) => (prev === "crm" ? null : "crm"))}
                >
                  CRM & Sheets
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${settingsSection === "database"
                    ? "border-emerald-400 text-emerald-700 dark:text-emerald-200 bg-emerald-500/10"
                    : "border-slate-700/80 text-slate-200 bg-slate-900/70"
                    }`}
                  onClick={() => setSettingsSection((prev) => (prev === "database" ? null : "database"))}
                >
                  Database
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${settingsSection === "smtp"
                    ? "border-emerald-400 text-emerald-700 dark:text-emerald-200 bg-emerald-500/10"
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
                    <label className="text-sm text-slate-500 dark:text-slate-400">AI Provider</label>
                    <input
                      value={settingsForm.ai_provider}
                      onChange={(event) => setSettingsForm({ ...settingsForm, ai_provider: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="openai | groq"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">AI Model</label>
                    <input
                      value={settingsForm.ai_model}
                      onChange={(event) => setSettingsForm({ ...settingsForm, ai_model: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="gpt-4o-mini | llama3-8b-8192"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">AI Base URL</label>
                    <input
                      value={settingsForm.ai_base_url}
                      onChange={(event) => setSettingsForm({ ...settingsForm, ai_base_url: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="https://api.groq.com/openai/v1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">AI API Key</label>
                    <input
                      value={settingsForm.ai_api_key}
                      onChange={(event) => setSettingsForm({ ...settingsForm, ai_api_key: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder={settingsData?.has_ai_api_key ? "Configured" : "Enter API key"}
                    />
                  </div>
                </div>
              )}

              {settingsSection === "messaging" && (
                <div className="border border-slate-800/80 rounded-2xl p-4 space-y-4 bg-slate-900/40">
                  <h4 className="text-sm font-semibold text-slate-300">Messaging Platforms</h4>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Verify Token</label>
                    <input
                      value={settingsForm.verify_token}
                      onChange={(event) => setSettingsForm({ ...settingsForm, verify_token: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder={settingsData?.verify_token_set ? "Configured" : "Enter verify token"}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Meta API Version</label>
                    <input
                      value={settingsForm.meta_api_version}
                      onChange={(event) => setSettingsForm({ ...settingsForm, meta_api_version: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="v19.0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Meta Access Token</label>
                    <input
                      value={settingsForm.meta_access_token}
                      onChange={(event) => setSettingsForm({ ...settingsForm, meta_access_token: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder={settingsData?.meta_access_token_set ? "Configured" : "Enter Meta access token"}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Meta Page Access Token</label>
                    <input
                      value={settingsForm.meta_page_access_token}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, meta_page_access_token: event.target.value })
                      }
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder={settingsData?.meta_page_access_token_set ? "Configured" : "Enter page access token"}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Meta Phone Number ID</label>
                    <input
                      value={settingsForm.meta_phone_number_id}
                      onChange={(event) => setSettingsForm({ ...settingsForm, meta_phone_number_id: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="Enter phone number ID"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Telegram Bot Token</label>
                    <input
                      value={settingsForm.telegram_bot_token}
                      onChange={(event) => setSettingsForm({ ...settingsForm, telegram_bot_token: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder={settingsData?.telegram_bot_token_set ? "Configured" : "Enter Telegram bot token"}
                    />
                  </div>
                </div>
              )}

              {settingsSection === "crm" && (
                <div className="border border-slate-800/80 rounded-2xl p-4 space-y-4 bg-slate-900/40">
                  <h4 className="text-sm font-semibold text-slate-300">CRM & Sheets</h4>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">CRM Webhook URL</label>
                    <input
                      value={settingsForm.crm_webhook_url}
                      onChange={(event) => setSettingsForm({ ...settingsForm, crm_webhook_url: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="https://your-crm-webhook"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Sheets Webhook URL</label>
                    <input
                      value={settingsForm.sheets_webhook_url}
                      onChange={(event) => setSettingsForm({ ...settingsForm, sheets_webhook_url: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="https://your-sheets-webhook"
                    />
                  </div>
                </div>
              )}

              {settingsSection === "database" && (
                <div className="border border-slate-800/80 rounded-2xl p-4 space-y-4 bg-slate-900/40">
                  <h4 className="text-sm font-semibold text-slate-300">Database</h4>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Database URL</label>
                    <input
                      value={settingsForm.database_url}
                      onChange={(event) => setSettingsForm({ ...settingsForm, database_url: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="postgresql+asyncpg://user:pass@host:5432/db"
                    />
                  </div>
                </div>
              )}

              {settingsSection === "smtp" && (
                <div className="border border-slate-800/80 rounded-2xl p-4 space-y-4 bg-slate-900/40">
                  <h4 className="text-sm font-semibold text-slate-300">SMTP Email</h4>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">SMTP Host</label>
                    <input
                      value={settingsForm.smtp_host}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_host: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">SMTP Port</label>
                    <input
                      value={settingsForm.smtp_port}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_port: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">SMTP User</label>
                    <input
                      value={settingsForm.smtp_user}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_user: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">SMTP Password</label>
                    <input
                      value={settingsForm.smtp_pass}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_pass: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="App password"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">SMTP From</label>
                    <input
                      value={settingsForm.smtp_from}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_from: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                      placeholder="Support <support@example.com>"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">SMTP TLS</label>
                    <select
                      value={settingsForm.smtp_tls}
                      onChange={(event) => setSettingsForm({ ...settingsForm, smtp_tls: event.target.value })}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
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
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Email Reply</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">To</label>
                <input
                  value={emailForm.to}
                  onChange={(event) => setEmailForm({ ...emailForm, to: event.target.value })}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">Subject</label>
                <input
                  value={emailForm.subject}
                  onChange={(event) => setEmailForm({ ...emailForm, subject: event.target.value })}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                  placeholder="Re: Your request"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">Incoming Email</label>
                <textarea
                  value={emailForm.message}
                  onChange={(event) => setEmailForm({ ...emailForm, message: event.target.value })}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100 min-h-[140px]"
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

      {activeSection === "knowledge" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Knowledge Base</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">Upload document (PDF/DOCX/TXT)</label>
                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleUploadKb(file);
                  }}
                  className="mt-2 w-full text-sm text-slate-300"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">Search knowledge base</label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={kbQuery}
                    onChange={(event) => setKbQuery(event.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                  />
                  <button
                    onClick={handleSearchKb}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-sm text-slate-200"
                  >
                    Search
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {kbResults.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500">No results yet.</p>}
                {kbResults.map((result, index) => (
                  <div key={index} className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3 text-sm">
                    {result}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <p className="text-sm font-semibold text-slate-300">Documents</p>
              {knowledgeBase.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500">No documents uploaded.</p>}
              {knowledgeBase.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3 text-sm">
                  <div>
                    <p className="text-slate-200">{doc.filename}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Chunks: {doc.chunks}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteKb(doc.id)}
                    className="px-2 py-1 rounded-lg border border-rose-500/40 text-rose-200 text-xs"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "intelligence" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Conversation Intelligence</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <p className="text-sm text-slate-300 font-semibold">Analyze Message</p>
              <textarea
                value={intelligenceInput}
                onChange={(event) => setIntelligenceInput(event.target.value)}
                className="w-full min-h-[140px] rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                placeholder="Paste a customer message to classify intent and entities..."
              />
              <button
                onClick={handleAnalyzeIntelligence}
                className="px-4 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-200 text-sm font-semibold"
              >
                Analyze
              </button>
              {intelligenceResult && (
                <div className="space-y-2 text-sm">
                  <p>
                    Intent: <span className="text-emerald-200">{intelligenceResult.intent}</span> · Confidence: {intelligenceResult.confidence}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">Summary: {intelligenceResult.summary}</p>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Entities</p>
                    <pre className="mt-2 text-xs text-slate-200 whitespace-pre-wrap">
                      {JSON.stringify(intelligenceResult.entities, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Suggested Responses</p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-200">
                      {intelligenceResult.suggested_responses.map((resp) => (
                        <li key={resp}>• {resp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <p className="text-sm text-slate-300 font-semibold">Advanced Analytics</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Avg response time: {advancedAnalytics?.avg_response_time_seconds ?? "-"}s · Samples: {advancedAnalytics?.response_samples ?? 0}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(advancedAnalytics?.sentiment_breakdown ?? {}).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{key}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-100">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Top Topics</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(advancedAnalytics?.top_topics ?? []).map((topic) => (
                    <span key={topic.topic} className="px-2 py-1 rounded-full bg-slate-800/80 text-xs text-slate-200">
                      {topic.topic} · {topic.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "campaigns" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Proactive Campaigns</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <p className="text-sm text-slate-300 font-semibold">Broadcast Message</p>
              <select
                value={campaignForm.platform}
                onChange={(event) => setCampaignForm({ ...campaignForm, platform: event.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
              >
                <option value="telegram">Telegram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="messenger">Messenger</option>
                <option value="instagram">Instagram</option>
                <option value="sms">SMS</option>
              </select>
              <textarea
                value={campaignForm.message}
                onChange={(event) => setCampaignForm({ ...campaignForm, message: event.target.value })}
                className="w-full min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                placeholder="Write a campaign message..."
              />
              <button
                onClick={handleBroadcast}
                className="px-4 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-200 text-sm font-semibold"
              >
                Send Broadcast
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <p className="text-sm text-slate-300 font-semibold">Abandoned Recovery</p>
              <select
                value={recoveryForm.platform}
                onChange={(event) => setRecoveryForm({ ...recoveryForm, platform: event.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
              >
                <option value="">All Platforms</option>
                <option value="telegram">Telegram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="messenger">Messenger</option>
                <option value="instagram">Instagram</option>
              </select>
              <input
                type="number"
                value={recoveryForm.hours_inactive}
                onChange={(event) => setRecoveryForm({ ...recoveryForm, hours_inactive: Number(event.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                placeholder="Hours inactive"
              />
              <textarea
                value={recoveryForm.message}
                onChange={(event) => setRecoveryForm({ ...recoveryForm, message: event.target.value })}
                className="w-full min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
              />
              <button
                onClick={handleRecovery}
                className="px-4 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-200 text-sm font-semibold"
              >
                Start Recovery
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === "bot" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Bot Personality</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">Persona</label>
                <input
                  value={botForm.persona}
                  onChange={(event) => setBotForm({ ...botForm, persona: event.target.value })}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                  placeholder="Support specialist"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">Tone</label>
                <input
                  value={botForm.tone}
                  onChange={(event) => setBotForm({ ...botForm, tone: event.target.value })}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                  placeholder="friendly | formal | casual"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400">System Prompt</label>
                <textarea
                  value={botForm.system_prompt}
                  onChange={(event) => setBotForm({ ...botForm, system_prompt: event.target.value })}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100 min-h-[140px]"
                />
              </div>
              <button
                onClick={handleBotConfigSave}
                className="px-4 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-200 font-semibold"
              >
                Save Bot Config
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 text-sm">
              <p className="text-slate-300 font-semibold">Current Config</p>
              <p>Persona: {botConfig?.persona ?? "-"}</p>
              <p>Tone: {botConfig?.tone ?? "-"}</p>
              <p className="text-slate-500 dark:text-slate-400">Prompt: {botConfig?.system_prompt || "Default"}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <p className="text-sm text-slate-300 font-semibold">Flow Builder (JSON)</p>
              <input
                value={flowDraft.name}
                onChange={(event) => setFlowDraft({ ...flowDraft, name: event.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                placeholder="Flow name"
              />
              <textarea
                value={flowDraft.nodesJson}
                onChange={(event) => setFlowDraft({ ...flowDraft, nodesJson: event.target.value })}
                className="w-full min-h-[140px] rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-xs text-slate-100"
                placeholder='[{"id":"start","type":"message","label":"Welcome"}]'
              />
              <button
                onClick={handleCreateFlow}
                className="px-4 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-200 text-sm font-semibold"
              >
                Save Flow
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <p className="text-sm font-semibold text-slate-300">Saved Flows</p>
              {flows.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500">No flows created.</p>}
              {flows.map((flow) => (
                <div key={flow.id} className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-200 font-semibold">{flow.name}</p>
                    <button
                      onClick={() => handleDeleteFlow(flow.id)}
                      className="px-2 py-1 rounded-lg border border-rose-500/40 text-rose-200 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Nodes: {flow.nodes.length}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "workflows" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Automation Workflows</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <p className="text-sm text-slate-300 font-semibold">Add Rule</p>
              <input
                value={workflowDraft.name}
                onChange={(event) => setWorkflowDraft({ ...workflowDraft, name: event.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                placeholder="Rule name"
              />
              <input
                value={workflowDraft.keywords}
                onChange={(event) => setWorkflowDraft({ ...workflowDraft, keywords: event.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                placeholder="Keywords (comma separated)"
              />
              <input
                value={workflowDraft.action}
                onChange={(event) => setWorkflowDraft({ ...workflowDraft, action: event.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 text-slate-100"
                placeholder="auto_reply: Hello there"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddWorkflow}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-sm text-slate-200"
                >
                  Add Rule
                </button>
                <button
                  onClick={handleSaveWorkflows}
                  className="px-3 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-sm text-emerald-200"
                >
                  Save Rules
                </button>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <p className="text-sm font-semibold text-slate-300">Rules</p>
              {workflowRules.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500">No rules configured.</p>}
              {workflowRules.map((rule) => (
                <div key={rule.id} className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3 text-sm">
                  <p className="text-slate-200 font-semibold">{rule.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Keywords: {rule.keywords.join(", ")}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Action: {rule.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "reports" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Reports & Export</h3>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <p className="text-sm text-slate-300">Download CSV reports for analysis.</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExportReport("leads")}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-sm text-slate-200"
              >
                Export Leads
              </button>
              <button
                onClick={() => handleExportReport("messages")}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-sm text-slate-200"
              >
                Export Messages
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === "testing" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Chatbot Testing</h3>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <p className="text-sm font-semibold text-slate-300">Conversation Simulator</p>
              <textarea
                value={simulatorPrompt}
                onChange={(event) => setSimulatorPrompt(event.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-100 min-h-[120px]"
                placeholder="Enter a starter message..."
              />
              <input
                type="number"
                min={1}
                max={8}
                value={simulatorTurns}
                onChange={(event) => setSimulatorTurns(Number(event.target.value))}
                className="w-24 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
              />
              <button
                onClick={handleSimulate}
                className="px-3 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-sm text-emerald-200"
              >
                Run Simulation
              </button>
              <div className="space-y-2">
                {simulatorTranscript.map((entry, index) => (
                  <div key={index} className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{entry.role}</p>
                    <p className="text-slate-100">{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <p className="text-sm font-semibold text-slate-300">A/B Test Prompts</p>
              <textarea
                value={abPromptA}
                onChange={(event) => setAbPromptA(event.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-100 min-h-[120px]"
                placeholder="Prompt A"
              />
              <textarea
                value={abPromptB}
                onChange={(event) => setAbPromptB(event.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-100 min-h-[120px]"
                placeholder="Prompt B"
              />
              <input
                value={abMessage}
                onChange={(event) => setAbMessage(event.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                placeholder="User message"
              />
              <button
                onClick={handleAbTest}
                className="px-3 py-2 rounded-xl border border-emerald-500 bg-emerald-500/10 text-sm text-emerald-200"
              >
                Run A/B Test
              </button>
              {abResult && (
                <div className="grid grid-cols-1 gap-2">
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Response A</p>
                    <p className="text-slate-100">{abResult.response_a}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Response B</p>
                    <p className="text-slate-100">{abResult.response_b}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
