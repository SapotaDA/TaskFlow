import React from 'react';
import { motion } from 'framer-motion';

const PageBackground = ({
  children,
  className = '',
  gradient = "bg-gradient-to-br from-[#020305] via-[#050608] to-black",
  blob1 = "bg-blue-600/5",
  blob2 = "bg-purple-600/5",
  blob3 = "bg-slate-700/5"
}) => {
  return (
    <div className={`min-h-screen ${gradient} relative overflow-x-hidden ${className}`}>
      {/* Superior Noise Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-screen z-[100]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          filter: 'contrast(150%) brightness(100%)'
        }}
      />

      {/* Atmospheric Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] ${blob1} rounded-full blur-[60px]`}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className={`absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] ${blob2} rounded-full blur-[80px]`}
        />
      </div>

      {/* Grid Overlay for technical feel */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default React.memo(PageBackground);
