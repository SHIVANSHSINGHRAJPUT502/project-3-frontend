import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Target, Zap, Clock } from 'lucide-react';

const W = 560;
const H = 380;
const TOTAL_TARGETS = 20;
const MODES = {
  Precision: { minR: 28, maxR: 42, spawnDelay: 1800, timeLimit: 3000 },
  Flicker:   { minR: 16, maxR: 26, spawnDelay: 900,  timeLimit: 1500 },
  Tracking:  { minR: 22, maxR: 32, spawnDelay: 1200, timeLimit: 2200 },
};

const randBetween = (a, b) => Math.random() * (b - a) + a;

const AimTrainer = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef({ targets: [], score: 0, hits: 0, misses: 0, times: [] });
  const animRef = useRef(null);
  const spawnRef = useRef(null);
  const [gameState, setGameState] = useState('idle'); // idle, running, done
  const [mode, setMode] = useState('Precision');
  const [display, setDisplay] = useState({ score: 0, hits: 0, misses: 0, remaining: TOTAL_TARGETS });
  const [results, setResults] = useState(null);
  const totalSpawned = useRef(0);

  const spawnTarget = useCallback(() => {
    const cfg = MODES[mode];
    const r = randBetween(cfg.minR, cfg.maxR);
    const target = {
      id: Date.now() + Math.random(),
      x: randBetween(r + 10, W - r - 10),
      y: randBetween(r + 10, H - r - 10),
      r,
      spawnTime: Date.now(),
      timeLimit: cfg.timeLimit,
      alpha: 0,
      scale: 0.3,
      color: ['#f43f5e', '#a855f7', '#22d3ee', '#34d399', '#f97316'][Math.floor(Math.random() * 5)],
    };
    stateRef.current.targets.push(target);

    // Auto-expire
    setTimeout(() => {
      const s = stateRef.current;
      const idx = s.targets.findIndex(t => t.id === target.id);
      if (idx !== -1) {
        s.targets.splice(idx, 1);
        s.misses++;
        setDisplay(d => ({ ...d, misses: s.misses }));
      }
    }, cfg.timeLimit);
  }, [mode]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.fillStyle = 'rgba(255,255,255,0.015)';
    for (let x = 0; x < W; x += 30)
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }

    const now = Date.now();
    stateRef.current.targets.forEach(t => {
      const age = now - t.spawnTime;
      const lifeRatio = age / t.timeLimit;

      // Animate in
      t.alpha = Math.min(1, t.alpha + 0.08);
      t.scale = Math.min(1, t.scale + 0.08);

      // Fade out near expiry
      const fadeAlpha = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;
      const finalAlpha = t.alpha * fadeAlpha;

      ctx.save();
      ctx.globalAlpha = finalAlpha;
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      // Outer ring pulse
      const pulse = 1 + Math.sin(age / 120) * 0.06;
      ctx.shadowBlur = 20;
      ctx.shadowColor = t.color;

      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, t.r * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Middle ring
      ctx.beginPath();
      ctx.arc(0, 0, t.r * 0.65 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = t.color + 'aa';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(0, 0, t.r * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = t.color;
      ctx.fill();

      // Timer arc
      const arcEnd = -Math.PI / 2 + (1 - lifeRatio) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(0, 0, t.r + 5, -Math.PI / 2, arcEnd);
      ctx.strokeStyle = t.color + '60';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Crosshair lines
      ctx.shadowBlur = 0;
      ctx.strokeStyle = t.color + '40';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-t.r * 1.4, 0); ctx.lineTo(t.r * 1.4, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -t.r * 1.4); ctx.lineTo(0, t.r * 1.4); ctx.stroke();

      ctx.restore();
    });

    animRef.current = requestAnimationFrame(draw);
  }, []);

  const handleClick = useCallback((e) => {
    if (gameState !== 'running') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);

    const s = stateRef.current;
    let hit = false;

    for (let i = s.targets.length - 1; i >= 0; i--) {
      const t = s.targets[i];
      if (Math.hypot(mx - t.x, my - t.y) <= t.r) {
        const reactionTime = Date.now() - t.spawnTime;
        s.times.push(reactionTime);
        s.hits++;
        s.score += Math.max(10, Math.round(300 - reactionTime / 10));
        s.targets.splice(i, 1);
        hit = true;

        setDisplay(d => ({
          ...d,
          score: s.score,
          hits: s.hits,
          remaining: TOTAL_TARGETS - totalSpawned.current,
        }));

        if (s.hits >= TOTAL_TARGETS) {
          endGame();
        }
        break;
      }
    }

    if (!hit) {
      s.misses++;
      setDisplay(d => ({ ...d, misses: s.misses }));
    }
  }, [gameState]);

  const endGame = useCallback(() => {
    setGameState('done');
    clearInterval(spawnRef.current);
    cancelAnimationFrame(animRef.current);
    const s = stateRef.current;
    const avgMs = s.times.length ? Math.round(s.times.reduce((a, b) => a + b, 0) / s.times.length) : 0;
    const acc = s.hits + s.misses > 0 ? Math.round((s.hits / (s.hits + s.misses)) * 100) : 0;
    setResults({ score: s.score, hits: s.hits, misses: s.misses, avgMs, accuracy: acc });
  }, []);

  const startGame = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    clearInterval(spawnRef.current);
    totalSpawned.current = 0;
    stateRef.current = { targets: [], score: 0, hits: 0, misses: 0, times: [] };
    setDisplay({ score: 0, hits: 0, misses: 0, remaining: TOTAL_TARGETS });
    setResults(null);
    setGameState('running');

    const cfg = MODES[mode];
    const spawn = () => {
      if (totalSpawned.current >= TOTAL_TARGETS) { clearInterval(spawnRef.current); return; }
      spawnTarget();
      totalSpawned.current++;
    };
    spawn();
    spawnRef.current = setInterval(spawn, cfg.spawnDelay);
    animRef.current = requestAnimationFrame(draw);
  }, [mode, spawnTarget, draw]);

  useEffect(() => {
    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(spawnRef.current);
    };
  }, [draw]);

  const modeColors = { Precision: 'orange', Flicker: 'rose', Tracking: 'purple' };
  const mc = modeColors[mode];

  return (
    <div className="flex flex-col items-center py-8 px-4 space-y-5">

      {/* Stats */}
      <div className="flex items-center gap-3 w-full max-w-[560px] justify-between">
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2">
          <Trophy size={13} className="text-orange-400" />
          <span className="text-orange-400 font-black font-mono text-sm">{display.score}</span>
        </div>
        <div className="flex gap-3 text-xs font-mono">
          <span className="text-emerald-400">{display.hits} hits</span>
          <span className="text-slate-700">·</span>
          <span className="text-rose-400">{display.misses} miss</span>
          <span className="text-slate-700">·</span>
          <span className="text-slate-500">{display.remaining} left</span>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-2xl overflow-hidden border border-orange-500/20 bg-black/60 cursor-crosshair w-full max-w-[560px]"
        style={{ boxShadow: '0 0 40px rgba(249,115,22,0.08)', aspectRatio: `${W}/${H}` }}
        onClick={handleClick}
      >
        <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', width: '100%', height: '100%' }} />

        {/* Idle overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-5 backdrop-blur-sm">
            <div className="text-5xl">🎯</div>
            <div className="text-center space-y-1">
              <p className="text-white font-black text-xl">Aim Trainer</p>
              <p className="text-slate-500 text-xs">Hit {TOTAL_TARGETS} targets as fast as you can</p>
            </div>
            <div className="flex gap-2">
              {Object.keys(MODES).map(m => (
                <button
                  key={m}
                  onClick={(e) => { e.stopPropagation(); setMode(m); }}
                  className={`text-xs font-black px-4 py-2 rounded-xl border transition-all ${
                    mode === m
                      ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                      : 'border-white/10 text-slate-500 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black text-sm px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/30"
            >
              <Play size={15} /> Start Training
            </button>
          </div>
        )}

        {/* Results overlay */}
        {gameState === 'done' && results && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-5 backdrop-blur-sm">
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Session Complete</p>
            <div className="grid grid-cols-2 gap-3 w-64">
              {[
                { label: 'Score', value: results.score, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                { label: 'Accuracy', value: `${results.accuracy}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Avg Reaction', value: `${results.avgMs}ms`, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                { label: 'Misses', value: results.misses, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} border rounded-xl p-3 text-center`}>
                  <p className={`font-black text-lg ${color}`}>{value}</p>
                  <p className="text-slate-600 text-[10px] font-mono uppercase">{label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black text-sm px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/30"
            >
              <RotateCcw size={14} /> Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-slate-700 text-xs font-mono">Click the glowing targets · Smaller = more points</p>
    </div>
  );
};

export default AimTrainer;
