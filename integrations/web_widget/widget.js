const API_BASE = localStorage.getItem("WEBCHAT_API_BASE") || "http://localhost:8000";
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const send = document.getElementById("send");

function addMessage(role, text) {
  const row = document.createElement("div");
  row.className = `bubble ${role}`;
  row.textContent = text;
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
}

send.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  addMessage("user", text);

  const res = await fetch(`${API_BASE}/webchat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, user_id: "web-widget" })
  });
  const data = await res.json();
  addMessage("bot", data.reply || "No reply");
});
