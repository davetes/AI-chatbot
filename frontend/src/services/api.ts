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
  Array<{ id: number; channel: string; user_id: string | null; user_message: string; bot_message: string; created_at: string }>
> {
  const response = await fetch(`${API_BASE}/admin/messages?limit=50`);
  if (!response.ok) {
    throw new Error("Failed to load messages");
  }
  return (await response.json()) as Array<{
    id: number;
    channel: string;
    user_id: string | null;
    user_message: string;
    bot_message: string;
    created_at: string;
  }>;
}
