// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Coffee, Menu, X, Sparkles, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

// Clean relative named-path component bindings
import { DashboardView } from "./components/DashboardView.jsx";
import { SemesterView } from './components/SemesterView.jsx';
import { RelaxZoneView } from './components/RelaxZoneView.jsx';
import { AIChatPopup } from './components/AIChatPopup.jsx';

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isChatOpen, setChatOpen] = useState(false);
  const location = useLocation();

  // Premium mock profile representing cloud infrastructure node parameters
  const user = {
    displayName: "Shivansh Singh",
    photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=shivansh"
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex font-sans antialiased selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* SIDEBAR NAVIGATION PANELS CONTAINER */}
      <aside className={`hidden md:flex flex-col shrink-0 transition-all duration-300 bg-slate-950/60 backdrop-blur-2xl border-r border-white/5 z-40 relative ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-20 px-6 flex items-center gap-3 border-b border-white/5">
          <div style={{ background: 'linear-gradient(to top right, #2563eb, #06b6d4, #60a5fa)' }} className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">Ω</div>
          {isSidebarOpen && (
            <span style={{ background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="font-extrabold text-lg tracking-wider">
              Study<span className="text-blue-500">Nexus</span>
            </span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm border ${location.pathname === '/' || location.pathname.includes('/semester') ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-inner' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={20} />
            {isSidebarOpen && <span>System Dashboard</span>}
          </Link>
          <Link to="/relax" className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm border ${location.pathname === '/relax' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-inner' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Coffee size={20} />
            {isSidebarOpen && <span>Relax Zone</span>}
          </Link>
        </nav>
        
        {isSidebarOpen && (
          <div className="p-4 border-t border-white/5 bg-slate-950/40 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Node ID: Panipat_N1</span>
          </div>
        )}
      </aside>

      {/* CORE VIEWPORT SHEET INTERFACE CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        <header className="h-20 border-b border-white/5 bg-slate-950/20 backdrop-blur-md flex items-center px-6 md:px-10 justify-between relative z-30">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-colors hidden md:block">
              <Menu size={20} />
            </button>
            <div className="max-w-md w-full relative hidden sm:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Query active core subject datasets..." className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/30 transition-colors text-slate-200 placeholder:text-slate-500" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-slate-900/50 border border-white/5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <div className="h-9 w-[1px] bg-white/5" />
            
            <div className="flex items-center gap-3">
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-xl border border-white/10 shadow-md object-cover bg-slate-800" />
              <button onClick={() => alert("Cloud stack separation initialized.")} className="p-2 bg-slate-900/80 border border-white/5 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all flex items-center gap-1.5 font-semibold text-xs">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* SUB-VIEW DISPATCH ROUTER LAYER */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090d16] via-[#0d1322] to-[#090d16]">
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/semester/:semId" element={<SemesterView />} />
            <Route path="/relax" element={<RelaxZoneView />} />
          </Routes>
        </main>

        {/* COPILOT FLOATING CONTROL ACTIVATION BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(!isChatOpen)}
          style={{
            background: isChatOpen ? '#e11d48' : 'linear-gradient(to right, #2563eb, #0891b2)',
            boxShadow: isChatOpen ? '0 20px 25px -5px rgba(225, 29, 72, 0.2)' : '0 20px 25px -5px rgba(37, 99, 235, 0.2)'
          }}
          className="fixed bottom-8 right-8 px-5 h-14 rounded-full flex items-center gap-2.5 font-semibold text-sm text-white z-50 group transition-all duration-300"
        >
          {isChatOpen ? <X size={18} /> : <Sparkles size={18} />}
          <span>{isChatOpen ? 'Close Assistant' : 'ASK SARA'}</span>
        </motion.button>

        <AIChatPopup isOpen={isChatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </div>
  );
}