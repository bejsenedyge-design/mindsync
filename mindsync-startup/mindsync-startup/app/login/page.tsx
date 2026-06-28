"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError("Email немесе құпия сөз қате"); return; }
    if (data.session) { window.location.replace("/chat"); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif", padding:24 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <Link href="/" style={{ fontSize:26, fontWeight:900, color:"#1a1a2e", textDecoration:"none" }}>
            Mind<span style={{ color:"#2563eb" }}>Sync.</span>
          </Link>
          <p style={{ marginTop:8, fontSize:14, color:"#64748b" }}>Аккаунтыңызға кіріңіз</p>
        </div>
        <div style={{ background:"#fff", borderRadius:20, border:"1px solid #e8ecf4", padding:32, boxShadow:"0 4px 32px rgba(0,0,0,0.06)" }}>
          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Email</label>
              <input type="email" required placeholder="email@gmail.com" value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding:"13px 16px", border:"1.5px solid #e2e8f0", borderRadius:12, fontSize:14, fontFamily:"Inter,sans-serif", outline:"none" }} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Құпия сөз</label>
              <input type="password" required placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding:"13px 16px", border:"1.5px solid #e2e8f0", borderRadius:12, fontSize:14, fontFamily:"Inter,sans-serif", outline:"none" }} />
            </div>
            {error && (
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#dc2626" }}>
                ⚠️ {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              style={{ padding:14, background:"#2563eb", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700, fontFamily:"Inter,sans-serif", cursor:"pointer" }}>
              {loading ? "Кіруде..." : "Жүйеге кіру →"}
            </button>
          </form>
        </div>
        <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:"#64748b" }}>
          Аккаунтыңыз жоқ па?{" "}
          <Link href="/register" style={{ color:"#2563eb", fontWeight:700, textDecoration:"none" }}>Тіркелу</Link>
        </p>
      </div>
    </div>
  );
}
