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

export async function getAnalytics(): Promise<{ total_messages: number; channels: Record<string, number>; last_24h: number }> {
  const response = await fetch(`${API_BASE}/admin/analytics`);
  if (!response.ok) {
    throw new Error("Failed to load analytics");
  }
  return (await response.json()) as { total_messages: number; channels: Record<string, number>; last_24h: number };
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

export async function getConversations(): Promise<
  Array<{ id: number; platform: string; status: string; user_external_id: string; created_at: string }>
> {
  const response = await fetch(`${API_BASE}/admin/conversations?limit=50`);
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
