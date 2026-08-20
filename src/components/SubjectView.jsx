// src/components/SubjectView.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, AlertTriangle, FileText, GraduationCap, ScrollText } from 'lucide-react';
import axios from 'axios';
import { GlassCard } from './GlassCard';

// ✅ Updated to your live custom production backend domain
const API = "https://studynexusbackend.vercel.app/";

const TYPE_CONFIG = {
  notes:     { label: 'Notes',                icon: BookOpen,      color: '#3b82f6', bg: '#3b82f615', desc: 'Lecture notes and study material' },
  pyq:       { label: 'Previous Year Questions', icon: ScrollText,    color: '#8b5cf6', bg: '#8b5cf615', desc: 'Past exam papers and solutions' },
  syllabus: { label: 'Syllabus',               icon: GraduationCap, color: '#10b981', bg: '#10b98115', desc: 'Course outline and topics' },
};

export const SubjectView = () => {
  const { semId, subjectName } = useParams();
  const [activeType, setActiveType] = useState('notes');
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPdfs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API}/api/notes/${semId}/${encodeURIComponent(subjectName)}/${activeType}`
        );
        setPdfs(response.data);
      } catch (err) {
        console.error("PDF Fetch Error:", err);
        setError("Failed to fetch PDFs.");
      } finally {
        setLoading(false);
      }
    };
    fetchPdfs();
  }, [semId, subjectName, activeType]);

  const config = TYPE_CONFIG[activeType];
  const Icon = config.icon;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Link to={`/semester/${semId}`} className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
          &larr; Back to Semester {semId}
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {decodeURIComponent(subjectName)}
          </h2>
          <span className="text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-semibold">
            Semester {semId}
          </span>
        </div>
        <p className="text-slate-400 text-sm">Select a category to access resources.</p>
      </div>

      {/* Notes / PYQ / Syllabus type selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
          const CardIcon = cfg.icon;
          const isActive = activeType === type;
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                background: isActive ? cfg.bg : 'transparent',
                border: `1px solid ${isActive ? cfg.color + '66' : '#1e2a3a'}`,
                borderRadius: '14px',
                padding: '1.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${cfg.color}33` }}>
                  <CardIcon size={18} color={cfg.color} />
                </div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: isActive ? cfg.color : '#e2e8f0' }}>
                  {cfg.label}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{cfg.desc}</p>
            </button>
          );
        })}
      </div>

      {/* PDF List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Icon size={16} color={config.color} />
          <h3 className="text-sm font-semibold text-slate-300">{config.label}</h3>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Fetching PDFs...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3 items-start">
            <AlertTriangle className="text-rose-400 shrink-0" size={20} />
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && pdfs.length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-slate-950/40">
            <FileText className="text-slate-600 mx-auto mb-3" size={32} />
            <p className="text-sm text-slate-400 font-medium">No {config.label} uploaded yet</p>
            <p className="text-xs text-slate-600 mt-1">Admin can upload from the admin panel</p>
          </div>
        )}

        {!loading && !error && pdfs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pdfs.map((pdf) => (
              <GlassCard key={pdf._id} className="relative group border-white/5 hover:border-blue-500/20">
                <div
                  style={{ background: `linear-gradient(to bottom, ${config.color}, transparent)` }}
                  className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl"
                />
                <div className="pl-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}44` }}
                      className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider"
                    >
                      {pdf.type || activeType}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {pdf.title}
                  </h3>
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(pdf.s3Url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-center rounded-xl text-xs font-bold text-slate-200 transition-all border border-white/5 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <BookOpen size={13} className="text-slate-400" /> View Document
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};