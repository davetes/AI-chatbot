"use client";

import { useState } from "react";
import { sendMessage } from "../services/api";

export default function ChatUI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([
    { role: "bot", text: "Hi! Ask me anything." },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);
    try {
      const reply = await sendMessage(userMessage);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pb-3">
        {messages.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={`px-4 py-3 rounded-2xl w-fit max-w-[80%] ${
              msg.role === "user" ? "bg-blue-600 self-end" : "bg-slate-800"
            }`}
          >
            <span>{msg.text}</span>
          </div>
        ))}
        {loading && <div className="px-4 py-3 rounded-2xl bg-slate-800 w-fit">Typing...</div>}
      </div>
      <div className="flex gap-3 mt-4">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a message"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100"
        />
        <button
          onClick={handleSend}
          className="px-5 py-3 rounded-xl bg-emerald-400 text-slate-900 font-semibold hover:bg-emerald-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}
