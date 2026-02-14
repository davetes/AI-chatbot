import "./globals.css";
import type { ReactNode } from "react";
import { ThemeProvider, ThemeToggle } from "../components/ThemeProvider";
import AppHeader from "../components/AppHeader";

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
            <AppHeader />
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
