import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AI Multi-Channel Chatbot",
  description: "Web chat UI and admin dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="flex items-center justify-between px-8 py-5 bg-slate-900/80 border-b border-slate-800">
            <h1 className="text-lg font-semibold">AI Multi-Channel Chatbot</h1>
            <nav className="flex gap-4">
              <a className="text-slate-100 font-semibold hover:text-white" href="/">
                Chat
              </a>
              <a className="text-slate-100 font-semibold hover:text-white" href="/admin">
                Admin
              </a>
            </nav>
          </header>
          <main className="flex-1 grid place-items-center px-8 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
