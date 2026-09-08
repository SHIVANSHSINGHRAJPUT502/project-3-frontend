// src/components/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Cpu, Activity, HardDrive, ArrowRight, Sparkles, Orbit } from 'lucide-react';
import { motion } from 'framer-motion';
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
    { id: 7, title: 'Semester 7', subjects: '5 subjects', icon: '🚀', colorKey: 'cyan', tag: 'Active' },
    { id: 8, title: 'Semester 8', subjects: 'Project & Labs', icon: '🎓', colorKey: 'violet', tag: 'Upcoming' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 md:space-y-12 relative z-10">
      
      {/* ── 1. 3D Floating Hero Console (Moves autonomously in zero-g) ── */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotateX: [0, 1.2, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
        className="relative rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden border border-white/10 bg-slate-950/40 backdrop-blur-2xl shadow-[0_15px_45px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)] group"
      >
        {/* Autonomous Orbiting Ring Light behind Hero */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full border border-cyan-500/20 border-dashed pointer-events-none"
        />

        {/* Internal Pulsing Plasma Glow */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.45, 0.2]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-400/25 blur-3xl pointer-events-none"
        />

        <div className="max-w-2xl relative z-10 space-y-4" style={{ transform: 'translateZ(30px)' }}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.25)]">
            <motion.span 
              animate={{ scale: [1, 1.5, 1] }} 
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-400"
            />
            <Flame size={14} className="text-cyan-400" />
            <span>Cloud Gateway Cluster Active</span>
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

          <p className="text-slate-300/80 text-sm md:text-base font-medium leading-relaxed max-w-xl">
            A production-ready environment built to host modular curriculum resources, dynamic reference assets, and an edge AI tutor.
          </p>
        </div>
      </motion.div>

      {/* ── 2. Live 3D Telemetry Metrics with Dynamic Gauges ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-cyan-500/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shadow-sm group-hover:rotate-6 transition-transform">
              <Cpu size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Local CPU Utilization</p>
              <p className="text-lg font-black text-slate-100 mt-0.5 font-mono">{metrics.cpu}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Optimal</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 shadow-sm group-hover:rotate-6 transition-transform">
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
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-amber-500/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shadow-sm group-hover:rotate-6 transition-transform">
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
        </motion.div>
      </div>

      {/* ── 3. Academic Matrices with Autonomous 3D Kinetic Glass Cards ── */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Academic Matrices</h2>
          </div>
          <p className="text-slate-400 text-sm mt-1">Select an active compilation pipeline below to access structural course items</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {semesters.map((sem, index) => (
            <GlassCard key={sem.id} index={index}>
              {/* Vertical Color Pillar */}
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
                {/* 3D Floating Icon Box */}
                <motion.div 
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:border-cyan-500/40 transition-colors"
                >
                  {sem.icon}
                </motion.div>
                
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                  sem.tag === 'Active' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]' :
                  sem.tag === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  'bg-slate-800/80 text-slate-400 border-white/10'
                }`}>{sem.tag}</span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors tracking-tight">
                {sem.title}
              </h3>
              <p className="text-sm text-slate-400 font-medium mb-4">{sem.subjects}</p>
              
              <div style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)' }} className="w-full h-[1px] my-4" />
              
              {/* Tactile 3D Action Button */}
              <Link 
                to={`/semester/${sem.id}`} 
                className="w-full py-2.5 bg-slate-800/60 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 hover:font-bold rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all border border-white/10 hover:border-transparent group/btn shadow-md active:scale-95"
              >
                <span>Launch Space</span>
                <ArrowRight size={14} className="group-hover/btn:translate-x-1.5 transition-transform" />
              </Link>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;