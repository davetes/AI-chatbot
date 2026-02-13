# Admin UI Features Guide - Similar Chatbot Platforms

## Example Platforms Like Your Chatbot

### 1. **Intercom** (intercom.com)
- Live chat widget + admin dashboard
- Conversation inbox with real-time updates
- Lead/contact management
- Analytics and reporting

### 2. **Crisp** (crisp.chat)
- Multi-channel inbox (WhatsApp, Messenger, Telegram, Web)
- Visitor tracking
- Canned responses
- Team collaboration

### 3. **Tidio** (tidio.com)
- AI chatbot + live chat
- Visitor list with real-time activity
- Conversation history
- Lead capture forms

### 4. **Freshchat** (freshworks.com/freshchat)
- Omnichannel messaging
- Bot builder
- Campaign management
- Analytics dashboard

### 5. **Chatwoot** (chatwoot.com) - **Open Source**
- Multi-channel support
- Team inbox
- Canned responses
- Reports and analytics

---

## Features to Add to Your Project

### Priority 1: Essential Features

#### 1. Real-time Conversation Inbox
**What it does:** Shows live conversations as they happen

**How to implement:**
```tsx
// frontend/src/components/ConversationInbox.tsx
"use client";
import { useEffect, useState } from "react";

export default function ConversationInbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);

  // Poll for new conversations every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/admin/conversations");
      setConversations(await res.json());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inbox-layout">
      <aside className="conversation-list">
        {conversations.map(conv => (
          <div 
            key={conv.id} 
            onClick={() => setSelectedConv(conv)}
            className={selectedConv?.id === conv.id ? "active" : ""}
          >
            <span>{conv.user_external_id}</span>
            <span>{conv.platform}</span>
          </div>
        ))}
      </aside>
      <main className="message-view">
        {/* Show messages for selected conversation */}
      </main>
    </div>
  );
}
```

**Backend endpoint needed:**
```python
# backend/app/routes/admin.py
@router.get("/conversations/{conv_id}/messages")
async def conversation_messages(conv_id: int):
    return await list_messages_by_conversation(conv_id)
```

---

#### 2. Search & Filters
**What it does:** Search conversations by user, platform, date

**Frontend implementation:**
```tsx
// Add to AdminDashboard.tsx
const [searchTerm, setSearchTerm] = useState("");
const [platformFilter, setPlatformFilter] = useState("all");

const filteredConversations = conversations.filter(conv => {
  const matchesSearch = conv.user_external_id.includes(searchTerm);
  const matchesPlatform = platformFilter === "all" || conv.platform === platformFilter;
  return matchesSearch && matchesPlatform;
});

// In JSX:
<input 
  type="text" 
  placeholder="Search users..." 
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
<select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
  <option value="all">All Platforms</option>
  <option value="whatsapp">WhatsApp</option>
  <option value="telegram">Telegram</option>
  <option value="messenger">Messenger</option>
  <option value="web">Web</option>
</select>
```

---

#### 3. Pagination
**What it does:** Load data in pages instead of all at once

**Frontend:**
```tsx
const [page, setPage] = useState(1);
const limit = 20;

const loadConversations = async () => {
  const offset = (page - 1) * limit;
  const res = await fetch(`/api/admin/conversations?limit=${limit}&offset=${offset}`);
  setConversations(await res.json());
};

// Pagination controls
<div className="pagination">
  <button onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
  <span>Page {page}</span>
  <button onClick={() => setPage(p => p + 1)}>Next</button>
</div>
```

---

### Priority 2: Enhanced Features

#### 4. Reply to Conversations (Agent Takeover)
**What it does:** Let admin reply directly to users

**Backend endpoint:**
```python
# backend/app/routes/admin.py
from app.services.messaging import send_platform_message

@router.post("/conversations/{conv_id}/reply")
async def reply_to_conversation(conv_id: int, message: str):
    conv = await get_conversation(conv_id)
    await send_platform_message(
        platform=conv.platform,
        user_id=conv.user_external_id,
        message=message
    )
    # Save message to DB
    await save_message(conv_id, "agent", message)
    return {"status": "sent"}
```

**Frontend:**
```tsx
const [replyText, setReplyText] = useState("");

const sendReply = async () => {
  await fetch(`/api/admin/conversations/${selectedConv.id}/reply`, {
    method: "POST",
    body: JSON.stringify({ message: replyText })
  });
  setReplyText("");
};

<textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} />
<button onClick={sendReply}>Send Reply</button>
```

---

#### 5. Canned Responses (Quick Replies)
**What it does:** Pre-saved responses for common questions

**Database model:**
```python
# backend/app/models/db.py
class CannedResponse(Base):
    __tablename__ = "canned_responses"
    id = Column(Integer, primary_key=True)
    shortcut = Column(String, unique=True)  # e.g., "/hello"
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Frontend:**
```tsx
const [cannedResponses, setCannedResponses] = useState([]);

// When typing "/" show suggestions
const handleReplyChange = (text) => {
  setReplyText(text);
  if (text.startsWith("/")) {
    const matches = cannedResponses.filter(r => 
      r.shortcut.startsWith(text)
    );
    setSuggestions(matches);
  }
};
```

---

#### 6. Analytics Charts
**What it does:** Visual charts for metrics

**Install chart library:**
```bash
npm install recharts
```

**Implementation:**
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { date: "Mon", messages: 120 },
  { date: "Tue", messages: 150 },
  // ...
];

<LineChart width={600} height={300} data={data}>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="messages" stroke="#8884d8" />
</LineChart>
```

---

### Priority 3: Advanced Features

#### 7. User/Visitor Profiles
Track user information across conversations

#### 8. Tags & Labels
Categorize conversations (e.g., "Sales", "Support", "Complaint")

#### 9. Team Management
Multiple admin users with roles

#### 10. Notifications
Browser notifications for new messages

#### 11. Export Data
Export conversations/leads to CSV

---

## Implementation Roadmap

### Phase 1 - Core Improvements
- [ ] Add search and filters to existing dashboard
- [ ] Implement pagination
- [ ] Create conversation detail view

### Phase 2 - Agent Features
- [ ] Add reply functionality
- [ ] Create canned responses system
- [ ] Add conversation status (open/closed/pending)

### Phase 3 - Analytics & Reporting
- [ ] Add charts with Recharts
- [ ] Create date range filters
- [ ] Add export functionality

### Phase 4 - Advanced
- [ ] Real-time updates with WebSockets
- [ ] User authentication for admin
- [ ] Team collaboration features

---

## Quick Start: Add Search Feature

1. **Edit** `frontend/src/components/AdminDashboard.tsx`:

```tsx
// Add state at top
const [searchTerm, setSearchTerm] = useState("");

// Add filter logic
const filteredConversations = conversations.filter(conv =>
  conv.user_external_id.toLowerCase().includes(searchTerm.toLowerCase())
);

// Add search input in JSX (before the conversations list)
<input
  type="text"
  placeholder="Search by user ID..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="admin-search"
/>

// Use filteredConversations instead of conversations in the map
```

2. **Add CSS** to `frontend/src/app/globals.css`:

```css
.admin-search {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  background: #1e293b;
  color: #e2e8f0;
  margin-bottom: 1rem;
}

.admin-search:focus {
  outline: none;
  border-color: #3b82f6;
}
```

---

## Resources

- **Chatwoot** (open source): https://github.com/chatwoot/chatwoot - Great reference for features
- **Recharts**: https://recharts.org - For charts
- **Tailwind UI**: https://tailwindui.com - UI components
- **Headless UI**: https://headlessui.com - Accessible components
