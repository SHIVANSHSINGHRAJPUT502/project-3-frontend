// src/components/SidebarNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Coffee, X, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SidebarNav = ({
  isOpen,
  onClose,
  requests = [],
  activeUsersCount = 1
}) => {
  const location = useLocation();

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 md:z-40 md:sticky md:top-0
          flex flex-col shrink-0 bg-slate-950/90 md:bg-slate-950/50 backdrop-blur-2xl border-r border-white/5 h-screen transition-all duration-300 overflow-hidden
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-64'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div
              style={{
                background: 'linear-gradient(to top right, #2563eb, #06b6d4, #60a5fa)'
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-cyan-500/20"
            >
              Ω
            </div>
            <span
              style={{
                background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
              className="font-extrabold text-lg tracking-wider"
            >
              Study<span className="text-cyan-400">Nexus</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-white/5 rounded-lg text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="p-4 space-y-2 shrink-0">
          <Link
            to="/"
            onClick={handleLinkClick}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-sm border ${
              location.pathname === '/' || location.pathname.includes('/semester')
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[inset_0_1px_0_0_rgba(6,182,212,0.2)]'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>System Dashboard</span>
          </Link>
          <Link
            to="/relax"
            onClick={handleLinkClick}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-sm border ${
              location.pathname === '/relax'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[inset_0_1px_0_0_rgba(6,182,212,0.2)]'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Coffee size={18} />
            <span>Relax Zone</span>
          </Link>
        </div>

        {/* Live Requests Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-2 border-t border-white/5 space-y-2 custom-scrollbar">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <span>📑</span> Recent Requests
            </span>
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
              {requests.length}
            </span>
          </div>

          <div className="space-y-2">
            {requests.length === 0 ? (
              <p className="text-[11px] text-slate-500 font-mono px-2 py-4 text-center bg-slate-900/30 rounded-xl border border-white/5">
                No active requests
              </p>
            ) : (
              requests.map((req) => (
                <div
                  key={req._id}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all text-left group hover:shadow-lg hover:shadow-cyan-500/5"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[100px]">
                      {req.name || 'Student'}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      S{req.semester}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {req.message}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.04] text-[8px] text-slate-500 font-mono">
                    <span className="flex items-center gap-0.5">
                      <Clock size={8} /> {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 size={8} /> In Queue
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Footer Indicator */}
        <div className="p-4 border-t border-white/5 bg-slate-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider">
              {activeUsersCount} Active {activeUsersCount === 1 ? 'User' : 'Users'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
            Online
          </span>
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;