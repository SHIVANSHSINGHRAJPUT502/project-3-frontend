// src/components/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Cpu, Activity, HardDrive, ArrowRight, Sparkles } from 'lucide-react';
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
    { id: 1, title: 'Semester 1', subjects: '5 Subjects', icon: '⚡', colorKey: 'blue', tag: 'Completed' },
    { id: 2, title: 'Semester 2', subjects: '4 Subjects', icon: '🔮', colorKey: 'purple', tag: 'Completed' },
    { id: 3, title: 'Semester 3', subjects: '6 Subjects', icon: '🧬', colorKey: 'amber', tag: 'Completed' },
    { id: 4, title: 'Semester 4', subjects: '6 Subjects', icon: '📡', colorKey: 'emerald', tag: 'Completed' },
    { id: 5, title: 'Semester 5', subjects: '5 Core Modules', icon: '🧠', colorKey: 'indigo', tag: 'Completed' },
    { id: 6, title: 'Semester 6', subjects: '5 Subjects', icon: '⚙️', colorKey: 'rose', tag: 'Completed' },
    { id: 7, title: 'Semester 7', subjects: '5 Subjects', icon: '🚀', colorKey: 'cyan', tag: 'Active' },
    { id: 8, title: 'Semester 8', subjects: 'Project & Labs', icon: '🎓', colorKey: 'violet', tag: 'Upcoming' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 md:space-y-10 relative z-10">
      
      {/* Centered, Clean Hero Section */}
      <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <Flame size={14} className="text-cyan-400" />
            <span>StudyNexus Intelligence Core Active</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Next-Gen Engineering Study Platform with{' '}
            <span style={{ 
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              AI Integration
            </span>
          </h1>

          <p className="text-slate-300/80 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
            A unified academic workspace hosting university curricula, previous years' examination papers, dynamic syllabus reference modules, and an AI derivation tutor.
          </p>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
              <Cpu size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Local CPU Utilization</p>
              <p className="text-lg font-black text-slate-100 mt-0.5 font-mono">{metrics.cpu}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Optimal</span>
          </div>
        </div>

        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Gateway Latency</p>
              <p className="text-lg font-black text-slate-100 mt-0.5 font-mono">{metrics.latency} ms</p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-full">
            Edge CDN
          </div>
        </div>

        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
              <HardDrive size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Cluster Storage</p>
              <p className="text-lg font-black text-slate-100 mt-0.5 font-mono">512 MB Cluster</p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
            Tier M0
          </div>
        </div>
      </div>

      {/* Academic Matrices */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Academic Matrices</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">Select an active compilation pipeline below to access structural course items</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {semesters.map((sem) => (
            <GlassCard key={sem.id}>
              {/* Left Pillar Indicator */}
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
                className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl z-20 pointer-events-none" 
              />
              
              <div className="pl-3 w-full flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-800/90 border border-white/10 flex items-center justify-center text-xl shadow-inner">
                      {sem.icon}
                    </div>
                    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                      sem.tag === 'Active' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' :
                      sem.tag === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-slate-800/80 text-slate-400 border-white/10'
                    }`}>{sem.tag}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {sem.title}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium mb-4">{sem.subjects}</p>
                </div>
                
                <div>
                  <div style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} className="w-full h-[1px] mb-4" />
                  
                  <Link 
                    to={`/semester/${sem.id}`} 
                    className="w-full py-2.5 bg-slate-800/60 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 hover:font-bold rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all border border-white/10 hover:border-transparent group/btn shadow-md active:scale-95"
                  >
                    <span>Launch Space</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;