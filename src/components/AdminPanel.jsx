import React, { useState, useEffect, useCallback } from "react";
import AdminRequestsTab from "./AdminRequestsTab.jsx";
import AdminPdfsTab from "./AdminPdfsTab.jsx";
import { S, Input, StatsTab, ModerationTab, UsersTab } from "./AdminTabs.jsx";

const API = import.meta.env.VITE_API_URL || "https://studynexusbackend.vercel.app";
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: S.bg,
        backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)",
      }}
    >
      <div
        style={{
          background: S.card,
          border: `1px solid ${S.border2}`,
          borderRadius: "20px",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 0 60px rgba(59,130,246,0.08)",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#fff",
                fontSize: "18px",
                boxShadow: "0 0 20px rgba(37,99,235,0.4)",
              }}
            >
              Ω
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: S.text }}>StudyNexus</p>
              <p style={{ margin: 0, fontSize: "11px", color: S.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Admin Portal
              </p>
            </div>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, margin: "0 0 4px", color: S.text }}>Welcome back</h1>
          <p style={{ fontSize: "13px", color: S.muted, margin: 0 }}>Sign in to manage your platform</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: S.muted2, marginBottom: "6px", display: "block" }}>Username</label>
            <Input
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: S.muted2, marginBottom: "6px", display: "block" }}>Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          {error && (
            <div style={{ padding: "10px 12px", background: S.danger + "15", border: `1px solid ${S.danger}44`, borderRadius: "8px", fontSize: "13px", color: S.danger }}>
              {error}
            </div>
          )}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              padding: "11px",
              borderRadius: "10px",
              background: loading ? S.accent + "80" : "linear-gradient(135deg, #2563eb, #06b6d4)",
              border: "none",
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
              boxShadow: "0 0 20px rgba(37,99,235,0.3)",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState(!!getToken());
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [activeUsers, setActiveUsers] = useState(1);
  const [pendingPdfs, setPendingPdfs] = useState([]);
  const [users, setUsers] = useState([]);
  const [services] = useState([
    { label: "Frontend", sub: "Vercel · React + Vite", status: "online" },
    { label: "Backend", sub: "Vercel · Node + Express", status: "online" },
    { label: "Database", sub: "MongoDB Atlas", status: "online" },
    { label: "AI (Sarah)", sub: "Gemini API", status: "online" },
    { label: "Storage", sub: "Cloudinary", status: "online" },
  ]);

  const loadData = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [sData, aData, pData] = await Promise.all([
        apiFetch("/api/admin/stats").catch(() => null),
        apiFetch("/api/active-users").catch(() => ({ count: 1 })),
        apiFetch("/api/admin/notes/pending").catch(() => ({ notes: [] })),
      ]);
      if (sData) setStats(sData);
      if (aData) setActiveUsers(aData.count || 1);
      if (pData) setPendingPdfs(pData.notes || pData || []);
    } catch (err) {
      console.error("Dashboard sync error:", err);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiFetch("/api/admin/users");
      setUsers(data || []);
    } catch {
      setUsers([]);
    }
  }, []);

  // 10-second automatic polling
  useEffect(() => {
    if (!authed) return;
    loadData();
    if (activeTab === "users") loadUsers();

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, [authed, activeTab, loadData, loadUsers]);

  const handleApprovePdf = async (id) => {
    try {
      await apiFetch(`/api/admin/notes/${id}/approve`, { method: "PATCH" });
      setPendingPdfs((prev) => prev.filter((p) => p._id !== id));
      loadData();
    } catch {
      alert("Failed to approve PDF");
    }
  };

  const handleRejectPdf = async (id) => {
    if (!window.confirm("Reject and remove this upload?")) return;
    try {
      await apiFetch(`/api/admin/notes/${id}/reject`, { method: "DELETE" });
      setPendingPdfs((prev) => prev.filter((p) => p._id !== id));
      loadData();
    } catch {
      alert("Failed to reject PDF");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      alert("Failed to delete user");
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAuthed(false);
  };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const tabs = [
    { id: "stats", label: "Overview" },
    { id: "moderation", label: `Moderation (${pendingPdfs.length})` },
    { id: "requests", label: "Student Tickets" },
    { id: "pdfs", label: "Directory & Uploads" },
    { id: "users", label: "Users" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.text, padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: `1px solid ${S.border}`, paddingBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff" }}>Ω</div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: S.text }}>StudyNexus Hub</h2>
              <p style={{ margin: 0, fontSize: "11px", color: S.muted, fontFamily: "monospace" }}>Real-time Sync Active (10s)</p>
            </div>
          </div>
          <button onClick={logout} style={{ padding: "8px 14px", borderRadius: "8px", border: `1px solid ${S.danger}44`, background: S.danger + "15", color: S.danger, fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: `1px solid ${activeTab === t.id ? S.accent : S.border}`,
                background: activeTab === t.id ? S.accentGlow : S.surface,
                color: activeTab === t.id ? S.accent : S.muted2,
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Views */}
        {activeTab === "stats" && <StatsTab stats={stats} activeUsers={activeUsers} services={services} />}
        {activeTab === "moderation" && <ModerationTab pendingPdfs={pendingPdfs} onApprove={handleApprovePdf} onReject={handleRejectPdf} />}
        {activeTab === "requests" && <AdminRequestsTab />}
        {activeTab === "pdfs" && <AdminPdfsTab />}
        {activeTab === "users" && <UsersTab users={users} onDeleteUser={handleDeleteUser} />}
      </div>
    </div>
  );
}