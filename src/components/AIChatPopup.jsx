// src/components/AIChatPopup.jsx
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, Mic, Volume2, FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { useVoiceChat } from '../hooks/useVoiceChat.js';
import { ExamPaperModal } from './ExamPaperModal.jsx';

export const AIChatPopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const scrollTrackerRef = useRef(null);

  const {
    inputValue,
    setInputValue,
    messages,
    isTyping,
    loadingText,
    voiceStatus,
    shouldBeListening,
    activeExamDoc,
    setActiveExamDoc,
    isExamModalOpen,
    setIsExamModalOpen,
    speakSarah,
    toggleListening,
    handleDispatchMessage,
    cancelSpeech
  } = useVoiceChat();

  useEffect(() => {
    if (scrollTrackerRef.current) {
      scrollTrackerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleDispatchMessage();
  };

  const handleClose = () => {
    cancelSpeech();
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed bottom-20 md:bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 h-[70vh] sm:h-[530px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden text-white"
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(to right, rgba(37, 99, 235, 0.15), rgba(147, 51, 234, 0.15))' }} className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-sm text-white">ASK SARAH</h3>
                  <span className={`text-[10px] flex items-center gap-1 font-mono ${shouldBeListening ? 'text-rose-400 font-bold' : 'text-cyan-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${shouldBeListening ? 'bg-rose-500 animate-ping' : 'bg-rose-500'}`} /> 
                    {voiceStatus}
                  </span>
                </div>
              </div>
              <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Messages Screen */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto text-sm scrollbar-none">
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed group relative ${msg.sender === 'user' ? 'bg-blue-600 text-white font-medium rounded-tr-none' : 'bg-slate-800/60 border border-white/5 text-slate-300 rounded-tl-none whitespace-pre-wrap'}`}>
                    {msg.text}
                    {msg.sender === 'ai' && (
                      <button onClick={() => speakSarah(msg.text)} className="absolute -bottom-5 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-cyan-400 flex items-center gap-1 text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-white/10">
                        <Volume2 size={10} /> Replay Voice
                      </button>
                    )}
                  </div>

                  {/* Resource Cards */}
                  {msg.resources && msg.resources.length > 0 && (
                    <div className="mt-2.5 w-full max-w-[85%] space-y-1.5">
                      {msg.resources.map((res, rIdx) => (
                        <div key={rIdx} className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-2 shadow-md">
                          <div className="truncate flex-1">
                            <div className="flex items-center gap-1.5">
                              <FileText size={13} className="text-cyan-400 shrink-0" />
                              <p className="font-semibold text-xs text-white truncate">{res.title}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              Sem {res.semester} • {res.subject} {res.type ? `• ${res.type}` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setActiveExamDoc({
                                  id: res.id || res._id,
                                  title: res.title,
                                  subject: res.subject,
                                  semester: res.semester,
                                  url: res.url,
                                  type: res.type
                                });
                                setIsExamModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-[10px] border border-cyan-500/30 flex items-center gap-1 transition-colors"
                            >
                              <Sparkles size={10} />
                              <span>Exam Mode</span>
                            </button>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors"
                            >
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.semester && (
                    <button
                      onClick={() => { navigate(`/semester/${msg.semester}`); onClose(); }}
                      className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all"
                    >
                      <span>View all Semester {msg.semester} Subjects</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex w-full justify-start">
                  <div className="bg-slate-800/40 border border-white/5 px-4 py-2.5 rounded-xl rounded-tl-none text-cyan-400 flex items-center gap-2 text-xs font-mono">
                    <Loader2 size={12} className="animate-spin" />
                    {loadingText}
                  </div>
                </div>
              )}
              <div ref={scrollTrackerRef} />
            </div>

            {/* Input Controls */}
            <div className="p-3 bg-slate-950/50 border-t border-white/10 flex gap-3 items-center">
              <div className="relative flex items-center justify-center">
                <AnimatePresence>
                  {shouldBeListening && (
                    <>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        className="absolute w-11 h-11 bg-rose-500/30 rounded-xl pointer-events-none"
                      />
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.3 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: "easeOut" }}
                        className="absolute w-11 h-11 bg-rose-500/20 rounded-xl pointer-events-none"
                      />
                    </>
                  )}
                </AnimatePresence>

                <button 
                  onClick={toggleListening}
                  className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
                    shouldBeListening 
                      ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.6)]' 
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 shadow-inner'
                  }`}
                  title={shouldBeListening ? "Click to stop continuous mode" : "Start continuous voice chat"}
                >
                  {shouldBeListening ? (
                    <div className="flex items-end justify-center gap-[2.5px] h-4 w-5">
                      <motion.span animate={{ height: ["4px", "16px", "4px"] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} className="w-[3px] bg-white rounded-full" />
                      <motion.span animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 0.45, ease: "easeInOut", delay: 0.15 }} className="w-[3px] bg-white rounded-full" />
                      <motion.span animate={{ height: ["4px", "18px", "4px"] }} transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.05 }} className="w-[3px] bg-white rounded-full" />
                      <motion.span animate={{ height: ["4px", "10px", "4px"] }} transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut", delay: 0.2 }} className="w-[3px] bg-white rounded-full" />
                    </div>
                  ) : (
                    <Mic size={16} />
                  )}
                </button>
              </div>

              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={shouldBeListening ? "Hands-free active... speak freely" : "Type or click mic to talk..."} 
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-white placeholder:text-slate-500 transition-colors focus:border-white/20"
              />
              
              <button onClick={() => handleDispatchMessage()} style={{ background: 'linear-gradient(to right, #2563eb, #06b6d4)' }} className="p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Send size={16} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Workspace */}
      <ExamPaperModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        paperData={activeExamDoc}
      />
    </>
  );
};