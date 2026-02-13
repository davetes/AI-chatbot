const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

function adminHeaders(extra?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = { ...(extra ?? {}) };
  if (ADMIN_KEY) {
    headers["x-admin-key"] = ADMIN_KEY;
  }
  return headers;
}

export async function sendMessage(message: string): Promise<string> {
  const response = await fetch(`${API_BASE}/webchat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    throw new Error("Failed to send message");
  }
  const data = (await response.json()) as { reply: string };
  return data.reply;
}

export async function getAnalytics(): Promise<{
  total_messages: number;
  channels: Record<string, number>;
  users_by_platform: Record<string, number>;
  conversations_by_platform: Record<string, number>;
  last_24h: number;
  total_conversations: number;
  total_leads: number;
}> {
  const response = await fetch(`${API_BASE}/admin/analytics`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load analytics");
  }
  return (await response.json()) as {
    total_messages: number;
    channels: Record<string, number>;
    users_by_platform: Record<string, number>;
    conversations_by_platform: Record<string, number>;
    last_24h: number;
    total_conversations: number;
    total_leads: number;
  };
}

export async function getMessages(): Promise<
  Array<{ id: number; sender: string; content: string; platform: string; user_external_id: string; conversation_id: number; created_at: string }>
> {
  const response = await fetch(`${API_BASE}/admin/messages?limit=50`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load messages");
  }
  return (await response.json()) as Array<{
    id: number;
    sender: string;
    content: string;
    platform: string;
    user_external_id: string;
    conversation_id: number;
    created_at: string;
  }>;
}

export async function getConversations(limit = 50, offset = 0, platform?: string): Promise<
  Array<{ id: number; platform: string; status: string; handoff_enabled: boolean; user_external_id: string; created_at: string }>
> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (platform) {
    params.set("platform", platform);
  }
  const response = await fetch(`${API_BASE}/admin/conversations?${params.toString()}`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load conversations");
  }
  return (await response.json()) as Array<{
    id: number;
    platform: string;
    status: string;
    handoff_enabled: boolean;
    user_external_id: string;
    created_at: string;
  }>;
}

export async function getConversationMessages(conversationId: number, limit = 50): Promise<
  Array<{ id: number; sender: string; content: string; created_at: string }>
> {
  const response = await fetch(`${API_BASE}/admin/conversations/${conversationId}/messages?limit=${limit}` , { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load conversation messages");
  }
  return (await response.json()) as Array<{
    id: number;
    sender: string;
    content: string;
    created_at: string;
  }>;
}

export async function getLeads(): Promise<
  Array<{ id: number; name: string | null; phone: string | null; email: string | null; platform: string; intent: string | null; created_at: string }>
> {
  const response = await fetch(`${API_BASE}/admin/leads?limit=50`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load leads");
  }
  return (await response.json()) as Array<{
    id: number;
    name: string | null;
    phone: string | null;
    email: string | null;
    platform: string;
    intent: string | null;
    created_at: string;
  }>;
}

export async function getSettings(): Promise<{
  ai_provider: string;
  ai_model: string;
  ai_base_url: string | null;
  has_ai_api_key: boolean;
  verify_token_set: boolean;
  meta_api_version: string;
  meta_phone_number_id: string | null;
  meta_page_access_token_set: boolean;
  meta_access_token_set: boolean;
  telegram_bot_token_set: boolean;
  crm_webhook_url: string | null;
  sheets_webhook_url: string | null;
  database_url: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_from: string | null;
  smtp_tls: boolean;
  smtp_configured: boolean;
  bot_persona: string;
  bot_tone: string;
  bot_system_prompt: string | null;
}> {
  const response = await fetch(`${API_BASE}/admin/settings`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load settings");
  }
  return (await response.json()) as {
    ai_provider: string;
    ai_model: string;
    ai_base_url: string | null;
    has_ai_api_key: boolean;
    verify_token_set: boolean;
    meta_api_version: string;
    meta_phone_number_id: string | null;
    meta_page_access_token_set: boolean;
    meta_access_token_set: boolean;
    telegram_bot_token_set: boolean;
    crm_webhook_url: string | null;
    sheets_webhook_url: string | null;
    database_url: string | null;
    smtp_host: string | null;
    smtp_port: number | null;
    smtp_user: string | null;
    smtp_from: string | null;
    smtp_tls: boolean;
    smtp_configured: boolean;
    bot_persona: string;
    bot_tone: string;
    bot_system_prompt: string | null;
  };
}

export async function updateSettings(payload: {
  ai_provider?: string;
  ai_model?: string;
  ai_base_url?: string;
  ai_api_key?: string;
  verify_token?: string;
  meta_api_version?: string;
  meta_access_token?: string;
  meta_phone_number_id?: string;
  meta_page_access_token?: string;
  telegram_bot_token?: string;
  crm_webhook_url?: string;
  sheets_webhook_url?: string;
  database_url?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_from?: string;
  smtp_tls?: boolean;
}): Promise<ReturnType<typeof getSettings>> {
  const response = await fetch(`${API_BASE}/admin/settings`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to update settings");
  }
  return (await response.json()) as ReturnType<typeof getSettings>;
}

export async function sendEmailReply(to: string, subject: string, message: string): Promise<{ reply: string }> {
  const response = await fetch(`${API_BASE}/admin/email/reply`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ to, subject, message }),
  });
  if (!response.ok) {
    throw new Error("Failed to send email reply");
  }
  return (await response.json()) as { reply: string };
}

export async function getAdvancedAnalytics(): Promise<{
  avg_response_time_seconds: number;
  response_samples: number;
  sentiment_breakdown: Record<string, number>;
  top_topics: Array<{ topic: string; count: number }>;
}> {
  const response = await fetch(`${API_BASE}/admin/analytics/advanced`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load advanced analytics");
  }
  return (await response.json()) as {
    avg_response_time_seconds: number;
    response_samples: number;
    sentiment_breakdown: Record<string, number>;
    top_topics: Array<{ topic: string; count: number }>;
  };
}

export async function setConversationHandoff(conversationId: number, enabled: boolean): Promise<{ handoff_enabled: boolean }> {
  const response = await fetch(`${API_BASE}/admin/conversations/${conversationId}/handoff`, {
    method: "PATCH",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ enabled }),
  });
  if (!response.ok) {
    throw new Error("Failed to update handoff status");
  }
  return (await response.json()) as { handoff_enabled: boolean };
}

export async function sendAgentReply(conversationId: number, message: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/admin/conversations/${conversationId}/reply`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    throw new Error("Failed to send agent reply");
  }
  return (await response.json()) as { status: string };
}

export async function getKnowledgeBase(): Promise<Array<{ id: string; filename: string; chunks: number }>> {
  const response = await fetch(`${API_BASE}/admin/knowledge-base`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load knowledge base");
  }
  return (await response.json()) as Array<{ id: string; filename: string; chunks: number }>;
}

export async function uploadKnowledgeBase(file: File): Promise<{ id: string; filename: string; chunks: number }> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_BASE}/admin/knowledge-base/upload`, {
    method: "POST",
    headers: adminHeaders(),
    body: form,
  });
  if (!response.ok) {
    throw new Error("Failed to upload document");
  }
  return (await response.json()) as { id: string; filename: string; chunks: number };
}

export async function deleteKnowledgeBase(docId: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/admin/knowledge-base/${docId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete document");
  }
  return (await response.json()) as { status: string };
}

export async function searchKnowledgeBase(query: string): Promise<{ results: string[] }> {
  const response = await fetch(`${API_BASE}/admin/knowledge-base/search`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    throw new Error("Failed to search knowledge base");
  }
  return (await response.json()) as { results: string[] };
}

export async function getBotConfig(): Promise<{ persona: string; tone: string; system_prompt: string | null }> {
  const response = await fetch(`${API_BASE}/admin/bot/config`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load bot config");
  }
  return (await response.json()) as { persona: string; tone: string; system_prompt: string | null };
}

export async function updateBotConfig(payload: {
  persona?: string;
  tone?: string;
  system_prompt?: string;
}): Promise<{ persona: string; tone: string; system_prompt: string | null }> {
  const response = await fetch(`${API_BASE}/admin/bot/config`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to update bot config");
  }
  return (await response.json()) as { persona: string; tone: string; system_prompt: string | null };
}

export async function getWorkflows(): Promise<Array<{ id: string; name: string; keywords: string[]; action: string }>> {
  const response = await fetch(`${API_BASE}/admin/workflows`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load workflows");
  }
  return (await response.json()) as Array<{ id: string; name: string; keywords: string[]; action: string }>;
}

export async function updateWorkflows(rules: Array<{ id: string; name: string; keywords: string[]; action: string }>): Promise<
  Array<{ id: string; name: string; keywords: string[]; action: string }>
> {
  const response = await fetch(`${API_BASE}/admin/workflows`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ rules }),
  });
  if (!response.ok) {
    throw new Error("Failed to update workflows");
  }
  return (await response.json()) as Array<{ id: string; name: string; keywords: string[]; action: string }>;
}

export async function exportReport(reportType: "leads" | "messages" = "leads"): Promise<Blob> {
  const response = await fetch(`${API_BASE}/admin/reports/export?report_type=${reportType}`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to export report");
  }
  return await response.blob();
}

export async function analyzeIntelligence(text: string): Promise<{
  intent: string;
  confidence: number;
  entities: Record<string, string[]>;
  summary: string;
  suggested_responses: string[];
}> {
  const response = await fetch(`${API_BASE}/admin/intelligence/analyze`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error("Failed to analyze intelligence");
  }
  return (await response.json()) as {
    intent: string;
    confidence: number;
    entities: Record<string, string[]>;
    summary: string;
    suggested_responses: string[];
  };
}

export async function broadcastCampaign(platform: string, message: string): Promise<{ sent: number }> {
  const response = await fetch(`${API_BASE}/admin/campaigns/broadcast`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ platform, message }),
  });
  if (!response.ok) {
    throw new Error("Failed to send broadcast");
  }
  return (await response.json()) as { sent: number };
}

export async function recoveryCampaign(payload: {
  platform?: string;
  hours_inactive: number;
  message: string;
}): Promise<{ sent: number }> {
  const response = await fetch(`${API_BASE}/admin/campaigns/recovery`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to send recovery campaign");
  }
  return (await response.json()) as { sent: number };
}

export async function getFlows(): Promise<Array<{ id: string; name: string; nodes: Array<{ id: string; type: string; label: string; next?: string }> }>> {
  const response = await fetch(`${API_BASE}/admin/flows`, { headers: adminHeaders() });
  if (!response.ok) {
    throw new Error("Failed to load flows");
  }
  return (await response.json()) as Array<{ id: string; name: string; nodes: Array<{ id: string; type: string; label: string; next?: string }> }>;
}

export async function createFlow(payload: {
  name: string;
  nodes: Array<{ id: string; type: string; label: string; next?: string }>;
}): Promise<{ id: string; name: string; nodes: Array<{ id: string; type: string; label: string; next?: string }> }> {
  const response = await fetch(`${API_BASE}/admin/flows`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to create flow");
  }
  return (await response.json()) as { id: string; name: string; nodes: Array<{ id: string; type: string; label: string; next?: string }> };
}

export async function deleteFlow(flowId: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/admin/flows/${flowId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete flow");
  }
  return (await response.json()) as { status: string };
}

export async function simulateConversation(prompt: string, turns: number): Promise<{ transcript: Array<{ role: string; content: string }> }> {
  const response = await fetch(`${API_BASE}/admin/testing/simulate`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prompt, turns }),
  });
  if (!response.ok) {
    throw new Error("Failed to simulate conversation");
  }
  return (await response.json()) as { transcript: Array<{ role: string; content: string }> };
}

export async function runABTest(promptA: string, promptB: string, message: string): Promise<{ response_a: string; response_b: string }> {
  const response = await fetch(`${API_BASE}/admin/testing/ab`, {
    method: "POST",
    headers: adminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prompt_a: promptA, prompt_b: promptB, message }),
  });
  if (!response.ok) {
    throw new Error("Failed to run A/B test");
  }
  return (await response.json()) as { response_a: string; response_b: string };
}
