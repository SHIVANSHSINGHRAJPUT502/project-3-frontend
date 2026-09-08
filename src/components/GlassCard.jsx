// src/components/GlassCard.jsx
import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const GlassCard = ({ children, className = '', index = 0, ...props }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Normalized cursor coordinate tracking (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Snappy spring dynamics for instant tilt response
  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 20 });

  // 3D Isometric Tilt Matrix (-18deg to +18deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['18deg', '-18deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-18deg', '18deg']);

  // Dynamic light reflection coordinates
  const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ['10%', '90%']);
  const sheenY = useTransform(mouseYSpring, [-0.5, 0.5], ['10%', '90%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      style={{ perspective: 1000 }} 
      className="relative w-full h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        // Continuous gentle zero-G idle float when mouse is NOT on the card
        animate={!isHovered ? {
          y: [0, -7, 0],
          rotateZ: [0, index % 2 === 0 ? 0.8 : -0.8, 0]
        } : {
          y: 0,
          rotateZ: 0
        }}
        transition={{
          duration: 4.5 + (index % 3) * 0.7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.2
        }}
        whileTap={{ scale: 0.95 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-colors duration-300 hover:border-cyan-500/50 hover:shadow-[0_25px_50px_rgba(6,182,212,0.25),inset_0_1px_0_0_rgba(255,255,255,0.3)] group ${className}`}
        {...props}
      >
        {/* Automatic Periodic Sheen Sweep across the glass face */}
        <motion.div
          animate={{
            x: ['-200%', '200%']
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatDelay: 2.5 + (index % 2) * 1.5,
            ease: 'easeInOut'
          }}
          className="pointer-events-none absolute inset-0 z-20 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
        />

        {/* Dynamic Specular Point-Light (Moves directly with your cursor) */}
        <motion.div
          style={{
            left: sheenX,
            top: sheenY,
            translateX: '-50%',
            translateY: '-50%'
          }}
          className="pointer-events-none absolute h-56 w-56 rounded-full bg-cyan-400/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        />

        {/* 3D Elevated Content Layer (Separates cleanly from glass surface) */}
        <div 
          style={{ 
            transform: 'translateZ(35px)', 
            transformStyle: 'preserve-3d' 
          }}
          className="relative z-30"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default GlassCard;