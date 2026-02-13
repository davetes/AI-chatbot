"use client";

import { useState } from "react";
import AdminDashboard from "../../components/AdminDashboard";

type AdminSection = "dashboard" | "conversations" | "leads" | "channels" | "settings" | "email";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 h-[calc(100vh-120px)] bg-white text-slate-900">
      <aside className="bg-white border-r border-slate-200 px-5 py-6 lg:h-full lg:sticky lg:top-[72px]">
        <h3 className="text-lg font-semibold mb-6 text-slate-900">Admin</h3>
        <nav className="flex flex-col gap-2">
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-100 ${
              activeSection === "dashboard" ? "bg-slate-200" : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-100 ${
              activeSection === "conversations" ? "bg-slate-200" : ""
            }`}
            onClick={() => setActiveSection("conversations")}
          >
            Conversations
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-100 ${
              activeSection === "leads" ? "bg-slate-200" : ""
            }`}
            onClick={() => setActiveSection("leads")}
          >
            Leads
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-100 ${
              activeSection === "channels" ? "bg-slate-200" : ""
            }`}
            onClick={() => setActiveSection("channels")}
          >
            Channels
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-100 ${
              activeSection === "settings" ? "bg-slate-200" : ""
            }`}
            onClick={() => setActiveSection("settings")}
          >
            Settings
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold text-left hover:bg-slate-100 ${
              activeSection === "email" ? "bg-slate-200" : ""
            }`}
            onClick={() => setActiveSection("email")}
          >
            Email
          </button>
        </nav>
      </aside>
      <div className="w-full px-6 py-6 overflow-y-auto bg-white">
        <AdminDashboard activeSection={activeSection} />
      </div>
    </section>
  );
}
