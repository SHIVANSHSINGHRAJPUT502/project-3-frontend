// src/components/ExamPaperModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, FileText, Sparkles, Send, Loader2, Download, BookOpen, 
  Layers, Terminal, Mic, Volume2, ChevronRight, CheckCircle2 
} from 'lucide-react';
import axios from 'axios';
import { playAnyaVoice } from '../utils/voiceAssistant.js';

const API = import.meta.env.VITE_API_URL || 'https://studynexusbackend.vercel.app';

export const ExamPaperModal = ({ isOpen, onClose, paperData, documentsList = [] }) => {
  // Consolidate document list (either passed array or single paperData)
  const availableDocs = documentsList && documentsList.length > 0 
    ? documentsList 
    : (paperData ? [paperData] : []);

  const [selectedDoc, setSelectedDoc] = useState(availableDocs[0] || null);
  const [activeTab, setActiveTab] = useState('paper'); // 'paper' or 'solver'
  const [prompt, setPrompt] = useState('');
  const [solution, setSolution] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Keep selectedDoc synced when new documents arrive
  useEffect(() => {
    if (availableDocs.length > 0) {
      setSelectedDoc(availableDocs[0]);
    }
  }, [paperData, documentsList]);

  if (!isOpen || (!paperData && availableDocs.length === 0)) return null;

  const currentDoc = selectedDoc || paperData || {};
  const pdfTargetUrl = currentDoc.url || currentDoc.s3Url;
  const embedViewerUrl = pdfTargetUrl 
    ? `https://docs.google.com/gview?url=${encodeURIComponent(pdfTargetUrl)}&embedded=true`
    : null;

  const handleSolveQuestion = async (customPrompt) => {
    const query = customPrompt || prompt;
    if (!query.trim()) return;

    setIsSolving(true);
    setActiveTab('solver');

    try {
      const res = await axios.post(`${API}/api/ai/ask-doc`, {
        pdfId: currentDoc.id || currentDoc._id,
        prompt: query
      });

      if (res.data?.answer) {
        setSolution(res.data.answer);
        playAnyaVoice(res.data.answer.slice(0, 260));
      } else {
        setSolution('No direct mathematical or theoretical derivation returned. Please try rephrasing your question.');
      }
    } catch (err) {
      console.error('Exam solver API error:', err);
      setSolution('Unable to analyze and solve this paper right now. Please check your backend link and try again.');
    } finally {
      setIsSolving(false);
    }
  };

  // Hands-free voice trigger inside the full screen
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      try { recognitionRef.current?.stop(); } catch (_) {}
      setIsListening(false);
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const voiceQuery = event.results[0][0].transcript;
        setPrompt(voiceQuery);
        handleSolveQuestion(voiceQuery);
      };
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (_) {
        setIsListening(false);
      }
    }
  };

  const renderQuickPresets = () => {
    const sub = (currentDoc.subject || '').toLowerCase();

    if (sub.includes('compiler')) {
      return (
        <>
          <button
            onClick={() => handleSolveQuestion('Summarize this question paper and outline core exam weightage.')}
            className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-cyan-400 transition"
          >
            ⚡ Summarize Paper
          </button>
          <button
            onClick={() => handleSolveQuestion('Derive the FIRST and FOLLOW sets for all non-terminals step-by-step.')}
            className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-300 transition"
          >
            ⚡ FIRST & FOLLOW
          </button>
          <button
            onClick={() => handleSolveQuestion('Construct the Three-Address Code (TAC) and Quadruples table.')}
            className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-300 transition"
          >
            ⚡ TAC & Quadruples
          </button>
        </>
      );
    }

    if (sub.includes('software')) {
      return (
        <>
          <button
            onClick={() => handleSolveQuestion('Summarize this document and list all key Software Engineering models covered.')}
            className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-cyan-400 transition"
          >
            ⚡ Summarize Notes
          </button>
          <button
            onClick={() => handleSolveQuestion('Explain the differences between Agile, Waterfall, and Spiral Models with diagram logic.')}
            className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-300 transition"
          >
            ⚡ Agile vs Waterfall
          </button>
          <button
            onClick={() => handleSolveQuestion('Calculate Cyclomatic Complexity for the given control flow graph step-by-step.')}
            className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-300 transition"
          >
            ⚡ Cyclomatic Complexity
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={() => handleSolveQuestion('Summarize this document completely and highlight high-scoring university exam questions.')}
          className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-cyan-400 transition"
        >
          ⚡ Summarize & Explain
        </button>
        <button
          onClick={() => handleSolveQuestion('Solve Question 1 completely with step-by-step detailed logic.')}
          className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-300 transition"
        >
          ⚡ Solve Question 1
        </button>
        <button
          onClick={() => handleSolveQuestion('Explain all numerical and architectural questions in this file.')}
          className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-300 transition"
        >
          ⚡ Solve All Numericals
        </button>
      </>
    );
  };

  const modalNode = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-[#0b1120] border border-white/10 rounded-2xl w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden shadow-2xl relative z-[10000]"
        >
          {/* Top Bar Header */}
          <div className="h-16 px-4 sm:px-6 border-b border-white/10 bg-slate-950/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                  {currentDoc.title || 'Exam Document Workspace'}
                </h2>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  {currentDoc.subject} • Semester {currentDoc.semester} • {currentDoc.type || 'Document'}
                </p>
              </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden items-center bg-slate-900 p-1 rounded-xl border border-white/10 mx-2 shrink-0">
              <button
                onClick={() => setActiveTab('paper')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                  activeTab === 'paper' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Paper
              </button>
              <button
                onClick={() => setActiveTab('solver')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                  activeTab === 'solver' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Solver
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {pdfTargetUrl && (
                <a
                  href={pdfTargetUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold transition"
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Document Drawer: List of available PDFs/PYQs for this subject */}
          {availableDocs.length > 1 && (
            <div className="bg-slate-950/90 border-b border-white/5 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <BookOpen size={11} className="text-cyan-400" />
                Matching Materials:
              </span>
              {availableDocs.map((doc, idx) => {
                const isSelected = (selectedDoc?.id || selectedDoc?._id) === (doc.id || doc._id);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setSolution('');
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5'
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={11} className="text-cyan-400" />}
                    <span className="truncate max-w-[180px]">{doc.title}</span>
                    <span className="text-[10px] opacity-60 uppercase">({doc.type || 'PYQ'})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Dual-Pane Layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Column: PDF Stream or Dynamic Workspace */}
            <div
              className={`flex-1 h-full bg-slate-950 border-r border-white/5 flex flex-col ${
                activeTab === 'paper' ? 'flex' : 'hidden md:flex'
              }`}
            >
              <div className="p-2 bg-slate-900/40 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono px-4">
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="text-cyan-400" />
                  DOCUMENT WORKSPACE • {currentDoc.title}
                </span>
                <span className="text-[10px] text-emerald-400">Live Stream</span>
              </div>

              <div className="flex-1 w-full h-full bg-slate-900/20 relative">
                {embedViewerUrl ? (
                  <iframe
                    src={embedViewerUrl}
                    title="Question Paper Preview"
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 px-6 text-center">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <BookOpen size={36} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Interactive Syllabus Workspace</h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Active syllabus derivation primed for {currentDoc.subject}. Speak to Sarah or ask her to summarize and solve questions on the right.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('solver')}
                      className="md:hidden px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      Open Solver Workspace
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: AI Solver & Reader Engine */}
            <div
              className={`w-full md:w-[480px] h-full bg-[#0c1427] flex flex-col shrink-0 ${
                activeTab === 'solver' ? 'flex' : 'hidden md:flex'
              }`}
            >
              <div className="p-3.5 border-b border-white/10 bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs font-mono">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>SARAH EXAM READER & SOLVER</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Gemini Flash Live</span>
              </div>

              {/* Solution Workspace */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto font-sans text-xs text-slate-200 space-y-4 custom-scrollbar">
                {isSolving ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3 text-cyan-400 font-mono text-xs">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Analyzing document text & explaining derivation...</span>
                  </div>
                ) : solution ? (
                  <div className="leading-relaxed whitespace-pre-wrap font-sans bg-slate-900/70 p-4 rounded-xl border border-white/5 shadow-inner">
                    {solution}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                      <Terminal size={20} />
                    </div>
                    <p className="text-xs leading-normal">
                      Speak or click an action below to summarize or solve questions from this open file:
                    </p>
                    <div className="flex flex-wrap gap-1.5 justify-center pt-2">
                      {renderQuickPresets()}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area with Hands-Free Mic */}
              <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/70 flex items-center gap-2">
                <button
                  onClick={toggleVoice}
                  className={`p-2 rounded-xl border transition ${
                    isListening 
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse' 
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-cyan-400'
                  }`}
                  title="Speak to Sarah: 'summarize this', 'read question 2', etc."
                >
                  <Mic size={14} />
                </button>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSolveQuestion()}
                  placeholder="Ask Sarah: 'summarize this', 'solve Q2', etc..."
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40"
                />
                <button
                  disabled={isSolving || !prompt.trim()}
                  onClick={() => handleSolveQuestion()}
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold disabled:opacity-40 transition"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};

export default ExamPaperModal;