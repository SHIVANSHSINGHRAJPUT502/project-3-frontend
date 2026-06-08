// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Coffee, Menu, X, Sparkles, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubjectView } from './components/SubjectView.jsx';


import { DashboardView } from "./components/DashboardView.jsx";
import { SemesterView } from './components/SemesterView.jsx';
import { RelaxZoneView } from './components/RelaxZoneView.jsx';
import { AIChatPopup } from './components/AIChatPopup.jsx';
import AdminPanel from './components/AdminPanel.jsx';

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const location = useLocation();

  const user = {
    displayName: "Shivansh Singh",
    photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=shivansh"
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // Render admin panel standalone — no sidebar/header
  if (location.pathname === '/admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex font-sans antialiased selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden w-full">
      
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div style={{ background: 'linear-gradient(to top right, #2563eb, #06b6d4, #60a5fa)' }} className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-md">Ω</div>
          <span style={{ background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="font-extrabold text-base tracking-wider">
            Study<span className="text-blue-500">Nexus</span>
          </span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-300 active:scale-95 transition-all">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed inset-y-0 left-0 z-50 md:z-40 md:relative 
        flex flex-col shrink-0 bg-slate-950 md:bg-slate-950/60 backdrop-blur-2xl border-r border-white/5 h-full transition-all duration-300
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-64'}
      `}>
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div style={{ background: 'linear-gradient(to top right, #2563eb, #06b6d4, #60a5fa)' }} className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">Ω</div>
            <span style={{ background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="font-extrabold text-lg tracking-wider">
              Study<span className="text-blue-500">Nexus</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 hover:bg-white/5 rounded-lg text-slate-400">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 md:mt-0">
          <Link to="/" onClick={handleLinkClick} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm border ${location.pathname === '/' || location.pathname.includes('/semester') ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-inner' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={20} />
            <span>System Dashboard</span>
          </Link>
          <Link to="/relax" onClick={handleLinkClick} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm border ${location.pathname === '/relax' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-inner' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Coffee size={20} />
            <span>Relax Zone</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/5 bg-slate-950/40 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Node ID: Panipat_N1</span>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative pt-16 md:pt-0">
        
        <header className="h-20 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center px-4 sm:px-6 md:px-10 justify-between relative z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="max-w-md w-full relative hidden sm:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Query active core subject datasets..." className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/30 transition-colors text-slate-200 placeholder:text-slate-500" />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-2.5 bg-slate-900/50 border border-white/5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors relative hidden xs:block">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <div className="h-9 w-[1px] bg-white/5 hidden xs:block" />
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-white/10 shadow-md object-cover bg-slate-800" />
              <button onClick={() => alert("Cloud stack separation initialized.")} className="p-2 bg-slate-900/80 border border-white/5 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all flex items-center gap-1 font-semibold text-[11px] sm:text-xs">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090d16] via-[#0d1322] to-[#090d16] p-4 sm:p-6 md:p-8">
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/semester/:semId" element={<SemesterView />} />
            <Route path="/relax" element={<RelaxZoneView />} />
            <Route path="/subject/:semId/:subjectName" element={<SubjectView />} />
          </Routes>
        </main>

        <motion.button 
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(!isChatOpen)}
          style={{
            background: isChatOpen ? '#e11d48' : 'linear-gradient(135deg, #2563eb 0%, #06b6d4 50%, #60a5fa 100%)',
            boxShadow: isChatOpen ? '0 0 35px 6px rgba(225, 29, 72, 0.45)' : '0 0 30px 8px rgba(37, 99, 235, 0.35)',
            zIndex: 50 
          }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 px-4 sm:px-6 h-14 sm:h-16 rounded-full flex items-center gap-2 sm:gap-3 font-semibold text-xs sm:text-sm text-white group transition-all duration-300 shadow-2xl"
        >
          <div className={`transition-transform duration-500 ${isChatOpen ? 'rotate-180' : 'rotate-0'}`}>
            {isChatOpen ? <X size={18} /> : <Sparkles size={18} className="text-amber-300 animate-pulse" />}
          </div>
          <span className="font-extrabold tracking-tight uppercase">
            {isChatOpen ? 'Close' : 'ASK SARA'}
          </span>
        </motion.button>

        <div className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <AIChatPopup isOpen={isChatOpen} onClose={() => setChatOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}