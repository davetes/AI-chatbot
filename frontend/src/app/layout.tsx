import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AI Multi-Channel Chatbot",
  description: "Web chat UI and admin dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <div className="min-h-screen flex flex-col">
          <header className="flex items-center justify-between px-8 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20">
            <h1 className="text-base font-bold tracking-tight">AI Multi-Channel Chatbot</h1>
            <nav className="flex gap-4">
              <a className="text-sm text-slate-300 font-medium hover:text-white transition" href="/">
                Chat
              </a>
              <a className="text-sm text-slate-300 font-medium hover:text-white transition" href="/admin">
                Admin
              </a>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
