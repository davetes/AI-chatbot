import "./globals.css";
import type { ReactNode } from "react";
import { ThemeProvider, ThemeToggle } from "../components/ThemeProvider";

export const metadata = {
  title: "AI Multi-Channel Chatbot",
  description: "Web chat UI and admin dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full overflow-hidden" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <ThemeProvider>
          <div className="h-full flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 z-20 transition-colors duration-300">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">AI Multi-Channel Chatbot</h1>
              <div className="flex items-center gap-5">
                <nav className="flex gap-4">
                  <a className="text-sm text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition" href="">
                    profile
                  </a>
                  <a className="text-sm text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition" href="/">
                    Admin
                  </a>
                </nav>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
