
import React, { useState, useRef } from "react";
import {
  MessageCircle, Phone, Video, Users, Settings,
  Search, Plus, Send, Paperclip, Image as ImageIcon,
  Smile, MoreVertical, ArrowRight, CheckCheck,
  Camera, UserPlus, Moon, Sun, Bell, Shield,
  LogOut, X, Pencil, Mic, Menu, ImagePlus
} from "lucide-react";
import "./style.css";

const initialChats = [];

export default function App() {
  const [chats, setChats] = useState(initialChats);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("chats");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("private");
  const [profileName, setProfileName] = useState("کاربر NovaTalk");
  const [darkMode, setDarkMode] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [groupMembers, setGroupMembers] = useState("");
  const fileRef = useRef(null);

  const current = chats.find(c => c.id === selected);

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function createChat() {
    if (!newName.trim()) return;

    const chat = {
      id: Date.now(),
      name: newName.trim(),
      type: newType,
      avatar: newName.trim()[0],
      color: ["#8057ed", "#159cbd", "#d47746", "#269d80"][
        chats.length % 4
      ],
      messages: [],
      members: newType === "group" ? groupMembers : ""
    };

    setChats(prev => [chat, ...prev]);
    setSelected(chat.id);
    setMobileChatOpen(true);
    setNewName("");
    setGroupMembers("");
    setModal("");
    setActiveTab("chats");
  }

  function sendMessage() {
    if (!message.trim() && !attachment) return;

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      file: attachment,
      time: new Date().toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setChats(prev => prev.map(chat =>
      chat.id === selected
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    ));

    setMessage("");
    setAttachment(null);
  }

  function chooseFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("حجم فایل باید کمتر از ۱۰ مگابایت باشد.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        url: reader.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function goBack() {
    setMobileChatOpen(false);
    setSelected(null);
  }

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>

      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">N</div>
          <div>
            <h1>NovaTalk</h1>
            <span>ارتباط هوشمند و سریع</span>
          </div>
        </div>

        <button className="icon-btn" onClick={() => setModal("profile")}>
          <MoreVertical />
        </button>
      </header>

      <main className={`main-layout ${mobileChatOpen ? "chat-open" : ""}`}>

        <aside className="sidebar">

          <div className="sidebar-title">
            <h2>
              {activeTab === "chats" && "گفتگوها"}
              {activeTab === "calls" && "تماس‌ها"}
              {activeTab === "contacts" && "مخاطبین"}
              {activeTab === "settings" && "تنظیمات"}
            </h2>

            {activeTab === "chats" && (
              <button className="new-chat-btn"
                onClick={() => setModal("newchat")}>
                <Plus />
              </button>
            )}
          </div>

          {activeTab === "chats" && (
            <>
              <div className="search-box">
                <Search size={19}/>
                <input
                  placeholder="جستجوی گفتگو..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="chat-list">
                {filteredChats.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <MessageCircle size={35}/>
                    </div>
                    <h3>هنوز گفتگویی نداری</h3>
                    <p>یک گفتگوی جدید بساز و ارتباط را شروع کن.</p>
                    <button onClick={() => setModal("newchat")}>
                      <Plus size={17}/> شروع گفتگو
                    </button>
                  </div>
                ) : (
                  filteredChats.map(chat => {
                    const last = chat.messages.at(-1);

                    return (
                      <button
                        key={chat.id}
                        className={`chat-item ${selected === chat.id ? "selected" : ""}`}
                        onClick={() => {
                          setSelected(chat.id);
                          setMobileChatOpen(true);
                        }}
                      >
                        <div className="avatar"
                          style={{background: chat.color}}>
                          {chat.avatar}
                        </div>

                        <div className="chat-item-info">
                          <div className="chat-item-top">
                            <strong>{chat.name}</strong>
                            <small>{last?.time || ""}</small>
                          </div>
                          <p>
                            {last?.text || (chat.type === "group"
                              ? "گروه جدید"
                              : "گفتگوی خصوصی")}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}

          {activeTab === "calls" && (
            <div className="empty-state">
              <Phone size={38}/>
              <h3>تماس‌ها</h3>
              <p>تاریخچه تماس‌ها پس از راه‌اندازی سرویس تماس نمایش داده می‌شود.</p>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="empty-state">
              <Users size={38}/>
              <h3>مخاطبین</h3>
              <p>برای شروع، یک گفتگوی جدید ایجاد کن.</p>
              <button onClick={() => setModal("newchat")}>
                <UserPlus size={17}/> افزودن مخاطب
              </button>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-list">
              <div className="profile-card">
                <div className="profile-avatar">
                  {profileName[0]}
                </div>
                <div>
                  <strong>{profileName}</strong>
                  <p>حساب NovaTalk</p>
                </div>
                <button className="icon-btn"
                  onClick={() => setModal("profile")}>
                  <Pencil size={18}/>
                </button>
              </div>

              <button className="setting-item"
                onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun/> : <Moon/>}
                <span>تغییر حالت نمایش</span>
              </button>

              <button className="setting-item"
                onClick={() => setModal("invite")}>
                <UserPlus/>
                <span>اتصال با لینک دعوت</span>
              </button>

              <div className="setting-item">
                <Bell/>
                <span>اعلان‌ها</span>
              </div>

              <div className="setting-item">
                <Shield/>
                <span>حریم خصوصی و امنیت</span>
              </div>

              <div className="setting-item">
                <Settings/>
                <span>درباره NovaTalk</span>
              </div>
            </div>
          )}

          <nav className="bottom-nav">
            <button className={activeTab === "chats" ? "active" : ""}
              onClick={() => setActiveTab("chats")}>
              <MessageCircle/><span>گفتگوها</span>
            </button>

            <button className={activeTab === "calls" ? "active" : ""}
              onClick={() => setActiveTab("calls")}>
              <Phone/><span>تماس‌ها</span>
            </button>

            <button className={activeTab === "contacts" ? "active" : ""}
              onClick={() => setActiveTab("contacts")}>
              <Users/><span>مخاطبین</span>
            </button>

            <button className={activeTab === "settings" ? "active" : ""}
              onClick={() => setActiveTab("settings")}>
              <Settings/><span>تنظیمات</span>
            </button>
          </nav>
        </aside>

        <section className="chat-area">

          {current ? (
            <>
              <div className="chat-header">
                <button className="back-btn" onClick={goBack}>
                  <ArrowRight/>
                </button>

                <div className="avatar"
                  style={{background: current.color}}>
                  {current.avatar}
                </div>

                <div className="chat-user">
                  <strong>{current.name}</strong>
                  <span>
                    {current.type === "group" ? "گروه NovaTalk" : "گفتگوی خصوصی"}
                  </span>
                </div>

                <div className="chat-actions">
                  <button className="icon-btn" title="تماس صوتی">
                    <Phone/>
                  </button>
                  <button className="icon-btn" title="تماس تصویری">
                    <Video/>
                  </button>
                  <button className="icon-btn"
                    onClick={() => setModal("chatinfo")}>
                    <MoreVertical/>
                  </button>
                </div>
              </div>

              <div className="messages-area">
                <div className="date-label">امروز</div>

                {current.messages.length === 0 && (
                  <div className="chat-welcome">
                    <div className="welcome-logo">N</div>
                    <h3>به NovaTalk خوش آمدی</h3>
                    <p>گفتگوی خود را از اینجا شروع کن.</p>
                  </div>
                )}

                {current.messages.map(msg => (
                  <div className="message-row mine" key={msg.id}>
                    <div className="message-bubble">
                      {msg.file?.type.startsWith("image/") && (
                        <img className="message-image"
                          src={msg.file.url} alt="تصویر ارسال‌شده"/>
                      )}

                      {msg.file && !msg.file.type.startsWith("image/") && (
                        <div className="file-preview">
                          <Paperclip size={20}/>
                          {msg.file.name}
                        </div>
                      )}

                      {msg.text && <p>{msg.text}</p>}

                      <small>
                        {msg.time}
                        <CheckCheck size={14}/>
                      </small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="composer">
                <button className="icon-btn"
                  onClick={() => fileRef.current?.click()}>
                  <Paperclip/>
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  hidden
                  onChange={chooseFile}
                  accept="image/*,.pdf,.txt,.doc,.docx"
                />

                <button className="icon-btn"
                  onClick={() => fileRef.current?.click()}>
                  <ImageIcon/>
                </button>

                <div className="message-input-wrap">
                  {attachment && (
                    <div className="attachment-chip">
                      <span>{attachment.name}</span>
                      <button onClick={() => setAttachment(null)}>
                        <X size={15}/>
                      </button>
                    </div>
                  )}

                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="پیام خود را بنویسید..."
                  />
                </div>

                <button className="send-btn" onClick={sendMessage}>
                  <Send size={20}/>
                </button>
              </div>
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-logo">N</div>
              <h2>NovaTalk</h2>
              <p>یک گفتگوی جدید انتخاب کن یا بساز.</p>
              <button onClick={() => setModal("newchat")}>
                <Plus size={18}/> گفتگوی جدید
              </button>
            </div>
          )}
        </section>
      </main>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal("")}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modal === "newchat" && "گفتگوی جدید"}
                {modal === "profile" && "پروفایل"}
                {modal === "invite" && "اتصال با لینک دعوت"}
                {modal === "chatinfo" && "اطلاعات گفتگو"}
              </h3>
              <button className="icon-btn" onClick={() => setModal("")}>
                <X/>
              </button>
            </div>

            {modal === "newchat" && (
              <div className="modal-content">
                <div className="type-select">
                  <button className={newType === "private" ? "chosen" : ""}
                    onClick={() => setNewType("private")}>
                    <MessageCircle/> خصوصی
                  </button>
                  <button className={newType === "group" ? "chosen" : ""}
                    onClick={() => setNewType("group")}>
                    <Users/> گروه
                  </button>
                </div>

                <label>نام {newType === "group" ? "گروه" : "مخاطب"}</label>
                <input value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={newType === "group" ? "نام گروه..." : "نام مخاطب..."}/>

                {newType === "group" && (
                  <>
                    <label>اعضای گروه (اختیاری)</label>
                    <input value={groupMembers}
                      onChange={e => setGroupMembers(e.target.value)}
                      placeholder="نام اعضا..."/>
                  </>
                )}

                <button className="primary-btn" onClick={createChat}>
                  ساخت گفتگو
                </button>
              </div>
            )}

            {modal === "profile" && (
              <div className="modal-content">
                <label>نام نمایشی</label>
                <input value={profileName}
                  onChange={e => setProfileName(e.target.value)}/>
                <button className="primary-btn"
                  onClick={() => setModal("")}>
                  ذخیره
                </button>
              </div>
            )}

            {modal === "invite" && (
              <div className="modal-content">
                <p>
                  اتصال با لینک دعوت پس از راه‌اندازی سرور و حساب‌های کاربری فعال می‌شود.
                </p>
                <button className="primary-btn"
                  onClick={() => setModal("")}>
                  متوجه شدم
                </button>
              </div>
            )}

            {modal === "chatinfo" && current && (
              <div className="modal-content">
                <div className="profile-card">
                  <div className="avatar"
                    style={{background: current.color}}>
                    {current.avatar}
                  </div>
                  <strong>{current.name}</strong>
                </div>
                <p>نوع گفتگو: {current.type === "group" ? "گروهی" : "خصوصی"}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
