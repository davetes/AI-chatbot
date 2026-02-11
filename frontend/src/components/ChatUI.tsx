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
    <div className="chat-card">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={`${msg.role}-${index}`} className={`chat-bubble ${msg.role}`}>
            <span>{msg.text}</span>
          </div>
        ))}
        {loading && <div className="chat-bubble bot">Typing...</div>}
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
