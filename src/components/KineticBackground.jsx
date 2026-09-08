// src/components/KineticBackground.jsx
import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const KineticBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 45, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 25 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#060a12]">
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%)'
        }}
      />
      <motion.div
        animate={{
          x: [0, 70, -50, 30, 0],
          y: [0, -60, 40, -20, 0],
          scale: [1, 1.2, 0.95, 1.1, 1],
          opacity: [0.18, 0.32, 0.15, 0.28, 0.18]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/25 blur-[130px]"
      />
      <motion.div
        animate={{
          x: [0, -80, 60, -30, 0],
          y: [0, 70, -50, 40, 0],
          scale: [1.1, 0.9, 1.15, 0.95, 1.1],
          opacity: [0.15, 0.28, 0.12, 0.25, 0.15]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-1/3 right-1/4 w-[550px] h-[550px] rounded-full bg-purple-600/20 blur-[140px]"
      />
      <motion.div
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
        className="hidden md:block absolute w-[380px] h-[380px] rounded-full bg-cyan-400/[0.07] blur-[90px]"
      />
    </div>
  );
};

export default KineticBackground;