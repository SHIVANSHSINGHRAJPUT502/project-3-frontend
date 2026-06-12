import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Zap, Target, Clock } from 'lucide-react';

const WORD_POOLS = {
  CS: [
    'array', 'function', 'variable', 'boolean', 'integer', 'string', 'object',
    'class', 'method', 'return', 'import', 'export', 'async', 'await', 'promise',
    'callback', 'closure', 'prototype', 'algorithm', 'recursion', 'iteration',
    'database', 'server', 'client', 'request', 'response', 'api', 'endpoint',
    'component', 'render', 'state', 'props', 'hook', 'effect', 'context',
    'module', 'package', 'library', 'framework', 'deployment', 'docker',
    'git', 'commit', 'branch', 'merge', 'debug', 'console', 'terminal',
    'binary', 'hexadecimal', 'compile', 'runtime', 'syntax', 'semantic',
    'interface', 'abstract', 'inherit', 'polymorphism', 'encapsulation',
    'stack', 'queue', 'linked', 'hash', 'tree', 'graph', 'node', 'edge',
    'pointer', 'memory', 'cache', 'buffer', 'thread', 'process', 'socket',
  ],
};

const DURATIONS = [15, 30, 60];

const generateWords = (count = 60) => {
  const pool = WORD_POOLS.CS;
  return Array.from({ length: count }, () => pool[Math.floor(Math.random() * pool.length)]);
};

const TypingTest = () => {
  const [words] = useState(() => generateWords());
  const [typed, setTyped] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, running, done
  const [duration, setDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 0, correct: 0, incorrect: 0 });
  const [errors, setErrors] = useState(new Set());
  const [wordStatuses, setWordStatuses] = useState({});
  const inputRef = useRef(null);
  const intervalRef = useRef(null);
  const startTime = useRef(null);
  const correctChars = useRef(0);
  const totalChars = useRef(0);
  const wordsContainerRef = useRef(null);
  const activeWordRef = useRef(null);

  const reset = useCallback((newDuration = duration) => {
    clearInterval(intervalRef.current);
    setTyped('');
    setWordIdx(0);
    setCharIdx(0);
    setStatus('idle');
    setTimeLeft(newDuration);
    setErrors(new Set());
    setWordStatuses({});
    setStats({ wpm: 0, accuracy: 0, correct: 0, incorrect: 0 });
    correctChars.current = 0;
    totalChars.current = 0;
    startTime.current = null;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [duration]);

  useEffect(() => { reset(); }, []);

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            finishGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  // Auto-scroll active word into view
  useEffect(() => {
    if (activeWordRef.current && wordsContainerRef.current) {
      const container = wordsContainerRef.current;
      const word = activeWordRef.current;
      const wordTop = word.offsetTop;
      const containerScroll = container.scrollTop;
      const containerH = container.clientHeight;
      if (wordTop > containerScroll + containerH - 60) {
        container.scrollTo({ top: wordTop - 20, behavior: 'smooth' });
      }
    }
  }, [wordIdx]);

  const finishGame = () => {
    setStatus('done');
    const elapsed = (Date.now() - startTime.current) / 60000;
    const wpm = elapsed > 0 ? Math.round(correctChars.current / 5 / elapsed) : 0;
    const acc = totalChars.current > 0 ? Math.round((correctChars.current / totalChars.current) * 100) : 0;
    setStats(s => ({ ...s, wpm, accuracy: acc }));
  };

  const handleInput = (e) => {
    const value = e.target.value;

    if (status === 'idle') {
      setStatus('running');
      startTime.current = Date.now();
    }
    if (status === 'done') return;

    // Space = submit word
    if (value.endsWith(' ')) {
      const word = words[wordIdx];
      const typedWord = value.trim();
      const isCorrect = typedWord === word;

      totalChars.current += word.length;
      if (isCorrect) correctChars.current += word.length;

      setWordStatuses(s => ({ ...s, [wordIdx]: isCorrect ? 'correct' : 'wrong' }));
      setWordIdx(i => i + 1);
      setCharIdx(0);
      setTyped('');
      setErrors(new Set());

      // Update live wpm
      const elapsed = (Date.now() - startTime.current) / 60000;
      if (elapsed > 0) {
        const wpm = Math.round(correctChars.current / 5 / elapsed);
        setStats(s => ({ ...s, wpm }));
      }
      return;
    }

    setTyped(value);
    setCharIdx(value.length);

    // Track errors per char position
    const word = words[wordIdx];
    const newErrors = new Set();
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== word[i]) newErrors.add(i);
    }
    setErrors(newErrors);
  };

  const timerPct = (timeLeft / duration) * 100;
  const timerColor = timeLeft > duration * 0.5 ? '#22d3ee' : timeLeft > duration * 0.2 ? '#f97316' : '#f43f5e';

  return (
    <div className="flex flex-col items-center py-8 px-6 space-y-6 max-w-2xl mx-auto w-full">

      {/* Stats bar */}
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2">
          <Zap size={13} className="text-blue-400" />
          <span className="text-blue-400 font-black font-mono text-sm">{stats.wpm} WPM</span>
        </div>

        {/* Timer ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" width="48" height="48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke={timerColor} strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerPct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
            />
          </svg>
          <span className="font-black text-white text-xs font-mono">{timeLeft}</span>
        </div>

        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2">
          <Target size={13} className="text-indigo-400" />
          <span className="text-indigo-400 font-black font-mono text-sm">{stats.accuracy || '—'}%</span>
        </div>
      </div>

      {/* Duration selector */}
      {status === 'idle' && (
        <div className="flex gap-2">
          {DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => { setDuration(d); reset(d); }}
              className={`text-xs font-black px-4 py-1.5 rounded-lg border transition-all ${
                duration === d
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'border-white/10 text-slate-600 hover:text-slate-400'
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {status === 'done' ? (
        <div className="w-full bg-black/40 border border-blue-500/20 rounded-2xl p-8 text-center space-y-6">
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Results</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'WPM', value: stats.wpm, color: 'text-cyan-400', glow: 'bg-cyan-500/10 border-cyan-500/20' },
              { label: 'Accuracy', value: `${stats.accuracy}%`, color: 'text-indigo-400', glow: 'bg-indigo-500/10 border-indigo-500/20' },
              { label: 'Time', value: `${duration}s`, color: 'text-purple-400', glow: 'bg-purple-500/10 border-purple-500/20' },
            ].map(({ label, value, color, glow }) => (
              <div key={label} className={`${glow} border rounded-xl py-4 px-2`}>
                <p className={`font-black text-2xl ${color}`}>{value}</p>
                <p className="text-slate-600 text-[10px] font-mono uppercase mt-1">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-sm px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/30 mx-auto"
          >
            <RotateCcw size={14} /> Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Word display */}
          <div
            ref={wordsContainerRef}
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 h-36 overflow-hidden relative"
          >
            <div className="flex flex-wrap gap-x-2 gap-y-3">
              {words.map((word, wi) => {
                const isDone = wi < wordIdx;
                const isCurrent = wi === wordIdx;
                const status = wordStatuses[wi];

                return (
                  <span
                    key={wi}
                    ref={isCurrent ? activeWordRef : null}
                    className={`font-mono text-base relative ${
                      isDone
                        ? status === 'correct' ? 'text-emerald-400' : 'text-rose-400'
                        : isCurrent ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {word.split('').map((char, ci) => {
                      let color = '';
                      if (isCurrent) {
                        if (ci < typed.length) {
                          color = errors.has(ci) ? 'text-rose-400 bg-rose-500/10' : 'text-cyan-400';
                        }
                        if (ci === charIdx) color += ' underline decoration-cyan-400';
                      }
                      return (
                        <span key={ci} className={color}>
                          {char}
                        </span>
                      );
                    })}
                    {/* Cursor */}
                    {isCurrent && charIdx >= word.length && (
                      <span className="animate-pulse text-cyan-400">|</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            value={typed}
            onChange={handleInput}
            onPaste={e => e.preventDefault()}
            placeholder={status === 'idle' ? 'Start typing...' : ''}
            className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl px-5 py-3 text-white font-mono text-base outline-none transition-all placeholder:text-slate-700 caret-cyan-400"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          <button
            onClick={() => reset()}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 text-xs font-mono transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </>
      )}
    </div>
  );
};

export default TypingTest;
