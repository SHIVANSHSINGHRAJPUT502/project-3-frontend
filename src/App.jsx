// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, Search, Bell, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

import { KineticBackground } from './components/KineticBackground.jsx';
import { SidebarNav } from './components/SidebarNav.jsx';
import { SubjectView } from './components/SubjectView.jsx';
import { DashboardView } from "./components/DashboardView.jsx";
import { SemesterView } from './components/SemesterView.jsx';
import { RelaxZoneView } from './components/RelaxZoneView.jsx';
import { AIChatPopup } from './components/AIChatPopup.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import SupportWidget from './components/SupportWidget.jsx';

const API = import.meta.env.VITE_API_URL || 'https://studynexusbackend.vercel.app';

function getDeviceVisitorId() {
  if (typeof window === 'undefined') return 'server_ssr';
  let id = localStorage.getItem('studynexus_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('studynexus_device_id', id);
  }
  return id;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [activeUsersCount, setActiveUsersCount] = useState(1);

  const [liveSubjects, setLiveSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const user = {
    displayName: "Shivansh Singh",
    photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=shivansh"
  };

  const fetchLiveSubjects = async () => {
    try {
      const res = await axios.get(`${API}/api/live-subjects`);
      if (Array.isArray(res.data)) setLiveSubjects(res.data);
    } catch (err) {
      console.error('Failed to load live subjects catalog', err);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/requests/recent`);
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load sidebar requests', err);
    }
  };

  const sendHeartbeatAndFetchUsers = async () => {
    try {
      const visitorId = getDeviceVisitorId();
      await axios.post(`${API}/api/heartbeat`, { visitorId });
      const res = await axios.get(`${API}/api/active-users`);
      if (res.data && typeof res.data.count === 'number') {
        setActiveUsersCount(res.data.count);
      } else if (res.data && typeof res.data.activeUsers === 'number') {
        setActiveUsersCount(res.data.activeUsers);
      }
    } catch (err) {
      console.error('Heartbeat sync error', err);
    }
  };

  useEffect(() => {
    fetchLiveSubjects();
    fetchRecentRequests();
    sendHeartbeatAndFetchUsers();

    const requestInterval = setInterval(fetchRecentRequests, 15000);
    const heartbeatInterval = setInterval(sendHeartbeatAndFetchUsers, 20000);

    return () => {
      clearInterval(requestInterval);
      clearInterval(heartbeatInterval);
    };
  }, []);

  const filteredSubjects = searchQuery.trim()
    ? liveSubjects
        .filter((item) => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 6)
    : [];

  if (location.pathname === '/admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 flex font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden w-full relative">
      <KineticBackground />

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div style={{ background: 'linear-gradient(to top right, #2563eb, #06b6d4, #60a5fa)' }} className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-md">Ω</div>
          <span style={{ background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="font-extrabold text-base tracking-wider">
            Study<span className="text-cyan-400">Nexus</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{activeUsersCount} Online</span>
          </div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-300 active:scale-95 transition-all">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <SidebarNav isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} requests={requests} activeUsersCount={activeUsersCount} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative pt-16 md:pt-0">
        <header className="h-20 border-b border-white/5 bg-slate-950/30 backdrop-blur-2xl flex items-center px-4 sm:px-6 md:px-10 justify-between relative z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="max-w-md w-full relative hidden sm:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search subjects, PYQs, and notes in database..."
                value={searchQuery}
                onFocus={() => setSearchDropdownOpen(true)}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchDropdownOpen(true); }}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-inner"
              />

              {isSearchDropdownOpen && filteredSubjects.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-[#0b1220]/95 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">Live Database Records Found</div>
                  {filteredSubjects.map((item) => (
                    <button
                      key={`${item.sem}-${item.name}`}
                      onClick={() => { navigate(`/subject/${item.sem}/${encodeURIComponent(item.name)}`); setSearchQuery(''); setSearchDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-cyan-400" />
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Sem {item.sem}</span>
                    </button>
                  ))}
                </div>
              )}
              {isSearchDropdownOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setSearchDropdownOpen(false)} />}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Users size={13} className="text-emerald-400" />
              <span className="font-semibold">{activeUsersCount} Active</span>
            </div>
            <button className="p-2.5 bg-slate-900/60 border border-white/5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors relative hidden xs:block">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-white/10 shadow-md object-cover bg-slate-800" />
              <button onClick={() => alert("Cloud session isolated.")} className="p-2 bg-slate-900/80 border border-white/5 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all font-semibold text-[11px] sm:text-xs">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col justify-between">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/semester/:semId" element={<SemesterView />} />
              <Route path="/relax" element={<RelaxZoneView />} />
              <Route path="/subject/:semId/:subjectName" element={<SubjectView />} />
            </Routes>
          </div>

          <footer className="mt-16 pt-6 pb-2 border-t border-white/5 text-center shrink-0">
            <p className="text-[11px] font-mono text-slate-500 tracking-wider">
              ENGINEERED BY{' '}
              <span className="text-slate-300 font-semibold hover:text-cyan-400 transition-colors cursor-default">
                SHIVANSH SINGH RAJPUT
              </span>
              <span className="mx-2 text-slate-700">•</span>
              STUDYNEXUS CORE v2.5
            </p>
          </footer>
        </main>

        <SupportWidget onSubmitted={fetchRecentRequests} />

        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex items-center justify-center">
          {!isChatOpen && (
            <motion.div animate={{ scale: [1, 1.28, 1], opacity: [0.35, 0.7, 0.35] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 rounded-full bg-cyan-500/25 blur-lg pointer-events-none" />
          )}
          <motion.button 
            whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.94 }} onClick={() => setChatOpen(!isChatOpen)}
            style={{
              background: isChatOpen ? '#e11d48' : 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 50%, #3b82f6 100%)',
              boxShadow: isChatOpen ? '0 0 35px 8px rgba(225, 29, 72, 0.45)' : '0 0 32px 6px rgba(6, 182, 212, 0.35)'
            }}
            className="relative px-5 sm:px-7 h-14 sm:h-16 rounded-full flex items-center gap-2.5 sm:gap-3 font-semibold text-xs sm:text-sm text-white transition-all duration-300 shadow-2xl border border-white/20"
          >
            {isChatOpen ? <X size={18} /> : <Sparkles size={18} className="text-cyan-200 animate-pulse" />}
            <span className="font-extrabold tracking-tight uppercase">{isChatOpen ? 'Close' : 'ASK SARA'}</span>
          </motion.button>
        </div>

        <AIChatPopup isOpen={isChatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </div>
  );
}