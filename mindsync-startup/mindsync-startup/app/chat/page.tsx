"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type LangType = 'kz' | 'ru' | 'en';

interface Dictionary {
  langLabel: string;
  newChat: string;
  subjects: string;
  math: string;
  physics: string;
  history: string;
  chemistry: string;
  biology: string;
  inputPlaceholder: string;
  aiGreeting: string;
  credits: string;
  thinking: string;
  clearChat: string;
  copyBtn: string;
  copied: string;
}

const dict: Record<LangType, Dictionary> = {
  kz: {
    langLabel: "ҚАЗ", newChat: "+ Жаңа чат", subjects: "Пәндер",
    math: "Математика", physics: "Физика", history: "Тарих",
    chemistry: "Химия", biology: "Биология",
    inputPlaceholder: "Сұрақ қойыңыз...",
    aiGreeting: "Сәлем! Мен MindSync AI. Бүгін не үйренгіңіз келеді? 🚀",
    credits: "MindSync AI • Құнанов Ердәулет",
    thinking: "Ойлануда", clearChat: "Тазарту",
    copyBtn: "Көшіру", copied: "Көшірілді!",
  },
  ru: {
    langLabel: "РУС", newChat: "+ Новый чат", subjects: "Предметы",
    math: "Математика", physics: "Физика", history: "История",
    chemistry: "Химия", biology: "Биология",
    inputPlaceholder: "Задайте вопрос...",
    aiGreeting: "Привет! Я MindSync AI. Что изучаем сегодня? 🚀",
    credits: "MindSync AI • Кунанов Ердаулет",
    thinking: "Думаю", clearChat: "Очистить",
    copyBtn: "Копировать", copied: "Скопировано!",
  },
  en: {
    langLabel: "ENG", newChat: "+ New chat", subjects: "Subjects",
    math: "Mathematics", physics: "Physics", history: "History",
    chemistry: "Chemistry", biology: "Biology",
    inputPlaceholder: "Ask a question...",
    aiGreeting: "Hello! I'm MindSync AI. What shall we learn today? 🚀",
    credits: "MindSync AI • Kunanov Erdaulet",
    thinking: "Thinking", clearChat: "Clear",
    copyBtn: "Copy", copied: "Copied!",
  },
};

const SUBJECTS: { icon: string; key: keyof Dictionary }[] = [
  { icon: "📐", key: "math" },
  { icon: "⚛️", key: "physics" },
  { icon: "🏛️", key: "history" },
  { icon: "🧪", key: "chemistry" },
  { icon: "🌿", key: "biology" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  timestamp: Date;
}

interface Session {
  id: string;
  title: string;
  updated_at: string;
}

interface UserProfile {
  full_name: string;
  avatar_url: string;
  level: number;
  xp: number;
  email: string;
}

function getLevelColor(level: number) {
  if (level < 3) return "#94a3b8";
  if (level < 5) return "#22c55e";
  if (level < 10) return "#3b82f6";
  if (level < 20) return "#a855f7";
  return "#f59e0b";
}

function formatContent(text: string) {
  const cleaned = text
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^[-–]\s+/gm, "• ")
    .trim();

  return cleaned.split("\n").map((line, i) => {
    if (line === "") return <div key={i} style={{ height: 6 }} />;
    if (line.startsWith("• "))
      return (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
          <span style={{ color: "#2563EB", flexShrink: 0 }}>•</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    if (/^\d+\.\s/.test(line))
      return (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
          <span style={{ color: "#2563EB", flexShrink: 0, fontWeight: 600 }}>
            {line.match(/^\d+/)?.[0]}.
          </span>
          <span>{line.replace(/^\d+\.\s/, "")}</span>
        </div>
      );
    return <div key={i} style={{ marginBottom: 2 }}>{line}</div>;
  });
}

const SUBJECT_MSGS: Record<LangType, Record<string, string>> = {
  kz: {
    Математика: "Математика бойынша сұрақтарға дайынмын! Не үйренгіңіз келеді?",
    Физика: "Физика бойынша дайынмын! Қандай тақырыпты талдаймыз?",
    Тарих: "Тарих бойынша дайынмын! Қандай кезеңді зерттейміз?",
    Химия: "Химия бойынша дайынмын! Қандай тақырыпты талдаймыз?",
    Биология: "Биология бойынша дайынмын! Не үйренгіңіз келеді?",
  },
  ru: {
    Математика: "Готов по математике! Что изучаем?",
    Физика: "Готов по физике! Какую тему разбираем?",
    История: "Готов по истории! Какой период изучаем?",
    Химия: "Готов по химии! Что изучаем?",
    Биология: "Готов по биологии! Что изучаем?",
  },
  en: {
    Mathematics: "Ready for math! What shall we study?",
    Physics: "Ready for physics! What topic shall we explore?",
    History: "Ready for history! Which period shall we study?",
    Chemistry: "Ready for chemistry! What shall we study?",
    Biology: "Ready for biology! What shall we learn?",
  },
};

export default function ChatPage() {
  const router = useRouter();
  const [lang, setLang] = useState<LangType>("kz");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: dict.kz.aiGreeting, id: "welcome", timestamp: new Date() },
  ]);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  // ЖАҢА: inputRef-ті textarea-ға өзгерттік
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const t = dict[lang];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from("profiles")
      .select("full_name,avatar_url,level,xp")
      .eq("id", user.id).single();
    if (data) setUserProfile({ ...data, email: user.email || "" });
    loadSessions(user.id);
  };

  const loadSessions = async (uid: string) => {
    const { data } = await supabase.from("chat_sessions")
      .select("id,title,updated_at")
      .eq("user_id", uid)
      .order("updated_at", { ascending: false })
      .limit(20);
    if (data) setSessions(data);
  };

  const createSession = async (firstMsg: string): Promise<string | null> => {
    if (!userId) return null;
    const title = firstMsg.slice(0, 40) + (firstMsg.length > 40 ? "..." : "");
    const { data } = await supabase.from("chat_sessions")
      .insert({ user_id: userId, title }).select().single();
    if (data) { setSessions(prev => [data, ...prev]); return data.id; }
    return null;
  };

  const saveMessage = async (sessionId: string, role: string, content: string) => {
    if (!userId) return;
    await supabase.from("chat_messages")
      .insert({ session_id: sessionId, user_id: userId, role, content });
    await supabase.from("chat_sessions")
      .update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
  };

  const loadSession = async (session: Session) => {
    setCurrentSessionId(session.id);
    setActiveSubject(null);
    setSidebarOpen(false);
    const { data } = await supabase.from("chat_messages")
      .select("*").eq("session_id", session.id)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        id: m.id,
        timestamp: new Date(m.created_at),
      })));
    }
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    await supabase.from("chat_sessions").delete().eq("id", sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) handleClear();
  };

  const changeLang = (l: LangType) => {
    setLang(l);
    setMessages([{ role: "assistant", content: dict[l].aiGreeting, id: "w-" + l, timestamp: new Date() }]);
    setActiveSubject(null);
    setSidebarOpen(false);
  };

  const handleSubject = (label: string) => {
    setActiveSubject(label);
    const msg = SUBJECT_MSGS[lang][label] || `${label} бойынша дайынмын!`;
    setMessages((prev) => [...prev, { role: "assistant", content: msg, id: Date.now().toString(), timestamp: new Date() }]);
    setSidebarOpen(false);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setCurrentSessionId(null);
    setMessages([{ role: "assistant", content: t.aiGreeting, id: "w-clear", timestamp: new Date() }]);
    setActiveSubject(null);
    setSidebarOpen(false);
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    
    // ЖАҢА: Жіберген соң жолақтың размерін қайта қалпына келтіру
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    const userMsg: Message = { role: "user", content: msg, id: Date.now().toString(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    let sessionId = currentSessionId;
    if (!sessionId && userId) {
      sessionId = await createSession(msg);
      setCurrentSessionId(sessionId);
    }
    if (sessionId) await saveMessage(sessionId, "user", msg);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: messages.map((m) => ({ role: m.role, content: m.content })), lang }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : "Қате орын алды.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, id: Date.now() + "-ai", timestamp: new Date() }]);

      if (sessionId) {
        await saveMessage(sessionId, "assistant", reply);
        if (userId) loadSessions(userId);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Серверге қосылу мүмкін емес.", id: Date.now() + "-err", timestamp: new Date() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const goToProfile = () => { router.push('/profile'); };

  const levelColor = userProfile ? getLevelColor(userProfile.level) : "#2563eb";
  const displayName = userProfile?.full_name || userProfile?.email?.split("@")[0] || "";
  const initials = displayName[0]?.toUpperCase() || "👤";

  return (
    <div className="layout-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        /* Скролл дизайны */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }

        /* ЖАҢА: 100dvh телефондағы Safari/Chrome панельдерін ескереді */
        .layout-container { display: flex; height: 100dvh; background: #fff; font-family: 'Inter', sans-serif; position: relative; overflow: hidden; }
        
        /* Sidebar іші толықтай скроллданатын етіп жасалды */
        .sidebar { width: 260px; display: flex; flex-direction: column; background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 22px 14px; flex-shrink: 0; z-index: 40; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow-y: auto; overflow-x: hidden; }
        .main-chat { flex: 1; display: flex; flex-direction: column; overflow: hidden; width: 100%; position: relative; background: #ffffff; }
        .menu-btn { display: none; background: none; border: none; font-size: 26px; cursor: pointer; color: #0f172a; padding: 4px 12px 4px 0; transition: transform 0.2s; }
        .menu-btn:active { transform: scale(0.9); }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); z-index: 30; opacity: 0; transition: opacity 0.3s; pointer-events: none; backdrop-filter: blur(2px); }

        .anim { animation: fadeUp 0.25s ease; }
        .dot { width: 7px; height: 7px; border-radius: 50%; background: #94a3b8; animation: bounce 1.2s infinite; }
        .sbtn { background: none; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; cursor: pointer; font-size: 14px; font-family: Inter, sans-serif; font-weight: 500; color: #1e293b; transition: all 0.18s; display: flex; align-items: center; gap: 8px; width: 100%; }
        .sbtn:hover, .sbtn.active { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
        .cpbtn { background: none; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; color: #94a3b8; font-family: Inter, sans-serif; transition: all 0.15s; opacity: 0; }
        .cpbtn:hover { color: #2563eb; border-color: #2563eb; }
        .mwrap:hover .cpbtn { opacity: 1; }
        .lbtn { padding: 6px 12px; border-radius: 99px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; font-family: Inter, sans-serif; transition: all 0.2s; flex: 1; }
        
        .sndbtn { width: 42px; height: 42px; border-radius: 50%; border: none; cursor: pointer; background: #2563eb; color: #fff; font-size: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.18s; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }
        .sndbtn:hover { background: #1d4ed8; transform: scale(1.05); }
        .sndbtn:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }
        .clrbtn { background: none; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; font-size: 12px; cursor: pointer; color: #64748b; font-family: Inter, sans-serif; transition: all 0.15s; }
        .clrbtn:hover { border-color: #ef4444; color: #ef4444; }

        .profile-fab { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #1d4ed8); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4); transition: all 0.25s ease; z-index: 100; overflow: hidden; border: 2px solid #fff; }
        .profile-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(37, 99, 235, 0.6); }
        
        .session-item { display: flex; align-items: center; gap: 6px; padding: 10px; border-radius: 10px; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; width: 100%; background: none; font-family: Inter,sans-serif; }
        .session-item:hover { background: #eff6ff; border-color: #dbeafe; }
        .session-item.active { background: #eff6ff; border-color: #2563eb; }
        .del-btn { background: none; border: none; cursor: pointer; color: #94a3b8; font-size: 14px; padding: 4px; border-radius: 6px; transition: all 0.15s; flex-shrink: 0; opacity: 0; display: flex; align-items: center; justify-content: center; }
        .session-item:hover .del-btn { opacity: 1; }
        .del-btn:hover { color: #ef4444; background: #fee2e2; }

        /* 📱 МОБИЛЬДІ БЕЙІМДЕЛУ */
        @media (max-width: 768px) {
          .sidebar { position: absolute; height: 100dvh; transform: translateX(-100%); box-shadow: 4px 0 24px rgba(0,0,0,0.1); }
          .sidebar.open { transform: translateX(0); }
          .menu-btn { display: block; }
          .sidebar-overlay.open { display: block; opacity: 1; pointer-events: auto; }
          .chat-header { padding: 10px 16px !important; }
          .chat-messages { padding: 16px 12px 0 !important; }
          .chat-input-area { padding: 10px 12px 14px !important; }
          .msg-bubble { max-width: 92% !important; font-size: 14px !important; padding: 12px 14px !important; }
          .cpbtn { opacity: 1; padding: 6px 10px; font-size: 12px; } /* Телефонда кнопка үлкенірек және үнемі көрінеді */
          
          /* ЖАҢА: Safari/iOS үшін input zoom мәселесін шешу */
          .chat-textarea { font-size: 16px !important; } 
          .profile-fab { bottom: 90px; right: 16px; width: 50px; height: 50px; font-size: 20px; }
          .del-btn { opacity: 1; }
        }
      `}</style>

      {/* 📱 Қараңғы фон */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: "#2563eb", textDecoration: "none", paddingLeft: 4, letterSpacing: -0.5 }}>MindSync.</Link>
          <button className="menu-btn" style={{ padding: 0, fontSize: 32, lineHeight: 1 }} onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <button onClick={handleClear} style={{ width: "100%", padding: "14px 16px", background: "#2563eb", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#fff", marginBottom: 20, fontFamily: "Inter,sans-serif", boxShadow: "0 4px 12px rgba(37,99,235,0.2)", transition: "all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {t.newChat}
        </button>

        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingLeft: 4 }}>{t.subjects}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SUBJECTS.map((s) => {
            const label = t[s.key] as string;
            return <button key={s.key} className={`sbtn${activeSubject === label ? " active" : ""}`} onClick={() => handleSubject(label)}>{s.icon} <span style={{ marginLeft: 4 }}>{label}</span></button>;
          })}
        </div>

        {/* ЧАТ ТАРИХЫ */}
        {sessions.length > 0 && (
          <div style={{ marginTop: 24, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingLeft: 4 }}>
              {lang === "kz" ? "Тарих" : lang === "ru" ? "История" : "History"}
            </p>
            {/* Осы жердегі overflowY скроллды мүмкін етеді */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", flex: 1, paddingRight: 4 }}>
              {sessions.map(session => (
                <button key={session.id} className={`session-item${currentSessionId === session.id ? " active" : ""}`} onClick={() => loadSession(session)}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>💬</span>
                  <div style={{ flex: 1, minWidth: 0, textAlign: "left", marginLeft: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.title}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                      {new Date(session.updated_at).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <button className="del-btn" onClick={(e) => deleteSession(e, session.id)}>🗑</button>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          {/* ПРОФИЛЬ КАРТОЧКАСЫ */}
          {userProfile && (
            <button onClick={goToProfile} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, cursor: "pointer", marginBottom: 16, width: "100%", fontFamily: "Inter,sans-serif", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
              {userProfile.avatar_url ? (
                <img src={userProfile.avatar_url} alt="av" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${levelColor}`, flexShrink: 0 }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${levelColor},${levelColor}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0, border: "2px solid #fff", boxShadow: "0 0 0 2px " + levelColor }}>{initials}</div>
              )}
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
                <div style={{ fontSize: 11, color: levelColor, fontWeight: 700, marginTop: 2 }}>⚡ {userProfile.level}-lv • {userProfile.xp} XP</div>
              </div>
              <span style={{ fontSize: 14, color: "#94a3b8" }}>→</span>
            </button>
          )}

          {/* ТІЛ АУЫСТЫРУ */}
          <div style={{ background: "#e2e8f0", borderRadius: 99, padding: 4, display: "flex" }}>
            {(["kz", "ru", "en"] as LangType[]).map((l) => (
              <button key={l} className="lbtn" onClick={() => changeLang(l)} style={{ background: lang === l ? "#fff" : "transparent", color: lang === l ? "#2563eb" : "#64748b", boxShadow: lang === l ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}>{dict[l].langLabel}</button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-chat">
        {/* HEADER */}
        <div className="chat-header" style={{ padding: "14px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>AI</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: -0.3 }}>MindSync AI</div>
                <div style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 5, fontWeight: 500, marginTop: 2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} /> Online
                </div>
              </div>
            </div>
          </div>
          <button className="clrbtn" onClick={handleClear}>{t.clearChat}</button>
        </div>

        {/* MESSAGES */}
        <div className="chat-messages" style={{ flex: 1, overflowY: "auto", padding: "24px 24px 0", scrollBehavior: "smooth" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, paddingBottom: 30 }}>
            {messages.map((msg) => (
              <div key={msg.id} className="anim mwrap" style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexDirection: msg.role === "user" ? "row-reverse" : "row", width: "100%", justifyContent: msg.role === "user" ? "flex-start" : "flex-start" }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, boxShadow: "0 2px 6px rgba(37,99,235,0.2)" }}>AI</div>
                  )}
                  {msg.role === "user" && userProfile && (
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${levelColor},${levelColor}cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: `0 2px 6px ${levelColor}55` }}>{initials}</div>
                  )}
                  <div className="msg-bubble" style={{ padding: "14px 18px", borderRadius: msg.role === "user" ? "22px 22px 6px 22px" : "22px 22px 22px 6px", background: msg.role === "user" ? "#2563eb" : "#f1f5f9", color: msg.role === "user" ? "#fff" : "#0f172a", fontSize: 15, lineHeight: 1.6, boxShadow: msg.role === "user" ? "0 4px 12px rgba(37,99,235,0.2)" : "0 2px 6px rgba(0,0,0,0.02)", overflowWrap: "anywhere", maxWidth: "80%" }}>
                    {msg.role === "assistant" ? formatContent(msg.content) : msg.content}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, paddingLeft: msg.role === "assistant" ? 40 : 0, paddingRight: msg.role === "user" ? 40 : 0 }}>
                  <span style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>{msg.timestamp.toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit" })}</span>
                  {msg.role === "assistant" && msg.id !== "welcome" && !msg.id.startsWith("w-") && (
                    <button className="cpbtn" onClick={() => handleCopy(msg.id, msg.content)}>{copiedId === msg.id ? t.copied : t.copyBtn}</button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="anim" style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>AI</div>
                <div className="msg-bubble" style={{ padding: "16px 20px", background: "#f1f5f9", borderRadius: "22px 22px 22px 6px", display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="dot" style={{ animationDelay: "0ms" }} />
                  <div className="dot" style={{ animationDelay: "150ms" }} />
                  <div className="dot" style={{ animationDelay: "300ms" }} />
                  <span style={{ fontSize: 14, color: "#64748b", marginLeft: 8, fontWeight: 500 }}>{t.thinking}...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* INPUT АЙМАҒЫ */}
        <div className="chat-input-area" style={{ padding: "16px 24px 24px", background: "linear-gradient(to top, #ffffff 80%, rgba(255,255,255,0))", zIndex: 10 }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 28, padding: "8px 8px 8px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", transition: "all 0.2s" }}
              onFocusCapture={e => e.currentTarget.style.borderColor = "#2563eb"}
              onBlurCapture={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            >
              {/* ЖАҢА: Ақылды Textarea қосылды */}
              <textarea
                className="chat-textarea"
                ref={inputRef}
                value={input}
                rows={1}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => { 
                  if (e.key === "Enter" && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleSend(); 
                  } 
                }}
                placeholder={loading ? `${t.thinking}...` : t.inputPlaceholder}
                disabled={loading}
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 15, color: "#0f172a", fontFamily: "Inter,sans-serif", padding: "10px 0", resize: "none", overflowY: "auto", maxHeight: "120px", lineHeight: "1.5" }}
              />
              <button className="sndbtn" onClick={handleSend} disabled={!input.trim() || loading}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L12 20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "#cbd5e1", marginTop: 12, fontWeight: 500 }}>{t.credits}</p>
          </div>
        </div>
      </div>

      <button className="profile-fab fab-animation" onClick={goToProfile} title="Профильге өту">
        {userProfile?.avatar_url ? (
          <img src={userProfile.avatar_url} alt="av" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
        ) : (
          <span>{initials || "👤"}</span>
        )}
      </button>
    </div>
  );
}
