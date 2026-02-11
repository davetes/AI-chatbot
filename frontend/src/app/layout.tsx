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
        <div className="app-shell">
          <header className="app-header">
            <h1>AI Multi-Channel Chatbot</h1>
            <nav>
              <a href="/">Chat</a>
              <a href="/admin">Admin</a>
            </nav>
          </header>
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
