// src/components/KineticBackground.jsx
import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const KineticBackground = () => {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#070c18]">
      {/* 1. Visible High-Tech Perspective Grid */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 95%)'
        }}
      />

      {/* 2. Top Cyber Scan Beam (Gently glides down and up) */}
      <motion.div
        animate={{
          y: [-100, 600, -100],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px]"
      />

      {/* 3. Primary Cyan Plasma Cluster (Upper Hero Glow) */}
      <motion.div
        animate={{
          x: [0, 100, -80, 50, 0],
          y: [0, -80, 60, -40, 0],
          scale: [1, 1.3, 0.9, 1.2, 1],
          opacity: [0.45, 0.7, 0.4, 0.65, 0.45]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-10 left-1/3 w-[550px] h-[450px] rounded-full bg-cyan-500/35 blur-[90px]"
      />

      {/* 4. Electric Violet/Purple Nexus Orb (Right Upper Workspace Glow) */}
      <motion.div
        animate={{
          x: [0, -120, 90, -50, 0],
          y: [0, 90, -70, 60, 0],
          scale: [1.1, 0.85, 1.25, 0.95, 1.1],
          opacity: [0.4, 0.65, 0.35, 0.6, 0.4]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-40 right-10 w-[600px] h-[500px] rounded-full bg-indigo-600/30 blur-[100px]"
      />

      {/* 5. Deep Emerald Matrix Wave (Bottom Left Semester Matrices Glow) */}
      <motion.div
        animate={{
          x: [0, 80, -90, 0],
          y: [0, -60, 70, 0],
          scale: [0.9, 1.2, 0.95, 0.9],
          opacity: [0.3, 0.55, 0.25, 0.3]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-10 left-10 w-[500px] h-[400px] rounded-full bg-emerald-500/25 blur-[95px]"
      />

      {/* 6. High-Visibility Interactive Cursor Light Glow */}
      <motion.div
        style={{ 
          x: springX, 
          y: springY, 
          translateX: '-50%', 
          translateY: '-50%' 
        }}
        className="hidden md:block absolute w-[450px] h-[450px] rounded-full bg-cyan-400/20 blur-[75px]"
      />
    </div>
  );
};

export default KineticBackground;