// src/components/SupportWidget.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { FileQuestion, X, CheckCircle2, Loader2, Send } from 'lucide-react';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('1');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await axios.post('https://studynexusbackend.vercel.app/api/admin/requests/new', {
        name: name.trim() || 'Student',
        semester,
        message: message.trim()
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setIsOpen(false);
        setMessage('');
        setName('');
      }, 2000);
    } catch (err) {
      alert('Could not submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (Bottom-Left) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Request Missing Notes"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#0d1322]/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-xl"
      >
        {isOpen ? (
          <X size={18} className="text-slate-300" />
        ) : (
          <>
            <FileQuestion size={18} className="text-amber-400" />
            <span className="text-xs font-semibold tracking-wide font-mono pr-1">
              Request Notes
            </span>
          </>
        )}
      </button>

      {/* Slide-out Modal (Anchored Bottom-Left) */}
      {isOpen && (
        <div className="fixed bottom-20 left-6 w-[calc(100vw-3rem)] sm:w-96 z-50 bg-[#0c1220]/95 backdrop-blur-2xl border border-white/10 text-white rounded-2xl shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Request Missing Material
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-white text-base font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto animate-bounce" />
              <p className="text-emerald-400 font-semibold mt-2 text-sm">Request Submitted!</p>
              <p className="text-xs text-slate-400 mt-1">Admin will upload it soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Target Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white">
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Subject / PDF Notes Needed
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Unit 3 Compiler Design or 2024 PYQ"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{loading ? 'Submitting...' : 'Send Request'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}