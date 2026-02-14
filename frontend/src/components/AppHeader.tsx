"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getToken } from "../services/auth";
import { ThemeToggle } from "./ThemeProvider";

export default function AppHeader() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getToken()));

    const onStorage = () => setAuthed(Boolean(getToken()));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (pathname === "/login" || pathname === "/logout") {
    return null;
  }

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 z-20 transition-colors duration-300">
      <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">AI Multi-Channel Chatbot</h1>
      <div className="flex items-center gap-5">
        <nav className="flex gap-4">
          {authed && (
            <a className="text-sm text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition" href="/profile">
              profile
            </a>
          )}
          {authed && (
            <a className="text-sm text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition" href="/logout">
              Logout
            </a>
          )}
          <a className="text-sm text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition" href="/">
            Admin
          </a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
