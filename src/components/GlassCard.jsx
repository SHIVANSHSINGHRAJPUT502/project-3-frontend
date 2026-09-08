// src/components/GlassCard.jsx
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const GlassCard = ({ children, className = '', index = 0, ...props }) => {
  const cardRef = useRef(null);

  // Mouse tilt tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 180, damping: 18 });
  const mouseYSpring = useSpring(y, { stiffness: 180, damping: 18 });

  // 3D Rotations (-12deg to +12deg tilt range)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);

  // Specular light coordinates
  const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const sheenY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 1200 }} className="relative">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        // Autonomous zero-G idle float wave
        animate={{
          y: [0, -6, 0],
          rotateZ: [0, index % 2 === 0 ? 0.6 : -0.6, 0]
        }}
        transition={{
          duration: 4.5 + (index % 3) * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.25
        }}
        whileHover={{ scale: 1.04, z: 40 }}
        whileTap={{ scale: 0.96, z: -15 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/45 p-6 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(6,182,212,0.22),inset_0_1px_0_0_rgba(255,255,255,0.25)] group ${className}`}
        {...props}
      >
        {/* Continuous Automatic Specular Sheen Beam */}
        <motion.div
          animate={{
            x: ['-200%', '200%']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 2 + (index % 2) * 1.5,
            ease: 'easeInOut'
          }}
          className="pointer-events-none absolute inset-0 z-10 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
        />

        {/* Dynamic Holographic Cursor Sheen */}
        <motion.div
          style={{
            left: sheenX,
            top: sheenY,
            translateX: '-50%',
            translateY: '-50%'
          }}
          className="pointer-events-none absolute h-64 w-64 rounded-full bg-cyan-400/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        {/* 3D Elevated Layer Depth for Children */}
        <div style={{ transform: 'translateZ(25px)', transformStyle: 'preserve-3d' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default GlassCard;