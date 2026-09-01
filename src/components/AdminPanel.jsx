// src/components/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import AdminRequestsTab from './AdminRequestsTab.jsx';
import AdminPdfsTab from './AdminPdfsTab.jsx';

const API = import.meta.env.VITE_API_URL || "https://studynexusbackend.vercel.app";
const S = {
  bg: "#090d16",
  surface: "#0d1322",
  card: "#111827",
  card2: "#0f1923",
  border: "#1e2a3a",
  border2: "#243044",
  text: "#e2e8f0",
  muted: "#64748b",
  muted2: "#94a3b8",
  accent: "#3b82f6",
  accentGlow: "rgba(59,130,246,0.15)",
  danger: "#ef4444",
  success: "#10b981",
  warning: "#f59e0b",
  input: "#0a1120",
  purple: "#8b5cf6",
};

const getToken = () => localStorage.getItem("admin_token");

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("admin_token");
    window.location.reload();
    return;
  }
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function Input({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        boxSizing: "border-box",
        background: S.input,
        border: `1px solid ${S.border}`,
        borderRadius: "8px",
        padding: "9px 12px",
        color: S.text,
        fontSize: "14px",
        outline: "none",
        ...style,
      }}
    />
  );
}

function Btn({ children, danger, warning, ...props }) {
  const color = danger ? S.danger : warning ? S.warning : S.accent;
  return (
    <button
      {...props}
      style={{
        padding: "9px 18px",
        borderRadius: "8px",
        border: `1px solid ${color}`,
        background: "transparent",
        color,
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        opacity: props.disabled ? 0.5 : 1,
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}

function Badge({ children, color = S.accent }) {
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: color + "22", color, border: `1px solid ${color}44`, letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, color = S.accent, icon }) {
  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: "14px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: color + "08", borderRadius: "0 14px 0 80px" }} />
      <p style={{ fontSize: "12px", color: S.muted, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
      <p style={{ fontSize: "36px", fontWeight: 700, margin: 0, color, lineHeight: 1 }}>{value ?? "—"}</p>
      {icon && <p style={{ fontSize: "24px", position: "absolute", top: "1rem", right: "1rem", margin: 0, opacity: 0.5 }}>{icon}</p>}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const data = await apiFetch("/api/admin/login", { method: "POST", body: JSON.stringify(form) });
      localStorage.setItem("admin_token", data.token);
      onLogin();
    } catch { setError("Invalid credentials"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: S.bg, backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)" }}>
      <div style={{ background: S.card, border: `1px solid ${S.border2}`, borderRadius: "20px", padding: "2.5rem", width: "100%", maxWidth: "400px", boxShadow: "0 0 60px rgba(59,130,246,0.08)" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
            <div style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: "18px", boxShadow: "0 0 20px rgba(37,99,235,0.4)" }}>Ω</div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: S.text }}>StudyNexus</p>
              <p style={{ margin: 0, fontSize: "11px", color: S.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin Portal</p>
            </div>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, margin: "0 0 4px", color: S.text }}>Welcome back</h1>
          <p style={{ fontSize: "13px", color: S.muted, margin: 0 }}>Sign in to manage your platform</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: S.muted2, marginBottom: "6px", display: "block" }}>Username</label>
            <Input placeholder="Enter username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: S.muted2, marginBottom: "6px", display: "block" }}>Password</label>
            <Input type="password" placeholder="Enter password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          {error && (
            <div style={{ padding: "10px 12px", background: S.danger + "15", border: `1px solid ${S.danger}44`, borderRadius: "8px", fontSize: "13px", color: S.danger }}>
              {error}
            </div>
          )}
          <button onClick={submit} disabled={loading} style={{ padding: "11px", borderRadius: "10px", background: loading ? S.accent + "80" : "linear-gradient(135deg, #2563eb, #06b6d4)", border: "none", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", marginTop: "4px", transition: "all 0.2s", boxShadow: "0 0 20px rgba(37,99,235,0.3)" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── OVERVIEW / STATS TAB ──────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([
    { label: "Frontend", sub: "Vercel · React + Vite", status: "checking" },
    { label: "Backend", sub: "Vercel · Node + Express", status: "checking" },
    { label: "Database", sub: "MongoDB Atlas", status: "checking" },
    { label: "AI (Sarah)", sub: "Gemini API", status: "checking" },
    { label: "Storage", sub: "Cloudinary", status: "checking" },
  ]);

  const checkServices = async () => {
    setServices(s => s.map(svc => ({ ...svc, status: "checking" })));
    const results = await Promise.allSettled([
      fetch("https://studynexus-psi.vercel.app", { mode: "no-cors" }),
      fetch(`${API}/health`),
      fetch(`${API}/health`),
      fetch(`${API}/api/ai/health`),
      fetch(`${API}/health`),
    ]);
    setServices(prev => prev.map((svc, i) => ({
      ...svc,
      status: results[i].status === "fulfilled" ? "live" : "down"
    })));
  };

  useEffect(() => {
    apiFetch("/api/admin/stats").then(setStats).catch(() => {});
    checkServices();
  }, []);

  const statusColor = (s) => s === "live" ? S.success : s === "down" ? S.danger : S.warning;
  const statusLabel = (s) => s === "live" ? "Live" : s === "down" ? "Down" : "Checking...";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        <StatCard label="Total users" value={stats?.users} color={S.accent} icon="👤" />
        <StatCard label="Total PDFs" value={stats?.pdfs} color={S.success} icon="📄" />
        <StatCard label="Platform" value="Live" color={S.purple} icon="🚀" />
      </div>
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: "14px", padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <p style={{ fontWeight: 600, margin: 0, color: S.text }}>Stack status</p>
          <button onClick={checkServices} style={{ fontSize: "12px", color: S.accent, background: "transparent", border: `1px solid ${S.accent}44`, borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>
            Refresh
          </button>
        </div>
        {services.map((item, i) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < services.length - 1 ? `1px solid ${S.border}` : "none" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 500, color: S.text }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: "12px", color: S.muted }}>{item.sub}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor(item.status), boxShadow: `0 0 6px ${statusColor(item.status)}` }} />
              <span style={{ fontSize: "12px", color: statusColor(item.status) }}>{statusLabel(item.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── USERS TAB ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const load = () => apiFetch("/api/admin/users").then(setUsers).catch(() => {});
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this user?")) return;
    await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: "14px", overflow: "hidden" }}>
      <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontWeight: 600, color: S.text, fontSize: "15px" }}>All users</p>
        <Badge color={S.success}>{users.length} registered</Badge>
      </div>
      {users.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "32px", margin: "0 0 8px" }}>👤</p>
          <p style={{ color: S.muted, margin: 0, fontSize: "14px" }}>No registered users yet</p>
        </div>
      ) : (
        users.map((u, i) => (
          <div key={u._id || i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 1.5rem", borderBottom: i < users.length - 1 ? `1px solid ${S.border}` : "none" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {u.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 500, fontSize: "14px", color: S.text }}>{u.name}</p>
              <p style={{ margin: 0, fontSize: "12px", color: S.muted }}>{u.email}</p>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: S.muted }}>{new Date(u.createdAt).toLocaleDateString()}</p>
            <Btn danger onClick={() => remove(u._id)} style={{ padding: "4px 10px", fontSize: "12px" }}>Delete</Btn>
          </div>
        ))
      )}
    </div>
  );
}

// ── SEED DB TAB ───────────────────────────────────────────────────────────────
function SeedTab() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    if (!confirm("This will wipe and reseed subjects + trivia. Continue?")) return;
    setLoading(true); setStatus("");
    try {
      const res = await fetch(`${API}/api/dev/seed`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const text = await res.text();
      setStatus(text);
    } catch { setStatus("Seeding failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ background: S.card, border: `1px solid ${S.warning}33`, borderRadius: "14px", padding: "1.5rem" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: S.warning + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>⚠️</div>
          <div>
            <p style={{ fontWeight: 600, margin: "0 0 4px", color: S.text, fontSize: "15px" }}>Seed database</p>
            <p style={{ fontSize: "13px", color: S.muted, margin: 0 }}>Wipes existing subjects and trivia collections, then reseeds with default B.Tech data. Cannot be undone.</p>
          </div>
        </div>
        <Btn warning onClick={seed} disabled={loading}>{loading ? "Seeding..." : "Run seed"}</Btn>
      </div>
      {status && (
        <div style={{ padding: "1rem 1.25rem", background: S.success + "10", border: `1px solid ${S.success}33`, borderRadius: "12px", fontSize: "13px", fontFamily: "monospace", color: S.success }}>
          {status}
        </div>
      )}
    </div>
  );
}

// ── MAIN TAB NAVIGATION & EXPORT ──────────────────────────────────────────────
const TABS = [
  { id: "stats", label: "Overview", icon: "📊" },
  { id: "pdfs", label: "PDF Library", icon: "📄" },
  { id: "requests", label: "Requests & Moderation", icon: "📑" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "seed", label: "Seed DB", icon: "🌱" },
];

export default function AdminPanel() {
  const [authed, setAuthed] = useState(!!getToken());
  const [tab, setTab] = useState("stats");

  const logout = () => { localStorage.removeItem("admin_token"); setAuthed(false); };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: S.bg, backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 50%)" }}>
      <div style={{ background: S.card + "ee", borderBottom: `1px solid ${S.border}`, padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "1rem", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 0", marginRight: "1rem" }}>
          <div style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)", width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: "13px", boxShadow: "0 0 12px rgba(37,99,235,0.4)" }}>Ω</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: S.text, lineHeight: 1 }}>StudyNexus</p>
            <p style={{ margin: 0, fontSize: "10px", color: S.muted, letterSpacing: "0.08em" }}>ADMIN</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "2px", flex: 1, overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", fontSize: "13px", border: "none", background: tab === t.id ? S.accentGlow : "transparent", color: tab === t.id ? S.accent : S.muted, borderRadius: "8px", cursor: "pointer", fontWeight: tab === t.id ? 600 : 400, display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s", whiteSpace: "nowrap" }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <button onClick={logout} style={{ fontSize: "12px", color: S.muted, background: "transparent", border: `1px solid ${S.border}`, cursor: "pointer", padding: "6px 12px", borderRadius: "8px" }}>Sign out</button>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {tab === "stats" && <StatsTab />}
        {tab === "pdfs" && <AdminPdfsTab />}
        {tab === "requests" && <AdminRequestsTab token={getToken()} />}
        {tab === "users" && <UsersTab />}
        {tab === "seed" && <SeedTab />}
      </div>
    </div>
  );
}