import React from 'react';

export const S = {
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

export function Input({ style, ...props }) {
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

export function Btn({ children, danger, warning, success, ...props }) {
  const color = danger ? S.danger : warning ? S.warning : success ? S.success : S.accent;
  return (
    <button
      {...props}
      style={{
        padding: "8px 14px",
        borderRadius: "8px",
        border: `1px solid ${color}`,
        background: "transparent",
        color,
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        opacity: props.disabled ? 0.5 : 1,
        transition: "all 0.15s ease",
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color = S.accent }) {
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "20px",
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

export function StatCard({ label, value, color = S.accent, icon }) {
  return (
    <div
      style={{
        background: S.card,
        border: `1px solid ${S.border}`,
        borderRadius: "14px",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "80px",
          height: "80px",
          background: color + "08",
          borderRadius: "0 14px 0 80px",
        }}
      />
      <p style={{ fontSize: "12px", color: S.muted, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </p>
      <p style={{ fontSize: "36px", fontWeight: 700, margin: 0, color, lineHeight: 1 }}>
        {value ?? "—"}
      </p>
      {icon && (
        <p style={{ fontSize: "24px", position: "absolute", top: "1rem", right: "1rem", margin: 0, opacity: 0.5 }}>
          {icon}
        </p>
      )}
    </div>
  );
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────
export function StatsTab({ stats, activeUsers, services }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard label="Active Users" value={activeUsers} color={S.success} icon="⚡" />
        <StatCard label="Total PDFs" value={stats?.pdfs ?? 0} color={S.accent} icon="📄" />
        <StatCard label="Pending Moderation" value={stats?.pendingUploads ?? 0} color={S.warning} icon="⏳" />
        <StatCard label="Student Requests" value={stats?.pendingRequests ?? 0} color={S.purple} icon="🎫" />
      </div>

      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: "14px", padding: "1.5rem" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: S.text, margin: "0 0 16px" }}>
          Infrastructure & Service Status
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {services.map((srv, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                background: S.surface,
                borderRadius: "10px",
                border: `1px solid ${S.border}`,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: S.text }}>{srv.label}</p>
                <p style={{ margin: 0, fontSize: "12px", color: S.muted }}>{srv.sub}</p>
              </div>
              <Badge color={srv.status === "online" ? S.success : srv.status === "offline" ? S.danger : S.warning}>
                {srv.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PDF MODERATION TAB ────────────────────────────────────────────────────────
export function ModerationTab({ pendingPdfs, onApprove, onReject }) {
  if (!pendingPdfs || pendingPdfs.length === 0) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", background: S.card, border: `1px dashed ${S.border}`, borderRadius: "14px" }}>
        <p style={{ color: S.muted, fontSize: "14px", margin: 0 }}>No pending PDF uploads in the moderation queue.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {pendingPdfs.map((pdf) => (
        <div
          key={pdf._id}
          style={{
            background: S.card,
            border: `1px solid ${S.border}`,
            borderRadius: "12px",
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, color: S.text, fontSize: "14px" }}>{pdf.title}</span>
              <Badge color={S.accent}>Sem {pdf.semester}</Badge>
              <Badge color={S.purple}>{pdf.subject}</Badge>
              <Badge color={S.muted2}>{pdf.type || "Notes"}</Badge>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: S.muted }}>
              Submitted by: <strong style={{ color: S.muted2 }}>{pdf.uploaderName || "Student Contributor"}</strong>
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {pdf.s3Url && (
              <a
                href={pdf.s3Url}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${S.border2}`,
                  color: S.muted2,
                  fontSize: "13px",
                  textDecoration: "none",
                  background: S.surface,
                }}
              >
                Preview
              </a>
            )}
            <Btn success onClick={() => onApprove(pdf._id)}>Approve</Btn>
            <Btn danger onClick={() => onReject(pdf._id)}>Reject</Btn>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── USERS TAB ─────────────────────────────────────────────────────────────────
export function UsersTab({ users, onDeleteUser }) {
  if (!users || users.length === 0) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", background: S.card, border: `1px dashed ${S.border}`, borderRadius: "14px" }}>
        <p style={{ color: S.muted, fontSize: "14px", margin: 0 }}>No registered users found.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {users.map((u) => (
        <div
          key={u._id}
          style={{
            background: S.card,
            border: `1px solid ${S.border}`,
            borderRadius: "12px",
            padding: "12px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: S.text, fontSize: "14px" }}>{u.name || u.username || "User"}</p>
            <p style={{ margin: 0, fontSize: "12px", color: S.muted }}>{u.email}</p>
          </div>
          <Btn danger onClick={() => onDeleteUser(u._id)}>Remove</Btn>
        </div>
      ))}
    </div>
  );
}