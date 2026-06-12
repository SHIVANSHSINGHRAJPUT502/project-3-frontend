import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const W = 420;
const H = 520;
const ROWS = 8;
const COLS = 10;
const R = 18;
const COLORS = ['#f43f5e', '#a855f7', '#22d3ee', '#34d399', '#f97316', '#3b82f6'];
const GLOWS  = ['#f43f5e', '#a855f7', '#22d3ee', '#34d399', '#f97316', '#3b82f6'];

const colIdx = (c) => COLORS.indexOf(c);

const initGrid = () => {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = r < 5 ? COLORS[Math.floor(Math.random() * COLORS.length)] : null;
    }
  }
  return grid;
};

const bubbleCenter = (row, col) => ({
  x: col * R * 2 + R + (row % 2 === 1 ? R : 0) + 10,
  y: row * R * 1.75 + R + 10,
});

const BubbleShooter = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animRef = useRef(null);
  const [display, setDisplay] = useState({ score: 0, started: false, dead: false, won: false });

  const initState = () => ({
    grid: initGrid(),
    bullet: null,
    nextColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    currentColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    score: 0,
    running: false,
  });

  const getNeighbors = (grid, r, c) => {
    const offsets = r % 2 === 0
      ? [[-1,-1],[-1,0],[0,-1],[0,1],[1,-1],[1,0]]
      : [[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1]];
    return offsets
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc]);
  };

  const floodFill = (grid, r, c, color, visited = new Set()) => {
    const key = `${r},${c}`;
    if (visited.has(key)) return visited;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || grid[r][c] !== color) return visited;
    visited.add(key);
    getNeighbors(grid, r, c).forEach(([nr, nc]) => floodFill(grid, nr, nc, color, visited));
    return visited;
  };

  const removeFloating = (grid) => {
    const connected = new Set();
    for (let c = 0; c < COLS; c++) {
      if (grid[0][c]) {
        const visited = new Set();
        const stack = [[0, c]];
        while (stack.length) {
          const [r, col] = stack.pop();
          const key = `${r},${col}`;
          if (visited.has(key) || !grid[r][col]) continue;
          visited.add(key);
          connected.add(key);
          getNeighbors(grid, r, col).forEach(n => stack.push(n));
        }
      }
    }
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (grid[r][c] && !connected.has(`${r},${c}`)) grid[r][c] = null;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current) return;
    const ctx = canvas.getContext('2d');
    const { grid, bullet, currentColor, nextColor } = stateRef.current;

    ctx.clearRect(0, 0, W, H);

    // Background grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    for (let x = 0; x < W; x += 20)
      for (let y = 0; y < H - 80; y += 20) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }

    // Draw grid bubbles
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!grid[r][c]) continue;
        const { x, y } = bubbleCenter(r, c);
        const color = grid[r][c];
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(x, y, R - 2, 0, Math.PI * 2);
        ctx.fillStyle = color + 'cc';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Shine
        ctx.beginPath();
        ctx.arc(x - 4, y - 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fill();
      }
    }

    // Separator line
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(0, H - 80); ctx.lineTo(W, H - 80);
    ctx.stroke();
    ctx.setLineDash([]);

    // Shooter base
    const cx = W / 2;
    const cy = H - 40;

    // Aim guide dots
    if (stateRef.current.aimAngle !== undefined) {
      const angle = stateRef.current.aimAngle;
      for (let i = 1; i <= 8; i++) {
        const t = i * 30;
        const dx = Math.cos(angle) * t;
        const dy = Math.sin(angle) * t;
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.15 - i * 0.015})`;
        ctx.fill();
      }
    }

    // Current bubble on shooter
    ctx.shadowBlur = 20;
    ctx.shadowColor = currentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = currentColor + 'dd';
    ctx.fill();
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Next bubble indicator
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('NEXT', W - 55, H - 55);
    ctx.shadowBlur = 10;
    ctx.shadowColor = nextColor;
    ctx.beginPath();
    ctx.arc(W - 35, H - 35, 12, 0, Math.PI * 2);
    ctx.fillStyle = nextColor + 'cc';
    ctx.fill();
    ctx.strokeStyle = nextColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Bullet
    if (bullet) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = bullet.color;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, R - 2, 0, Math.PI * 2);
      ctx.fillStyle = bullet.color + 'ee';
      ctx.fill();
      ctx.strokeStyle = bullet.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, []);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (!s || !s.running) return;

    if (s.bullet) {
      s.bullet.x += s.bullet.vx;
      s.bullet.y += s.bullet.vy;

      // Wall bounce
      if (s.bullet.x - R < 10 || s.bullet.x + R > W - 10) s.bullet.vx *= -1;

      // Check grid collision
      let placed = false;
      for (let r = 0; r < ROWS && !placed; r++) {
        for (let c = 0; c < COLS && !placed; c++) {
          if (!s.grid[r][c]) continue;
          const { x, y } = bubbleCenter(r, c);
          const dist = Math.hypot(s.bullet.x - x, s.bullet.y - y);
          if (dist < R * 2) {
            // Find nearest empty cell
            let bestR = -1, bestC = -1, bestD = Infinity;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !s.grid[nr][nc]) {
                  const center = bubbleCenter(nr, nc);
                  const d = Math.hypot(s.bullet.x - center.x, s.bullet.y - center.y);
                  if (d < bestD) { bestD = d; bestR = nr; bestC = nc; }
                }
              }
            }
            if (bestR >= 0) {
              s.grid[bestR][bestC] = s.bullet.color;
              // Check matches
              const matches = floodFill(s.grid, bestR, bestC, s.bullet.color);
              if (matches.size >= 3) {
                matches.forEach(key => {
                  const [mr, mc] = key.split(',').map(Number);
                  s.grid[mr][mc] = null;
                });
                s.score += matches.size * 10;
                removeFloating(s.grid);
                setDisplay(d => ({ ...d, score: s.score }));
              }
              // Check lose condition
              if (s.grid[ROWS - 1].some(c => c !== null)) {
                s.running = false;
                cancelAnimationFrame(animRef.current);
                setDisplay(d => ({ ...d, dead: true }));
                return;
              }
              // Check win
              const allEmpty = s.grid.every(row => row.every(c => c === null));
              if (allEmpty) {
                s.running = false;
                cancelAnimationFrame(animRef.current);
                setDisplay(d => ({ ...d, won: true }));
                return;
              }
            }
            s.bullet = null;
            s.currentColor = s.nextColor;
            s.nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            placed = true;
          }
        }
      }

      // Top wall
      if (!placed && s.bullet.y - R < 10) {
        // Snap to top row
        const col = Math.round((s.bullet.x - 10 - R) / (R * 2));
        const clampedCol = Math.max(0, Math.min(COLS - 1, col));
        if (!s.grid[0][clampedCol]) s.grid[0][clampedCol] = s.bullet.color;
        s.bullet = null;
        s.currentColor = s.nextColor;
        s.nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    }

    draw();
    animRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  const shoot = useCallback((angle) => {
    const s = stateRef.current;
    if (!s || !s.running || s.bullet) return;
    const speed = 10;
    s.bullet = {
      x: W / 2, y: H - 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: s.currentColor,
    };
  }, []);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current?.running) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    const angle = Math.atan2(my - (H - 40), mx - W / 2);
    if (angle > -Math.PI && angle < 0) shoot(angle);
  }, [shoot]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current?.running) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    stateRef.current.aimAngle = Math.atan2(my - (H - 40), mx - W / 2);
  }, []);

  const startGame = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    stateRef.current = { ...initState(), running: true };
    setDisplay({ score: 0, started: true, dead: false, won: false });
    animRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => {
    stateRef.current = initState();
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div className="flex flex-col items-center py-8 px-4 space-y-5">
      <div className="flex items-center justify-between w-full max-w-[420px]">
        <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-2">
          <Trophy size={14} className="text-pink-400" />
          <span className="text-pink-400 font-black font-mono text-sm">{display.score}</span>
        </div>
        <p className="text-slate-600 text-xs font-mono">Click to shoot</p>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden border border-pink-500/20 bg-black/60 cursor-crosshair"
        style={{ boxShadow: '0 0 40px rgba(244,63,94,0.08)' }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', maxWidth: '100%' }} />

        {(!display.started || display.dead || display.won) && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-5 backdrop-blur-sm">
            <div className="text-5xl">{display.won ? '🏆' : display.dead ? '💥' : '🫧'}</div>
            <div className="text-center">
              <p className="text-white font-black text-xl">
                {display.won ? 'You Cleared It!' : display.dead ? 'Game Over' : 'Bubble Shooter'}
              </p>
              <p className="text-slate-400 text-sm mt-1 font-mono">
                {display.dead || display.won ? `Score: ${display.score}` : 'Click to aim and shoot bubbles'}
              </p>
            </div>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-sm px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-pink-500/30"
            >
              {display.dead || display.won ? <RotateCcw size={15} /> : <Play size={15} />}
              {display.dead || display.won ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BubbleShooter;
