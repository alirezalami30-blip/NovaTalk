import React, { useState } from "react";
import {
  MessageCircle, Phone, Video, Users, Settings,
  Search, Plus, Send, Paperclip, Image, Smile,
  MoreVertical, ArrowLeft, CheckCheck
} from "lucide-react";

const contacts = [
  { id: 1, name: "پشتیبانی NovaTalk", message: "به NovaTalk خوش آمدید!", time: "20:30", color: "#8b5cf6" },
  { id: 2, name: "دوست من", message: "سلام، خوبی؟", time: "19:45", color: "#06b6d4" },
  { id: 3, name: "گروه دوستان", message: "عکس جدید ارسال شد", time: "18:20", color: "#10b981" },
  { id: 4, name: "خانواده", message: "بعداً تماس بگیر", time: "17:10", color: "#f59e0b" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("chats");
  const [selected, setSelected] = useState(1);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({
    1: [{ id: 1, text: "به NovaTalk خوش آمدید! 🚀", mine: false, time: "20:30" }],
    2: [{ id: 2, text: "سلام، خوبی؟", mine: false, time: "19:45" }],
    3: [{ id: 3, text: "به گروه دوستان خوش آمدید", mine: false, time: "18:20" }],
    4: [{ id: 4, text: "سلام خانواده ❤️", mine: false, time: "17:10" }]
  });

  const current = contacts.find(c => c.id === selected);

  function sendMessage() {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      mine: true,
      time: new Date().toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages(prev => ({
      ...prev,
      [selected]: [...(prev[selected] || []), newMessage]
    }));

    setMessage("");
  }

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">N</div>
          <div>
            <h1>NovaTalk</h1>
            <span>ارتباط بدون مرز</span>
          </div>
        </div>
        <button className="icon-btn"><MoreVertical /></button>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <h2>گفتگوها</h2>
            <button className="new-chat"><Plus /></button>
          </div>

          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="جستجوی گفتگو..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="contact-list">
            {filtered.map(contact => (
              <button
                key={contact.id}
                className={`contact ${selected === contact.id ? "active" : ""}`}
                onClick={() => setSelected(contact.id)}
              >
                <div className="avatar" style={{ background: contact.color }}>
                  {contact.name[0]}
                </div>
                <div className="contact-info">
                  <div className="contact-top">
                    <strong>{contact.name}</strong>
                    <small>{contact.time}</small>
                  </div>
                  <p>{contact.message}</p>
                </div>
              </button>
            ))}
          </div>

          <nav className="bottom-nav">
            <button onClick={() => setActiveTab("chats")} className={activeTab === "chats" ? "nav-active" : ""}>
              <MessageCircle /><span>گفتگو</span>
            </button>
            <button onClick={() => setActiveTab("calls")} className={activeTab === "calls" ? "nav-active" : ""}>
              <Phone /><span>تماس‌ها</span>
            </button>
            <button onClick={() => setActiveTab("groups")} className={activeTab === "groups" ? "nav-active" : ""}>
              <Users /><span>گروه‌ها</span>
            </button>
            <button onClick={() => setActiveTab("settings")} className={activeTab === "settings" ? "nav-active" : ""}>
              <Settings /><span>تنظیمات</span>
            </button>
          </nav>
        </aside>

        <section className="chat-area">
          <div className="chat-header">
            <button className="back-btn"><ArrowLeft /></button>
            <div className="avatar" style={{ background: current.color }}>
              {current.name[0]}
            </div>
            <div className="chat-user">
              <strong>{current.name}</strong>
              <span>گفتگوی NovaTalk</span>
            </div>
            <div className="chat-actions">
              <button className="icon-btn"><Phone /></button>
              <button className="icon-btn"><Video /></button>
              <button className="icon-btn"><MoreVertical /></button>
            </div>
          </div>

          <div className="messages">
            <div className="date-label">امروز</div>

            {(messages[selected] || []).map(msg => (
              <div key={msg.id} className={`message ${msg.mine ? "mine" : "theirs"}`}>
                <div className="bubble">
                  <p>{msg.text}</p>
                  <small>{msg.time} {msg.mine && <CheckCheck size={13} />}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="composer">
            <button className="icon-btn"><Paperclip /></button>
            <button className="icon-btn"><Image /></button>
            <input
              placeholder="پیام خود را بنویسید..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button className="icon-btn"><Smile /></button>
            <button className="send-btn" onClick={sendMessage}>
              <Send />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
      }
