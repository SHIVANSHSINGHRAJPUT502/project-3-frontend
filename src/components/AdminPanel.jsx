import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://project-3-backend-production-8932.up.railway.app";

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

// ── LOGIN ────────────────────────────────────────────────────────────────────
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background-tertiary)" }}>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "2.5rem", width: "100%", maxWidth: "380px" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: "var(--color-text-secondary)", margin: "0 0 6px", textTransform: "uppercase" }}>StudyNexus</p>
          <h1 style={{ fontSize: "22px", fontWeight: 500, margin: 0 }}>Admin panel</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            placeholder="Username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && submit()}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
          {error && <p style={{ fontSize: "13px", color: "var(--color-text-danger)", margin: 0 }}>{error}</p>}
          <button onClick={submit} disabled={loading} style={{ width: "100%", padding: "10px", marginTop: "4px" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color = "var(--color-text-primary)" }) {
  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem 1.25rem" }}>
      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontSize: "24px", fontWeight: 500, margin: 0, color }}>{value ?? "—"}</p>
    </div>
  );
}

// ── PDFS TAB ─────────────────────────────────────────────────────────────────
function PdfsTab() {
  const [pdfs, setPdfs] = useState([]);
  const [form, setForm] = useState({ title: "", semester: "", subject: "", s3Url: "" });
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => apiFetch("/api/admin/pdfs").then(setPdfs).catch(() => {});
  useEffect(() => { load(); }, []);

  const add = async () => {
    setAdding(true);
    setMsg("");
    try {
      await apiFetch("/api/admin/pdfs", {
        method: "POST",
        body: JSON.stringify({ ...form, semester: Number(form.semester) }),
      });
      setForm({ title: "", semester: "", subject: "", s3Url: "" });
      setMsg("PDF added successfully");
      load();
    } catch {
      setMsg("Failed to add PDF");
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this PDF?")) return;
    await apiFetch(`/api/admin/pdfs/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem" }}>
        <p style={{ fontSize: "13px", fontWeight: 500, margin: "0 0 1rem", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Add new PDF</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <input placeholder="Semester (1-8)" type="number" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} />
          <input placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
          <input placeholder="PDF URL" value={form.s3Url} onChange={e => setForm(f => ({ ...f, s3Url: e.target.value }))} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
          <button onClick={add} disabled={adding}>{adding ? "Adding…" : "Add PDF"}</button>
          {msg && <span style={{ fontSize: "13px", color: msg.includes("success") ? "var(--color-text-success)" : "var(--color-text-danger)" }}>{msg}</span>}
        </div>
      </div>

      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <p style={{ margin: 0, fontWeight: 500 }}>All PDFs <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 400 }}>({pdfs.length})</span></p>
        </div>
        {pdfs.length === 0 ? (
          <p style={{ padding: "1.5rem", color: "var(--color-text-secondary)", margin: 0, fontSize: "14px" }}>No PDFs yet</p>
        ) : (
          pdfs.map(pdf => (
            <div key={pdf._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 1.25rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 500, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pdf.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>Sem {pdf.semester} · {pdf.subject}</p>
              </div>
              <a href={pdf.s3Url} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "var(--color-text-info)" }}>View</a>
              <button onClick={() => remove(pdf._id)} style={{ padding: "4px 10px", fontSize: "12px", color: "var(--color-text-danger)", borderColor: "var(--color-border-danger)" }}>Delete</button>
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
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
      <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <p style={{ margin: 0, fontWeight: 500 }}>All users <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 400 }}>({users.length})</span></p>
      </div>
      {users.length === 0 ? (
        <p style={{ padding: "1.5rem", color: "var(--color-text-secondary)", margin: 0, fontSize: "14px" }}>No registered users yet</p>
      ) : (
        users.map(u => (
          <div key={u._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 1.25rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 500, color: "var(--color-text-info)", flexShrink: 0 }}>
              {u.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 500, fontSize: "14px" }}>{u.name}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>{u.email}</p>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>{new Date(u.createdAt).toLocaleDateString()}</p>
            <button onClick={() => remove(u._id)} style={{ padding: "4px 10px", fontSize: "12px", color: "var(--color-text-danger)", borderColor: "var(--color-border-danger)" }}>Delete</button>
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
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch(`${API}/api/dev/seed`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const text = await res.text();
      setStatus(text);
    } catch {
      setStatus("Seeding failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem" }}>
      <p style={{ fontWeight: 500, margin: "0 0 6px" }}>Seed database</p>
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: "0 0 1.25rem" }}>Wipes existing subjects and trivia, then reseeds with default data. This cannot be undone.</p>
      <button onClick={seed} disabled={loading} style={{ borderColor: "var(--color-border-warning)", color: "var(--color-text-warning)" }}>
        {loading ? "Seeding…" : "Run seed"}
      </button>
      {status && (
        <div style={{ marginTop: "1rem", padding: "12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>
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
      <StatCard label="Total users" value={stats?.users} />
      <StatCard label="Total PDFs" value={stats?.pdfs} />
    </div>
  );
}

// ── MAIN PANEL ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "stats", label: "Stats" },
  { id: "pdfs", label: "PDFs" },
  { id: "users", label: "Users" },
  { id: "seed", label: "Seed DB" },
];

export default function AdminPanel() {
  const [authed, setAuthed] = useState(!!getToken());
  const [tab, setTab] = useState("stats");

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAuthed(false);
  };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "2rem" }}>
        <div style={{ padding: "1rem 0" }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: "15px" }}>StudyNexus Admin</p>
        </div>
        <div style={{ display: "flex", gap: "4px", flex: 1 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 14px",
                fontSize: "14px",
                border: "none",
                background: tab === t.id ? "var(--color-background-secondary)" : "transparent",
                color: tab === t.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                borderRadius: "var(--border-radius-md)",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={logout} style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Sign out</button>
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
