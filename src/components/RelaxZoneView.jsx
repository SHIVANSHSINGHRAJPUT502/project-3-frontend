// src/components/RelaxZoneView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Zap, Target, Keyboard, Fish } from 'lucide-react';
import SnakeGame from './SnakeGame.jsx';
import BubbleShooter from './BubbleShooter.jsx';
import TypingTest from './TypingTest.jsx';
import AimTrainer from './AimTrainer.jsx';

const GAMES = [
  {
    id: 'snake',
    label: 'Snake',
    icon: Fish,
    tag: 'CLASSIC',
    desc: 'Eat. Grow. Survive.',
    accent: 'from-emerald-500 to-cyan-500',
    glow: 'shadow-emerald-500/30',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    dot: 'bg-emerald-400',
  },
  {
    id: 'bubble',
    label: 'Bubble Shooter',
    icon: Zap,
    tag: 'ARCADE',
    desc: 'Aim. Pop. Chain.',
    accent: 'from-pink-500 to-purple-500',
    glow: 'shadow-pink-500/30',
    border: 'border-pink-500/30',
    bg: 'bg-pink-500/5',
    dot: 'bg-pink-400',
  },
  {
    id: 'typing',
    label: 'Typing Test',
    icon: Keyboard,
    tag: 'SKILL',
    desc: 'Speed. Accuracy. Flow.',
    accent: 'from-blue-500 to-indigo-500',
    glow: 'shadow-blue-500/30',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    dot: 'bg-blue-400',
  },
  {
    id: 'aim',
    label: 'Aim Trainer',
    icon: Target,
    tag: 'REFLEX',
    desc: 'Click. React. Dominate.',
    accent: 'from-orange-500 to-rose-500',
    glow: 'shadow-orange-500/30',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    dot: 'bg-orange-400',
  },
];

// Animated particle background with safe closure state
const ParticleCanvas = ({ dependency }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    // 1. Initialize the particle pool first so the boundary checks have access to it
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * (canvas.offsetWidth || window.innerWidth),
      y: Math.random() * (canvas.offsetHeight || window.innerHeight),
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.1,
      color: ['#22d3ee', '#a855f7', '#ec4899', '#34d399', '#f97316'][Math.floor(Math.random() * 5)],
    }));

    // 2. Define sizing mechanics safely below the initialization declaration
    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
      
      particles.forEach(p => {
        if (p.x > canvas.width) p.x = Math.random() * canvas.width;
        if (p.y > canvas.height) p.y = Math.random() * canvas.height;
      });
    };
    
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [dependency]); // Redraws dynamically when active layout panels flip

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
};

export const RelaxZoneView = () => {
  const [activeGame, setActiveGame] = useState(null);

  const active = GAMES.find(g => g.id === activeGame);

  return (
    <div className="min-h-screen bg-[#050810] relative overflow-x-hidden select-none">
      {/* Grid line background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <ParticleCanvas dependency={activeGame} />

      <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto flex flex-col min-h-screen">

        {/* Header */}
        <div className="mb-10 text-center shrink-0">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4 backdrop-blur-sm">
            <Gamepad2 size={13} className="text-cyan-400" />
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Relax Zone</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Game Heaven
            </span>
          </h1>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Drop the books. Pick a game. Recharge.
          </p>
        </div>

        {/* Game Selector Cards */}
        {!activeGame && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-auto py-4">
            {GAMES.map((game) => {
              const Icon = game.icon;
              return (
                <button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className={`group relative ${game.bg} border ${game.border} rounded-3xl p-6 text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${game.glow} overflow-hidden backdrop-blur-sm`}
                >
                  {/* Glow orb */}
                  <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${game.accent} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-300`} />

                  <div className="relative z-10">
                    <span className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4 block">{game.tag}</span>

                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${game.accent} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={22} className="text-white" />
                    </div>

                    <h3 className="text-lg font-black text-white mb-1 tracking-tight">{game.label}</h3>
                    <p className="text-xs text-slate-500 font-mono">{game.desc}</p>

                    <div className={`mt-5 h-0.5 w-8 rounded-full bg-gradient-to-r ${game.accent} group-hover:w-full transition-all duration-500`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Game Area */}
        {activeGame && (
          <div className="space-y-4 flex-1 flex flex-col justify-start">
            {/* Game header bar */}
            <div className={`flex items-center justify-between bg-slate-950/60 border ${active.border} rounded-2xl px-5 py-3 backdrop-blur-sm shrink-0`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${active.dot} animate-pulse`} />
                <span className="text-white font-black text-sm tracking-wide">{active.label}</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{active.tag}</span>
              </div>
              <button
                onClick={() => setActiveGame(null)}
                className="text-[11px] font-mono text-slate-400 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-lg transition-all bg-slate-900/40"
              >
                ← All Games
              </button>
            </div>

            {/* Game Component Wrapper Container */}
            <div className={`border ${active.border} rounded-3xl overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 min-h-[480px] transition-all duration-300`}>
              {activeGame === 'snake' && <SnakeGame />}
              {activeGame === 'bubble' && <BubbleShooter />}
              {activeGame === 'typing' && <TypingTest />}
              {activeGame === 'aim' && <AimTrainer />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};