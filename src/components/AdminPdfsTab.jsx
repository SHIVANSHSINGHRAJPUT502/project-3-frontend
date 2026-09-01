// src/components/AdminPdfsTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import SubjectPickerModal from './SubjectPickerModal.jsx';

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

function Input({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        boxSizing: "border-box",
        background: "#0a1120",
        border: "1px solid #1e2a3a",
        borderRadius: "8px",
        padding: "9px 12px",
        color: "#e2e8f0",
        fontSize: "14px",
        outline: "none",
        ...style,
      }}
    />
  );
}

function Btn({ children, danger, ...props }) {
  const color = danger ? "#ef4444" : "#3b82f6";
  return (
    <button
      {...props}
      style={{
        padding: "9px 18px",
        borderRadius: "8px",
        border: `1px solid ${color}`,
        background: "transparent",
        color: color,
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

function Badge({ children, color = "#3b82f6" }) {
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: color + "22", color, border: `1px solid ${color}44`, letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

// Cloudinary Direct PDF Uploader
function UploadSection({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: "", semester: "1", subject: "", type: "notes" });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f && f.type === "application/pdf") { setFile(f); setMsg(""); }
    else { setMsg("Only PDF files allowed"); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") { setFile(f); setMsg(""); }
    else { setMsg("Only PDF files allowed"); }
  };

  const upload = async () => {
    if (!file || !form.title || !form.semester || !form.subject) { setMsg("Fill all fields and select a PDF"); return; }
    setUploading(true); setMsg(""); setProgress(10);
    try {
      const fd = new FormData();
      fd.append("pdf", file);
      fd.append("title", form.title);
      fd.append("semester", form.semester);
      fd.append("subject", form.subject);
      fd.append("type", form.type || "notes");
      setProgress(40);
      const res = await fetch(`${API}/api/admin/pdfs/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      setProgress(90);
      if (res.status === 401 || res.status === 403) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("admin_token");
        window.location.reload();
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      setProgress(100);
      setMsg("✅ Uploaded successfully!");
      setFile(null); setForm({ title: "", semester: "1", subject: "", type: "notes" });
      if (fileRef.current) fileRef.current.value = "";
      onSuccess();
    } catch (err) { setMsg("❌ Upload failed: " + err.message); }
    finally { setUploading(false); setTimeout(() => setProgress(0), 1000); }
  };

  return (
    <div style={{ background: "#111827", border: "1px solid #243044", borderRadius: "14px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, margin: 0, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Upload PDF to Cloudinary</p>
        <Badge color="#8b5cf6">Cloudinary</Badge>
      </div>
      <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current.click()}
        style={{ border: `2px dashed ${file ? "#10b981" : "#243044"}`, borderRadius: "12px", padding: "2rem", textAlign: "center", cursor: "pointer", background: file ? "#10b98108" : "#0d1322", transition: "all 0.2s" }}>
        <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} style={{ display: "none" }} />
        {file ? (
          <div>
            <p style={{ fontSize: "28px", margin: "0 0 8px" }}>📄</p>
            <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#10b981", fontSize: "14px" }}>{file.name}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>({(file.size / 1024 / 1024).toFixed(2)} MB) · Click to change</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "32px", margin: "0 0 8px" }}>☁️</p>
            <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "14px", fontWeight: 500 }}>Drop PDF here or click to browse</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Max 20MB · PDF only</p>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1.2fr 1fr", gap: "10px" }}>
        <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <select 
          value={form.semester} 
          onChange={e => setForm(f => ({ ...f, semester: e.target.value, subject: "" }))}
          style={{ background: "#0a1120", border: "1px solid #1e2a3a", borderRadius: "8px", padding: "9px 12px", color: "#e2e8f0", fontSize: "14px", outline: "none" }}
        >
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>

        {/* Interactive Subject Trigger */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            background: form.subject ? "rgba(59,130,246,0.15)" : "#0a1120",
            border: `1px solid ${form.subject ? "#3b82f6" : "#1e2a3a"}`,
            borderRadius: "8px",
            padding: "9px 12px",
            color: form.subject ? "#3b82f6" : "#94a3b8",
            fontSize: "13px",
            textAlign: "left",
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {form.subject || "Select Subject..."}
        </button>

        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          style={{ background: "#0a1120", border: "1px solid #1e2a3a", borderRadius: "8px", padding: "9px 12px", color: "#e2e8f0", fontSize: "14px", outline: "none" }}>
          <option value="notes">Notes</option>
          <option value="pyq">PYQ</option>
          <option value="syllabus">Syllabus</option>
        </select>
      </div>

      {progress > 0 && (
        <div style={{ height: "4px", background: "#1e2a3a", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #2563eb, #06b6d4)", borderRadius: "4px", transition: "width 0.3s" }} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={upload} disabled={uploading} style={{ padding: "10px 20px", borderRadius: "8px", background: uploading ? "#3b82f660" : "linear-gradient(135deg, #2563eb, #06b6d4)", border: "none", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: uploading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
          {uploading ? "Uploading..." : "Upload to Cloudinary"}
        </button>
        {msg && <span style={{ fontSize: "13px", color: msg.includes("✅") ? "#10b981" : "#ef4444" }}>{msg}</span>}
      </div>

      <SubjectPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        semester={form.semester}
        selectedSubject={form.subject}
        onSelect={(selected) => setForm(f => ({ ...f, subject: selected }))}
      />
    </div>
  );
}

// Manual URL Submission
function ManualSection({ onSuccess }) {
  const [form, setForm] = useState({ title: "", semester: "1", subject: "", type: "notes", s3Url: "" });
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const add = async () => {
    if (!form.title || !form.subject || !form.s3Url) { setMsg("Fill all fields"); return; }
    setAdding(true); setMsg("");
    try {
      await apiFetch("/api/admin/pdfs", { method: "POST", body: JSON.stringify({ ...form, semester: Number(form.semester) }) });
      setForm({ title: "", semester: "1", subject: "", type: "notes", s3Url: "" });
      setMsg("✅ PDF added");
      onSuccess();
    } catch { setMsg("❌ Failed to add"); }
    finally { setAdding(false); }
  };

  return (
    <div style={{ background: "#111827", border: "1px solid #1e2a3a", borderRadius: "14px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, margin: 0, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Add via URL</p>
        <Badge color="#64748b">Manual</Badge>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1.2fr 1fr", gap: "10px" }}>
        <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <select 
          value={form.semester} 
          onChange={e => setForm(f => ({ ...f, semester: e.target.value, subject: "" }))}
          style={{ background: "#0a1120", border: "1px solid #1e2a3a", borderRadius: "8px", padding: "9px 12px", color: "#e2e8f0", fontSize: "14px", outline: "none" }}
        >
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>

        {/* Interactive Subject Trigger */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            background: form.subject ? "rgba(59,130,246,0.15)" : "#0a1120",
            border: `1px solid ${form.subject ? "#3b82f6" : "#1e2a3a"}`,
            borderRadius: "8px",
            padding: "9px 12px",
            color: form.subject ? "#3b82f6" : "#94a3b8",
            fontSize: "13px",
            textAlign: "left",
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {form.subject || "Select Subject..."}
        </button>

        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          style={{ background: "#0a1120", border: "1px solid #1e2a3a", borderRadius: "8px", padding: "9px 12px", color: "#e2e8f0", fontSize: "14px", outline: "none" }}>
          <option value="notes">Notes</option>
          <option value="pyq">PYQ</option>
          <option value="syllabus">Syllabus</option>
        </select>
        <Input placeholder="PDF URL" value={form.s3Url} onChange={e => setForm(f => ({ ...f, s3Url: e.target.value }))} style={{ gridColumn: "1 / -1" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Btn onClick={add} disabled={adding}>{adding ? "Adding..." : "Add PDF"}</Btn>
        {msg && <span style={{ fontSize: "13px", color: msg.includes("✅") ? "#10b981" : "#ef4444" }}>{msg}</span>}
      </div>

      <SubjectPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        semester={form.semester}
        selectedSubject={form.subject}
        onSelect={(selected) => setForm(f => ({ ...f, subject: selected }))}
      />
    </div>
  );
}

// Main PDF Library View Export
export default function AdminPdfsTab() {
  const [pdfs, setPdfs] = useState([]);
  const [view, setView] = useState("upload");

  const load = () => apiFetch("/api/admin/pdfs").then(setPdfs).catch(() => {});
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this PDF?")) return;
    await apiFetch(`/api/admin/pdfs/${id}`, { method: "DELETE" });
    load();
  };

  const handleSafePreview = (s3Url, title) => {
    if (window.confirm(`Are you sure you want to open and review "${title}" in a new tab?`)) {
      window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(s3Url)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {["upload", "manual"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ padding: "7px 16px", borderRadius: "8px", border: `1px solid ${view === v ? "#3b82f6" : "#1e2a3a"}`, background: view === v ? "rgba(59,130,246,0.15)" : "transparent", color: view === v ? "#3b82f6" : "#64748b", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
            {v === "upload" ? "Upload file" : "Add URL"}
          </button>
        ))}
      </div>

      {view === "upload" ? <UploadSection onSuccess={load} /> : <ManualSection onSuccess={load} />}

      <div style={{ background: "#111827", border: "1px solid #1e2a3a", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #1e2a3a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontWeight: 600, color: "#e2e8f0", fontSize: "15px" }}>All PDFs</p>
          <Badge color="#3b82f6">{pdfs.length} files</Badge>
        </div>
        {pdfs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "32px", margin: "0 0 8px" }}>📂</p>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No PDFs yet — upload one above</p>
          </div>
        ) : (
          pdfs.map((pdf, i) => (
            <div key={pdf._id || i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 1.5rem", borderBottom: i < pdfs.length - 1 ? "1px solid #1e2a3a" : "none", transition: "background 0.15s" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 3px", fontWeight: 500, fontSize: "14px", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pdf.title}</p>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <Badge color="#8b5cf6">Sem {pdf.semester}</Badge>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{pdf.subject}</span>
                  <Badge color={pdf.type === 'notes' ? "#3b82f6" : pdf.type === 'pyq' ? "#8b5cf6" : "#10b981"}>
                    {pdf.type || 'notes'}
                  </Badge>
                </div>
              </div>
              <button 
                onClick={() => handleSafePreview(pdf.s3Url, pdf.title)} 
                style={{ fontSize: "12px", color: "#3b82f6", background: "transparent", padding: "4px 10px", border: "1px solid rgba(59,130,246,0.25)", borderRadius: "6px", cursor: "pointer" }}
              >
                View
              </button>
              <Btn danger onClick={() => remove(pdf._id)} style={{ padding: "4px 10px", fontSize: "12px" }}>Delete</Btn>
            </div>
          ))
        )}
      </div>
    </div>
  );
}