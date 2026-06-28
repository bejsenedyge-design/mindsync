"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type LangType = 'kz' | 'ru' | 'en';

const dict = {
  kz: {
    langLabel: "ҚАЗ",
    login: "Кіру",
    register: "Тіркелу",
    badge: "Жасанды интеллект негізіндегі жеке тәлімгерің",
    h1a: "Білім алудың ",
    h1b: "жаңа көкжиегіне",
    h1c: "қадам бас",
    desc: "MindSync — құрғақ фактілермен емес, тақырыптың мәнін ұғындыратын, күрделі сұрақтарды қарапайым әрі адами тілмен түсіндіретін сенімді серігің.",
    startBtn: "Жаңа парақты ашу →",
    howItWorks: "Қалай жұмыс істейді?",
  },
  ru: {
    langLabel: "РУС",
    login: "Войти",
    register: "Регистрация",
    badge: "Твой личный ИИ-наставник",
    h1a: "Открой для себя ",
    h1b: "новые горизонты",
    h1c: "знаний",
    desc: "MindSync — твой надёжный спутник, который объясняет сложные вещи простым и человечным языком, фокусируясь на сути, а не на сухих фактах.",
    startBtn: "Начать обучение →",
    howItWorks: "Как это работает?",
  },
  en: {
    langLabel: "ENG",
    login: "Log in",
    register: "Sign up",
    badge: "Your personal AI tutor",
    h1a: "Step into a ",
    h1b: "new horizon",
    h1c: "of learning",
    desc: "MindSync is your reliable companion that explains complex topics in a simple, human way — focusing on true understanding rather than dry facts.",
    startBtn: "Start learning →",
    howItWorks: "How it works?",
  },
};

const universities = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1629230571168-120531bdc502?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585868213346-3c2242ea9ce5?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565022536102-f7645c84354a?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532649593139-16a24536f903?q=80&w=1920&auto=format&fit=crop"
];

export default function LandingPage() {
  const [lang, setLang] = useState<LangType>('kz');
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<any[]>([]);
  const [bgIndex, setBgIndex] = useState(0);
  const t = dict[lang];

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);

    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % universities.length);
    }, 15000);

    const p = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      animDuration: Math.random() * 15 + 10,
      animDelay: Math.random() * 5
    }));
    setParticles(p);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setParallax({
        x: (e.clientX - centerX) / 40,
        y: (e.clientY - centerY) / 40
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(bgInterval);
    };
  }, []);

  return (
    <div style={{ minHeight: "100dvh", background: "#020617", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'Inter', sans-serif; background-color: #020617; color: #f8fafc; overflow-x: hidden; }

        /* Modern Blue visual effects */
        .grid-bg {
          position: fixed; inset: -50px;
          background-image:
            linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px);
          background-size: 52px 52px;
          pointer-events: none; z-index: 0;
          transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .glow-1 {
          width: 800px; height: 800px; border-radius: 50%;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 60%);
          pointer-events: none;
          animation: float 10s ease-in-out infinite;
        }
        .glow-2 {
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 60%);
          pointer-events: none;
          animation: float 12s ease-in-out infinite reverse;
        }
        .glow-3 {
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 60%);
          pointer-events: none;
          animation: pulseGlow 8s ease-in-out infinite;
        }

        .cursor-follow {
          position: fixed; top: 0; left: 0; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 50%);
          border-radius: 50%; pointer-events: none; z-index: 1;
          transition: opacity 0.5s ease; will-change: transform;
        }

        /* Particles Effect */
        .particles-container { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .particle {
          position: absolute; background: #38bdf8; border-radius: 50%; opacity: 0.3;
          animation: floatUp linear infinite; box-shadow: 0 0 12px #38bdf8;
        }
        @keyframes floatUp {
          from { transform: translateY(100vh) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          to { transform: translateY(-100px) scale(0.5); opacity: 0; }
        }

        /* Creative Text Hover Effects */
        .hover-text-glow {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: default; display: inline-block;
        }
        .hover-text-glow:hover {
          color: #ffffff !important;
          text-shadow: 0 0 20px rgba(56, 189, 248, 0.9), 0 0 40px rgba(56, 189, 248, 0.5) !important;
          transform: scale(1.02) translateY(-2px);
        }

        /* Animated Gradient for highlighted word */
        .animated-gradient-text {
          background: linear-gradient(270deg, #38bdf8, #bae6fd, #e879f9, #38bdf8);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 6s ease infinite;
          position: relative; display: inline-block; transition: all 0.4s ease;
        }
        .animated-gradient-text:hover {
          transform: scale(1.05) rotate(-1deg);
          -webkit-text-fill-color: #ffffff;
          text-shadow: 0 0 20px rgba(232, 121, 249, 0.8);
        }

        @keyframes subtlePulseRotate {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); filter: invert(1) hue-rotate(180deg) brightness(1.5) contrast(1.5) drop-shadow(0 0 5px rgba(56,189,248,0.3)); }
          50% { transform: translate(-50%, -50%) scale(1.05) rotate(3deg); filter: invert(1) hue-rotate(180deg) brightness(1.8) contrast(1.6) drop-shadow(0 0 15px rgba(56,189,248,0.8)); }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); filter: invert(1) hue-rotate(180deg) brightness(1.5) contrast(1.5) drop-shadow(0 0 5px rgba(56,189,248,0.3)); }
        }
        .animated-logo { animation: subtlePulseRotate 4s ease-in-out infinite; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes blink { 0%,100%{opacity:1; box-shadow: 0 0 10px rgba(56,189,248,0.8);} 50%{opacity:0.4; box-shadow: 0 0 2px rgba(56,189,248,0.3);} }
        @keyframes sweepShine {
          0% { left: -100%; } 20% { left: 100%; } 100% { left: 100%; }
        }

        .a1 { animation: slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .a2 { animation: slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .a3 { animation: slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
        .a4 { animation: slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both; }

        /* ================= РЕСПОНСИВТІ КЛАССТАР (БЕЙІМДЕЛУ) ================= */
        .header-container {
          position: relative; z-index: 10; max-width: 1160px; margin: 0 auto; width: 100%; 
          padding: 22px 32px; display: flex; align-items: center; justify-content: space-between;
        }
        .header-actions {
          display: flex; align-items: center; gap: 20px;
        }
        .hero-container {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; 
          padding: 48px 32px 80px; text-align: center; position: relative; z-index: 1;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 10px; background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(56, 189, 248, 0.3); backdrop-filter: blur(10px); color: #7dd3fc;
          padding: 10px 24px; border-radius: 99px; font-size: 14px; font-weight: 600; margin-bottom: 40px;
          box-shadow: 0 4px 20px rgba(14, 165, 233, 0.15);
        }
        .hero-title {
          font-family: 'Inter', sans-serif; font-size: clamp(36px, 6.5vw, 86px); font-weight: 900; 
          color: #f8fafc; line-height: 1.1; letter-spacing: -2px; margin-bottom: 32px; max-width: 900px; 
          text-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .hero-desc {
          font-size: clamp(16px, 1.9vw, 21px); color: #cbd5e1; max-width: 640px; line-height: 1.8; 
          margin-bottom: 50px; font-weight: 400; font-family: 'Inter', sans-serif; text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }
        .btn-wrapper {
          display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; width: 100%;
        }

        .lang-pill { 
          display:flex; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(51, 65, 85, 0.8);
          backdrop-filter: blur(8px); border-radius:99px; padding:4px; gap:2px; 
        }
        .lbtn {
          padding: 6px 16px; border-radius: 99px; border: none; cursor: pointer;
          font-size: 12px; font-weight: 700; font-family: 'Inter', sans-serif; transition: all 0.3s;
        }

        .start-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #0EA5E9, #3B82F6); color: #fff;
          padding: 18px 42px; border-radius: 99px; font-weight: 800; font-size: 17px; 
          text-decoration: none; border: none; cursor: pointer; transition: all 0.3s;
          box-shadow: 0 8px 32px rgba(14,165,233,0.4), inset 0 2px 0 rgba(255,255,255,0.2);
          position: relative; overflow: hidden; text-align: center;
        }
        .start-btn::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg); animation: sweepShine 4s infinite;
        }
        .start-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 40px rgba(14,165,233,0.6); }

        .how-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 18px 42px; border-radius: 99px; font-weight: 700; font-size: 17px; 
          background: rgba(15, 23, 42, 0.4); color: #e2e8f0; border: 1px solid rgba(56, 189, 248, 0.3); 
          backdrop-filter: blur(8px); cursor: pointer; transition: all 0.3s; text-align: center;
        }
        .how-btn:hover { border-color: rgba(56, 189, 248, 0.8); background: rgba(30, 41, 59, 0.8); transform: translateY(-2px); }

        .nav-link { color: #cbd5e1; font-weight: 600; font-size: 15px; text-decoration: none; transition: all 0.2s; }
        .nav-link:hover { color: #38bdf8; }
        
        .register-btn {
          background: rgba(37, 99, 235, 0.1); color: #38bdf8; padding: 10px 22px; border-radius: 10px; 
          font-weight: 700; font-size: 14px; text-decoration: none; transition: all 0.3s; border: 1px solid rgba(56, 189, 248, 0.4);
        }

        /* 📱 ТЕЛЕФОНҒА АРНАЛҒАН БЕЙІМДЕЛУ (MOBILE STYLES) */
        @media (max-width: 768px) {
          .header-container { flex-direction: column; gap: 16px; padding: 16px; }
          .header-actions { width: 100%; justify-content: center; flex-wrap: wrap; gap: 12px; }
          .hero-container { padding: 24px 16px 80px; }
          
          .hero-badge { font-size: 12px; padding: 8px 16px; margin-bottom: 24px; text-align: left; }
          .hero-title { font-size: 38px; letter-spacing: -1px; margin-bottom: 20px; line-height: 1.15; }
          .hero-desc { font-size: 15px; margin-bottom: 32px; padding: 0 10px; }
          
          .btn-wrapper { flex-direction: column; width: 100%; gap: 12px; }
          .start-btn, .how-btn { width: 100%; padding: 16px 24px; font-size: 16px; }
          
          .glow-1 { width: 300px; height: 300px; }
          .glow-2 { width: 250px; height: 250px; }
          .glow-3 { width: 200px; height: 200px; }
          
          .logo-container { width: 45px !important; height: 45px !important; }
          .nav-link { font-size: 14px; }
        }
      `}</style>

      {mounted && universities.map((url, index) => (
        <div
          key={url}
          style={{
            position: 'fixed', inset: 0, zIndex: 0,
            backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: bgIndex === index ? 0.35 : 0,
            transform: bgIndex === index ? 'scale(1.05)' : 'scale(1)',
            transition: 'opacity 0.3s ease-in-out, transform 15s linear',
            mixBlendMode: 'screen',
            WebkitMaskImage: 'radial-gradient(circle at center, black 10%, transparent 90%)',
            maskImage: 'radial-gradient(circle at center, black 10%, transparent 90%)',
            pointerEvents: 'none'
          }}
        />
      ))}

      {mounted && (
        <div className="particles-container">
          {particles.map(p => (
            <div key={p.id} className="particle" style={{
              left: p.left, top: p.top, width: p.size, height: p.size,
              animationDuration: `${p.animDuration}s`, animationDelay: `${p.animDelay}s`
            }} />
          ))}
        </div>
      )}

      <div className="grid-bg" style={{ transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)` }} />

      <div style={{ position: 'fixed', top: -250, right: -200, zIndex: 0, transform: `translate(${parallax.x * 1.5}px, ${parallax.y * 1.5}px)`, transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
        <div className="glow-1" />
      </div>

      <div style={{ position: 'fixed', bottom: -200, left: -150, zIndex: 0, transform: `translate(${parallax.x * -1.5}px, ${parallax.y * -1.5}px)`, transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
        <div className="glow-2" />
      </div>

      <div style={{ position: 'fixed', top: '40%', left: '50%', zIndex: 0, transform: `translate(-50%, -50%) translate(${parallax.x * 2}px, ${parallax.y * 2}px)`, transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
        <div className="glow-3" />
      </div>

      <div className="cursor-follow" style={{
        transform: `translate(calc(${mousePos.x}px - 50%), calc(${mousePos.y}px - 50%))`,
        opacity: mounted && mousePos.x !== -1000 ? 1 : 0
      }} />

      {/* HEADER */}
      <header className="header-container">
        <div className="hover-text-glow" style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}>
          <div className="logo-container" style={{ position: "relative", width: "55px", height: "55px" }}>
            <img
              src="/logo.png.png"
              alt="MindSync Logo"
              className="animated-logo"
              style={{
                position: "absolute", top: "50%", left: "50%", width: "250%", height: "250%",
                maxWidth: "none", objectFit: "contain", mixBlendMode: "screen",
                filter: "invert(1) hue-rotate(180deg) brightness(1.5) contrast(1.5) drop-shadow(0 0 5px rgba(56,189,248,0.3))"
              }}
            />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#f8fafc", letterSpacing: -0.5, fontFamily: "'Inter',sans-serif", zIndex: 2 }}>
            Mind<span style={{ color: "#38bdf8", textShadow: "0 0 20px rgba(56,189,248,0.8)" }}>Sync.</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="lang-pill">
            {(["kz", "ru", "en"] as LangType[]).map((l) => (
              <button key={l} className="lbtn" onClick={() => setLang(l)}
                style={{
                  background: lang === l ? "linear-gradient(135deg, #2563EB, #0EA5E9)" : "transparent",
                  color: lang === l ? "#ffffff" : "#94a3b8",
                  boxShadow: lang === l ? "0 2px 10px rgba(37,99,235,0.4)" : "none"
                }}>
                {dict[l].langLabel}
              </button>
            ))}
          </div>
          <Link href="/login" className="nav-link">{t.login}</Link>
          <Link href="/register" className="register-btn">{t.register}</Link>
        </div>
      </header>

      {/* HERO */}
      <main className="hero-container" style={{
        transform: `perspective(1000px) rotateX(${parallax.y * -0.05}deg) rotateY(${parallax.x * 0.05}deg)`,
        transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}>
        
        {/* BADGE */}
        <div className={`hero-badge ${mounted ? "a1" : ""} hover-text-glow`}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8", animation: "blink 2s infinite" }} />
          {t.badge}
        </div>

        {/* ТАҚЫРЫП */}
        <h1 className={`hero-title ${mounted ? "a2" : ""}`}>
          <span className="hover-text-glow">{t.h1a}</span>
          <span className="animated-gradient-text" style={{ padding: "0 8px" }}>
            {t.h1b}
            <span style={{
              position: "absolute", bottom: -4, left: 0, right: 0, height: 6,
              background: "linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)",
              borderRadius: 99, opacity: 0.8, filter: "blur(2px)", pointerEvents: "none"
            }} />
          </span>
          <br />
          <span className="hover-text-glow">{t.h1c}</span>
        </h1>

        {/* СИПАТТАМА */}
        <p className={`hero-desc ${mounted ? "a3" : ""} hover-text-glow`}>
          {t.desc}
        </p>

        {/* БАТЫРМАЛАР */}
        <div className={`btn-wrapper ${mounted ? "a4" : ""}`}>
          <Link href="/chat" className="start-btn">{t.startBtn}</Link>
          <button className="how-btn">{t.howItWorks}</button>
        </div>

      </main>
    </div>
  );
}
