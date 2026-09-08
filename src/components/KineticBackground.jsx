// src/components/KineticBackground.jsx
import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const KineticBackground = () => {
  const initialX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const initialY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;

  const mouseX = useMotionValue(initialX);
  const mouseY = useMotionValue(initialY);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060a14]">
      {/* ── 1. High-Tech Perspective Matrix Grid ── */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 85% 70% at 50% 30%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 30%, black 40%, transparent 95%)'
        }}
      />

      {/* ── 2. Floating Ambient Horizon Wave (Replaces sharp laser line) ── */}
      <motion.div
        animate={{
          y: [-120, 620, -120],
          opacity: [0.15, 0.45, 0.15],
          scaleY: [1, 1.4, 1]
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent blur-xl"
      />

      {/* ── 3. Primary Cyan Aurora Plasma (Upper Hero Section) ── */}
      <motion.div
        animate={{
          x: [0, 90, -70, 40, 0],
          y: [0, -60, 50, -30, 0],
          scale: [1, 1.22, 0.95, 1.15, 1],
          opacity: [0.35, 0.55, 0.3, 0.5, 0.35]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-16 left-1/4 w-[600px] h-[480px] rounded-full bg-cyan-500/30 blur-[90px]"
      />

      {/* ── 4. Deep Violet Nexus Cluster (Right Workspace Area) ── */}
      <motion.div
        animate={{
          x: [0, -100, 70, -40, 0],
          y: [0, 70, -50, 40, 0],
          scale: [1.05, 0.9, 1.18, 0.95, 1.05],
          opacity: [0.3, 0.5, 0.25, 0.45, 0.3]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-28 right-12 w-[620px] h-[520px] rounded-full bg-indigo-600/30 blur-[100px]"
      />

      {/* ── 5. Emerald Horizon Current (Lower Semester Matrices) ── */}
      <motion.div
        animate={{
          x: [0, 60, -70, 0],
          y: [0, -40, 50, 0],
          scale: [0.95, 1.12, 0.9, 0.95],
          opacity: [0.25, 0.45, 0.2, 0.25]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="absolute bottom-8 left-12 w-[520px] h-[420px] rounded-full bg-emerald-500/20 blur-[95px]"
      />

      {/* ── 6. Subtle Floating Ambient Starlight Motes ── */}
      <motion.div
        animate={{
          y: [0, -40, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/5 w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]"
      />
      <motion.div
        animate={{
          y: [0, -50, 0],
          opacity: [0.2, 0.7, 0.2]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(165,180,252,0.8)]"
      />
      <motion.div
        animate={{
          y: [0, -35, 0],
          opacity: [0.25, 0.75, 0.25]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-1/3 left-1/2 w-1 h-1 rounded-full bg-purple-300 shadow-[0_0_8px_rgba(216,180,254,0.8)]"
      />

      {/* ── 7. Smooth Interactive Cursor Light Field ── */}
      <motion.div
        style={{ 
          x: springX, 
          y: springY, 
          translateX: '-50%', 
          translateY: '-50%' 
        }}
        className="hidden md:block absolute w-[420px] h-[420px] rounded-full bg-cyan-400/15 blur-[80px]"
      />
    </div>
  );
};

export default KineticBackground;