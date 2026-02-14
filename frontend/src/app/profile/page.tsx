"use client";

import { useEffect, useState } from "react";
import { me, logout } from "../../services/auth";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ id: number; email: string; created_at: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    me()
      .then((p) => setProfile(p))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load");
      });
  }, []);

  async function onLogout() {
    await logout();
    window.location.href = "/login";
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Not logged in</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{error}</p>
          <a className="inline-block mt-4 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline" href="/login">
            Go to login
          </a>
        </div>
      </div>
    );
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

        <button
          onClick={onLogout}
          className="mt-6 w-full rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold py-2 hover:opacity-90 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
