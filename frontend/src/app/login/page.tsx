"use client";

import { useState } from "react";
import { login as loginApi, register as registerApi, setToken } from "../../services/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "register") {
        await registerApi(email, password);
      }
      const token = await loginApi(email, password);
      setToken(token);
      window.location.href = "/profile";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6">
        <div className="mb-6">
          <p className="  text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">AI Multi-Channel Chatbot</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{mode === "login" ? "Login" : "Create account"}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Use your email and password.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
            <p className="text-xs text-slate-500 mt-1">Minimum 6 characters.</p>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 transition disabled:opacity-60"
            type="submit"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register & Login"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="w-full text-sm text-slate-700 dark:text-slate-200 hover:underline"
          >
            {mode === "login" ? "No account? Create one" : "Already have an account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
