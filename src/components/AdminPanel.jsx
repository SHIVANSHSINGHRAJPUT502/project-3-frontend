import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://project-3-backend-production-8932.up.railway.app";

const S = {
  bg: "#090d16",
  surface: "#0d1322",
  card: "#111827",
  border: "#1e2a3a",
  text: "#e2e8f0",
  muted: "#64748b",
  accent: "#3b82f6",
  danger: "#ef4444",
  success: "#10b981",
  warning: "#f59e0b",
  input: "#0d1322",
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

function Btn({ children, danger, warning, full, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "9px 18px",
        borderRadius: "8px",
        border: `1px solid ${danger ? S.danger : warning ? S.warning : S.accent}`,
        background: "transparent",
        color: danger ? S.danger : warning ? S.warning : S.accent,
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        width: full ? "100%" : undefined,
        opacity: props.disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("admin_token", data.token);
      onLogin();
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: S.bg }}>
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: "16px", padding: "2.5rem", width: "100%", maxWidth: "380px" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
            <div style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: "16px" }}>Ω</div>
            <span style={{ fontWeight: 700, fontSize: "16px", color: S.text }}>StudyNexus</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, margin: 0, color: S.text }}>Admin panel</h1>
          <p style={{ fontSize: "13px", color: S.muted, margin: "4px 0 0" }}>Sign in to manage your platform</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input placeholder="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          <Input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && submit()} />
          {error && <p style={{ fontSize: "13px", color: S.danger, margin: 0 }}>{error}</p>}
          <button
            onClick={submit}
            disabled={loading}
            style={{ padding: "10px", borderRadius: "8px", background: "linear-gradient(135deg, #2563eb, #06b6d4)", border: "none", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer", marginTop: "4px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color = S.accent }) {
  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: "12px", padding: "1.25rem 1.5rem" }}>
      <p style={{ fontSize: "12px", color: S.muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ fontSize: "28px", fontWeight: 600, margin: 0, color }}>{value ?? "—"}</p>
    </div>
  );
}

// ── PDFS TAB ──────────────────────────────────────────────────────────────────
function PdfsTab() {
  const [pdfs, setPdfs] = useState([]);
  const [form, setForm] = useState({ title: "", semester: "", subject: "", s3Url: "" });
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => apiFetch("/api/admin/pdfs").then(setPdfs).catch(() => {});
  useEffect(() => { load(); }, []);

  const add = async () => {
    setAdding(true); setMsg("");
    try {
      await apiFetch("/api/admin/pdfs", { method: "POST", body: JSON.stringify({ ...form, semester: Number(form.semester) }) });
      setForm({ title: "", semester: "", subject: "", s3Url: "" });
      setMsg("PDF added successfully");
      load();
    } catch { setMsg("Failed to add PDF"); }
    finally { setAdding(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this PDF?")) return;
    await apiFetch(`/api/admin/pdfs/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: "12px", padding: "1.5rem" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, margin: "0 0 1rem", color: S.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Add new PDF</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Input placeholder="Semester (1-8)" type="number" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} />
          <Input placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
          <Input placeholder="PDF URL" value={form.s3Url} onChange={e => setForm(f => ({ ...f, s3Url: e.target.value }))} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
          <Btn onClick={add} disabled={adding}>{adding ? "Adding…" : "Add PDF"}</Btn>
          {msg && <span style={{ fontSize: "13px", color: msg.includes("success") ? S.success : S.danger }}>{msg}</span>}
        </div>
      </div>

      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${S.border}` }}>
          <p style={{ margin: 0, fontWeight: 600, color: S.text }}>All PDFs <span style={{ fontSize: "13px", color: S.muted, fontWeight: 400 }}>({pdfs.length})</span></p>
        </div>
        {pdfs.length === 0 ? (
          <p style={{ padding: "1.5rem", color: S.muted, margin: 0, fontSize: "14px" }}>No PDFs yet</p>
        ) : (
          pdfs.map(pdf => (
            <div key={pdf._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 1.5rem", borderBottom: `1px solid ${S.border}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 500, fontSize: "14px", color: S.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pdf.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: S.muted }}>Sem {pdf.semester} · {pdf.subject}</p>
              </div>
              <a href={pdf.s3Url} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: S.accent }}>View</a>
              <Btn danger onClick={() => remove(pdf._id)} style={{ padding: "4px 10px", fontSize: "12px" }}>Delete</Btn>
            </div>
          ))
        )}
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
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${S.border}` }}>
        <p style={{ margin: 0, fontWeight: 600, color: S.text }}>All users <span style={{ fontSize: "13px", color: S.muted, fontWeight: 400 }}>({users.length})</span></p>
      </div>
      {users.length === 0 ? (
        <p style={{ padding: "1.5rem", color: S.muted, margin: 0, fontSize: "14px" }}>No registered users yet</p>
      ) : (
        users.map(u => (
          <div key={u._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 1.5rem", borderBottom: `1px solid ${S.border}` }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, color: S.accent, flexShrink: 0 }}>
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

// ── SEED TAB ──────────────────────────────────────────────────────────────────
function SeedTab() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    setLoading(true); setStatus("");
    try {
      const res = await fetch(`${API}/api/dev/seed`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const text = await res.text();
      setStatus(text);
    } catch { setStatus("Seeding failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: "12px", padding: "1.5rem" }}>
      <p style={{ fontWeight: 600, margin: "0 0 6px", color: S.text }}>Seed database</p>
      <p style={{ fontSize: "14px", color: S.muted, margin: "0 0 1.25rem" }}>Wipes existing subjects and trivia, then reseeds with default data. Cannot be undone.</p>
      <Btn warning onClick={seed} disabled={loading}>{loading ? "Seeding…" : "Run seed"}</Btn>
      {status && (
        <div style={{ marginTop: "1rem", padding: "12px", background: S.surface, borderRadius: "8px", fontSize: "13px", fontFamily: "monospace", color: S.success }}>
          {status}
        </div>
      )}
    </div>
  );
}

// ── STATS TAB ─────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => { apiFetch("/api/admin/stats").then(setStats).catch(() => {}); }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
      <StatCard label="Total users" value={stats?.users} color={S.accent} />
      <StatCard label="Total PDFs" value={stats?.pdfs} color={S.success} />
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "stats", label: "Stats" },
  { id: "pdfs", label: "PDFs" },
  { id: "users", label: "Users" },
  { id: "seed", label: "Seed DB" },
];

export default function AdminPanel() {
  const [authed, setAuthed] = useState(!!getToken());
  const [tab, setTab] = useState("stats");

  const logout = () => { localStorage.removeItem("admin_token"); setAuthed(false); };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: S.bg }}>
      <div style={{ background: S.card, borderBottom: `1px solid ${S.border}`, padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "1rem 0", marginRight: "1rem" }}>
          <div style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)", width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: "13px" }}>Ω</div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: S.text }}>Admin</p>
        </div>
        <div style={{ display: "flex", gap: "4px", flex: 1 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 14px", fontSize: "13px", border: "none", background: tab === t.id ? "#1e2a3a" : "transparent", color: tab === t.id ? S.text : S.muted, borderRadius: "8px", cursor: "pointer", fontWeight: tab === t.id ? 600 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={logout} style={{ fontSize: "13px", color: S.muted, background: "transparent", border: "none", cursor: "pointer" }}>Sign out</button>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {tab === "stats" && <StatsTab />}
        {tab === "pdfs" && <PdfsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "seed" && <SeedTab />}
      </div>
    </div>
  );
}
