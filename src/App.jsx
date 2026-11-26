
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageCircle, Phone, Video, Users, Settings, Search, Plus,
  Send, Paperclip, Image as ImageIcon, MoreVertical, ArrowRight,
  CheckCheck, UserPlus, Moon, Sun, Bell, Shield, LogOut, X,
  Pencil, Menu, LoaderCircle, Lock, Mail, User, RefreshCw
} from "lucide-react";
import { supabase } from "./supabase";
import "./style.css";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const BUCKET = "chat-files";

const timeText = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const errorText = (error) => {
  const message = error?.message || "خطای ناشناخته";
  if (message.toLowerCase().includes("invalid login")) return "ایمیل یا رمز عبور اشتباه است.";
  if (message.toLowerCase().includes("already registered")) return "این ایمیل قبلاً ثبت‌نام کرده است.";
  if (message.toLowerCase().includes("password")) return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
  if (message.toLowerCase().includes("email")) return "ایمیل واردشده معتبر نیست.";
  return message;
};

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function submit(event) {
    event.preventDefault();
    setNotice("");

    if (!email.trim() || !password) {
      setNotice("ایمیل و رمز عبور را وارد کن.");
      return;
    }

    if (mode === "signup" && !displayName.trim()) {
      setNotice("نام نمایشی را وارد کن.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { display_name: displayName.trim() }
          }
        });

        if (error) throw error;

        if (!data.session) {
          setNotice("ثبت‌نام انجام شد. ایمیلت را بررسی و حساب را تأیید کن؛ سپس وارد شو.");
        } else {
          setNotice("حساب ساخته شد.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        if (error) throw error;
      }
    } catch (error) {
      setNotice(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app dark" dir="rtl">
      <div style={{
        minHeight: "100dvh", display: "grid", placeItems: "center",
        padding: 20, background: "radial-gradient(circle at top, #24204b, #090d18 60%)"
      }}>
        <form onSubmit={submit} style={{
          width: "min(100%, 420px)", padding: 26, borderRadius: 24,
          background: "#111827", border: "1px solid rgba(255,255,255,.1)",
          boxShadow: "0 25px 80px rgba(0,0,0,.35)"
        }}>
          <div className="welcome-logo">N</div>
          <h1 style={{ textAlign: "center", marginBottom: 5 }}>NovaTalk</h1>
          <p style={{ textAlign: "center", color: "#9aa5ba", marginTop: 0 }}>
            ارتباط سریع، ساده و امن
          </p>

          <div className="type-select" style={{ margin: "22px 0" }}>
            <button type="button"
              className={mode === "login" ? "chosen" : ""}
              onClick={() => { setMode("login"); setNotice(""); }}>
              ورود
            </button>
            <button type="button"
              className={mode === "signup" ? "chosen" : ""}
              onClick={() => { setMode("signup"); setNotice(""); }}>
              ثبت‌نام
            </button>
          </div>

          {mode === "signup" && (
            <>
              <label>نام نمایشی</label>
              <input className="auth-input" value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="نامی که دیگران می‌بینند" />
            </>
          )}

          <label>ایمیل</label>
          <input className="auth-input" type="email" autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="name@example.com" />

          <label>رمز عبور</label>
          <input className="auth-input" type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="حداقل ۶ کاراکتر" />

          {notice && (
            <p role="status" style={{
              color: notice.includes("انجام شد") || notice.includes("بررسی")
                ? "#55d6a3" : "#ff8798",
              fontSize: 13, lineHeight: 1.9
            }}>{notice}</p>
          )}

          <button className="primary-btn" disabled={busy} type="submit">
            {busy ? "لطفاً صبر کن..." : mode === "login" ? "ورود به NovaTalk" : "ساخت حساب"}
          </button>

          <p style={{ color: "#8994a8", fontSize: 11, textAlign: "center", lineHeight: 1.8 }}>
            با ساخت حساب، یک پروفایل شخصی در NovaTalk ایجاد می‌شود.
          </p>
        </form>
      </div>
      <style>{`
        .auth-input {
          width:100%; min-height:46px; padding:12px; margin:8px 0 17px;
          border:1px solid rgba(255,255,255,.1); border-radius:12px;
          color:#fff; background:#182235; outline:none;
        }
        .auth-input:focus { border-color:#7667ff; }
        .app label { display:block; color:#dbe0ed; font-size:13px; }
        .app button:disabled { opacity:.6; cursor:wait; }
      `}</style>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [chats, setChats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("chats");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("private");
  const [memberNames, setMemberNames] = useState("");
  const [profileName, setProfileName] = useState("");
  const [username, setUsername] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef(null);
  const messageEndRef = useRef(null);

  const current = chats.find(chat => chat.id === selected) || null;

  const filteredChats = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return chats;
    return chats.filter(chat => chat.name.toLowerCase().includes(term));
  }, [chats, search]);

  // Restore session and listen for login/logout.
  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) setNotice(errorText(error));
      setUser(data?.session?.user || null);
      setSessionReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Load the signed-in user's profile.
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setChats([]);
      setSelected(null);
      setMessages([]);
      return;
    }

    let alive = true;

    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!alive) return;
      if (error) {
        setNotice(errorText(error));
        return;
      }

      setProfile(data);
      setProfileName(data?.display_name || user.user_metadata?.display_name || "");
      setUsername(data?.username || "");
    }

    loadProfile();
    return () => { alive = false; };
  }, [user]);

  const loadChats = useCallback(async () => {
    if (!user) return;

    setLoadingChats(true);
    try {
      const { data: memberships, error: memberError } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      const ids = [...new Set((memberships || []).map(row => row.conversation_id))];
      if (!ids.length) {
        setChats([]);
        setSelected(null);
        return;
      }

      const { data: conversations, error: conversationError } = await supabase
        .from("conversations")
        .select("id, title, type, created_at")
        .in("id", ids)
        .order("created_at", { ascending: false });

      if (conversationError) throw conversationError;

      const { data: allMembers, error: allMembersError } = await supabase
        .from("conversation_members")
        .select("conversation_id, user_id, role")
        .in("conversation_id", ids);

      if (allMembersError) throw allMembersError;

      const otherIds = [...new Set((allMembers || [])
        .map(row => row.user_id)
        .filter(id => id !== user.id))];

      let profilesById = {};
      if (otherIds.length) {
        const { data: people, error: peopleError } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_url")
          .in("id", otherIds);

        if (peopleError) throw peopleError;
        profilesById = Object.fromEntries((people || []).map(person => [person.id, person]));
      }

      const { data: recentMessages, error: recentError } = await supabase
        .from("messages")
        .select("id, conversation_id, content, created_at, sender_id, attachment_name")
        .in("conversation_id", ids)
        .order("created_at", { ascending: false })
        .limit(150);

      if (recentError) throw recentError;

      const lastByConversation = {};
      for (const item of recentMessages || []) {
        if (!lastByConversation[item.conversation_id]) {
          lastByConversation[item.conversation_id] = item;
        }
      }

      const result = (conversations || []).map(conversation => {
        const members = (allMembers || []).filter(
          row => row.conversation_id === conversation.id
        );
        const other = members.find(row => row.user_id !== user.id);
        const otherProfile = other ? profilesById[other.user_id] : null;
        const last = lastByConversation[conversation.id];

        return {
          id: conversation.id,
          type: conversation.type,
          name: conversation.type === "group"
            ? (conversation.title || "گروه بدون نام")
            : (otherProfile?.display_name || otherProfile?.username || "کاربر NovaTalk"),
          avatar: conversation.type === "group"
            ? "گ"
            : (otherProfile?.display_name || otherProfile?.username || "ن").slice(0, 1),
          color: conversation.type === "group" ? "#159cbd" : "#8057ed",
          lastText: last
            ? (last.content || last.attachment_name || "فایل")
            : "هنوز پیامی ارسال نشده",
          lastTime: last?.created_at || conversation.created_at
        };
      });

      setChats(result);
      setSelected(old => old && result.some(chat => chat.id === old) ? old : null);
    } catch (error) {
      setNotice("بارگذاری گفتگوها: " + errorText(error));
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadChats();
  }, [user, loadChats]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!user || !conversationId) return;

    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, attachment_url, attachment_name, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(300);

      if (error) throw error;

      const prepared = await Promise.all((data || []).map(async item => {
        let fileUrl = null;
        if (item.attachment_url) {
          const { data: signed, error: signedError } = await supabase
            .storage.from(BUCKET)
            .createSignedUrl(item.attachment_url, 3600);

          if (!signedError) fileUrl = signed?.signedUrl || null;
        }

        return {
          ...item,
          fileUrl,
          mine: item.sender_id === user.id
        };
      }));

      setMessages(prepared);
    } catch (error) {
      setNotice("بارگذاری پیام‌ها: " + errorText(error));
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  // Load messages and subscribe to new messages in the selected conversation.
  useEffect(() => {
    if (!selected || !user) {
      setMessages([]);
      return;
    }

    loadMessages(selected);

    const channel = supabase
      .channel("messages-" + selected)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: "conversation_id=eq." + selected
      }, () => {
        loadMessages(selected);
        loadChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selected, user, loadMessages, loadChats]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) setNotice(errorText(error));
    setMobileChatOpen(false);
  }

  async function saveProfile() {
    if (!user) return;
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");

    if (cleanUsername && !/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
      setNotice("نام کاربری باید ۳ تا ۲۴ حرف انگلیسی، عدد یا زیرخط باشد.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profileName.trim() || "کاربر NovaTalk",
          username: cleanUsername || null
        })
        .eq("id", user.id);

      if (error) throw error;

      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setModal("");
      setNotice("پروفایل ذخیره شد.");
      await loadChats();
    } catch (error) {
      setNotice("ذخیره پروفایل: " + errorText(error));
    } finally {
      setBusy(false);
    }
  }

  async function createChat() {
    if (!user || busy) return;

    const title = newName.trim();
    if (!title) {
      setNotice(newType === "group" ? "نام گروه را وارد کن." : "نام کاربری مخاطب را وارد کن.");
      return;
    }

    setBusy(true);
    setNotice("");

    try {
      let targetUsers = [];

      if (newType === "private") {
        const targetUsername = title.toLowerCase().replace(/^@/, "");
        const { data: target, error } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("username", targetUsername)
          .maybeSingle();

        if (error) throw error;
        if (!target) throw new Error("این نام کاربری پیدا نشد. مخاطب باید ابتدا نام کاربری بسازد.");
        if (target.id === user.id) throw new Error("نمی‌توانی با حساب خودت گفتگوی خصوصی بسازی.");

        targetUsers = [target.id];
      } else {
        const names = [...new Set(memberNames.split(",")
          .map(value => value.trim().toLowerCase().replace(/^@/, ""))
          .filter(Boolean))];

        if (names.length) {
          const { data: people, error } = await supabase
            .from("profiles")
            .select("id, username")
            .in("username", names);

          if (error) throw error;

          const found = people || [];
          const missing = names.filter(name => !found.some(person => person.username === name));
          if (missing.length) {
            throw new Error("این نام‌های کاربری پیدا نشدند: " + missing.join(", "));
          }

          targetUsers = found.map(person => person.id).filter(id => id !== user.id);
        }
      }

      const conversationId = crypto.randomUUID();

      const { error: createError } = await supabase
        .from("conversations")
        .insert({
          id: conversationId,
          title: newType === "group" ? title : null,
          type: newType,
          created_by: user.id
        });

      if (createError) throw createError;

      const memberRows = [...new Set([user.id, ...targetUsers])].map(id => ({
        conversation_id: conversationId,
        user_id: id,
        role: id === user.id ? "owner" : "member"
      }));

      const { error: membersError } = await supabase
        .from("conversation_members")
        .insert(memberRows);

      if (membersError) throw membersError;

      setModal("");
      setNewName("");
      setMemberNames("");
      setSelected(conversationId);
      setMobileChatOpen(true);
      setActiveTab("chats");
      await loadChats();
    } catch (error) {
      setNotice("ساخت گفتگو: " + errorText(error));
    } finally {
      setBusy(false);
    }
  }

  async function chooseFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setNotice("حجم فایل باید کمتر از ۲۰ مگابایت باشد.");
      return;
    }

    setAttachment(file);
    setNotice("");
  }

  async function sendMessage() {
    if (!user || !selected || busy) return;
    if (!message.trim() && !attachment) return;

    setBusy(true);
    setNotice("");

    let uploadedPath = null;

    try {
      if (attachment) {
        const safeName = attachment.name
          .replace(/[^\w.\-ء-ی]/g, "_")
          .slice(0, 100);

        const path = `${selected}/${user.id}/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase
          .storage.from(BUCKET)
          .upload(path, attachment, {
            cacheControl: "3600",
            upsert: false,
            contentType: attachment.type || "application/octet-stream"
          });

        if (uploadError) throw uploadError;
        uploadedPath = path;
      }

      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selected,
          sender_id: user.id,
          content: message.trim(),
          attachment_url: uploadedPath,
          attachment_name: attachment?.name || null
        });

      if (error) throw error;

      setMessage("");
      setAttachment(null);
      await loadMessages(selected);
      await loadChats();
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
      }
      setNotice("ارسال پیام: " + errorText(error));
    } finally {
      setBusy(false);
    }
  }

  function goBack() {
    setMobileChatOpen(false);
    setSelected(null);
  }

  if (!sessionReady) {
    return (
      <div className="app dark" style={{ display: "grid", placeItems: "center" }}>
        <LoaderCircle className="spin" size={34} />
        <p>در حال اتصال به NovaTalk...</p>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`} dir="rtl">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">N</div>
          <div>
            <h1>NovaTalk</h1>
            <span>ارتباط هوشمند و سریع</span>
          </div>
        </div>
        <button className="icon-btn" title="پروفایل"
          onClick={() => setModal("profile")}>
          <MoreVertical />
        </button>
      </header>

      {notice && (
        <div role="status" style={{
          padding: "8px 14px", background: "rgba(118,103,255,.15)",
          color: "var(--text)", fontSize: 12, textAlign: "center"
        }}>
          {notice}
          <button onClick={() => setNotice("")}
            style={{ marginRight: 12, background: "transparent", color: "inherit", border: 0 }}>
            <X size={14} />
          </button>
        </div>
      )}

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
              <button className="new-chat-btn" title="گفتگوی جدید"
                onClick={() => setModal("newchat")}>
                <Plus />
              </button>
            )}
          </div>

          {activeTab === "chats" && (
            <>
              <div className="search-box">
                <Search size={19} />
                <input placeholder="جستجوی گفتگو..."
                  value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={loadChats} title="بروزرسانی"
                  style={{ border: 0, background: "transparent", color: "inherit" }}>
                  <RefreshCw size={15} />
                </button>
              </div>
              <div className="chat-list">
                {loadingChats && chats.length === 0 ? (
                  <div className="empty-state"><LoaderCircle className="spin" /><p>در حال بارگذاری...</p></div>
                ) : filteredChats.length === 0 ? (
                  <div className="empty-state">
                    <MessageCircle size={36} />
                    <h3>هنوز گفتگویی نداری</h3>
                    <p>با نام کاربری یک نفر گفتگوی خصوصی بساز یا گروه جدید ایجاد کن.</p>
                    <button onClick={() => setModal("newchat")}><Plus size={17} /> شروع گفتگو</button>
                  </div>
                ) : filteredChats.map(chat => (
                  <button key={chat.id}
                    className={`chat-item ${selected === chat.id ? "active" : ""}`}
                    onClick={() => {
                      setSelected(chat.id);
                      setMobileChatOpen(true);
                    }}>
                    <div className="avatar" style={{ background: chat.color }}>
                      {chat.avatar}
                    </div>
                    <div className="chat-item-info">
                      <div className="chat-item-top">
                        <strong>{chat.name}</strong>
                        <small>{timeText(chat.lastTime)}</small>
                      </div>
                      <p>{chat.lastText}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === "calls" && (
            <div className="empty-state">
              <Phone size={38} />
              <h3>تماس‌ها</h3>
              <p>قابلیت تماس صوتی و تصویری هنوز به سرویس تماس متصل نشده است.</p>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="empty-state">
              <Users size={38} />
              <h3>مخاطبین</h3>
              <p>برای پیدا کردن افراد، نام کاربری آن‌ها را در گفتگوی خصوصی وارد کن.</p>
              <button onClick={() => { setNewType("private"); setModal("newchat"); }}>
                <UserPlus size={17} /> پیدا کردن کاربر
              </button>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-list">
              <div className="profile-card">
                <div className="profile-avatar">
                  {(profile?.display_name || user.email || "N").slice(0, 1)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong>{profile?.display_name || "کاربر NovaTalk"}</strong>
                  <p style={{ overflowWrap: "anywhere" }}>{user.email}</p>
                  {profile?.username && <small>@{profile.username}</small>}
                </div>
                <button className="icon-btn" onClick={() => setModal("profile")}>
                  <Pencil size={18} />
                </button>
              </div>

              <button className="setting-item" onClick={() => setDarkMode(v => !v)}>
                {darkMode ? <Sun /> : <Moon />}
                <span>تغییر حالت نمایش</span>
              </button>
              <div className="setting-item"><Bell /><span>اعلان‌ها (به‌زودی)</span></div>
              <div className="setting-item"><Shield /><span>حریم خصوصی و امنیت</span></div>
              <button className="setting-item" onClick={signOut}>
                <LogOut /><span>خروج از حساب</span>
              </button>
            </div>
          )}

          <nav className="bottom-nav">
            <button className={activeTab === "chats" ? "active" : ""}
              onClick={() => setActiveTab("chats")}>
              <MessageCircle /><span>گفتگوها</span>
            </button>
            <button className={activeTab === "calls" ? "active" : ""}
              onClick={() => setActiveTab("calls")}>
              <Phone /><span>تماس‌ها</span>
            </button>
            <button className={activeTab === "contacts" ? "active" : ""}
              onClick={() => setActiveTab("contacts")}>
              <Users /><span>مخاطبین</span>
            </button>
            <button className={activeTab === "settings" ? "active" : ""}
              onClick={() => setActiveTab("settings")}>
              <Settings /><span>تنظیمات</span>
            </button>
          </nav>
        </aside>

        <section className="chat-area">
          {current ? (
            <>
              <div className="chat-header">
                <button className="back-btn" onClick={goBack}><ArrowRight /></button>
                <div className="avatar" style={{ background: current.color }}>
                  {current.avatar}
                </div>
                <div className="chat-user" style={{ flex: 1 }}>
                  <strong>{current.name}</strong>
                  <small>{current.type === "group" ? "گروه NovaTalk" : "گفتگوی خصوصی"}</small>
                </div>
                <div className="chat-actions">
                  <button title="تماس صوتی" disabled><Phone /></button>
                  <button title="تماس تصویری" disabled><Video /></button>
                  <button title="اطلاعات گفتگو" onClick={() => setModal("chatinfo")}>
                    <MoreVertical />
                  </button>
                </div>
              </div>

              <div className="messages-area">
                <div className="date-label">پیام‌ها</div>
                {loadingMessages && messages.length === 0 && (
                  <div className="empty-state"><LoaderCircle className="spin" /><p>در حال دریافت پیام‌ها...</p></div>
                )}
                {!loadingMessages && messages.length === 0 && (
                  <div className="chat-welcome">
                    <div className="welcome-logo">N</div>
                    <h3>به NovaTalk خوش آمدی</h3>
                    <p>اولین پیام این گفتگو را ارسال کن.</p>
                  </div>
                )}

                {messages.map(msg => (
                  <div className={`message-row ${msg.mine ? "mine" : "theirs"}`} key={msg.id}>
                    <div className="message-bubble">
                      {msg.fileUrl && msg.attachment_name && (
                        msg.attachment_name.match(/\.(png|jpe?g|gif|webp|bmp)$/i) ? (
                          <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                            <img className="message-image" src={msg.fileUrl} alt="تصویر ارسال‌شده" />
                          </a>
                        ) : (
                          <a href={msg.fileUrl} target="_blank" rel="noreferrer" download={msg.attachment_name}
                            className="file-preview" style={{ color: "inherit", textDecoration: "none" }}>
                            <Paperclip size={20} /> {msg.attachment_name}
                          </a>
                        )
                      )}
                      {msg.attachment_name && !msg.fileUrl && (
                        <div className="file-preview"><Lock size={18} /> فایل در دسترس نیست</div>
                      )}
                      {msg.content && <p>{msg.content}</p>}
                      <time>{timeText(msg.created_at)} {msg.mine && <CheckCheck size={13} />}</time>
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>

              <div className="composer">
                <button className="icon-btn" title="پیوست فایل"
                  onClick={() => fileRef.current?.click()}>
                  <Paperclip />
                </button>
                <input ref={fileRef} type="file" hidden
                  onChange={chooseFile}
                  accept="image/*,.pdf,.txt,.doc,.docx,.zip" />
                <div className="message-input-wrap" style={{ flexDirection: "column", alignItems: "stretch" }}>
                  {attachment && (
                    <div className="attachment-chip">
                      <span>{attachment.name}</span>
                      <button onClick={() => setAttachment(null)}><X size={15} /></button>
                    </div>
                  )}
                  <input value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="پیام خود را بنویسید..."
                    disabled={busy} />
                </div>
                <button className="send-btn" onClick={sendMessage}
                  disabled={busy || (!message.trim() && !attachment)}
                  title="ارسال پیام">
                  {busy ? <LoaderCircle className="spin" size={19} /> : <Send size={20} />}
                </button>
              </div>
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-logo">N</div>
              <h2>NovaTalk</h2>
              <p>یک گفتگوی موجود را انتخاب کن یا گفتگوی جدید بساز.</p>
              <button className="primary-btn" style={{ width: "auto" }}
                onClick={() => setModal("newchat")}>
                <Plus size={18} /> گفتگوی جدید
              </button>
            </div>
          )}
        </section>
      </main>

      {modal && (
        <div className="modal-backdrop" onClick={() => !busy && setModal("")}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modal === "newchat" && "گفتگوی جدید"}
                {modal === "profile" && "پروفایل"}
                {modal === "chatinfo" && "اطلاعات گفتگو"}
              </h3>
              <button className="icon-btn" onClick={() => setModal("")}><X /></button>
            </div>

            {modal === "newchat" && (
              <div className="modal-content">
                <div className="type-select">
                  <button type="button" className={newType === "private" ? "chosen" : ""}
                    onClick={() => setNewType("private")}>
                    <MessageCircle /> خصوصی
                  </button>
                  <button type="button" className={newType === "group" ? "chosen" : ""}
                    onClick={() => setNewType("group")}>
                    <Users /> گروه
                  </button>
                </div>
                <label>{newType === "group" ? "نام گروه" : "نام کاربری مخاطب"}</label>
                <input value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={newType === "group" ? "مثلاً دوستان مدرسه" : "مثلاً ali_123"} />
                {newType === "group" && (
                  <>
                    <label>نام کاربری اعضا (با کاما جدا کن)</label>
                    <input value={memberNames}
                      onChange={e => setMemberNames(e.target.value)}
                      placeholder="ali_123, sara_456" />
                    <small style={{ color: "var(--muted)" }}>
                      اعضا باید قبلاً در NovaTalk ثبت‌نام کرده و نام کاربری داشته باشند.
                    </small>
                  </>
                )}
                <button className="primary-btn" onClick={createChat} disabled={busy}>
                  {busy ? "در حال ساخت..." : "ساخت گفتگو"}
                </button>
              </div>
            )}

            {modal === "profile" && (
              <div className="modal-content">
                <label>نام نمایشی</label>
                <input value={profileName} onChange={e => setProfileName(e.target.value)}
                  placeholder="نامی که دیگران می‌بینند" />
                <label>نام کاربری یکتا</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="مثلاً ali_123" />
                <small style={{ color: "var(--muted)" }}>
                  فقط حروف انگلیسی کوچک، عدد و زیرخط؛ حداقل ۳ حرف.
                </small>
                <button className="primary-btn" onClick={saveProfile} disabled={busy}>
                  {busy ? "در حال ذخیره..." : "ذخیره پروفایل"}
                </button>
              </div>
            )}

            {modal === "chatinfo" && current && (
              <div className="modal-content">
                <div className="profile-card">
                  <div className="avatar" style={{ background: current.color }}>
                    {current.avatar}
                  </div>
                  <strong>{current.name}</strong>
                </div>
                <p>نوع گفتگو: {current.type === "group" ? "گروهی" : "خصوصی"}</p>
                <p style={{ color: "var(--muted)", fontSize: 12 }}>
                  پیام‌ها و فایل‌ها در فضای خصوصی پروژه ذخیره می‌شوند.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: novaSpin 1s linear infinite; }
        @keyframes novaSpin { to { transform: rotate(360deg); } }
        .chat-item { width:100%; border:0; background:transparent; color:var(--text); text-align:right; }
        .chat-item.active { background:rgba(118,103,255,.16); }
        .chat-item-top small { color:var(--muted); font-size:10px; }
        .message-bubble time { display:flex; align-items:center; gap:5px; }
        .message-bubble p { white-space:pre-wrap; margin:0; }
        .composer button:disabled { opacity:.55; cursor:not-allowed; }
        .attachment-chip button { border:0; background:transparent; color:inherit; }
        .empty-state button { display:flex; align-items:center; gap:7px; padding:10px 14px; border:0; border-radius:12px; color:white; background:#6555df; }
        .profile-card p { margin:4px 0; color:var(--muted); font-size:12px; }
        .profile-card small { color:var(--accent-2); }
      `}</style>
    </div>
  );
}
