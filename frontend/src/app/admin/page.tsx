"use client";

import { useState } from "react";
import AdminDashboard from "../../components/AdminDashboard";

type AdminSection = "dashboard" | "conversations" | "leads" | "channels" | "settings";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 h-[calc(100vh-120px)]">
      <aside className="bg-slate-950/80 border-r border-slate-800 px-5 py-6 lg:h-full lg:sticky lg:top-[72px]">
        <h3 className="text-lg font-semibold mb-6">Admin</h3>
        <nav className="flex flex-col gap-2">
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-900/80 ${
              activeSection === "dashboard" ? "bg-slate-900/80" : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-900/80 ${
              activeSection === "conversations" ? "bg-slate-900/80" : ""
            }`}
            onClick={() => setActiveSection("conversations")}
          >
            Conversations
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-900/80 ${
              activeSection === "leads" ? "bg-slate-900/80" : ""
            }`}
            onClick={() => setActiveSection("leads")}
          >
            Leads
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-900/80 ${
              activeSection === "channels" ? "bg-slate-900/80" : ""
            }`}
            onClick={() => setActiveSection("channels")}
          >
            Channels
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-900/80 ${
              activeSection === "settings" ? "bg-slate-900/80" : ""
            }`}
            onClick={() => setActiveSection("settings")}
          >
            Settings
          </button>
        </nav>
      </aside>
      <div className="w-full px-6 py-6 overflow-y-auto">
        <AdminDashboard activeSection={activeSection} />
      </div>
    </section>
  );
}
