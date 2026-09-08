// src/components/GlassCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg transition-colors duration-200 hover:border-cyan-500/40 hover:bg-slate-900/60 group ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;