// ─── HIGH-ENERGY NEON CHAIN REACTION SUB-COMPONENT ───────────────────
const ChainReaction = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('ready'); // ready, playing, summary
  const [highChain, setHighChain] = useState(0);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Game Matrix Parameters
    const totalBubbles = 35;
    const bubbles = [];
    const expandedPulses = [];
    const neonThemes = ['#ff007f', '#00f0ff', '#7000ff', '#ffb700', '#00ff66'];

    // Instantiate drifting targets
    for (let i = 0; i < totalBubbles; i++) {
      bubbles.push({
        x: Math.random() * (canvas.width - 30) + 15,
        y: Math.random() * (canvas.height - 30) + 15,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: 10,
        color: neonThemes[Math.floor(Math.random() * neonThemes.length)],
        popped: false
      });
    }

    // Capture User Explosion Click
    const handleCanvasClick = (e) => {
      if (expandedPulses.length > 0) return; // Allow only one trigger click per round

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      expandedPulses.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: 55,
        growth: 2,
        alpha: 1,
        color: '#ffffff'
      });
    };

    canvas.addEventListener('click', handleCanvasClick);

    // Primary Physics Render Loop
    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Process and Draw Expanding Pulses
      for (let i = expandedPulses.length - 1; i >= 0; i--) {
        const p = expandedPulses[i];
        
        // Expansion / Decay mechanics
        if (p.growth > 0) {
          p.radius += p.growth;
          if (p.radius >= p.maxRadius) {
            p.growth = 0; // Hold at max size
          }
        } else {
          p.alpha -= 0.015; // Slow fade out
        }

        if (p.alpha <= 0) {
          expandedPulses.splice(i, 1);
          continue;
        }

        // Draw glowing shockwave
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '20'; // Semi-transparent body
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 2. Process and Draw Floating Target Bubbles
      let remainingMovingTargets = 0;
      
      bubbles.forEach((b) => {
        if (!b.popped) {
          remainingMovingTargets++;
          // Boundary Wall Deflections
          if (b.x + b.vx > canvas.width - b.radius || b.x + b.vx < b.radius) b.vx = -b.vx;
          if (b.y + b.vy > canvas.height - b.radius || b.y + b.vy < b.radius) b.vy = -b.vy;
          
          b.x += b.vx;
          b.y += b.vy;

          // Check intersection overlay with any active shockwave
          for (let i = 0; i < expandedPulses.length; i++) {
            const p = expandedPulses[i];
            const distance = Math.hypot(b.x - p.x, b.y - p.y);

            if (distance < b.radius + p.radius) {
              b.popped = true;
              setScore((prev) => prev + 100);
              
              // Trigger a brand new sub-explosion chain element
              expandedPulses.push({
                x: b.x,
                y: b.y,
                radius: 0,
                maxRadius: 45,
                growth: 2.5,
                alpha: 1,
                color: b.color
              });
              break;
            }
          }

          // Draw standard drifting target bubble
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = b.color + '40';
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      });

      // Track Round Termination Criteria
      if (expandedPulses.length === 0 && remainingMovingTargets < totalBubbles) {
        setGameState('summary');
        return;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  useEffect(() => {
    if (score > highChain) setHighChain(score);
  }, [score, highChain]);

  return (
    <div className="flex flex-col items-center bg-slate-900/60 border border-white/5 p-5 rounded-3xl max-w-xl mx-auto w-full backdrop-blur-xl">
      <div className="flex justify-between w-full mb-4 items-center">
        <span className="text-slate-400 font-mono text-[10px] uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-cyan-400">Quantum Kinetic Room</span>
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-slate-500">Record: {highChain}</span>
          <div className="flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">
            <Trophy size={12} />
            Yield: {score}
          </div>
        </div>
      </div>

      <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-white/5 w-full flex justify-center">
        <canvas ref={canvasRef} width={480} height={320} className="block cursor-crosshair max-w-full" />
        
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
            <h4 className="text-xl font-black text-white mb-2">
              {gameState === 'summary' ? '💥 Chain Cleared!' : 'Quantum Chain Reaction'}
            </h4>
            <p className="text-slate-400 text-xs mb-6 max-w-xs leading-relaxed">
              {gameState === 'summary' 
                ? `You triggered a total cascading reaction value of ${score} index points!`
                : 'Click anywhere inside the vacuum grid to initiate a single structural shockwave. Try to catch all drifting particles in the cascading explosion!'
              }
            </p>
            <button
              onClick={() => { setScore(0); setGameState('playing'); }}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-xs font-black tracking-wider uppercase px-6 py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              {gameState === 'summary' ? <RotateCcw size={14} /> : <Play size={14} />}
              {gameState === 'summary' ? 'Re-Ignite Core' : 'Enter Quantum Arena'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};