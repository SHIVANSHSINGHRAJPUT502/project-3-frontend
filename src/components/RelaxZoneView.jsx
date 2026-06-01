// RelaxZoneView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Pause, Play, RotateCcw, Volume2, Trophy, HelpCircle, RefreshCw, CheckCircle2, AlertCircle, Gamepad2, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── LOCAL ESCAPE DATA ENGINE ──────────────────────────────────────────────
const fallbackQuestions = [
  {
    id: 1,
    question: "Which cloud service model provides virtualization, storage, and networking engines?",
    options: ["SaaS", "PaaS", "IaaS", "Serverless"],
    answer: "IaaS",
    points: 10
  },
  {
    id: 2,
    question: "What type of lookup does the 'mongodb+srv' prefix rely on?",
    options: ["A Record", "CNAME Record", "DNS SRV Record", "MX Record"],
    answer: "DNS SRV Record",
    points: 15
  },
  {
    id: 3,
    question: "In distributed computing, what does the CAP theorem stand for?",
    options: ["Caching, API, Ports", "Consistency, Availability, Partition tolerance", "Concurrency, Allocation, Performance", "Clusters, Assets, Packets"],
    answer: "Consistency, Availability, Partition tolerance",
    points: 10
  }
];

// ─── HIGH-PERFORMANCE ARCADE BRICK BREAKER SUB-COMPONENT ───────────────────
const BrickBreaker = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const paddleHeight = 10;
    const paddleWidth = 85;
    let paddleX = (canvas.width - paddleWidth) / 2;

    let ballRadius = 6;
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 3.5;
    let dy = -3.5;

    const brickRowCount = 4;
    const brickColumnCount = 6;
    const brickWidth = 64;
    const brickHeight = 18;
    const brickPadding = 8;
    const brickOffsetTop = 15;
    const brickOffsetLeft = 20;

    const colors = ['#3b82f6', '#a855f7', '#f59e0b', '#10b981'];
    const bricks = [];

    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: colors[r % colors.length] };
      }
    }

    let rightPressed = false;
    let leftPressed = false;

    const keyDownHandler = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
      else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
    };

    const keyUpHandler = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
      else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Grid Matrix
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 4);
            ctx.fillStyle = bricks[c][r].color;
            ctx.fill();
            ctx.closePath();
          }
        }
      }

      // Draw User Paddle Bar
      ctx.beginPath();
      ctx.roundRect(paddleX, canvas.height - paddleHeight - 6, paddleWidth, paddleHeight, 5);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.closePath();

      // Draw Ball Core Vector
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.closePath();

      // Brick Intersection Logic
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
              dy = -dy;
              b.status = 0;
              setScore((prev) => prev + 10);
            }
          }
        }
      }

      // Boundary Collisions
      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
      if (y + dy < ballRadius) dy = -dy;
      else if (y + dy > canvas.height - ballRadius - 10) {
        if (x > paddleX && x < paddleX + paddleWidth) {
          dy = -dy;
        } else {
          setGameOver(true);
          return;
        }
      }

      if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 6.5;
      if (leftPressed && paddleX > 0) paddleX -= 6.5;

      x += dx;
      y += dy;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameStarted, gameOver]);

  return (
    <div className="flex flex-col items-center bg-slate-950/40 border border-white/5 p-5 rounded-3xl max-w-xl mx-auto w-full">
      <div className="flex justify-between w-full mb-4 items-center">
        <span className="text-slate-400 font-mono text-[10px] uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-rose-400">Arcade Workspace</span>
        <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full text-xs font-black border border-rose-500/20">
          <Trophy size={12} />
          Score: {score}
        </div>
      </div>

      <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-white/5 w-full flex justify-center">
        <canvas ref={canvasRef} width={480} height={320} className="block cursor-none max-w-full" />
        
        {(!gameStarted || gameOver) && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
            <h4 className="text-xl font-bold text-white mb-2">
              {gameOver ? '✨ Focus Metric Restored!' : 'Break the Focus Blocks'}
            </h4>
            <p className="text-slate-500 text-xs mb-5 max-w-xs leading-relaxed">
              Use your keyboard's <kbd className="bg-slate-900 border border-white/5 text-slate-300 px-1 py-0.5 rounded text-[10px]">←</kbd> and <kbd className="bg-slate-900 border border-white/5 text-slate-300 px-1 py-0.5 rounded text-[10px]">→</kbd> Arrow keys to control the slider.
            </p>
            <button
              onClick={() => { setScore(0); setGameOver(false); setGameStarted(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-black tracking-wider uppercase px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95"
            >
              {gameOver ? <RotateCcw size={14} /> : <Play size={14} />}
              {gameOver ? 'Re-Launch Session' : 'Enter Arcade'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN CONTAINER EXPORT ──────────────────────────────────────────────────
export const RelaxZoneView = () => {
  // Arena Configuration View Switcher Tab State
  const [activeZone, setActiveZone] = useState('trivia'); // 'trivia' or 'breaker'

  // Timer & Biometric States
  const [time, setTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathState, setBreathState] = useState('Breathe In');
  const [activeSounds, setActiveSounds] = useState({ lofi: false, rain: false, static: false });

  // Cloud/Local Trivia Game States
  const [questions, setQuestions] = useState(fallbackQuestions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, verified, completed
  const [isLoading, setIsLoading] = useState(false);
  const [isCloudSource, setIsCloudSource] = useState(false);

  // Fetch Questions from MongoDB Local Compass Instance / Server Pipeline
  useEffect(() => {
    const fetchCloudTrivia = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/relax/trivia');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setQuestions(data);
            setIsCloudSource(true);
          }
        }
      } catch (err) {
        console.log("⚡ Database connection down. Reverting to edge fallback engine safely.");
        setIsCloudSource(false);
      } finally { // ◄── FIXED TYPO HERE (Changed from 'finaly' to 'finally')
        setIsLoading(false);
      }
    };
    fetchCloudTrivia();
  }, []);

  // Timer Countdown Loop
  useEffect(() => {
    let timer = null;
    if (isTimerRunning && time > 0) {
      timer = setInterval(() => setTime(prev => prev - 1), 1000);
    } else if (time === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, time]);

  // Vagus Nerve Cycle Animation Loop
  useEffect(() => {
    const sequence = setInterval(() => {
      setBreathState(prev => prev === 'Breathe In' ? 'Hold' : prev === 'Hold' ? 'Breathe Out' : 'Breathe In');
    }, 4000);
    return () => clearInterval(sequence);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Game Logic Handlers
  const handleOptionClick = (option) => {
    if (gameState !== 'playing') return;
    setSelectedOption(option);
    setGameState('verified');
    
    if (option === questions[currentIdx].answer) {
      setScore(prev => prev + questions[currentIdx].points);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setGameState('playing');
    } else {
      setGameState('completed');
    }
  };

  const resetGame = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setGameState('playing');
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 selection:bg-purple-500/30 selection:text-white">
      {/* Top Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Decompression Zone
          </h2>
          <p className="text-slate-400 text-sm">Regulate focus metrics, manage physical fatigue, or shift mental focus cleanly.</p>
        </div>
        
        {/* Dynamic Data Sync Tag */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium border ${
          isCloudSource 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          {isCloudSource ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          <span>Source: {isCloudSource ? 'Live MongoDB Local Pipe' : 'Local Edge Layer'}</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Module 1: Session Sprint */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Focus Core</span>
            <h3 className="text-lg font-bold text-slate-200">Session Sprint</h3>
          </div>
          <div className="my-8 text-center">
            <h1 className="text-6xl font-black text-white font-mono tracking-tight transition-all group-hover:scale-105 duration-300">{formatTime(time)}</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all text-white active:scale-95 shadow-lg shadow-blue-950/50"
              style={{ background: isTimerRunning ? '#e11d48' : 'linear-gradient(to right, #2563eb, #06b6d4)' }}
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} />} {isTimerRunning ? 'Pause Sprint' : 'Ignite Timer'}
            </button>
            <button onClick={() => { setIsTimerRunning(false); setTime(25 * 60); }} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"><RotateCcw size={14} /></button>
          </div>
        </div>

        {/* Module 2: Vagus Nerve Regulator */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center justify-between relative hover:border-emerald-500/20 transition-all duration-300">
          <div className="w-full space-y-2 text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Biometrics</span>
            <h3 className="text-lg font-bold text-slate-200">Vagus Nerve Regulator</h3>
          </div>
          <div className="my-6 relative w-36 h-36 flex items-center justify-center">
            <motion.div 
              animate={{ scale: breathState === 'Breathe In' ? 1.4 : breathState === 'Hold' ? 1.4 : 0.9 }} 
              transition={{ duration: 4, ease: "easeInOut" }} 
              className="absolute inset-0 rounded-full bg-emerald-500/5 border border-emerald-500/20 blur-sm" 
            />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono z-10">{breathState}</span>
          </div>
          <p className="text-[11px] text-slate-500 text-center font-medium">Sync breathing with animation states to unload cognitive strains.</p>
        </div>

        {/* Module 3: Frequency Sound Mixer */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between relative hover:border-purple-500/20 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Audio Grid</span>
            <h3 className="text-lg font-bold text-slate-200">Frequency Sound Mixer</h3>
          </div>
          <div className="space-y-3 my-4 flex-1 flex flex-col justify-center">
            {['lofi', 'rain', 'static'].map((key) => (
              <button 
                key={key}
                onClick={() => setActiveSounds(p => ({ ...p, [key]: !p[key] }))}
                className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                  activeSounds[key] ? 'bg-purple-600/10 border-purple-500/40 text-purple-400' : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <span>{key === 'lofi' ? '🎧 Lofi Chill Beats' : key === 'rain' ? '🌧️ Cyberpunk Rain' : '🔥 Forest Crackle'}</span>
                {activeSounds[key] ? <Volume2 size={14} className="animate-bounce" /> : <span className="text-[10px] font-mono text-slate-600">OFF</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* INTERACTIVE NAVIGATION CONTROL PILLS FOR THE BOTTOM PANEL */}
      <div className="flex justify-center">
        <div className="flex bg-slate-900/80 border border-white/5 rounded-2xl p-1 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setActiveZone('trivia')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all tracking-wide ${
              activeZone === 'trivia' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit size={14} />
            Cognitive Trivia Arena
          </button>
          <button
            onClick={() => setActiveZone('breaker')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all tracking-wide ${
              activeZone === 'breaker' 
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 size={14} />
            Arcade Breaker Room
          </button>
        </div>
      </div>

      {/* DYNAMIC SUB-WORKSPACE DRAW PANEL CONTAINER */}
      <div className="w-full transition-all duration-300">
        {activeZone === 'trivia' ? (
          /* SECTION A: ORIGINAL TRIVIA COMPONENT CORE */
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-slate-800/20 pointer-events-none">
              <HelpCircle size={160} className="transform translate-x-10 -translate-y-10" />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
                <Trophy size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Cognitive Pivot Arena</h3>
                <p className="text-xs text-slate-400">Shift focus pathways away from standard modules with instant computing quiz loops.</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {gameState !== 'completed' ? (
                <motion.div 
                  key={currentIdx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6 max-w-3xl"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                      Question {currentIdx + 1} of {questions.length} (+{questions[currentIdx].points} pts)
                    </span>
                    <h4 className="text-xl font-medium text-slate-200 tracking-tight leading-relaxed">
                      {questions[currentIdx].question}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {questions[currentIdx].options.map((option, i) => {
                      let btnStyle = "bg-slate-900/40 border-white/5 text-slate-300 hover:border-white/10 hover:bg-slate-900/60";
                      
                      if (gameState === 'verified') {
                        if (option === questions[currentIdx].answer) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold";
                        } else if (selectedOption === option) {
                          btnStyle = "bg-rose-500/10 border-rose-500/30 text-rose-400 cross-through";
                        } else {
                          btnStyle = "bg-slate-950/20 border-white/5 text-slate-600 pointer-events-none";
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={gameState !== 'playing'}
                          onClick={() => handleOptionClick(option)}
                          className={`p-4 rounded-xl border text-left text-sm transition-all duration-200 active:scale-[0.99] ${btnStyle}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {gameState === 'verified' && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center pt-2">
                      <p className="text-xs text-slate-400">
                        {selectedOption === questions[currentIdx].answer ? '🎉 Excellent connection spike!' : `❌ Route dropped! Correct path: ${questions[currentIdx].answer}`}
                      </p>
                      <button 
                        onClick={handleNext}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-950"
                      >
                        Next Query
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-tr from-yellow-500 to-amber-300 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
                    <Trophy size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-white">Sprint Session Cleared</h4>
                    <p className="text-xs text-slate-400">Cognitive processing values replenished efficiently.</p>
                  </div>
                  <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl font-mono text-sm text-indigo-400">
                    Accumulated Index: {score} Score Points
                  </div>
                  <button 
                    onClick={resetGame}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors mx-auto"
                  >
                    <RefreshCw size={12} /> Cycle Arena
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* SECTION B: UPGRADED HIGH-PERFORMANCE ARCADE INTERACTION ENGINE */
          <BrickBreaker />
        )}
      </div>
    </div>
  );
};