"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type LangType = "kz" | "ru" | "en";

const T = {
  kz: {
    back: "← Чатқа оралу",
    profile: "Профиль",
    edit: "Өңдеу",
    save: "Сақтау",
    cancel: "Болдырмау",
    namePlaceholder: "Атыңыз",
    bioPlaceholder: "Өзіңіз туралы...",
    noBio: "Bio жоқ — өңдеу батырмасын басыңыз",
    nextLevel: "КЕЛЕСІ ДЕҢГЕЙГЕ",
    registered: "Тіркелген",
    stats: "📊 Статистика",
    badges: "🏆 Жетістіктер",
    settings: "⚙️ Баптаулар",
    messages: "Хабарлар",
    streak: "Күн қатар",
    totalXp: "Жалпы XP",
    level: "Деңгей",
    achievements: "Жетістіктер",
    daysSince: "Күн бері",
    levelPath: "🗺️ Деңгей жолы",
    accountSettings: "⚙️ Аккаунт баптаулары",
    email: "Email",
    regDate: "Тіркелген күн",
    logout: "Жүйеден шығу",
    logoutBtn: "Шығу →",
    loading: "Жүктелуде...",
    saving: "Сақталуда...",
    uploadPhoto: "Фото жүктеу",
    darkMode: "Қараңғы тема",
    language: "Тіл",
    notifications: "Хабарламалар",
    on: "Қосулы",
    off: "Өшірулі",
    copyEmail: "Email көшіру",
    copied: "Көшірілді!",
  },
  ru: {
    back: "← Вернуться в чат",
    profile: "Профиль",
    edit: "Редактировать",
    save: "Сохранить",
    cancel: "Отмена",
    namePlaceholder: "Ваше имя",
    bioPlaceholder: "О себе...",
    noBio: "Bio не заполнен — нажмите редактировать",
    nextLevel: "ДО СЛЕДУЮЩЕГО УРОВНЯ",
    registered: "Зарегистрирован",
    stats: "📊 Статистика",
    badges: "🏆 Достижения",
    settings: "⚙️ Настройки",
    messages: "Сообщений",
    streak: "Дней подряд",
    totalXp: "Всего XP",
    level: "Уровень",
    achievements: "Достижения",
    daysSince: "Дней с нами",
    levelPath: "🗺️ Путь уровней",
    accountSettings: "⚙️ Настройки аккаунта",
    email: "Email",
    regDate: "Дата регистрации",
    logout: "Выйти из системы",
    logoutBtn: "Выйти →",
    loading: "Загрузка...",
    saving: "Сохранение...",
    uploadPhoto: "Загрузить фото",
    darkMode: "Тёмная тема",
    language: "Язык",
    notifications: "Уведомления",
    on: "Вкл",
    off: "Выкл",
    copyEmail: "Копировать Email",
    copied: "Скопировано!",
  },
  en: {
    back: "← Back to Chat",
    profile: "Profile",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    namePlaceholder: "Your name",
    bioPlaceholder: "About you...",
    noBio: "No bio — click edit to add one",
    nextLevel: "TO NEXT LEVEL",
    registered: "Registered",
    stats: "📊 Statistics",
    badges: "🏆 Achievements",
    settings: "⚙️ Settings",
    messages: "Messages",
    streak: "Day streak",
    totalXp: "Total XP",
    level: "Level",
    achievements: "Achievements",
    daysSince: "Days with us",
    levelPath: "🗺️ Level Path",
    accountSettings: "⚙️ Account Settings",
    email: "Email",
    regDate: "Registration date",
    logout: "Sign out",
    logoutBtn: "Sign out →",
    loading: "Loading...",
    saving: "Saving...",
    uploadPhoto: "Upload photo",
    darkMode: "Dark mode",
    language: "Language",
    notifications: "Notifications",
    on: "On",
    off: "Off",
    copyEmail: "Copy Email",
    copied: "Copied!",
  },
};

const LEVEL_NAMES = {
  kz: ["Жаңадан бастаушы", "Оқушы", "Білімгер", "Зерттеуші", "Сарапшы", "Шебер"],
  ru: ["Новичок", "Ученик", "Знаток", "Исследователь", "Эксперт", "Мастер"],
  en: ["Beginner", "Student", "Scholar", "Explorer", "Expert", "Master"],
};

const LEVEL_STEPS = {
  kz: ["Жаңа", "Оқушы", "Білімгер", "Зерттеуші", "Сарапшы", "Шебер"],
  ru: ["Новый", "Ученик", "Знаток", "Иссл.", "Эксперт", "Мастер"],
  en: ["New", "Student", "Scholar", "Explorer", "Expert", "Master"],
};

const BADGES_DATA = {
  kz: [
    { id: "first_chat", icon: "💬", label: "Алғашқы чат", desc: "Бірінші хабар жіберді" },
    { id: "level_5", icon: "⭐", label: "5-деңгей", desc: "5-деңгейге жетті" },
    { id: "level_10", icon: "🌟", label: "10-деңгей", desc: "10-деңгейге жетті" },
    { id: "streak_7", icon: "🔥", label: "7 күн қатар", desc: "7 күн үздіксіз" },
    { id: "messages_50", icon: "📚", label: "50 хабар", desc: "50 хабар жіберді" },
    { id: "early", icon: "🚀", label: "Ерте пайдаланушы", desc: "Алғашқылардың бірі" },
  ],
  ru: [
    { id: "first_chat", icon: "💬", label: "Первый чат", desc: "Отправил первое сообщение" },
    { id: "level_5", icon: "⭐", label: "5-й уровень", desc: "Достиг 5-го уровня" },
    { id: "level_10", icon: "🌟", label: "10-й уровень", desc: "Достиг 10-го уровня" },
    { id: "streak_7", icon: "🔥", label: "7 дней подряд", desc: "7 дней без перерыва" },
    { id: "messages_50", icon: "📚", label: "50 сообщений", desc: "Отправил 50 сообщений" },
    { id: "early", icon: "🚀", label: "Ранний пользователь", desc: "Один из первых" },
  ],
  en: [
    { id: "first_chat", icon: "💬", label: "First Chat", desc: "Sent the first message" },
    { id: "level_5", icon: "⭐", label: "Level 5", desc: "Reached level 5" },
    { id: "level_10", icon: "🌟", label: "Level 10", desc: "Reached level 10" },
    { id: "streak_7", icon: "🔥", label: "7-day streak", desc: "7 days in a row" },
    { id: "messages_50", icon: "📚", label: "50 Messages", desc: "Sent 50 messages" },
    { id: "early", icon: "🚀", label: "Early User", desc: "One of the first users" },
  ],
};

function getLevelName(level: number, lang: LangType) {
  const names = LEVEL_NAMES[lang];
  if (level < 3) return names[0];
  if (level < 5) return names[1];
  if (level < 10) return names[2];
  if (level < 20) return names[3];
  if (level < 30) return names[4];
  return names[5];
}

function getLevelColor(level: number) {
  if (level < 3) return "#94a3b8";
  if (level < 5) return "#22c55e";
  if (level < 10) return "#3b82f6";
  if (level < 20) return "#a855f7";
  if (level < 30) return "#f59e0b";
  return "#ef4444";
}

interface Profile {
  id: string; email: string; full_name: string; bio: string;
  avatar_url: string; level: number; xp: number; streak_days: number;
  total_messages: number; badges: string[]; created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [activeTab, setActiveTab] = useState<"stats" | "badges" | "settings">("stats");
  const [lang, setLang] = useState<LangType>("kz");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = T[lang];

  useEffect(() => {
    const saved = localStorage.getItem("profileLang") as LangType;
    if (saved) setLang(saved);
    const dm = localStorage.getItem("darkMode") === "true";
    setDarkMode(dm);
    loadProfile();
  }, []);

  const changeLang = (l: LangType) => {
    setLang(l);
    localStorage.setItem("profileLang", l);
  };

  const toggleDark = () => {
    setDarkMode(d => {
      localStorage.setItem("darkMode", String(!d));
      return !d;
    });
  };

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setProfile({ ...data, email: user.email || "" });
      setEditName(data.full_name || "");
      setEditBio(data.bio || "");
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: editName, bio: editBio }).eq("id", profile.id);
    setProfile(p => p ? { ...p, full_name: editName, bio: editBio } : p);
    setSaving(false);
    setEditing(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar.${ext}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile.id);
    setProfile(p => p ? { ...p, avatar_url: data.publicUrl } : p);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const copyEmail = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bg = darkMode ? "#0f172a" : "#f1f5f9";
  const cardBg = darkMode ? "#1e293b" : "#fff";
  const textMain = darkMode ? "#f1f5f9" : "#0f172a";
  const textMuted = darkMode ? "#94a3b8" : "#64748b";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const statBg = darkMode ? "#0f172a" : "#f8fafc";

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12, display: "inline-block", animation: "spin 1s linear infinite" }}>⚡</div>
        <div style={{ color: textMuted, fontFamily: "Inter,sans-serif" }}>{t.loading}</div>
      </div>
    </div>
  );

  if (!profile) return null;

  const levelColor = getLevelColor(profile.level);
  const levelName = getLevelName(profile.level, lang);
  const xpPercent = profile.xp % 100;
  const badges = BADGE_DATA(lang);
  const earnedBadges = badges.filter(b => profile.badges?.includes(b.id));
  const joinDate = new Date(profile.created_at).toLocaleDateString(
    lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const daysSince = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000);

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Inter',sans-serif", transition: "all 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .anim{animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both}
        .a2{animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.1s both;opacity:0}
        .a3{animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) 0.2s both;opacity:0}
        .tab-btn{padding:10px 18px;border:none;cursor:pointer;font-size:13px;font-weight:700;font-family:Inter,sans-serif;border-radius:10px;transition:all 0.2s;white-space:nowrap}
        .stat-card{border-radius:16px;padding:18px;text-align:center;border:1px solid;transition:all 0.2s;cursor:default}
        .stat-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.1)}
        .badge-card{border-radius:14px;padding:16px;border:1px solid;display:flex;align-items:center;gap:12px;transition:all 0.2s}
        .badge-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,0.08)}
        .badge-locked{opacity:0.3;filter:grayscale(1)}
        .inp{width:100%;padding:12px 16px;border:1.5px solid;border-radius:12px;font-size:14px;font-family:Inter,sans-serif;outline:none;transition:all 0.2s}
        .save-btn{padding:12px 24px;background:#2563eb;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;transition:all 0.2s}
        .save-btn:hover:not(:disabled){background:#1d4ed8;transform:translateY(-1px)}
        .save-btn:disabled{opacity:0.6;cursor:not-allowed}
        .avatar-wrap{position:relative;cursor:pointer;flex-shrink:0}
        .avatar-wrap:hover .av-overlay{opacity:1}
        .av-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;font-size:20px;color:#fff;flex-direction:column;gap:2px}
        .av-overlay span{font-size:10px;font-weight:600}
        .toggle{width:44px;height:24px;border-radius:99px;border:none;cursor:pointer;transition:all 0.25s;position:relative;flex-shrink:0}
        .toggle::after{content:'';position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left 0.25s}
        .lang-pill{display:flex;border-radius:99px;padding:3px;gap:2px}
        .lbtn{padding:5px 12px;border-radius:99px;border:none;cursor:pointer;font-size:12px;font-weight:700;font-family:Inter,sans-serif;transition:all 0.2s}
        .copy-btn{background:none;border:1px solid;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif;font-weight:600;transition:all 0.15s}
        .logout-btn{padding:12px 24px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:12px;font-size:14px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;transition:all 0.2s}
        .logout-btn:hover{background:#fee2e2;transform:translateY(-1px)}
        .setting-row{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid}
        .setting-row:last-child{border-bottom:none}
      `}</style>

      {/* HEADER */}
      <div style={{ background: cardBg, borderBottom: `1px solid ${border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, transition: "all 0.3s" }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 900, color: "#2563eb", textDecoration: "none" }}>
          Mind<span style={{ color: textMain }}>Sync.</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* TІЛ */}
          <div className="lang-pill" style={{ background: statBg, border: `1px solid ${border}` }}>
            {(["kz", "ru", "en"] as LangType[]).map(l => (
              <button key={l} className="lbtn" onClick={() => changeLang(l)}
                style={{ background: lang === l ? "#2563eb" : "transparent", color: lang === l ? "#fff" : textMuted }}>
                {l === "kz" ? "ҚАЗ" : l === "ru" ? "РУС" : "ENG"}
              </button>
            ))}
          </div>
          <Link href="/chat" style={{ color: textMuted, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>{t.back}</Link>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>

        {/* ПРОФИЛЬ КАРТОЧКА */}
        <div className="anim" style={{ background: cardBg, borderRadius: 20, border: `1px solid ${border}`, padding: 28, marginBottom: 18, position: "relative", overflow: "hidden", transition: "all 0.3s", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${levelColor}18, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${levelColor}10, transparent 70%)`, pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap", position: "relative" }}>
            {/* АВАТАР */}
            <div className="avatar-wrap" onClick={() => fileRef.current?.click()}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: `3px solid ${levelColor}` }} />
              ) : (
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: `linear-gradient(135deg, ${levelColor}, ${levelColor}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, color: "#fff", border: `3px solid ${levelColor}` }}>
                  {(profile.full_name || profile.email || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="av-overlay"><span>📷</span><span>{t.uploadPhoto}</span></div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadAvatar} />
            </div>

            {/* INFO */}
            <div style={{ flex: 1, minWidth: 200 }}>
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input className="inp" value={editName} onChange={e => setEditName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    style={{ borderColor: border, background: statBg, color: textMain }} />
                  <textarea className="inp" value={editBio} onChange={e => setEditBio(e.target.value)}
                    placeholder={t.bioPlaceholder} rows={2} style={{ resize: "none", borderColor: border, background: statBg, color: textMain }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="save-btn" onClick={saveProfile} disabled={saving}>{saving ? t.saving : t.save}</button>
                    <button onClick={() => setEditing(false)} style={{ padding: "12px 20px", background: statBg, border: `1px solid ${border}`, borderRadius: 12, cursor: "pointer", fontFamily: "Inter,sans-serif", fontWeight: 600, fontSize: 14, color: textMuted }}>
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: textMain }}>{profile.full_name || "Пайдаланушы"}</h1>
                    <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: 0.45 }}>✏️</button>
                  </div>
                  <div style={{ fontSize: 13, color: textMuted, marginBottom: 6 }}>{profile.email}</div>
                  <div style={{ fontSize: 14, color: textMuted, marginBottom: 12, fontStyle: profile.bio ? "normal" : "italic" }}>
                    {profile.bio || t.noBio}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${levelColor}18`, border: `1px solid ${levelColor}40`, borderRadius: 99, padding: "5px 14px" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: levelColor }}>⚡ {levelName} • {profile.level}-{lang === "kz" ? "деңгей" : lang === "ru" ? "уровень" : "level"}</span>
                  </div>
                </>
              )}
            </div>

            {/* XP */}
            <div style={{ minWidth: 160 }}>
              <div style={{ fontSize: 11, color: textMuted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>{t.nextLevel}</div>
              <div style={{ background: statBg, borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 6, border: `1px solid ${border}` }}>
                <div style={{ height: "100%", width: `${xpPercent}%`, background: `linear-gradient(90deg, ${levelColor}, ${levelColor}bb)`, borderRadius: 99, transition: "width 0.8s ease" }} />
              </div>
              <div style={{ fontSize: 12, color: textMuted, textAlign: "right", marginBottom: 8 }}>{xpPercent} / 100 XP</div>
              <div style={{ fontSize: 12, color: textMuted }}>{t.registered}: {joinDate}</div>
            </div>
          </div>
        </div>

        {/* ТАБТАР */}
        <div className="a2" style={{ display: "flex", gap: 8, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
          {([
            { key: "stats" as const, label: t.stats },
            { key: "badges" as const, label: t.badges },
            { key: "settings" as const, label: t.settings },
          ]).map(tab => (
            <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)}
              style={{ background: activeTab === tab.key ? "#2563eb" : cardBg, color: activeTab === tab.key ? "#fff" : textMuted, border: activeTab === tab.key ? "none" : `1px solid ${border}` }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* СТАТИСТИКА */}
        {activeTab === "stats" && (
          <div className="a3">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 18 }}>
              {[
                { icon: "💬", value: profile.total_messages, label: t.messages, color: "#3b82f6" },
                { icon: "🔥", value: profile.streak_days, label: t.streak, color: "#ef4444" },
                { icon: "⚡", value: profile.xp, label: t.totalXp, color: "#f59e0b" },
                { icon: "🏆", value: profile.level, label: t.level, color: levelColor },
                { icon: "🎖️", value: earnedBadges.length, label: t.achievements, color: "#a855f7" },
                { icon: "📅", value: daysSince, label: t.daysSince, color: "#22c55e" },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ background: cardBg, borderColor: border }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: textMuted, fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ДЕҢГЕЙ ЖОЛЫ */}
            <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${border}`, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: textMain, marginBottom: 20 }}>{t.levelPath}</h3>
              <div style={{ display: "flex", alignItems: "center" }}>
                {[
                  { level: 1, icon: "🌱" },
                  { level: 3, icon: "📖" },
                  { level: 5, icon: "🎓" },
                  { level: 10, icon: "🔬" },
                  { level: 20, icon: "⚡" },
                  { level: 30, icon: "👑" },
                ].map((step, i, arr) => {
                  const reached = profile.level >= step.level;
                  const steps = LEVEL_STEPS[lang];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : undefined }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 42, height: 42, borderRadius: "50%", background: reached ? levelColor : statBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: `2px solid ${reached ? levelColor : border}`, boxShadow: reached ? `0 0 0 4px ${levelColor}20` : "none", transition: "all 0.3s" }}>
                          {step.icon}
                        </div>
                        <div style={{ fontSize: 9, color: reached ? textMain : textMuted, fontWeight: 700, textAlign: "center", whiteSpace: "nowrap" }}>{steps[i]}</div>
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ flex: 1, height: 3, margin: "0 4px", marginBottom: 18, background: profile.level >= arr[i + 1].level ? levelColor : border, borderRadius: 99, transition: "all 0.3s" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ЖЕТІСТІКТЕР */}
        {activeTab === "badges" && (
          <div className="a3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {badges.map(badge => {
              const earned = profile.badges?.includes(badge.id);
              return (
                <div key={badge.id} className={`badge-card ${earned ? "" : "badge-locked"}`}
                  style={{ background: earned ? `${levelColor}08` : cardBg, borderColor: earned ? `${levelColor}40` : border }}>
                  <div style={{ fontSize: 36 }}>{badge.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: textMain }}>{badge.label}</div>
                    <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>{badge.desc}</div>
                    {earned && <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginTop: 4 }}>✓ {lang === "kz" ? "Алынды" : lang === "ru" ? "Получено" : "Earned"}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* БАПТАУЛАР */}
        {activeTab === "settings" && (
          <div className="a3" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${border}`, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: textMain, marginBottom: 16 }}>{t.accountSettings}</h3>

              {/* Email */}
              <div className="setting-row" style={{ borderColor: border }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: textMain }}>{t.email}</div>
                  <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>{profile.email}</div>
                </div>
                <button className="copy-btn" onClick={copyEmail}
                  style={{ borderColor: border, color: copied ? "#22c55e" : textMuted, background: "none" }}>
                  {copied ? t.copied : t.copyEmail}
                </button>
              </div>

              {/* Тіркелген */}
              <div className="setting-row" style={{ borderColor: border }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: textMain }}>{t.regDate}</div>
                  <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>{joinDate}</div>
                </div>
              </div>

              {/* Тіл */}
              <div className="setting-row" style={{ borderColor: border }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: textMain }}>{t.language}</div>
                <div className="lang-pill" style={{ background: statBg, border: `1px solid ${border}` }}>
                  {(["kz", "ru", "en"] as LangType[]).map(l => (
                    <button key={l} className="lbtn" onClick={() => changeLang(l)}
                      style={{ background: lang === l ? "#2563eb" : "transparent", color: lang === l ? "#fff" : textMuted }}>
                      {l === "kz" ? "ҚАЗ" : l === "ru" ? "РУС" : "ENG"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dark mode */}
              <div className="setting-row" style={{ borderColor: border }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: textMain }}>{t.darkMode}</div>
                <button className="toggle" onClick={toggleDark}
                  style={{ background: darkMode ? "#2563eb" : border, paddingLeft: darkMode ? 22 : 2, paddingRight: darkMode ? 2 : 22 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: darkMode ? 23 : 3, transition: "left 0.25s" }} />
                </button>
              </div>

              {/* Хабарламалар */}
              <div className="setting-row" style={{ borderColor: "transparent" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: textMain }}>{t.notifications}</div>
                <button className="toggle" onClick={() => setNotifications(n => !n)}
                  style={{ background: notifications ? "#2563eb" : border }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: notifications ? 23 : 3, transition: "left 0.25s" }} />
                </button>
              </div>
            </div>

            {/* ШЫҒУ */}
            <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${border}`, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626" }}>{t.logout}</div>
                <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>{profile.email}</div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>{t.logoutBtn}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BADGE_DATA(lang: LangType) {
  return BADGES_DATA[lang];
}
