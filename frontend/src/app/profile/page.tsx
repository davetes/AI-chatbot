"use client";

import { useEffect, useState } from "react";
import { changePassword, me, logout } from "../../services/auth";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ id: number; email: string; created_at: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    me()
      .then((p) => {
        setProfile(p);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Failed to load";
        setError(msg);
        window.location.href = "/login";
      });
  }, []);

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setMessage(null);
    setError(null);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      setError(msg);
      if (msg === "Not logged in") {
        window.location.href = "/login";
      }
    } finally {
      setSavingPassword(false);
    }
  }

  async function onLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile</h2>
        {!profile ? (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Loading...</p>
        ) : (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 break-all">{profile.email}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">User ID</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{profile.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Created</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{new Date(profile.created_at).toLocaleString()}</span>
            </div>
          </div>
        )}

        {message && <div className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">{message}</div>}
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6 space-y-6">
          <form onSubmit={onChangePassword} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Change password</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Current password</label>
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type="password"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">New password</label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 mt-1">Minimum 6 characters.</p>
            </div>
            <button
              disabled={savingPassword}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 transition disabled:opacity-60"
              type="submit"
            >
              {savingPassword ? "Saving..." : "Change password"}
            </button>
          </form>
        </div>

      
      </div>
    </div>
  );
}
