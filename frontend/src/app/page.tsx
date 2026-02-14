"use client";

import { useEffect, useState } from "react";
import AdminDashboard from "../components/AdminDashboard";

type AdminSection =
  | "dashboard"
  | "conversations"
  | "leads"
  | "channels"
  | "settings"
  | "email"
  | "knowledge"
  | "bot"
  | "workflows"
  | "intelligence"
  | "campaigns"
  | "reports"
  | "testing";

const NAV_GROUPS: Array<{
  label?: string;
  items: Array<{
    key: AdminSection;
    label: string;
    icon: string;
    shortcut?: string;
    badge?: string;
  }>;
}> = [
    {
      label: "Overview",
      items: [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
          shortcut: "1",
        },
        {
          key: "conversations",
          label: "Conversations",
          icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
          shortcut: "2",
        },
        {
          key: "leads",
          label: "Leads",
          icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
          shortcut: "3",
        },
      ],
    },
    {
      label: "Channels",
      items: [
        {
          key: "channels",
          label: "All Channels",
          icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
          shortcut: "4",
        },
        {
          key: "email",
          label: "Email",
          icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          shortcut: "6",
        },
      ],
    },
    {
      label: "AI & Automation",
      items: [
        {
          key: "knowledge",
          label: "Knowledge Base",
          icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
          shortcut: "7",
        },
        {
          key: "bot",
          label: "Bot Builder",
          icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
        },
        {
          key: "workflows",
          label: "Workflows",
          icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
        },
        {
          key: "intelligence",
          label: "Intelligence",
          icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
          shortcut: "8",
        },
        {
          key: "campaigns",
          label: "Campaigns",
          icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
          shortcut: "9",
        },
      ],
    },
    {
      label: "Analytics",
      items: [
        {
          key: "reports",
          label: "Reports",
          icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
          shortcut: "0",
        },
        {
          key: "testing",
          label: "Testing",
          icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          key: "settings",
          label: "Settings",
          icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
          shortcut: "5",
        },
      ],
    },
  ];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      const shortcutMap: Record<string, AdminSection> = {};
      NAV_GROUPS.forEach((group) =>
        group.items.forEach((item) => {
          if (item.shortcut) shortcutMap[item.shortcut] = item.key;
        })
      );
      if (shortcutMap[event.key]) {
        setActiveSection(shortcutMap[event.key]);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <section className="w-full h-full overflow-hidden flex">
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'}
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
          border-r border-slate-800/50
          transform transition-all duration-300 ease-out
          lg:relative lg:transform-none flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-5'} py-5 border-b border-slate-800/50`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">ChatBot</h3>
                  <p className="text-[11px] text-slate-500">Admin Panel</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all ${sidebarCollapsed ? 'absolute -right-3 top-6 bg-slate-800 border border-slate-700 shadow-lg' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi} className="mb-6">
                {group.label && !sidebarCollapsed && (
                  <div className="px-3 mb-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">
                      {group.label}
                    </p>
                  </div>
                )}
                {sidebarCollapsed && gi > 0 && (
                  <div className="mx-3 mb-3 border-t border-slate-800/50" />
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activeSection === item.key;
                    return (
                      <button
                        key={item.key}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={`
                          group relative w-full flex items-center ${sidebarCollapsed ? 'justify-center' : ''} gap-3 
                          ${sidebarCollapsed ? 'px-3' : 'px-4'} py-3 rounded-xl text-left
                          transition-all duration-200 ease-out
                          ${isActive
                            ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                          }
                        `}
                        onClick={() => {
                          setActiveSection(item.key);
                          setSidebarOpen(false);
                        }}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                        )}
                        <div className={`
                          flex items-center justify-center w-9 h-9 rounded-lg transition-all
                          ${isActive 
                            ? "bg-emerald-500/20 text-emerald-400" 
                            : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-700/50 group-hover:text-slate-300"
                          }
                        `}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                          </svg>
                        </div>
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                            {item.shortcut && (
                              <kbd className="text-[10px] text-slate-600 bg-slate-800/80 px-1.5 py-0.5 rounded font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                ⌥{item.shortcut}
                              </kbd>
                            )}
                            {item.badge && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-slate-800/50">
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">Admin User</p>
                    <p className="text-[11px] text-slate-500 truncate">admin@chatbot.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  </div>
                  <span className="text-[10px] text-slate-500">75%</span>
                </div>
                <p className="mt-2 text-[10px] text-slate-500">API Usage this month</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
        <div className="p-6 lg:p-8">
          <AdminDashboard activeSection={activeSection} onQuickAction={setActiveSection} />
        </div>
      </main>
    </section>
  );
}
