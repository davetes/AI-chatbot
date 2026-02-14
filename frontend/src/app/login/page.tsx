"use client";

import { useState } from "react";
import { login as loginApi, register as registerApi, setToken } from "../../services/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
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
      window.location.href = "/";
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
          <p className=" pb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-center">AI Multi-Channel Chatbot</p>
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
            <div className="mt-1 relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={passwordVisible ? "text" : "password"}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 pr-11 text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.477 10.48a3 3 0 104.243 4.243" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.362 7.362C5.68 8.597 4.279 10.25 3 12c2.5 3.5 5.5 6 9 6 1.267 0 2.472-.33 3.59-.927" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.09A8.74 8.74 0 0112 4c3.5 0 6.5 2.5 9 8-1.07 2.39-2.32 4.18-3.74 5.39" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C4.732 7.943 8.028 5 12 5c3.972 0 7.268 2.943 9.542 7-2.274 4.057-5.57 7-9.542 7-3.972 0-7.268-2.943-9.542-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
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
