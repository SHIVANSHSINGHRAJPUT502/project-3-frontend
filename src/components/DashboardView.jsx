// src/components/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Cpu, Activity, HardDrive, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const DashboardView = () => {
  const [metrics, setMetrics] = useState({ cpu: 42, latency: 12 });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * (48 - 38 + 1)) + 38,
        latency: Math.floor(Math.random() * (16 - 10 + 1)) + 10
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const semesters = [
    { id: 1, title: 'Semester 1', subjects: '4 Subjects', icon: '⚡', colorKey: 'blue', tag: 'Completed' },
    { id: 2, title: 'Semester 2', subjects: '3 Subjects', icon: '🔮', colorKey: 'purple', tag: 'Completed' },
    { id: 3, title: 'Semester 3', subjects: '4 Subjects', icon: '🧬', colorKey: 'amber', tag: 'Completed' },
    { id: 4, title: 'Semester 4', subjects: '5 Subjects', icon: '📡', colorKey: 'emerald', tag: 'Completed' },
    { id: 5, title: 'Semester 5', subjects: '5 Core Modules', icon: '🧠', colorKey: 'indigo', tag: 'Active' },
    { id: 6, title: 'Semester 6', subjects: '5 Subjects', icon: '⚙️', colorKey: 'rose', tag: 'Upcoming' },
    { id: 7, title: 'Semester 7', subjects: '4 Electives', icon: '🚀', colorKey: 'cyan', tag: 'Upcoming' },
    { id: 8, title: 'Semester 8', subjects: 'Project & Labs', icon: '🎓', colorKey: 'violet', tag: 'Upcoming' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="relative rounded-3xl p-8 md:p-10 overflow-hidden border border-white/5 bg-slate-900 shadow-2xl">
        <div style={{ background: 'radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, transparent 70%)' }} className="absolute -top-20 -right-20 w-96 h-96 blur-2xl pointer-events-none" />
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <Flame size={14} className="animate-pulse" /> Cloud Gateway Cluster Active
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Next-Gen Engineering Study Platform with <span style={{ background: 'linear-gradient(to right, #60a5fa, #22d3ee, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Integration</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">
            A production-ready environment built to host modular curriculum resources, dynamic reference assets, and an edge AI tutor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
              <Cpu size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Local CPU Utilization</p>
              <p className="text-lg font-black text-slate-200 mt-0.5">{metrics.cpu}%</p>
            </div>
          </div>
          <div className="text-right text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Optimal</div>
        </div>

        <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Mock API Gateway Latency</p>
              <p className="text-lg font-black text-slate-200 mt-0.5">{metrics.latency} ms</p>
            </div>
          </div>
          <div className="text-right text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">Edge CDN</div>
        </div>

        <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
              <HardDrive size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">DB Allocation Storage</p>
              <p className="text-lg font-black text-slate-200 mt-0.5">512 MB Cluster</p>
            </div>
          </div>
          <div className="text-right text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">Tier M0</div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Academic Matrices</h2>
          <p className="text-slate-400 text-sm">Select an active compilation pipeline below to access structural course items</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {semesters.map((sem) => (
            <GlassCard key={sem.id}>
              <div 
                style={{ 
                  background: sem.colorKey === 'blue' ? 'linear-gradient(to bottom, #2563eb, #06b6d4)' :
                              sem.colorKey === 'purple' ? 'linear-gradient(to bottom, #9333ea, #ec4899)' :
                              sem.colorKey === 'amber' ? 'linear-gradient(to bottom, #d97706, #f97316)' :
                              sem.colorKey === 'emerald' ? 'linear-gradient(to bottom, #059669, #14b8a6)' :
                              sem.colorKey === 'indigo' ? 'linear-gradient(to bottom, #4f46e5, #06b6d4)' :
                              sem.colorKey === 'rose' ? 'linear-gradient(to bottom, #e11d48, #f43f5e)' :
                              sem.colorKey === 'cyan' ? 'linear-gradient(to bottom, #0891b2, #3b82f6)' :
                              'linear-gradient(to bottom, #7c3aed, #d946ef)'
                }} 
                className="absolute top-0 left-0 w-1.5 h-full" 
              />
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center text-xl shadow-inner">
                  {sem.icon}
                </div>
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                  sem.tag === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  sem.tag === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  'bg-slate-800 text-slate-400 border-white/5'
                }`}>{sem.tag}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{sem.title}</h3>
              <p className="text-xs text-slate-400 font-medium mb-4">{sem.subjects}</p>
              <div style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }} className="w-full h-[2px] my-4" />
              <Link to={`/semester/${sem.id}`} className="w-full py-2.5 bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all border border-white/5 hover:border-transparent group/btn">
                Launch Space <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};