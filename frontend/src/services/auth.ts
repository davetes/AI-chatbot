const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function register(email: string, password: string): Promise<{ id: number; email: string; created_at: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail ?? "Register failed");
  }
  return (await res.json()) as { id: number; email: string; created_at: string };
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail ?? "Login failed");
  }
  const data = (await res.json()) as { access_token: string; token_type: string };
  return data.access_token;
}

export async function logout(): Promise<void> {
  const token = getToken();
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } finally {
    clearToken();
  }
}

export async function me(): Promise<{ id: number; email: string; created_at: string }> {
  const token = getToken();
  if (!token) throw new Error("Not logged in");

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    clearToken();
    throw new Error("Not logged in");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail ?? "Failed to load profile");
  }
  return (await res.json()) as { id: number; email: string; created_at: string };
}
