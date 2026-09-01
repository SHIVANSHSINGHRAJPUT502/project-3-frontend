// src/components/SemesterView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText, UploadCloud, Sparkles } from 'lucide-react';
import axios from 'axios';
import { GlassCard } from './GlassCard';
import { ContributeModal } from './ContributeModal';

const API = import.meta.env.VITE_API_URL || "https://studynexusbackend.vercel.app";

const COLOR_KEYS = ['blue', 'purple', 'amber', 'emerald', 'rose', 'cyan'];

const COLOR_MAP = {
  blue:    { border: '#3b82f6', bg: '#3b82f620', text: '#93c5fd' },
  purple:  { border: '#8b5cf6', bg: '#8b5cf620', text: '#c4b5fd' },
  amber:   { border: '#f59e0b', bg: '#f59e0b20', text: '#fcd34d' },
  emerald: { border: '#10b981', bg: '#10b98120', text: '#6ee7b7' },
  rose:    { border: '#f43f5e', bg: '#f43f5e20', text: '#fda4af' },
  cyan:    { border: '#06b6d4', bg: '#06b6d420', text: '#67e8f9' },
};

export const SemesterView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const semId = location.pathname.split('/').pop();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Background-capable fetcher
  const fetchSubjects = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) {
        setLoading(true);
        setError(null);
      }
      const response = await axios.get(`${API}/api/subjects/${semId}`);
      setSubjects(response.data || []);
    } catch (err) {
      console.error("API Fetch Error:", err);
      if (!isSilent) {
        setError("Failed to connect to the server.");
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, [semId]);

  useEffect(() => {
    // 1. Initial fetch on component mount / semester change
    fetchSubjects(false);

    // 2. Poll every 10 seconds in the background
    const interval = setInterval(() => {
      fetchSubjects(true);
    }, 10000);

    // 3. Clear interval on unmount
    return () => clearInterval(interval);
  }, [fetchSubjects]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Link to="/" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
          &larr; Return Hub
        </Link>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Semester {semId}</h2>
          <span className="text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md mt-1 font-semibold">
            B.Tech Computer Science
          </span>
        </div>
        <p className="text-slate-400 text-sm">Select a subject to access Notes, PYQs and Syllabus.</p>
      </div>

      {/* Loading Spinner (Only on first mount) */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Loading subjects...</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 max-w-xl mx-auto flex gap-4 items-start">
          <AlertTriangle className="text-rose-400 shrink-0" size={24} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-200">Connection Error</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.length === 0 ? (
              <div className="col-span-full text-center py-16 border border-dashed border-white/5 rounded-2xl bg-slate-950/40 max-w-md mx-auto p-6">
                <FileText className="text-slate-600 mx-auto mb-3" size={28} />
                <p className="text-sm text-slate-200 font-semibold">No PDFs uploaded for Semester {semId} yet</p>
                <p className="text-xs text-slate-500 mt-1">Be the first to contribute using the button below.</p>
              </div>
            ) : (
              subjects.map((subject, i) => {
                const subjectName = typeof subject === 'string' ? subject : subject.name;
                const colorKey = COLOR_KEYS[i % COLOR_KEYS.length];
                const color = COLOR_MAP[colorKey];
                return (
                  <GlassCard
                    key={subjectName}
                    className="relative group border-white/5 hover:border-blue-500/20 cursor-pointer"
                    onClick={() => navigate(`/subject/${semId}/${encodeURIComponent(subjectName)}`)}
                  >
                    <div
                      style={{ background: `linear-gradient(to bottom, ${color.border}, transparent)` }}
                      className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl"
                    />
                    <div className="pl-2 space-y-4">
                      {/* Color dot + semester badge */}
                      <div className="flex justify-between items-center">
                        <span
                          style={{ background: color.bg, color: color.text, borderColor: color.border + '44' }}
                          className="text-xs font-mono font-bold px-2 py-1 border rounded"
                        >
                          SEM {semId}
                        </span>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color.border, boxShadow: `0 0 6px ${color.border}` }} />
                      </div>

                      {/* Subject name */}
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                          {subjectName}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wider">
                          Semester {semId}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex gap-2 pt-1">
                        {['Notes', 'PYQ', 'Syllabus'].map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-slate-800/60 border border-white/5 text-slate-400 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>

          {/* ── Contribution Banner at Bottom ── */}
          <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-cyan-950/40 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Sparkles size={16} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white">Have study material for Semester {semId}?</h3>
              </div>
              <p className="text-xs text-slate-400 max-w-lg">
                Upload your unit notes, PYQs, or syllabus PDFs to help peers. All submissions go through a quick admin review before publishing.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-95 shrink-0"
            >
              <UploadCloud size={16} />
              <span>Contribute PDF</span>
            </button>
          </div>
        </>
      )}

      {/* ── Modal Component ── */}
      <ContributeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        semId={semId}
        subjects={subjects}
      />
    </div>
  );
};

export default SemesterView;