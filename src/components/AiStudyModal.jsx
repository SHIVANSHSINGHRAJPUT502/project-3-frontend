// src/components/AiStudyModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Download, Send, Loader2, X, BookOpen, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://studynexusbackend.vercel.app';

export default function AiStudyModal({ pdf, isOpen, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen || !pdf) return null;

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await axios.post(`${API}/api/ai/ask-doc`, {
        pdfId: pdf._id,
        prompt: prompt.trim(),
      });
      setResult(res.data);
    } catch (err) {
      console.error('AI Ask Doc Error:', err);
      setErrorMsg(
        err.response?.data?.error || 'Failed to analyze this document. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setPrompt('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0c1220] border border-white/10 rounded-2xl w-full max-w-2xl text-white shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                AI Exam Tutor
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md">
                {pdf.title}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Response Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {!result && !loading && (
            <div className="text-center py-10 space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-cyan-500/5 text-cyan-400 border border-cyan-500/10 mb-1">
                <BookOpen size={24} />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">
                Ask anything from this document
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Need a specific numerical solved, an algorithm derived, or a unit summarized? Ask below and Sarah will solve it directly from this PDF.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  onClick={() => setPrompt('Summarize key exam definitions and formulas from this PDF')}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition"
                >
                  💡 Key formulas & definitions
                </button>
                <button
                  onClick={() => setPrompt('Solve the most important previous year question in this unit')}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition"
                >
                  📝 Solve important PYQ
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-14 flex flex-col items-center justify-center gap-3 text-cyan-400 text-xs font-mono">
              <Loader2 size={24} className="animate-spin text-cyan-400" />
              <span>Scanning document text & generating derivation...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30 font-sans">
                {result.answer}
              </div>

              {/* Verified Source Document & Direct Download */}
              <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                    Source Verified
                  </span>
                  <span className="text-xs text-slate-200 font-medium truncate block">
                    {result.sourceDoc?.title || pdf.title}
                  </span>
                </div>
                <a
                  href={result.sourceDoc?.downloadUrl || pdf.s3Url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-lg shadow-cyan-500/10"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAsk} className="p-3 border-t border-white/10 bg-slate-900/70 flex gap-2">
          <input
            type="text"
            placeholder="e.g., Solve question 3 or explain this derivation..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={13} />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}