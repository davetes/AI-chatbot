const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

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
  const response = await fetch(`${API_BASE}/admin/analytics`);
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
  const response = await fetch(`${API_BASE}/admin/messages?limit=50`);
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
  Array<{ id: number; platform: string; status: string; user_external_id: string; created_at: string }>
> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (platform) {
    params.set("platform", platform);
  }
  const response = await fetch(`${API_BASE}/admin/conversations?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to load conversations");
  }
  return (await response.json()) as Array<{
    id: number;
    platform: string;
    status: string;
    user_external_id: string;
    created_at: string;
  }>;
}

export async function getConversationMessages(conversationId: number, limit = 50): Promise<
  Array<{ id: number; sender: string; content: string; created_at: string }>
> {
  const response = await fetch(`${API_BASE}/admin/conversations/${conversationId}/messages?limit=${limit}`);
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
  const response = await fetch(`${API_BASE}/admin/leads?limit=50`);
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
}> {
  const response = await fetch(`${API_BASE}/admin/settings`);
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
    headers: {
      "Content-Type": "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, message }),
  });
  if (!response.ok) {
    throw new Error("Failed to send email reply");
  }
  return (await response.json()) as { reply: string };
}
