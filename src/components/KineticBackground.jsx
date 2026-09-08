// src/components/KineticBackground.jsx
import React from 'react';

export const KineticBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#070b14]">
      {/* Subtle radial ambient gradient */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] opacity-25 blur-[120px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.15), transparent 70%)'
        }}
      />
      {/* Precision grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 90%)'
        }}
      />
    </div>
  );
};

export default KineticBackground;