// src/components/GlassCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={`bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/20 transition-all ${className}`}
    {...props}
  >
    <div
      style={{ background: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.04), transparent)' }}
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
    />
    {children}
  </motion.div>
);