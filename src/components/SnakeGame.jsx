import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const COLS = 20;
const ROWS = 20;
const CELL = 24;
const INIT_SNAKE = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
const INIT_DIR = { x: 1, y: 0 };
const SPEEDS = { Easy: 180, Medium: 110, Hard: 60 };

const randomFood = (snake) => {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
};

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    snake: INIT_SNAKE,
    dir: INIT_DIR,
    nextDir: INIT_DIR,
    food: { x: 15, y: 10 },
    score: 0,
    running: false,
    dead: false,
  });
  const [display, setDisplay] = useState({ score: 0, dead: false, started: false });
  const [difficulty, setDifficulty] = useState('Medium');
  const intervalRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { snake, food } = stateRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        ctx.beginPath();
        ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Food glow
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#f97316';
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.roundRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((seg, i) => {
      const isHead = i === 0;
      const alpha = isHead ? 1 : Math.max(0.25, 1 - (i / snake.length) * 0.6);
      ctx.shadowBlur = isHead ? 20 : 8;
      ctx.shadowColor = '#34d399';
      ctx.fillStyle = isHead ? '#34d399' : `rgba(52,211,153,${alpha})`;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, isHead ? 7 : 5);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    s.dir = s.nextDir;
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

    // Wall or self collision
    if (
      head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
      s.snake.some(seg => seg.x === head.x && seg.y === head.y)
    ) {
      s.running = false;
      s.dead = true;
      clearInterval(intervalRef.current);
      setDisplay(d => ({ ...d, dead: true }));
      return;
    }

    const ate = head.x === s.food.x && head.y === s.food.y;
    const newSnake = [head, ...s.snake];
    if (!ate) newSnake.pop();
    else {
      s.food = randomFood(newSnake);
      s.score += 10;
      setDisplay(d => ({ ...d, score: s.score }));
    }
    s.snake = newSnake;
    draw();
  }, [draw]);

  const startGame = useCallback(() => {
    clearInterval(intervalRef.current);
    const initSnake = [...INIT_SNAKE.map(s => ({ ...s }))];
    stateRef.current = {
      snake: initSnake,
      dir: { ...INIT_DIR },
      nextDir: { ...INIT_DIR },
      food: randomFood(initSnake),
      score: 0,
      running: true,
      dead: false,
    };
    setDisplay({ score: 0, dead: false, started: true });
    intervalRef.current = setInterval(tick, SPEEDS[difficulty]);
  }, [difficulty, tick]);

  useEffect(() => {
    draw();
    return () => clearInterval(intervalRef.current);
  }, [draw]);

  useEffect(() => {
    const handleKey = (e) => {
      const s = stateRef.current;
      if (!s.running) return;
      const map = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
        a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      };
      const next = map[e.key];
      if (!next) return;
      if (next.x !== -s.dir.x || next.y !== -s.dir.y) s.nextDir = next;
      e.preventDefault();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Mobile swipe
  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e) => {
    if (!touchStart.current || !stateRef.current.running) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const s = stateRef.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      const next = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      if (next.x !== -s.dir.x) s.nextDir = next;
    } else {
      const next = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      if (next.y !== -s.dir.y) s.nextDir = next;
    }
  };

  return (
    <div className="flex flex-col items-center py-8 px-4 space-y-6">
      {/* Score + difficulty */}
      <div className="flex items-center justify-between w-full max-w-[480px]">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
          <Trophy size={14} className="text-emerald-400" />
          <span className="text-emerald-400 font-black font-mono text-sm">{display.score}</span>
        </div>
        <div className="flex gap-1.5">
          {Object.keys(SPEEDS).map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all ${
                difficulty === d
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'border-white/10 text-slate-600 hover:text-slate-400'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-black/60"
        style={{ boxShadow: '0 0 40px rgba(52,211,153,0.08)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} />

        {/* Overlay */}
        {(!display.started || display.dead) && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-5 backdrop-blur-sm">
            {display.dead ? (
              <>
                <div className="text-5xl font-black text-white">💀</div>
                <div className="text-center">
                  <p className="text-white font-black text-xl">Game Over</p>
                  <p className="text-slate-400 text-sm mt-1 font-mono">Score: {display.score}</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl">🐍</div>
                <div className="text-center">
                  <p className="text-white font-black text-xl">Snake</p>
                  <p className="text-slate-500 text-xs mt-1">Arrow keys or WASD to move</p>
                </div>
              </>
            )}
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black text-sm px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
            >
              {display.dead ? <RotateCcw size={15} /> : <Play size={15} />}
              {display.dead ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>

      <p className="text-slate-700 text-xs font-mono">Arrow keys / WASD · Swipe on mobile</p>
    </div>
  );
};

export default SnakeGame;
